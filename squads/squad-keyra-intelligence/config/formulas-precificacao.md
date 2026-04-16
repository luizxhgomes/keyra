# Fórmulas de Precificação — KEYRA Intelligence

## Preço Mínimo

```
Preço Mínimo = Custo Total / (1 - Margem Desejada)
```

| Variável | Descrição | Unidade |
|----------|-----------|---------|
| Custo Total | Variáveis + Fixo Rateado | Centavos |
| Margem Desejada | Percentual desejado (0.00 a 0.99) | Decimal |
| Proteção | Se margem >= 1.0 → erro (preço infinito) | — |

## Margem de Contribuição

```
MC = Preço - Custos Variáveis
MC% = MC / Preço × 100
```

## Ponto de Equilíbrio

```
PE (quantidade) = Custos Fixos Totais / MC unitária
PE (R$) = PE (qtd) × Preço
```

| Cenário | Tratamento |
|---------|-----------|
| MC = 0 | PE = infinito → "Serviço não cobre custos variáveis" |
| MC < 0 | PE impossível → "Preço abaixo do custo variável" |

## Precificação de Pacotes

```
Preço Pacote = Preço Unitário × Sessões × (1 - Desconto)
Receita por Sessão = Preço Pacote / Total Sessões
Margem por Sessão = (Receita por Sessão - Custo Total) / Receita por Sessão × 100
```

| Regra | Validação |
|-------|----------|
| Desconto máximo | Configurável (padrão 30%) |
| Margem mínima | Alerta se margem por sessão < 10% |
| Receita diferida | Reconhecer por sessão entregue |

## Simulação de Cenários

```
Lucro Simulado = (Preço × (1 + Δpreço)) × (Volume × (1 + Δvolume))
               - (CustoVar × (1 + Δcusto)) × (Volume × (1 + Δvolume))
               - CustosFixos
Impacto = Lucro Simulado - Lucro Atual
```

## Regras Globais

- Todos os cálculos em centavos inteiros
- Arredondamento ROUND_HALF_UP
- Divisão por zero → retornar 0 ou mensagem de erro
- Margem negativa → alerta visual, não erro
