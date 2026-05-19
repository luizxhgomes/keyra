# Revisão Arquitetural — EPIC-COMPROVANTES

**Documento revisado:** `docs/architecture/EPIC-COMPROVANTES-SPEC.md` (Status: ACCEPTED — 2026-05-18)
**Documentos correlatos auditados:** `docs/stories/EPIC-COMPROVANTES.md`, `ARCHITECTURE.md` §11.3 (ADR-023), `CLAUDE.md` (invariantes), `docs/dev/rsc-boundary-rules.md`.
**Revisor:** `@architect` (Aria)
**Data:** 2026-05-18
**Workflow:** `keyra-integracoes-spec-sdc` — etapa "revisão da spec pelo @architect" antes de `@document-processor` e `@sm *draft`.

---

## Sumário

A spec é sólida no desenho conceitual: o pipeline de 6 estágios é coerente, a separação `receipts` (estágio) × `transactions` (ledger) está certa, a obrigatoriedade de revisão humana é fiel à invariante do produto, e a camada de normalização multi-tier é pragmática para o ambiente serverless. O encaixe com os princípios UX da KEYRA também é respeitado.

**Porém, a spec NÃO está pronta para `@sm *draft` no estado atual.** Há **um bloqueador factual** — a afirmação, repetida em três lugares (SPEC §3/§11, EPIC §"Schema previsto"), de que `transactions` "não precisa de migration nova" é **falsa**: o `CHECK` constraint real de `source_type` rejeita o valor `'document'` que a própria spec manda gravar. Toda a story `comprovantes.4` quebraria em runtime no primeiro `INSERT`. Há também achados ALTOS estruturais: ausência total de precedente de RLS em `storage.objects` na codebase (a spec trata como trivial), risco de perda silenciosa do `next/after`, e uma máquina de estados incompleta. A descrição do trigger de auditoria contém uma imprecisão técnica que induziria o `@dev` a erro.

**Recomendação:** corrigir os achados BLOQUEADOR e ALTOS na spec **antes** de draftar as stories. Os achados MÉDIOS/BAIXOS podem virar notas de implementação ou débitos catalogados.

**Contagem de achados:** 1 BLOQUEADOR · 5 ALTO · 6 MÉDIO · 4 BAIXO · 3 NIT.

---

## Achados por severidade

### BLOQUEADOR

#### B-1 — `transactions.source_type` NÃO aceita `'document'`; a spec afirma o contrário em 3 lugares

**Referência:** SPEC §3 Estágio 6 (linha 106), SPEC §4 tabela "Schema previsto" e §11 mapeamento de stories; EPIC §"Schema previsto" (linhas 94-96): *"`transactions` não precisa de migration nova — o schema 012 já previu `source_type` documental"*.

**Problema concreto.** A migration real `supabase/migrations/20260416001200_transactions.sql`, linha 41, define:

```sql
source_type text NULL CHECK (source_type IS NULL OR source_type IN ('command','payment','invoice','manual','import')),
```

O conjunto permitido é `{command, payment, invoice, manual, import}`. **`'document'` não está na lista.** A spec §3 Estágio 6 instrui explicitamente: *"Insere `transactions` com ... `source_type='document'`"*. Esse `INSERT` viola o `CHECK` e o Postgres rejeita com `new row ... violates check constraint "transactions_source_type_check"`. A feature inteira (`comprovantes.4`) está construída sobre uma premissa que o schema vivo desmente.

O comentário da própria migration (linha 41-42) reforça que `source_type` foi pensado para apontar a "commands, payments, documents" — a *intenção* existia, mas o `CHECK` **não foi materializado** para `'document'`. Intenção documentada ≠ constraint aplicado.

Adicionalmente, o ADR-023 §"Schema" e o EPIC propagam a mesma afirmação incorreta — é uma inconsistência sistêmica entre os três documentos canônicos, não um lapso isolado da spec.

