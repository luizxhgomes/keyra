---
task: dreBasica()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 4
story_ref: "4.1"

Entrada:
  - campo: modelo_financeiro
    tipo: markdown
    origem: docs/architecture/modelo-financeiro-keyra.md
    obrigatório: true

  - campo: regras_financeiras
    tipo: yaml
    origem: data/regras-financeiras.yaml
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/dre/
    persistido: true

Checklist:
  - "[ ] Implementar cálculo de DRE por período (mensal, trimestral, anual)"
  - "[ ] Estrutura: Receita Bruta → Deduções → Receita Líquida → Custos → Lucro Bruto → Despesas → Lucro Operacional"
  - "[ ] Buscar receitas do período (transações confirmadas)"
  - "[ ] Buscar custos variáveis do período (insumos consumidos)"
  - "[ ] Buscar custos fixos do período (rateados)"
  - "[ ] Buscar despesas operacionais do período"
  - "[ ] Exibir em formato tabular (NUNCA gráfico)"
  - "[ ] Comparativo com período anterior (textual)"
  - "[ ] Regime de competência (data do fato gerador, não do pagamento)"
  - "[ ] Valores em centavos — exibir formatado R$ X.XXX,XX"
  - "[ ] Validação: @finance-domain-expert revisa estrutura e fórmulas"
  - "[ ] Testes para cálculos de DRE com dados reais"
---

# DRE Básica

## Objetivo

Implementar o Demonstrativo de Resultados do Exercício (DRE) do KEYRA — gerado automaticamente a partir das transações.

## Estrutura da DRE

```
(+) Receita Bruta de Serviços          R$ 28.450,00
(-) Deduções (impostos sobre receita)  R$  1.706,70
(=) Receita Líquida                    R$ 26.743,30
(-) Custos dos Serviços Prestados      R$  8.200,00
    ├── Insumos (variáveis)            R$  3.200,00
    └── Mão de obra direta             R$  5.000,00
(=) Lucro Bruto                        R$ 18.543,30
(-) Despesas Operacionais              R$ 12.800,00
    ├── Aluguel                        R$  3.000,00
    ├── Energia/Água                   R$    800,00
    ├── Marketing                      R$  1.500,00
    └── Administrativo                 R$  7.500,00
(=) Lucro Operacional                  R$  5.743,30
(-) Depreciação                        R$    500,00
(=) Resultado Líquido                  R$  5.243,30
```

## Princípio UX

- Formato tabular com linhas claras
- Números absolutos, NUNCA gráficos
- Comparativo textual: "R$ 1.200 a mais que o mês passado"
