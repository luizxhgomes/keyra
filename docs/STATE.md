# KEYRA — Onde Paramos (snapshot executivo)

> **Data deste snapshot:** 2026-04-30 — Phase 1 Done + Story 2.4 Done; Sprint 2 a ~50%.
> **Última entrega:** Story 2.4 (Agenda FullCalendar) implementada, QA gate PASS e validada em produção em `https://usekeyra.com/agenda` (empty state + toolbar + responsividade + i18n + auth gating todos OK). 5 stories Ready para o `@dev` (2.3, 2.5, 2.6, 2.7) — 2.4 fechou o ciclo SDC completo (sm→po→dev→qa→devops). Magic link e convite saem como `KEYRA <no-reply@usekeyra.com>`; `usekeyra.com` é canônico em todo lugar; bug do `?next=` no magic link corrigido. **9 commits hoje em `main`** (`14696eb` → `c97d2f3`).
> **Próxima ação recomendada:** `@dev *develop-story 2.5` (Agendamento — cria os primeiros agendamentos reais e desbloqueia smoke completo da agenda); depois 2.6 e 2.7 em sequência; 2.3 (Insumos) é independente, pode entrar a qualquer momento.
>
> Este documento é a **entrada única** para retomar o contexto do KEYRA em qualquer nova sessão. Foi projetado para ser lido em menos de 60 segundos. Para detalhes, seguir os links canônicos ao final.

---

## 1. Status Macro

| Camada | Progresso | Detalhe |
|--------|-----------|---------|
| **Infraestrutura** | ✅ 100% | GitHub `luizxhgomes/keyra` · **Vercel domínio canônico `https://usekeyra.com`** (Hobby; alias `usekeyra.vercel.app` continua respondendo) · Supabase `keyra-br` sa-east-1 (Free) · Auth Hook ativo · `COLUMN_ENCRYPTION_KEY` provisionada · `RESEND_API_KEY` + `EMAIL_FROM` + `NEXT_PUBLIC_SITE_URL=https://usekeyra.com` em Production/Preview do Vercel · Resend `usekeyra.com` **Verified** (DMARC, DKIM, SPF, MX) · SMTP customizado do Supabase Auth apontando para Resend |
| **Documentação (Phase 0)** | ✅ 100% | PRD v1.3 · ARCHITECTURE v1.3 (20 ADRs) · SCHEMA (21 tabelas · 100% RLS · 6 views · 15 funções · 19 migrations) · 8 wireframes · 6 pesquisas competitivas |
| **Phase 1 — Fundação Técnica** | ✅ **100% Done + validado em prod** | 1.1 ✅ · 1.2 ✅ · 1.3 ✅ · 1.4 ✅ · 1.5 ✅. PR #1 mergeado em `main`. Migrations 100% sincronizadas (22/22 no remoto), `database.types.ts` regenerado, suíte RLS verde no CI, Resend Verified, fluxo de convite **end-to-end testado em produção**: convidado recebe email da marca KEYRA, clica, autentica via magic link, retorna ao convite (graças ao fix do `?next=`), aceita e cai no dashboard da clínica. |
| **Phase 2 — Catálogo + Agenda** | 🟢 ~50% | Stories 2.1 e 2.2 em InReview · **Story 2.4 (Agenda FullCalendar) ✅ Done — implementada, QA gate PASS, validada em prod** · Stories 2.3 (Insumos), 2.5 (Agendamento), 2.6 (Status) e 2.7 (Receita prevista) Ready. Próximo @dev: 2.5 (cria os primeiros agendamentos reais e desbloqueia smoke completo da agenda). |
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
| 8 | Domínio `usekeyra.com` no Resend | ✅ **Verified** | Re-verificou sozinho após NS Hostinger → Vercel; 5 registros confirmados (`send` SPF, `send` MX, `resend._domainkey`, `_dmarc`, MX inbound apex) |
| 9 | Smoke test manual em **dev** (1.3 + 2.1 + 2.2) | ✅ | Login + onboarding + criação de pacientes/serviços OK; convite enviado para `luizxhenriquepro@gmail.com` chegou na inbox principal com remetente `KEYRA` e template renderizado |
| 10 | Provisionar `RESEND_API_KEY` + `EMAIL_FROM` no Vercel (3 targets) | ✅ | Adicionados via CLI (Production/Development) e REST API (Preview, devido a bug do CLI 50.38.x). Também `NEXT_PUBLIC_SITE_URL=https://usekeyra.com` em Production+Preview |
| 11 | SMTP customizado no Supabase Auth | ✅ | `smtp.resend.com:587` com sender `KEYRA <no-reply@usekeyra.com>` — magic link agora sai pela marca, não mais como `Supabase Auth` |
| 12 | Bug fix: `?next=` propagado pelo magic link inteiro | ✅ | Helper `lib/auth/safe-next.ts` (anti open-redirect) + 5 pontos da cadeia (`/login` page+form+action, `/auth/callback`, `proxy.ts`). Convite agora retorna ao `/invites/{token}` após autenticar — não cai mais em `/onboarding/nova-organizacao` |
| 13 | Smoke test do fluxo de convite **em produção** | ✅ | Email com link `https://usekeyra.com/invites/{token}` chegou ao destinatário; aceite confirmado |

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

