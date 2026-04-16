---
task: alertasEstoqueRecompra()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 5
story_ref: "5.6"

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/finance/inventory-alerts.ts
    persistido: true

Checklist:
  - "[ ] Calcular consumo médio diário de cada insumo (últimos 30 dias)"
  - "[ ] Calcular lead time de reposição (configurável por fornecedor)"
  - "[ ] Estoque mínimo = consumo médio × lead time"
  - "[ ] Gerar alerta quando estoque atual < estoque mínimo"
  - "[ ] Sugerir quantidade de recompra: consumo médio × período de cobertura"
  - "[ ] Exibir alertas no dashboard e na tela de estoque"
  - "[ ] Alerta formato textual: 'Produto X: 5 unidades restantes, consumo médio 2/dia, recomprar 30 unidades'"
  - "[ ] Cron diário para verificar estoques e gerar alertas"
  - "[ ] Testes: estoque normal, baixo, zerado, sem consumo histórico"
---

# Alertas de Estoque e Sugestão de Recompra

## Objetivo

Implementar alertas inteligentes de estoque baixo baseados no consumo médio real, com sugestão de quantidade de recompra.

## Lógica

```
Consumo Médio = total_consumido_30d / 30
Estoque Mínimo = Consumo Médio × Lead Time (dias)
Sugestão de Recompra = Consumo Médio × Cobertura Desejada (dias)

Exemplo: Produto X
  Consumido nos últimos 30 dias: 60 unidades
  Consumo médio: 2/dia
  Lead time do fornecedor: 7 dias
  Estoque mínimo: 14 unidades
  Estoque atual: 5 unidades → ⚠️ ALERTA
  Sugestão: recomprar 60 unidades (30 dias de cobertura)
```
