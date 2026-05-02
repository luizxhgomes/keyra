# EPIC INTELLIGENCE — Phases 5 + 6 do KEYRA

**Status:** 📋 Pronto para abrir após Sprint 8 fechada
**Criado em:** 2026-05-02
**Squad responsável:** [`squad-keyra-intelligence`](../../squads/squad-keyra-intelligence/) (workflow `keyra-inteligencia-spec-sdc.yaml`)
**Pré-condição:** Sprint 8 (Hardening) Done + validação mobile da idealizadora aprovada
**Bloqueia:** plano "Crescimento" comercializável (R$ 149-199/mês) + plano "Autoridade" (R$ 299-399/mês)
**Numeração:** prefixo `i5.x` (Phase 5) + `i6.x` (Phase 6) para evitar colisão com EPIC-7-AUTH-RELIABILITY

---

## Por que existe

KEYRA MVP (Sprints 1-4) provou a tese central — *"financeiro nasce automaticamente da operação"*. Mas o MVP é o "plano Start" no modelo de monetização (PRD §8). **Os planos Crescimento e Autoridade só existem se Phase 5+6 forem entregues.**

| Tese | Provada no MVP? | Provada na Phase 5+6? |
|------|-----------------|------------------------|
| "Financeiro automático da agenda" | ✅ Sim | — |
| "Lucro por serviço (diferencial vs Conta Azul)" | ✅ Sim (Sprint 4) | Aprofunda em projeções |
| "Precificação inteligente" (calcula preço mínimo) | ❌ Não | ✅ Phase 5 entrega motor |
| "Decisões preditivas" (projeções via agenda preenchida) | ❌ Não | ✅ Phase 6 entrega |
| "Suporte à mentora financeira" (panoramas prontos) | Parcial | ✅ Phase 6 fecha |

---

## Estrutura: Phase 5 (Precificação) + Phase 6 (Inteligência)

### Phase 5 — Motor de Precificação (7 stories, ~38 pontos)

| Story | T-shirt | Pts | Foco | FRs cobertos |
|-------|---------|-----|------|--------------|
| `i5.1` | M | 5 | Motor precificação por serviço (preço mínimo via custo + margem) | FR-CP-04 |
| `i5.2` | L | 8 | Pacotes de sessões (5 sessões com 10% off, receita diferida) | FR-SV-05, FR-SV-06, FR-CP-06 |
| `i5.3` | M | 5 | Simulação cenários de preço (what-if +10%, -5%) | FR-CP-05 |
| `i5.4` | M | 5 | Alertas de estoque baixo + sugestão de recompra | FR-ES-03, FR-ES-04 |
| `i5.5` | L+ | 10 | **Stripe billing UI** (signup→trial 14d→subscription→Customer Portal) | Modelo monetização §8 |
| `i5.6` | S | 3 | MFA TOTP opt-in (D7) | NFR-SE-04 |
| `i5.7` | S | 3 | Plano de contas customizável por org (D10) | FR-FI-05 |
| **Total** | — | **39** | — | — |

### Phase 6 — Inteligência + Projeções (7 stories, ~37 pontos)

| Story | T-shirt | Pts | Foco | FRs cobertos |
|-------|---------|-----|------|--------------|
| `i6.1` | L | 8 | Previsão de lucro semanal/mensal via agenda preenchida (cron Inngest) | FR-IN-02, FR-FI-07 |
| `i6.2` | M | 5 | Cenários what-if (+10% upsell, +5 atendimentos/sem, -20% custo X) | FR-IN-03 |
| `i6.3` | M | 5 | Heatmap rentabilidade por horário (lucro/hora — exceção UX permitida pela idealizadora) | FR-IN-04 |
| `i6.4` | M | 5 | Rentabilidade por profissional + alertas baixa performance | FR-IN-05 |
| `i6.5` | M | 5 | Panoramas para mentoria (relatório sintético) | FR-IN-06, FR-IN-07 |
| `i6.6` | M | 5 | Prontuário financeiro do cliente (LTV, ticket médio, frequência) | FR-PA-03, FR-PA-04 |
| `i6.7` | S | 3 | Sugestões de upsell na agenda (regras v1: "cliente botox > 60d sem manutenção?") | FR-IN-08 |
| **Total** | — | **36** | — | — |

