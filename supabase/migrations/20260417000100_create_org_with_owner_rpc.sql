-- =============================================================================
-- KEYRA — Migration 020: create_organization_with_owner RPC
-- Date: 2026-04-17
--
-- Purpose: Atomic creation of organization + owner membership + user_preferences
-- in a single call, bypassing the chicken-and-egg RLS problem where
-- INSERT...RETURNING on organizations requires SELECT visibility, but the
-- inserting user has no membership yet.
--
-- Security: SECURITY DEFINER runs with owner privileges, bypassing RLS. We
-- authorize by calling auth.uid() inside the function body — only the caller's
-- own auth.uid() can be associated with the new org. The function can only
-- create ONE membership (role=owner) for the current user, preventing abuse.
--
-- Traceability: Story 1.2 bugfix; ADR-011 (RLS multi-tenant).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  p_name  text,
  p_cnpj  text DEFAULT NULL
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_new_org_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_name IS NULL OR char_length(btrim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Organization name is required' USING ERRCODE = '22023';
  END IF;

  -- 1) Create the organization
  INSERT INTO public.organizations (name, cnpj, created_by)
    VALUES (btrim(p_name), NULLIF(btrim(p_cnpj), ''), v_uid)
    RETURNING id INTO v_new_org_id;

  -- 2) Create the owner membership
  INSERT INTO public.memberships (user_id, org_id, role, accepted_at)
    VALUES (v_uid, v_new_org_id, 'owner', now());

  -- 3) Upsert user_preferences to set this as active org + mark onboarding done
  INSERT INTO public.user_preferences (user_id, active_org_id, onboarding_done)
    VALUES (v_uid, v_new_org_id, true)
  ON CONFLICT (user_id) DO UPDATE
    SET active_org_id   = EXCLUDED.active_org_id,
        onboarding_done = true,
        updated_at      = now();

  RETURN v_new_org_id;
END;
$$;

COMMENT ON FUNCTION public.create_organization_with_owner(text, text) IS
  'KEYRA Story 1.2: atomic org + owner-membership + user_preferences creation bypassing RLS chicken-and-egg.';

-- Grant execute to authenticated role (called via supabase.rpc() from the client).
GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(text, text) TO authenticated;
