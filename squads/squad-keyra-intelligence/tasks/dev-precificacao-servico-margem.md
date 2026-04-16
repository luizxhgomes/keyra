---
task: precificacaoServicoMargem()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 5
story_ref: "5.3"

Entrada:
  - campo: fórmulas
    tipo: markdown
    origem: docs/architecture/formulas-precificacao-keyra.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/finance/pricing.ts
    persistido: true

Checklist:
  - "[ ] Implementar função calculateMinPrice(costCents, marginPercent) → priceCents"
  - "[ ] Implementar função calculateMargin(priceCents, costCents) → marginPercent"
  - "[ ] Implementar função calculateBreakEven(fixedCostsCents, contributionMarginCents) → quantity"
  - "[ ] Tela de precificação: ao editar custo ou margem, recalcular preço em tempo real"
  - "[ ] Exibir: preço atual, preço mínimo sugerido, margem atual, ponto de equilíbrio"
  - "[ ] Alerta visual se preço atual < preço mínimo (margem negativa)"
  - "[ ] Todos os cálculos em centavos inteiros"
  - "[ ] Proteção contra divisão por zero (margem = 100%)"
  - "[ ] Testes unitários: preço mínimo, margem, break-even, edge cases"
---

# Precificação de Serviço com Margem

## Objetivo

Implementar o motor de precificação que calcula preço mínimo, margem real e ponto de equilíbrio para cada serviço.

## Interface da Tela

```
┌──────────────────────────────────────────────┐
│  Precificação — Limpeza de Pele              │
│                                               │
│  Custos Variáveis (insumos):    R$ 23,00     │
│  Rateio de Custos Fixos:        R$ 42,00     │
│  Custo Total:                   R$ 65,00     │
│                                               │
│  Margem Desejada: [40%]  ← editável         │
│  Preço Mínimo Sugerido:        R$ 108,33     │
│                                               │
│  Preço Atual:              [R$ 150,00]       │
│  Margem Real:                   56,7% ✅     │
│                                               │
│  Ponto de Equilíbrio:  70 atend./mês         │
│  Atendimentos este mês: 56/70               │
└──────────────────────────────────────────────┘
```
