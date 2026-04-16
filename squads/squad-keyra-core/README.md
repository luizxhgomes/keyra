# KEYRA Core Squad

Squad responsável pelas **Fases 2-4** do KEYRA — implementação do MVP completo.

## Composição

| Agente | Persona | Papel |
|--------|---------|-------|
| `@sm` | River | Criação de stories dos Epics 2-4 |
| `@po` | Pax | Validação de stories antes da implementação |
| `@dev` | Dex | Implementação fullstack (Next.js + Supabase) |
| `@data-engineer` | Dara | Migrations, queries otimizadas, RLS |
| `@qa` | Quinn | QA gates, testes de lógica financeira |
| `@devops` | Gage | Git push, PRs, CI/CD (EXCLUSIVO) |
| `@finance-domain-expert` | Valéria | Validação de TODA lógica financeira |
| `@compliance-br` | Têmis | LGPD, dados pessoais, regras fiscais |

## Workflow

`workflows/keyra-sdc-com-gate-financeiro.yaml` — SDC estendido:

```
@sm → @po → @dev → @finance-domain-expert (gate) → @qa → @devops
```

## Escopo

### Epic 2 — Catálogo + Agenda (Core Operacional)
- CRUD de pacientes e serviços (com custo/preço/margem)
- Módulo de agenda (diária/semanal)
- Receita prevista automática ao agendar

### Epic 3 — Automação Financeira
- Comanda automática ao finalizar atendimento
- Transação financeira ao registrar pagamento
- Custos fixos vs variáveis com rateio por serviço
- Gestão de estoque com baixa automática

### Epic 4 — Dashboard + Lucro
- DRE básica e DRE por serviço (DIFERENCIAL)
- Lucro por profissional
- Dashboard tela única com números absolutos
- Alertas de margem negativa e faltas

## Regras Especiais

1. **Gate Financeiro:** Valéria (`@finance-domain-expert`) valida toda lógica financeira ANTES do QA gate de Quinn (`@qa`)
2. **Revisão de Compliance:** Têmis (`@compliance-br`) revisa dados pessoais e regras fiscais ao final de cada Epic
3. **Cadeia de valor:** Serviço → Agenda → Comanda → Transação → DRE

## Dependências

- `squad-keyra-bootstrap` — PRD, arquitetura e schema devem estar prontos

## Estrutura do Squad

```
squad-keyra-core/
├── squad.yaml                                # Manifesto
├── README.md                                 # Este arquivo
├── config/
│   ├── tech-stack.md                         # Stack (herda do bootstrap)
│   ├── coding-standards.md                   # Padrões de código
│   └── regras-desenvolvimento.md             # Fluxo e ordem de implementação
├── tasks/
│   ├── data-engineer-migrations-core.md      # Epic 2: todas as migrations
│   ├── dev-crud-pacientes.md                 # Epic 2: CRUD pacientes
│   ├── dev-crud-servicos.md                  # Epic 2: CRUD serviços + margem
│   ├── dev-modulo-agenda.md                  # Epic 2: agenda + receita prevista
│   ├── dev-comanda-automatica.md             # Epic 3: comanda automática
│   ├── dev-transacao-financeira.md           # Epic 3: pagamento → transação
│   ├── dev-custos-fixos-variaveis.md         # Epic 3: custos e rateio
│   ├── dev-rateio-insumos.md                 # Epic 3: estoque e insumos
│   ├── finance-validar-automacao-financeira.md  # Epic 3: gate financeiro
│   ├── dev-dre-basica.md                     # Epic 4: DRE
│   ├── dev-dre-por-servico.md                # Epic 4: DRE por serviço
│   ├── dev-dashboard-numerico.md             # Epic 4: dashboard
│   ├── dev-lucro-por-profissional.md         # Epic 4: lucro por profissional
│   ├── finance-validar-dre-dashboard.md      # Epic 4: gate financeiro
│   └── compliance-revisar-dados-pessoais.md  # Transversal: LGPD
├── workflows/
│   └── keyra-sdc-com-gate-financeiro.yaml    # SDC + gate financeiro
├── checklists/
│   ├── checklist-validacao-financeira.md      # Gate de @finance-domain-expert
│   ├── checklist-dre-por-servico.md          # Validação DRE por serviço
│   └── checklist-qa-mvp.md                   # QA gate do MVP
└── data/
    ├── regras-financeiras.yaml               # Fórmulas e regras de negócio
    └── categorias-transacao.yaml             # Categorias e formas de pagamento
```

## Como Executar

```bash
# Iniciar workflow de desenvolvimento
@aiox-master *workflow keyra-sdc

# Ou por Epic individual
@sm *draft   # Criar story do Epic 2, 3 ou 4
```
