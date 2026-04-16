---
task: definirFormulasProjecao()
responsavel: "@finance-domain-expert"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 6
story_ref: "6.2"

Saída:
  - campo: documento_formulas
    tipo: markdown
    destino: docs/architecture/formulas-projecao-keyra.md
    persistido: true

Checklist:
  - "[ ] Definir fórmula de previsão de lucro semanal/mensal"
  - "[ ] Definir fórmula de cenários what-if (parâmetros e impacto)"
  - "[ ] Definir fórmula de rentabilidade por hora"
  - "[ ] Definir fórmula de LTV do cliente"
  - "[ ] Definir fórmula de ticket médio por cliente"
  - "[ ] Definir critérios de alerta por profissional (baixa performance)"
  - "[ ] Definir lógica de construção de metas (panoramas para mentora)"
  - "[ ] Documentar cada fórmula com exemplo numérico"
  - "[ ] Validar que todas operam em centavos inteiros"
---

# Definir Fórmulas de Projeção

## Objetivo

@finance-domain-expert (Valéria) define TODAS as fórmulas de projeção e inteligência do KEYRA.

## Fórmulas

### 1. Previsão de Lucro (baseada na agenda)
```
Receita Prevista = SUM(preço dos serviços agendados no período)
Custo Previsto = SUM(custo_total de cada serviço agendado)
Lucro Previsto = Receita Prevista - Custo Previsto - Despesas Fixas Rateadas

Exemplo: 80 atendimentos agendados no mês
  Receita prevista: R$ 12.000
  Custos previstos: R$ 5.200
  Despesas fixas: R$ 3.800
  Lucro previsto: R$ 3.000
```

### 2. Rentabilidade por Hora
```
Lucro/Hora = SUM(lucro dos atendimentos na faixa) / horas na faixa

Exemplo:
  08h-10h: 5 atendimentos, lucro R$ 425 → R$ 212,50/hora
  14h-16h: 3 atendimentos, lucro R$ 180 → R$ 90,00/hora
  → Manhã é mais rentável que tarde
```

### 3. LTV do Cliente
```
Ticket Médio = SUM(transações do cliente) / COUNT(transações)
Frequência = COUNT(visitas) / meses_como_cliente
LTV = Ticket Médio × Frequência × Vida Média (meses)

Exemplo: Ana Silva
  Ticket médio: R$ 189
  Frequência: 1,5 visitas/mês
  Vida média estimada: 18 meses
  LTV = 189 × 1,5 × 18 = R$ 5.103
```

### 4. Cenários What-If
```
Lucro Simulado = (Preço × (1 + var_preço)) × (Volume × (1 + var_volume))
                - (Custo × (1 + var_custo)) × (Volume × (1 + var_volume))
                - Fixos

Exemplo: +10% no preço, mesmo volume
  Atual: R$ 150 × 56 - R$ 65 × 56 - R$ 3.800 = R$ 960
  Simulado: R$ 165 × 56 - R$ 65 × 56 - R$ 3.800 = R$ 1.800
  Diferença: +R$ 840/mês
```

### 5. Metas (suporte à mentora)
```
Meta de Faturamento = Custos Totais + Lucro Desejado
Atendimentos Necessários = Meta / Ticket Médio
Meta Diária = Atendimentos Necessários / Dias Úteis

Exemplo: Meta R$ 30.000
  Custos totais: R$ 23.000
  Lucro desejado: R$ 7.000
  Ticket médio: R$ 189
  Atendimentos: 159/mês → 8/dia (20 dias úteis)
```