**Correção recomendada.** Escolher **uma** das opções e corrigir SPEC + EPIC + ADR-023 de forma consistente:

- **Opção A (recomendada):** adicionar uma migration nova em `comprovantes.1` que faz `ALTER TABLE public.transactions DROP CONSTRAINT transactions_source_type_check, ADD CONSTRAINT transactions_source_type_check CHECK (source_type IS NULL OR source_type IN ('command','payment','invoice','manual','import','document'))`. É uma migration aditiva, retrocompatível, de baixo risco. A spec passa a dizer "exige micro-migration aditiva no CHECK de `source_type`", **não** "sem migration".
- **Opção B:** reutilizar `source_type = 'manual'` (já aceito) e usar apenas `source_id = receipt.id` + `origin = 'manual_income'|'manual_expense'` para distinguir. Perde-se a semântica explícita de "veio de documento", o que prejudica futura reconciliação (Fase 6) e analytics de origem. **Não recomendada.**

Independentemente da opção, a frase "Sem alteração de schema" deve ser **removida** de SPEC §11, EPIC §"Schema previsto" e ADR-023 §"Schema". A story `comprovantes.1` (ou `.4`) deve assumir a migration explicitamente e o gate `@data-engineer` deve cobri-la.

---

### ALTO

#### A-1 — RLS em `storage.objects`: zero precedente na codebase, tratada como trivial

**Referência:** SPEC §5 ("RLS de Storage — Políticas em `storage.objects` filtrando o primeiro segmento do path") e §9 (vetor "Isolamento multitenant").

**Problema concreto.** `grep` em `supabase/migrations/*.sql` por `storage.objects` / `storage.buckets` retorna **zero resultados**. O KEYRA, no MVP inteiro, **nunca usou Supabase Storage**. Não há bucket, não há política de storage, não há migration de storage versionada. A spec trata "RLS de Storage" como uma linha de tabela, como se fosse o mesmo padrão das 21 tabelas `public.*` — mas é um schema diferente (`storage`), com modelo de policy diferente, e o helper `current_org_id()` (usado por todas as policies de `public`) **não está disponível no contexto de `storage.objects`** da mesma forma sem ajuste de `search_path`/`SECURITY DEFINER`.

Além disso, a invariante #2 do projeto ("RLS sempre ativada" + smoke-test inverso) e o teste `rls_isolation.test.sql` cobrem apenas tabelas `public.*` com lista hardcoded — **não cobrem `storage.objects`**. Uma falha de isolamento no Storage passaria pelo CI inteiro sem alarme. Documento financeiro com PII vazando entre tenants é exatamente o cenário que as invariantes #1/#2 existem para impedir.

**Correção recomendada.**
1. `comprovantes.1` deve incluir migration explícita criando o bucket `receipts` **e** as 4 policies de `storage.objects` (`SELECT/INSERT/UPDATE/DELETE`) com `bucket_id = 'receipts' AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'org_id')`. A spec deve detalhar isso, não delegar com uma frase.
2. Estender `rls_isolation.test.sql` com um bloco que valide isolamento de `storage.objects` para o bucket `receipts` — dois tenants, um não vê o objeto do outro. Sem esse teste, a invariante #2 não cobre a superfície nova.
3. Verificar como `auth.jwt() ->> 'org_id'` se comporta dentro de policy de `storage` — a app gera o claim via Auth Hook (`custom_access_token_hook`); confirmar que o claim chega ao contexto de storage. Se não chegar, o isolamento de Storage **não funciona** e isso é um segundo bloqueador latente. Recomendo um spike em `comprovantes.1` antes de fechar o desenho.

#### A-2 — `next/after` pode falhar silenciosamente; a spec não trata o "comprovante preso em `pending`"

**Referência:** SPEC §2 (linha 43), §3 Estágio 1 passo 9, §10 (NFR "Disponibilidade degradada"); ADR-023 decisão #4.

