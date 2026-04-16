---
task: definirFormulasPrecificacao()
responsavel: "@finance-domain-expert"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 5
story_ref: "5.2"

Saída:
  - campo: documento_formulas
    tipo: markdown
    destino: docs/architecture/formulas-precificacao-keyra.md
    persistido: true

Checklist:
  - "[ ] Definir fórmula de preço mínimo (custo total + margem desejada)"
  - "[ ] Definir fórmula de margem de contribuição por serviço"
  - "[ ] Definir fórmula de ponto de equilíbrio (break-even)"
  - "[ ] Definir lógica de precificação de pacotes com desconto progressivo"
  - "[ ] Definir reconhecimento de receita diferida para pacotes"
  - "[ ] Definir fórmula de alertas de estoque (consumo médio × lead time)"
  - "[ ] Documentar cada fórmula com exemplo numérico completo"
  - "[ ] Validar que todas as fórmulas operam em centavos inteiros"
  - "[ ] Listar cenários extremos (custo zero, margem 100%, desconto 50%)"
---

# Definir Fórmulas de Precificação

## Objetivo

@finance-domain-expert (Valéria) define TODAS as fórmulas do motor de precificação com exemplos numéricos e validação de cenários extremos.

## Fórmulas a Definir

### 1. Preço Mínimo
```
Custo Total = Variáveis + Fixo Rateado
Preço Mínimo = Custo Total / (1 - Margem Desejada)

Exemplo: Custo = R$ 65, Margem = 40%
Preço Mínimo = 6500 / (1 - 0.40) = 6500 / 0.60 = 10833 → R$ 108,33
```

### 2. Margem de Contribuição
```
MC = Preço - Custos Variáveis
MC% = MC / Preço × 100

Exemplo: Preço = R$ 150, Variáveis = R$ 23
MC = 15000 - 2300 = 12700 → R$ 127,00
MC% = 12700 / 15000 × 100 = 84,7%
```

### 3. Ponto de Equilíbrio
```
PE (qtd) = Custos Fixos Totais / MC unitária
PE (R$) = PE (qtd) × Preço

Exemplo: Fixos = R$ 8.800, MC = R$ 127
PE = 880000 / 12700 = 69,3 → 70 atendimentos/mês
```

### 4. Pacotes
```
Preço Pacote = Preço Unitário × Sessões × (1 - Desconto)
Receita por Sessão = Preço Pacote / Total Sessões

Exemplo: 5 sessões de R$ 150 com 10% off
Pacote = 15000 × 5 × 0.90 = 67500 → R$ 675,00
Por sessão = 67500 / 5 = 13500 → R$ 135,00
```

### 5. Alerta de Estoque
```
Estoque Mínimo = Consumo Médio Diário × Lead Time (dias)
Alerta se: Estoque Atual < Estoque Mínimo

Exemplo: Consumo = 2 unid/dia, Lead Time = 7 dias
Mínimo = 2 × 7 = 14 unidades
```
