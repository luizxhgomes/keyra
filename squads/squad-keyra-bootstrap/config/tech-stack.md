# Tech Stack — KEYRA

## Frontend

| Tecnologia | Versão | Justificativa |
|-----------|--------|---------------|
| **Next.js** | 15.x | App Router, Server Components, SSR/SSG |
| **React** | 19.x | Biblioteca de UI padrão |
| **TypeScript** | 5.x | Tipagem estática, segurança em tempo de compilação |
| **Tailwind CSS** | 4.x | Estilização utilitária, produtividade |
| **shadcn/ui** | latest | Componentes acessíveis, customizáveis |

## Backend

| Tecnologia | Versão | Justificativa |
|-----------|--------|---------------|
| **Next.js API Routes** | 15.x | API integrada ao frontend |
| **Supabase Edge Functions** | latest | Lógica serverless para webhooks, filas |
| **PostgreSQL** | 15.x | Banco relacional via Supabase |
| **Supabase Auth** | latest | Autenticação com JWT, RLS integrado |
| **Supabase Storage** | latest | Armazenamento de documentos (PDFs) |

## Infraestrutura

| Tecnologia | Justificativa |
|-----------|---------------|
| **Vercel** | Deploy do frontend, edge functions, preview deploys |
| **Supabase Cloud** | Banco de dados, auth, storage, realtime |
| **GitHub** | Repositório, CI/CD, code review |

## Bibliotecas Chave

| Biblioteca | Uso |
|-----------|-----|
| **zod** | Validação de schemas e formulários |
| **react-hook-form** | Gestão de formulários |
| **date-fns** | Manipulação de datas (fuso horário America/Sao_Paulo) |
| **dinero.js** ou centavos | Cálculos monetários seguros (nunca float) |
| **pdf-parse** | Extração de texto de PDFs |
| **tesseract.js** | OCR client-side (fallback) |

## Decisões Arquiteturais

- **Monorepo:** Não — projeto único Next.js
- **ORM:** Não — Supabase client + SQL direto para queries complexas
- **Estado global:** Não — Server Components + props drilling + context mínimo
- **Testes:** Vitest (unit) + Playwright (e2e)
- **Valores monetários:** Centavos inteiros (`integer`) ou `numeric(12,2)` no banco
