# Story comprovantes.3: Pipeline de extração LLM assíncrono — `processReceipt` + `extractReceipt` (AI Gateway) + Zod schema com `field_confidence` + scrubbing Sentry + cron sweep

## Status

Ready

## Story

**Como** Camila, dona da clínica de estética que usa o KEYRA,
**Eu quero** que, depois de anexar um comprovante, o sistema leia automaticamente o documento com IA — valor, data, direção (receita/despesa), descrição e contraparte — e o deixe pronto para minha revisão, sem que eu precise digitar nada,
**Para que** o atrito de lançar manualmente um Pix recebido, uma taxa de maquininha ou uma NF de fornecedor desapareça, e o financeiro continue nascendo da operação — agora também do que entra por fora da comanda.

Esta story entrega o **estágio 4 (Ler IA)** do pipeline do EPIC-COMPROVANTES (`docs/architecture/EPIC-COMPROVANTES-SPEC.md` §3-4, §7): a função `processReceipt` disparada por `next/after`, a função `extractReceipt` que chama o Vercel AI Gateway (`openai/gpt-4o-mini`, `generateObject`, `disallowPromptTraining`), o Zod schema de extração com confiança por campo, o patch do scrubbing do Sentry para os campos novos, e a rede de segurança contra estados presos (cron sweep). Não entrega UI — só prepara `extraction_data`/`extraction_confidence` para `comprovantes.4b`.

## Complexidade

**T-shirt:** L (~9 pontos)

A maior parte do risco está no pipeline assíncrono (`next/after` pode perder o callback), na recuperação de estados presos e no contrato exato do Zod schema. A chamada ao AI Gateway em si é direta com o AI SDK.

## Acceptance Criteria

### AC1 — Variável de ambiente `AI_GATEWAY_API_KEY` no schema Zod de `lib/env.ts`

1. `apps/web/src/lib/env.ts` ganha `AI_GATEWAY_API_KEY: z.string().min(10).optional()` no `serverSchema`, adicionada também ao objeto `safeParse({...})` (linhas 61-74).
2. É **server-only secret e `.optional()`** — segue o padrão de `RESEND_API_KEY` (parecer `@architect` A-3): client bundles tree-shakeiam; o boot não aborta com a env ausente.
3. **Graceful degradation:** quando `AI_GATEWAY_API_KEY` está ausente, `extractReceipt` não quebra — marca a row `status='failed'` com `extraction_error='gateway not configured'`, mantendo o registro manual sempre disponível (espelha o dry-run de `sendEmail`).

### AC2 — Zod schema de extração com `field_confidence` por campo

1. Arquivo `apps/web/src/lib/receipts/schema.ts` exporta `receiptExtractionSchema` exatamente conforme a SPEC §7:
   - `direction`: `z.enum(['credit','debit'])` — `credit` = receita/entrada; `debit` = despesa/saída.
   - `document_type`: `z.enum(['nota_fiscal','recibo','comprovante_pix','boleto','extrato','fatura','outro'])`.
   - `gross_amount`, `fee_amount`, `net_amount`: `z.string()` — valores monetários como **string**, formato `"1234.56"` (ponto decimal, sem milhar). Nunca `z.number()` para dinheiro.
   - `reference_date`: `z.string()` — ISO `YYYY-MM-DD`. O `.describe()` deve dizer explicitamente que é a **data do efetivo pagamento/recebimento** (o que importa para fluxo de caixa e DRE), não a data de emissão (parecer `@document-processor` L-2).
   - `description`: `z.string()`.
   - `counterparty`: `z.string().nullable()`.
   - `suggested_category`: `z.string().nullable()`.
   - `confidence`: `z.number().min(0).max(1)` — confiança geral.
   - `field_confidence`: `z.object({ gross_amount, reference_date, direction })`, cada um `z.number().min(0).max(1)` — confiança por campo crítico (parecer `@document-processor` A-3; resolve a contradição §5↔§7 da spec).
2. Constante nomeada `LOW_CONFIDENCE_THRESHOLD = 0.75` exportada de `schema.ts` — campo abaixo desse valor é marcado pela UI de revisão (`comprovantes.4b`) como "confira este campo". O limiar vive aqui, não mágico no JSX (parecer `@document-processor` A-3 / spec §7).
3. Cada campo do schema tem `.describe()` em pt-BR claro — o `describe` é o que orienta o modelo.

### AC3 — `extractReceipt` chamando o Vercel AI Gateway

