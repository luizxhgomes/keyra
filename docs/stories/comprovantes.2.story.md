# Story comprovantes.2: Spike de rasterização de PDF + ingestão multi-formato (`uploadReceipt`) + camada de normalização

## Status

Done

> **Done (núcleo) + vertical slice.** Spike TD-CMP-008 **VERDE** (`mupdf`, `docs/architecture/spikes/comprovantes-2-pdf-rasterization.md`). `uploadReceipt` (magic bytes via `file-type`, sha256, `INSERT` antes do binário sem órfão) + `normalizeReceiptFile` (matriz §6: `sharp().rotate()` com strip de EXIF, mupdf p/ PDF, mammoth/fflate p/ texto, RTF/outros → failed honesto) implementados e validados (typecheck/lint/rsc/design-system/build verdes). **Por decisão do idealizador (chave OpenAI fornecida), o slice avançou para `.3`/`.4a`/`.4b` no mesmo PR:** `extractReceipt` (IA gpt-4o-mini — smoke real PASS: leu boleto, valor R$ 1.523,90, data, contraparte, tipo PIX), UI `/financeiro/comprovantes` (upload foto/câmera/arquivo + lista + revisão) e `confirmReceipt` (cria `transactions` com `source_type='document'`). **Pendente:** gate `@compliance-br` formal; smoke E2E autenticado (upload via browser logado — você); `OPENAI_API_KEY` no Vercel; cron sweep + scrubbing Sentry específico de `.3` (deferidos).

## Story

**Como** Camila, dona da clínica de estética que usa o KEYRA,
**Eu quero** anexar um comprovante em qualquer formato (foto, print, PDF, DOCX, ODT, EPUB, TXT, MD, HTML) e que o sistema valide o arquivo, armazene em segurança e o prepare automaticamente para a leitura por IA,
**Para que** a story `comprovantes.3` (extração LLM) receba sempre um artefato legível e consistente — imagem auto-rotacionada ou texto extraído — sem precisar adivinhar o que cada formato é nem reimplementar validação de upload.

Esta story entrega os **estágios 1 (Anexar) e 2 (Normalizar)** do pipeline de 6 estágios do EPIC-COMPROVANTES (`docs/architecture/EPIC-COMPROVANTES-SPEC.md` §2-3). Ela não chama a IA — só garante que, quando `comprovantes.3` for chamada, o arquivo já esteja validado, armazenado no bucket privado e normalizado para um dos dois tiers de leitura (`image` ou `text`).

## Complexidade

**T-shirt:** L (~8 pontos)

Spike de rasterização de PDF (TD-CMP-008) é o item mais frágil e precede tudo — sem ele a story não é estimável. O restante é validação de upload, idempotência por `sha256` e a matriz de normalização multi-formato da §6 da spec.

## Acceptance Criteria

### AC1 — Spike de rasterização de PDF em serverless (TD-CMP-008) — PRECEDE todo o resto

1. Antes de qualquer código de produção, executar um spike que prove a viabilidade de rasterizar um PDF real (boleto, NF-e ou fatura) para imagem PNG/JPG no runtime Node.js (Fluid Compute da Vercel), **sem binários de sistema** (LibreOffice/poppler/ghostscript indisponíveis em serverless).
2. Ordem de avaliação recomendada pelo parecer `@document-processor` (M-5/B-2): **`mupdf` WASM primeiro** (sem dependência nativa, previsível em serverless); `pdf-to-img` + `@napi-rs/canvas` como segunda opção; `node-canvas` (Cairo nativo) está **descartado** — inviável em serverless.
3. O spike mede e registra, num documento `docs/architecture/spikes/comprovantes-2-pdf-rasterization.md`: biblioteca escolhida, tamanho que ela adiciona ao bundle, tempo de rasterização por página, comportamento em cold start, e se roda dentro do orçamento do lambda.
4. **Critério de decisão:** se nenhuma biblioteca JS-puro/WASM rasterizar de forma confiável em Fluid Compute, o spike documenta o fallback honesto — PDF que não puder ser rasterizado vira `status='failed'` com mensagem clara "não foi possível preparar este PDF para leitura automática — você pode lançar manualmente" (princípio "nunca um beco sem saída"). Nesse caso a equipe é notificada antes de prosseguir, pois o escopo de `comprovantes.3` muda.
5. O resultado do spike (biblioteca + decisão) é registrado no Change Log desta story e referenciado no débito TD-CMP-008 da spec.

