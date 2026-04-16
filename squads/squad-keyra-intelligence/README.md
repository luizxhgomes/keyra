# KEYRA Intelligence Squad

Squad responsável pelas **Fases 5-6** do KEYRA — motor de precificação, projeções financeiras e inteligência preditiva.

## Composição

| Agente | Persona | Papel |
|--------|---------|-------|
| `@sm` | River | Criação de stories dos Epics 5-6 |
| `@po` | Pax | Validação de stories |
| `@dev` | Dex | Implementação |
| `@qa` | Quinn | QA de fórmulas e projeções |
| `@devops` | Gage | Push/PRs |
| `@architect` | Aria | Arquitetura: regras v1 vs ML v2 |
| `@data-engineer` | Dara | Queries de agregação, materialized views |
| `@finance-domain-expert` | Valéria | Define e valida TODAS as fórmulas |

## Workflow

`workflows/keyra-inteligencia-spec-sdc.yaml` — Spec de fórmulas + SDC com gate financeiro:

```
@architect (abordagem) → @finance-domain-expert (fórmulas)
  → @sm → @po → @dev
  → @data-engineer (queries) + @finance-domain-expert (gate)
  → @qa → @devops
```

## Decisão Arquitetural

**v1: 100% regras determinísticas** (SQL + TypeScript) — sem ML.
Motivo: dados insuficientes, complexidade desnecessária, fórmulas bem definidas.
Revisão prevista: quando atingir 50 tenants ativos com 6+ meses de dados.

## Escopo

### Epic 5 — Motor de Precificação
- Preço mínimo baseado em custo total + margem desejada
- Precificação de pacotes com desconto progressivo e receita diferida
- Simulação de cenários de preço ("e se aumentar 10%?")
- Alertas de estoque baixo com sugestão de recompra
- Referência de preços por benchmark local (v1: manual)

### Epic 6 — Inteligência + Projeções
- Previsão de lucro semanal/mensal baseada na agenda preenchida
- Cenários what-if (+upsell, +agendamentos, -custos)
- Rentabilidade por horário e por profissional
- Prontuário financeiro por cliente (ticket médio, frequência, LTV)
- Sugestões de upsell na agenda (regras v1, ML v2)
- Panoramas para construção de metas (suporte à mentora)

## Regras Especiais

1. **Gate Financeiro obrigatório:** TODA story passa por @finance-domain-expert (100% são fórmulas)
2. **Fórmulas antes de código:** Valéria define com exemplos numéricos, depois Dex implementa
3. **Cenários de validação:** `data/cenarios-*.yaml` com valores esperados para testes
4. **UX:** Números absolutos em tudo. EXCEÇÃO: heatmap de rentabilidade por horário

## Dependências

- `squad-keyra-core` — Transações, serviços, custos, agenda, DRE

## Estrutura do Squad

```
squad-keyra-intelligence/
├── squad.yaml
├── README.md
├── config/
│   ├── formulas-precificacao.md              # Fórmulas de preço, margem, pacotes
│   ├── formulas-projecao.md                  # Fórmulas de projeção, LTV, metas
│   └── abordagem-tecnica.md                  # ADR: regras v1 vs ML v2
├── tasks/
│   ├── architect-spec-motor-precificacao.md   # Epic 5: spec do motor
│   ├── finance-definir-formulas-precificacao.md
│   ├── dev-precificacao-servico-margem.md
│   ├── dev-precificacao-pacotes.md
│   ├── dev-simulacao-cenarios-preco.md
│   ├── dev-alertas-estoque-recompra.md
│   ├── dev-recomendacoes-preco-benchmark.md
│   ├── architect-spec-projecoes-preditivas.md # Epic 6: spec das projeções
│   ├── finance-definir-formulas-projecao.md
│   ├── dev-previsao-lucro-agenda.md
│   ├── dev-cenarios-what-if.md
│   ├── dev-rentabilidade-horario-profissional.md
│   ├── dev-prontuario-financeiro-cliente.md
│   ├── dev-sugestoes-upsell-agenda.md
│   └── finance-validar-formulas-inteligencia.md  # Gate transversal
├── workflows/
│   └── keyra-inteligencia-spec-sdc.yaml      # Spec + SDC + gate financeiro
├── checklists/
│   ├── checklist-formulas-precificacao.md     # Validação de fórmulas de preço
│   ├── checklist-projecoes.md                 # Validação de projeções
│   └── checklist-qa-inteligencia.md           # QA completo Epics 5-6
└── data/
    ├── cenarios-precificacao.yaml             # 8 cenários com valores esperados
    └── cenarios-projecao.yaml                 # 7 cenários com valores esperados
```

## Como Executar

```bash
# Workflow completo (spec fórmulas + implementação)
@aiox-master *workflow keyra-inteligencia

# Ou definir fórmulas primeiro
@finance-domain-expert *task finance-definir-formulas-precificacao
@finance-domain-expert *task finance-definir-formulas-projecao
```
