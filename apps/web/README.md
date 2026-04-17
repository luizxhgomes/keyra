# @keyra/web

KEYRA — Next.js application (App Router). Single fullstack app per ADR-006.

> **Story 1.1:** scaffold inicial com fundação técnica completa (estrutura,
> design system, Supabase clients, observabilidade, layout autenticado).
> Login real, dashboard real e features virão nas próximas stories.

---

## Stack instalado (versões reais — Story 1.1)

| Camada | Pacote | Versão | Notas |
|--------|--------|--------|-------|
| Framework | `next` | **15.1.0** | App Router. Veja "Next 16 fallback" abaixo. |
| Runtime UI | `react` / `react-dom` | 19.0.0 | RSC + Server Actions. |
| Linguagem | `typescript` | ^5.7 | `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. |
| CSS | `tailwindcss` | **^3.4.15** | Veja "Tailwind v4 fallback" abaixo. |
| Animações | `tailwindcss-animate` | ^1.0.7 | Para shadcn. |
| Components | shadcn/ui (copiado) | new-york | `button`, `card`, `input`, `label`, `badge` instalados. |
| Radix primitives | `@radix-ui/react-{slot,label,dialog,dropdown-menu}` | latest | Base de acessibilidade. |
| Auth/DB SDK | `@supabase/supabase-js` + `@supabase/ssr` | ^2.46 / ^0.5 | Dual client (server/browser/admin). |
| State | `@tanstack/react-query` + `@tanstack/react-table` | 5.x / 8.x | Cache + tabelas headless. |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` | latest | Type-safe forms. |
| Money | `decimal.js` | ^10.4 | `ROUND_HALF_EVEN` (NFR-FI-01). |
| Date | `date-fns` (v4) | ^4.1 | Locale `pt-BR`. |
| Icons | `lucide-react` | ^0.460 | Tree-shakeable via `modularizeImports`. |
| Toasts | `sonner` | ^1.7 | Mounted no `RootLayout`. |
| Observabilidade | `@sentry/nextjs` | ^8.40 | Auto-init via `instrumentation.ts`. |
| Lint/Format | `eslint` 9 + `next/core-web-vitals` + `prettier` 3 | latest | Flat config (`eslint.config.mjs`). |

### Decisões de fallback registradas

#### Next.js 15.1 em vez de Next.js 16

A spec da Story pedia **Next.js 16**. No momento do scaffold (2026-04-16), a versão
estável recomendada do canal `latest` no npm era a **15.1.0** (a linha 16 ainda
estava em release candidate). Optei por **15.1.0** para manter o build verde no
Vercel sem precisar de `--legacy-peer-deps` ou flags experimentais.

**Plano de upgrade:** quando Next 16 ficar `latest` no npm, basta:
```bash
pnpm -F @keyra/web add next@latest eslint-config-next@latest react@latest react-dom@latest
```
Sem mudanças de código esperadas — App Router + Server Actions + RSC continuam
estáveis na 16. Migração planejada para Story 1.5 ou primeira da Phase 2.

#### Tailwind 3.4 em vez de Tailwind v4 beta

Spec pedia Tailwind v4. Em 2026-04, v4 ainda tinha edge cases com `tailwindcss-animate`
e PostCSS plugin order que afetam shadcn. Optei por **3.4.15** (estável + 100%
compatível com shadcn new-york + plugin animate).

**Plano de upgrade:** assim que a Story 1.5 estabilizar a UI principal, abrir
ticket para migrar para v4 (CSS-first config, sem `tailwind.config.ts`). É
uma migração mecânica documentada pelo time Tailwind.

---

## Estrutura

