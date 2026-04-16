---
task: prontuarioFinanceiroCliente()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 6
story_ref: "6.6"

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/pacientes/[id]/financeiro/
    persistido: true

Checklist:
  - "[ ] Calcular ticket médio do cliente (total gasto / total visitas)"
  - "[ ] Calcular frequência de visitas (visitas / meses como cliente)"
  - "[ ] Calcular LTV estimado (ticket médio × frequência × vida média)"
  - "[ ] Exibir última visita e tempo desde a última visita"
  - "[ ] Exibir serviços mais consumidos pelo cliente"
  - "[ ] Exibir histórico de gastos (lista de transações)"
  - "[ ] Alerta de cliente inativo (sem visita há X dias — configurável)"
  - "[ ] Tudo em números absolutos (R$, quantidade, dias)"
  - "[ ] Valores em centavos inteiros"
  - "[ ] Testes: cliente novo, frequente, inativo, com pacotes"
---

# Prontuário Financeiro por Cliente

## Objetivo

Implementar visão financeira individual de cada paciente — ticket médio, frequência, LTV e histórico de consumo.

## Interface

```
┌──────────────────────────────────────────────────┐
│  Prontuário Financeiro — Ana Silva               │
│                                                   │
│  Cliente desde: Março 2025 (13 meses)            │
│  Última visita: 08/03/2026 (5 dias atrás)        │
│                                                   │
│  Ticket Médio:     R$ 189,00                     │
│  Frequência:       1,5 visitas/mês               │
│  Total Gasto:      R$ 3.780,00 (20 visitas)      │
│  LTV Estimado:     R$ 5.103,00                   │
│                                                   │
│  Serviços Mais Consumidos:                        │
│  1. Limpeza de Pele — 12 vezes                   │
│  2. Peeling — 5 vezes                            │
│  3. Botox — 3 vezes                              │
│                                                   │
│  [Ver Histórico Completo]                         │
└──────────────────────────────────────────────────┘
```