**Problema concreto.** `after()` do Next 16 executa após a resposta ser enviada. Se a função `processReceipt` lançar antes de qualquer `try/catch` interno, ou se o runtime serverless for **encerrado/congelado** antes de `after` concluir (Fluid Compute pode suspender a instância após a resposta; o callback não tem garantia de execução completa como uma fila teria), o resultado é: a row `receipts` fica eternamente em `status='pending'`, **sem nunca virar `failed`**, sem nunca disparar a extração. A spec promete "estado honesto, sem spinner eterno" (EPIC §"Princípios UX"), mas `next/after` perdido produz exatamente um spinner eterno.

A máquina de estados da spec (§4) mostra `failed → (reprocessar manual) → processing`, mas **não há transição de `pending` preso para lugar nenhum**. Não há job de varredura, não há timeout. TD-CMP-006 cataloga "reprocessamento de `failed` é manual" — mas o problema aqui é pior: um `pending` preso **nunca chega a `failed`**, então nem o reprocessamento manual o alcança.

**Correção recomendada.**
1. `processReceipt` deve ser envolvido inteiro em `try/catch` com o `catch` gravando `status='failed'` + `extraction_error` — a spec deve explicitar isso como requisito, não deixar implícito.
2. Adicionar à máquina de estados uma saída para `pending`/`processing` presos: ou (a) a UI de lista detecta `status IN ('pending','processing')` com `created_at` antigo (ex.: > 5 min) e oferece botão "tentar de novo" que re-dispara `processReceipt`; ou (b) catalogar como débito técnico explícito (`TD-CMP-008`) com mitigação "Inngest resolve quando entrar". A spec hoje **não menciona o risco** — precisa, no mínimo, catalogá-lo.
3. Reavaliar a afirmação do NFR "Disponibilidade degradada" — ela assume que o Gateway fora → `status='failed'`. Mas se o `after` nem rodar, não há `failed`. O NFR está otimista.

#### A-3 — Envs novas não seguem o padrão do `lib/env.ts` (opcionalidade, defaults, validação)

**Referência:** SPEC §2 tabela ("Novas envs: `AI_GATEWAY_API_KEY`, `RECEIPTS_BUCKET`, `RECEIPT_MAX_BYTES`"), §7.

**Problema concreto.** A spec lista 3 envs novas mas não especifica como entram no schema Zod de `lib/env.ts` — e o arquivo real tem um padrão rígido (lido linha a linha):
- Server-only secrets são `.optional()` **por design** (para client bundles tree-shakearem) — `AI_GATEWAY_API_KEY` deve ser `.optional()`, e o helper `extractReceipt` deve falhar graciosamente quando ausente (espelhar o padrão `RESEND_API_KEY` → dry-run; aqui seria → `status='failed'` com `extraction_error='gateway not configured'`).
- `RECEIPT_MAX_BYTES` é numérico mas envs são string — precisa de `z.coerce.number()` com `.default(10485760)`. A spec diz "sugerido 10 MB" sem fixar o default no schema.
- `RECEIPTS_BUCKET` provavelmente nem precisa ser env — é uma constante (`'receipts'`). Env só faz sentido se variar por ambiente, o que não é o caso. Recomendo constante em `lib/receipts/`, não env.
- Invariante do projeto (CLAUDE.md): *"Adicionar nova env aqui antes de usar em código."* A spec deve dizer **explicitamente** que `comprovantes.3` altera `lib/env.ts` e como.

**Correção recomendada.** A spec §2/§7 deve trazer o trecho exato do schema Zod a adicionar, com opcionalidade/coerção/default corretos, e indicar que `RECEIPTS_BUCKET` é constante, não env. O gate de revisão de `lib/env.ts` cabe em `comprovantes.3`.

#### A-4 — `comprovantes.4` (XL, 13 pts) é grande demais e mistura camadas que as RSC Boundary Rules mandam separar

