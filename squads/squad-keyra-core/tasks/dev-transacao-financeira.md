---
task: transacaoFinanceira()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 3
story_ref: "3.2"

Entrada:
  - campo: modelo_financeiro
    tipo: markdown
    origem: docs/architecture/modelo-financeiro-keyra.md
    obrigatório: true

  - campo: categorias
    tipo: yaml
    origem: data/categorias-transacao.yaml
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/finance/transacao.ts
    persistido: true

Checklist:
  - "[ ] Ao registrar pagamento na comanda, gerar transação financeira automática"
  - "[ ] Transação: valor, data, forma de pagamento, categoria, status"
  - "[ ] Formas de pagamento: dinheiro, PIX, débito, crédito (à vista e parcelado)"
  - "[ ] Parcelamento: registrar parcelas como transações futuras (contas a receber)"
  - "[ ] Vincular transação à comanda (service_order_id)"
  - "[ ] Categorias de transação configuráveis (data/categorias-transacao.yaml)"
  - "[ ] Status: pendente | confirmada | cancelada | estornada"
  - "[ ] Valores em centavos inteiros"
  - "[ ] Registrar profissional responsável (para lucro por profissional)"
  - "[ ] Validação: @finance-domain-expert revisa fluxo de pagamento"
  - "[ ] Testes: comanda → pagamento → transação → parcelas"
---

# Transação Financeira Automática

## Objetivo

Implementar a geração automática de transação financeira ao registrar pagamento em uma comanda. Isso fecha o ciclo: agenda → comanda → pagamento → financeiro.

## Fluxo

```
Comanda aberta
  → Registrar pagamento
     ├── Forma de pagamento (dinheiro, PIX, cartão)
     ├── Valor pago
     └── Parcelamento (se cartão crédito)
  → Gerar transação financeira
     ├── Categoria: "Receita de Serviços"
     ├── Valor (centavos)
     ├── Profissional
     └── Status: confirmada
  → Se parcelado:
     └── Gerar N transações futuras (contas a receber)
  → Comanda fechada
```

## Formas de Pagamento

| Forma | Recebimento | Parcelas |
|-------|------------|----------|
| Dinheiro | Imediato | Não |
| PIX | Imediato | Não |
| Débito | D+1 (maquininha) | Não |
| Crédito à vista | D+30 (maquininha) | Não |
| Crédito parcelado | D+30, D+60, ... | Sim |
