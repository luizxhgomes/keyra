# EPIC SPRINT 8 — Hardening + Pré-condições do Go-Live Comercial

**Status:** 📋 Pronto para `@sm *draft` em sequência
**Criado em:** 2026-05-02
**Origem:** Relatório PO Master Validation Checklist (2026-05-02) flagrou 4 must-fix bloqueadores de go-live comercial + 4 should-fix de qualidade. Sprint 8 fecha todos antes de abrir Phases 5/6/7.
**Pré-condição para abrir:** validação de jornada-mobile com a idealizadora (R1 do relatório PO) executada.
**Bloqueia:** abertura formal de EPIC-INTELLIGENCE (Phase 5+6) e EPIC-INTEGRATIONS (Phase 7).

---

## Por que existe

KEYRA tem MVP feature-complete (Sprints 1-7), mas o relatório PO Master de 2026-05-02 flagrou que **partir para Phase 5/7 sem zerar débitos de hardening seria construir camada inteligente sobre alicerce frágil**. Especificamente:

| Débito | Severidade | Origem do gap |
|--------|------------|---------------|
| Zero testes TS/JS automatizados (NFR-MA-01 violado) | CRÍTICA | Phases 1-7 entregaram com typecheck + lint + smoke manual apenas |
| Vercel Hobby não permite uso comercial | ALTA | D1 fechada em 2026-04-16 com upgrade adiado |
| Tokens Vercel/Supabase/Sentry expostos em chat | ALTA | Risco aceito mas não rotacionado (STATE.md §5) |
| Supabase Free pausa após 7d sem requests | ALTA | Cron healthcheck mencionado em STATE.md mas não implementado |
| LGPD toolkit (ADR-019) ausente | ALTA | Era Phase 4, virou pré-go-live (consent, export, anonymize, DPO, terms) |
| PostHog NorthStar instrumentation ausente | MÉDIA | TTFL não-mensurável sem instrumentação |
| Uptime monitor ausente | MÉDIA | Pause/outage sem alerta |
| DR runbook ausente | MÉDIA | NFR-AV-02/03 do PRD descobertos |

---

## Composição da Sprint 8

| Story | T-shirt | Pontos | Foco | Bloqueia go-live? |
|-------|---------|--------|------|-------------------|
| `h8.1` | M+ | 6 | Vitest + cobertura ≥70% em `lib/money.ts`, `lib/validators/`, Server Actions financeiras | 🔴 SIM (NFR-MA-01) |
| `h8.2` | S | 3 | Migração Vercel Pro + rotação de credentials expostas (Vercel token, Supabase service_role, Sentry token) | 🔴 SIM (commercial-use) |
| `h8.3` | XS | 1 | Vercel Cron `/api/healthcheck` evita pause do Supabase Free | 🟡 Operação |
| `h8.4` | L | 8 | LGPD toolkit completo (ADR-019): consent_records + export user data + anonymize customer + DPO page + terms versioning | 🔴 SIM (CON-LG-01..06) |
| `h8.5` | M | 5 | PostHog instrumentation: 5 eventos canônicos (signup, onboarding_complete, first_appointment_done, first_payment_recorded, first_dashboard_with_lucro) | 🟡 Mensuração TTFL |
| `h8.6` | XS | 1 | BetterStack uptime monitor + alerta WhatsApp | 🟡 Operação |
| `h8.7` | S | 3 | Performance budget no CI (next-bundle-analyzer + threshold 400KB inicial) | 🟢 Qualidade |
| `h8.8` | S | 3 | DR runbook documentado (RPO/RTO testados em backup Supabase) | 🟢 Qualidade |
| **TOTAL** | — | **30** | — | — |

**Estimativa total:** ~30 pontos. T-shirt do conjunto: **L+** (~5-7 dias úteis com SDC + gates).

---

## Ordem de execução recomendada

```
h8.2 (Vercel Pro + rotação) ─────────► h8.6 (uptime monitor)
   │                                       │
   └─► h8.3 (cron healthcheck)              │
                                            ▼
h8.1 (Vitest infra)                  h8.4 (LGPD toolkit)
   │                                        │
   └─► todas as próximas stories            │
       herdam coverage gate                 │
                                            ▼
h8.5 (PostHog)                        h8.7 (perf budget)
                                            │
                                            ▼
                                       h8.8 (DR runbook)
```

**Caminhos paralelos:** h8.2/h8.3/h8.6 (operação) podem rodar em paralelo com h8.1 (testes) e h8.4 (LGPD). h8.5/h8.7/h8.8 são fechamento.

**Gate de saída da Sprint 8:** todos os 8 stories Done + smoke manual da idealizadora confirmando jornadas J1-J6 ainda intactas + cobertura Vitest ≥70% no CI.

---

## Cross-reference com squads

A Sprint 8 não tem squad próprio — usa os agentes core (`@sm`, `@po`, `@dev`, `@qa`, `@devops`) com gates Phase 3.5 acionados conforme escopo:

| Story | Phase 3.5 gate acionado |
|-------|-------------------------|
| `h8.1` | `@finance-domain-expert` *review-financial-logic* (testes cobrem fórmulas) |
| `h8.2` | `@compliance-br` *lgpd-audit* (rotação de credentials toca dados sensíveis) |
| `h8.4` | `@compliance-br` *lgpd-audit* (toolkit inteiro é LGPD) |
| `h8.5` | `@growth-product` *review-growth* (PostHog mede funnel comercial) |
| `h8.7` | — (qualidade técnica) |
| `h8.3`, `h8.6`, `h8.8` | — (operação) |

---

## Rastreabilidade

- **Source de gaps:** Relatório PO Master Checklist 2026-05-02 (entregue por `@aiox-master` Orion)
- **NFRs cobertos:** NFR-MA-01 (cobertura ≥70%), NFR-OB-02 (métricas saúde), NFR-AV-01..03 (uptime/backup/portabilidade), NFR-SE-04 (criptografia), CON-LG-01..06 (LGPD inteira), CON-UX-06 (TTFL mensurável)
- **ADRs ativados:** ADR-019 (LGPD toolkit, agora ACCEPTED), ADR-020 (NFRs)
- **Dependências:** nenhuma story de Phase 5/7 abre antes de Sprint 8 fechada

---

## Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-05-02 | `@aiox-master` (Orion) | Epic criado pós-relatório PO Master Checklist. 8 stories listadas com T-shirt/pontos/Phase 3.5 gates. Pré-condição: validação mobile da idealizadora. Bloqueia Phase 5/7. |
