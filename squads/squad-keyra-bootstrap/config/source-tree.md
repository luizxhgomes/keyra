# Source Tree — KEYRA

## Estrutura do Projeto

```
keyra/
├── .aiox-core/                   # Framework AIOX (L1/L2 — não modificar)
├── .claude/                      # Configurações do Claude Code
├── squads/                       # Squads do projeto
│   └── squad-keyra-bootstrap/    # Squad da Fase 0
│
├── src/                          # Código fonte da aplicação
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Grupo de rotas autenticadas
│   │   │   ├── dashboard/        # Dashboard principal
│   │   │   ├── agenda/           # Módulo de agenda
│   │   │   ├── servicos/         # Catálogo de serviços
│   │   │   ├── financeiro/       # Módulo financeiro
│   │   │   ├── dre/              # Demonstrativo de resultados
│   │   │   ├── estoque/          # Gestão de estoque/insumos
│   │   │   ├── documentos/       # Upload e processamento de PDFs
│   │   │   └── configuracoes/    # Configurações da clínica
│   │   ├── (public)/             # Rotas públicas
│   │   │   ├── login/
│   │   │   └── cadastro/
│   │   ├── api/                  # API Routes
│   │   │   ├── appointments/
│   │   │   ├── services/
│   │   │   ├── transactions/
│   │   │   ├── documents/
│   │   │   └── reports/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/               # Componentes reutilizáveis
│   │   ├── ui/                   # shadcn/ui (base)
│   │   ├── dashboard/            # Cards numéricos, comparativos
│   │   ├── forms/                # Formulários compartilhados
│   │   └── layout/               # Header, sidebar, navigation
│   │
│   ├── lib/                      # Utilitários e lógica compartilhada
│   │   ├── supabase/             # Cliente Supabase, helpers
│   │   ├── finance/              # Cálculos financeiros (DRE, margem, custos)
│   │   ├── documents/            # Parsing de documentos, OCR
│   │   ├── formatting/           # Formatação de moeda, data, CPF/CNPJ
│   │   └── validations/          # Schemas Zod compartilhados
│   │
│   ├── hooks/                    # React hooks customizados
│   ├── types/                    # Tipos TypeScript globais
│   └── styles/                   # Estilos globais, tokens
│
├── supabase/                     # Configuração Supabase
│   ├── migrations/               # Migrações SQL versionadas
│   ├── seed.sql                  # Dados de seed
│   └── config.toml               # Configuração do Supabase local
│
├── tests/                        # Testes
│   ├── unit/                     # Testes unitários (Vitest)
│   ├── integration/              # Testes de integração
│   └── e2e/                      # Testes end-to-end (Playwright)
│
├── docs/                         # Documentação do projeto
│   ├── prd/                      # PRD e requisitos
│   ├── architecture/             # Arquitetura e schema
│   ├── stories/                  # Stories de desenvolvimento
│   ├── research/                 # Pesquisas e análises
│   ├── ux/                       # Wireframes e design system
│   ├── compliance/               # LGPD e conformidade fiscal
│   └── audios-idealizadora/      # Contexto da idealizadora
│
├── public/                       # Arquivos estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local                    # Variáveis de ambiente (não commitar)
```

## Convenções de Diretório

- `(auth)/` e `(public)/` são route groups do Next.js (não aparecem na URL)
- `lib/finance/` contém TODA a lógica financeira — isolada para testabilidade
- `lib/documents/` contém parsers de extratos e pipeline OCR
- `supabase/migrations/` usa numeração sequencial: `0001_create_tenants.sql`
- `docs/stories/` segue padrão AIOX: `{epicNum}.{storyNum}.story.md`
