---
task: crudServicos()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 2
story_ref: "2.2"

Entrada:
  - campo: schema
    tipo: markdown
    origem: docs/architecture/SCHEMA.md
    obrigatório: true

  - campo: modelo_financeiro
    tipo: markdown
    origem: docs/architecture/modelo-financeiro-keyra.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/servicos/
    persistido: true

Checklist:
  - "[ ] Criar migration para tabelas services, service_categories, service_costs"
  - "[ ] services: id, tenant_id, name, category_id, duration_minutes, price (centavos), is_active"
  - "[ ] service_costs: service_id, cost_type (fixo/variável), description, amount (centavos)"
  - "[ ] Implementar RLS por tenant_id em ambas as tabelas"
  - "[ ] Criar API routes para CRUD de serviços e categorias"
  - "[ ] Criar página de catálogo com preço, custo e margem por serviço"
  - "[ ] Exibir margem calculada automaticamente: (preço - custo total) / preço × 100"
  - "[ ] Formulário de cadastro com campos de custo fixo e variável"
  - "[ ] Valores monetários em centavos inteiros — exibir formatado R$ X.XXX,XX"
  - "[ ] Validação: @finance-domain-expert revisa fórmulas de margem"
  - "[ ] Testes unitários para cálculos de margem e custo"
---

# CRUD de Serviços com Custo e Margem

## Objetivo

Implementar o catálogo de serviços com precificação integrada — cada serviço exibe preço, custo total e margem calculada automaticamente.

## Modelo de Dados

```
services
  ├── id (UUID PK)
  ├── tenant_id (FK)
  ├── name ("Limpeza de Pele")
  ├── category_id (FK → service_categories)
  ├── duration_minutes (60)
  ├── price (15000 → R$ 150,00) ← centavos
  ├── is_active (boolean)
  ├── created_at, updated_at

service_costs
  ├── id (UUID PK)
  ├── service_id (FK → services)
  ├── cost_type ("variável" | "fixo")
  ├── description ("Produto X", "Rateio aluguel")
  ├── amount (3500 → R$ 35,00) ← centavos
```

## Cálculos (validar com @finance-domain-expert)

```
Custo Total = SUM(service_costs.amount) WHERE service_id = X
Margem = (price - custo_total) / price × 100
Markup = (price - custo_total) / custo_total × 100
```

## Princípio UX

Na listagem de serviços, mostrar:
- Nome | Duração | Preço | Custo | **Margem %** (destaque)
