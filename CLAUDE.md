# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Idioma:** Todo conteúdo (chat, commits, docs, código) DEVE ser pt-BR com acentuação correta. Detalhes em `.claude/CLAUDE.md` (regra primária do AIOX, ainda vale).
> **Framework de orquestração:** Synkra AIOX rege o fluxo story-driven (`@sm` → `@po` → `@dev` → `@qa` → `@devops`). Regras em `.claude/CLAUDE.md` e `.claude/rules/`.

---

## Arquitetura — visão de 60 segundos

KEYRA é um SaaS B2B financeiro-operacional para clínicas de estética. A tese diferenciadora é que **o financeiro nasce automaticamente da operação**, não de lançamento manual:

```
Serviço → Agenda → Comanda → Pagamento → Transação → DRE → Decisão
```

A automação acontece no banco via triggers (`trg_appointments_done_to_command`, `trg_payments_to_transaction`) — não em código de aplicação. A aplicação é uma camada fina sobre um schema Postgres rico (21 tabelas, 6 views materializadas/lógicas, ~15 funções).

### Forma do repo

- **Monorepo pnpm workspace** com **um único app fullstack** em `apps/web/` (decisão consciente — ADR-006). Não há backend separado: tudo é Next.js App Router + Server Actions + Supabase.
- **Banco como autoridade:** schema, RLS, triggers e views vivem em `supabase/migrations/`. A aplicação consome via Supabase JS clients tipados a partir de `apps/web/src/types/database.types.ts` (gerado por `pnpm typegen`).
- **Multi-tenancy por JWT claim:** cada usuário tem um `org_id` injetado no JWT pelo Auth Hook `public.custom_access_token_hook`. Toda RLS policy filtra por esse claim. Sem `org_id` no token → consulta retorna vazio (não erro). Trocar de organização exige refresh do JWT.
- **Decimal.js com `ROUND_HALF_EVEN`** é invariante em todo o app (espelha `round_half_even()` do Postgres — NFR-FI-01). Configurado uma vez em `apps/web/src/lib/money.ts`. Nunca usar `Number` para dinheiro.

### Camadas críticas em `apps/web/src/`

| Caminho | Responsabilidade | Cuidados |
|---------|------------------|----------|
| `proxy.ts` | Refresh de sessão Supabase + auth gating por prefixo de rota. | Renomeado de `middleware.ts` (Next 16). Inlina o cliente SSR para fazer cookie-rotation + `getUser()` na mesma passada. |
| `lib/supabase/{server,browser,middleware,admin}.ts` | 4 clientes distintos por contexto. | `admin.ts` tem `import 'server-only'` — usa `SUPABASE_SERVICE_ROLE_KEY` e bypassa RLS. NUNCA importar de client components. |
| `lib/auth/require-auth.ts` | Guard server-side (redirect /login ou /onboarding). | Usar no topo de toda página/layout protegido e em toda Server Action mutativa. Middleware é primeira linha; `requireAuth` é a definitiva. |
| `lib/env.ts` | Schema Zod das envs, valida no boot e aborta se inválido. | Server-only secrets são `.optional()` no schema para client bundles tree-shake. Adicionar nova env aqui antes de usar em código. |
| `lib/money.ts` | `formatBRL`, `formatCentsBRL`, `sumDecimal`. | NUNCA chamar `Decimal.set` de novo em runtime. |
| `app/(app)/*` | Rotas autenticadas com AppShell (Sidebar 240px + BottomNav). | Cada feature tem `actions.ts` colado às páginas (Server Actions). |
| `app/(auth)/*` | Login passwordless via magic link. Callback em `app/auth/callback/`. | Bounces logged-in users via `proxy.ts`. |
| `app/onboarding/nova-organizacao/` | Resolve chicken-and-egg do RLS via RPC `create_org_with_owner`. | Tem compensating delete em caso de falha — replicar esse padrão para qualquer fluxo que crie linhas em múltiplas tabelas com RLS. |
| `components/keyra/` | Primitivos do produto: `KPICard`, `ComparativoTexto`, `AlertCard`, `StatusBadge`. | Reflete os princípios UX inegociáveis (números absolutos, comparativos textuais, sem gráficos). |
| `components/ui/` | shadcn/ui base (button, card, dialog, input, etc.). | Estendendo, não inventando — manter alinhado ao registry. |

### Caminhos absolutos

Path alias `@/*` → `./src/*` (configurado em `apps/web/tsconfig.json`). TypeScript em modo estrito com `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` — mudanças em tipos podem causar quebras silenciosas em código que indexa arrays/objetos.

---

## Comandos

Raiz do repo (delegam para `@keyra/web` via pnpm filter — `npm` aqui não funciona, é workspace pnpm):

```bash
pnpm dev          # Next dev server (porta padrão 3000)
pnpm build        # Next build de produção
pnpm start        # Servir build
pnpm lint         # ESLint --max-warnings 0 (zero warnings tolerados)
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier write
pnpm format:check # Prettier check (CI)
pnpm typegen      # Regenera apps/web/src/types/database.types.ts a partir do projeto Supabase remoto
```

### Banco / migrations / testes RLS