```
apps/web/
├── components.json           # shadcn config
├── eslint.config.mjs         # ESLint flat (Article VI enforce)
├── next.config.ts
├── next-env.d.ts             # gerado (gitignored em CI; commitado p/ scaffold)
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json             # strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx                # RootLayout — fonts, metadata, Toaster
    │   ├── page.tsx                  # Landing pública
    │   ├── globals.css               # Design tokens KEYRA
    │   ├── (auth)/login/page.tsx     # Placeholder (Story 1.2)
    │   └── (app)/
    │       ├── layout.tsx            # AppShell wrapper
    │       └── dashboard/page.tsx    # Placeholder com showcase de componentes KEYRA
    ├── components/
    │   ├── ui/                       # shadcn primitives (button, card, input, label, badge)
    │   ├── keyra/                    # Componentes canônicos KEYRA
    │   │   ├── KPICard.tsx
    │   │   ├── ComparativoTexto.tsx
    │   │   ├── AlertCard.tsx
    │   │   ├── StatusBadge.tsx
    │   │   └── index.ts
    │   └── layout/
    │       ├── Sidebar.tsx           # Desktop nav (≥ lg)
    │       ├── BottomNav.tsx         # Mobile nav (< lg)
    │       └── AppShell.tsx          # Header + sidebar + bottom + main
    ├── lib/
    │   ├── env.ts                    # Zod-validated env vars
    │   ├── utils.ts                  # cn() helper
    │   ├── money.ts                  # Decimal.js + formatBRL
    │   ├── date.ts                   # date-fns + ptBR
    │   └── supabase/
    │       ├── server.ts             # createServerClient (RSC + actions)
    │       ├── browser.ts            # createBrowserClient (client comps)
    │       ├── middleware.ts         # session refresh
    │       └── admin.ts              # service-role (server-only, jobs/webhooks)
    ├── middleware.ts                 # Next.js middleware (chama updateSession)
    ├── instrumentation.ts            # Sentry init server (Node + Edge)
    ├── instrumentation-client.ts     # Sentry init browser
    └── types/
        └── database.types.ts         # Placeholder Supabase types (pnpm typegen para regerar)
```

---

## Comandos

A partir da raiz do repo (preferido):

```bash
pnpm install              # instala todo o workspace
pnpm dev                  # Next.js dev server em http://localhost:3000
pnpm build                # build de produção (Vercel também roda isso)
pnpm start                # serve build de produção
pnpm lint                 # next lint (eslint flat config)
pnpm typecheck            # tsc --noEmit
pnpm format               # prettier --write .
pnpm format:check         # prettier --check .
pnpm typegen              # regenera src/types/database.types.ts a partir do schema Supabase remoto
```

Direto na app:

```bash
pnpm -F @keyra/web dev    # equivalente
```

---

## Como rodar localmente

### 1. Pré-requisitos

- Node.js >= 22 LTS
- pnpm >= 9 (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)

### 2. Variáveis de ambiente

A fonte da verdade é `.keyra-secrets/` (gitignored). Sincronize antes de rodar:

```bash
./scripts/sync-env.sh
```

Isso gera tanto `/.env.local` (raiz, para scripts) quanto `apps/web/.env.local`
(o que o Next lê). Tokens administrativos (Vercel, GitHub, Supabase CLI) são
filtrados na cópia da app — apenas vars necessárias ao runtime ficam em
`apps/web/.env.local`.

### 3. Rodar

```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

A landing pública aparece em `/`. O dashboard placeholder em `/dashboard` (sem
auth na Story 1.1; Story 1.2 adiciona o guard).

---

## Convenções

- **Imports absolutos via `@/*`** (Constitution Article VI). ESLint bloqueia
  imports relativos profundos (`../../../`).
- **Server Actions como API primária** (ADR-007). Route Handlers só para
  webhooks externos.
- **Decimal.js para tudo que é dinheiro** (ADR-005 / NFR-FI-01). Nunca `Number`
  ou `parseFloat` em valores financeiros.
- **RLS sempre via `createServerClient`** (ADR-008). `admin.ts` é restrito a
  jobs e webhooks (importa `'server-only'`).
- **shadcn copiado, não dependência** — componentes em `components/ui/` podem
  ser editados livremente.
- **Componentes KEYRA-específicos** vão em `components/keyra/` e devem ser
  documentados em `docs/ux/wireframes/06-componentes-criticos.md` ANTES de
  serem implementados.

---

## Referências

- Mapa de implementação vivo: [`/docs/IMPLEMENTATION-MAP.md`](../../docs/IMPLEMENTATION-MAP.md)
- Arquitetura completa (20 ADRs): [`/docs/architecture/ARCHITECTURE.md`](../../docs/architecture/ARCHITECTURE.md)
- Schema do banco: [`/docs/architecture/SCHEMA.md`](../../docs/architecture/SCHEMA.md)
- Princípios UX: [`/docs/ux/wireframes/00-design-principles.md`](../../docs/ux/wireframes/00-design-principles.md)
- Inventário de componentes canônicos: [`/docs/ux/wireframes/06-componentes-criticos.md`](../../docs/ux/wireframes/06-componentes-criticos.md)
