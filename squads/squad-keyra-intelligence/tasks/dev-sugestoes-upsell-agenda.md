---
task: sugestoesUpsellAgenda()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 6
story_ref: "6.7"

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/finance/upsell.ts
    persistido: true

Checklist:
  - "[ ] v1: Regras simples baseadas em histórico do paciente"
  - "[ ] Regra 1: Se fez Limpeza de Pele 3+ vezes, sugerir Peeling"
  - "[ ] Regra 2: Se última visita > 30 dias, sugerir agendamento"
  - "[ ] Regra 3: Se ticket médio < média geral, sugerir serviço complementar"
  - "[ ] Regra 4: Se pacote está acabando (1 sessão restante), sugerir renovação"
  - "[ ] Exibir sugestões na tela de agendamento (ao selecionar paciente)"
  - "[ ] Exibir sugestões no prontuário financeiro do cliente"
  - "[ ] Regras configuráveis pelo tenant"
  - "[ ] Formato textual: 'Ana fez 5 limpezas — sugerir pacote de Peeling'"
  - "[ ] Testes: paciente novo (sem sugestão), frequente, com pacote expirando"
---

# Sugestões de Upsell na Agenda

## Objetivo

Implementar sugestões inteligentes de upsell baseadas no histórico do paciente — exibidas no momento do agendamento.

## Regras v1

| Regra | Condição | Sugestão |
|-------|---------|----------|
| Cross-sell | Fez serviço X 3+ vezes | Sugerir serviço Y complementar |
| Reativação | Sem visita há 30+ dias | Sugerir agendamento |
| Upgrade | Ticket médio < média | Sugerir serviço premium |
| Renovação | Pacote com 1 sessão restante | Sugerir renovação com desconto |
| Frequência | Frequência < 1 visita/mês | Sugerir plano recorrente |

## Exibição no Agendamento

```
Agendando para: Ana Silva
Serviço: Limpeza de Pele

💡 Sugestões de upsell:
  1. Ana fez 5 limpezas — sugerir Peeling Químico (margem 45%)
  2. Pacote de Limpeza com 1 sessão restante — sugerir renovação
```

## Evolução v2 (ML)

Com dados suficientes (6+ meses, 50+ tenants), treinar modelo que identifica:
- Padrões de consumo sequencial (após X fazem Y)
- Propensão de compra por perfil
- Melhor momento para sugerir (dia da semana, horário)