Nenhum impede a próxima Story (2.4 — Agenda); cada um trava uma Story específica mais à frente:

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

- **Supabase Free pausa após 7 dias sem requests.** Última atividade em 2026-04-30 (login + onboarding + smoke test em prod) — janela de pausa empurrada para ~2026-05-07. Mitigação preventiva: criar cron de healthcheck (curl simples no endpoint REST) já na Sprint 2, idealmente embarcado na Story de Agenda (que vai naturalmente bater no banco).
- **Plano Vercel Hobby** não permite uso comercial. Antes do primeiro pagante (Phase 5+) é obrigatório migrar para Pro.
- **Tech debt residual da Phase 1** (não bloqueia Sprint 2 mas vale registrar): warning recorrente do Supabase em todas as requests — `Using the user object as returned from supabase.auth.getSession() ... may not be insecure`. Ação: trocar `getSession()` server-side por `getUser()` em todos os entry points autenticados. Boa candidata para uma `1.6 — polish & hardening` ou para ser ratada na primeira story da Sprint 2 que tocar o auth path.

---

## 6. Próxima Ação Concreta — Luiz

Phase 1 está **Done e validada em prod**. Aceite e infra zero pendentes — a Sprint 2 é o foco exclusivo.

### Caminho para fechar a Sprint 2

```text
1) @po *validate-story-draft 2.4   # Agenda FullCalendar — bloqueia 2.5/2.6/2.7
2) @po *validate-story-draft 2.3   # Insumos + rateio (pode ir em paralelo)
3) @po *validate-story-draft 2.5   # Agendamento
4) @po *validate-story-draft 2.6   # Status do agendamento
5) @po *validate-story-draft 2.7   # Receita prevista automática (trigger já no banco)

6) @dev *develop-story 2.4         # Implementar Agenda primeiro
7) @qa *qa-gate 2.4                # PASS / CONCERNS / FAIL / WAIVED
8) @devops *push                   # apenas @devops faz git push

# Repetir 6-8 para 2.3, 2.5, 2.6, 2.7 (2.5+ podem ir em paralelo após 2.4)
```

### Pendência operacional única ainda em aberto

