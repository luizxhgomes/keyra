-- =============================================================================
-- KEYRA — Migration 022: accept_organization_invite RPC
-- Date: 2026-04-20
--
-- Purpose: Atomic consumption of an organization invite.
--   Validates (token exists, not expired, not yet accepted, email matches the
--   caller's JWT), creates the membership, marks the invite accepted and
--   activates the new org in user_preferences.
--
-- Security:
--   - SECURITY DEFINER because we need to write into memberships without the
--     caller being a member yet (same chicken-and-egg as create_organization_with_owner).
--   - We authorize strictly inside the function body:
--       1) caller must be authenticated (auth.uid() not null)
--       2) caller's email (from JWT) must match invite.email
--       3) invite must be pending (accepted_at IS NULL) and non-expired
--   - No caller input besides the opaque token — no org_id or email provided
--     by the client, eliminating forged parameter attacks.
--
-- Idempotency:
--   - If the same token is replayed, we re-compute and short-circuit:
--     returns the org_id WITHOUT changing state if already accepted by the
--     same user. Raises a clear exception if accepted by someone else.
--
-- Traceability: Story 1.3; ADR-011 (RLS multi-tenant); ADR-021 (emails).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.accept_organization_invite(
  p_token text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid       uuid := auth.uid();
  v_email     text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_invite    public.organization_invites%ROWTYPE;
  v_membership_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_token IS NULL OR char_length(btrim(p_token)) = 0 THEN
    RAISE EXCEPTION 'Invite token is required' USING ERRCODE = '22023';
  END IF;

  -- Lock the invite row to avoid races with revoke / double-accept.
  SELECT *
    INTO v_invite
    FROM public.organization_invites
   WHERE token = p_token
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado ou já revogado' USING ERRCODE = 'P0002';
  END IF;

  -- Idempotency: same user replaying an accepted invite.
  IF v_invite.accepted_at IS NOT NULL THEN
    IF v_invite.accepted_by = v_uid THEN
      RETURN v_invite.org_id;
    ELSE
      RAISE EXCEPTION 'Convite já aceito por outro usuário' USING ERRCODE = '23505';
    END IF;
  END IF;

  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Convite expirado' USING ERRCODE = '22023';
  END IF;

  IF lower(v_invite.email::text) <> v_email THEN
    RAISE EXCEPTION 'Convite enviado para outro email' USING ERRCODE = '42501';
  END IF;

  -- Create or reactivate the membership (handle soft-delete case).
  INSERT INTO public.memberships (user_id, org_id, role, invited_by, invited_at, accepted_at)
    VALUES (v_uid, v_invite.org_id, v_invite.role, v_invite.invited_by, v_invite.created_at, now())
  ON CONFLICT (user_id, org_id) DO UPDATE
    SET role        = EXCLUDED.role,
        deleted_at  = NULL,
        invited_by  = EXCLUDED.invited_by,
        invited_at  = EXCLUDED.invited_at,
        accepted_at = now(),
        updated_at  = now()
  RETURNING id INTO v_membership_id;

  -- Mark the invite consumed.
  UPDATE public.organization_invites
     SET accepted_at = now(),
         accepted_by = v_uid,
         updated_at  = now()
   WHERE id = v_invite.id;

  -- Activate the new org for the user (keeps onboarding_done = true if set).
  INSERT INTO public.user_preferences (user_id, active_org_id, onboarding_done)
    VALUES (v_uid, v_invite.org_id, true)
  ON CONFLICT (user_id) DO UPDATE
    SET active_org_id   = EXCLUDED.active_org_id,
        onboarding_done = true,
        updated_at      = now();

  RETURN v_invite.org_id;
END;
$$;

COMMENT ON FUNCTION public.accept_organization_invite(text) IS
  'KEYRA Story 1.3: atomic invite consumption (validate → create membership → mark accepted → switch active org).';

GRANT EXECUTE ON FUNCTION public.accept_organization_invite(text) TO authenticated;

-- -----------------------------------------------------------------------------
-- Helpers for role management (Story 1.3)
-- -----------------------------------------------------------------------------

-- Count active owners of an org (used to prevent demoting the last owner).
CREATE OR REPLACE FUNCTION public.count_org_owners(p_org_id uuid)
  RETURNS integer
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT count(*)::int
    FROM public.memberships
   WHERE org_id = p_org_id
     AND role = 'owner'
     AND deleted_at IS NULL;
$$;

COMMENT ON FUNCTION public.count_org_owners(uuid) IS
  'KEYRA Story 1.3: counts active owners of an org. Use to prevent demoting the last owner.';

GRANT EXECUTE ON FUNCTION public.count_org_owners(uuid) TO authenticated;
