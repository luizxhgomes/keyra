---
task: validarDreDashboard()
responsavel: "@finance-domain-expert"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 4
story_ref: "4.5"

Entrada:
  - campo: código_dre
    tipo: code
    origem: src/app/(auth)/dre/
    obrigatório: true

  - campo: código_dashboard
    tipo: code
    origem: src/app/(auth)/dashboard/
    obrigatório: true

Saída:
  - campo: relatório_validação
    tipo: markdown
    destino: docs/qa/validacao-financeira-epic4.md
    persistido: true

Checklist:
  - "[ ] Validar estrutura da DRE (hierarquia de contas correta)"
  - "[ ] Validar totais da DRE (somas batem com transações)"
  - "[ ] Validar DRE por serviço (rateio de fixos correto)"
  - "[ ] Validar lucro por profissional (alocação justa)"
  - "[ ] Validar regime de competência (data do fato gerador)"
  - "[ ] Validar métricas do dashboard (ticket médio, comparativos)"
  - "[ ] Verificar consistência: total da DRE = soma dos serviços"
  - "[ ] Verificar centavos inteiros em todos os cálculos"
  - "[ ] Verificar arredondamento e proteção divisão por zero"
  - "[ ] Testar com dados reais (seed) e verificar manualmente"
  - "[ ] Emitir parecer: APROVADO | CORREÇÕES NECESSÁRIAS"
---

# Validação Financeira — DRE e Dashboard (Epic 4)

## Objetivo

@finance-domain-expert (Valéria) revisa TODA a lógica financeira do Epic 4 — DRE, DRE por serviço, lucro por profissional e métricas do dashboard.

## Critérios de Validação

1. **Consistência vertical:** Total da DRE = soma de todos os serviços
2. **Consistência horizontal:** Receita da DRE = soma das transações confirmadas do período
3. **Regime correto:** Competência para DRE (data do fato), caixa para fluxo
4. **Rateio justo:** Custos fixos distribuídos proporcionalmente
5. **Arredondamento:** ROUND_HALF_UP, sem centavos perdidos
6. **Dashboard:** Métricas calculadas corretamente, comparativos precisos
