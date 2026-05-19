# Story comprovantes.4b: Tela de revisão de comprovante + 3 Server Actions financeiras (saveReceiptReview, confirmReceipt, rejectReceipt)

## Status

Ready

## Story

**Como** Camila, dona de uma clínica de estética que usa o KEYRA,
**Eu quero** abrir um comprovante que a IA já leu e ver o documento original lado a lado com os dados extraídos editáveis — com os campos de leitura duvidosa destacados para eu conferir — podendo corrigir, confirmar (virando um lançamento no meu financeiro) ou rejeitar,
**Para que** o comprovante anexado vire uma transação correta no meu DRE e no fluxo de caixa sem digitação manual, mas sem nunca registrar nada que eu não tenha revisado — porque a IA erra e a decisão é minha.

## Complexidade

**T-shirt:** L (~8 pontos)

## Contexto

Esta story entrega os **estágios 5 (Revisar) e 6 (Registrar)** do pipeline do EPIC-COMPROVANTES (ver `EPIC-COMPROVANTES-SPEC.md` §3) — a metade `.4b` da divisão da story `.4` original. É aqui que mora a **lógica financeira**: a tela de revisão e as 3 Server Actions que confirmam/rejeitam um comprovante, sendo que `confirmReceipt` **cria uma row em `transactions`** (o ledger do KEYRA).

A divisão `.4a`/`.4b` foi recomendada pelo parecer `@architect` (achado A-4) justamente para que o gate financeiro `@finance-domain-expert` tenha uma story focada de revisar — e não fique diluído numa story XL que mistura UI leve com criação de ledger.

Esta story carrega **dois gates de especialista**: `@finance-domain-expert` (Valéria, obrigatório — toca `transactions`, coerência bruto/taxa/líquido) **e** o gate de anti-regressão **RSC G5** (a tela de revisão é um Client pesado: documento renderizado via signed URL + formulário `react-hook-form` + destaque de baixa confiança — exatamente a superfície de risco de `rsc-boundary-rules.md`).

Ponto financeiro central, levantado pelo parecer `@architect` (achado A-5): a coerência financeira de `debit`. O CHECK `transactions_amount_coherent` exige que para `debit` valha `fee_amount = 0 AND net_amount = gross_amount`. A IA pode extrair `fee > 0` num `debit` (leu um desconto no boleto). `confirmReceipt` **deve normalizar** com `Decimal.js` antes do `INSERT` — sem isso, o `INSERT` quebra no CHECK em runtime.

## Acceptance Criteria

### AC1 — Rota de revisão `app/(app)/financeiro/comprovantes/[id]/page.tsx`

1. Arquivo novo `apps/web/src/app/(app)/financeiro/comprovantes/[id]/page.tsx`, **Server Component** (`async`, `params` é `Promise` em Next 16).
2. A página chama uma Server Action `getReceiptForReview(id)` (criada nesta story) que: faz `requireAuth()` + `requireRole(orgId, 'professional')`; carrega a row `receipts` por `id` filtrando `org_id` (RLS reforça); gera **signed URL(s) de curta duração (≤ 60 s)** do(s) **artefato(s) normalizado(s)** no bucket privado `receipts` — `normalized.txt`, `normalized-p{n}.png` ou o `original.{ext}` quando este já é imagem segura (ver `comprovantes.2` AC5.6) — para renderizar o documento; retorna `ActionResult<ReceiptReviewData>`. Para PDF multipágina, `signedUrl` é uma lista (uma por página rasterizada).
3. `ReceiptReviewData` expõe: `id`, `status`, `signedUrl`, `normalizedKind` (`image` | `text`), `extractionData` (objeto extraído), `fieldConfidence` (confiança por campo crítico), `reviewedData` (se já houve revisão prévia), `transactionId` (se já confirmado).
4. Se o comprovante não estiver em `needs_review` (ex.: ainda `processing`, ou já `confirmed`/`rejected`), a página renderiza um estado informativo claro em pt-BR — não um formulário editável. Comprovante `confirmed` mostra link para a transação criada; `processing`/`pending` mostra "ainda estamos lendo este comprovante"; `failed` mostra a mensagem de falha e orientação para registro manual.
5. Falha de carregamento → `<ErrorMessage detail={result.error} />` dentro de um `Card` (padrão de `receitas/page.tsx`).

### AC2 — Tela de revisão: documento + campos editáveis lado a lado

