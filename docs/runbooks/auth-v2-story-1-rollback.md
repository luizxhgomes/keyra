# Runbook — Rollback da Story `auth.1`

**Migration:** `20260503000100_auth_v2_profiles_consent_legal_docs.sql`
**Cenário de uso:** quebra grave detectada após apply em produção (ex.: login falhando, JWT sem org_id, app caindo).

## Pré-condição

Confirmar via Sentry/Vercel que o problema veio do apply desta migration e não de outra causa concorrente.

## Steps de rollback (ordem importa)

```sql
-- 1. Restaurar versão pré-mudança da custom_access_token_hook
-- (cópia em supabase/migrations/20260416000400_auth_setup.sql:50-86)
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  claims       jsonb := COALESCE(event->'claims', '{}'::jsonb);
  target_user  uuid  := (event->>'user_id')::uuid;
  resolved_org uuid;
BEGIN
  SELECT up.active_org_id INTO resolved_org
    FROM public.user_preferences up
   WHERE up.user_id = target_user
     AND up.active_org_id IS NOT NULL;

  IF resolved_org IS NULL THEN
    SELECT m.org_id INTO resolved_org
      FROM public.memberships m
     WHERE m.user_id = target_user
       AND m.deleted_at IS NULL
     ORDER BY m.created_at ASC
     LIMIT 1;
  END IF;

  IF resolved_org IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}', to_jsonb(resolved_org::text), true);
  END IF;

  RETURN jsonb_build_object('claims', claims);
END;
$$;

-- 2. Desregistrar before_user_created hook (via Management API):
-- curl -X PATCH -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json' \
--   --data '{"hook_before_user_created_enabled": false}' \
--   https://api.supabase.com/v1/projects/${REF}/config/auth

-- 3. Drop trigger e funções novas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.before_user_created_block_disposable_emails(jsonb) CASCADE;

-- 4. Drop tabelas novas (CASCADE remove FK + policies + view)
DROP TABLE IF EXISTS public.user_consent_records CASCADE;
DROP VIEW IF EXISTS public.legal_documents_current;
DROP TABLE IF EXISTS public.legal_documents CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 5. Drop UNIQUE INDEX parcial em organizations
DROP INDEX IF EXISTS public.organizations_cnpj_unique;

-- 6. Limpar registro da migration
DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260503000100';
```

## Validação pós-rollback

```sql
-- Confirmar que custom_access_token_hook voltou ao comportamento original
SELECT pg_get_functiondef('public.custom_access_token_hook'::regproc);
-- Deve NÃO mencionar "full_name" ou "v_full_name"

-- Confirmar que tabelas não existem mais
SELECT table_name FROM information_schema.tables
 WHERE table_schema = 'public'
   AND table_name IN ('profiles','user_consent_records','legal_documents');
-- Deve retornar zero rows

-- Confirmar que UNIQUE INDEX cnpj sumiu
SELECT indexname FROM pg_indexes WHERE indexname = 'organizations_cnpj_unique';
-- Deve retornar zero rows
```

## Próximo passo após rollback

1. Investigar causa raiz via Sentry / Vercel logs
2. Atualizar story `auth.1` com Change Log entry documentando o rollback
3. Reabrir branch `feat/auth-v2-story-1` partindo de main pós-rollback
4. Corrigir migration e re-aplicar com cautela (talvez aplicar primeiro em projeto Supabase staging se criarmos um)
