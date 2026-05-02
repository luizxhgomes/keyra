# Agent Authority — Detailed Rules

## Delegation Matrix

### @devops (Gage) — EXCLUSIVE Authority

| Operation | Exclusive? | Other Agents |
|-----------|-----------|--------------|
| `git push` / `git push --force` | YES | BLOCKED |
| `gh pr create` / `gh pr merge` | YES | BLOCKED |
| MCP add/remove/configure | YES | BLOCKED |
| CI/CD pipeline management | YES | BLOCKED |
| Release management | YES | BLOCKED |

### @pm (Morgan) — Epic Orchestration

| Operation | Exclusive? | Delegated From |
|-----------|-----------|---------------|
| `*execute-epic` | YES | — |
| `*create-epic` | YES | — |
| EPIC-{ID}-EXECUTION.yaml management | YES | — |
| Requirements gathering | YES | — |
| Spec writing (spec pipeline) | YES | — |

### @po (Pax) — Story Validation

| Operation | Exclusive? | Details |
|-----------|-----------|---------|
| `*validate-story-draft` | YES | 10-point checklist |
| Story context tracking in epics | YES | — |
| Epic context management | YES | — |
| Backlog prioritization | YES | — |

### @sm (River) — Story Creation

| Operation | Exclusive? | Details |
|-----------|-----------|---------|
| `*draft` / `*create-story` | YES | From epic/PRD |
| Story template selection | YES | — |

### @dev (Dex) — Implementation

| Allowed | Blocked |
|---------|---------|
| `git add`, `git commit`, `git status` | `git push` (delegate to @devops) |
| `git branch`, `git checkout`, `git merge` (local) | `gh pr create/merge` (delegate to @devops) |
| `git stash`, `git diff`, `git log` | MCP management |
| Story file updates (File List, checkboxes) | Story file updates (AC, scope, title) |

### @architect (Aria) — Design Authority

| Owns | Delegates To |
|------|-------------|
| System architecture decisions | — |
| Technology selection | — |
| High-level data architecture | @data-engineer (detailed DDL) |
| Integration patterns | @data-engineer (query optimization) |
| Complexity assessment | — |

### @data-engineer (Dara) — Database

| Owns (delegated from @architect) | Does NOT Own |
|----------------------------------|-------------|
| Schema design (detailed DDL) | System architecture |
| Query optimization | Application code |
| RLS policies implementation | Git operations |
| Index strategy execution | Frontend/UI |
| Migration planning & execution | — |

### @aiox-master — Framework Governance

| Capability | Details |
|-----------|---------|
| Execute ANY task directly | No restrictions |
| Framework governance | Constitutional enforcement |
| Override agent boundaries | When necessary for framework health |

### @finance-domain-expert (Valéria) — Financial Domain Authority (KEYRA)

| Owns | Gate Trigger |
|------|--------------|
| DRE structure validation | Stories touching `transactions`, `dre`, `services.price/cost`, `payments` |
| Pricing logic & margin formulas | Any pricing engine, packages, margin computation |
| Cost structure (fixed/variable) | Stories on cost allocation, breakeven, profit-per-service |
| Financial code review (`*review-financial-logic`) | Mandatory before @qa gate on financial stories |

### @document-processor (Íris) — Document Parsing Authority (KEYRA)

| Owns | Used By |
|------|---------|
| OCR pipeline design | squad-keyra-integrations (Phase 7) |
| Bank statement parsers (OFX/CSV/PDF) | Asaas reconciliation |
| Card machine statement parsers (Cielo/Rede/Stone) | Card payment reconciliation |
| Reconciliation flow design | Cross-system payment matching |

### @compliance-br (Têmis) — Compliance Authority (KEYRA)

| Owns | Gate Trigger |
|------|--------------|
| LGPD audit (`*lgpd-audit`) | Stories touching personal data (CPF, phone, email) |
| Tax rules (MEI/Simples/Lucro Presumido) | Pricing/billing/invoicing stories |
| NFS-e integration spec | Invoice emission stories |
| PII inventory & retention policy | Data lifecycle stories |
| Tenant isolation validation | Multi-tenant stories |

### @growth-product (Gaia) — Growth & Monetization Authority (KEYRA)

| Owns | Gate Trigger |
|------|--------------|
| Pricing tiers & feature matrix | Tier definition, paywall stories |
| Onboarding flow design | First-run experience, activation stories |
| Conversion funnel & growth metrics | Analytics, upgrade-trigger stories |
| Growth code review (`*review-growth`) | Mandatory before @qa gate on monetization stories |

## Cross-Agent Delegation Patterns

### Git Push Flow
```
ANY agent → @devops *push
```

### Schema Design Flow
```
@architect (decides technology) → @data-engineer (implements DDL)
```

### Story Flow (default)
```
@sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push
```

### Story Flow (com gates especialistas KEYRA)
```
@sm *draft → @po *validate → @dev *develop
  → [gate financeiro: @finance-domain-expert *review-financial-logic] (se story toca DRE/preço/margem)
  → [gate compliance: @compliance-br *lgpd-audit] (se story toca dados sensíveis/integrações pagas)
  → [gate growth: @growth-product *review-growth] (se story toca paywall/tiers/onboarding)
  → @qa *qa-gate → @devops *push
```

### Epic Flow
```
@pm *create-epic → @pm *execute-epic → @sm *draft (per story)
```

### Squad Flow (workflows pré-configurados em `squads/`)
```
@aiox-master *workflow {nome-do-workflow}
```
Workflows disponíveis: `keyra-fase-0` (bootstrap) · `keyra-sdc-com-gate-financeiro` (core) · `keyra-integracoes-spec-sdc` (Phase 7) · `keyra-inteligencia-spec-sdc` (Phases 5-6) · `deep-research-pipeline` · `strategic-research-pipeline`. Catálogo completo em `.claude/CLAUDE.md` §Squads.

## Escalation Rules

1. Agent cannot complete task → Escalate to @aiox-master
2. Quality gate fails → Return to @dev with specific feedback
3. Constitutional violation detected → BLOCK, require fix before proceed
4. Agent boundary conflict → @aiox-master mediates
