-- =============================================================================
-- KEYRA — Migration 009: Appointments (Agenda)
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: The agenda entity — the origin of all revenue (Pilar 1, CON-KE-01).
-- Traceability: FR-AG-01..07, FR-AG-04 (receita prevista), FR-AG-05 (multi-prof),
--               FR-AG-06 (trigger → command on done), NFR-PE-02, CON-KE-02.
--
-- Design notes:
--   - FullCalendar integration: (title, start, end, resource_id, color, all_day)
--     are first-class columns so we map directly to FC resource timeline.
--   - Status enum: scheduled → done → (cancelled|no_show). cancelled/no_show
--     do NOT generate commands.
--   - EXCLUDE constraint prevents double-booking same professional on same
--     overlapping time window (uses btree_gist).
--   - price_snapshot: FR-AG-04 requires receita prevista based on service price
--     AT MOMENT of scheduling. Stored to preserve even if service.price changes.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id        uuid NULL REFERENCES public.customers(id) ON DELETE RESTRICT,  -- blocking walk-in allowed
  service_id         uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  professional_id    uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  -- FullCalendar-friendly schema
  title              text NULL,                         -- optional override; else built from service+customer
  starts_at          timestamptz NOT NULL,
  ends_at            timestamptz NOT NULL,
  all_day            boolean NOT NULL DEFAULT false,
  color              text NULL,
  -- Business fields
  status             text NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled','done','cancelled','no_show')),
  price_snapshot     numeric(14,2) NOT NULL CHECK (price_snapshot >= 0),  -- receita prevista (FR-AG-04)
  commission_snapshot numeric(5,4) NOT NULL DEFAULT 0 CHECK (commission_snapshot >= 0 AND commission_snapshot <= 1),
  notes              text NULL,
  -- Lifecycle timestamps
  confirmed_at       timestamptz NULL,                  -- FR-AG-08 future (WhatsApp confirmation)
  done_at            timestamptz NULL,
  cancelled_at       timestamptz NULL,
  cancel_reason      text NULL,
  created_by         uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz NULL,
  CONSTRAINT appointments_time_range_valid CHECK (ends_at > starts_at),
  -- Prevent double-booking same professional with overlapping time range
  CONSTRAINT appointments_no_double_book EXCLUDE USING gist (
    professional_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status IN ('scheduled','done') AND deleted_at IS NULL)
);

COMMENT ON TABLE  public.appointments IS
  'KEYRA FR-AG-*: agenda — origem do faturamento (CON-KE-01). Gera comanda ao marcar done.';
COMMENT ON COLUMN public.appointments.price_snapshot IS
  'FR-AG-04: receita prevista = service.price at time of scheduling. Immutable history.';
COMMENT ON COLUMN public.appointments.commission_snapshot IS
  'Commission rate snapshotted from service/professional at scheduling time.';
COMMENT ON COLUMN public.appointments.status IS
  'scheduled | done | cancelled | no_show. Only done triggers command creation.';

CREATE INDEX IF NOT EXISTS appointments_org_id_idx              ON public.appointments (org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_org_starts_idx          ON public.appointments (org_id, starts_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_professional_starts_idx ON public.appointments (professional_id, starts_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_customer_idx            ON public.appointments (customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_service_idx             ON public.appointments (service_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_status_idx              ON public.appointments (org_id, status, starts_at) WHERE deleted_at IS NULL;

CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER appointments_enforce_org_id
  BEFORE UPDATE OF org_id ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- v_receitas_previstas — ADR-013 #5: receita prevista é view (NOT table).
-- Sum of price_snapshot where status='scheduled' (not yet realized).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_receitas_previstas AS
SELECT a.org_id,
       date_trunc('day', a.starts_at)   AS day,
       date_trunc('month', a.starts_at) AS month,
       count(*)                         AS appointments_count,
       sum(a.price_snapshot)            AS expected_revenue
  FROM public.appointments a
 WHERE a.status = 'scheduled'
   AND a.deleted_at IS NULL
 GROUP BY a.org_id, date_trunc('day', a.starts_at), date_trunc('month', a.starts_at);

COMMENT ON VIEW public.v_receitas_previstas IS
  'KEYRA ADR-013 #5 / FR-AG-04: receita prevista by day/month. Re-evaluated on every read.';
