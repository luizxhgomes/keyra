---
task: previsaoLucroAgenda()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 6
story_ref: "6.3"

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/finance/projections.ts
    persistido: true

Checklist:
  - "[ ] Calcular receita prevista do período (serviços agendados × preço)"
  - "[ ] Calcular custos previstos (variáveis por serviço + fixos rateados)"
  - "[ ] Calcular lucro previsto = receita - custos"
  - "[ ] Exibir no dashboard: lucro previsto vs meta (textual)"
  - "[ ] Considerar taxa de faltas histórica (desconto na previsão)"
  - "[ ] Atualizar diariamente conforme agenda muda"
  - "[ ] Comparativo textual: 'R$ 2.100 a menos que a meta'"
  - "[ ] Valores em centavos inteiros"
  - "[ ] @data-engineer: query otimizada com JOINs agenda × serviços × custos"
  - "[ ] Testes: agenda cheia, vazia, com faltas, sem serviços precificados"
---

# Previsão de Lucro Baseada na Agenda

## Objetivo

Projetar o lucro semanal/mensal baseado na agenda já preenchida — a profissional vê quanto vai lucrar antes de trabalhar.

## Exibição no Dashboard

```
┌─────────────────────────────┐
│  Lucro Previsto do Mês      │
│  R$ 5.243,00                │
│  Baseado em 80 agendamentos │
│  R$ 2.100 abaixo da meta    │
│  (considerando 8% de faltas)│
└─────────────────────────────┘
```