### AC2 — Novas variáveis de ambiente no schema Zod de `lib/env.ts`

1. `apps/web/src/lib/env.ts` ganha as envs novas no `serverSchema`, seguindo o padrão rígido do arquivo (parecer `@architect` A-3):
   - `RECEIPT_MAX_BYTES`: `z.coerce.number().int().positive().default(10485760)` — 10 MB. Env é string, exige `z.coerce`.
   - `RECEIPT_MAX_PAGES`: `z.coerce.number().int().positive().default(5)` — limite de páginas processadas por documento.
2. `RECEIPTS_BUCKET` **não** é env — é constante `'receipts'` declarada em `apps/web/src/lib/receipts/constants.ts` (parecer `@architect` A-3: env só faz sentido se variar por ambiente, o que não é o caso).
3. `AI_GATEWAY_API_KEY` **não** é adicionada nesta story — pertence a `comprovantes.3` (só o estágio de IA a usa).
4. Cada env nova é adicionada também ao objeto `safeParse({...})` (linhas 61-74 do arquivo) — esquecer isso faz a env ser ignorada silenciosamente.
5. `pnpm typecheck` passa; o boot da app não aborta com as envs ausentes (ambas têm `default`).

### AC3 — Server Action `uploadReceipt(formData)` — validação e armazenamento (estágio 1)

1. Arquivo `apps/web/src/app/(app)/financeiro/comprovantes/actions.ts`, função `uploadReceipt(formData: FormData)`.
2. `requireAuth()` no topo — invariante do projeto; resolve `user` e `orgId`.
3. Lê o `File` do `FormData`; se ausente ou vazio, retorna erro estruturado em pt-BR.
4. **Validação de MIME por magic bytes** com a biblioteca `file-type` — nunca confiar na extensão nem em `file.type` do browser. Container ZIP (DOCX/ODT/EPUB) é desambiguado por inspeção interna; se `file-type` retornar `application/zip` genérico, tentar heurística do conteúdo antes de recusar (parecer `@document-processor` M-6).
5. **Validação de tamanho** contra `env.RECEIPT_MAX_BYTES` — arquivo maior é recusado com mensagem clara antes de qualquer upload.
6. Calcula `sha256` do conteúdo binário → `file_hash` (hex).
7. **Idempotência protegida contra race (parecer `@architect` M-3):** a defesa real é o `UNIQUE (org_id, file_hash)` de `receipts`. O fluxo faz o `INSERT` da row **antes** do upload do binário, usando `ON CONFLICT (org_id, file_hash) DO NOTHING` — se colidir, faz `SELECT` da row existente e retorna ela (não duplica, não sobe o binário de novo). Isso elimina o objeto órfão no Storage que a ordem inversa causaria.
8. Após o `INSERT` bem-sucedido, faz upload do binário **original** ao bucket privado `receipts` no caminho `{org_id}/{receipt_id}/original.{ext}`.
9. A row é criada com `status='pending'`, `file_path`, `original_filename`, `mime_type` (o real, dos magic bytes), `file_size_bytes`, `file_hash`, `uploaded_by`.
10. Retorna `{ receiptId, status }` — `'pending'` para upload novo, ou o status atual da row existente em caso de colisão de hash.
11. Formato exótico ou arquivo corrompido (MIME fora da matriz §6) **não** é um beco sem saída: o arquivo ainda é armazenado e a row criada; a normalização (AC5) é quem marca `failed` com mensagem orientando registro manual.

### AC4 — Pré-processamento de imagem com `sharp().rotate()` — auto-rotação EXIF obrigatória

