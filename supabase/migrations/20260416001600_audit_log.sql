-- =============================================================================
-- KEYRA — Migration 016: Audit Log (LGPD + Security)
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Universal audit trail for LGPD compliance.
-- Traceability: ADR-018 (audit log desde dia 1), CON-LG-06, NFR-SE-05.
--
-- Design notes:
--   - Audit log is itself tenant-scoped by org_id.
--   - Log triggers attach to every tenant-scoped table (applied below).
--   - Append-only: UPDATE/DELETE blocked.
--   - For Phase 5, add pg_partman monthly partitioning (ADR-018 retention 5yr).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id            bigserial PRIMARY KEY,
  org_id        uuid NOT NULL,
  user_id       uuid NULL,                          -- NULL for system actions / triggers
  action        text NOT NULL CHECK (action IN ('insert','update','delete','login','logout','export','access')),
  resource_type text NOT NULL,
  resource_id   uuid NULL,
  before        jsonb NULL,
  after         jsonb NULL,
  ip_address    inet NULL,
  user_agent    text NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_log IS
  'KEYRA ADR-018 / LGPD Art. 37: append-only audit trail of all mutations and critical events.';

CREATE INDEX IF NOT EXISTS audit_log_org_created_idx   ON public.audit_log (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_resource_idx      ON public.audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS audit_log_user_idx          ON public.audit_log (user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- Block UPDATE/DELETE — audit log is append-only.
CREATE OR REPLACE FUNCTION public.audit_log_block_mutations()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only (attempted % on id %)', TG_OP, COALESCE(OLD.id, NEW.id)
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER trg_audit_log_no_update
  BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_block_mutations();

-- -----------------------------------------------------------------------------
-- Universal audit trigger — attaches to tenant-scoped tables.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_audit_row_change()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_org_id uuid;
  v_user   uuid := auth.uid();
  v_action text := lower(TG_OP);
  v_before jsonb;
  v_after  jsonb;
  v_id     uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_org_id := (row_to_json(OLD)::jsonb)->>'org_id';
    v_before := row_to_json(OLD)::jsonb;
    v_id     := (v_before->>'id')::uuid;
  ELSIF TG_OP = 'UPDATE' THEN
    v_org_id := (row_to_json(NEW)::jsonb)->>'org_id';
    v_before := row_to_json(OLD)::jsonb;
    v_after  := row_to_json(NEW)::jsonb;
    v_id     := (v_after->>'id')::uuid;
  ELSE -- INSERT
    v_org_id := (row_to_json(NEW)::jsonb)->>'org_id';
    v_after  := row_to_json(NEW)::jsonb;
    v_id     := (v_after->>'id')::uuid;
  END IF;

  -- Defensive: skip if org_id unresolved (should never happen on tenant tables)
  IF v_org_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.audit_log (org_id, user_id, action, resource_type, resource_id, before, after)
  VALUES (v_org_id, v_user, v_action, TG_TABLE_NAME, v_id, v_before, v_after);

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.trg_audit_row_change() IS
  'KEYRA ADR-018: universal AFTER trigger that records row changes to audit_log.';

-- Attach audit trigger to every tenant-scoped table -------------------------
DO $$
DECLARE
  r text;
  tables text[] := ARRAY[
    'organizations','memberships','organization_invites',
    'professionals','customers',
    'service_categories','services','supplies','service_supplies',
    'appointments','commands','command_items',
    'accounts','expense_categories','payment_methods','goals',
    'transactions','payments'
  ];
BEGIN
  FOREACH r IN ARRAY tables LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_audit_%I ON public.%I;', r, r
    );
    EXECUTE format(
      'CREATE TRIGGER trg_audit_%I '
      'AFTER INSERT OR UPDATE OR DELETE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.trg_audit_row_change();',
      r, r
    );
  END LOOP;
END $$;