**Grand total Phases 5+6:** ~75 pontos = ~3-4 sprints de 2 semanas.

---

## Dependências críticas

### Pré-condições externas (devem estar Done antes da `i5.1`)

| Dependência | Story | Bloqueia |
|-------------|-------|----------|
| Vitest infra + cobertura financeira | `h8.1` | Toda story de Phase 5/6 entra com testes obrigatórios |
| Vercel Pro + rotação | `h8.2` | Comercialização (`i5.5` Stripe) |
| LGPD toolkit | `h8.4` | `i6.6` (prontuário cliente — dados sensíveis agregados) |
| PostHog + TTFL | `h8.5` | `i5.5` (medir conversão trial→paid) |
| Validação mobile idealizadora | (manual) | Toda Phase 5/6 |

### Decisões pendentes (`[INPUT-PENDENTE]`)

| ID | Decisão | Bloqueia |
|----|---------|----------|
| **D-PR1** | Pricing absoluto Start/Crescimento/Autoridade | `i5.5` |
| **D-PR2** | Comissionamento por senioridade | `i6.4` |
| **D6** | Trial-first vs paywall MVP | `i5.5` |
| **D10** | Plano contas customizável: scope completo ou subset | `i5.7` |

### Cadeia de dependências internas

```
i5.1 (motor preço) ──────► i5.2 (pacotes — usa preço mínimo)
                       │
                       └─► i5.3 (simulação — usa motor base)

i5.4 (estoque alertas) ──── independente

i5.5 (Stripe) ──► i5.6 (MFA opcional para Crescimento+) ──► i5.7 (plano custom)

i6.1 (previsão semanal) ──► i6.2 (what-if usa previsão base)
                       │
                       └─► i6.5 (panoramas mentora consolidam previsão)

i6.3 (heatmap horário) ──── independente, usa view materialized

i6.4 (rentabilidade prof) ──── usa transactions + commission

i6.6 (prontuário cliente) ──► i6.7 (upsell olha histórico)
```

---

## Schema previsto (tabelas Phase 5+6)

> Migrations draft em `supabase/migrations-planejadas/` — aplicar conforme Story relacionada chegar em Done.

### Phase 5

| Tabela | Story que materializa | Schema essencial |
|--------|----------------------|------------------|
| `pricing_models` | `i5.1` | `(id, org_id, service_id, fixed_overhead_cents, target_margin_pct, min_price_cents, computed_at)` |
| `package_definitions` | `i5.2` | `(id, org_id, name, total_sessions, price_cents, discount_pct, services[])` |
| `package_sales` | `i5.2` | `(id, org_id, customer_id, package_def_id, sessions_used, sessions_total, sold_at)` |
| `package_redemptions` | `i5.2` | `(id, package_sale_id, appointment_id, redeemed_at)` |
| `pricing_simulations` | `i5.3` | (não persistente — Server Action stateless) |
| `subscriptions` (Stripe mirror) | `i5.5` | `(id, org_id, stripe_subscription_id, plan, status, current_period_end, ...)` |

### Phase 6

| Tabela | Story que materializa | Schema essencial |
|--------|----------------------|------------------|
| `revenue_projections` | `i6.1` | `(id, org_id, week_start, projected_revenue_cents, projected_lucro_cents, computed_at)` |
| `whatif_scenarios` | `i6.2` | (não persistente — stateless ou local-storage) |
| `client_financial_profile` | `i6.6` | view derivada de `transactions` + `appointments` (não tabela física) |
| `upsell_suggestions` | `i6.7` | (cron Inngest gera + tabela cache) `(id, org_id, customer_id, service_id, reason, created_at, dismissed_at)` |

---

## Workflows e gates

**Workflow do squad:** [`keyra-inteligencia-spec-sdc.yaml`](../../squads/squad-keyra-intelligence/workflows/keyra-inteligencia-spec-sdc.yaml)

```
@architect (abordagem) → @finance-domain-expert (fórmulas)
  → @sm → @po → @dev
  → @data-engineer (queries) + @finance-domain-expert (gate)
  → @qa → @devops
```

### Phase 3.5 gates por story

