# Checklist de Revisão do Schema — KEYRA

## Estrutura Básica

- [ ] Toda tabela tem `id` (UUID, PK)
- [ ] Toda tabela tem `tenant_id` (FK para tenants)
- [ ] Toda tabela tem `created_at` (timestamptz, default now())
- [ ] Toda tabela tem `updated_at` (timestamptz, trigger on update)
- [ ] Soft delete com `deleted_at` onde necessário

## Multi-Tenancy e Segurança

- [ ] RLS ativado em todas as tabelas com dados de tenant
- [ ] Policy `tenant_id = auth.jwt()->>'tenant_id'` em toda tabela
- [ ] Nenhuma query sem filtro de tenant possível via RLS
- [ ] Roles definidos (owner, admin, operator)
- [ ] Permissões por role documentadas

## Domínio Financeiro

- [ ] Valores monetários em `integer` (centavos) ou `numeric(12,2)`
- [ ] Nenhum campo monetário usando `float` ou `real`
- [ ] Tabelas de DRE com hierarquia de contas
- [ ] Tabelas de custos fixos e variáveis separadas
- [ ] Tabela de alocação de custos por serviço
- [ ] Transações com status (pendente, confirmada, cancelada)
- [ ] Contas a receber com data de vencimento

## Integridade Referencial

- [ ] Foreign keys definidas em todas as relações
- [ ] Cascading rules definidas (ON DELETE, ON UPDATE)
- [ ] Check constraints para valores válidos
- [ ] Unique constraints onde necessário

## Índices e Performance

- [ ] Índice em `tenant_id` em todas as tabelas
- [ ] Índice em colunas de busca frequente (data, status)
- [ ] Índice composto para consultas comuns
- [ ] Sem índices desnecessários

## Documentação

- [ ] COMMENT ON em todas as tabelas
- [ ] COMMENT ON em colunas não óbvias
- [ ] Diagrama ER atualizado
- [ ] Migrações SQL sequenciais e idempotentes

## Conformidade

- [ ] Campos de dados pessoais identificados (PII)
- [ ] Campos sensíveis (saúde) marcados
- [ ] Política de retenção por tipo de dado
- [ ] Suporte a exclusão de dados (direito ao esquecimento)
