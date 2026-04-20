# KEYRA — Onde Paramos (snapshot executivo)

> **Data deste snapshot:** 2026-04-20 (noite — Sprint 2 iniciada)
> **Última entrega:** Stories 2.1 (pacientes) e 2.2 (serviços + categorias) implementadas e em `InReview`. Sprint 1 (Stories 1.3 + 1.4) também em `InReview` aguardando smoke test e Resend. Tudo commitável.
> **Próxima ação recomendada:** smoke test das 4 stories (1.3, 1.4, 2.1, 2.2) no dev server; commit + push; depois iniciar Story 2.3 (insumos) ou pular para 2.4 (agenda) conforme prioridade.
>
> Este documento é a **entrada única** para retomar o contexto do KEYRA em qualquer nova sessão. Foi projetado para ser lido em menos de 60 segundos. Para detalhes, seguir os links canônicos ao final.

---

## 1. Status Macro

| Camada | Progresso | Detalhe |
|--------|-----------|---------|
| **Infraestrutura** | ✅ 100% | GitHub `luizxhgomes/keyra` · Vercel `usekeyra.vercel.app` (Hobby) · Supabase `keyra-br` sa-east-1 (Free) · Auth Hook ativo · `COLUMN_ENCRYPTION_KEY` provisionada |
| **Documentação (Phase 0)** | ✅ 100% | PRD v1.3 · ARCHITECTURE v1.3 (20 ADRs) · SCHEMA (21 tabelas · 100% RLS · 6 views · 15 funções · 19 migrations) · 8 wireframes · 6 pesquisas competitivas |
| **Phase 1 — Fundação Técnica** | 🟢 100% (pendente aceite) | 1.1 ✅ · 1.2 ✅ · 1.3 🟡 InReview · 1.4 🟡 InReview · 1.5 ✅. Código entregue; migration já aplicada no remoto via `supabase db push`; typegen feito; testes RLS passam 100 % em Postgres local efêmero. |
| **Phase 2 — Catálogo + Agenda** | 🟡 ~30% | **Stories 2.1 (pacientes) e 2.2 (serviços + categorias) em InReview** — código entregue, typecheck + lint + build verdes. Drafts 2.3–2.7 criados. Próximo: 2.3 (insumos) ou 2.4 (agenda FullCalendar). |
| **Phases 3–7 — Features MVP+** | ⏸️ 0% UI | Schema completo no remoto; views `v_dre_*`, `v_cashflow_daily`, `v_dashboard_kpis`, `v_receitas_previstas` prontas para consumo |
| **Testes automatizados** | 🔴 0 | Nenhum arquivo `.test.*` ou `.spec.*` no repo. Validação manual + typecheck + lint + build apenas |

---

## 2. O Que Já Funciona em Produção

Rodando hoje em `usekeyra.vercel.app`:

- **Autenticação passwordless** — magic link com Zod + Sonner, callback `exchangeCodeForSession`, `proxy.ts` (renomeado do `middleware.ts` em Next 16) que protege rotas `(app)/*` e redireciona `/login` se já autenticado
- **Onboarding da 1ª organização** — formulário com CNPJ mascarado, RPC `create_org_with_owner` que resolve o chicken-and-egg do RLS, compensating delete em caso de falha
- **Org switcher** — dropdown quando há ≥ 2 memberships, texto puro quando há apenas 1; troca com refresh de JWT
- **User menu** — avatar + sign-out server action
- **AppShell** — Sidebar 240px no desktop + BottomNav de 5 itens no mobile; `requireAuth()` no layout `(app)`
- **Infra de código** — Supabase clients (`server`/`browser`/`middleware`/`admin` com `server-only`), Decimal.js (`ROUND_HALF_EVEN`), date-fns pt-BR, Sentry auto-init, Zod env validation, ESLint flat + Prettier, **Resend + React Email** (ADR-021)
- **Dashboard placeholder** — grid com componentes canônicos (`KPICard`, `ComparativoTexto`, `AlertCard`, `StatusBadge`) mostrando dados mockados — será substituído por queries reais na Story 4.4

## 2.1. Entregue nesta sessão (2026-04-20) — aguarda aceite

### Sprint 1 (Phase 1) — completo

