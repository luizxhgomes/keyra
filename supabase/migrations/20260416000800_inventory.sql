-- =============================================================================
-- KEYRA — Migration 008: Inventory (Supplies, Service-Supply links, Movements)
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Insumos per service + automatic stock movements.
-- Traceability: FR-SV-03, FR-ES-01, FR-ES-02, FR-ES-03 (future), FR-ES-04 (future).
--
-- Design notes:
--   - supplies holds insumos (and optionally generic products) with stock.
--   - service_supplies is M:N with quantity consumed per service unit.
--   - inventory_movements is an append-only ledger (entry +, exit -) used to
--     compute current stock. We *do* store `current_stock_cache` on supplies
--     for cheap reads; trigger keeps it consistent.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- supplies — insumos & produtos de estoque
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplies (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name                 text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  unit                 text NOT NULL DEFAULT 'un' CHECK (char_length(unit) BETWEEN 1 AND 20),
  unit_cost            numeric(14,2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  current_stock        numeric(14,3) NOT NULL DEFAULT 0,       -- kept in sync by inventory trigger
  reorder_level        numeric(14,3) NULL CHECK (reorder_level IS NULL OR reorder_level >= 0),
  supplier_name        text NULL,
  active               boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz NULL
);

COMMENT ON TABLE  public.supplies IS
  'KEYRA FR-ES-01: insumos/produtos de estoque. current_stock is a cache — source of truth is inventory_movements.';
COMMENT ON COLUMN public.supplies.current_stock IS
  'Cached running total of inventory_movements.quantity for this supply. Maintained by trigger.';
COMMENT ON COLUMN public.supplies.unit_cost IS
  'Default unit cost (may be used for variable cost in pricing engine, Phase 5).';

CREATE INDEX IF NOT EXISTS supplies_org_id_idx       ON public.supplies (org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS supplies_active_idx       ON public.supplies (org_id, active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS supplies_name_trgm_idx    ON public.supplies USING gin (name extensions.gin_trgm_ops);
-- FR-ES-03: alerts fire when current_stock <= reorder_level
CREATE INDEX IF NOT EXISTS supplies_reorder_idx      ON public.supplies (org_id)
  WHERE deleted_at IS NULL AND reorder_level IS NOT NULL AND current_stock <= reorder_level;

CREATE TRIGGER supplies_set_updated_at
  BEFORE UPDATE ON public.supplies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER supplies_enforce_org_id
  BEFORE UPDATE OF org_id ON public.supplies
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- service_supplies — M:N link with quantity (how much of each insumo per service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_supplies (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_id     uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  supply_id      uuid NOT NULL REFERENCES public.supplies(id) ON DELETE RESTRICT,
  quantity       numeric(14,3) NOT NULL CHECK (quantity > 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, supply_id)
);

COMMENT ON TABLE public.service_supplies IS
  'KEYRA FR-SV-03: M:N services × supplies with quantity consumed per service unit.';

CREATE INDEX IF NOT EXISTS service_supplies_org_id_idx     ON public.service_supplies (org_id);
CREATE INDEX IF NOT EXISTS service_supplies_service_idx    ON public.service_supplies (service_id);
CREATE INDEX IF NOT EXISTS service_supplies_supply_idx     ON public.service_supplies (supply_id);

CREATE TRIGGER service_supplies_set_updated_at
  BEFORE UPDATE ON public.service_supplies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER service_supplies_enforce_org_id
  BEFORE UPDATE OF org_id ON public.service_supplies
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- inventory_movements — append-only ledger (source of truth for stock)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  supply_id        uuid NOT NULL REFERENCES public.supplies(id) ON DELETE RESTRICT,
  movement_type    text NOT NULL CHECK (movement_type IN ('entry','exit','adjustment','service_consumption','loss')),
  quantity         numeric(14,3) NOT NULL CHECK (quantity <> 0),  -- positive or negative (use sign)
  unit_cost_at_move numeric(14,2) NULL CHECK (unit_cost_at_move IS NULL OR unit_cost_at_move >= 0),
  source_type      text NULL CHECK (source_type IS NULL OR source_type IN ('command','manual','import')),
  source_id        uuid NULL,                       -- e.g., commands.id or manual entry id
  notes            text NULL,
  created_by       uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.inventory_movements IS
  'KEYRA FR-ES-02: append-only ledger. quantity sign: entry/adjustment(+) > 0, exit/consumption(-) < 0.';
COMMENT ON COLUMN public.inventory_movements.movement_type IS
  'entry | exit | adjustment | service_consumption (auto from command) | loss';

CREATE INDEX IF NOT EXISTS inventory_movements_org_id_created_idx ON public.inventory_movements (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS inventory_movements_supply_idx         ON public.inventory_movements (supply_id, created_at DESC);
CREATE INDEX IF NOT EXISTS inventory_movements_source_idx         ON public.inventory_movements (source_type, source_id) WHERE source_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Trigger: keep supplies.current_stock in sync with inventory_movements
-- (inserts only — this is an append-only ledger).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.supplies_apply_movement()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.supplies
     SET current_stock = current_stock + NEW.quantity,
         updated_at    = now()
   WHERE id = NEW.supply_id
     AND org_id = NEW.org_id;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.supplies_apply_movement() IS
  'KEYRA: keeps supplies.current_stock in sync with append-only inventory_movements.';

CREATE TRIGGER trg_inventory_movements_apply
  AFTER INSERT ON public.inventory_movements
  FOR EACH ROW EXECUTE FUNCTION public.supplies_apply_movement();

-- Block UPDATE/DELETE on inventory_movements — ledger is append-only.
CREATE OR REPLACE FUNCTION public.inventory_movements_block_mutations()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'inventory_movements is append-only (attempted % on id %)', TG_OP, COALESCE(OLD.id, NEW.id)
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER trg_inventory_movements_no_update
  BEFORE UPDATE OR DELETE ON public.inventory_movements
  FOR EACH ROW EXECUTE FUNCTION public.inventory_movements_block_mutations();
