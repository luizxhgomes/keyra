# KEYRA — Onde Paramos (snapshot executivo)

> **Data deste snapshot:** 2026-04-30 (Phase 1 aceita; Sprint 2 em andamento)
> **Última entrega:** Aceite formal da Phase 1 — migrations sincronizadas no remoto, typecheck/lint zerados, suíte RLS verde no CI (PR #1 mergeado em `main`), Resend ativo (`RESEND_API_KEY` + `EMAIL_FROM=KEYRA <no-reply@usekeyra.com>` em `.env.local`), domínio `usekeyra.com` registrado no Resend (Hostinger DNS, sa-east-1) em estado **Partially Verified** (SPF + DKIM ok, DMARC pendente).
> **Próxima ação recomendada:** (a) smoke test manual das 4 stories (1.3, 1.4, 2.1, 2.2) no dev local; (b) `@po *validate-story-draft` em 2.3 → 2.7; (c) `@dev *develop-story 2.4` (Agenda — desbloqueia 2.5/2.6/2.7); (d) `@devops` provisiona `RESEND_API_KEY` + `EMAIL_FROM` no Vercel (Production/Preview/Development) e finaliza DMARC do `usekeyra.com`.
>
> Este documento é a **entrada única** para retomar o contexto do KEYRA em qualquer nova sessão. Foi projetado para ser lido em menos de 60 segundos. Para detalhes, seguir os links canônicos ao final.

---

## 1. Status Macro

| Camada | Progresso | Detalhe |
|--------|-----------|---------|
| **Infraestrutura** | ✅ 100% | GitHub `luizxhgomes/keyra` · Vercel `usekeyra.vercel.app` (Hobby) · Supabase `keyra-br` sa-east-1 (Free) · Auth Hook ativo · `COLUMN_ENCRYPTION_KEY` provisionada |
| **Documentação (Phase 0)** | ✅ 100% | PRD v1.3 · ARCHITECTURE v1.3 (20 ADRs) · SCHEMA (21 tabelas · 100% RLS · 6 views · 15 funções · 19 migrations) · 8 wireframes · 6 pesquisas competitivas |
| **Phase 1 — Fundação Técnica** | ✅ **100% Done** | 1.1 ✅ · 1.2 ✅ · 1.3 ✅ · 1.4 ✅ · 1.5 ✅. PR #1 (`sprint/phase-1-2`) mergeado em `main`. Migrations 100% sincronizadas (22/22 no remoto), `database.types.ts` regenerado (1812 linhas), nenhum `as never` em `team/actions.ts`, suíte RLS verde no CI, Resend operacional. Pendência apenas operacional: DMARC final do `usekeyra.com` + provisionamento das vars Resend no Vercel (responsabilidade do `@devops`). |
| **Phase 2 — Catálogo + Agenda** | 🟡 ~30% | **Stories 2.1 (pacientes) e 2.2 (serviços + categorias) em InReview** — código entregue, typecheck + lint zerados. Drafts 2.3 a 2.7 prontos para validação pelo `@po`. Recomendação tática: pular 2.3 (insumos) e ir direto pra **2.4 (Agenda FullCalendar)** porque 2.5, 2.6 e 2.7 dependem dela. |
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

## 2.1. Aceite da Phase 1 (sessão 2026-04-30)

Verificações executadas e resultado:

| # | Item | Status | Evidência |
|---|------|--------|-----------|
| 1 | Migration 022 (`accept_organization_invite` + `count_org_owners`) aplicada no remoto | ✅ | `supabase migration list --linked` mostra 22/22 em sync |
| 2 | `database.types.ts` regenerado com schema atual | ✅ | 1812 linhas, 54 KB, gerado em 2026-04-20 16:50 |
| 3 | Nenhum cast `as never` em `team/actions.ts` | ✅ | `grep "as never"` retorna vazio |
| 4 | Suíte RLS verde no CI | ✅ | PR #1 mergeado em `main` com workflow `rls-tests.yml` aprovado |
| 5 | `RESEND_API_KEY` + `EMAIL_FROM` no `.env.local` | ✅ | `re_***[masked]***` + `KEYRA <no-reply@usekeyra.com>` (raiz e `apps/web/`) |
| 6 | Typecheck (`pnpm typecheck`) | ✅ | zero erros |
| 7 | Lint (`pnpm lint --max-warnings 0`) | ✅ | zero warnings |
| 8 | Domínio `usekeyra.com` no Resend | 🟡 Partially Verified | SPF + DKIM ok, DMARC pendente — não bloqueia envio, melhora deliverability |
| 9 | Smoke test manual das telas 1.3 / 1.4 / 2.1 / 2.2 | ⏳ | Pendente — cabe ao Luiz no dev local |
| 10 | Provisionar `RESEND_API_KEY` + `EMAIL_FROM` no Vercel (3 targets) | ⏳ | Pendente — operação do `@devops` |

### Mudanças desta sessão (a comitar)

- `apps/web/src/lib/env.ts` — default de `EMAIL_FROM` migrado de `keyra.app` para `usekeyra.com`
- `scripts/sync-env.sh` — passa a ler `.keyra-secrets/resend-api.key` e `.keyra-secrets/email-from.txt` (helper `read_line_or_empty` preserva espaço entre nome amigável e endereço)
- `.keyra-secrets/resend-api.key` (gitignored, chmod 600) — chave do Resend
- `.keyra-secrets/email-from.txt` (gitignored, chmod 600) — `KEYRA <no-reply@usekeyra.com>`

### Sprint 1 (Phase 1) — completo (entregue em 2026-04-20, aceito em 2026-04-30)

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

Phase 1 está **Done**. O caminho para fechar a Sprint 2 é:

```bash
# 1) Smoke test manual no dev local — confirma que nada regrediu
cd /Users/luizhenrique/keyra
pnpm --filter @keyra/web dev
# Caminhos a percorrer:
#   /login (magic link)         → /onboarding/nova-organizacao (se primeira vez)
#   /team, /team/profissionais, /team/convites, /invites/{token}
#   /pacientes, /pacientes/novo, /pacientes/{id}
#   /servicos, /servicos/categorias
# Se um convite for enviado: olhar console — deve aparecer 'id:' do Resend
# (não mais '[email:dry-run]'). Caixa de entrada do convidado deve receber.

# 2) Validar drafts da Sprint 2 com @po (10-point checklist)
@po *validate-story-draft 2.3   # Insumos + rateio
@po *validate-story-draft 2.4   # Agenda FullCalendar (a maior; bloqueia 2.5/2.6/2.7)
@po *validate-story-draft 2.5   # Agendamento
@po *validate-story-draft 2.6   # Status do agendamento
@po *validate-story-draft 2.7   # Receita prevista automática (trigger já no banco)

# 3) Implementar — recomendação: pular 2.3 e ir direto para 2.4
@dev *develop-story 2.4

# 4) QA Gate
@qa *qa-gate 2.4                # PASS / CONCERNS / FAIL / WAIVED

# 5) Push (apenas @devops)
@devops *push
```

### Operações paralelas do `@devops` (não bloqueiam Sprint 2)

```bash
# A) Provisionar Resend no Vercel (Production / Preview / Development)
vercel env add RESEND_API_KEY     # colar valor de .keyra-secrets/resend-api.key
vercel env add EMAIL_FROM         # KEYRA <no-reply@usekeyra.com>
# Redeploy para refletir.

# B) Finalizar DMARC do usekeyra.com no Resend
# Hostinger DNS → adicionar registro TXT _dmarc.usekeyra.com:
#   v=DMARC1; p=none; rua=mailto:dmarc@usekeyra.com
# Aguardar Resend transitar de "Partially Verified" para "Domain verified"
# (~minutos a horas dependendo da propagação).

# C) Comitar mudanças desta sessão (env.ts default + sync-env.sh)
@devops *push
```

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
| 2026-04-30 | **Aceite formal da Phase 1.** Verificação cruzada: 22/22 migrations no remoto, typecheck/lint zerados, sem `as never` em `team/actions.ts`, PR #1 mergeado em `main`. Resend ativado: `RESEND_API_KEY` + `EMAIL_FROM=KEYRA <no-reply@usekeyra.com>` em `.env.local` (raiz e `apps/web/`); domínio `usekeyra.com` no Resend em **Partially Verified** (SPF+DKIM ok, DMARC pendente). `scripts/sync-env.sh` estendido para ler `resend-api.key` e `email-from.txt`. Default em `env.ts` migrado de `keyra.app` para `usekeyra.com`. Pendências operacionais: (1) smoke test manual no dev, (2) provisionamento das vars Resend no Vercel, (3) DMARC final no Hostinger DNS. |
| 2026-04-30 (tarde) | **Smoke test em dev passou:** convite enviado para `luizxhenriquepro@gmail.com` chegou na caixa principal do Gmail com remetente `KEYRA <no-reply@usekeyra.com>`, template renderizado, link `/invites/{token}` válido — **Phase 1 validada de ponta a ponta**. Sessão @devops fechou: nameservers de `usekeyra.com` migrados Hostinger → Vercel; 5 registros DNS do Resend confirmados (`send` SPF, `send` MX, `resend._domainkey`, `_dmarc`); domínio agora **Verified** no Resend; `RESEND_API_KEY` (nova chave `re_9UB...`) + `EMAIL_FROM` provisionados em Production/Preview/Development do Vercel (REST API para Preview por causa de bug do CLI 50.38.x); commits `14696eb` (acceito Phase 1) e `6fd47b7` (polish: copy real na landing + magic link via Resend SMTP no Supabase) em `main`. SMTP customizado ativo: magic link de login passa a sair como `KEYRA <no-reply@usekeyra.com>` em vez do default `Supabase Auth`. |

> **Quando atualizar:** ao encerrar cada Story, cada Sprint ou ao bater um bloqueador novo. Fonte de verdade operacional, complementar ao `IMPLEMENTATION-MAP.md` (tático) e ao `EPIC-0` (estratégico).