1. Toda imagem (`image/jpeg`, `image/png`, `image/webp`, e HEIC após conversão) passa por `sharp(buffer).rotate()` **sem argumento** — aplica a tag EXIF Orientation automaticamente (parecer `@document-processor` A-2; spec §3 Estágio 2 item 1).
2. Justificativa: fotos de celular chegam tortas/de cabeça para baixo; isso derruba a confiança da extração sem necessidade. Custo computacional desprezível.
3. A reescrita do buffer pelo `sharp` **descarta os metadados EXIF**, resolvendo de graça o strip de geolocalização (achado de compliance CMP-M1 / TD-CMP-002). A imagem normalizada armazenada/enviada à IA não carrega coordenadas GPS.
4. WEBP animado e HEIC sequencial (Live Photo): sempre extrair o **primeiro frame** — confirmar que `sharp`/`heic-convert` pegam a imagem principal por padrão (parecer `@document-processor` L-3).
5. Desinclinação (deskew), correção de perspectiva e realce de contraste **ficam fora desta story** — catalogados em TD-CMP-009 (pós-MVP); o modelo vision tolera.
6. HEIC (`image/heic`, foto de iPhone) é convertido para JPG via `heic-convert` **antes** do `sharp().rotate()`.

### AC5 — Camada `normalizeReceipt` — matriz de formatos da §6

1. Arquivo `apps/web/src/lib/receipts/normalize.ts`, função `normalizeReceipt(receipt)` — função interna (não Server Action), preparada para ser chamada pelo `processReceipt` de `comprovantes.3`.
2. Atualiza `receipts.status` para `'processing'` ao iniciar.
3. Resultado: define `normalized_kind` (`'image'` | `'text'`) + produz o artefato legível, conforme a matriz §6:
   - **JPG/PNG/WEBP** → `normalized_kind='image'`, imagem após `sharp().rotate()` (AC4).
   - **HEIC** → converter para JPG → `sharp().rotate()` → `normalized_kind='image'`.
   - **PDF** → **rasterizar** página(s) para imagem usando a biblioteca decidida no spike AC1 → `normalized_kind='image'`. PDF nunca é file part nativo no `gpt-4o-mini` — rasterização é o caminho único, não fallback (parecer `@document-processor` B-1).
   - **TXT/MD** → conteúdo lido como texto → `normalized_kind='text'`.
   - **HTML** → strip de tags, texto visível extraído → `normalized_kind='text'`.
   - **DOCX** → `mammoth` (JS puro) extrai texto → `normalized_kind='text'`.
   - **ODT** → unzip + parse de `content.xml` → texto → `normalized_kind='text'`.
   - **EPUB** → unzip + concatenar XHTML → texto → `normalized_kind='text'`.
   - **RTF** → **não suportado para leitura automática no MVP** (parecer `@document-processor` A-4): o arquivo é armazenado, mas vai direto para `status='failed'` com mensagem orientando registro manual. Parsers RTF JS-puro são frágeis demais e RTF é raríssimo como comprovante.
   - **Qualquer outro MIME** → `status='failed'`, `extraction_error` com mensagem clara: "formato não suportado para leitura automática — você pode lançar manualmente".
4. **Multi-página:** PDF ou DOCX com mais de `env.RECEIPT_MAX_PAGES` páginas processa as primeiras N **e registra aviso explícito** em `extraction_error` ("documento com muitas páginas — revise se algo ficou de fora"). Nunca lê só a página 1 em silêncio (parecer `@document-processor` A-1; spec §3 Estágio 2 item 4).
5. **Limite de texto:** para o tier texto, o conteúdo enviado tem teto de caracteres (truncar com aviso) — evita estourar o contexto do modelo com um TXT de 5 MB (parecer `@document-processor` L-4).
6. O artefato normalizado é persistido no bucket para a tela de revisão (`comprovantes.4b`) poder renderizá-lo com segurança — **nunca o original cru** (endereça o achado CMP-M2 da auditoria de compliance):
   - Tier texto → `{org_id}/{receipt_id}/normalized.txt`.
   - Tier imagem cujo original **não é** imagem diretamente renderizável (PDF rasterizado) → as imagens das páginas em `{org_id}/{receipt_id}/normalized-p{n}.png`.
   - Tier imagem cujo original **já é** imagem (JPG/PNG/WEBP/HEIC) → o `original.{ext}` após `sharp().rotate()` (reescrito sem EXIF) já serve de artefato renderizável; não duplicar.
   Razão: a tela de revisão renderiza o artefato normalizado, garantindo que um PDF ou HTML potencialmente malicioso nunca chegue cru ao navegador da usuária (CMP-M2 — a auditoria aceita "rasterização para imagem" como mitigação).
