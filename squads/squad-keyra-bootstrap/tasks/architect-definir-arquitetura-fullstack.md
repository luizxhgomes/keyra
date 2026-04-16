---
task: definirArquiteturaFullstack()
responsavel: "@architect"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: prd
    tipo: markdown
    origem: docs/prd/keyra-prd.md
    obrigatório: true
    validação: PRD deve estar aprovado

  - campo: tech_stack
    tipo: object
    origem: config/tech-stack.md
    obrigatório: true

Saída:
  - campo: documento_arquitetura
    tipo: markdown
    destino: docs/architecture/keyra-architecture.md
    persistido: true

Checklist:
  - "[ ] Ler PRD completo e extrair requisitos técnicos"
  - "[ ] Definir stack tecnológico (Next.js 15 + Supabase + Vercel)"
  - "[ ] Projetar estrutura de pastas do projeto"
  - "[ ] Definir camadas da aplicação (UI, API, Domain, Data)"
  - "[ ] Projetar estratégia de autenticação (Supabase Auth)"
  - "[ ] Definir padrão de multi-tenancy (RLS por tenant_id)"
  - "[ ] Projetar integrações externas (maquininhas, OCR, NFS-e)"
  - "[ ] Definir estratégia de deploy (Vercel + Supabase Cloud)"
  - "[ ] Documentar decisões arquiteturais (ADRs)"
  - "[ ] Validar com checklist de revisão de arquitetura"
---

# Definir Arquitetura Fullstack do KEYRA

## Objetivo

Projetar a arquitetura técnica completa do KEYRA, definindo stack, estrutura de pastas, camadas da aplicação, integrações e estratégia de deploy.

## Stack Definido

- **Frontend:** Next.js 15 (App Router, Server Components)
- **Backend:** Next.js API Routes + Supabase Edge Functions
- **Banco de dados:** PostgreSQL (Supabase)
- **Autenticação:** Supabase Auth
- **Deploy:** Vercel (frontend) + Supabase Cloud (backend/DB)
- **Estilização:** Tailwind CSS + shadcn/ui

## Passos de Execução

1. **Analisar PRD** — Extrair requisitos técnicos dos FRs e NFRs
2. **Definir camadas** — UI → API → Domain → Data
3. **Projetar multi-tenancy** — RLS com `tenant_id` em todas as tabelas
4. **Mapear integrações** — APIs de maquininhas, serviços OCR, prefeituras (NFS-e)
5. **Definir estrutura de pastas** — Monorepo ou projeto único
6. **Projetar autenticação** — Fluxo de login, roles, permissões
7. **Documentar ADRs** — Decisões e justificativas
8. **Gerar documento** — Usar template `arquitetura-keyra-tmpl.md`
9. **Validar** — Checklist de revisão de arquitetura

## Dependências

- Requer PRD aprovado (`pm-criar-prd-keyra.md`)
- Consultar `config/tech-stack.md` para decisões de stack

## Template

Usar: `templates/arquitetura-keyra-tmpl.md`

## Validação

Usar: `checklists/checklist-revisao-arquitetura.md`
