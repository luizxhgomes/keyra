---
task: validarAutomacaoFinanceira()
responsavel: "@finance-domain-expert"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 3
story_ref: "3.5"

Entrada:
  - campo: código_comanda
    tipo: code
    origem: src/lib/finance/comanda.ts
    obrigatório: true

  - campo: código_transação
    tipo: code
    origem: src/lib/finance/transacao.ts
    obrigatório: true

  - campo: código_custos
    tipo: code
    origem: src/lib/finance/custos.ts
    obrigatório: true

Saída:
  - campo: relatório_validação
    tipo: markdown
    destino: docs/qa/validacao-financeira-epic3.md
    persistido: true

Checklist:
  - "[ ] Validar lógica de geração de comanda (serviço → comanda automática)"
  - "[ ] Validar lógica de transação financeira (pagamento → transação)"
  - "[ ] Validar fórmula de rateio de custos fixos"
  - "[ ] Validar cálculo de custo variável por insumo"
  - "[ ] Verificar que valores monetários usam centavos inteiros (nunca float)"
  - "[ ] Verificar proteção contra divisão por zero"
  - "[ ] Verificar arredondamento ROUND_HALF_UP"
  - "[ ] Validar reconhecimento de receita para pagamentos parcelados"
  - "[ ] Validar baixa de estoque e custo médio ponderado"
  - "[ ] Testar cenários extremos (margem negativa, custo zero, estoque zero)"
  - "[ ] Emitir parecer: APROVADO | CORREÇÕES NECESSÁRIAS"
---

# Validação Financeira — Automação do Epic 3

## Objetivo

@finance-domain-expert (Valéria) revisa TODA a lógica financeira implementada no Epic 3 antes de ir para o QA gate de @qa (Quinn).

## O Que Validar

1. **Comanda automática** — O registro financeiro é gerado corretamente a partir do atendimento?
2. **Transação** — O pagamento gera transação com valor, categoria e profissional corretos?
3. **Parcelamento** — Parcelas futuras são contas a receber com datas corretas?
4. **Custos** — Rateio de fixos e alocação de variáveis estão matematicamente corretos?
5. **Estoque** — Baixa automática e custo médio ponderado funcionam?

## Critérios de Aprovação

- Nenhuma operação com float para valores monetários
- Fórmulas de rateio matematicamente corretas
- Arredondamento consistente (ROUND_HALF_UP)
- Proteção contra divisão por zero
- Cenários extremos tratados (margem negativa, custo zero)
