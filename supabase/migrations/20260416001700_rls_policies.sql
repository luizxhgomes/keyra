-- =============================================================================
-- KEYRA — Migration 017: Row Level Security (RLS) Policies
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Enable RLS and define tenant-isolation policies for ALL tables.
-- Traceability: ADR-011, ADR-012; FR-MT-03; NFR-MT-01, NFR-MT-02.
--
-- Model:
--   - Every tenant-scoped table has a policy USING (org_id = current_org_id())
--     WITH CHECK (org_id = current_org_id()) for ALL commands.
--   - organizations table: users see only orgs they are members of.
--   - memberships / user_preferences: user sees their own rows.
--   - audit_log: read-only for authenticated users in same org; no direct writes
--     (triggers write it).
--   - supabase_auth_admin role is granted SELECT on memberships/user_preferences
--     in migration 004 (needed for JWT hook) — RLS does not apply to it when
--     bypassed via SECURITY DEFINER of the hook function.
--
-- Policy style: one catch-all policy named `<table>_tenant_isolation` (KISS)
--               covering SELECT/INSERT/UPDATE/DELETE for the role `authenticated`.
--               Service role bypasses RLS entirely (Supabase default).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- organizations: user sees orgs where they are a member.
-- -----------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS organizations_select ON public.organizations;
DROP POLICY IF EXISTS organizations_insert ON public.organizations;
DROP POLICY IF EXISTS organizations_update ON public.organizations;
DROP POLICY IF EXISTS organizations_delete ON public.organizations;

-- SELECT: members can see their orgs
CREATE POLICY organizations_select ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(id, 'viewer'));

-- INSERT: any authenticated user can create an org (they become owner via app code)
CREATE POLICY organizations_insert ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: only owners/admins of that org
CREATE POLICY organizations_update ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.is_org_member(id, 'admin'))
  WITH CHECK (public.is_org_member(id, 'admin'));

-- DELETE: owner only
CREATE POLICY organizations_delete ON public.organizations
  FOR DELETE TO authenticated
  USING (public.is_org_member(id, 'owner'));

-- -----------------------------------------------------------------------------
-- memberships: user can see rows for themselves OR for orgs they admin.
-- NOTE: no FORCE because `is_org_member()` (SECURITY DEFINER) reads this table
-- and must work from other RLS policies. The `postgres` owner bypass is safe —
-- only service_role and the DEFINER functions can reach it.
-- -----------------------------------------------------------------------------
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS memberships_select ON public.memberships;
DROP POLICY IF EXISTS memberships_write  ON public.memberships;

CREATE POLICY memberships_select ON public.memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_org_member(org_id, 'admin'));

-- INSERT/UPDATE/DELETE: owners/admins of the org only
CREATE POLICY memberships_write ON public.memberships
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id, 'admin'))
  WITH CHECK (public.is_org_member(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- organization_invites: admins/owners of the org manage invites.
-- -----------------------------------------------------------------------------
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS organization_invites_all ON public.organization_invites;

CREATE POLICY organization_invites_all ON public.organization_invites
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id, 'admin'))
  WITH CHECK (public.is_org_member(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- user_preferences: user manages only their own row.
-- NOTE: no FORCE because the Supabase Auth hook (SECURITY DEFINER) reads it.
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_preferences_own ON public.user_preferences;

CREATE POLICY user_preferences_own ON public.user_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Generic tenant-isolation policies for all other tables
-- org_id = current_org_id() (from JWT claim, ADR-012)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    'professionals','customers',
    'service_categories','services','supplies','service_supplies',
    'appointments','commands','command_items',
    'accounts','expense_categories','payment_methods','goals',
    'transactions','payments','inventory_movements'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t);

    EXECUTE format('DROP POLICY IF EXISTS %I_tenant_isolation ON public.%I;', t, t);
    EXECUTE format(
      'CREATE POLICY %I_tenant_isolation ON public.%I '
      'FOR ALL TO authenticated '
      'USING (org_id = public.current_org_id()) '
      'WITH CHECK (org_id = public.current_org_id());',
      t, t
    );
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- audit_log: read-only for same-org authenticated users.
-- INSERT allowed only from the SECURITY DEFINER trigger function — which runs
-- as postgres (the owner). We intentionally do NOT force RLS on audit_log so
-- that the trigger can write while authenticated users still only SEE their
-- org's rows (enforced by the SELECT policy + default deny for others).
-- -----------------------------------------------------------------------------
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
-- NOTE: no FORCE here — postgres owner (SECURITY DEFINER of audit trigger) must bypass.

DROP POLICY IF EXISTS audit_log_select ON public.audit_log;

CREATE POLICY audit_log_select ON public.audit_log
  FOR SELECT TO authenticated
  USING (org_id = public.current_org_id());

-- No INSERT/UPDATE/DELETE policy for authenticated: default deny.
-- The universal audit trigger is SECURITY DEFINER owned by postgres → bypasses RLS.

-- -----------------------------------------------------------------------------
-- Grants — authenticated role needs basic table grants; RLS filters rows.
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Defaults for future tables created in this schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Anon role: no access to tenant data. Only needed for public marketing endpoints
-- (which we don't have in MVP). We revoke default grants explicitly.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
