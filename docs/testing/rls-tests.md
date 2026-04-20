# Testes de Isolamento RLS

> **Arquivo da suíte:** `supabase/tests/rls_isolation.test.sql`
> **Workflow CI:** `.github/workflows/rls-tests.yml`
> **Comando curto (local):** `./scripts/run-rls-tests.sh` (se existir) · `psql -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.test.sql`

## Por que esta suíte existe

O ADR-011 coloca Row Level Security como **peça central** de isolamento entre organizações no KEYRA. Toda tabela tenant-scoped tem uma policy `USING (org_id = current_org_id())` — se alguém acidentalmente desabilitar RLS numa tabela ou quebrar uma policy num refactor, a única vítima seria nosso cliente pagante. Esta suíte é o *safety net* que detecta essa regressão **antes** do merge.

## O que é verificado

A suíte roda em três blocos principais + um smoke inverso:

| Bloco | Cenário | Cobertura |
|-------|---------|-----------|
| **A** | User A (org A) impersonado via GUC `request.jwt.claims` | Isolamento de leitura, inserção cross-tenant bloqueada, `UPDATE`/`DELETE` cross-tenant com 0 linhas, lookup direto por ID retorna vazio |
| **B** | Espelho do bloco A do ponto de vista do User B | Mesma garantia, direção oposta |
| **C** | User autenticado mas **sem** claim `org_id` | Deve ver zero linhas em todas as tabelas tenant-scoped |
| **E** | Cobertura expandida (Story 1.4) | `memberships`, `organization_invites`, `appointments`, `commands`, `supplies` — isolamento de leitura, `UPDATE` cross-tenant bloqueado, `INSERT` cross-tenant bloqueado em `memberships` |
| **F** (smoke inverso) | Consulta `pg_class.relrowsecurity` | Se qualquer tabela tenant-scoped aparecer com RLS desabilitada, a suíte **falha imediatamente** com mensagem listando as tabelas afetadas |

## Como rodar localmente

### Opção 1 — contra Supabase local

```bash
supabase db reset --local
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2-)" \
     -v ON_ERROR_STOP=1 \
     -f supabase/tests/rls_isolation.test.sql
```

### Opção 2 — contra um Postgres 17 descartável (útil se `supabase start` estiver indisponível)

```bash
docker run -d --rm --name keyra-pg -e POSTGRES_PASSWORD=postgres -p 54345:5432 postgres:17
sleep 3

export PGHOST=localhost PGPORT=54345 PGUSER=postgres PGPASSWORD=postgres PGDATABASE=postgres

# Pré-requisitos que o Supabase monta por você (auth schema, roles, stubs de auth.uid())
psql -v ON_ERROR_STOP=1 <<'SQL'
  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE SCHEMA IF NOT EXISTS extensions;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN CREATE ROLE supabase_auth_admin; END IF;
  END $$;
  CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY, email text, instance_id uuid, aud text, role text, email_confirmed_at timestamptz, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $fn$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $fn$;
  CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $fn$ SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb $fn$;
SQL

# Aplica todas as migrations
for f in supabase/migrations/*.sql; do psql -v ON_ERROR_STOP=1 -f "$f"; done

# Roda a suíte
psql -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.test.sql

docker stop keyra-pg
```

O script do CI (`.github/workflows/rls-tests.yml`) usa essa mesma sequência com Postgres service container.

### Saída esperada

```
NOTICE:  RLS test block A (user A isolation): PASSED
NOTICE:  RLS test block B (user B isolation): PASSED
NOTICE:  RLS test block E (expanded coverage): PASSED
NOTICE:  RLS test block F (smoke inverso — RLS habilitada em todas): PASSED
NOTICE:  RLS test block C (no-claim deny): PASSED
NOTICE:  ALL RLS ISOLATION TESTS PASSED
```

Qualquer `ERROR:` interrompe o script com exit code diferente de zero (pelo `-v ON_ERROR_STOP=1`).

## Como adicionar uma nova tabela à cobertura

Quando uma nova tabela tenant-scoped (com coluna `org_id`) for criada:

1. **Obrigatório** — adicionar o nome à lista do bloco F (smoke inverso). Isso garante que a tabela será detectada se alguém esquecer `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
2. **Recomendado** — no bloco E, inserir uma fixture para ambas as orgs e acrescentar uma asserção `SELECT count(*)` seguida de `UPDATE` cross-tenant com `GET DIAGNOSTICS ... ROW_COUNT`.
3. Se a tabela tem relação de dependência com outras já cobertas (ex.: `command_items` depende de `commands`), siga a ordem: crie a fixture pai primeiro no mesmo bloco.

## Falhas comuns e como interpretar

| Mensagem | Causa provável |
|----------|----------------|
| `RLS FAIL [A-1 customers]: expected 1 rows, got 2` | Alguém adicionou um INSERT sem `deleted_at` filter ou há lixo de teste de rodada anterior (rode novamente — o bloco de setup deleta resíduos) |
| `RLS FAIL [A-6 cross-tenant INSERT]: inject into org B should have been blocked` | Policy `WITH CHECK` foi removida ou está permissiva demais |
| `RLS FAIL [E-memberships cross-INSERT]: cross-tenant should have been blocked` | Mesma coisa para memberships |
| `RLS FAIL [F-smoke-inverso]: tabelas com RLS DESABILITADO: <lista>` | Algum `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` escapou num refactor |
| `function auth.uid() does not exist` | Você rodou contra Postgres puro sem o shim. Reaplique o bootstrap acima. |

## CI — como o workflow decide aprovar ou rejeitar

O arquivo `.github/workflows/rls-tests.yml` sobe um Postgres 17 como service container, aplica as migrations em ordem, e roda a suíte. Qualquer `RAISE EXCEPTION` faz o step falhar e marca o check como vermelho na PR. Só merge no `main` com check verde.

O workflow ignora alterações em `docs/**` e `*.md` para não consumir runner à toa em PRs de documentação pura.
