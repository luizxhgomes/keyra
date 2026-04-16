# Checklist de Fórmulas de Precificação — KEYRA

## Preço Mínimo

- [ ] Fórmula: `custo / (1 - margem)` implementada corretamente
- [ ] Proteção: margem >= 1.0 retorna erro (preço infinito)
- [ ] Proteção: custo = 0 retorna 0 (serviço sem custo)
- [ ] Centavos inteiros no cálculo e no resultado
- [ ] Arredondamento ROUND_HALF_UP no resultado

## Margem e Markup

- [ ] Margem = (preço - custo) / preço × 100
- [ ] Markup = (preço - custo) / custo × 100
- [ ] Proteção contra divisão por zero (preço = 0 ou custo = 0)
- [ ] Margem negativa tratada com alerta (não erro)

## Ponto de Equilíbrio

- [ ] PE = custos fixos / MC unitária
- [ ] MC = 0 → mensagem "Serviço não cobre variáveis"
- [ ] MC < 0 → mensagem "Preço abaixo do custo variável"
- [ ] Resultado arredondado para cima (ceil)

## Pacotes

- [ ] Preço = unitário × sessões × (1 - desconto)
- [ ] Receita por sessão = preço pacote / total sessões
- [ ] Margem por sessão verificada (alerta se < 10%)
- [ ] Receita diferida: reconhecida por sessão entregue
- [ ] Desconto máximo respeitado (configurável)

## Simulação

- [ ] Variáveis aplicadas corretamente (Δpreço, Δvolume, Δcusto)
- [ ] Resultado comparado com situação atual
- [ ] Impacto em R$ e % exibido
- [ ] Cenários extremos tratados (0%, -100%, +1000%)

## Alertas de Estoque

- [ ] Consumo médio calculado dos últimos 30 dias
- [ ] Lead time configurável por fornecedor
- [ ] Estoque mínimo = consumo × lead time
- [ ] Alerta disparado quando estoque < mínimo
- [ ] Sem consumo histórico → sem alerta (não erro)