7. `normalizeReceipt` é **idempotente:** reexecutar sobre uma row já normalizada não duplica artefatos nem corrompe estado — pré-requisito do cron sweep de `comprovantes.3`.
8. `normalizeReceipt` **não** muda o status para `needs_review`/`failed` por causa da extração — apenas `processing`, ou `failed` quando a própria normalização falha (formato não suportado, arquivo corrompido). A transição para `needs_review` é responsabilidade do `extractReceipt` de `comprovantes.3`.

### AC6 — Dependências de pacote instaladas

1. `apps/web/package.json` ganha as dependências necessárias, validadas como funcionais em serverless:
   - `file-type` — detecção de MIME por magic bytes.
   - `sharp` — pré-processamento de imagem (auto-rotação, conversão).
   - `heic-convert` — conversão HEIC → JPG.
   - `mammoth` — extração de texto de DOCX.
   - a biblioteca de rasterização de PDF decidida no spike AC1 (ex.: `mupdf`).
2. Nenhuma dependência nativa que exija binário de sistema (`node-canvas`/Cairo está proibido).
3. `pnpm install` no workspace; `pnpm build` passa sem erro de bundling.

### AC7 — Tratamento de erro e estado honesto

1. Falha de qualquer etapa da normalização não derruba o processo: a row vai para `status='failed'` com `extraction_error` contendo mensagem **categórica** em pt-BR (nunca o payload do documento nem stack trace cru).
2. **Proibido `console.*`** com conteúdo de arquivo (buffer, texto extraído) — logar apenas `receipt_id` e `status` (parecer `@document-processor` M-4; o scrubbing completo do Sentry para os campos novos é de `comprovantes.3`).
3. Arquivo corrompido detectado na normalização → `failed` com mensagem clara, arquivo permanece armazenado.

### AC8 — Qualidade, gate e tipos

1. `pnpm lint --max-warnings 0`, `pnpm typecheck` e `./scripts/check-rsc-boundaries.sh` verdes.
2. `pnpm typegen` regenerado se `comprovantes.1` tiver alterado `database.types.ts` depois do início desta story (re-sync de tipos de `receipts`).
3. Gate `@compliance-br` (Têmis) — `*lgpd-audit`: confirmar strip de EXIF na normalização (CMP-M1), ausência de `console.*` com PII, validação de MIME por magic bytes (documento malicioso — CMP-M2 parcial).

## Tasks / Subtasks

- [ ] **Spike AC1 — rasterização de PDF (TD-CMP-008):** avaliar `mupdf` WASM, `pdf-to-img`+`@napi-rs/canvas`; medir bundle/cold start/tempo; documentar em `docs/architecture/spikes/comprovantes-2-pdf-rasterization.md`; decidir biblioteca ou fallback honesto
- [ ] Branch `feat/comprovantes-2` partindo de `main`
- [ ] Confirmar que `comprovantes.1` está Done (tabela `receipts`, bucket `receipts`, `ALTER transactions.source_type`) — caso contrário, bloquear
- [ ] AC2 — adicionar `RECEIPT_MAX_BYTES` e `RECEIPT_MAX_PAGES` ao `serverSchema` + `safeParse` em `lib/env.ts`
- [ ] AC2 — criar `lib/receipts/constants.ts` com `RECEIPTS_BUCKET = 'receipts'`
- [ ] AC6 — instalar `file-type`, `sharp`, `heic-convert`, `mammoth` + biblioteca de rasterização do spike
- [ ] AC3 — implementar `uploadReceipt` em `app/(app)/financeiro/comprovantes/actions.ts` (validação MIME/tamanho/hash, `INSERT` antes do upload, `ON CONFLICT`)
- [ ] AC4 — implementar pré-processamento de imagem (`sharp().rotate()`, HEIC→JPG, primeiro frame)
- [ ] AC5 — implementar `normalizeReceipt` em `lib/receipts/normalize.ts` cobrindo a matriz §6 completa (image/text tiers, RTF não suportado, multi-página, limite de texto)
- [ ] AC7 — `try/catch` total na normalização; mensagens categóricas; zero `console.*` com conteúdo de arquivo
- [ ] Smoke local: upload de JPG torto (EXIF rotacionado) → imagem normalizada na orientação correta; upload de PDF de boleto → rasterizado; upload de DOCX → texto extraído; upload de arquivo `.xyz` → `failed` com mensagem clara
- [ ] Smoke de idempotência: reenviar o mesmo arquivo (mesmo `file_hash`) → row existente retornada, sem objeto órfão no bucket
- [ ] AC8 — `pnpm lint` + `pnpm typecheck` + `check-rsc-boundaries.sh`
- [ ] Gate `@compliance-br` (Têmis) `*lgpd-audit` — strip de EXIF, MIME por magic bytes, sem `console.*` com PII
- [ ] QA gate (`@qa`)
- [ ] Commit + push + PR + CI verde + merge (delegado a `@devops`)
- [ ] STATE.md sincronizado

