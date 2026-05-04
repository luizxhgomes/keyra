-- =============================================================================
-- KEYRA — Migration 027 (parte 2 de 2): Auth Hook update — full_name claim
--
-- Story auth.1 do EPIC-AUTH-V2.
-- Auditoria preventiva: docs/audit/auth-v2-security-audit.md (R6).
-- ADR-022: docs/architecture/ARCHITECTURE.md §11.2.
--
-- DEVOPS REVIEW (2026-05-03): split desta operação da migration 026 (parte 1)
-- para isolar a alteração da função crítica `custom_access_token_hook` em
-- migration própria. Isto permite janela de validação intermediária ANTES
-- de tocar a função que roda em CADA emissão de JWT.
--
-- Rollback de emergência <30s via psql direto (NÃO via supabase db push):
-- restaurar definição da migration 20260416000400_auth_setup.sql:50-86.
-- Snapshot do source pré-apply em .keyra-secrets/auth-hook-snapshot-pre-027.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- custom_access_token_hook — versão estendida com full_name claim
-- -----------------------------------------------------------------------------
-- Adiciona claim full_name lendo de public.profiles. NÃO inclui phone (PII em
-- JWT vaza em logs/Sentry — D5 da auditoria).
--
-- Backward-compatible: usuários antigos sem profile (ou com full_name NULL)
-- continuam logando, só não recebem o claim full_name.
--
-- DEFENSIVA: bloco EXCEPTION WHEN OTHERS THEN RETURN event final garante que
-- qualquer erro inesperado (DB lock, timeout, schema drift) NÃO bloqueia
-- emissão de JWT — o usuário continua conseguindo logar mesmo se o hook
-- falhar internamente. Recomendação direta do DevOps review.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  claims        jsonb := COALESCE(event->'claims', '{}'::jsonb);
  target_user   uuid  := (event->>'user_id')::uuid;
  resolved_org  uuid;
  v_full_name   text;
BEGIN
  -- Pick preferred active org if any
  SELECT up.active_org_id INTO resolved_org
    FROM public.user_preferences up
   WHERE up.user_id = target_user
     AND up.active_org_id IS NOT NULL;

  -- Fallback: oldest active membership
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

  -- Story auth.1 (R6, D5): full_name em claim para reconhecimento sem query
  -- extra. Phone NÃO incluído (vaza PII em logs).
  SELECT p.full_name INTO v_full_name
    FROM public.profiles p
   WHERE p.id = target_user;

  IF v_full_name IS NOT NULL THEN
    claims := jsonb_set(claims, '{full_name}', to_jsonb(v_full_name), true);
  END IF;

  RETURN jsonb_build_object('claims', claims);

EXCEPTION
  WHEN OTHERS THEN
    -- DEVOPS RECOMMENDATION (2026-05-03): se a hook falhar internamente, NUNCA
    -- bloquear emissão de JWT. Devolver event original — usuário entra mesmo
    -- sem claims customizados (RLS vai negar queries até que sessão refresque).
    -- Trade-off aceito: janela transitória de "logado mas sem org_id" é
    -- preferível a "não consegue logar de jeito nenhum".
    RETURN event;
END;
$$;

COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS
  'KEYRA ADR-012 + Story auth.1: Supabase Auth hook injetando org_id e full_name custom claims em todo JWT. Phone NÃO incluído por design (D5 — PII em headers vaza em logs). EXCEPTION WHEN OTHERS retorna event original como fallback defensivo (DevOps review 2026-05-03).';

-- GRANT EXECUTE preservado pelo CREATE OR REPLACE, mas re-aplicamos por garantia.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
  END IF;
END
$$;

-- =============================================================================
-- Fim da migration 027.
-- AC6 do Story auth.1 atendido.
--
-- VALIDAÇÃO PÓS-APPLY (DevOps recommendation):
--   1. Decode manual de um JWT recém-emitido — `org_id` presente
--      (e `full_name` presente para users com profile populado)
--   2. SELECT count(*) FROM auth.audit_log_entries WHERE created_at > now() -
--      interval '5 min' AND payload->>'error' IS NOT NULL -> esperar zero
--   3. Smoke E2E: login com magic link em conta de teste, query autenticada
--      RLS-protegida retorna linhas (não vazio)
-- =============================================================================