- **`apps/web/.vercel/`** foi linkado nesta sessão e está gitignored (`.vercel/`) — a próxima sessão pode reutilizar. Caso outra máquina precise, rodar `vercel link --project keyra --scope luiz-henrique-sealdigital --token=$VERCEL_TOKEN --yes`.

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
| 2026-04-20 (sessão A) | Documento criado. Phase 0 fechada. Phase 1 em ~60%. Story 1.2 endurecida com patches de RLS. Próxima: Story 1.3. |
| 2026-04-20 (sessão B) | Stories 1.3 e 1.4 implementadas (tech debt zerado, ADR-021 Resend, convites + roles, suíte RLS + CI + badge). Phase 1 = 100% pendente 7 passos de aceite. |
| 2026-04-20 (sessão C) | Migration 022 aplicada no remoto, typegen feito, testes RLS passam local. Sprint 2 iniciado: Stories 2.1 (pacientes) e 2.2 (serviços + categorias) implementadas. Drafts 2.3–2.7 criados. |
| 2026-04-30 | **Aceite formal da Phase 1.** Verificação cruzada: 22/22 migrations no remoto, typecheck/lint zerados, sem `as never` em `team/actions.ts`, PR #1 mergeado em `main`. Resend ativado: `RESEND_API_KEY` + `EMAIL_FROM=KEYRA <no-reply@usekeyra.com>` em `.env.local` (raiz e `apps/web/`); domínio `usekeyra.com` no Resend em **Partially Verified** (SPF+DKIM ok, DMARC pendente). `scripts/sync-env.sh` estendido para ler `resend-api.key` e `email-from.txt`. Default em `env.ts` migrado de `keyra.app` para `usekeyra.com`. Pendências operacionais: (1) smoke test manual no dev, (2) provisionamento das vars Resend no Vercel, (3) DMARC final no Hostinger DNS. |
| 2026-04-30 — sessão @devops (smoke + DNS + envs) | **Smoke test em dev passou:** convite enviado para `luizxhenriquepro@gmail.com` chegou na caixa principal do Gmail com remetente `KEYRA <no-reply@usekeyra.com>`, template renderizado, link `/invites/{token}` válido — **Phase 1 validada de ponta a ponta**. Sessão @devops fechou: nameservers de `usekeyra.com` migrados Hostinger → Vercel; 5 registros DNS do Resend confirmados (`send` SPF, `send` MX, `resend._domainkey`, `_dmarc`); domínio agora **Verified** no Resend; `RESEND_API_KEY` (nova chave `re_9UB...`) + `EMAIL_FROM` provisionados em Production/Preview/Development do Vercel (REST API para Preview por causa de bug do CLI 50.38.x); commits `14696eb` (acceito Phase 1) e `6fd47b7` (polish: copy real na landing + magic link via Resend SMTP no Supabase) em `main`. SMTP customizado ativo: magic link de login passa a sair como `KEYRA <no-reply@usekeyra.com>` em vez do default `Supabase Auth`. |
| 2026-04-30 — sessão de canonização do domínio | **`usekeyra.com` consolidado como canônico em todo lugar.** Helper `getAbsoluteUrl()` (apps/web/src/lib/url.ts) reordenado: 1ª preferência `NEXT_PUBLIC_SITE_URL`, 2ª headers (preview/dev), 3ª fallback `https://usekeyra.com`. Vercel: `NEXT_PUBLIC_SITE_URL=https://usekeyra.com` provisionado em Production+Preview (Development fica vazio para `pnpm dev` continuar usando localhost). Supabase Auth: `site_url` migrado de `https://usekeyra.vercel.app` para `https://usekeyra.com`; `uri_allow_list` atualizado removendo `keyra.app` (domínio antigo descontinuado) e adicionando `usekeyra.com/auth/callback`. Convite vigente reenviado pelo Resend com link `usekeyra.com`. Commits `0a99da8` (docs) e `7660754` (helper). |
| 2026-04-30 — fix do `?next=` no magic link | **Bug crítico corrigido — fluxo de convite ponta-a-ponta.** Diagnóstico: ao clicar "Aceitar convite" no email, o convidado caía em `/onboarding/nova-organizacao` em vez de aceitar — o `?next=` setado por `/invites/[token]` não sobrevivia ao magic link. Causa: 5 elos quebrados (page do login, form, action, callback, proxy). Correção: helper `apps/web/src/lib/auth/safe-next.ts` (`isSafeNextPath` valida contra open redirect — recusa `//`, `://`, paths não relativos) + propagação de `next` em toda a cadeia. `signInWithOtpAction` agora monta `emailRedirectTo=${origin}/auth/callback?next=<encoded>`; `/auth/callback` lê e valida `?next=` antes de cair no roteamento por membership; `proxy.ts` respeita `next` quando user logado bate em `/login?next=`. `uri_allow_list` do Supabase expandido com wildcard `**` em todos os origins do callback para aceitar query strings. Commit `719783e` (6 arquivos, +88 -13). Smoke test em prod confirmou aceite do convite e entrada no dashboard da clínica. |
| 2026-04-30 — Sprint 2 destrancada (@po + Story 2.4) | **5 stories validadas pelo `@po`** (drafts 2.3-2.7 → todas Ready). Aplicados fixes mínimos em 2.5/2.6/2.7 (DoD ausente, Dependencies, UX gaps); enriquecida 2.4 com Dev Notes (timezone, locale, role, cap eventos). **Story 2.4 (Agenda) implementada e validada em produção**: 5 arquivos novos em `app/(app)/agenda/`, 2 componentes shadcn (`sheet`, `select`), 5 deps FullCalendar v6. AC1/AC3/AC4/AC5 cumpridos; AC2.1 (resource-timegrid premium) substituído por filtro via `Select` — tech debt registrado em Dev Decisions §1. QA gate **PASS** com 1 concern documentado (resource-timegrid). Smoke em prod (`https://usekeyra.com/agenda`): empty state + toolbar + responsividade + i18n + auth gating todos OK. Commits `b633a44` (po validation), `318c5c1` (dev impl), `c97d2f3` (qa gate Done). |

> **Quando atualizar:** ao encerrar cada Story, cada Sprint ou ao bater um bloqueador novo. Fonte de verdade operacional, complementar ao `IMPLEMENTATION-MAP.md` (tático) e ao `EPIC-0` (estratégico).
