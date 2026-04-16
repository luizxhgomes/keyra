---
task: validarModeloFinanceiro()
responsavel: "@finance-domain-expert"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: prd
    tipo: markdown
    origem: docs/prd/keyra-prd.md
    obrigatório: true

  - campo: schema
    tipo: markdown
    origem: docs/architecture/SCHEMA.md
    obrigatório: false

Saída:
  - campo: modelo_financeiro
    tipo: markdown
    destino: docs/architecture/modelo-financeiro-keyra.md
    persistido: true

Checklist:
  - "[ ] Definir estrutura completa do DRE para estética"
  - "[ ] Definir regras de precificação de serviços (margem vs markup)"
  - "[ ] Modelar custos fixos e regras de rateio por serviço"
  - "[ ] Modelar custos variáveis (insumos por serviço)"
  - "[ ] Definir fórmula de lucro por serviço"
  - "[ ] Definir regras de reconhecimento de receita (avulso vs pacotes)"
  - "[ ] Projetar lógica de fluxo de caixa e contas a receber"
  - "[ ] Definir métricas do dashboard financeiro"
  - "[ ] Validar que valores monetários usam centavos inteiros"
  - "[ ] Documentar todas as fórmulas com exemplos numéricos"
---

# Validar Modelo Financeiro do KEYRA

## Objetivo

Definir e validar toda a lógica financeira do KEYRA: DRE, precificação, custos, lucro por serviço, reconhecimento de receita e métricas de dashboard.

## Entregáveis

1. **Estrutura do DRE** — Hierarquia de contas, fórmulas de cálculo
2. **Modelo de precificação** — Como calcular preço mínimo, margem, markup
3. **Alocação de custos** — Regras de rateio de custos fixos por serviço
4. **Lucro por serviço** — Fórmula completa com exemplo numérico
5. **Reconhecimento de receita** — Sessão avulsa vs pacote (diferimento)
6. **Métricas de dashboard** — Quais números mostrar, comparativos

## Regras de Negócio Financeiras

- Margem = (Preço - Custo Total) / Preço × 100
- Custo Total = Variáveis (insumos) + Rateio de Fixos
- Rateio de Fixo = Custo Fixo Total × (Tempo do Serviço / Tempo Total Disponível)
- Receita de pacote: reconhecida proporcionalmente por sessão entregue
- Valores em centavos inteiros (nunca float)
- DRE em regime de competência, fluxo de caixa em regime de caixa