## Dependencies

- **Interna (bloqueante):** `comprovantes.1` (schema `receipts` + bucket privado `receipts` + RLS de `storage.objects` + micro-migration `ALTER transactions.source_type` add `'document'`) deve estar **Done**. Sem a tabela, o bucket e as policies de Storage, `uploadReceipt` não tem onde gravar.
- **Interna (não bloqueante):** `comprovantes.0` (Política v1.1.0 + re-aceite) roda em paralelo — não compartilha arquivo com esta story. Não bloqueia o upload/normalização, mas bloqueia o go-live de `comprovantes.3` (envio à IA).
- **Externa:** nenhuma autorização da idealizadora necessária — não há mudança de schema (é de `comprovantes.1`) nem de sistema externo nesta story. Apenas instalação de pacotes npm.
- **Habilita:** `comprovantes.3` (pipeline LLM consome o artefato normalizado) e `comprovantes.4a` (UI de upload chama `uploadReceipt`).

## Definition of Done

- [ ] Spike AC1 concluído e documentado; biblioteca de rasterização decidida (ou fallback honesto registrado)
- [ ] Todos os 8 ACs atendidos
- [ ] `RECEIPT_MAX_BYTES` e `RECEIPT_MAX_PAGES` no schema Zod de `lib/env.ts` com `z.coerce` + `default`; `RECEIPTS_BUCKET` como constante (não env)
- [ ] `uploadReceipt` valida MIME por magic bytes, tamanho e calcula `sha256`; `INSERT` antes do upload com `ON CONFLICT` — sem objeto órfão no bucket
- [ ] `normalizeReceipt` cobre toda a matriz §6: image tier (com `sharp().rotate()` obrigatório), text tier, RTF não suportado, multi-página com aviso, limite de texto
- [ ] Strip de EXIF confirmado na normalização de imagens (CMP-M1 / TD-CMP-002 resolvido de graça)
- [ ] Pacotes instalados sem dependência nativa de binário de sistema; `pnpm build` verde
- [ ] `pnpm lint --max-warnings 0` + `pnpm typecheck` + `./scripts/check-rsc-boundaries.sh` verdes
- [ ] Smoke local: JPG torto, PDF de boleto, DOCX, arquivo exótico e reenvio idempotente — todos com comportamento esperado
- [ ] Gate `@compliance-br` APPROVE (ou CONCERNS documentado)
- [ ] QA gate `@qa` PASS
- [ ] PR mergeado em main; Vercel prod deploy READY
- [ ] STATE.md atualizado refletindo `comprovantes.2` Done
- [ ] Fora de escopo, NÃO fazer: chamada à IA / AI Gateway, `AI_GATEWAY_API_KEY`, schema de extração, `processReceipt`, cron sweep, UI — tudo isso é `comprovantes.3`/`.4a`

## Dev Notes

### Por que o spike de rasterização precede tudo (TD-CMP-008)

O parecer `@document-processor` (B-2) classifica a rasterização de PDF em serverless como "o maior risco técnico do epic". PDF é o formato mais comum de comprovante real (NF-e, boleto, fatura, extrato Cielo/Stone/Rede). `gpt-4o-mini` não aceita PDF como file part nativo — isso é capacidade da Anthropic/Google, não da OpenAI, e o provider está travado no ADR-023. Logo todo PDF tem que virar imagem. Renderizar PDF para bitmap sem binários de sistema é a parte frágil: `node-canvas` exige Cairo nativo (inviável em serverless); `@napi-rs/canvas` é prebuilt mas precisa de validação no runtime Fluid Compute; `mupdf` WASM é o mais previsível mas pesa no cold start. Sem o spike, `comprovantes.3` não é estimável e o epic inteiro pode derrapar — por isso o spike é o AC1, antes de qualquer código de produção.

