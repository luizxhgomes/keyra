---
task: custosFixosVariaveis()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 3
story_ref: "3.3"

Entrada:
  - campo: regras_financeiras
    tipo: yaml
    origem: data/regras-financeiras.yaml
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/finance/custos.ts
    persistido: true

Checklist:
  - "[ ] Criar tela de cadastro de custos fixos (aluguel, energia, funcionários, etc.)"
  - "[ ] Criar tela de cadastro de custos variáveis por serviço (insumos)"
  - "[ ] Custos fixos: valor, periodicidade (mensal/semanal), categoria"
  - "[ ] Custos variáveis: vinculados ao serviço, valor por uso"
  - "[ ] Implementar rateio de custos fixos por serviço"
  - "[ ] Fórmula de rateio: custo fixo × (tempo do serviço / tempo total disponível)"
  - "[ ] Exibir custo total por serviço: fixo rateado + variáveis"
  - "[ ] Atualizar margem do serviço ao alterar custos"
  - "[ ] Valores em centavos inteiros"
  - "[ ] Validação: @finance-domain-expert revisa fórmulas de rateio"
  - "[ ] Testes para cálculos de rateio com diferentes cenários"
---

# Custos Fixos e Variáveis

## Objetivo

Implementar o módulo de gestão de custos — separar fixos e variáveis, permitir rateio automático por serviço e calcular custo total por serviço.

## Modelo

```
Custos Fixos (mensais)
  ├── Aluguel: R$ 3.000
  ├── Energia: R$ 800
  ├── Funcionários: R$ 5.000
  └── Total fixo: R$ 8.800

Custos Variáveis (por serviço)
  ├── Limpeza de Pele: Produto X R$ 15 + Produto Y R$ 8 = R$ 23
  └── Botox: Produto Z R$ 120

Rateio de Custo Fixo por Serviço:
  Limpeza de Pele (60 min):
    R$ 8.800 × (60 / 480 horas/mês) = R$ 1.100 rateado
    Custo total = R$ 23 (variável) + R$ 1.100 (fixo) = R$ 1.123
    Se preço = R$ 150: margem = (150 - 112,30) / 150 = 25,1%
```

## Dependências

- Schema de service_costs (dev-crud-servicos.md)
- Modelo financeiro aprovado (@finance-domain-expert)