1. Componente Client `apps/web/src/app/(app)/financeiro/comprovantes/[id]/review-form.tsx` com `'use client'` no topo.
2. **Documento renderizado** via signed URL — **sempre o artefato normalizado de `comprovantes.2`, nunca o arquivo original cru** (endereça o achado CMP-M2 da auditoria de compliance): `normalizedKind === 'image'` (foto, ou PDF já rasterizado em `.2` para `normalized-p{n}.png`) num `<img>`; `normalizedKind === 'text'` num bloco de texto rolável. Um PDF ou HTML potencialmente malicioso **nunca** é renderizado cru no navegador da usuária — `comprovantes.2` já o converteu em imagem/texto seguro. O documento fica **ao lado** dos campos no desktop e **acima** dos campos no mobile (tela única, sem navegação extra).
3. Formulário editável (`react-hook-form` + `zodResolver`, já dependências do projeto) com os campos do `reviewedData`: `direction` (`credit`/`debit`), `gross_amount`, `fee_amount`, `net_amount`, `reference_date`, `description`, `counterparty`, `suggested_category`. Valores monetários são editados como **string** (entram/saem como string — invariante #3 do projeto).
4. **Destaque de baixa confiança:** todo campo cujo `field_confidence` correspondente seja `< 0.75` recebe um destaque visual editorial (ex.: borda âmbar + microcopy "confira este campo") — não bloqueia, apenas chama a atenção. O limiar `0.75` **não é literal mágico no JSX**: é importado de uma constante nomeada de `lib/receipts/schema.ts` (criada por `comprovantes.3`; se ainda não existir no merge, esta story cria a constante e `comprovantes.3` a consome). Spec §7.
5. **Coerência financeira na UI:** quando `direction === 'debit'`, o campo `fee_amount` é **escondido/desabilitado** e o `net_amount` é **derivado** (igual ao `gross_amount`) — a usuária não confirma um estado incoerente. Quando `direction === 'credit'`, `fee_amount` é editável e `net_amount` é exibido como `gross − fee` recalculado ao vivo. O recálculo na UI usa `Decimal.js` de `lib/money.ts` (`toDecimal`, aritmética com `ROUND_HALF_EVEN`) — nunca `Number`.
6. Três ações na tela, cada uma cumprindo touch target 44×44 (G3): **"Salvar revisão"** (chama `saveReceiptReview`), **"Confirmar e registrar"** (chama `confirmReceipt`), **"Rejeitar"** (chama `rejectReceipt`, com confirmação para evitar clique acidental).
7. Toasts sonner para sucesso/erro; após `confirmReceipt`/`rejectReceipt`, `router.push('/financeiro/comprovantes')` de volta à lista.

### AC3 — Server Action `saveReceiptReview(receiptId, reviewedData)`

1. Em `app/(app)/financeiro/comprovantes/actions.ts` (mesmo arquivo de `listReceipts` de `.4a`). `'use server'`, `requireAuth()` no topo, `requireRole(orgId, 'professional')`.
2. `reviewedData` validado por um schema Zod (`lib/validators/receipt-review.ts`, criado nesta story) — direção, valores como string, data ISO, descrição.
3. Grava `receipts.reviewed_data`, `reviewed_by = user.id`, `reviewed_at = now()` — **sem criar transação**. Não muda o `status` (continua `needs_review`).
4. Filtra por `org_id` (RLS reforça); retorna `ActionResult<void>`.
5. Permite salvar rascunho parcial: a usuária pode salvar a revisão e voltar depois. `saveReceiptReview` não exige coerência financeira completa (essa validação dura é de `confirmReceipt`).

### AC4 — Server Action `confirmReceipt(receiptId)` — cria `transactions` (NÚCLEO FINANCEIRO)

1. `'use server'`, `requireAuth()` no topo, `requireRole(orgId, 'admin')` (criar lançamento no ledger é ação de admin — mesmo nível de `upsertExpense`).
2. Carrega a row `receipts`; valida que `status === 'needs_review'` e que `reviewed_data` está completo e coerente. Se `reviewed_data` estiver ausente/incompleto → `ActionResult` de erro claro ("revise os dados do comprovante antes de registrar").
3. **Normalização de coerência financeira com `Decimal.js`** (de `lib/money.ts`), espelhando o CHECK `transactions_amount_coherent`:
   - `credit`: `net = gross − fee` — **recalculado**, nunca confiando no `net` que veio da IA.
   - `debit`: **força `fee = 0` e `net = gross`**. Se o `reviewed_data` trouxer `fee > 0` num `debit`, o `fee` é absorvido no bruto (`gross` permanece o valor efetivamente pago) e `fee` zerado — a UI (AC2.5) já esconde `fee` em `debit`, então isso é a defesa de servidor. Sob nenhuma circunstância um `debit` insere `fee_amount > 0` em `transactions`.
4. Insere uma row em `transactions` com: `org_id`, `direction` (do `reviewed_data`), `gross_amount`/`fee_amount`/`net_amount` normalizados, `reference_date`, `description`, `expense_category_id`/`account_id` conforme aplicável, `origin = 'manual_income'` (se `credit`) ou `'manual_expense'` (se `debit`), `source_type = 'document'`, `source_id = receipt.id`, `created_by = user.id`.
   - ⚠️ `source_type = 'document'` exige a micro-migration aditiva do CHECK `transactions_source_type` (adicionando `'document'`) — **entregue por `comprovantes.1`** (parecer `@architect` B-1). Esta story **depende** dessa migration estar aplicada; o pre-flight confirma.
5. Após o `INSERT` bem-sucedido, atualiza `receipts.transaction_id` e `receipts.status = 'confirmed'`.
6. **Atomicidade:** a criação da `transaction` e a atualização do `receipts` ocorrem de forma que, se o `INSERT` em `transactions` falhar (ex.: violação de CHECK), `receipts` **não** muda de estado (continua `needs_review`) — preferir uma função RPC Postgres transacional `confirm_receipt_to_transaction`, ou, se feito em duas chamadas, com compensação explícita no `catch` (padrão do `onboarding/nova-organizacao`). A escolha é registrada em Dev Notes e revisada pelo gate `@finance-domain-expert`.
7. `revalidatePath('/financeiro')` + `revalidatePath('/financeiro/comprovantes')`. Retorna `ActionResult<{ transactionId: string }>`.

### AC5 — Server Action `rejectReceipt(receiptId)`

1. `'use server'`, `requireAuth()` no topo, `requireRole(orgId, 'professional')`.
2. Valida que `status` permite rejeição (`needs_review` ou `failed`); muda `receipts.status = 'rejected'`. **Nenhuma transação é criada.** `transaction_id` permanece `null`.
3. Filtra por `org_id`; `revalidatePath('/financeiro/comprovantes')`; retorna `ActionResult<void>`.
4. Rejeitar é reversível apenas re-anexando o comprovante — esta story não implementa "des-rejeitar" (fora de escopo).

### AC6 — Coerência financeira validada (Gate @finance-domain-expert)

1. Caso de teste documentado: comprovante `credit` com `gross="100.00"`, `fee="3.50"` → `transactions` registra `gross=100.00, fee=3.50, net=96.50`; soma fecha (NFR-FI-03).
2. Caso de teste documentado: comprovante `debit` cujo `reviewed_data` traz `fee="5.00"` → `transactions` registra `gross` (com o fee absorvido conforme AC4.3), `fee=0, net=gross`; o CHECK `transactions_amount_coherent` **não** é violado.
3. Caso de teste documentado: `confirmReceipt` sobre comprovante com `reviewed_data` incompleto → retorna erro, **nenhuma** transação criada, `receipts` permanece `needs_review`.
4. Aritmética monetária 100% via `Decimal.js` com `ROUND_HALF_EVEN` — grep confirmando ausência de `Number(...)` em cálculo de valor (apenas no `Intl.NumberFormat` da UI). Registrado em Dev Notes.
5. Gate `@finance-domain-expert *review-financial-logic` executado antes do QA gate; veredito (APPROVE/CONCERNS/REJECT) anexado ao Change Log.

### AC7 — Gate RSC G5 (RSC Boundary Audit) — OBRIGATÓRIO

1. Auditoria manual das 4 regras de `docs/dev/rsc-boundary-rules.md` registrada em Dev Notes antes de Done:
   - **Regra 1:** nenhum `forwardRef` (ícone Lucide, `Card`, `Button`) passado como prop de Server→Client. `review-form.tsx` (Client) recebe apenas dados serializáveis (`signedUrl`, objetos de dados, enums) — nunca componente como prop.
   - **Regra 2:** `review-form.tsx` (Client) **não importa** Server Component. Imports auditados: só Client Components, utilitários puros (`lib/money.ts` é puro — OK), tipos e validadores Zod.
   - **Regra 3:** `useSyncExternalStore` **não é usado**. Estado do formulário é `react-hook-form`; qualquer leitura assíncrona usa `useState + useEffect + queueMicrotask`.
   - **Regra 4:** smoke real ponta-a-ponta com a idealizadora em mobile real é critério de Done (ver DoD).
2. `./scripts/check-rsc-boundaries.sh` verde local + job `rsc-audit` do CI passa.
3. Decisão de fronteira documentada: `page.tsx` é Server (busca dados + gera signed URL — `admin`/`server-only` não é necessário, signed URL via cliente autenticado); `review-form.tsx` é a única ilha Client. As Server Actions são consumidas pelo Client via referência de função `'use server'` (serializável — padrão correto).

### AC8 — Gates G3 e G1

1. **G3 — Touch target:** os 3 botões de ação (Salvar, Confirmar, Rejeitar) e qualquer link cumprem `min-h-[44px]` AA. Greps registrados em Dev Notes:
   ```bash
   grep -rn 'min-h-\[44px\]' apps/web/src/app/\(app\)/financeiro/comprovantes/\[id\]
   grep -rn '<button\|<Link' apps/web/src/app/\(app\)/financeiro/comprovantes/\[id\]
   ```
2. **G1 — Princípios inegociáveis:** copy em números absolutos; nenhum percentual em label/alerta. **Exceção válida e explícita:** o `field_confidence` é exibido como destaque visual (borda + microcopy "confira este campo"), **não** como número percentual — a confiança orienta, não vira métrica na tela. Sem gráfico. Tela única. Grep:
   ```bash
   grep -rEn '\.toFixed\([0-9]+\)%|\* 100\)\.toFixed' apps/web/src/app/\(app\)/financeiro/comprovantes
   ```
   - **Esperado:** 0 matches.

### AC9 — Qualidade de build e tipos

1. `pnpm typecheck` passa sem erros.
2. `pnpm lint --max-warnings 0` passa.
3. `pnpm format:check` passa.
4. `confirmReceipt` usa os tipos de `transactions` e `receipts` de `database.types.ts` (regenerado por `comprovantes.1`).

### AC10 — Branch + commit + PR + CI + smoke + merge

1. Branch `feat/comprovantes-4b-revisao-registro` partindo de `main` atual.
2. Conventional commits em pt-BR, referenciando a story.
3. PR aberta com body estruturado + evidência do smoke mobile real (URL Sentry + confirmação da idealizadora).
4. CI checks PASS: `rsc-audit`, suíte RLS, build/deploy Vercel.
5. Após gate `@finance-domain-expert` APPROVE + gate RSC G5 + `@qa` PASS, merge squash em `main`.
6. Vercel prod deploy READY.
7. `docs/STATE.md` sincronizado refletindo `comprovantes.4b` Done.

## Tasks / Subtasks

- [ ] Pre-flight: confirmar `comprovantes.1` aplicada (micro-migration `transactions.source_type` com `'document'`; bucket `receipts`), `comprovantes.3` (`extraction_data` + `field_confidence` populados) e `comprovantes.4a` mergeada (rota `/financeiro/comprovantes` + `actions.ts` existem)
- [ ] Branch `feat/comprovantes-4b-revisao-registro` partindo de `main`
- [ ] **Gate G5 (pré-implementação):** ler `docs/dev/rsc-boundary-rules.md` (4 regras + checklist de PR)
- [ ] Criar `lib/validators/receipt-review.ts` (schema Zod do `reviewedData`, valores como string)
- [ ] Adicionar `getReceiptForReview(id)` em `comprovantes/actions.ts` (carrega row + gera signed URL ≤ 60 s)
- [ ] Criar `app/(app)/financeiro/comprovantes/[id]/page.tsx` (Server Component) — estados não-revisáveis tratados
- [ ] Criar `app/(app)/financeiro/comprovantes/[id]/review-form.tsx` (Client) — documento + campos editáveis, destaque `< 0.75`, coerência `debit` na UI
- [ ] Implementar `saveReceiptReview` (grava `reviewed_data`/`reviewed_by`/`reviewed_at`, sem transação)
- [ ] Implementar `confirmReceipt` — normalização `Decimal.js`, `INSERT` em `transactions` (`source_type='document'`), atualização atômica de `receipts`
- [ ] Implementar `rejectReceipt` — `status='rejected'`, sem transação
- [ ] Avaliar RPC transacional `confirm_receipt_to_transaction` vs duas chamadas com compensação; decidir e documentar
- [ ] **Gate @finance-domain-expert:** `*review-financial-logic` — coerência bruto/taxa/líquido, normalização `debit`, atomicidade; veredito no Change Log
- [ ] **Gate G5:** auditoria manual das 4 regras em Dev Notes + `./scripts/check-rsc-boundaries.sh` verde
- [ ] **Gate G3:** greps de touch target registrados
- [ ] **Gate G1:** grep de percentual (0 matches) registrado; exceção `field_confidence` documentada
- [ ] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `pnpm format:check` verdes
- [ ] QA self-gate (@qa)
- [ ] **Smoke real da idealizadora em mobile real (375px):** revisar uma foto de Pix recebido e um boleto pago, confirmar ambos, ver as `transactions` corretas no DRE; rejeitar um terceiro; confirmar zero issue novo no Sentry
- [ ] Commit final + push + PR open + CI verde + smoke prod + merge squash
- [ ] STATE.md sync

## Dependencies

- **Interna:**
  - `comprovantes.1` — **bloqueante.** Micro-migration aditiva do CHECK `transactions_source_type` (adicionando `'document'`); sem ela `confirmReceipt` quebra em runtime no CHECK (parecer `@architect` B-1). Também o bucket privado `receipts` e a RLS de storage para gerar signed URL.
  - `comprovantes.3` — **bloqueante.** Fornece `extraction_data` + `field_confidence` (limiar `0.75`) populados; sem extração não há o que revisar. Também a constante do limiar em `lib/receipts/schema.ts`.
  - `comprovantes.4a` — **bloqueante.** Rota `/financeiro/comprovantes`, `comprovantes/actions.ts` e o `ReceiptCard` clicável que leva a `/financeiro/comprovantes/[id]`.
- **Externa (idealizadora):** smoke test ponta-a-ponta em mobile real (Regra 4 do RSC) — Done não negociável.

## Definition of Done

- [ ] Todos os 10 ACs atendidos
- [ ] Rota `/financeiro/comprovantes/[id]` renderiza documento (signed URL) + campos editáveis; estados não-revisáveis tratados com copy clara
- [ ] Campos com `field_confidence < 0.75` destacados visualmente (limiar de constante nomeada, não literal)
- [ ] `saveReceiptReview` grava revisão sem criar transação
- [ ] `confirmReceipt` cria `transactions` correta (`source_type='document'`, `origin` conforme direção, coerência `Decimal.js`); `debit` força `fee=0, net=gross`; atualização de `receipts` atômica com o `INSERT`
- [ ] `rejectReceipt` marca `rejected` sem criar transação
- [ ] **Gate @finance-domain-expert APPROVE** — coerência bruto/taxa/líquido, normalização `debit`, atomicidade; 3 casos de teste de AC6 verdes
- [ ] **Gate G5:** 4 regras RSC auditadas e registradas; `check-rsc-boundaries.sh` verde local + CI
- [ ] **Gate G3:** touch target 44×44 nas 3 ações, greps registrados
- [ ] **Gate G1:** zero percentual em copy, zero gráfico, tela única; exceção `field_confidence` documentada
- [ ] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `pnpm format:check` verdes
- [ ] `@qa` PASS
- [ ] **Smoke real da idealizadora em mobile real** — revisar/confirmar uma foto de Pix e um boleto, ver as `transactions` no DRE; rejeitar um terceiro (6 marcadores do checklist da Regra 4 em `rsc-boundary-rules.md`) — URL Sentry no PR
- [ ] PR mergeado em `main`; Vercel prod deploy READY
- [ ] `docs/STATE.md` atualizado refletindo `comprovantes.4b` Done

## Dev Notes

### Por que esta story carrega o gate financeiro e a `.4a` não

A divisão `.4a`/`.4b` (parecer `@architect` A-4) isola superfícies de risco distintas. `.4a` é UI leve (lista + upload) — só gate RSC G5. `.4b` **cria `transactions`** — por isso `@finance-domain-expert` (Valéria) é obrigatório (EPIC §"Gates Phase 3.5 por story": `.4b` → Financial ✅, Compliance WAIVED, Data-engineer WAIVED). E como a tela de revisão é um Client pesado (documento + formulário), o gate RSC G5 também é obrigatório aqui. Dois gates de especialista numa story só — ainda assim cabe em L (8 pts) porque a UI leve já saiu em `.4a`.

### Coerência financeira de `debit` — a regra que evita quebra em runtime

O CHECK `transactions_amount_coherent` (migration `20260416001200_transactions.sql`) exige, para `debit`: `fee_amount = 0 AND net_amount = gross_amount`. O Zod schema de extração (`comprovantes.3`, spec §7) deixa a IA extrair `gross_amount`, `fee_amount` e `net_amount` como três campos independentes — a IA pode ler um "desconto" num boleto e colocá-lo em `fee_amount`. Se `confirmReceipt` apenas copiasse os três campos para `transactions`, o `INSERT` de um `debit` com `fee > 0` quebraria no CHECK (parecer `@architect` A-5).

Decisão desta story: `confirmReceipt` **normaliza** com `Decimal.js` antes do `INSERT`. Para `debit`, força `fee = 0` e `net = gross`; um `fee` extraído é absorvido no `gross` (o valor efetivamente pago). Para `credit`, recalcula `net = gross − fee` sempre — nunca confia no `net` da IA. A UI (`review-form.tsx`) já esconde o campo `fee` quando `direction === 'debit'` (AC2.5), então a normalização do servidor é a segunda linha de defesa. Espelha exatamente o que `upsertExpense` em `financeiro/actions.ts` já faz para despesa manual (`fee_amount: 0, net_amount: parsed.grossAmount`).

### `source_type = 'document'` — depende da micro-migration de `comprovantes.1`

O CHECK real de `transactions.source_type` aceita hoje apenas `('command','payment','invoice','manual','import')` — `'document'` **não existe** (parecer `@architect` B-1). `comprovantes.1` entrega a micro-migration aditiva (`DROP CONSTRAINT` + `ADD CONSTRAINT` com `'document'`). Esta story **assume** essa migration aplicada — o pre-flight confirma antes de implementar. Sem ela, `confirmReceipt` quebra no primeiro `INSERT`.

### Atomicidade da confirmação

`confirmReceipt` faz duas escritas: `INSERT` em `transactions` e `UPDATE` em `receipts` (`transaction_id` + `status='confirmed'`). Spec §3 Estágio 6 passo 5: "tudo em uma transação Postgres — se a inserção em `transactions` falhar, `receipts` não muda de estado". Preferir uma RPC Postgres `confirm_receipt_to_transaction(receipt_id)` `SECURITY INVOKER` (mantém RLS) que faça as duas escritas atomicamente — mais robusto que duas chamadas Supabase. Se a RPC for descartada por simplicidade, a alternativa é o padrão de compensação explícita do `onboarding/nova-organizacao` (delete compensatório no `catch`). A decisão final é registrada aqui e revisada pelo gate `@finance-domain-expert`.

### Decisão RSC: Server page + Client form único

Conforme `rsc-boundary-rules.md`:
- `[id]/page.tsx` — Server Component: `getReceiptForReview` busca a row e gera a signed URL server-side. A signed URL **nunca** é gerada no client.
- `[id]/review-form.tsx` — única ilha Client: precisa de `react-hook-form`, `onChange`, recálculo ao vivo, `router.push`. Recebe do Server apenas dados serializáveis (`signedUrl: string`, objetos de dados, enums). As 3 Server Actions são passadas/importadas como funções `'use server'` (serializáveis — padrão correto, não viola Regra 1).
- `lib/money.ts` é utilitário puro (sem JSX) — Client pode importá-lo livremente (não viola Regra 2).

### Signed URL fica server-side; o documento não vaza

A signed URL dá acesso a um documento com dado financeiro/PII. Ela é gerada no Server Component e passada ao Client apenas para renderizar o `<img>`/texto na tela da própria usuária autenticada — expira em ≤ 60 s. Esta story **não** envia signed URL a terceiros (isso é assunto da extração em `comprovantes.3`). Sem necessidade de gate `@compliance-br` aqui (EPIC marca Compliance WAIVED para `.4b`), mas a curta expiração é mantida por disciplina.

### Padrões a seguir

- Server Actions: `ActionResult<T>` discriminado + `toError()` + `requireAuth()`/`requireRole()` no topo — exatamente como `financeiro/actions.ts`. `confirmReceipt` usa `requireRole('admin')` (criar ledger), `saveReceiptReview`/`rejectReceipt` usam `requireRole('professional')`.
- `INSERT` em `transactions`: payload espelha o de `upsertExpense` (`origin`, `fee_amount`, `net_amount`, `created_by`) — acrescentando `source_type='document'` e `source_id`.
- Aritmética monetária: `Decimal.js` de `lib/money.ts` (`toDecimal`, `.minus()`, `.plus()`) com `ROUND_HALF_EVEN` — strings no boundary, `Number` só no `Intl.NumberFormat`.

## QA Results

_(a preencher pelo @qa após implementação)_

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-18 | 1.0 | Story criada (Draft). Escopo: estágios 5-6 do EPIC-COMPROVANTES — tela de revisão (`[id]/page.tsx` + `review-form.tsx`, documento via signed URL + campos editáveis, destaque `field_confidence < 0.75`) e 3 Server Actions (`saveReceiptReview`, `confirmReceipt`, `rejectReceipt`). `confirmReceipt` cria `transactions` com `source_type='document'` + normalização de coerência financeira `Decimal.js` (para `debit` força `fee=0, net=gross`). Metade `.4b` da divisão de `.4` (parecer `@architect` A-4). Gates: `@finance-domain-expert` (obrigatório, toca `transactions`/coerência — parecer A-5) + RSC G5 (Client pesado) + G3 + G1. Depende de `.1` (micro-migration `source_type`), `.3` (extração + `field_confidence`) e `.4a` (rota + `actions.ts`). Smoke mobile real (Pix + boleto virando transações no DRE) como Done não negociável. | `@sm` (River) |
| 2026-05-18 | 1.1 | **@po validou 10/10 — veredito GO.** Checklist de 10 pontos integralmente atendido: título claro; descrição com núcleo financeiro e os dois gates explicados; 10 ACs testáveis, AC6 com 3 casos de teste financeiros concretos (credit, debit com fee, reviewed_data incompleto); escopo IN/OUT explícito (extração em `.3`, "des-rejeitar" fora); dependências `.1`/`.3`/`.4a` mapeadas como bloqueantes; T-shirt L (~8 pts) coerente; valor de negócio claro; riscos documentados (coerência `debit`, atomicidade, micro-migration); DoD completo; alinhamento fiel à SPEC §3/§7/§8. **Verificação cruzada com o schema real:** o CHECK `transactions_amount_coherent` (`20260416001200_transactions.sql:53`) exige para `debit` exatamente `fee_amount=0 AND net_amount=gross_amount` — a normalização da AC4.3 está tecnicamente correta; e o CHECK `transactions_source_type` (linha 41) de fato NÃO aceita `'document'` hoje, confirmando a dependência bloqueante da micro-migration de `.1`. **Gate financeiro** (`@finance-domain-expert`) reconhecido — AC6 dedicado, `*review-financial-logic` na task list/DoD, veredito no Change Log. **Destaque de `field_confidence < 0.75`** presente nos ACs (AC2.4, AC8.2) com limiar como constante nomeada e exibição visual (não percentual — exceção G1 documentada). **Gate G5 (RSC Boundary)** reconhecido — AC7 dedicado. Gates G3/G1 com ACs próprios. Concern não-bloqueante propagado para @dev: AC4.6 deixa a escolha RPC-transacional vs compensação explícita em aberto — o @dev deve fechar e documentar essa decisão **antes** do gate `@finance-domain-expert`, não depois. Status Draft → Ready. | `@po` (Pax) |
| 2026-05-18 | 1.2 | **Auditoria de consolidação (`@aiox-master`/Orion).** AC1.2 e AC2.2 ajustados para endereçar o achado **CMP-M2** da auditoria de compliance, que ficou órfão quando a story `.4` foi dividida em `.4a`/`.4b` (a auditoria §5 apontava genericamente "`comprovantes.4`"). A tela de revisão agora renderiza **sempre o artefato normalizado de `comprovantes.2`** (imagem rasterizada ou texto), **nunca o arquivo original cru** — um PDF/HTML potencialmente malicioso não chega cru ao navegador. `signedUrl` passa a poder ser lista (PDF multipágina). Auditoria de compliance §5 atualizada (`comprovantes.4` → `comprovantes.4b`). Sem mudança de pontos; ACs reforçados. Story permanece Ready. | `@aiox-master` (Orion) |
