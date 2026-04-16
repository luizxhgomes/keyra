---
task: rentabilidadeHorarioProfissional()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 6
story_ref: "6.5"

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/inteligencia/rentabilidade/
    persistido: true

Checklist:
  - "[ ] Calcular lucro/hora por faixa horária (8h-10h, 10h-12h, 14h-16h, 16h-18h)"
  - "[ ] @data-engineer: materialized view com agregação por hora/dia da semana"
  - "[ ] Exibir como tabela numérica (faixa × lucro/hora)"
  - "[ ] EXCEÇÃO UX: heatmap visual permitido aqui (dado é naturalmente espacial)"
  - "[ ] Identificar horários mais e menos rentáveis"
  - "[ ] Alerta textual: 'Terça 14h-16h gera R$ 45/hora — considerar ocupar com serviço premium'"
  - "[ ] Rentabilidade por profissional: receita, custos, lucro, margem"
  - "[ ] Alerta de baixa performance: 'Profissional X com margem 15% — abaixo da média de 45%'"
  - "[ ] Valores em centavos inteiros nos cálculos"
  - "[ ] Testes: horários com atendimentos, sem, profissional novo sem histórico"
---

# Rentabilidade por Horário e Profissional

## Objetivo

Implementar visão de rentabilidade por faixa horária e por profissional — permite otimizar a agenda para maximizar lucro.

## Tabela de Rentabilidade por Horário

```
Rentabilidade por Faixa Horária — Março 2026

| Horário     | Seg      | Ter      | Qua      | Qui      | Sex      |
|-------------|----------|----------|----------|----------|----------|
| 08h - 10h   | R$ 213/h | R$ 198/h | R$ 225/h | R$ 180/h | R$ 240/h |
| 10h - 12h   | R$ 190/h | R$ 175/h | R$ 200/h | R$ 160/h | R$ 210/h |
| 14h - 16h   | R$ 95/h  | R$ 88/h  | R$ 110/h | R$ 72/h  | R$ 130/h |
| 16h - 18h   | R$ 120/h | R$ 105/h | R$ 140/h | R$ 90/h  | R$ 155/h |

💡 Manhãs são 2x mais rentáveis que tardes — priorizar serviços premium de manhã
```

## Alerta por Profissional

```
⚠️ Carla Lima — margem de 15% (média do time: 45%)
   Receita: R$ 4.200  |  Custos: R$ 3.570  |  Lucro: R$ 630
   Sugestão: revisar mix de serviços ou eficiência de insumos
```
