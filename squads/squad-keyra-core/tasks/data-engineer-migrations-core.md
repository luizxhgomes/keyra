---
task: migrationsCore()
responsavel: "@data-engineer"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 2
story_ref: "2.0"

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
  - campo: migrações
    tipo: sql
    destino: supabase/migrations/
    persistido: true

Checklist:
  - "[ ] Criar migration 0001_create_tenants.sql (tenants, tenant_users, roles)"
  - "[ ] Criar migration 0002_create_patients.sql"
  - "[ ] Criar migration 0003_create_services.sql (services, service_categories, service_costs)"
  - "[ ] Criar migration 0004_create_appointments.sql (appointments, schedules)"
  - "[ ] Criar migration 0005_create_transactions.sql (transactions, accounts, payment_methods)"
  - "[ ] Criar migration 0006_create_inventory.sql (inventory_items, inventory_movements)"
  - "[ ] Criar migration 0007_create_dre.sql (dre_entries, dre_periods, cost_allocations)"
  - "[ ] Criar migration 0008_create_documents.sql (uploaded_documents, parsed_data)"
  - "[ ] RLS policies em TODAS as tabelas com tenant_id"
  - "[ ] Trigger updated_at em todas as tabelas"
  - "[ ] COMMENT ON em todas as tabelas e colunas não óbvias"
  - "[ ] Índices em tenant_id, colunas de busca e FKs"
  - "[ ] Valores monetários: integer (centavos) ou numeric(12,2)"
  - "[ ] Seed data para ambiente de desenvolvimento"
  - "[ ] Testar rollback de cada migration"
---

# Migrations do Core — Todas as Tabelas do MVP

## Objetivo

Criar todas as migrations SQL do MVP em sequência, com RLS, índices, triggers e documentação.

## Ordem das Migrations

| # | Migration | Tabelas | Dependências |
|---|----------|---------|-------------|
| 0001 | tenants | tenants, tenant_users, roles | Nenhuma |
| 0002 | patients | patients | tenants |
| 0003 | services | services, service_categories, service_costs | tenants |
| 0004 | appointments | appointments, schedules | tenants, patients, services |
| 0005 | transactions | transactions, accounts, payment_methods | tenants, appointments |
| 0006 | inventory | inventory_items, inventory_movements, suppliers | tenants, services |
| 0007 | dre | dre_entries, dre_periods, cost_allocations | tenants, services, transactions |
| 0008 | documents | uploaded_documents, parsed_data | tenants |

## Padrão por Tabela

```sql
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  -- campos específicos
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON table_name
  USING (tenant_id = (auth.jwt()->>'tenant_id')::UUID);

-- Trigger updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_table_tenant ON table_name(tenant_id);

-- Documentação
COMMENT ON TABLE table_name IS 'Descrição da tabela';
```
