#!/usr/bin/env bash
# =============================================================================
# KEYRA — Spike comprovantes.1 / AC1 — RLS por org_id em storage.objects
#
# Prova OU refuta que o claim `org_id` do JWT chega ao contexto de avaliação de
# uma policy de `storage.objects` e filtra objetos por organização.
#
# Ambiente efêmero: postgres:17 + stubs fiéis do schema `storage`
# (buckets, objects, foldername) — NUNCA produção.
#
# Testa DUAS predicates candidatas e reporta veredito por cenário:
#   A) (storage.foldername(name))[1] = public.current_org_id()::text   ← padrão vivo
#   B) (storage.foldername(name))[1] = (auth.jwt() ->> 'org_id')        ← AC6 spec
#
# Uso: ./scripts/spike-storage-rls.sh
# =============================================================================
set -euo pipefail

# Detecta psql (macOS + brew tem libpq fora do PATH por default)
if ! command -v psql >/dev/null 2>&1; then
  for p in /opt/homebrew/opt/libpq/bin /usr/local/opt/libpq/bin; do
    if [ -x "$p/psql" ]; then export PATH="$p:$PATH"; break; fi
  done
fi

CONTAINER="keyra-storage-rls-spike"
PORT=54346
PASSWORD="postgres"

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

echo "==> Subindo Postgres 17 efêmero em :$PORT"
docker run -d --rm --name "$CONTAINER" \
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -p "$PORT":5432 \
  postgres:17 >/dev/null

export PGHOST=localhost PGPORT=$PORT PGUSER=postgres PGPASSWORD=$PASSWORD PGDATABASE=postgres

echo "==> Aguardando Postgres ficar saudável"
for _ in $(seq 1 30); do pg_isready -q 2>/dev/null && break; sleep 1; done

echo "==> Bootstrap: roles + auth stubs + storage stubs + current_org_id()"
psql -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role; END IF;
  END $$;

  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $fn$
    SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $fn$;
  CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $fn$
    SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb $fn$;

  -- Helper canônico — idêntico a 20260416000200_helper_functions.sql
  CREATE OR REPLACE FUNCTION public.current_org_id()
    RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $fn$
    SELECT NULLIF(
      COALESCE(
        current_setting('request.jwt.claim.org_id', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
      ), ''
    )::uuid; $fn$;

  -- Stubs fiéis do schema storage do Supabase ---------------------------------
  CREATE SCHEMA IF NOT EXISTS storage;
  CREATE TABLE storage.buckets (
    id text PRIMARY KEY, name text NOT NULL,
    public boolean NOT NULL DEFAULT false, created_at timestamptz DEFAULT now()
  );
  CREATE TABLE storage.objects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id text NOT NULL REFERENCES storage.buckets(id),
    name text NOT NULL,
    owner uuid NULL,
    created_at timestamptz DEFAULT now()
  );
  -- storage.foldername: split por '/', retorna o array de pastas (sem o arquivo)
  CREATE OR REPLACE FUNCTION storage.foldername(name text)
    RETURNS text[] LANGUAGE plpgsql IMMUTABLE AS $fn$
  DECLARE _parts text[];
  BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[1 : array_length(_parts, 1) - 1];
  END $fn$;

  GRANT USAGE ON SCHEMA auth, storage, public TO authenticated, service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
  GRANT SELECT ON storage.buckets TO authenticated;

  -- Bucket privado + 2 objetos (1 por org) — seed como postgres (bypassa RLS)
  INSERT INTO storage.buckets (id, name, public) VALUES ('receipts','receipts',false);
  INSERT INTO storage.objects (bucket_id, name) VALUES
    ('receipts', '11111111-1111-1111-1111-111111111111/r-a/original.jpg'),
    ('receipts', '22222222-2222-2222-2222-222222222222/r-b/original.jpg');

  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;
SQL

run_scenario () {
  local label="$1" predicate="$2"
  echo
  echo "==> Cenário $label — predicate: $predicate"
  psql -v ON_ERROR_STOP=1 <<SQL
  DROP POLICY IF EXISTS receipts_objects_rw ON storage.objects;
  CREATE POLICY receipts_objects_rw ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = $predicate)
    WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = $predicate);

  BEGIN;
  SET LOCAL client_min_messages TO WARNING;
  DO \$\$
  DECLARE v_count int;
  BEGIN
    PERFORM set_config('request.jwt.claim.sub',    '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claim.org_id', '11111111-1111-1111-1111-111111111111', true);
    PERFORM set_config('request.jwt.claims',
      jsonb_build_object('sub','11111111-1111-1111-1111-111111111111',
                         'role','authenticated',
                         'org_id','11111111-1111-1111-1111-111111111111')::text, true);
    SET LOCAL role TO authenticated;

    -- (1) org_a enxerga exatamente 1 objeto (o seu)
    SELECT count(*) INTO v_count FROM storage.objects WHERE bucket_id='receipts';
    IF v_count <> 1 THEN RAISE EXCEPTION 'VERMELHO [$label total]: esperado 1, got %', v_count; END IF;

    -- (2) org_a NÃO enxerga o objeto de org_b por lookup direto do name
    SELECT count(*) INTO v_count FROM storage.objects
      WHERE name LIKE '22222222-2222-2222-2222-222222222222/%';
    IF v_count <> 0 THEN RAISE EXCEPTION 'VERMELHO [$label cross-tenant]: org_a viu % objeto(s) de org_b', v_count; END IF;

    -- (3) org_a NÃO consegue inserir objeto no path de org_b (WITH CHECK)
    BEGIN
      INSERT INTO storage.objects (bucket_id, name)
        VALUES ('receipts','22222222-2222-2222-2222-222222222222/hack/x.jpg');
      RAISE EXCEPTION 'VERMELHO [$label cross-INSERT]: insert no path de org_b deveria ser bloqueado';
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN NULL;
    END;

    RAISE NOTICE 'VERDE [$label]: org_a vê 1 (o seu), 0 de org_b, cross-INSERT bloqueado';
    RESET ROLE;
  END \$\$;
  ROLLBACK;
SQL
}

run_scenario "A current_org_id" "public.current_org_id()::text"
run_scenario "B auth.jwt-inline" "(auth.jwt() ->> 'org_id')"

echo
echo "✓ SPIKE CONCLUÍDO — ambos os cenários acima sem EXCEPTION = VERDE"