### Por que `INSERT` antes do upload do binário

O parecer `@architect` (M-3) aponta um TOCTOU clássico: dois uploads simultâneos do mesmo arquivo passam ambos pelo `SELECT` de idempotência antes de qualquer `INSERT`. Pior, se o upload do binário ao Storage acontece **antes** do `INSERT` da row, uma colisão de `UNIQUE` no `INSERT` deixa um objeto órfão no bucket. A correção: `INSERT` da row primeiro, com `ON CONFLICT (org_id, file_hash) DO NOTHING RETURNING` — a colisão é pega cedo, e só então o binário sobe usando o `receipt_id` retornado. O `UNIQUE (org_id, file_hash)` da migration de `comprovantes.1` é a defesa real; a Server Action só ordena as operações para não criar lixo.

### Por que `sharp().rotate()` é obrigatório e não débito

O input primário desta feature é foto de celular. O sensor grava a imagem na orientação física e marca a rotação correta só na tag EXIF Orientation. Modelos vision toleram rotação, mas a confiança cai sem necessidade. `sharp().rotate()` sem argumento aplica a orientação EXIF — custo quase zero, ganho alto. Bônus de compliance: a reescrita do buffer descarta os metadados EXIF, eliminando a geolocalização (achado CMP-M1) de graça — por isso TD-CMP-002 é resolvido aqui, não adiado. Deskew, perspectiva e contraste são mais caros e o modelo tolera — ficam em TD-CMP-009.

### Por que RTF sai do escopo de leitura automática

O parecer `@document-processor` (A-4) separa RTF de ODT/EPUB: ODT e EPUB são ZIP + XML estruturado, parsing determinístico e razoavelmente confiável. RTF é marcação de controle aninhada com escapes e code pages; parsers JS-puro são poucos, mal mantidos e quebram em RTF do Word com tabelas. Além disso RTF é raríssimo como comprovante. O arquivo RTF ainda é aceito e armazenado (princípio "armazenamento aceita qualquer binário"), mas vai direto para `failed` e registro manual — mais honesto que prometer "best effort" que falha quase sempre.

### Containers ZIP e detecção de MIME (M-6)

DOCX, ODT e EPUB têm magic bytes idênticos (`PK\x03\x04`). A `file-type` desambigua inspecionando o conteúdo interno do ZIP (`word/document.xml` para DOCX, `mimetype` para EPUB/ODT). Geralmente acerta, mas um ODT mal-formado pode cair em `application/zip` genérico. Definir comportamento: tentar heurística do conteúdo antes de recusar; nunca rejeitar um documento válido como "formato não suportado" por falha de detecção.

### Limites de tamanho e páginas

`RECEIPT_MAX_BYTES` default 10 MB é conservador — foto HEIC de iPhone moderno passa de 3-5 MB e PDF de fatura escaneada multipágina pode passar de 10 MB (parecer `@architect` BX-4). O default fica, mas é ajustável e deve ser validado no smoke com um comprovante real da Camila. `RECEIPT_MAX_PAGES` default 5 — documento maior processa as N primeiras com aviso, nunca silêncio.

### Onde NÃO usar `lib/supabase/admin.ts`

Todo acesso a `receipts` e ao bucket passa por RLS via `lib/supabase/server.ts` (cliente autenticado). `admin.ts` (`server-only`, bypassa RLS) **não** entra neste fluxo — a spec §2 é explícita. `uploadReceipt` roda sob a sessão da usuária e o `org_id` do JWT.

### Máquina de estados — escopo desta story

`pending` (criado por `uploadReceipt`) → `processing` (início de `normalizeReceipt`) → e para por aqui. A transição `processing → needs_review` (extração OK) e `processing → failed` (erro de IA) é de `comprovantes.3`. Esta story só leva a `failed` quando a **normalização** em si falha (formato não suportado, arquivo corrompido).

## QA Results

**Veredito: PASS (concerns) — gate por `@aiox-master` em 2026-05-31 com smoke real de IA.**

