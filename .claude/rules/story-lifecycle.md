---
paths:
  - "docs/stories/**"
  - ".aiox-core/development/**"
---

# Story Lifecycle — Detailed Rules

## Status Progression

```
Draft → Ready → InProgress → InReview → Done
```

| Status | Trigger | Agent | Action |
|--------|---------|-------|--------|
| Draft | @sm creates story | @sm | Story file created |
| Ready | @po validates (GO) | @po | **MUST update status field in story file from Draft → Ready** |
| InProgress | @dev starts implementation | @dev | Update status field |
| InReview | @dev completes, @qa reviews | @qa | Update status field |
| Done | @qa PASS, @devops pushes | @devops | Update status field |

**CRITICAL:** The `Draft → Ready` transition is the responsibility of @po during `*validate-story-draft`. When verdict is GO (including conditional GO after fixes are applied), @po MUST update the story's Status field to `Ready` and log the transition in the Change Log. A story left in `Draft` after a GO verdict is a process violation.

## Phase 1: Create (@sm)

**Task:** `create-next-story.md`
**Inputs:** PRD sharded, epic context
**Output:** `{epicNum}.{storyNum}.story.md`

## Phase 2: Validate (@po)

**Task:** `validate-next-story.md`

### 10-Point Validation Checklist

1. Clear and objective title
2. Complete description (problem/need explained)
3. Testable acceptance criteria (Given/When/Then preferred)
4. Well-defined scope (IN and OUT clearly listed)
5. Dependencies mapped (prerequisite stories/resources)
6. Complexity estimate (points or T-shirt sizing)
7. Business value (benefit to user/business clear)
8. Risks documented (potential problems identified)
9. Criteria of Done (clear definition of complete)
10. Alignment with PRD/Epic (consistency with source docs)

**Decision:** GO (≥7/10) or NO-GO (<7/10 with required fixes)

## Phase 2.5: Anti-Regression Gates (KEYRA — Story 6.0+)

**Origem:** Story 6.0 (2026-05-02) — auditoria `@baziotti` `docs/ux/audit-2026-05-02-pre-motion.md` identificou 4 issues HIGH (regressões e furos sistêmicos) cuja raiz comum era **falta de gates automáticos cross-cutting** durante o draft das stories. Esta phase instaura prevenção permanente.

Antes de qualquer story sair de `Ready` para `InProgress`, o `@sm` (durante draft) ou `@dev` (no início da implementação) executa 4 gates automáticos baseados no escopo da story. **Gate failure NUNCA é silencioso** — se passou, é porque foi rodado e zerado.

### G1 — Princípios inegociáveis (KEYRA)

**Trigger:** Story toca copy, alertas, dashboard, comparativos, ou qualquer texto visível à persona.

**Verificação (greps automáticos antes da implementação):**

```bash
grep -rEn '\.toFixed\([0-9]+\)%|\* 100\)\.toFixed' apps/web/src/app
```

- **Esperado:** 0 matches novos em copy de alertas/labels/comparativos.
- **Exceção válida:** ratios analíticos (ex.: coluna `% sobre receita` no DRE — decisão registrada da idealizadora). Story explicita a exceção.
- **Auditoria manual:** copy passa pelo princípio "números absolutos, sem percentual" (CON-UX-01)?

### G2 — Inventário de tokens

**Trigger:** Story toca cor, spacing, tipografia, ou qualquer token semântico do design system.

**Verificação (ANTES de escrever os ACs, rodar grep no codebase inteiro):**

```bash
# Exemplo: migrar `text-emerald-700` → `text-lucro`
grep -rn 'text-emerald-700' apps/web/src
```

- Story lista TODAS as ocorrências do padrão antigo.
- Story explicita: sweep **completo** (todas as ocorrências) ou **parcial** (subset com justificativa explícita).
- Sweep parcial requer documento "Out of Scope" listando o que fica de fora e por quê (ex.: badge categórico vs valor financeiro).

### G3 — Touch target AA (44×44 mínimo)

**Trigger:** Story cria componente clicável novo (button, link, card-clicável, secondaryAction, etc.).