**Referência:** EPIC §"Estrutura: 6 stories", SPEC §11; `docs/dev/rsc-boundary-rules.md` Regras 1, 2 e 4.

**Problema concreto.** `comprovantes.4` empacota: lista de comprovantes (Server Component + dados) + tela de upload (form + Client) + tela de revisão (documento renderizado + campos editáveis = forte Client com estado) + 3 Server Actions financeiras (`saveReceiptReview`, `confirmReceipt`, `rejectReceipt`) + componente `ReceiptCard`. É uma story XL que cruza a fronteira Server↔Client em múltiplos pontos — exatamente a superfície onde o Dashboard quebrou em produção por 1h (origem do `rsc-boundary-rules.md`). Uma story XL desse tipo torna o smoke test da Regra 4 difícil de escopar e o gate G5 difícil de focar.

A tela de revisão, em particular, é o ponto de maior risco RSC: documento via signed URL + formulário react-hook-form + destaque de baixa confiança = Client pesado. `ReceiptCard` em `components/keyra/**` aciona G5 e G3 (touch target). Misturar isso com o registro financeiro (`confirmReceipt` cria `transactions` — aciona gate `@finance-domain-expert`) sobrecarrega uma única story com 2 gates de especialista + G5 + G3 + G1.

**Correção recomendada.** Quebrar `comprovantes.4` em duas:
- **`comprovantes.4a`** — Lista + upload + `ReceiptCard` + `uploadReceipt` na UI (gates: G5, G3, G1).
- **`comprovantes.4b`** — Tela de revisão + `saveReceiptReview`/`confirmReceipt`/`rejectReceipt` + registro em `transactions` (gates: `@finance-domain-expert`, G5). É aqui que mora a fórmula bruto/taxa/líquido e a criação do ledger — merece story própria com foco financeiro.

Isso elevaria o epic para 7 stories, mas reduz o risco de uma XL "tudo ou nada". Se a quebra for recusada, a story XL **deve** ter checklist RSC explícito por componente e smoke test segmentado por tela.

#### A-5 — Coerência financeira do Estágio 6: a spec descreve a fórmula incompleta para `debit`

**Referência:** SPEC §3 Estágio 6 passo 2 (linha 105), SPEC §10 NFR "Coerência financeira".

**Problema concreto.** A spec diz: *"`net = gross - fee` para `credit`; `fee=0, net=gross` para `debit`"*. Mas o Zod schema de extração (§7) deixa a **LLM** extrair `gross_amount`, `fee_amount` e `net_amount` os três como campos independentes — e a LLM pode perfeitamente retornar, para um `debit`, `fee_amount = "5.00"` (ex.: leu um desconto no boleto). Se `confirmReceipt` apenas "calcula" sem **normalizar**, o `INSERT` em `transactions` viola `transactions_amount_coherent` (migration 012 linha 51-54: para `debit`, exige `fee_amount = 0 AND net_amount = gross_amount`).

A spec não especifica o que acontece com o `fee_amount` extraído num `debit`: é descartado? somado ao gross? O `reviewed_data` que a humana confirma — ele tem 3 campos ou a UI esconde `fee` quando `direction=debit`? Sem essa decisão explícita, `comprovantes.4`/`.4b` quebra no `CHECK` ou registra valor errado. Isso é território do gate `@finance-domain-expert`, mas a spec precisa **levantar a questão** para o gate ter o que revisar.

**Correção recomendada.** SPEC §3 Estágio 6 deve especificar a regra de normalização **antes** do `INSERT`, com `Decimal.js`:
- `credit`: `net = gross - fee` (recalcular sempre, não confiar no `net` da LLM).
- `debit`: forçar `fee = 0`; `net = gross`. Se a LLM extraiu `fee > 0` num `debit`, decidir explicitamente — provavelmente o "desconto" deve ser refletido no `gross` (valor efetivamente pago) e `fee` zerado. Documentar a decisão.
- A UI de revisão deve esconder/desabilitar o campo `fee` quando `direction = debit`, para a humana não confirmar um estado incoerente.
- Encaminhar a §7 (Zod) e a §3 Estágio 6 ao gate `@finance-domain-expert` de `comprovantes.3` **e** `.4`/`.4b`.

