-- =============================================================================
-- KEYRA — Migration 010: Commands (Comandas / Ordens de Serviço)
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Command = Service Order generated when an appointment is done.
-- Traceability: FR-CO-01..05, FR-AG-06, NFR-PE-02, CON-KE-02.
--
-- Design notes:
--   - commands.appointment_id is UNIQUE (one comanda per appointment).
--   - command_items snapshots price, cost, commission — ADR-013 #7 (preserve history).
--   - totals (gross/discount/net) kept denormalized for fast dashboard reads.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.commands (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appointment_id  uuid NULL UNIQUE REFERENCES public.appointments(id) ON DELETE SET NULL, -- nullable: walk-in future
  customer_id     uuid NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  professional_id uuid NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  status          text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','finalized','paid','cancelled')),
  -- Money (denormalized totals; trigger maintained from command_items)
  subtotal        numeric(14,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total           numeric(14,2) GENERATED ALWAYS AS (subtotal - discount_amount) STORED,
  paid_amount     numeric(14,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  notes           text NULL,
  -- Lifecycle
  opened_at       timestamptz NOT NULL DEFAULT now(),
  finalized_at    timestamptz NULL,
  paid_at         timestamptz NULL,
  cancelled_at    timestamptz NULL,
  created_by      uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz NULL
);

COMMENT ON TABLE  public.commands IS
  'KEYRA FR-CO-01..05: comanda gerada ao marcar appointment=done. Status open → finalized → paid.';
COMMENT ON COLUMN public.commands.total IS
  'Generated = subtotal - discount_amount. Always consistent.';

CREATE INDEX IF NOT EXISTS commands_org_id_idx           ON public.commands (org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS commands_status_idx           ON public.commands (org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS commands_customer_idx         ON public.commands (customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS commands_professional_idx     ON public.commands (professional_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS commands_opened_at_idx        ON public.commands (org_id, opened_at DESC) WHERE deleted_at IS NULL;

CREATE TRIGGER commands_set_updated_at
  BEFORE UPDATE ON public.commands
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER commands_enforce_org_id
  BEFORE UPDATE OF org_id ON public.commands
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- command_items — line items snapshot (price/cost/commission at execution time)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.command_items (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  command_id         uuid NOT NULL REFERENCES public.commands(id) ON DELETE CASCADE,
  service_id         uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  professional_id    uuid NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  -- Snapshots (ADR-013 #7 — preserve history even if master data changes)
  description        text NOT NULL,
  quantity           numeric(14,3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price         numeric(14,2) NOT NULL CHECK (unit_price >= 0),
  unit_cost          numeric(14,2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  commission_rate    numeric(5,4)  NOT NULL DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 1),
  discount_amount    numeric(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total              numeric(14,2) GENERATED ALWAYS AS ((unit_price * quantity) - discount_amount) STORED,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.command_items IS
  'KEYRA FR-CO-02: line items with price/cost/commission SNAPSHOTTED — ADR-013 #7.';

CREATE INDEX IF NOT EXISTS command_items_org_id_idx     ON public.command_items (org_id);
CREATE INDEX IF NOT EXISTS command_items_command_idx    ON public.command_items (command_id);
CREATE INDEX IF NOT EXISTS command_items_service_idx    ON public.command_items (service_id);
CREATE INDEX IF NOT EXISTS command_items_professional_idx ON public.command_items (professional_id);

CREATE TRIGGER command_items_set_updated_at
  BEFORE UPDATE ON public.command_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER command_items_enforce_org_id
  BEFORE UPDATE OF org_id ON public.command_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- Trigger: recompute commands.subtotal when command_items change
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recompute_command_subtotal()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
DECLARE
  target_cmd uuid := COALESCE(NEW.command_id, OLD.command_id);
BEGIN
  UPDATE public.commands c
     SET subtotal = COALESCE((
           SELECT sum(ci.total)
             FROM public.command_items ci
            WHERE ci.command_id = c.id
         ), 0),
         updated_at = now()
   WHERE c.id = target_cmd;
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.recompute_command_subtotal() IS
  'KEYRA: maintains commands.subtotal as sum(command_items.total).';

CREATE TRIGGER trg_command_items_recompute
  AFTER INSERT OR UPDATE OR DELETE ON public.command_items
  FOR EACH ROW EXECUTE FUNCTION public.recompute_command_subtotal();
