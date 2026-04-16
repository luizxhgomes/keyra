# KEYRA Bootstrap Squad

Squad responsável pela **Fase 0** do projeto KEYRA — planejamento completo antes de escrever qualquer linha de código.

## Composição

| Agente | Persona | Papel |
|--------|---------|-------|
| `@pm` | Morgan | PRD formal, épicos, requisitos funcionais e não funcionais |
| `@architect` | Aria | Arquitetura fullstack (Next.js 15 + Supabase + Vercel) |
| `@data-engineer` | Dara | Schema PostgreSQL com RLS multi-tenant |
| `@analyst` | Alex | Pesquisa competitiva (Conta Azul, Clinicorp, Trinks) |
| `@ux-design-expert` | Uma | Wireframes, design system, dashboard numérico |
| `@finance-domain-expert` | Valéria | DRE, precificação, custos fixos/variáveis, margem |
| `@document-processor` | Íris | Pipeline OCR para extratos bancários e de maquininhas |
| `@compliance-br` | Têmis | LGPD, regras fiscais brasileiras, NFS-e |

## Workflow

`workflows/keyra-fase-0.yaml` — Sequência orquestrada em 5 fases:

1. **Fase 1:** PRD formal (@pm)
2. **Fase 2:** Pesquisa competitiva (@analyst) — paralela à Fase 1
3. **Fase 3:** Arquitetura fullstack (@architect) — depende do PRD
4. **Fase 4:** Schema + Wireframes + Modelo Financeiro — em paralelo
5. **Fase 5:** Pipeline OCR + Conformidade LGPD/Fiscal — em paralelo

## Entregáveis

1. PRD formal (`docs/prd/keyra-prd.md`)
2. Pesquisa competitiva (`docs/research/pesquisa-competitiva-keyra.md`)
3. Documento de arquitetura (`docs/architecture/keyra-architecture.md`)
4. Schema do banco de dados (`docs/architecture/SCHEMA.md`)
5. Wireframes e design system (`docs/ux/`)
6. Modelo financeiro (`docs/architecture/modelo-financeiro-keyra.md`)
7. Pipeline OCR (`docs/architecture/pipeline-ocr-keyra.md`)
8. Mapa de conformidade (`docs/compliance/conformidade-keyra.md`)

## Contexto

- **Input principal:** `docs/audios-idealizadora/contexto-completo-keyra.md`
- **Dados de domínio:** `data/dominio-keyra.yaml`
- **Tech stack:** `config/tech-stack.md`

## Como Executar

```bash
@aiox-master *workflow keyra-fase-0
```

## Estrutura do Squad

```
squad-keyra-bootstrap/
├── squad.yaml                              # Manifesto do squad
├── README.md                               # Este arquivo
├── config/
│   ├── tech-stack.md                       # Stack tecnológico
│   ├── coding-standards.md                 # Padrões de código
│   └── source-tree.md                      # Estrutura de pastas
├── tasks/
│   ├── pm-criar-prd-keyra.md               # Task: criar PRD
│   ├── architect-definir-arquitetura-fullstack.md
│   ├── data-engineer-projetar-schema.md
│   ├── analyst-pesquisa-competitiva.md
│   ├── ux-wireframes-dashboard.md
│   ├── finance-validar-modelo-financeiro.md
│   ├── document-definir-pipeline-ocr.md
│   └── compliance-mapear-requisitos-lgpd.md
├── workflows/
│   └── keyra-fase-0.yaml                   # Workflow da Fase 0
├── checklists/
│   ├── checklist-revisao-prd.md
│   ├── checklist-revisao-schema.md
│   └── checklist-revisao-arquitetura.md
├── templates/
│   ├── prd-keyra-tmpl.md
│   ├── arquitetura-keyra-tmpl.md
│   └── pesquisa-competitiva-keyra-tmpl.md
└── data/
    └── dominio-keyra.yaml                  # Dados de referência do domínio
```
