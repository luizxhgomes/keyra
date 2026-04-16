# Tech Stack — KEYRA Core

> Referência completa: `../squad-keyra-bootstrap/config/tech-stack.md`

Este squad herda o tech stack definido na Fase 0 (Bootstrap). Resumo:

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Supabase Edge Functions |
| Banco | PostgreSQL 15 (Supabase), RLS multi-tenant |
| Auth | Supabase Auth (JWT com tenant_id) |
| Deploy | Vercel + Supabase Cloud |
| Testes | Vitest (unit) + Playwright (e2e) |

## Regras Específicas do Core

- **Valores monetários:** Centavos inteiros (`integer`) — nunca float
- **Datas:** `date-fns` com fuso `America/Sao_Paulo`
- **Formulários:** `react-hook-form` + `zod`
- **Lógica financeira:** Isolada em `src/lib/finance/`
- **Server Components:** Padrão para carregamento de dados