| Story | Financial | Compliance | Growth |
|-------|-----------|------------|--------|
| `i5.1` (motor preço) | ✅ obrigatório | WAIVED | WAIVED |
| `i5.2` (pacotes) | ✅ obrigatório | WAIVED | ✅ obrigatório (gating de feature) |
| `i5.3` (simulação) | ✅ obrigatório | WAIVED | WAIVED |
| `i5.4` (estoque) | ✅ obrigatório | WAIVED | WAIVED |
| `i5.5` (Stripe) | ✅ obrigatório | ✅ obrigatório | ✅ obrigatório |
| `i5.6` (MFA) | WAIVED | ✅ obrigatório | WAIVED |
| `i5.7` (plano custom) | ✅ obrigatório | WAIVED | WAIVED |
| `i6.1` (previsão) | ✅ obrigatório | WAIVED | WAIVED |
| `i6.2` (what-if) | ✅ obrigatório | WAIVED | WAIVED |
| `i6.3` (heatmap) | ✅ obrigatório | WAIVED | WAIVED |
| `i6.4` (rentab prof) | ✅ obrigatório | WAIVED | WAIVED |
| `i6.5` (panoramas) | ✅ obrigatório | WAIVED | WAIVED |
| `i6.6` (prontuário) | ✅ obrigatório | ✅ obrigatório (PII) | WAIVED |
| `i6.7` (upsell) | ✅ obrigatório | ✅ informativo | ✅ informativo |

**Gate financeiro 100%:** todas as stories tocam fórmulas. Squad workflow já força isso.

---

## Princípios UX inegociáveis (mantidos)

- **Números absolutos:** todos os outputs em valor monetário (R$ X), não percentual.
- **Comparativo textual:** "R$ 1.200 a mais que mês passado", nunca "+18%".
- **Tela única:** dashboard continua sem scroll desktop.
- **Exceção autorizada:** heatmap de rentabilidade por horário (`i6.3`) é visual por natureza — única visualização não-textual permitida na Phase 6 (CON-UX-04 já reservou 1 gráfico no MVP; Phase 6 ganha 1 heatmap adicional, autorizado pela idealizadora).

---

## Stories detalhadas

> Cada story tem arquivo dedicado em `docs/stories/{id}.story.md`. Esta lista é o índice navegável.

- [`i5.1` — Motor de precificação por serviço](i5.1.story.md)
- [`i5.2` — Pacotes de sessões com receita diferida](i5.2.story.md)
- [`i5.3` — Simulação de cenários de preço](i5.3.story.md)
- [`i5.4` — Alertas de estoque baixo + sugestão de recompra](i5.4.story.md)
- [`i5.5` — Stripe billing UI (trial→subscription)](i5.5.story.md)
- [`i5.6` — MFA TOTP opt-in](i5.6.story.md)
- [`i5.7` — Plano de contas customizável por org](i5.7.story.md)
- [`i6.1` — Previsão de lucro semanal/mensal via agenda](i6.1.story.md)
- [`i6.2` — Cenários what-if](i6.2.story.md)
- [`i6.3` — Heatmap rentabilidade por horário](i6.3.story.md)
- [`i6.4` — Rentabilidade por profissional + alertas](i6.4.story.md)
- [`i6.5` — Panoramas para mentoria](i6.5.story.md)
- [`i6.6` — Prontuário financeiro do cliente (LTV)](i6.6.story.md)
- [`i6.7` — Sugestões de upsell na agenda](i6.7.story.md)

---

## Critério de saída do EPIC

1. 14 stories Done.
2. NorthStar TTFL aferido em PostHog para 30+ orgs com TTFL médio < 24h (PRD §4.1).
3. Plano Crescimento (R$ 149-199/mês) ativo no Stripe com pelo menos 3 paying customers.
4. Plano Autoridade (R$ 299-399/mês) ativo com pelo menos 1 paying customer (mentoria-cliente).
5. Idealizadora valida pelo menos 5 jornadas de mentoria reais usando KEYRA com clientes piloto.

---

## Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-05-02 | `@aiox-master` (Orion) | Epic criado. Phases 5+6 do EPIC-0 reorganizadas em 14 stories `i5.x`/`i6.x`, schema previsto em `supabase/migrations-planejadas/`, gates Phase 3.5 mapeados, dependências internas documentadas. Squad `squad-keyra-intelligence` é o owner. |
