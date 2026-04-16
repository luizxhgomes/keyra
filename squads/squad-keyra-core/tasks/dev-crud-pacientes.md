---
task: crudPacientes()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 2
story_ref: "2.1"

Entrada:
  - campo: schema
    tipo: markdown
    origem: docs/architecture/SCHEMA.md
    obrigatório: true

  - campo: arquitetura
    tipo: markdown
    origem: docs/architecture/keyra-architecture.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/pacientes/
    persistido: true

  - campo: api_routes
    tipo: code
    destino: src/app/api/patients/
    persistido: true

Checklist:
  - "[ ] Criar migration para tabela patients (id, tenant_id, name, cpf, phone, email, birth_date, notes, created_at, updated_at, deleted_at)"
  - "[ ] Implementar RLS policy por tenant_id"
  - "[ ] Criar API routes: GET /api/patients, GET /api/patients/:id, POST, PUT, DELETE (soft delete)"
  - "[ ] Criar página de listagem com busca por nome/CPF"
  - "[ ] Criar formulário de cadastro/edição com validação Zod"
  - "[ ] Implementar máscara de CPF e telefone"
  - "[ ] Criar tela de detalhes do paciente com histórico"
  - "[ ] Testes unitários para validações"
  - "[ ] Testes de integração para API routes"
  - "[ ] Verificar que CPF é dado pessoal (LGPD) — mascarar em logs"
---

# CRUD de Pacientes

## Objetivo

Implementar o módulo completo de gestão de pacientes com CRUD, busca e histórico.

## Campos do Paciente

| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|-----------|
| name | string | Sim | Nome completo |
| cpf | string | Não | Dado pessoal (LGPD) — mascarar |
| phone | string | Sim | Com máscara (XX) XXXXX-XXXX |
| email | string | Não | Para notificações |
| birth_date | date | Não | |
| notes | text | Não | Observações gerais |

## Validações

- Nome: mínimo 3 caracteres
- CPF: validar dígitos verificadores (se preenchido)
- Telefone: formato brasileiro
- E-mail: formato válido (se preenchido)

## Dependências

- Migration da tabela `patients` (data-engineer-migrations-core.md)
- RLS por tenant_id configurado