- **Story 1.3** — Módulo `/team` com três sub-páginas (membros, profissionais, convites), Server Actions completas (CRUD profissionais, convite com Resend + React Email, aceite via RPC `accept_organization_invite`, promover/rebaixar/remover membros com invariante de último owner), rota pública `/invites/[token]` com 5 estados (bogus, consumido, expirado, email diferente, happy), item "Time" no Sidebar.
- **Story 1.4** — Suíte RLS expandida cobrindo 21 tabelas + smoke inverso (checa `pg_class.relrowsecurity`), workflow GitHub Actions `.github/workflows/rls-tests.yml` rodando em push/PR com Postgres 17 service container, badge no README, `docs/testing/rls-tests.md`, atalho `scripts/run-rls-tests.sh` com autodetect de libpq via Homebrew (macOS).
- **Tech debt zerado** — `middleware.ts` → `proxy.ts` (Next 16), `database.types.ts` com as 21 tabelas + 6 views (script `pnpm typegen` adicionado).
- **ADR-021** — Resend + React Email como provedor transacional, documentado em `ARCHITECTURE.md` §11.1.
- **Migration 022** — `accept_organization_invite` + `count_org_owners` **aplicadas no Supabase remoto** via `supabase db push`.
- **Testes RLS locais** — passaram 100 % em Postgres 17 efêmero (docker).

### Sprint 2 (Phase 2) — em andamento

- **Story 2.1 — Pacientes** — Página `/pacientes` com lista paginada (20/pág.) + busca fuzzy via `customers_full_name_trgm`, filtro "mostrar arquivados", paginação. Criar `/pacientes/novo` e editar `/pacientes/[id]` em páginas dedicadas. Actions `upsertPatient`, `archivePatient`, `unarchivePatient` com Zod + requireRole('professional'|'admin'). Placeholder de histórico de atendimentos (Story 2.4 preenche).
- **Story 2.2 — Serviços + Categorias** — Módulo `/servicos` com sub-nav (Serviços · Categorias). Lista agrupada por categoria, filtro por tipo (service/product), busca fuzzy. Form com nome, tipo, categoria, preço (BRL), custo, comissão (%), duração. `/servicos/categorias` com CRUD dedicado (nome, cor hex, sort_order). Usa `useWatch` de react-hook-form para evitar warning do React Compiler.
- **Drafts prontos** — Stories 2.3, 2.4, 2.5, 2.6, 2.7 em `docs/stories/*.story.md` (Draft — validação pelo @po na próxima sessão).

---

## 3. O Que Falta Para Fechar o MVP

### Sprint 1 — fundação técnica

✅ **Concluído nesta sessão.** Pendente apenas os 7 passos de aceite listados em §6 (aplicar migration, typegen, validar testes, subir Resend, push).

### Sprint 2 — Cadastros e Agenda (~2 semanas)

2.1 Pacientes ✅ (InReview) · 2.2 Serviços ✅ (InReview) · 2.3 Insumos + rateio ⏸️ Draft · 2.4 Agenda (FullCalendar dia/semana/mês) ⏸️ Draft · 2.5 Agendamento ⏸️ Draft · 2.6 Status ⏸️ Draft · 2.7 Receita prevista automática ⏸️ Draft

### Sprint 3 — Automação Financeira (~2 semanas) — *coração do diferencial*

3.1 Comanda automática (trigger `trg_appointments_done_to_command` já pronto no banco) · 3.2 Pagamento (Pix/cartão/dinheiro) · 3.3 Transação automática (trigger `trg_payments_to_transaction` já pronto) · 3.4 Receitas por profissional · 3.5 Despesas · 3.6 Custos fixos vs variáveis · 3.7 Fluxo de caixa · 3.8 Rateio de estoque

### Sprint 4 — DRE e Dashboard (~1.5 semana) — *fecha o MVP*

4.1 DRE básica · 4.2 **DRE por serviço** (diferencial anti-Conta-Azul) · 4.3 DRE por profissional · 4.4 Dashboard tela única · 4.5 Agenda do dia · 4.6 Indicadores (ticket médio, top serviço, no-show) · 4.7 Comparativo mês vs mês · 4.8 Comparativo vs meta · 4.9 Alertas

> **Prazo total para MVP feature-complete:** ~6,5 semanas a partir do próximo commit.

### Pós-MVP (Phases 5–7)

- **Phase 5** — Motor de precificação (BOM + margem), estoque com lote/validade, alertas de recompra, Stripe billing
- **Phase 6** — Projeções, what-if, rentabilidade por horário, prontuário financeiro, sugestões de upsell
- **Phase 7** — OCR de extratos e maquininhas, Asaas Pix, WhatsApp Business API, NFS-e

---

## 4. Bloqueadores de Decisão (precisam da idealizadora)

Nenhum destes impede a Story 1.3; mas cada um trava uma Story específica mais à frente:

| # | Decisão pendente | Trava |
|---|------------------|-------|
| 1 | Validar paleta terracota na prática | Design do Sprint 2 em diante |
| 2 | Arquitetura de split de pagamento (Pix + cartão na mesma comanda) | Story 3.2 |
| 3 | Formato do comparativo textual: "R$ X a mais que Y" vs "↑ R$ X vs Y" | Story 4.7 |
| 4 | Pricing absoluto dos planos Start / Crescimento / Autoridade | Comercial / landing |
| 5 | Comissionamento por senioridade (hierarquia de `%`)? | Cadastro de profissionais |
| 6 | Fluxo financeiro de devolução / desconto | Comanda (Story 3.x) |