---

### MÉDIO

#### M-1 — Descrição do trigger de auditoria customizado é tecnicamente imprecisa

**Referência:** SPEC §4 "Trigger de auditoria customizado" (linha 194): *"`comprovantes.1` implementa e exclui `receipts` do trigger universal"*.

**Problema concreto.** O trigger universal (`migration 016`, função `trg_audit_row_change` + bloco `DO`) anexa-se a uma **lista hardcoded explícita** de 18 tabelas (linhas 102-109 da migration 016). `receipts` **não está nessa lista** e, sendo uma tabela nova, nunca estará — a menos que alguém a adicione. Portanto **não há nada a "excluir"**: o trigger universal simplesmente não toca `receipts`. A frase da spec induz o `@dev` a procurar um `DROP TRIGGER` que não existe, ou a achar que precisa modificar a migration 016 (uma migration já aplicada — não se edita migration histórica).

**Correção recomendada.** Reescrever a frase: *"`receipts` é uma tabela nova e não é incluída na lista hardcoded do trigger universal `trg_audit_row_change` (migration 016) — nenhuma ação de exclusão é necessária. `comprovantes.1` apenas **cria** o trigger customizado `audit_receipts`."* O design (auditoria minimalista só com metadados) está correto; só a descrição do mecanismo está errada.

#### M-2 — `audit_receipts` precisa de tabela de destino — `audit_log` tem CHECK em `resource_type`? Não, mas o INSERT precisa caber

**Referência:** SPEC §4 "Trigger de auditoria customizado".

**Problema concreto.** A spec diz que `audit_receipts` registra "apenas `id, org_id, status anterior→novo, actor, timestamp`". Mas **onde** ele grava? Se for na própria `audit_log`, o `before`/`after` jsonb teria que conter só `{status}` — o que é viável (`audit_log.resource_type` é `text` livre, sem CHECK restritivo; aceita `'receipts'`). Mas a `audit_log` tem trigger `audit_log_block_mutations` (append-only) e RLS própria — ok. Se for uma tabela nova `receipts_audit`, a spec não a declara no schema §4. A spec deixa o destino ambíguo.

**Correção recomendada.** Decidir e explicitar: recomendo **reutilizar `audit_log`** com `resource_type='receipts'`, `before={status: old}`, `after={status: new}` — assim a auditoria de comprovantes aparece no mesmo lugar que o resto, sem nova tabela, e ainda respeita minimização (só o campo `status`, nunca `extraction_data`). O trigger customizado faz o `INSERT` seletivo. A spec §4 deve dizer isso explicitamente.

#### M-3 — Idempotência por `file_hash`: a checagem da Server Action corre risco de race; o `UNIQUE` é a real defesa

**Referência:** SPEC §3 Estágio 1 passos 5-6, §10 NFR "Idempotência".

**Problema concreto.** O passo 6 faz `SELECT` por `(org_id, file_hash)` e "retorna o existente". Dois uploads simultâneos do mesmo arquivo (usuária com dedo nervoso, ou retry de rede) podem ambos passar o `SELECT` antes de qualquer `INSERT` — clássico TOCTOU. O `CONSTRAINT receipts_org_hash_unique` (§4) é a defesa real, mas a spec descreve o fluxo feliz sem dizer o que acontece quando o `INSERT` colide. Pior: o passo 7 (upload do binário ao Storage) acontece **antes** do `INSERT` da row — então um upload que colide no `INSERT` deixa um objeto órfão no Storage.