**Verificação:**

- Componente cumpre `min-h-[44px]` AA do W3C/Apple HIG **OU** tem **waiver explícito da idealizadora** documentado no Change Log da story.
- **"Decisão deliberada para reduzir proeminência" NÃO é razão suficiente** sem ancoragem em pesquisa (Apple HIG, Material, NN/g) ou validação direta com a persona. Hierarquia de proeminência é alcançada por cor/contraste/posição, não por reduzir área clicável.
- Greps de validação:

```bash
grep -rn 'min-h-\[44px\]' apps/web/src/components/keyra
grep -rn '<button\|<Link' {arquivo-novo}
```

### G4 — Fonte única real

**Trigger:** Story diz "X é fonte única" (ex.: AlertCard como fonte única de warning visual; tokens de spacing como fonte única de padding em Card).

**Verificação:** Grep do padrão antigo em **TODO codebase**, não só no arquivo refatorado:

```bash
# Exemplo: AlertCard fonte única → buscar alertas inline crus
grep -rEn 'bg-(amber|red|yellow)-(50|100)' apps/web/src/app
```

- Se a story consolida em `<X>`, todas as ocorrências do padrão antigo migram **OU** ficam explicitamente fora de escopo no documento.
- "Refatoramos só o `AlertasCard`" não é fonte única — é refatoração local. Fonte única exige sweep total.

### G5 — RSC Boundary Audit (instaurado 2026-05-02)

**Trigger:** Story toca **qualquer um** dos itens abaixo:

- `apps/web/src/app/(app)/**` (rotas autenticadas)
- `'use client'` boundary (qualquer adição/remoção)
- `apps/web/src/components/keyra/**` ou `components/ui/**`
- `apps/web/src/lib/hooks/**`
- `apps/web/src/lib/motion/**`
- Server Action que retorna dados consumidos por componente Client

**Verificação automatizada:**

```bash
./scripts/check-rsc-boundaries.sh
```

Roda em CI (workflow `rls-tests.yml` job `rsc-audit`) — PR não merge se falhar.

**Verificação manual obrigatória:** ler `docs/dev/rsc-boundary-rules.md` (4 regras + checklist de PR) antes de marcar story Done.

**4 regras inegociáveis:**

1. Nunca passar `forwardRef` (Lucide, Card, Button) como prop Server→Client
2. Client Component não pode importar Server Component
3. `useSyncExternalStore` proibido — usar `useState + useEffect + queueMicrotask`
4. Build verde NÃO é funcional — smoke real da idealizadora em mobile é critério de Done

**Origem:** sessão 2026-05-02 onde Dashboard quebrou em produção por mais de 1h apesar de Sprints 5/6/7 terem fechado "Done" com deploys READY. Bugs não foram pegos por TypeScript, ESLint, build ou QA gate.

### Gate Failure — protocolo

Se qualquer gate falhar durante draft (`@sm`) ou validação (`@po`):

1. **Expandir escopo** da story para cobrir o gap, **OU**
2. **Criar story irmã imediata** para fechar o gap antes da próxima entrega, **OU**
3. **Registrar waiver explícito** no Change Log com justificativa concreta (não tácita).

A 3ª opção (waiver) requer aprovação do `@po` e justificativa que não seja racionalização — exemplo válido: "issue #6 (Badge `Top` em DRE-por-servico) preservado porque é badge categórico, não valor financeiro; criar `StatusBadge` semântico próprio é story futura". Exemplo inválido: "secondaryAction deve ser menos proeminente" (sem ancoragem).

### Aplicação retroativa

Gates valem para stories **abertas a partir da Story 6.0**. Stories Done não são revisitadas — auditoria periódica (como a `@baziotti` pre-motion) é o mecanismo para detectar regressões em código já mergeado.

## Phase 3: Implement (@dev)

**Task:** `dev-develop-story.md`

### Execution Modes

**YOLO (autonomous):**
- 0-1 prompts
- Decisions logged in `decision-log-{story-id}.md`
- Best for: simple, deterministic tasks

