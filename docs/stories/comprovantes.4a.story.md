# Story comprovantes.4a: UI de lista de comprovantes + fluxo de upload universal + componente ReceiptCard

## Status

Ready

## Story

**Como** Camila, dona de uma clínica de estética que usa o KEYRA,
**Eu quero** uma tela onde eu anexo qualquer comprovante (foto, print, PDF ou documento) num único campo de upload e vejo, numa lista, todos os comprovantes que já anexei com o estado real de cada um (processando, aguardando revisão, registrado, rejeitado, falhou),
**Para que** eu saiba a qualquer momento o que o sistema está lendo, o que já está pronto para eu revisar e o que precisa da minha atenção — sem precisar adivinhar nem ficar com um spinner eterno na tela.

## Complexidade

**T-shirt:** M (~6 pontos)

## Contexto

Esta story entrega a **superfície leve** do EPIC-COMPROVANTES (a "fronteira de UI" do pipeline), sem nenhuma lógica financeira. É a metade `.4a` da divisão da story `.4` original (XL) — divisão recomendada pelo parecer `@architect` (achado A-4) justamente para isolar o gate RSC G5 do gate financeiro `@finance-domain-expert`. A criação de `transactions` e a tela de revisão ficam inteiramente em `comprovantes.4b`.

O escopo aqui é: (1) a rota de lista `app/(app)/financeiro/comprovantes/page.tsx` como Server Component; (2) o fluxo de upload — um campo único universal que aceita qualquer arquivo, sem a usuária escolher tipo ou MIME (princípio UX inegociável do epic: "anexar é uma ação, não um formulário"); (3) o componente `components/keyra/ReceiptCard.tsx` que exibe o estado de cada comprovante.

A Server Action `uploadReceipt` é entregue por `comprovantes.2` (ingestão/normalização) — esta story **consome** `uploadReceipt`, não a implementa. Esta story também **não** depende da extração da IA estar pronta: a lista renderiza qualquer `receipts` independente do `status`.

`.4a` toca `app/(app)/**`, adiciona `'use client'` boundary e cria componente em `components/keyra/**` — portanto **o gate RSC G5 é obrigatório** (4 regras de `docs/dev/rsc-boundary-rules.md`), assim como G3 (touch target 44×44) e G1 (princípios inegociáveis).

## Acceptance Criteria

### AC1 — Rota de lista `app/(app)/financeiro/comprovantes/page.tsx` (Server Component)

1. Arquivo novo `apps/web/src/app/(app)/financeiro/comprovantes/page.tsx`, **Server Component** (sem `'use client'` no topo), seguindo o padrão de `financeiro/receitas/page.tsx` (página `async`, `requireAuth` indireto via Server Action, `Card`/`CardHeader`/`CardContent`).
2. A página chama uma Server Action `listReceipts()` (criada nesta story em `comprovantes/actions.ts`) que retorna `ActionResult<{ rows: ReceiptListRow[] }>` — mesmo `ActionResult<T>` discriminado já usado em `financeiro/actions.ts`.
3. `listReceipts` faz `requireAuth()` no topo, `requireRole(orgId, 'viewer')`, e consulta `receipts` filtrando `org_id` (RLS reforça) + `deleted_at IS NULL`, ordenado por `created_at DESC`. Seleciona apenas as colunas que a UI exibe — **nunca** `extraction_data`, `extraction_raw_text` nem `reviewed_data` (minimização: a lista não precisa do conteúdo extraído).
4. `ReceiptListRow` expõe: `id`, `status`, `original_filename`, `mime_type`, `file_size_bytes`, `created_at`, `transaction_id`. Valores monetários **não** aparecem na lista (eles vivem na tela de revisão `.4b`).
5. Em caso de `result.ok === false`, a página renderiza `<ErrorMessage detail={result.error} />` dentro de um `Card` — mesmo padrão de `receitas/page.tsx`.
6. Lista vazia (org sem nenhum comprovante) renderiza `<EmptyState>` de `components/keyra` com `icon` (Lucide, ex.: `ReceiptText`), título e descrição em pt-BR orientando o próximo passo ("Anexe o primeiro comprovante — uma foto de Pix, um boleto, uma nota fiscal").
7. A página é registrada no AppShell como rota autenticada sob `/financeiro` (segue o agrupamento `(app)` existente; sem mudança de layout).