---

## 5. Risco Operacional Imediato

- **Supabase Free pausa após 7 dias sem requests.** Última atividade significativa foi em 2026-04-16 (aplicação do schema + Story 1.2). Se nenhum acesso ocorrer até **2026-04-23**, o projeto entra em pausa. Mitigação: qualquer `curl` no endpoint público ou configurar cron de healthcheck no Vercel já no Sprint 1.
- **Plano Vercel Hobby** não permite uso comercial. Antes do primeiro pagante (Phase 5+) é obrigatório migrar para Pro.

---

## 6. Próxima Ação Concreta — Luiz

Para **fechar Phase 1 como Done** e partir para Sprint 2, rodar na ordem:

```bash
# 1) Aplicar migration 022 (novos RPCs: accept_organization_invite, count_org_owners)
cd /Users/luizhenrique/keyra
supabase db push

# 2) Regenerar tipos com a migration aplicada
#    (SUPABASE_PROJECT_REF já no .env.local)
pnpm --filter @keyra/web typegen

# 3) Limpar os dois casts `as never` em apps/web/src/app/(app)/team/actions.ts
#    (chamadas supabase.rpc('count_org_owners'|'accept_organization_invite'))
#    Agora o TypeScript reconhece os RPCs.

# 4) Rodar a suíte RLS localmente (Docker Desktop aberto)
./scripts/run-rls-tests.sh

# 5) Smoke test das Stories 1.3 e 1.4 no dev server
pnpm --filter @keyra/web dev
# Caminhos: /team, /team/profissionais, /team/convites, /invites/{token}

# 6) Subir provedor de email
#    a) resend.com → criar conta, verificar domínio keyra.app (SPF+DKIM+DMARC no Cloudflare)
#    b) gerar RESEND_API_KEY e provisionar em Vercel (todos 3 targets) + .env.local
#    c) definir EMAIL_FROM (default 'KEYRA <no-reply@keyra.app>')

# 7) Commit + push → workflow RLS Tests roda no GitHub Actions
git add -A
git commit -m "feat(team): Story 1.3 + 1.4 — convites, roles e suíte RLS em CI"
# (push via @devops)
```

Após os 7 passos: marcar Phase 1 como Done nos 3 docs vivos e iniciar `@sm *draft 2.1` (CRUD pacientes).

---

## 7. Referências Canônicas

Quando precisar de detalhes, abrir na ordem:

1. **Visão geral do plano** → [`docs/stories/EPIC-0-KEYRA-IMPLEMENTATION.md`](stories/EPIC-0-KEYRA-IMPLEMENTATION.md)
2. **Mapa feature × tela × tabela × ADR × story** → [`docs/IMPLEMENTATION-MAP.md`](IMPLEMENTATION-MAP.md)
3. **Requisitos funcionais (66 FR + 27 NFR + 27 CON)** → [`docs/prd/PRD-KEYRA.md`](prd/PRD-KEYRA.md)
4. **Decisões técnicas (20 ADRs)** → [`docs/architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md)
5. **Schema do banco** → [`docs/architecture/SCHEMA.md`](architecture/SCHEMA.md) + [`supabase/migrations/`](../supabase/migrations/)
6. **Estado da infraestrutura** → [`docs/INFRA-STATUS.md`](INFRA-STATUS.md)
7. **Wireframes** → [`docs/ux/wireframes/`](ux/wireframes/)
8. **Pesquisa competitiva** → [`docs/research/`](research/)

---

## 8. Histórico deste Snapshot

| Data | Mudança |
|------|---------|
| 2026-04-20 (manhã) | Documento criado. Phase 0 fechada. Phase 1 em ~60%. Story 1.2 endurecida com patches de RLS. Próxima: Story 1.3. |
| 2026-04-20 (tarde) | Stories 1.3 e 1.4 implementadas (tech debt zerado, ADR-021 Resend, convites + roles, suíte RLS + CI + badge). Phase 1 = 100% pendente 7 passos de aceite. |
| 2026-04-20 (noite) | Migration 022 aplicada no remoto, typegen feito, testes RLS passam local. Sprint 2 iniciado: Stories 2.1 (pacientes) e 2.2 (serviços + categorias) implementadas. Drafts 2.3–2.7 criados. |

> **Quando atualizar:** ao encerrar cada Story, cada Sprint ou ao bater um bloqueador novo. Fonte de verdade operacional, complementar ao `IMPLEMENTATION-MAP.md` (tático) e ao `EPIC-0` (estratégico).
