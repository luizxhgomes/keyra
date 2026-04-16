-- =============================================================================
-- KEYRA — Migration 005: Professionals
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Professionals that perform services (may or may not be a system user).
-- Traceability: FR-AG-05 (multi-professional agenda), FR-MT-02 (role-aware),
--               FR-FI-04 (receitas by profissional), FR-DR-03 (DRE por profissional).
--
-- Design notes:
--   - Every professional belongs to exactly one org (org_id FK).
--   - Optional user_id: links to an auth user when the professional logs in.
--     Can be NULL for receptionist-managed profiles (e.g., "Dra. Ana" exists
--     in catalog but she doesn't use the app).
--   - default_commission_rate is *snapshotted* into command_items — see ADR-013 #7.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.professionals (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                   uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id                  uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,  -- optional login
  display_name             text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 120),
  specialty                text NULL,
  color                    text NULL,          -- agenda color (hex)
  phone                    text NULL,
  email                    citext NULL,
  default_commission_rate  numeric(5,4) NOT NULL DEFAULT 0 CHECK (default_commission_rate >= 0 AND default_commission_rate <= 1),
  active                   boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz NULL,
  UNIQUE (org_id, user_id)  -- one professional profile per (org, user)
);

COMMENT ON TABLE public.professionals IS
  'KEYRA FR-AG-05: professionals that perform services inside an org. user_id is optional.';
COMMENT ON COLUMN public.professionals.default_commission_rate IS
  'Default commission rate (0-1). Snapshotted into command_items.commission_rate at execution time.';

CREATE INDEX IF NOT EXISTS professionals_org_id_idx   ON public.professionals (org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS professionals_user_id_idx  ON public.professionals (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS professionals_active_idx   ON public.professionals (org_id, active) WHERE deleted_at IS NULL;

CREATE TRIGGER professionals_set_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER professionals_enforce_org_id
  BEFORE UPDATE OF org_id ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();