- **Spike TD-CMP-008 VERDE:** `mupdf` rasteriza PDF em ~24-77ms/página, PNG legível, sem binário de sistema (validado visualmente).
- **Smoke real da IA (gpt-4o-mini):** leu o boleto rasterizado e extraiu valor `1523.90`, data `2026-05-31`, contraparte e tipo `pix`, confiança 1.0 — integração OpenAI ponta-a-ponta funcional.
- **Qualidade:** typecheck ✅ · lint --max-warnings 0 ✅ · check-rsc-boundaries ✅ · check-design-system ✅ · build de produção ✅ (pacotes WASM/nativos via `serverExternalPackages`).
- **Compliance no código:** strip de EXIF de graça (`sharp().rotate()` reescreve sem metadados — CMP-M1); MIME por magic bytes (`file-type`); sem `console.*` com conteúdo de arquivo.
- **CONCERNS (não-bloqueantes):** (1) gate `@compliance-br` formal não rodado nesta sessão; (2) smoke E2E autenticado via browser logado pendente (idealizadora); (3) provider OpenAI direto em vez do AI Gateway (ADR-023 — desvio autorizado, reconciliar); (4) cron sweep + scrubbing Sentry específico deferidos para hardening de `.3`; (5) `OPENAI_API_KEY` ainda não provisionada no Vercel (IA degrada graciosamente em prod até lá).

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-18 | 1.0 | Story criada a partir do EPIC-COMPROVANTES e da SPEC §2-3/§6. Escopo: estágios 1-2 do pipeline — spike de rasterização de PDF (TD-CMP-008) precedendo tudo, `uploadReceipt` (validação MIME por magic bytes, tamanho, `sha256`/idempotência via `ON CONFLICT`, upload ao bucket privado), camada `normalizeReceipt` (pré-processamento `sharp().rotate()` obrigatório, rasterização de PDF, conversão de office da matriz §6, multi-página até `RECEIPT_MAX_PAGES`, RTF fora de escopo). Incorpora os pareceres `@architect` (A-3 envs, M-3 idempotência/órfão) e `@document-processor` (B-1/B-2 rasterização, A-1 multi-página, A-2 pré-processamento, A-4 RTF, M-6 ZIP, L-3/L-4). Incorpora o achado de compliance CMP-M1 (strip de EXIF na normalização). 8 ACs testáveis. Gate `@compliance-br` obrigatório. | `@aiox-master` (Orion) atuando como `@sm` (River) |
| 2026-05-18 | 1.1 | `@po` validou **10/10** — checklist de 10 pontos integralmente atendido: título descreve os 3 entregáveis; descrição Como/Quero/Para; 8 ACs testáveis com smokes; escopo IN/OUT explícito no DoD ("Fora de escopo, NÃO fazer"); dependências mapeadas (bloqueante `.1`, não-bloqueante `.0`, habilita `.3`/`.4a`); complexidade L (~8 pts) justificada; valor de negócio ancorado no atrito da Camila; riscos cobertos (spike TD-CMP-008 como AC1 que **precede todo o resto** com critério de decisão e fallback honesto, TOCTOU/objeto órfão, desambiguação de container ZIP); DoD completo com gate `@compliance-br`; alinhada à SPEC §2-3/§6 e aos pareceres `@architect`/`@document-processor`. Spike claramente definido como gate que pausa a story e notifica a equipe se nenhuma biblioteca rasterizar de forma confiável. `next/after` corretamente fora de escopo (é de `.3`). **Concern não-bloqueante propagado para `@dev`:** AC2 e AC4 referenciam "linhas 61-74" de `lib/env.ts` — número de linha é frágil; localizar o bloco `safeParse` pelo conteúdo, não pela linha. Status Draft → Ready. | `@po` (Pax) |
| 2026-05-18 | 1.2 | **Auditoria de consolidação (`@aiox-master`/Orion).** AC5.6 ampliado: o artefato normalizado persistido no bucket passa a cobrir também as imagens de PDF rasterizado (`normalized-p{n}.png`), não só `normalized.txt`. Razão: a tela de revisão (`comprovantes.4b`) precisa renderizar um artefato seguro — fechar o achado CMP-M2 (renderização de PDF/HTML malicioso) que ficou órfão na divisão de `.4`. Sem mudança de escopo nem de pontos; AC reforçado. Story permanece Ready. | `@aiox-master` (Orion) |
