---
task: simulacaoCenariosPreco()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 5
story_ref: "5.5"

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/servicos/simulacao/
    persistido: true

Checklist:
  - "[ ] Criar tela de simulação de cenários de preço"
  - "[ ] Variáveis ajustáveis: preço, custo variável, custo fixo, volume de atendimentos"
  - "[ ] Exibir impacto em tempo real: margem, lucro mensal projetado, ponto de equilíbrio"
  - "[ ] Cenários pré-definidos: 'Aumentar preço 10%', 'Reduzir custo 5%', 'Dobrar volume'"
  - "[ ] Comparar cenário simulado vs situação atual (textual)"
  - "[ ] Permitir salvar cenários favoritos"
  - "[ ] Números absolutos no resultado (R$ X.XXX a mais/menos)"
  - "[ ] Valores em centavos inteiros nos cálculos"
  - "[ ] Testes: cenário de aumento, redução, volume, combinados"
---

# Simulação de Cenários de Preço

## Objetivo

Implementar um simulador que permite à profissional testar "e se...?" para decisões de precificação.

## Interface

```
┌──────────────────────────────────────────────────────┐
│  Simulador de Cenários — Limpeza de Pele             │
│                                                       │
│  ┌─ Situação Atual ──┐  ┌─ Cenário Simulado ──┐     │
│  │ Preço: R$ 150     │  │ Preço: [R$ 165]     │     │
│  │ Custo: R$ 65      │  │ Custo: [R$ 65]      │     │
│  │ Margem: 56,7%     │  │ Margem: 60,6%       │     │
│  │ Volume: 56/mês    │  │ Volume: [50/mês]     │     │
│  │ Lucro: R$ 4.760   │  │ Lucro: R$ 5.000     │     │
│  └───────────────────┘  └─────────────────────┘     │
│                                                       │
│  Resultado: R$ 240 a mais de lucro mensal            │
│  com 6 atendimentos a menos                          │
│                                                       │
│  [Salvar Cenário] [Resetar]                          │
└──────────────────────────────────────────────────────┘
```
