#!/usr/bin/env bash
# =============================================================================
# KEYRA — Atalho para rodar a suíte de testes RLS contra um Postgres descartável.
#
# Uso:
#   ./scripts/run-rls-tests.sh
#
# Requisitos:
#   - Docker rodando (Docker Desktop aberto no macOS)
#   - psql client (postgresql-client no apt / postgresql no brew)
#
# Mata/reinicia um container efêmero `keyra-rls-tests` em cada execução e
# rodou a suíte completa — mesmos passos que o workflow
# `.github/workflows/rls-tests.yml` executa em CI.
# =============================================================================

set -euo pipefail

# Detecta psql. macOS + brew tem o libpq em path não-padrão (não link por default).
if ! command -v psql >/dev/null 2>&1; then
  if [ -x /opt/homebrew/opt/libpq/bin/psql ]; then
    export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
  elif [ -x /usr/local/opt/libpq/bin/psql ]; then
    export PATH="/usr/local/opt/libpq/bin:$PATH"
  else
    echo "psql não encontrado. No macOS: brew install libpq && brew link --force libpq" >&2
    exit 1
  fi
fi

CONTAINER_NAME="keyra-rls-tests"
PORT=54345
DB="postgres"
PASSWORD="postgres"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Subindo Postgres 17 efêmero em :$PORT"
docker run -d --rm --name "$CONTAINER_NAME" \
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -p "$PORT":5432 \
  postgres:17 >/dev/null

export PGHOST=localhost
export PGPORT=$PORT
export PGUSER=postgres
export PGPASSWORD=$PASSWORD
export PGDATABASE=$DB

echo "==> Aguardando Postgres ficar saudável"
for _ in $(seq 1 30); do
  if pg_isready -q 2>/dev/null; then
    break
  fi
  sleep 1
done

echo "==> Bootstrap de roles, auth schema e stubs"
psql -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE SCHEMA IF NOT EXISTS extensions;

  -- Supabase host põe `extensions` no search_path por default; replicamos aqui
  -- para as migrations que usam gen_random_bytes(), gen_random_uuid(), etc.
  ALTER DATABASE postgres SET search_path = public, extensions, auth;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN CREATE ROLE supabase_auth_admin; END IF;
  END $$;

  CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY,
    email text,
    instance_id uuid,
    aud text,
    role text,
    email_confirmed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $fn$
    SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
  $fn$;

  CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $fn$
    SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb
  $fn$;

  GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;
  GRANT USAGE ON SCHEMA extensions TO authenticated, anon, service_role, public;
SQL

echo "==> Aplicando migrations em ordem"
for f in supabase/migrations/*.sql; do
  echo "    $(basename "$f")"
  psql -v ON_ERROR_STOP=1 -f "$f" >/dev/null
done

echo "==> Rodando suíte RLS"
psql -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.test.sql

echo
echo "✓ TODOS OS TESTES RLS PASSARAM"