**Correção recomendada.** SPEC §3 Estágio 1 deve: (a) inverter ou proteger a ordem — idealmente `INSERT` da row primeiro (pega a colisão `UNIQUE` cedo, via `ON CONFLICT (org_id, file_hash) DO NOTHING RETURNING`), e só então upload do binário usando o `receipt_id` retornado; (b) tratar o caso `ON CONFLICT` retornando a row existente; (c) se a ordem upload-primeiro for mantida por algum motivo, definir limpeza do objeto órfão no `catch`. Sem isso, há objetos órfãos no bucket e o NFR de idempotência tem furo de concorrência.

#### M-4 — Estágio 4: signed URL passada à LLM — o documento sai para a OpenAI; confirmar que o AI SDK baixa server-side

**Referência:** SPEC §3 Estágio 4 passos 1-2, §9 vetor "Acesso indevido ao arquivo".

**Problema concreto.** O passo 1 gera signed URL "≤ 60 s" e o passo 2 passa o documento "como file/image part". Há duas formas: (a) o servidor KEYRA baixa o binário da signed URL e envia os **bytes** ao Gateway; (b) passa-se a **URL** e a OpenAI a busca. Se for (b), a signed URL — que dá acesso a um documento com PII — trafega para um terceiro e pode ser logada na infra dele; 60 s é tempo de sobra para um fetch da OpenAI, mas o vetor de exposição da URL existe. A spec não desambígua, e isso tem peso de compliance (gate `@compliance-br`).

**Correção recomendada.** Fixar na spec: o servidor KEYRA **baixa o binário server-side** e envia bytes (base64/buffer) ao `generateObject` como file part — a signed URL **nunca** sai do servidor KEYRA. Para Tier texto, idem (texto já está em memória). Encaminhar ao gate `@compliance-br` de `comprovantes.3`.

#### M-5 — PDF "fallback: rasterizar páginas" sem ferramenta viável em serverless

**Referência:** SPEC §6 matriz (linha 219: "PDF ... fallback: rasterizar páginas p/ imagem"), §6 nota ("sem binários de sistema").

**Problema concreto.** A spec §6 afirma corretamente que não há binários de sistema em serverless (sem LibreOffice). Mas rasterizar PDF→imagem normalmente exige `pdfium`/`poppler`/`ghostscript` — binários de sistema — ou `pdf.js` com canvas, que em Node serverless precisa de `@napi-rs/canvas` ou similar (binário nativo, pesado, e nem sempre confiável no runtime da Vercel). A spec lista o fallback de rasterização como se fosse trivial, mas ele tem o mesmo problema que ela mesma reconhece para DOCX. `gpt-4o-mini` aceita PDF nativamente como file part na maioria dos casos, então o fallback raramente seria necessário — mas "raramente" não é "nunca".

**Correção recomendada.** Ou (a) remover o fallback de rasterização do MVP e dizer "PDF que o modelo não conseguir ler nativamente → `status='failed'` + registro manual" (consistente com o princípio "nunca um beco sem saída"), ou (b) validar concretamente uma lib JS-puro de rasterização que rode no runtime Vercel antes de prometer o fallback. Recomendo (a) para o MVP — é o caminho honesto. Cabe ao `@document-processor` (Íris) bater o martelo.

#### M-6 — Falta política de retenção/expurgo de `extraction_raw_text` e do binário pós-confirmação

**Referência:** SPEC §5 ("Retenção"), §9, TD-CMP-003.

**Problema concreto.** Após `confirmReceipt`, a `transactions` é a fonte de verdade. O `extraction_raw_text` e o `extraction_data` em `receipts` continuam guardando o conteúdo financeiro bruto (PII: contraparte, valores) indefinidamente. Para um comprovante `rejected`, idem — fica tudo salvo. A spec só fala em purga "na exclusão da org" (TD-CMP-003, que aliás está catalogado como Alta e bloqueando o critério de retenção). Não há política de minimização temporal: por quanto tempo o `receipts` precisa guardar o `extraction_raw_text` depois de virar `transaction`? Minimização (LGPD Art. 6º III) sugere expurgar o que não é mais necessário.

