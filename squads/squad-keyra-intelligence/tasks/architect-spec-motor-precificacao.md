---
task: specMotorPrecificacao()
responsavel: "@architect"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 5
story_ref: "5.1"

Saída:
  - campo: spec_precificacao
    tipo: markdown
    destino: docs/architecture/spec-motor-precificacao.md
    persistido: true

Checklist:
  - "[ ] Definir abordagem: regras determinísticas (v1) — sem ML"
  - "[ ] Projetar engine de cálculo de preço mínimo por serviço"
  - "[ ] Projetar simulador de cenários (variáveis: preço, custo, margem)"
  - "[ ] Projetar precificação de pacotes com receita diferida"
  - "[ ] Definir onde a lógica vive (src/lib/finance/pricing.ts)"
  - "[ ] Projetar alertas de estoque baseados em consumo médio"
  - "[ ] Avaliar benchmark de preços: dados necessários, fonte, viabilidade v1"
  - "[ ] Documentar ADR: regras v1, ML v2"
  - "[ ] Definir queries de agregação necessárias (@data-engineer)"
---

# Especificação do Motor de Precificação

## Objetivo

Especificar a arquitetura técnica do motor de precificação inteligente do KEYRA — cálculo de preço mínimo, simulação de cenários e precificação de pacotes.

## Decisão Arquitetural (ADR-005)

| Aspecto | v1 (atual) | v2 (futuro) |
|---------|-----------|-------------|
| Abordagem | Regras determinísticas | ML leve |
| Tecnologia | TypeScript + SQL | TensorFlow.js ou API externa |
| Dados necessários | Custos + agenda | Histórico de 6+ meses |
| Motivo | Dados insuficientes para ML | Volume justifica ML |

## Componentes do Motor

```
Motor de Precificação
├── Calculadora de Preço Mínimo
│   └── custo_total / (1 - margem_desejada)
├── Simulador de Cenários
│   └── E se preço +10%? E se custo -5%?
├── Precificador de Pacotes
│   └── preço_unitário × sessões × (1 - desconto)
├── Alertas de Estoque
│   └── estoque_atual < consumo_médio × dias_reposição
└── Benchmark de Preços (v1: manual / v2: IA)
    └── Referência de preços do mercado local
```