**Interactive (default):**
- 5-10 prompts with educational checkpoints
- Confirmations at key decision points
- Best for: learning, complex decisions

**Pre-Flight (plan-first):**
- All questions upfront (10-15 prompts)
- Generates execution plan
- Then zero-ambiguity execution
- Best for: ambiguous requirements, critical work

### CodeRabbit Self-Healing in Dev Phase

```
iteration = 0
while CRITICAL issues found AND iteration < 2:
  auto-fix CRITICAL/HIGH
  iteration++
if CRITICAL persist after 2 iterations:
  HALT — manual intervention required
```

## Phase 3.5: Specialist Gates (Conditional — KEYRA only)

**Triggered by story scope, not every story.** When triggered, gate runs between Phase 3 (@dev complete) and Phase 4 (@qa).

| Gate | Agent | Command | Trigger Conditions (story scope) |
|------|-------|---------|----------------------------------|
| Financial | `@finance-domain-expert` (Valéria) | `*review-financial-logic` | Story touches `transactions`, `dre`, `services.price`, `services.cost`, `payments`, margin/profit formulas, DRE per service |
| Compliance | `@compliance-br` (Têmis) | `*lgpd-audit` | Story touches personal data (CPF, phone, email), uploads of bank/card statements, paid integrations (Asaas, WhatsApp Business), NFS-e |
| Growth | `@growth-product` (Gaia) | `*review-growth` | Story touches paywall, feature gating, pricing tiers, onboarding flow, billing, upgrade triggers |

### Gate Verdicts

| Verdict | Action |
|---------|--------|
| APPROVE | Append entry to story Change Log; proceed to Phase 4 (QA gate) |
| CONCERNS | Document in story Change Log; proceed to Phase 4 (QA inherits concerns) |
| REJECT | Return to @dev with structured feedback; do NOT proceed to @qa |

### Multiple Gates

If multiple gates trigger (e.g., a paywall story that touches `payments`), **all gates must pass before @qa**. Order is not strict — run in any sequence.

### Squad Workflows (alternative)

Squad-specific workflows (e.g., `keyra-sdc-com-gate-financeiro` in `squads/squad-keyra-core/workflows/`) bake specialist gates into the workflow definition itself, removing the conditional check.

## Phase 4: QA Gate (@qa)

**Task:** `qa-gate.md`

### 7 Quality Checks

1. **Code review** — patterns, readability, maintainability
2. **Unit tests** — adequate coverage, all passing
3. **Acceptance criteria** — all met per story AC
4. **No regressions** — existing functionality preserved
5. **Performance** — within acceptable limits
6. **Security** — OWASP basics verified
7. **Documentation** — updated if necessary

### Gate Decisions

| Decision | Score | Action |
|----------|-------|--------|
| PASS | All checks OK | Approve, proceed to @devops push |
| CONCERNS | Minor issues | Approve with observations documented |
| FAIL | HIGH/CRITICAL issues | Return to @dev with feedback |
| WAIVED | Issues accepted | Approve with waiver documented (rare) |

### Gate File Structure

```yaml
storyId: STORY-42
verdict: PASS | CONCERNS | FAIL | WAIVED
issues:
  - severity: low | medium | high
    category: code | tests | requirements | performance | security | docs
    description: "..."
    recommendation: "..."
```

## QA Loop (Iterative Review-Fix)

```
@qa review → verdict → @dev fixes → re-review (max 5 iterations)
```

**Commands:**
- `*qa-loop {storyId}` — Start full loop
- `*stop-qa-loop` — Pause and save state
- `*resume-qa-loop` — Resume from saved state
- `*escalate-qa-loop` — Force manual escalation

**Escalation triggers:**
- max_iterations_reached (default: 5)
- verdict_blocked
- fix_failure (after retries)
- manual_escalate (user command)

**Status:** Tracked in `qa/loop-status.json`

## Story File Update Rules

| Section | Who Can Edit |
|---------|-------------|
| Title, Description, AC, Scope | @po only |
| File List, Dev Notes, checkboxes | @dev |
| QA Results | @qa only |
| Change Log | Any agent (append only) |
