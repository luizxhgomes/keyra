---
task: specProjecoesPreditivas()
responsavel: "@architect"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 6
story_ref: "6.1"

Saída:
  - campo: spec_projecoes
    tipo: markdown
    destino: docs/architecture/spec-projecoes-preditivas.md
    persistido: true

Checklist:
  - "[ ] Definir abordagem: regras determinísticas (v1)"
  - "[ ] Projetar previsão de lucro baseada em agenda preenchida"
  - "[ ] Projetar motor de cenários what-if (variáveis e fórmulas)"
  - "[ ] Projetar cálculo de rentabilidade por horário"
  - "[ ] Projetar prontuário financeiro do cliente (agregações)"
  - "[ ] Projetar sugestões de upsell (regras v1, ML v2)"
  - "[ ] Definir queries de agregação necessárias (@data-engineer)"
  - "[ ] Avaliar necessidade de materialized views para performance"
  - "[ ] Definir estratégia de cache para projeções pesadas"
  - "[ ] Documentar ADR: regras v1, dados necessários para ML v2"
---

# Especificação das Projeções Preditivas

## Objetivo

Especificar a arquitetura técnica da camada de inteligência do KEYRA — projeções financeiras, cenários e recomendações.

## Componentes

```
Camada de Inteligência
├── Previsão de Lucro (baseada na agenda)
│   └── agenda preenchida × preço dos serviços - custos estimados
├── Cenários What-If
│   └── Variáveis: volume, preço, custo, mix de serviços
├── Rentabilidade por Horário
│   └── Lucro/hora por faixa horária (agregação SQL)
├── Prontuário Financeiro do Cliente
│   └── Ticket médio, frequência, LTV, última visita
└── Sugestões de Upsell
    └── v1: regras (se fez X, sugerir Y)
    └── v2: ML baseado em padrões de consumo
```

## Performance

| Projeção | Complexidade | Estratégia |
|----------|------------|-----------|
| Lucro semanal | Média | Query em tempo real |
| Lucro mensal | Alta | Materialized view (refresh diário) |
| What-if | Baixa | Cálculo client-side |
| Rentabilidade/hora | Alta | Materialized view |
| Prontuário cliente | Média | Query com cache (5 min) |
| Upsell | Baixa | Regras em memória |
