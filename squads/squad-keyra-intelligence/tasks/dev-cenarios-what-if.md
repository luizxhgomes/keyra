---
task: cenariosWhatIf()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 6
story_ref: "6.4"

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/inteligencia/what-if/
    persistido: true

Checklist:
  - "[ ] Criar tela de cenários what-if com variáveis ajustáveis"
  - "[ ] Variáveis: preço (+/- %), volume (+/- atendimentos), custo (+/- %)"
  - "[ ] Calcular impacto em tempo real: lucro, margem, faturamento"
  - "[ ] Cenários pré-definidos: '+10% upsell', '+5 agendamentos/semana', 'Reduzir custo X'"
  - "[ ] Comparar cenário simulado vs situação real atual (textual)"
  - "[ ] Exibir resultado: 'R$ X a mais/menos de lucro por mês'"
  - "[ ] Cálculos client-side (sem round-trip ao servidor)"
  - "[ ] Valores em centavos inteiros"
  - "[ ] Testes: cenários positivos, negativos, combinados, extremos"
---

# Cenários What-If

## Objetivo

Implementar simulador de cenários para a profissional e a mentora testarem hipóteses de negócio.

## Cenários Pré-Definidos

| Cenário | Variáveis | Pergunta |
|---------|-----------|----------|
| Aumentar preço | +10% em todos os serviços | Quanto mais lucro se subir 10%? |
| Mais agendamentos | +5 por semana | Quanto mais se lotar a agenda? |
| Reduzir custo | -15% em insumos | Quanto economiza renegociando? |
| Novo serviço | +1 serviço com margem 50% | Vale a pena adicionar? |
| Upsell | +20% de ticket médio | Quanto impacta o lucro? |
