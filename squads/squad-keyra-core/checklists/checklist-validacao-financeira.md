# Checklist de Validação Financeira — KEYRA

> Usado por @finance-domain-expert (Valéria) no gate financeiro

## Valores Monetários

- [ ] Todos os valores monetários em centavos inteiros (integer)
- [ ] Nenhum uso de `float`, `double` ou `real` para dinheiro
- [ ] Tipo `numeric(12,2)` no banco quando necessário
- [ ] Formatação R$ X.XXX,XX apenas na camada de apresentação
- [ ] Arredondamento ROUND_HALF_UP consistente

## Fórmulas

- [ ] Margem = (preço - custo total) / preço × 100 ✓
- [ ] Markup = (preço - custo total) / custo total × 100 ✓
- [ ] Rateio fixo = custo fixo × (tempo serviço / tempo total) ✓
- [ ] Lucro por serviço = receita - variáveis - fixo rateado ✓
- [ ] Proteção contra divisão por zero em TODOS os cálculos de razão
- [ ] Nenhuma fórmula inventada (rastreável ao modelo financeiro)

## DRE

- [ ] Estrutura hierárquica correta (Receita → Deduções → ... → Resultado)
- [ ] Regime de competência (data do fato gerador, não do pagamento)
- [ ] Soma dos serviços = total da DRE (consistência vertical)
- [ ] Receita da DRE = soma de transações confirmadas do período

## Reconhecimento de Receita

- [ ] Sessão avulsa: reconhecida no momento do atendimento
- [ ] Pacote: reconhecida proporcionalmente por sessão entregue
- [ ] Pagamento parcelado: receita na competência, parcelas no caixa

## Cenários Extremos

- [ ] Margem negativa tratada (alerta, não erro)
- [ ] Custo zero tratado (margem = 100%, sem divisão por zero)
- [ ] Serviço sem atendimentos (não aparece no DRE por serviço)
- [ ] Mês sem faturamento (DRE zerada, não erro)
- [ ] Estoque zero (alerta, não bloqueia comanda)
