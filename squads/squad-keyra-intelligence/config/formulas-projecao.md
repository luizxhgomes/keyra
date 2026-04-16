# Fórmulas de Projeção — KEYRA Intelligence

## Previsão de Lucro (Baseada na Agenda)

```
Receita Prevista = SUM(serviço.preço) para cada agendamento do período
Custo Variável Previsto = SUM(serviço.custo_variável) para cada agendamento
Custo Fixo do Período = Total fixo mensal × (dias no período / dias no mês)
Lucro Previsto = Receita Prevista - Custo Variável Previsto - Custo Fixo do Período
```

### Ajuste por Taxa de Faltas
```
Taxa de Faltas = COUNT(status='falta') / COUNT(total agendamentos) últimos 90 dias
Receita Ajustada = Receita Prevista × (1 - Taxa de Faltas)
```

## Rentabilidade por Hora

```
Lucro/Hora (faixa) = SUM(lucro dos atendimentos na faixa) / horas na faixa
```

| Faixa | Cálculo |
|-------|---------|
| 08h-10h | SUM(lucro WHERE hora BETWEEN 8 AND 10) / 2h |
| Semanal | Agrupar por dia da semana + faixa |

### Materialized View
```sql
REFRESH MATERIALIZED VIEW mv_rentabilidade_horario;
-- Atualizar diariamente às 02:00 via cron
```

## LTV do Cliente

```
Ticket Médio = SUM(transações.valor) / COUNT(transações) WHERE patient_id = X
Frequência Mensal = COUNT(visitas) / MONTHS_BETWEEN(primeira_visita, hoje)
Vida Média = 18 meses (padrão configurável, ou baseado em churn real)
LTV = Ticket Médio × Frequência Mensal × Vida Média
```

## Cenários What-If

```
Variáveis de entrada: Δpreço, Δvolume, Δcusto (percentuais)
Fórmula: ver config/formulas-precificacao.md → Simulação de Cenários
Resultado: Lucro simulado vs atual, diferença em R$ e %
```

## Metas (Panoramas para Mentora)

```
Meta de Faturamento = Custos Totais + Lucro Desejado
Atendimentos Necessários = Meta / Ticket Médio
Meta Diária = Atendimentos Necessários / Dias Úteis no Mês
Progresso = Faturamento Atual / Meta × 100
Falta = Meta - Faturamento Atual
```

## Regras Globais

- Materialized views para projeções pesadas (refresh diário)
- Cache de 5 minutos para prontuário de cliente
- Cálculos de what-if feitos client-side (sem round-trip)
- Centavos inteiros em todos os cálculos
