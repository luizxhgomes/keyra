---
task: dashboardNumerico()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 4
story_ref: "4.3"

Entrada:
  - campo: modelo_financeiro
    tipo: markdown
    origem: docs/architecture/modelo-financeiro-keyra.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/dashboard/
    persistido: true

Checklist:
  - "[ ] Dashboard de TELA ÚNICA — sem scroll excessivo"
  - "[ ] Cards com NÚMEROS ABSOLUTOS — NUNCA gráficos"
  - "[ ] Card: Faturamento do mês (+ comparativo textual com mês anterior)"
  - "[ ] Card: Lucro do mês (+ comparativo)"
  - "[ ] Card: Despesas do mês (+ comparativo)"
  - "[ ] Card: Meta do mês (valor atual vs meta, quanto falta)"
  - "[ ] Card: Agendamentos hoje / semana"
  - "[ ] Card: Ticket médio"
  - "[ ] Card: Serviço mais vendido"
  - "[ ] Card: Serviço mais lucrativo"
  - "[ ] Alertas: queda de lucro, baixa margem, alta taxa de faltas"
  - "[ ] Dados carregados via Server Components (sem loading desnecessário)"
  - "[ ] Responsivo: funcionar em tablet (uso na clínica)"
  - "[ ] Testes visuais para layout dos cards"
---

# Dashboard Numérico — Tela Única

## Objetivo

Implementar o dashboard principal do KEYRA — uma tela única que mostra todos os indicadores financeiros com números absolutos e comparativos textuais.

## Layout dos Cards

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Faturamento Mês │ │ Lucro do Mês    │ │ Despesas do Mês │
│ R$ 28.450,00    │ │ R$ 5.243,30     │ │ R$ 23.206,70    │
│ R$ 2.300 a mais │ │ R$ 800 a mais   │ │ R$ 1.500 a mais │
│ que mês anterior│ │ que mês anterior│ │ que mês anterior│
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Meta do Mês     │ │ Ticket Médio    │ │ Agendamentos    │
│ R$ 30.000       │ │ R$ 189,67       │ │ Hoje: 8         │
│ Faltam R$ 1.550 │ │ R$ 12 acima da  │ │ Semana: 42      │
│ para a meta     │ │ média           │ │ 3 horários livres│
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐
│ Mais Vendido    │ │ Mais Lucrativo  │
│ Limpeza de Pele │ │ Botox           │
│ 56 atendimentos │ │ Margem: 60,0%   │
└─────────────────┘ └─────────────────┘

⚠️ ALERTAS
• Depilação com margem negativa (-9,4%) — revisar precificação
• Taxa de faltas: 12% (acima da média de 8%)
```

## Princípios UX (inegociáveis)

1. NÚMEROS ABSOLUTOS — nunca gráficos de pizza, barra ou linha
2. COMPARATIVOS TEXTUAIS — "R$ 2.300 a mais que o mês passado"
3. TELA ÚNICA — tudo visível sem scroll excessivo
4. SIMPLICIDADE — a profissional entende sem ser financista
