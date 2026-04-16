-- =============================================================================
-- KEYRA — Migration 004: Auth Hook (JWT custom claim org_id)
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Install Supabase Auth custom access token hook that embeds
--          the active org_id into JWTs, enabling RLS via current_org_id().
-- Traceability: ADR-012 — JWT custom claim org_id.
--
-- Supabase wiring:
--   Dashboard → Authentication → Hooks → Custom Access Token →
--   public.custom_access_token_hook
--
--   OR via CLI (config.toml):
--     [auth.hook.custom_access_token]
--     enabled = true
--     uri = "pg-functions://postgres/public/custom_access_token_hook"
--
-- Behavior:
--   - If user has exactly 1 org membership: org_id is set to that org.
--   - If user has >1 orgs: org_id is set to the most recently used one,
--     falling back to the oldest membership if no preference recorded.
--   - If user has 0 orgs: org_id is NULL (RLS will deny everything).
--   - A row in user_preferences.active_org_id overrides the heuristic —
--     this is what Server Action `switchOrganization(orgId)` updates.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- user_preferences — stores the currently-active org for multi-org users.
-- Not tenant-scoped (it's per-auth.user across orgs).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_org_id   uuid NULL REFERENCES public.organizations(id) ON DELETE SET NULL,
  onboarding_done boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_preferences IS
  'KEYRA ADR-012: per-user active org selector (for multi-org users).';

CREATE TRIGGER user_preferences_set_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- custom_access_token_hook — Supabase Auth hook
-- Contract: receives jsonb {user_id, claims, authentication_method, ...}
--           returns  jsonb {claims: <merged>}
-- -----------------------------------------------------------------------------
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

  RETURN jsonb_build_object('claims', claims);
END;
$$;

COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS
  'KEYRA ADR-012: Supabase Auth hook injecting org_id custom claim into every JWT.';

-- Grant execute to the supabase_auth_admin role (Supabase requirement for hooks).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
    GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
    GRANT SELECT ON public.memberships         TO supabase_auth_admin;
    GRANT SELECT ON public.user_preferences    TO supabase_auth_admin;
  END IF;
END
$$;