1. Arquivo `apps/web/src/lib/receipts/extract.ts`, função `extractReceipt(receipt)` — função interna, não Server Action.
2. Usa o AI SDK `generateObject` com o modelo via string `"openai/gpt-4o-mini"` (Vercel AI Gateway — sem pacote provider-específico) e o `receiptExtractionSchema` de AC2.
3. Header de gateway com `disallowPromptTraining: true` (ADR-023 — sem ZDR, mitigado pela Política v1.1.0).
4. **O servidor KEYRA baixa o binário/artefato server-side e envia os bytes** ao `generateObject` como file/image part — a signed URL **nunca** sai do servidor KEYRA (parecer `@architect` M-4). Tier visão (`normalized_kind='image'`) envia imagem(ns) como image part; tier texto (`normalized_kind='text'`) envia o texto carregado em memória.
5. Multi-página: as N páginas rasterizadas (até `RECEIPT_MAX_PAGES`, preparadas por `comprovantes.2`) são enviadas como image parts numa única chamada `generateObject`.
6. Prompt do sistema conforme SPEC §7: extrai dados financeiros de comprovantes de uma clínica de estética brasileira; datas BR `DD/MM/AAAA` viram ISO; valores com vírgula decimal viram ponto; campo ausente → `null`/`0` com confiança baixa; **nunca inventar valores**.
7. **Instrução anti-PCI (CMP-B1 / TD-CMP-007):** o prompt do sistema instrui explicitamente a **NÃO extrair, NÃO transcrever e NÃO repetir números de cartão (PAN)** — apenas valor, data, descrição, direção, contraparte. Como defesa em profundidade, considerar um regex de mascaramento de sequências tipo-PAN em `extraction_raw_text` antes de gravar.
8. Em sucesso, grava em `receipts`: `extraction_data` (objeto validado pelo Zod), `extraction_raw_text` (quando aplicável — ver Dev Notes M-2), `extraction_confidence` (arredondado a 3 casas para caber em `numeric(4,3)` — parecer BX-2), `extraction_model='openai/gpt-4o-mini'`, e `status='needs_review'`.
9. **`needs_review` é sempre o destino em caso de sucesso** — zero auto-aprovação (ADR-023 decisão #2; invariante do produto).

### AC4 — `processReceipt` disparada por `next/after` + `try/catch` total

1. `processReceipt(receiptId)` — função interna que orquestra `normalizeReceipt` (de `comprovantes.2`) seguida de `extractReceipt` (AC3).
2. É disparada por `after(() => processReceipt(receiptId))` ao final de `uploadReceipt` (a chamada `after()` é adicionada nesta story, na Server Action existente de `comprovantes.2`).
3. **Toda a função `processReceipt` é envolvida em `try/catch`** — o `catch` grava `status='failed'` + `extraction_error` com mensagem **categórica** (`'timeout'`, `'schema_invalid'`, `'gateway_error'`, `'rate_limited'`, `'gateway not configured'`) — nunca o payload do documento nem stack trace cru (parecer `@architect` A-2).
4. `processReceipt` é **idempotente:** reexecutar sobre uma row já `needs_review`/`confirmed`/`rejected` é no-op (pré-requisito do cron sweep). A idempotência é verificada por checagem de `status` no início.
5. Tratamento de erro conforme SPEC §7:
   - Timeout do Gateway → `failed`, `extraction_error='timeout'`; reprocessável.
   - Schema inválido (modelo não respeitou o Zod) → 1 retry; se persistir → `failed`.
   - Documento ilegível → modelo retorna `confidence` baixa → `needs_review` com aviso forte (não é `failed`).
   - Rate limit → backoff; após N tentativas → `failed`.
6. **Não parece um comprovante** (parecer `@document-processor` M-1): se `confidence < 0.3` **e** `document_type === 'outro'`, a row vai para `needs_review` mas com um aviso forte em `extraction_error` ("não conseguimos identificar isto como um comprovante — confira o arquivo") — não apresenta valores fantasma como extração comum.

### AC5 — Recuperação de estados presos: cron sweep `/api/receipts/sweep`

1. `next/after` não é garantido — se o runtime serverless for suspenso antes do callback concluir, a row fica presa em `pending`/`processing` sem nunca chegar a `failed` (parecer `@architect` A-2). Esta story implementa a rede de segurança.
2. **Route handler** `apps/web/src/app/api/receipts/sweep/route.ts` — re-despacha `processReceipt` para rows presas: `status IN ('pending','processing')` com `updated_at` mais antigo que um limiar (sugerido 10 min).
3. **Vercel Cron** configurado em `apps/web/vercel.json` (`crons`) — execução diária do endpoint `/api/receipts/sweep` (cron está disponível no plano Hobby).
4. O endpoint é **protegido** — autenticado via header de cron do Vercel (`Authorization`/`CRON_SECRET`), não exposto publicamente. Não usa `requireAuth()` (não há sessão de usuária num cron); usa o cliente admin (`lib/supabase/admin.ts`) por ser job de sistema — é a única exceção legítima ao "tudo via RLS" da spec, e fica isolada neste route handler.
5. Como `processReceipt` é idempotente (AC4.4), reexecutar sobre rows que já avançaram é seguro.
6. Se `CRON_SECRET` for usado, adicioná-lo ao schema Zod de `lib/env.ts` como `.optional()`.

### AC6 — Patch do scrubbing do Sentry para os campos novos do pipeline

1. `apps/web/src/lib/observability/sentry-scrub.ts` — estender `SENSITIVE_KEY_PATTERNS` com os campos novos que carregam conteúdo de comprovante (achado de compliance CMP-A4): `extraction_data`, `extraction_raw_text`, `reviewed_data`, `file_path`, `signed_url` (e variação `signedUrl`), `messages` (o array enviado ao AI Gateway). Considerar também `rawText`.
2. Atualizar o smoke-test inline de `sentry-scrub.ts` (bloco `KEYRA_SENTRY_SCRUB_SELFTEST`) com amostra desses campos novos — confirmar que o valor é substituído por `[REDACTED]`.
3. Garantir que o scrubbing roda tanto no servidor (`apps/web/src/instrumentation.ts` — onde o `after()` executa) quanto no cliente (`apps/web/src/instrumentation-client.ts`).
4. **Regra de código (parecer `@document-processor` M-4):** proibido `console.*` com `extraction_data`, `extraction_raw_text`, `reviewed_data`, ou o buffer do arquivo — logar somente `receipt_id` e `status`. O scrubbing do Sentry SDK não filtra `console` que vai para o stdout do lambda; a defesa é não logar.
5. `extraction_error` é sempre mensagem categórica — nunca o payload do documento nem a resposta crua do modelo (reforça AC4.3).

### AC7 — Tipos, qualidade e gates

1. `pnpm typegen` regenerado se necessário (re-sync de `receipts` em `database.types.ts`).
2. `pnpm lint --max-warnings 0`, `pnpm typecheck` e `./scripts/check-rsc-boundaries.sh` verdes.
3. Pacote do AI SDK instalado em `apps/web/package.json` (ex.: `ai`), validado como funcional em runtime Node.js/Fluid Compute.
4. Gate `@compliance-br` (Têmis) `*lgpd-audit` — CMP-A4 (scrubbing dos campos novos), CMP-B1 (instrução anti-PAN no prompt), envio do documento à LLM server-side (signed URL não sai do servidor).
5. Gate `@finance-domain-expert` (Valéria) `*review-financial-logic` — coerência dos campos `gross_amount`/`fee_amount`/`net_amount` extraídos; o `describe()` de `reference_date`; o schema não induz a IA a um estado incoerente. Nota: a **normalização de coerência financeira** que precede o `INSERT` em `transactions` (`credit`: `net = gross − fee`; `debit`: `fee = 0, net = gross`) é da story `comprovantes.4b` — aqui Valéria valida que o **schema de extração** entrega os três campos de forma que `.4b` possa normalizar corretamente.

## Tasks / Subtasks

- [ ] Branch `feat/comprovantes-3` partindo de `main`
- [ ] Confirmar que `comprovantes.1` e `comprovantes.2` estão Done (tabela `receipts`, bucket, `normalizeReceipt`, `RECEIPT_MAX_PAGES`)
- [ ] AC1 — adicionar `AI_GATEWAY_API_KEY` (e `CRON_SECRET` se usado) ao `serverSchema` + `safeParse` em `lib/env.ts`
- [ ] AC7 — instalar pacote do AI SDK (`ai`)
- [ ] AC2 — criar `lib/receipts/schema.ts` com `receiptExtractionSchema` (incl. `field_confidence`) + `LOW_CONFIDENCE_THRESHOLD`
- [ ] AC3 — implementar `extractReceipt` em `lib/receipts/extract.ts` (AI Gateway, `generateObject`, `disallowPromptTraining`, bytes server-side, prompt anti-PAN)
- [ ] AC4 — implementar `processReceipt` (`try/catch` total, idempotência, tratamento de erro categórico, caso "não parece comprovante")
- [ ] AC4 — adicionar `after(() => processReceipt(receiptId))` ao final de `uploadReceipt` em `comprovantes/actions.ts`
- [ ] AC5 — criar route handler `app/api/receipts/sweep/route.ts` (protegido por header de cron, re-despacha rows presas)
- [ ] AC5 — configurar `crons` em `apps/web/vercel.json` apontando para `/api/receipts/sweep`
- [ ] AC6 — estender `SENSITIVE_KEY_PATTERNS` em `sentry-scrub.ts` + atualizar o smoke-test inline
- [ ] AC6 — auditar `processReceipt`/`extractReceipt` por `console.*` com PII — remover todos
- [ ] Rodar o selftest do scrubbing: `KEYRA_SENTRY_SCRUB_SELFTEST=1` → confirmar `[REDACTED]` nos campos novos
- [ ] Smoke local: upload de foto de Pix recebido → `processReceipt` → `extraction_data` com `direction='credit'` e `needs_review`; upload de boleto pago → `direction='debit'`; upload de imagem que não é comprovante → `needs_review` com aviso
- [ ] Smoke do sweep: forçar uma row presa em `processing` → chamar `/api/receipts/sweep` → row reprocessada
- [ ] Smoke de degradação: `AI_GATEWAY_API_KEY` ausente → `failed` com `extraction_error='gateway not configured'`, app não quebra
- [ ] AC7 — `pnpm lint` + `pnpm typecheck` + `check-rsc-boundaries.sh`
- [ ] Gate `@compliance-br` (Têmis) `*lgpd-audit`
- [ ] Gate `@finance-domain-expert` (Valéria) `*review-financial-logic`
- [ ] QA gate (`@qa`)
- [ ] Commit + push + PR + CI verde + merge (delegado a `@devops`)
- [ ] STATE.md sincronizado

## Dependencies

- **Interna (bloqueante):** `comprovantes.1` (schema `receipts` — colunas `extraction_*`, máquina de estados, `ALTER transactions.source_type`) e `comprovantes.2` (`normalizeReceipt` produz o artefato que `extractReceipt` consome; `uploadReceipt` é onde o `after()` é plugado; `RECEIPT_MAX_PAGES`) devem estar **Done**.
- **Interna (bloqueante para go-live em produção):** `comprovantes.0` (Política de Privacidade v1.1.0 publicada + re-aceite forçado ativo). Conforme o Critério de Saída do EPIC item 2 e a auditoria `@compliance-br` §6 item 2, **`comprovantes.3` NÃO pode ir a produção** antes da v1.1.0 publicada e do re-aceite ativo — é a base legal do envio do documento à LLM externa sem ZDR. O código pode ser desenvolvido e mergeado, mas a feature só é exposta à idealizadora após `comprovantes.0` Done.
- **Externa:** `AI_GATEWAY_API_KEY` provisionada nos targets do Vercel pela idealizadora/`@devops` (validar a credencial via chamada real antes de salvar — lição registrada em memória do projeto). `CRON_SECRET` se adotado.
- **Habilita:** `comprovantes.4b` (tela de revisão consome `extraction_data`/`field_confidence` e cria `transactions`).

## Definition of Done

- [ ] Todos os 7 ACs atendidos
- [ ] `AI_GATEWAY_API_KEY` no schema Zod de `lib/env.ts` como `.optional()`; degradação graciosa quando ausente
- [ ] `receiptExtractionSchema` com `field_confidence` por campo + `LOW_CONFIDENCE_THRESHOLD` exportado
- [ ] `extractReceipt` chama o AI Gateway (`openai/gpt-4o-mini`, `generateObject`, `disallowPromptTraining`), envia bytes server-side, prompt instrui contra extração de PAN
- [ ] `processReceipt` com `try/catch` total, idempotente, disparado por `after()` em `uploadReceipt`
- [ ] Cron sweep `/api/receipts/sweep` implementado, protegido, configurado em `vercel.json`; re-despacha rows presas
- [ ] `SENSITIVE_KEY_PATTERNS` estendido com os campos novos; selftest do scrubbing verde; zero `console.*` com PII
- [ ] `pnpm lint --max-warnings 0` + `pnpm typecheck` + `./scripts/check-rsc-boundaries.sh` verdes
- [ ] Smoke local: Pix recebido (`credit`), boleto pago (`debit`), não-comprovante (aviso), sweep de row presa, degradação sem `AI_GATEWAY_API_KEY` — todos com comportamento esperado
- [ ] Gate `@compliance-br` APPROVE (ou CONCERNS documentado)
- [ ] Gate `@finance-domain-expert` APPROVE (ou CONCERNS documentado)
- [ ] QA gate `@qa` PASS
- [ ] PR mergeado em main; Vercel prod deploy READY
- [ ] STATE.md atualizado refletindo `comprovantes.3` Done
- [ ] **Feature NÃO exposta em produção** até `comprovantes.0` Done (Política v1.1.0 + re-aceite) — registrado como condição de go-live
- [ ] Fora de escopo, NÃO fazer: UI de lista/upload/revisão, `saveReceiptReview`/`confirmReceipt`/`rejectReceipt`, criação de `transactions`, normalização de coerência financeira `credit`/`debit` — tudo isso é `comprovantes.4a`/`.4b`

## Dev Notes

### Por que `next/after` precisa de uma rede de segurança

O parecer `@architect` (A-2) é direto: `after()` do Next 16 executa após a resposta, mas se o runtime serverless (Fluid Compute) for suspenso ou congelado antes do callback concluir, a row fica presa em `pending`/`processing` **sem nunca virar `failed`**. O epic promete "estado honesto, sem spinner eterno" — um `after` perdido produz exatamente um spinner eterno. Duas defesas: (1) `processReceipt` inteiro em `try/catch` para que qualquer erro vire `failed` rastreável; (2) o cron sweep diário que re-despacha rows presas além do limiar. A UI de `comprovantes.4a` também oferecerá "reprocessar" manual — mas o cron é a rede que não depende da usuária notar.

### Por que o documento sai como bytes, não como signed URL

O parecer `@architect` (M-4) e a auditoria de compliance: passar a signed URL ao `generateObject` faria a URL de um documento com PII trafegar para a OpenAI, que poderia logá-la. Mesmo com expiração de 60 s, o vetor existe. A regra: o servidor KEYRA baixa o binário/artefato da signed URL **server-side** e envia os bytes (file/image part) ao Gateway — a signed URL nunca deixa o servidor KEYRA. Para tier texto, o conteúdo já está em memória.

### Por que `confidence` único não bastava — `field_confidence`

O parecer `@document-processor` (A-3) apontou uma contradição interna na spec: §5 promete "campos com baixa confiança destacados", mas o §7 original entregava só um `confidence` geral — com o qual não dá para destacar campo nenhum. O `field_confidence` resolve: numa foto de boleto o modelo pode ler o valor com alta confiança e a data com baixa (campo borrado). O `LOW_CONFIDENCE_THRESHOLD = 0.75` é constante nomeada em `schema.ts` — `comprovantes.4b` usa para colorir o campo na revisão.

### `extraction_raw_text` para tier visão (M-2)

Para tier texto/conversão, `extraction_raw_text` é o texto que foi para o prompt — natural. Para tier visão (imagem/PDF rasterizado), `generateObject` retorna só o objeto estruturado, sem OCR intermediário. Decisão para esta story: `extraction_raw_text` fica `NULL` para tier visão — não adicionar um campo `raw_text` ao schema (custo de token sem retorno claro no MVP; era a opção (a) do parecer M-2). Documentar essa decisão para `comprovantes.4b` não esperar o campo populado em imagens.

### Caso "não parece um comprovante" (M-1)

Se a usuária anexa uma selfie ou um print de conversa, o modelo retorna um objeto Zod-válido (o schema obriga campos) com valores zerados/inventados e confiança baixa. A porta de saída: `confidence < 0.3` **e** `document_type === 'outro'` → `needs_review` com aviso forte em `extraction_error`. Não é status novo — é um aviso. O importante é não apresentar valores fantasma como extração comum na tela de revisão.

### Instrução anti-PAN no prompt (CMP-B1 / TD-CMP-007)

Um comprovante (fatura, cupom de maquininha) pode conter número de cartão. Se a IA extrair e o sistema persistir o PAN em `extraction_data`/`extraction_raw_text`, a KEYRA entra sem querer no escopo de PCI-DSS. O prompt do sistema instrui explicitamente a NÃO extrair/transcrever/repetir números de cartão. Defesa em profundidade opcional: regex de mascaramento de sequências tipo-PAN em `extraction_raw_text` antes de gravar.

### Latência — NFR honesto

Conforme SPEC §10 e parecer `@document-processor` (M-5): < 30 s ponta-a-ponta é realista para imagem única, otimista para PDF multi-página rasterizado (rasterização de N páginas soma tempo, especialmente com cold start de WASM). Como tudo roda em `next/after` (não bloqueia a usuária) e a UI mostra "processando", latência alta não é crítica para UX — mas não tratar isso como falso descumprimento. O número final só é aferível após o spike de `comprovantes.2`.

### Por que o cron usa `admin.ts` (exceção isolada)

A spec §2 diz "todo acesso a `receipts` passa por RLS — `admin.ts` não usado". O cron sweep é a única exceção legítima: não há sessão de usuária num job de sistema, logo não há `org_id` no JWT para a RLS filtrar. O uso de `admin.ts` fica **isolado** no route handler `/api/receipts/sweep`, que é protegido por header de cron. Nenhuma outra parte do pipeline toca `admin.ts`.

### Gate financeiro nesta story vs `comprovantes.4b`

A normalização de coerência financeira que espelha o CHECK `transactions_amount_coherent` (`credit`: `net = gross − fee`; `debit`: `fee = 0, net = gross`, com `Decimal.js`) acontece em `confirmReceipt`, que é de `comprovantes.4b`. Nesta story o gate `@finance-domain-expert` valida algo mais cedo: que o **Zod schema** entrega `gross_amount`/`fee_amount`/`net_amount` como três strings independentes de forma que `.4b` possa normalizar — e que o `describe()` de `reference_date` aponta a data certa (pagamento/recebimento) para o DRE.

## QA Results

_(a preencher pelo @qa após implementação)_

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-18 | 1.0 | Story criada a partir do EPIC-COMPROVANTES e da SPEC §3-4/§7/§8. Escopo: estágio 4 do pipeline — `processReceipt` disparado por `next/after` com `try/catch` total e idempotência, `extractReceipt` via Vercel AI Gateway (`openai/gpt-4o-mini`, `generateObject`, `disallowPromptTraining`, bytes server-side), Zod schema com `field_confidence` por campo + `LOW_CONFIDENCE_THRESHOLD`, recuperação de estados presos via Vercel cron sweep `/api/receipts/sweep`, patch de scrubbing do Sentry para os campos novos. Incorpora os pareceres `@architect` (A-2 `next/after` perdido + cron sweep, A-3 envs, M-4 bytes server-side) e `@document-processor` (A-3 `field_confidence`, M-1 não-comprovante, M-2 `extraction_raw_text`, M-4 `console.*` proibido, M-5 latência). Incorpora os achados de compliance CMP-A4 (scrubbing) e CMP-B1 (anti-PAN). 7 ACs testáveis. Gates `@compliance-br` + `@finance-domain-expert` obrigatórios. Go-live em produção bloqueado até `comprovantes.0` Done. | `@aiox-master` (Orion) atuando como `@sm` (River) |
| 2026-05-18 | 1.1 | `@po` validou **10/10** — checklist de 10 pontos integralmente atendido: título descreve os 4 entregáveis do pipeline LLM; descrição Como/Quero/Para; 7 ACs testáveis com smokes (credit/debit/não-comprovante/sweep/degradação sem chave); escopo IN/OUT explícito no DoD; dependências mapeadas (bloqueante `.1`+`.2`, bloqueante para go-live `.0`, externa `AI_GATEWAY_API_KEY`/`CRON_SECRET`); complexidade L (~9 pts) com risco localizado; valor de negócio ancorado na eliminação do atrito de digitação; riscos cobertos. **Risco `next/after` perder o callback explicitamente tratado** — AC5 implementa o cron sweep `/api/receipts/sweep` como rede de segurança, AC4.3 envolve `processReceipt` inteiro em `try/catch`, Dev Notes articula o problema (spinner eterno) e as duas defesas. Dados pessoais + LLM externa tratados — bytes server-side (signed URL não vaza), `disallowPromptTraining`, scrubbing Sentry (AC6), anti-PAN (AC3.7), go-live bloqueado até `comprovantes.0`. Gates `@compliance-br` (CMP-A4/CMP-B1) e `@finance-domain-expert` (validação do schema de extração, distinta da coerência financeira de `.4b`) reconhecidos em AC7, Tasks e DoD. **Concern não-bloqueante propagado para `@dev`:** AC1 referencia "linhas 61-74" de `lib/env.ts` — número de linha é frágil; localizar o bloco `safeParse` pelo conteúdo, não pela linha. Status Draft → Ready. | `@po` (Pax) |
