-- =============================================================================
-- KEYRA — Migration 019: Fix audit log for `organizations`
-- Story 0.4 (hotfix) — @aiox-master (Orion)
-- Date: 2026-04-16
--
-- Problem detected post-push: the universal audit trigger
-- `trg_audit_row_change` extracts `org_id` from row JSON. The `organizations`
-- table is the tenant root and has no `org_id` column (it uses `id`).
-- Result: NEW.org_id resolves to NULL → trigger early-returns without
-- writing to audit_log. Mutations on organizations escape the audit trail.
--
-- Fix: dedicated trigger function that uses `id` as the org_id for
-- audit_log entries when auditing the `organizations` table itself.
--
-- Traceability: ADR-018, CON-LG-06, NFR-SE-05.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.trg_audit_organizations_change()
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
    v_org_id := OLD.id;
    v_before := row_to_json(OLD)::jsonb;
    v_id     := OLD.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_org_id := NEW.id;
    v_before := row_to_json(OLD)::jsonb;
    v_after  := row_to_json(NEW)::jsonb;
    v_id     := NEW.id;
  ELSE -- INSERT
    v_org_id := NEW.id;
    v_after  := row_to_json(NEW)::jsonb;
    v_id     := NEW.id;
  END IF;

  INSERT INTO public.audit_log (org_id, user_id, action, resource_type, resource_id, before, after)
  VALUES (v_org_id, v_user, v_action, TG_TABLE_NAME, v_id, v_before, v_after);

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.trg_audit_organizations_change() IS
  'KEYRA hotfix migration 019: audit trigger especifico para organizations (usa id como org_id).';

-- Substituir o trigger universal para a tabela organizations
DROP TRIGGER IF EXISTS trg_audit_organizations ON public.organizations;
CREATE TRIGGER trg_audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.trg_audit_organizations_change();
