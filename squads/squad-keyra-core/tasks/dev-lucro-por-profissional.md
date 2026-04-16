---
task: lucroPorProfissional()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 4
story_ref: "4.4"

Entrada:
  - campo: regras_financeiras
    tipo: yaml
    origem: data/regras-financeiras.yaml
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/dre/por-profissional/
    persistido: true

Checklist:
  - "[ ] Calcular receita por profissional (transações vinculadas ao profissional)"
  - "[ ] Calcular custos por profissional (insumos + rateio de fixos)"
  - "[ ] Calcular lucro e margem por profissional"
  - "[ ] Ranking de profissionais por receita gerada"
  - "[ ] Ranking por lucro gerado"
  - "[ ] Comparativo com período anterior"
  - "[ ] Formato tabular, números absolutos"
  - "[ ] Validação: @finance-domain-expert revisa critérios de alocação"
  - "[ ] Testes com cenários de múltiplos profissionais"
---

# Lucro por Profissional

## Objetivo

Implementar a visão de lucratividade por profissional — quanto cada pessoa da equipe gera de receita, custo e lucro.

## Visualização

```
Lucro por Profissional — Março 2026

| Profissional | Atendimentos | Receita     | Custos      | Lucro       | Margem |
|-------------|-------------|-------------|-------------|-------------|--------|
| Ana Silva   | 85          | R$ 18.200   | R$ 8.100    | R$ 10.100   | 55,5%  |
| Carla Lima  | 62          | R$ 10.250   | R$ 5.300    | R$ 4.950    | 48,3%  |
```

## Regra de Alocação

- Receita: transações confirmadas onde `professional_id = X`
- Custo variável: insumos consumidos nos atendimentos do profissional
- Custo fixo: rateado por proporção de horas trabalhadas