### AC2 — Fluxo de upload: campo único universal

1. Componente Client `apps/web/src/app/(app)/financeiro/comprovantes/upload-form.tsx` com `'use client'` no topo.
2. **Um único `<input type="file">`** que aceita qualquer arquivo — sem restrição de `accept` por tipo (a normalização é responsabilidade do servidor; a usuária não escolhe MIME). Aceita também `<input>` por clique e área de arrastar-e-soltar (drag-and-drop), ambos opcionais mas o clique é obrigatório.
3. Ao selecionar um arquivo, o form invoca a Server Action `uploadReceipt(formData)` — **entregue por `comprovantes.2`**, apenas consumida aqui. Se `comprovantes.2` ainda não tiver mergeado quando `.4a` for implementada, a story usa um stub tipado de `uploadReceipt` com a mesma assinatura, documentado na File List, e a integração real fecha no merge.
4. Enquanto o upload está em voo, o botão fica em estado `disabled` com texto "Enviando..." (sonner toast no sucesso/erro — `toast` já é dependência do projeto).
5. Após `uploadReceipt` retornar `ok`, o form chama `router.refresh()` para a lista (Server Component) re-renderizar com o novo `receipts` em `status='pending'`.
6. Erros (`result.ok === false`) são exibidos via `toast.error(result.error)` — copy em pt-BR, sem jargão técnico.
7. Validação client-side **leve e amistosa**: tamanho máximo verificado contra um teto exibido na UI ("até 10 MB") **antes** de chamar a action, com mensagem clara se exceder. A validação dura (magic bytes, hash, limite real) é do servidor — esta é só cortesia de UX.

### AC3 — Componente `components/keyra/ReceiptCard.tsx`

1. Arquivo novo `apps/web/src/components/keyra/ReceiptCard.tsx`, exportado por `components/keyra/index.ts` junto com seu tipo `ReceiptCardProps` (mesmo padrão de `StatusBadge`, `KPICard`).
2. Props: `{ id: string; status: ReceiptStatus; filename: string; mimeLabel: string; createdAtLabel: string; href?: string }` — onde `ReceiptStatus = 'pending' | 'processing' | 'needs_review' | 'confirmed' | 'rejected' | 'failed'` (espelha o CHECK de `receipts.status` da spec §4).
3. O card exibe: nome do arquivo, um rótulo amistoso do tipo de documento, a data de envio (já formatada em pt-BR pelo chamador via `date-fns`) e um **badge de estado**.
4. O badge de estado usa o primitivo `<StatusBadge>` existente. Como os 6 estados de `receipts` **não estão** no enum `StatusKind` atual de `StatusBadge`, esta story estende `StatusBadge.tsx`: adiciona um novo grupo `ReceiptStatus` (pt-BR: `processando`, `aguardando-revisao`, `registrado`, `rejeitado`, `falhou`, `na-fila`) ao `STATUS` record + um helper de tradução `receiptStatusToBadge(status)` (banco em inglês → `StatusKind` pt-BR), seguindo exatamente o padrão dos helpers `appointmentStatusToBadge`/`commandStatusToBadge` já no arquivo. Ícone + texto sempre (CON-UX-01 + WCAG).
5. **Estado honesto:** cada estado tem copy própria e clara. `pending`/`processing` → "processando" (sem prometer "pronto"); `needs_review` → "aguardando revisão" e o card é clicável; `confirmed` → "registrado"; `rejected` → "rejeitado"; `failed` → "falhou".
6. Quando `status === 'needs_review'` **e** `href` é fornecido, o card inteiro é um alvo clicável (`<Link>`) que leva à tela de revisão `/financeiro/comprovantes/[id]` — a tela em si é entregue por `.4b`; aqui só o link existe. Nos demais estados o card **não** é clicável (`confirmed` pode opcionalmente linkar para a transação resultante, mas isso é fora de escopo aqui).
7. O elemento clicável cumpre **touch target 44×44** (`min-h-[44px]` AA — G3). Quando não-clicável, é um `<div>` estático sem área interativa.
8. Visual alinhado ao Editorial Beauty Luxury: usa `Card`/`CardContent` de `components/ui`, tipografia e tokens semânticos do design system (sem cor hex crua). Sem gráfico, sem percentual.

