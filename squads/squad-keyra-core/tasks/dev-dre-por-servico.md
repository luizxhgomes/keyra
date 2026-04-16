---
task: drePorServico()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 4
story_ref: "4.2"

Entrada:
  - campo: dre_basica
    tipo: code
    origem: src/app/(auth)/dre/
    obrigatório: true

  - campo: regras_financeiras
    tipo: yaml
    origem: data/regras-financeiras.yaml
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/dre/por-servico/
    persistido: true

Checklist:
  - "[ ] Implementar DRE por serviço — DIFERENCIAL do KEYRA"
  - "[ ] Para cada serviço: receita, custos variáveis, rateio fixo, lucro, margem"
  - "[ ] Ranking de serviços por lucro (mais lucrativo → menos lucrativo)"
  - "[ ] Ranking de serviços por margem (%)"
  - "[ ] Identificar serviços com margem negativa (alerta)"
  - "[ ] Formato tabular com números absolutos"
  - "[ ] Comparativo com período anterior por serviço"
  - "[ ] Validação: @finance-domain-expert revisa fórmulas de rateio"
  - "[ ] Usar checklist-dre-por-servico.md para validação"
  - "[ ] Testes com cenários: serviço lucrativo, margem zero, margem negativa"
---

# DRE por Serviço — Diferencial KEYRA

## Objetivo

Implementar o DRE por serviço — funcionalidade que NENHUM concorrente oferece. Permite à profissional saber exatamente quanto lucra (ou perde) com cada serviço.

## Visualização

```
Lucro por Serviço — Março 2026

| Serviço          | Receita     | Custos      | Lucro       | Margem |
|-----------------|-------------|-------------|-------------|--------|
| Botox           | R$ 12.000   | R$ 4.800    | R$ 7.200    | 60,0%  |
| Limpeza de Pele | R$ 8.400    | R$ 3.920    | R$ 4.480    | 53,3%  |
| Peeling         | R$ 5.600    | R$ 4.200    | R$ 1.400    | 25,0%  |
| Depilação       | R$ 2.450    | R$ 2.680    | -R$ 230     | -9,4%  | ⚠️
```

## Cálculo por Serviço

```
Receita do Serviço = SUM(transações confirmadas WHERE serviço = X)
Custo Variável = SUM(insumos consumidos WHERE serviço = X)
Custo Fixo Rateado = Total Fixo × (tempo do serviço / tempo total)
Lucro = Receita - Variável - Fixo Rateado
Margem = Lucro / Receita × 100
```
