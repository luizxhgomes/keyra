-- =============================================================================
-- KEYRA — Migration 021: current_org_id() with user_preferences fallback
-- Date: 2026-04-17
--
-- Purpose: Harden RLS so newly-onboarded users don't hit a "zero rows" dashboard
-- during the window between first membership creation and next JWT refresh.
--
-- Problem: The previous version of current_org_id() read the JWT claim only.
-- If a user had just created their first organization via RPC, the current
-- access token (issued BEFORE the membership existed) had no org_id claim.
-- Until the token refreshed, RLS-filtered SELECTs on tenant-scoped tables
-- returned zero rows — even though the user IS an active member.
--
-- Fix: add a safe, authenticated fallback that reads user_preferences.active_org_id
-- ONLY IF there is a matching active membership. This keeps the authorization
-- model tight (a user cannot impersonate a tenant they have no membership in)
-- while closing the "new user sees empty dashboard" gap.
--
-- Precedence order inside current_org_id():
--   1. JWT custom claim `org_id`  (fastest; primary path; honors org switcher)
--   2. user_preferences.active_org_id, validated against memberships (fallback)
--
-- Security: SECURITY DEFINER is preserved. The JOIN with memberships where
-- `user_id = auth.uid()` guarantees the function can only return an org the
-- caller is actually a member of.
--
-- Traceability: Story 1.2 hardening; ADR-011 (RLS), ADR-012 (JWT custom claim).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.current_org_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    -- 1. Primary: JWT custom claim injected by public.custom_access_token_hook.
    NULLIF(
      COALESCE(
        current_setting('request.jwt.claim.org_id', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
      ),
      ''
    )::uuid,
    -- 2. Fallback: user_preferences.active_org_id, validated through memberships.
    --    Only returns a value if the caller is an active member of that org.
    (
      SELECT up.active_org_id
        FROM public.user_preferences up
        JOIN public.memberships m
          ON m.user_id = up.user_id
         AND m.org_id  = up.active_org_id
         AND m.deleted_at IS NULL
       WHERE up.user_id = auth.uid()
       LIMIT 1
    )
  );
$$;

COMMENT ON FUNCTION public.current_org_id() IS
  'KEYRA ADR-012: resolves active org for RLS. Precedence: JWT claim > user_preferences (validated against memberships). Fail-closed (returns NULL -> RLS denies).';