**Correção recomendada.** Esta é decisão de `@compliance-br`, mas a spec deve **levantar** a pergunta e propor um default (ex.: `extraction_raw_text` é anulado N dias após `confirmed`/`rejected`; o binário do Storage segue a retenção fiscal do comprovante). Hoje a spec é silenciosa — o gate de compliance não tem o que revisar.

---

### BAIXO

#### BX-1 — `comprovantes.0` depende de RPC `user_consent_status` que pode já existir

**Referência:** SPEC §11 (`comprovantes.0`), EPIC §"Mapeamento".

A migration `20260503000100_auth_v2_profiles_consent_legal_docs.sql` e `20260504000100_seed_legal_documents_v1_0_0.sql` já estabeleceram `legal_documents` + `user_consent_records` (ADR §10.x). A spec cita RPC `user_consent_status` como entregável novo de `comprovantes.0`, mas pode haver função/RPC de consentimento já existente do EPIC-AUTH-V2. **Correção:** `@sm`, ao draftar `comprovantes.0`, deve auditar o que já existe de consentimento e reutilizar — não recriar.

#### BX-2 — `extraction_confidence numeric(4,3)` vs `confidence` no Zod (`z.number().min(0).max(1)`)

**Referência:** SPEC §4 (coluna `extraction_confidence numeric(4,3)`), §7 (Zod `confidence`).

`numeric(4,3)` comporta `0.000`–`9.999`; o `CHECK BETWEEN 0 AND 1` cobre o intervalo. Mas a LLM retorna `number` JS (float). É um caso onde a invariante Decimal.js **não** se aplica (confiança não é dinheiro) — ok usar `Number`. Só vale uma nota: garantir arredondamento a 3 casas antes do `INSERT` para não estourar a escala. **Correção:** nota de implementação em `comprovantes.3`.

#### BX-3 — `normalized_kind` tem valor `'pdf'` mas PDF é Tier Visão — possível redundância

**Referência:** SPEC §4 (`normalized_kind IN ('image','pdf','text')`), §6 matriz.

PDF na matriz §6 é Tier "Visão" e enviado como file part. `normalized_kind` distingue `image`/`pdf`/`text`, o que é razoável para a lógica de envio, mas vale conferir se `extractReceipt` realmente trata `pdf` diferente de `image` (file part vs image part do AI SDK). Se o tratamento for idêntico, `pdf` e `image` poderiam colapsar em `visual`. **Correção:** decisão menor de `@document-processor`; não bloqueia.

#### BX-4 — `RECEIPT_MAX_BYTES` 10 MB pode ser pequeno para PDF multipágina / foto HEIC

**Referência:** SPEC §5, §3 Estágio 1 passo 4.

Foto de iPhone moderno em HEIC já passa de 3-5 MB; um PDF de fatura escaneada multipágina pode passar de 10 MB. 10 MB é um default conservador razoável para o MVP, mas vale dimensionar contra o caso real (foto de boleto da Camila). **Correção:** validar o número com a idealizadora no smoke; default fica, mas documentar que é ajustável.

---

### NIT

#### N-1 — SPEC §13 Change Log diz "Pendente revisão de `@architect`" — este documento resolve essa pendência; atualizar o Change Log da spec após incorporar os achados.

#### N-2 — Inconsistência de contagem: EPIC fala "~47 pts / 6 stories"; se A-4 for aceito, vira 7 stories — propagar para EPIC §"Estrutura" e §"Cadeia de dependências".

#### N-3 — SPEC §2 diagrama ASCII e EPIC §"A jornada" descrevem o mesmo pipeline com texto levemente diferente — alinhar a nomenclatura dos 6 estágios entre os dois documentos para evitar deriva.

---

## Avaliação dos pontos solicitados (resumo)

