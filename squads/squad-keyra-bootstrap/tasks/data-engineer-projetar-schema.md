---
task: projetarSchema()
responsavel: "@data-engineer"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: prd
    tipo: markdown
    origem: docs/prd/keyra-prd.md
    obrigatório: true

  - campo: arquitetura
    tipo: markdown
    origem: docs/architecture/keyra-architecture.md
    obrigatório: true

Saída:
  - campo: schema_documento
    tipo: markdown
    destino: docs/architecture/SCHEMA.md
    persistido: true

  - campo: migrações_iniciais
    tipo: sql
    destino: supabase/migrations/
    persistido: true

Checklist:
  - "[ ] Analisar entidades do PRD (12 módulos)"
  - "[ ] Modelar tabelas do domínio financeiro"
  - "[ ] Modelar tabelas de agenda e atendimentos"
  - "[ ] Modelar tabelas de serviços e catálogo"
  - "[ ] Modelar tabelas de estoque e insumos"
  - "[ ] Projetar multi-tenancy (tenant_id em todas as tabelas)"
  - "[ ] Definir RLS policies por tenant"
  - "[ ] Definir índices baseados em padrões de acesso"
  - "[ ] Projetar soft deletes onde necessário (deleted_at)"
  - "[ ] Documentar com COMMENT ON em cada tabela/coluna"
  - "[ ] Validar com checklist de revisão de schema"
---

# Projetar Schema do Banco de Dados KEYRA

## Objetivo

Projetar o schema PostgreSQL completo do KEYRA com RLS multi-tenant, cobrindo os 12 módulos do sistema.

## Entidades Principais

| Domínio | Tabelas Esperadas |
|---------|------------------|
| Tenants | tenants, tenant_users, roles |
| Agenda | appointments, appointment_slots, schedules |
| Pacientes | patients, patient_history |
| Serviços | services, service_categories, service_costs |
| Comanda | service_orders, service_order_items |
| Financeiro | transactions, accounts, payment_methods |
| Custos | fixed_costs, variable_costs, cost_allocations |
| DRE | dre_entries, dre_periods |
| Estoque | inventory_items, inventory_movements, suppliers |
| Documentos | uploaded_documents, parsed_data |

## Princípios

- Toda tabela tem: `id` (UUID PK), `tenant_id` (FK), `created_at`, `updated_at`
- RLS ativo em todas as tabelas com `tenant_id = auth.jwt()->>'tenant_id'`
- Valores monetários em `integer` (centavos) ou `numeric(12,2)`
- Foreign keys sempre definidas
- Índices em colunas de busca frequente

## Dependências

- Requer PRD aprovado
- Requer documento de arquitetura (padrão de multi-tenancy)
- Consultar @finance-domain-expert para tabelas financeiras

## Validação

Usar: `checklists/checklist-revisao-schema.md`