```bash
# Aplicar migrations no Supabase remoto (login via SUPABASE_ACCESS_TOKEN do .env.local)
supabase db push

# Regenerar tipos depois de qualquer migration que altere schema público
pnpm typegen

# Suíte completa de testes RLS contra Postgres 17 efêmero (Docker)
./scripts/run-rls-tests.sh
# Mata/reinicia container `keyra-rls-tests`, aplica TODAS as migrations em ordem,
# roda supabase/tests/rls_isolation.test.sql. Mesmo fluxo que o CI executa.
# Requer Docker rodando + psql client (no macOS Homebrew, brew link --force libpq).
```

CI (GitHub Actions, `.github/workflows/rls-tests.yml`): `push`/`PR` → service container Postgres 17 → migrations → suíte RLS. Badge no README.

### Workflow story-driven

Todo desenvolvimento parte de uma story em `docs/stories/{epic}.{n}.story.md`. Estado canônico em `docs/STATE.md` (snapshot vivo) e `docs/IMPLEMENTATION-MAP.md` (matriz feature × tela × tabela × ADR × story). Sequência típica:

1. `@sm *draft {storyId}` — gera story do epic
2. `@po *validate-story-draft` — checklist de 10 pontos, GO/NO-GO
3. `@dev *develop-story` — implementa, atualiza checkboxes e File List
4. `@qa *qa-gate` — PASS/CONCERNS/FAIL/WAIVED
5. `@devops *push` — operação exclusiva (push / PR / merge)
6. **Sync `docs/STATE.md`** — após cada story atingir `Done`, atualizar header (data + última entrega + próxima ação), tabela §1 Status Macro (pontos da Sprint), §3 lista de stories da sprint atual, §6 Próxima Ação Concreta e adicionar entrada nova em §8 Histórico. Commit com `docs(state): Story X.Y Done — ...` e push. Sem essa etapa, a próxima sessão lê estado errado.

`git push`, `gh pr create/merge` e gerência de MCP são **exclusivos** do `@devops` — qualquer outro agente delega.

---

## Invariantes que quebram o produto se violadas

1. **JWT `org_id`:** toda query autenticada depende do claim. Se você criar uma rota nova e ela retornar vazio em produção, primeiro suspeite do JWT (Auth Hook ativo? sessão refrescada após `switch-organization`?), não de RLS policy.
2. **RLS sempre ativada:** o smoke-test inverso em `rls_isolation.test.sql` checa `pg_class.relrowsecurity` em todas as 21 tabelas. Migration nova com `CREATE TABLE` precisa habilitar RLS + adicionar policies + cobrir no teste.
3. **Decimal.js no boundary:** strings entram e saem como string; conversões para `Number` apenas no `Intl.NumberFormat`. Postgres usa `numeric` com `ROUND_HALF_EVEN`; o JS deve casar.
4. **`server-only` é literal:** `lib/supabase/admin.ts` e helpers que tocam `SUPABASE_SERVICE_ROLE_KEY` têm `import 'server-only'`. Qualquer import desses de client component quebra o build — é a barreira intencional, não um erro.
5. **`proxy.ts` (não `middleware.ts`):** Next 16 renomeou. Manter o nome `proxy.ts` e a `config.matcher` que exclui assets estáticos mas inclui `/api/*` (cookies precisam rotacionar em mutações).
6. **Princípios UX inegociáveis:** números absolutos, comparativos textuais ("R$ 2.300 a mais que o mês passado"), tela única, zero gráficos no MVP. Se uma story propor gráfico, validar com a idealizadora antes — não é gosto, é tese.

---

## Stack e ADRs

Decisões em `docs/architecture/ARCHITECTURE.md` (20 ADRs). Stack atual:

- **Next.js 16** (App Router, Server Actions, `typedRoutes`, React 19)
- **Supabase** (Postgres 17 sa-east-1, Auth, RLS multi-tenant) — projeto `keyra-br`
- **Vercel Hobby** (auto-deploy de `main`) — `usekeyra.vercel.app` é a URL de produção; domínio `keyra.app` pendente DNS
- **Sentry** auto-init via `instrumentation.ts` / `instrumentation-client.ts`
- **Resend + React Email** (ADR-021) para transacionais — sem `RESEND_API_KEY` o helper `sendEmail` faz dry-run no console
- **TanStack Query + Table**, **react-hook-form + Zod**, **shadcn/ui + Radix**, **Tailwind 3**, **date-fns** pt-BR, **decimal.js**, **sonner** (toasts), **lucide-react** (com `modularizeImports` em `next.config.ts`)
- **Inngest** (jobs, ainda não plugado), **Stripe** (SaaS billing futuro), **Asaas** (Pix operacional futuro)

Configuração de envs: `.env.local` real é gerado a partir de `.keyra-secrets/` (gitignored) via `./scripts/sync-env.sh`. Template público em `.env.local.example`. `COLUMN_ENCRYPTION_KEY` é 64-hex (256 bits) usada por pgcrypto para CPF (ADR-017).

---

## Documentos canônicos (abrir nesta ordem quando precisar de contexto)

1. `docs/STATE.md` — snapshot executivo (onde paramos, próxima ação)
2. `docs/IMPLEMENTATION-MAP.md` — matriz feature × tela × tabela × ADR × story
3. `docs/stories/EPIC-0-KEYRA-IMPLEMENTATION.md` — visão do plano
4. `docs/prd/PRD-KEYRA.md` — 66 FR / 27 NFR / 27 CON
5. `docs/architecture/ARCHITECTURE.md` — 20 ADRs
6. `docs/architecture/SCHEMA.md` + `supabase/migrations/` — schema vivo
7. `docs/INFRA-STATUS.md` — estado da infraestrutura