| Tema | Veredito |
|------|----------|
| Pipeline síncrono/assíncrono; `next/after` é a escolha certa? | `next/after` é defensável para o MVP (evita infra de fila), **mas** a spec não trata a perda silenciosa do callback (A-2). Aceitável **com** mitigação de `pending` preso. |
| RSC boundaries / Server Actions | Padrão correto (Server Actions coladas, `requireAuth()` no topo). Risco concentrado em `comprovantes.4` — ver A-4. |
| RLS / multi-tenancy por JWT | Correto para `public.receipts`. **Furo real** em `storage.objects` — ver A-1. |
| Decimal.js no boundary | Spec respeita a invariante (strings entram/saem). Falta a regra de normalização `debit` — ver A-5. |
| `server-only` | Não violado — `admin.ts` explicitamente fora do fluxo. OK. |
| Schema `receipts` | Bem desenhado: tipos, FKs, índices parciais, `UNIQUE`, soft delete, triggers `set_updated_at`/`enforce_org_id`. Máquina de estados **incompleta** (A-2). |
| Reutilizar `transactions` sem migration | **FALSO** — `source_type` não aceita `'document'`. Ver B-1. |
| Provider gpt-4o-mini / AI Gateway / envs | Decisão alinhada ao ADR-023. Configuração de envs subespecificada — ver A-3. |
| Tratamento de erro / estados de falha | Tabela §7 razoável, mas `pending` preso e órfãos de Storage não cobertos (A-2, M-3). |
| Consistência SPEC × ADR-023 × EPIC | Inconsistência sistêmica na afirmação "sem migration" (B-1); descrição imprecisa do trigger universal (M-1). |
| Divisão em 6 stories / dependências | Cadeia de dependências correta. `comprovantes.4` grande demais — recomendo quebra (A-4). |

---

## VEREDITO

# NEEDS_REVISION

A spec tem fundação arquitetural correta e é fiel aos princípios do produto, mas **não pode seguir para `@sm *draft` no estado atual**. O achado **B-1** é um bloqueador factual: a feature inteira está construída sobre a premissa — repetida em SPEC, EPIC e ADR-023 — de que `transactions` aceita `source_type='document'` sem migration, e o `CHECK` constraint real desmente isso. Draftar `comprovantes.4` sobre essa premissa produziria código que quebra em runtime no primeiro `INSERT`.

**Condições para virar APPROVED:**

1. **B-1** corrigido nos três documentos (SPEC + EPIC + ADR-023): decisão explícita de migração aditiva do `CHECK` de `source_type` (Opção A recomendada) e remoção da frase "sem alteração de schema".
2. **A-1** endereçado: spec detalha as policies de `storage.objects`, o teste RLS é estendido para o bucket `receipts`, e há spike confirmando que o claim `org_id` chega ao contexto de storage.
3. **A-2** endereçado: máquina de estados ganha saída para `pending`/`processing` presos; `processReceipt` envolvido em `try/catch` total documentado; risco catalogado.
4. **A-3**, **A-5** endereçados na spec (trecho Zod de `lib/env.ts`; regra de normalização `debit` com `Decimal.js`).
5. **A-4** decidido: quebrar `comprovantes.4` em `.4a`/`.4b` **ou** registrar waiver com checklist RSC por componente.

Os achados MÉDIOS/BAIXOS/NIT podem ser incorporados como notas de implementação nas stories ou débitos do catálogo TD-CMP — não bloqueiam o `APPROVED`, mas **M-1** deve ser corrigido para não induzir o `@dev` a erro.

Após a revisão da spec, recomendo que `@document-processor` (Íris) valide especificamente §6 (normalização) e M-5 (rasterização de PDF) antes do `@sm` draftar — é o domínio dela e há decisões técnicas reais pendentes ali.

---

*Revisão produzida por `@architect` (Aria) — workflow `keyra-integracoes-spec-sdc`, etapa de revisão de spec. 2026-05-18.*