### AC4 — Renderização da lista com `ReceiptCard`

1. `page.tsx` mapeia `rows` para uma lista de `<ReceiptCard>`, agrupada ou ordenada de forma que os comprovantes que **precisam de ação** (`needs_review`, `failed`) fiquem visualmente acessíveis no topo — sem gráfico, sem contadores percentuais; se houver agrupamento, usa rótulos textuais ("Aguardando sua revisão", "Processando", "Registrados").
2. A lista respeita a **Lei da Densidade Proporcional** — o grid de cards não termina com órfãos (consultar `DESIGN.md` §9.bis / tabela canônica de colunas por contagem de itens); usar o CSS anti-órfão padrão do projeto.
3. `mimeLabel` é derivado do `mime_type` por um pequeno mapa em pt-BR (`image/jpeg` → "Foto", `application/pdf` → "PDF", `text/plain` → "Texto", etc.) — função pura, sem `'use client'`, reutilizável; tipo desconhecido cai em "Documento".
4. `createdAtLabel` é formatado com `date-fns` + locale `ptBR` no Server Component (ex.: "enviado há 2 horas" ou data curta) — formatação no servidor, `ReceiptCard` recebe a string pronta.

### AC5 — Gate RSC G5 (RSC Boundary Audit) — OBRIGATÓRIO

1. Auditoria manual das 4 regras de `docs/dev/rsc-boundary-rules.md` registrada na seção Dev Notes desta story antes de marcar Done:
   - **Regra 1:** nenhum `forwardRef` (ícone Lucide, `Card`, `Button`) é passado como **prop** de Server Component para Client Component. `EmptyState` recebe `icon` no Server Component (uso server-safe, não cruza fronteira). `ReceiptCard`, se for Client, recebe apenas dados serializáveis (strings, enum) — **nunca** um componente como prop.
   - **Regra 2:** o Client Component `upload-form.tsx` **não importa** nenhum Server Component. Imports auditados: só Client Components, utilitários puros e tipos.
   - **Regra 3:** `useSyncExternalStore` **não é usado** em nenhum arquivo desta story. Estado de upload usa `useState` simples; se algum efeito de borda precisar de leitura assíncrona, usa `useState + useEffect + queueMicrotask`.
   - **Regra 4:** smoke real ponta-a-ponta com a idealizadora em mobile real é critério de Done (ver DoD).
2. `./scripts/check-rsc-boundaries.sh` roda localmente e **verde** antes do commit; o job `rsc-audit` do workflow `rls-tests.yml` passa no CI.
3. Decisão explícita e documentada em Dev Notes: `ReceiptCard` é **Server Component** quando não-clicável, e a versão clicável usa `<Link>` (Server-safe). Se a implementação concluir que precisa ser Client, justificar e re-auditar a Regra 1.

### AC6 — Gates G3 e G1

1. **G3 — Touch target:** todo elemento clicável criado (botão de upload, área de drop, `ReceiptCard` clicável, qualquer link de ação) cumpre `min-h-[44px]` AA. Greps de validação rodados e registrados em Dev Notes:
   ```bash
   grep -rn 'min-h-\[44px\]' apps/web/src/app/\(app\)/financeiro/comprovantes
   grep -rn '<button\|<Link' apps/web/src/app/\(app\)/financeiro/comprovantes apps/web/src/components/keyra/ReceiptCard.tsx
   ```
