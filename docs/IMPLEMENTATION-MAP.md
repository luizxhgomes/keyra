# KEYRA — Mapa de Implementação (source of truth)

> **Última atualização:** 2026-04-16 (Story 1.1 entregue — scaffold Next.js)
> **Propósito:** matriz viva que cruza **features × telas × tabelas × ADRs × stories × status**.
> **Quando atualizar:** sempre que uma story for entregue, um ADR mudar, ou uma feature ganhar novo escopo.

---

## 1. Status Geral

| Camada | Estado | Detalhe |
|--------|--------|---------|
| **Infraestrutura** | ✅ 100% | GitHub `luizxhgomes/keyra`, Vercel `keyra` (Hobby) rodando em [usekeyra.vercel.app](https://usekeyra.vercel.app), Supabase `keyra-br` (sa-east-1, Free). Custom `keyra.app` pendente ajuste DNS Cloudflare |
| **Banco de Dados** | ✅ 100% schema aplicado | 21 tabelas, 21/21 RLS, 6 views, 15 funções, 19 migrations no remoto |
| **Documentação** | ✅ Phase 0 completa | PRD v1.3 + ARCHITECTURE v1.3 + 8 wireframes + SCHEMA + INFRA-STATUS |
| **Código aplicação** | 🟡 ~10% | Story 1.1 entregue: scaffold Next.js + design system + Supabase clients + AppShell + componentes canônicos KEYRA. Auth e features ainda pendentes. |
| **Auth & Multi-tenant** | 🟡 50% | Schema pronto + `lib/supabase/{server,browser,admin,middleware}` criados; Auth Hook ativado; UI de login/signup/org-switcher pendente (Story 1.2-1.5) |
| **Features MVP (Pilares 1-4)** | ⏸️ 0% código | Schema pronto; UI/Server Actions a criar |

---

## 1.1 Story 1.1 — Scaffold Next.js (entregue 2026-04-16)

| Entregável | Path | Status |
|-----------|------|--------|
| Workspace pnpm | `/pnpm-workspace.yaml`, `/package.json`, `/.npmrc` | ✅ |
| Next.js app | `apps/web/` (Next 15.1 — fallback documentado para Next 16) | ✅ |
| TypeScript estrito | `apps/web/tsconfig.json` (`strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`) | ✅ |
| Tailwind v3.4 + design tokens KEYRA | `tailwind.config.ts` + `src/app/globals.css` (paleta terracota + sálvia) | ✅ (v4 fallback documentado) |
| shadcn/ui base | `components.json` + `components/ui/{button,card,input,label,badge}.tsx` | ✅ |
| Componentes canônicos KEYRA | `components/keyra/{KPICard,ComparativoTexto,AlertCard,StatusBadge}.tsx` | ✅ funcional + barrel export |
| Layout autenticado | `components/layout/{Sidebar,BottomNav,AppShell}.tsx` + `app/(app)/layout.tsx` | ✅ (sidebar 240px desktop + bottom nav 5 itens mobile) |
| Supabase clients (ADR-008) | `lib/supabase/{server,browser,middleware,admin}.ts` | ✅ (admin importa `'server-only'`) |
| Middleware Next.js | `src/middleware.ts` (refresh session) | ✅ |
| Sentry (ADR-015) | `instrumentation.ts` + `instrumentation-client.ts` | ✅ (auto-init se `SENTRY_DSN` definido) |
| Money helpers (ADR-005) | `lib/money.ts` (Decimal.js + `ROUND_HALF_EVEN` + `formatBRL`) | ✅ |
| Date helpers | `lib/date.ts` (date-fns + ptBR) | ✅ |
| Env validation (Zod) | `lib/env.ts` (fail-fast no boot) | ✅ |
| ESLint flat + Article VI enforce | `eslint.config.mjs` (banimento de imports relativos profundos) | ✅ |
| Prettier + Tailwind plugin | `.prettierrc.json` + `.prettierignore` | ✅ |
| Sync env script atualizado | `scripts/sync-env.sh` agora espelha para `apps/web/.env.local` | ✅ |
| Landing pública | `app/page.tsx` (placeholder honest "em construção") | ✅ |
| Login placeholder | `app/(auth)/login/page.tsx` (TODO Story 1.2) | ✅ |
| Dashboard placeholder | `app/(app)/dashboard/page.tsx` (showcase dos componentes canônicos) | ✅ |
| README completo | `apps/web/README.md` (versões reais, estrutura, decisões de fallback) | ✅ |

**Não validado ainda (sandbox bloqueou):** `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm build`. Validação manual + commit fica para o passo seguinte (Luiz roda local antes do push).

---

## 2. Mapa Feature × Tela × Tabela × ADR × Story

### Pilar 1 — Agenda (origem do faturamento)

| Feature | Tela (wireframe) | Tabelas | Trigger/View | ADR | Story | Status |
|---------|------------------|---------|--------------|-----|-------|--------|
| Agendar paciente+serviço+profissional | [02-agenda.md](ux/wireframes/02-agenda.md) | `appointments`, `customers`, `services`, `professionals` | EXCLUDE gist (no double-book) | ADR-013 | 2.4, 2.5 | ⏸️ código |
| Status agendamento (scheduled→done→cancelled→no_show) | [02-agenda.md](ux/wireframes/02-agenda.md) | `appointments` | `trg_appointments_done_to_command` ✅ | ADR-013 | 2.6 | 🟡 trigger pronto, UI faltando |
| Receita prevista automática | [01-dashboard.md](ux/wireframes/01-dashboard.md) | `appointments.price_snapshot` | `v_receitas_previstas` ✅ | ADR-013 | 2.7 | 🟡 view pronta, UI faltando |
| Visualização dia/semana/mês | [02-agenda.md](ux/wireframes/02-agenda.md) | `appointments` | — | ADR-002 (FullCalendar) | 2.4 | ⏸️ código |
| Confirmação WhatsApp | — | `appointments.confirmed_at` | — | (Phase 7) | 7.3 | ⏸️ pós-MVP |

### Pilar 1 — Pacientes (CRM)

| Feature | Tela | Tabelas | ADR | Story | Status |
|---------|------|---------|-----|-------|--------|
| CRUD pacientes | [04-cadastros.md](ux/wireframes/04-cadastros.md) | `customers` (CPF encrypted via ADR-017) | ADR-013 | 2.1 | ⏸️ código |
| Histórico de atendimentos por paciente | (sub-tela) | `appointments`, `commands`, `transactions` | — | 2.1 + 4.6 | ⏸️ |
| Prontuário financeiro (LTV, ticket médio) | (sub-tela) | mesma + view derivada | — | 6.6 | ⏸️ Phase 6 |

### Pilar 2 — Serviços / Catálogo

| Feature | Tela | Tabelas | ADR | Story | Status |
|---------|------|---------|-----|-------|--------|
| CRUD serviços (preço, custo, duração, comissão) | [04-cadastros.md](ux/wireframes/04-cadastros.md) | `services`, `service_categories` | ADR-013 | 2.2 | ⏸️ |
| Insumos por serviço (rateio) | (sub-tela) | `service_supplies`, `supplies` | ADR-013 | 2.3 | ⏸️ |
| Cadastro de insumos / estoque inicial | [04-cadastros.md](ux/wireframes/04-cadastros.md) | `supplies`, `inventory_movements` | ADR-013 | 2.3 | ⏸️ |
| Pacotes (5 sessões com 10% off) | — | (extensão de `services` ou nova tabela) | — | 5.2 | ⏸️ Phase 5 |

### Pilar 2 — Custos & Precificação

| Feature | Tela | Tabelas | ADR | Story | Status |
|---------|------|---------|-----|-------|--------|
| Motor de precificação (custos+rateio+margem) | (Phase 5 dedicada) | view derivada de `services`, `supplies`, `service_supplies` | ADR-013 | 5.1 | ⏸️ Phase 5 |
| Simulação cenários de preço | — | (Server Action stateless) | — | 5.3 | ⏸️ Phase 5 |

### Pilar 3 — Comanda / Ordem de Serviço

| Feature | Tela | Tabelas | Trigger | ADR | Story | Status |
|---------|------|---------|---------|-----|-------|--------|
| Comanda automática ao concluir agendamento | [03-comanda.md](ux/wireframes/03-comanda.md) | `commands`, `command_items` | `trg_appointments_done_to_command` ✅ | ADR-013 | 3.1 | 🟡 trigger pronto, UI faltando |
| Adicionar itens extras à comanda | [03-comanda.md](ux/wireframes/03-comanda.md) | `command_items` | trigger recompute subtotal | ADR-013 | 3.1 | ⏸️ |
| Registrar pagamento (Pix/cartão/dinheiro) | [03-comanda.md](ux/wireframes/03-comanda.md) | `payments`, `payment_methods` | `trg_payments_to_transaction` ✅ | ADR-013 | 3.2 | 🟡 trigger pronto, UI faltando |
| Split de pagamento (parte Pix + parte cartão) | — | `payments` (1:N por command) | — | (input idealizadora) | 3.2 | ⏳ pendente decisão UX |

### Pilar 3 — Financeiro / Transações

| Feature | Tela | Tabelas | View | Story | Status |
|---------|------|---------|------|-------|--------|
| Transação automática ao registrar pagamento | (auto, sem tela própria) | `transactions` | — | 3.3 | ✅ trigger |
| Receitas separadas por profissional/centro | [01-dashboard.md](ux/wireframes/01-dashboard.md) sub-bloco | `transactions.professional_id` | `v_dre_by_professional` ✅ | 3.4 | 🟡 view pronta, UI faltando |
| Despesas manuais classificadas | [04-cadastros.md](ux/wireframes/04-cadastros.md) | `transactions` (direction='debit'), `expense_categories` | — | 3.5 | ⏸️ |
| Custos fixos vs variáveis | (sub-tela DRE) | `expense_categories.kind` | `v_dre_monthly` | 3.6 | ⏸️ |
| Fluxo de caixa básico | [01-dashboard.md](ux/wireframes/01-dashboard.md) bloco | `transactions` | `v_cashflow_daily` ✅ | 3.7 | 🟡 view pronta, UI faltando |
| Plano de contas pré-configurado para estética | (uma vez no onboarding) | `expense_categories` | seed `seed_default_chart_of_accounts()` ✅ | 3.5 | ✅ seed |

### Pilar 3 — Estoque

| Feature | Tela | Tabelas | Trigger | Story | Status |
|---------|------|---------|---------|-------|--------|
| Rateio de insumos no atendimento | (auto) | `inventory_movements` (append-only) | `_consume_command_inventory` ✅ | 3.8 | ✅ trigger |
| Alertas de estoque baixo | [01-dashboard.md](ux/wireframes/01-dashboard.md) bloco alertas | `supplies.min_stock` | (Server Action de leitura) | 5.4 | ⏸️ Phase 5 |
| Sugestão de recompra | — | mesma | — | 5.5 | ⏸️ Phase 5 |

### Pilar 4 — DRE / Demonstrativo

| Feature | Tela | View | Story | Status |
|---------|------|------|-------|--------|
| DRE básica (Receita − Custos − Despesas = Lucro) | (sub-tela) | `v_dre_monthly` ✅ | 4.1 | 🟡 view pronta |
| **DRE por serviço (DIFERENCIAL vs Conta Azul)** | (sub-tela) | `v_dre_by_service` ✅ | 4.2 | 🟡 view pronta |
| Lucro por profissional | (sub-tela) | `v_dre_by_professional` ✅ | 4.3 | 🟡 view pronta |

### Pilar 4 — Dashboard

| Feature | Tela | Componente UX | View | Story | Status |
|---------|------|---------------|------|-------|--------|
| Tela única (sem scroll desktop) | [01-dashboard.md](ux/wireframes/01-dashboard.md) | grid 12 cols | `v_dashboard_kpis` ✅ | 4.4 | 🟡 view pronta |
| KPIs absolutos (faturamento, despesas, lucro, previsto) | KPICard | mesma | 4.4 | ⏸️ |
| Comparativo textual (mês vs mês) | ComparativoTexto | derivado | 4.7 | ⏸️ |
| Comparativo vs meta projetada | KPICard delta | `goals` | 4.8 | ⏸️ |
| Agenda do dia | bloco lista | `v_receitas_previstas` (filtro hoje) | 4.5 | ⏸️ |
| Indicadores (ticket médio, top serviço, no-show) | KPICard | view derivada | 4.6 | ⏸️ |
| Alertas (queda lucro, baixa margem, faltas, estoque) | AlertCard | views + thresholds | 4.9 | ⏸️ |
| 1 gráfico permitido (receita vs despesa 6 meses) | Recharts | `v_dre_monthly` | 4.4 | ⏸️ |

### Multi-tenant & Auth

| Feature | Tela | Tabelas | ADR | Story | Status |
|---------|------|---------|-----|-------|--------|
| Login email + magic link | (a criar) | `auth.users` (Supabase) | ADR-010 | 1.2 | ⏸️ (placeholder em `/login` — Story 1.1) |
| Criar organização (1ª) | onboarding | `organizations`, `memberships` | ADR-011 | 1.2 | ⏸️ |
| Convidar membro por email | (config) | `organization_invites` | ADR-011 | 1.3 | ⏸️ |
| Trocar org ativa (multi-org) | header switcher | `user_preferences` | ADR-012 | 1.5 | ⏸️ (placeholder no AppShell header — Story 1.1) |
| Roles (owner/admin/professional/viewer) | (config) | `memberships.role` | ADR-011 | 1.3 | ⏸️ |
| **Auth Hook custom_access_token (org_id no JWT)** | — | função SQL `custom_access_token_hook` ✅ | ADR-012 | 1.1 | ✅ ativo no Supabase |
| RLS isolamento cross-tenant | — | policies em 21 tabelas ✅ | ADR-011 | 1.4 | ✅ ativo (testar c/ rls_isolation.test.sql) |

### Compliance & Segurança

| Feature | Implementação | ADR | Status |
|---------|--------------|-----|--------|
| Audit log universal append-only | trigger em todas as tabelas tenant + fix `organizations` | ADR-018 | ✅ ativo |
| Soft delete (deleted_at) | em todas as entidades importantes | ADR-018 | ✅ |
| Encryption CPF (column-level) | `pgcrypto.pgp_sym_encrypt` (key TBD) | ADR-017 | 🔴 **falta provisionar `COLUMN_ENCRYPTION_KEY` no Vercel** |
| LGPD export/delete por titular | Server Actions a criar | ADR-019 | ⏸️ Phase 4 |
| MFA TOTP | — | (D7 = não no MVP) | ⏸️ Phase 5 |

### Integrações (Pós-MVP)

| Feature | Provider | Story | Status |
|---------|----------|-------|--------|
| OCR PDFs (extratos, maquininhas) | Document AI vs GPT-4o-mini (D4) | 7.1 | ⏸️ Phase 7 |
| Asaas Pix automático | Asaas | 7.2 | ⏸️ Phase 7 |
| WhatsApp Business confirmação/cobrança | Meta WhatsApp Business API | 7.3 | ⏸️ Phase 7 |
| NFS-e | (D11 sugere postergar p/ Phase 8) | 7.4 | ⏸️ Phase 8 |
| Stripe billing SaaS (paywall) | Stripe + Customer Portal | (Phase 5) | ⏸️ Phase 5 |

---

## 3. Como cada coisa É/SERÁ feita (padrões técnicos)

### 3.1 Patterns aplicados (já no schema)

| Pattern | Onde | Razão |
|---------|------|-------|
| **Tenant isolation forte** | `org_id NOT NULL` + `FORCE ROW LEVEL SECURITY` em 18 tabelas | NFR-MT-01/02 |
| **Defense-in-depth contra org switch** | trigger `enforce_org_id_immutability` em UPDATE OF org_id | ADR-011 |
| **Snapshots imutáveis** | `price_snapshot`, `commission_snapshot`, `unit_cost_at_move` | Mudanças de catálogo não retroagem em comandas/transações |
| **EXCLUDE constraint** | `appointments` no double-book (gist + tstzrange) | Defense além do app |
| **Triggers como invariantes** | `appointment.done → command`, `payment → transaction → inventory` | Automação que não vaza |
| **Append-only ledgers** | `inventory_movements`, `audit_log` (UPDATE/DELETE bloqueados) | Auditoria + rastreabilidade |
| **Banker's rounding** | `round_half_even()` em SQL + Decimal.js no app | NFR-FI-01 |
| **JWT custom claim org_id** | função `custom_access_token_hook` (Auth Hook a ativar) | ADR-012 |
| **Views materializáveis (futuro)** | DRE atualmente VIEWs simples — promover a materialized se p99 > limite | NFR-PE-01 |

### 3.2 Patterns que SERÃO aplicados (no código)

| Pattern | Quando | Como |
|---------|--------|------|
| **Server Actions como API primária** | desde Story 1.1 | ADR-007; arquivos em `app/**/actions.ts`, validação Zod |
| **Dual Supabase client (server vs browser)** | Story 1.1 | ADR-008; `lib/supabase/server.ts` e `lib/supabase/browser.ts` |
| **Decimal.js no client/server** | toda lógica financeira | ADR-005; converter na borda Server Action |
| **TanStack Query** | fetching client-side | ADR-002 stack; cache + revalidation |
| **shadcn/ui copiado** | desde Story 1.5 | ADR-002; `components/ui/*` no repo, não dependência |
| **react-hook-form + zodResolver** | todo formulário | ADR-002 |
| **Inngest para jobs assíncronos** | Phase 4+ | ADR-009; recálculo DRE pesado, projeções |
| **Sentry desde dia 1** | Story 1.1 | ADR-015; frontend + backend + edge |
| **Performance budget** | toda PR | NFR-PE-01; FCP <1.5s no dashboard, bundle <400KB inicial |

### 3.3 Padrão de uma feature nova (do PRD ao deploy)

```
1. Story criada por @sm        → docs/stories/X.Y.story.md
2. Validada por @po            → status: Draft → Ready
3. Implementada por @dev       → migrations (se DB) + Server Actions + componentes UI + testes
4. CodeRabbit review automático → max 2 iterações de fix
5. QA gate por @qa             → 7 checks (code, tests, AC, regression, perf, security, docs)
6. Push por @devops            → main → Vercel auto-deploy → keyra.app
7. Story marcada Done          → atualizar este IMPLEMENTATION-MAP
```

---

## 4. Dependências críticas a desbloquear ANTES da Phase 1

| # | Bloqueador | Owner | Status |
|---|-----------|-------|--------|
| 1 | ~~Ativar Auth Hook `public.custom_access_token_hook`~~ | Luiz | ✅ ativo |
| 2 | ~~Provisionar `COLUMN_ENCRYPTION_KEY` no Vercel~~ | Luiz | ✅ provisionado |
| 3 | Validar paleta terracota com idealizadora | Luiz | conversa |
| 4 | Decidir split de pagamento (Pix + cartão na mesma comanda?) | Luiz com idealizadora | conversa |
| 5 | Confirmar formato de comparativo textual ("R$ X a mais que Y" vs "↑ R$ X vs Y") | Luiz com idealizadora | conversa |
| 6 | Resolver gaps PRD #1, #6, #7 (pricing absoluto, comissionamento, devoluções) | Luiz com idealizadora | conversa |
| 7 | Rodar `pnpm install && pnpm build` localmente para confirmar dependency tree (Story 1.1 não pôde validar via Bash sandbox) | Luiz | 5 min |

---

## 5. Roadmap de implementação por sprint

| Sprint | Foco | Stories | Saída visível |
|--------|------|---------|---------------|
| **Sprint 1** (1 sem) | Fundação técnica | 1.1 setup + 1.2 orgs + 1.3 profissionais + 1.4 RLS test + 1.5 layout | `keyra.app` mostra login + dashboard vazio (skeleton) |
| **Sprint 2** (2 sem) | Cadastros + Agenda | 2.1 → 2.7 | Cadastrar paciente/serviço, agendar, ver receita prevista |
| **Sprint 3** (2 sem) | Automação financeira | 3.1 → 3.8 | Marcar realizado → comanda → pagamento → transação → estoque (TUDO auto) |
| **Sprint 4** (1.5 sem) | DRE + Dashboard | 4.1 → 4.9 | **MVP feature-complete** — idealizadora pode usar com 1 cliente real |
| **Sprint 5** (3 sem) | Precificação + estoque inteligente | Phase 5 | Pós-MVP — começar piloto |
| **Sprint 6** (4 sem) | Inteligência + projeções | Phase 6 | Lucro por horário, what-if, prontuário financeiro |
| **Sprint 7** (6-8 sem) | Integrações | Phase 7 | OCR + Asaas + WhatsApp |

**Total para MVP feature-complete:** 6.5 semanas a partir do início da Sprint 1.

---

## 6. Sistema de notação usado neste mapa

| Símbolo | Significado |
|---------|-------------|
| ✅ | feito e validado |
| 🟡 | parcialmente feito (ex: schema pronto, UI faltando) |
| ⏸️ | planejado, não iniciado |
| 🔴 | bloqueador conhecido — precisa ação |
| ⏳ | pendente decisão (input humano necessário) |
| ❌ | não iniciado |

---

## 7. Como manter este mapa vivo

- **Story entregue:** atualizar status na linha correspondente.
- **Nova decisão técnica:** atualizar Section 3 (patterns) + linkar ADR.
- **Mudança de escopo:** atualizar Section 2 (mapeamento feature→tela→tabela).
- **Novo bloqueador:** adicionar na Section 4.
- **Sprint encerrado:** atualizar Section 5.

> **Single source of truth:** se um doc do PRD/ARCHITECTURE/EPIC contradiz este mapa, **este mapa vence** — depois propagar correção para os outros.

---

*KEYRA Implementation Map — atualizado por @aiox-master após cada story entregue.*
