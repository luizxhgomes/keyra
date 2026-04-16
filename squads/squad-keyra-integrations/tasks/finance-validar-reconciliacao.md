---
task: validarReconciliacao()
responsavel: "@finance-domain-expert"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 7
story_ref: "7.1.6"

Entrada:
  - campo: código_reconciliação
    tipo: code
    origem: src/lib/documents/reconciliation/
    obrigatório: true

Saída:
  - campo: relatório_validação
    tipo: markdown
    destino: docs/qa/validacao-reconciliacao-extratos.md
    persistido: true

Checklist:
  - "[ ] Validar algoritmo de matching (critérios de data, valor, descrição)"
  - "[ ] Verificar que comparações de valor usam centavos inteiros"
  - "[ ] Validar tolerância de data (±2 dias é aceitável?)"
  - "[ ] Verificar tratamento de taxas de maquininha (bruto vs líquido)"
  - "[ ] Validar categorização automática (descrição → categoria KEYRA)"
  - "[ ] Verificar que importação de novas transações gera lançamentos corretos"
  - "[ ] Testar cenários: match perfeito, divergência de taxa, duplicata"
  - "[ ] Verificar que reconciliação não cria transações com valores float"
  - "[ ] Emitir parecer: APROVADO | CORREÇÕES NECESSÁRIAS"
---

# Validação Financeira — Reconciliação de Extratos

## Objetivo

@finance-domain-expert (Valéria) valida a lógica de reconciliação entre extratos importados e transações do KEYRA.

## Pontos Críticos

1. **Taxas de maquininha:** Venda no KEYRA = R$ 150 (bruto), extrato da Stone = R$ 145,50 (líquido). Diferença = taxa.
2. **Parcelamento:** Crédito 3x = 3 recebimentos futuros no extrato.
3. **Antecipação:** Operadora antecipa recebíveis — valor e data mudam.
4. **Datas:** Venda no KEYRA em D, recebimento na maquininha em D+1 (débito) ou D+30 (crédito).