2. **G1 — Princípios inegociáveis:** copy da UI usa números absolutos; nenhum percentual em label, badge ou alerta. Sem gráfico. Tela única (lista + upload na mesma rota, revisão em rota própria de `.4b`). Grep de validação:
   ```bash
   grep -rEn '\.toFixed\([0-9]+\)%|\* 100\)\.toFixed' apps/web/src/app/\(app\)/financeiro/comprovantes
   ```
   - **Esperado:** 0 matches.

### AC7 — Qualidade de build e tipos

1. `pnpm typecheck` passa sem erros (modo estrito, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
2. `pnpm lint --max-warnings 0` passa (zero warnings).
3. `pnpm format:check` passa.
4. Se a tabela `receipts` já estiver no `database.types.ts` (regenerado por `comprovantes.1`), `listReceipts` usa os tipos gerados; caso contrário, a story documenta a dependência e usa tipos locais provisórios até `comprovantes.1` mergear.

### AC8 — Branch + commit + PR + CI + smoke + merge

1. Branch `feat/comprovantes-4a-lista-upload` partindo de `main` atual.
2. Conventional commits em pt-BR, referenciando a story.
3. PR aberta com body estruturado, incluindo a evidência do smoke mobile real (URL Sentry + confirmação da idealizadora) anexada na descrição.
4. CI checks PASS: `rsc-audit`, suíte RLS, build/deploy Vercel.
5. Após gate RSC G5 + `@qa` PASS, merge squash em `main`.
6. Vercel prod deploy READY.
7. `docs/STATE.md` sincronizado refletindo `comprovantes.4a` Done.

## Tasks / Subtasks

- [ ] Pre-flight: confirmar status de `comprovantes.1` (tabela `receipts` + bucket) e `comprovantes.2` (`uploadReceipt`); decidir se `.4a` integra direto ou usa stub tipado de `uploadReceipt`
- [ ] Branch `feat/comprovantes-4a-lista-upload` partindo de `main`
- [ ] **Gate G5 (pré-implementação):** ler `docs/dev/rsc-boundary-rules.md` (4 regras + checklist de PR) antes de escrever qualquer componente
- [ ] Criar `app/(app)/financeiro/comprovantes/actions.ts` com `listReceipts()` (`requireAuth` + `requireRole('viewer')` + `ActionResult<T>`; seleciona só colunas da UI, nunca conteúdo extraído)
- [ ] Criar `app/(app)/financeiro/comprovantes/page.tsx` como Server Component (lista + `EmptyState` + `ErrorMessage`, padrão de `receitas/page.tsx`)
- [ ] Criar `app/(app)/financeiro/comprovantes/upload-form.tsx` (Client) — campo único universal, consome `uploadReceipt`, `router.refresh()`, toasts sonner
- [ ] Criar `components/keyra/ReceiptCard.tsx` + exportar em `components/keyra/index.ts`
- [ ] Estender `components/keyra/StatusBadge.tsx`: grupo `ReceiptStatus` no record `STATUS` + helper `receiptStatusToBadge`
- [ ] Função pura `mimeLabel` (mime_type → rótulo pt-BR) e formatação `createdAtLabel` via `date-fns` no Server Component
- [ ] Aplicar Lei da Densidade Proporcional ao grid de cards (CSS anti-órfão)
- [ ] Registrar a rota no AppShell como rota autenticada sob `/financeiro`
- [ ] **Gate G5:** auditoria manual das 4 regras documentada em Dev Notes + `./scripts/check-rsc-boundaries.sh` verde
- [ ] **Gate G3:** greps de touch target rodados e registrados em Dev Notes
- [ ] **Gate G1:** grep de percentual rodado (0 matches) e registrado em Dev Notes
- [ ] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `pnpm format:check` verdes
- [ ] QA self-gate (@qa)
- [ ] **Smoke real da idealizadora em mobile real (375px):** anexar uma foto e ver o `ReceiptCard` aparecer com estado correto; tocar a lista; confirmar zero issue novo no Sentry
- [ ] Commit final + push + PR open + CI verde + smoke prod + merge squash
- [ ] STATE.md sync

## Dependencies

- **Interna:** `comprovantes.1` (tabela `receipts` + bucket + RLS + `database.types.ts` regenerado) — **bloqueante** para `listReceipts` consultar `receipts`. `comprovantes.2` (`uploadReceipt`) — necessária para o upload funcionar de verdade; se não estiver pronta, a story usa stub tipado e fecha a integração no merge.
- **Externa (idealizadora):** smoke test ponta-a-ponta em mobile real (Regra 4 do RSC) — critério de Done não negociável.

## Definition of Done

- [ ] Todos os 8 ACs atendidos
- [ ] Rota `/financeiro/comprovantes` renderiza a lista (Server Component) com `EmptyState` quando vazia e `ErrorMessage` em falha
- [ ] Upload de campo único universal funciona ponta-a-ponta (consumindo `uploadReceipt`); novo `receipts` aparece em `pending` após `router.refresh()`
- [ ] `ReceiptCard` exibe os 6 estados com copy honesta; `needs_review` clicável (44×44), demais não-clicáveis
- [ ] `StatusBadge` estendido com grupo `ReceiptStatus` + helper `receiptStatusToBadge`
- [ ] **Gate G5:** 4 regras RSC auditadas e registradas; `check-rsc-boundaries.sh` verde local + CI
- [ ] **Gate G3:** touch target 44×44 em todos os clicáveis, greps registrados
- [ ] **Gate G1:** zero percentual em copy, zero gráfico, tela única — grep registrado
- [ ] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `pnpm format:check` verdes
- [ ] `@qa` PASS
- [ ] **Smoke real da idealizadora em mobile real** confirmando lista e upload (6 marcadores do checklist da Regra 4 em `rsc-boundary-rules.md`) — URL Sentry como evidência no PR
- [ ] PR mergeado em `main`; Vercel prod deploy READY
- [ ] `docs/STATE.md` atualizado refletindo `comprovantes.4a` Done
- [ ] Nenhuma lógica financeira nesta story — criação de `transactions` e tela de revisão são responsabilidade exclusiva de `comprovantes.4b`

## Dev Notes

### Por que `.4a` existe separada de `.4b`

A story `comprovantes.4` original era XL (13 pts) e empacotava lista + upload + tela de revisão (Client pesado) + 3 Server Actions financeiras — exatamente a superfície Server↔Client onde o Dashboard quebrou em produção por mais de 1 hora (`docs/dev/rsc-boundary-rules.md`). O parecer `@architect` (achado A-4) recomendou a divisão para isolar o gate RSC G5 (esta story, `.4a`, superfície leve) do gate financeiro `@finance-domain-expert` (`.4b`, registro no ledger). Esta story **não cria transação nenhuma** e **não toca dinheiro** — por isso `@finance-domain-expert` e `@compliance-br` estão WAIVED para ela (ver EPIC §"Gates Phase 3.5 por story"). O único gate de especialista aqui é o RSC G5.

### Decisão RSC: Server outer + Client inner

O padrão correto para esta tela, conforme `rsc-boundary-rules.md` (opção A — Server outer + Client inner):
- `page.tsx` — Server Component, busca dados, renderiza a lista de `ReceiptCard`.
- `upload-form.tsx` — Client Component isolado (precisa de `useState`, `onChange`, `router.refresh`). É a única "ilha cliente".
- `ReceiptCard.tsx` — preferir **Server Component**. Ele só renderiza dados serializáveis e usa `<Link>` (Server-safe) para o estado `needs_review`. Não há handler de clique JS — navegação é via `<Link>`. Se a implementação concluir que precisa ser Client (ex.: animação `framer-motion` como `StatusBadge`), então `ReceiptCard` recebe apenas strings/enums como props — **nunca** um ícone Lucide ou componente como prop (Regra 1). `StatusBadge` já é `'use client'` e renderiza o próprio ícone internamente — `ReceiptCard` passa só o `StatusKind`, não o ícone.

### Por que o campo de upload é único e sem `accept`

Princípio UX do epic (EPIC §"Princípios UX inegociáveis"): "Anexar é uma ação, não um formulário. Um único campo de upload que aceita qualquer arquivo — a usuária não escolhe tipo, não preenche MIME, não decide nada técnico." A validação de MIME real é feita no servidor por magic bytes (`comprovantes.2`). Restringir `accept` no client daria falsa sensação de segurança e bloquearia formatos legítimos (HEIC de iPhone, por exemplo, que alguns browsers reportam mal).

### Estado honesto — sem spinner eterno

O EPIC exige "estado honesto: cada comprovante mostra seu estado real — sem spinner eterno nem falso 'pronto'". O `ReceiptCard` deve refletir o `status` da row do banco fielmente. Comprovantes presos em `pending`/`processing` (risco real do `next/after`, parecer `@architect` A-2) terão uma ação "reprocessar" — mas essa ação e o cron sweep são entregues por `comprovantes.3`; esta story apenas exibe o estado fielmente, sem mascarar.

### `StatusBadge` — extensão, não invenção

`StatusBadge.tsx` já é a tag semântica universal da KEYRA (Story 5.1 consolidou 8 mapas inline num componente). A extensão segue o padrão exato existente: novo grupo no `Record<StatusKind, ...>` + helper de tradução `receiptStatusToBadge` espelhando `commandStatusToBadge`. Tokens de cor já presentes no arquivo (`bg-success-leaf/20 text-success-deep` para `registrado`, `bg-amber-300/40` para estados intermediários, `bg-rust-800/15 text-rust-800` para `falhou`/`rejeitado`) — reutilizar, não inventar cor nova.

### Padrões a seguir

- Server Action: `ActionResult<T>` discriminado + `toError()` + `requireAuth()`/`requireRole()` no topo, exatamente como `financeiro/actions.ts`.
- Página: `async` Server Component com `Card`/`CardHeader`/`CardContent`, `EmptyState`/`ErrorMessage` de `components/keyra`, como `receitas/page.tsx`.
- Sem `Number` para valores monetários (invariante #3) — embora esta story quase não toque dinheiro, `file_size_bytes` é um `bigint` simples e pode usar `Number` para exibir tamanho (não é dinheiro).

## QA Results

_(a preencher pelo @qa após implementação)_

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-18 | 1.0 | Story criada (Draft). Escopo: superfície leve do EPIC-COMPROVANTES — rota de lista (Server Component), fluxo de upload de campo único universal, componente `ReceiptCard` + extensão de `StatusBadge`. Metade `.4a` da divisão de `.4` recomendada pelo parecer `@architect` (A-4) para isolar o gate RSC G5 do gate financeiro. Gates: RSC G5 (obrigatório), G3 (touch target), G1 (princípios). Sem lógica financeira — `@finance-domain-expert` e `@compliance-br` WAIVED. ACs cobrem consumo de `uploadReceipt` (entregue por `.2`), os 6 estados de `receipts`, smoke mobile real como Done não negociável. | `@sm` (River) |
| 2026-05-18 | 1.1 | **@po validou 10/10 — veredito GO.** Checklist de 10 pontos integralmente atendido: título claro; descrição com problema/fronteira explícitos; 8 ACs testáveis com greps de validação; escopo IN/OUT explícito (lógica financeira fora — em `.4b`); dependências `.1`/`.2` mapeadas com fallback de stub tipado; T-shirt M (~6 pts) coerente com o EPIC; valor de negócio claro (visibilidade do estado real, sem spinner eterno); riscos documentados (estados presos do `next/after`, decisão RSC Server-outer/Client-inner); DoD com 13 marcadores; alinhamento fiel ao EPIC §11 e SPEC §11. **Gate G5 (RSC Boundary)** reconhecido na story — AC5 dedicado, `check-rsc-boundaries.sh` exigido local + CI, decisão de fronteira documentada em Dev Notes. Gates G3/G1 com ACs próprios. Concern não-bloqueante propagado para @dev: AC4.1 ("agrupada ou ordenada") tem leve ambiguidade — resolver pelo padrão de Densidade Proporcional/`DESIGN.md` §9.bis na implementação. Status Draft → Ready. | `@po` (Pax) |
