-- =============================================================================
-- KEYRA — Migration 007: Services (Catalog) and Categories
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Monetizable catalog items (services, products, protocols, packages).
-- Traceability: FR-SV-01 (types), FR-SV-02 (name/price/cost/duration/category),
--               FR-SV-03 (service_supplies → migration 008), FR-SV-04 (profit),
--               FR-SV-05/06 (packages — Phase 5 flags).
--
-- Design notes:
--   - `price`, `unit_cost` use numeric(14,2) per P4 / NFR-FI-02. Avoid int-cents:
--     Postgres numeric gives exact precision and readable reports, while the
--     app layer uses Decimal.js (ADR-005). "bigint cents" is an anti-pattern for
--     tax reporting where % calculations produce fractional cents.
--   - service_category is an FK for structured reporting (DRE by category).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- service_categories — per-org taxonomy (e.g., "Limpeza de pele","Botox")
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name       text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  color      text NULL,              -- hex color for agenda/dashboard
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE (org_id, name)
);

COMMENT ON TABLE public.service_categories IS
  'KEYRA FR-SV-02: per-org service taxonomy. Feeds DRE by category (FR-DR-02).';

CREATE INDEX IF NOT EXISTS service_categories_org_id_idx
  ON public.service_categories (org_id) WHERE deleted_at IS NULL;

CREATE TRIGGER service_categories_set_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER service_categories_enforce_org_id
  BEFORE UPDATE OF org_id ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- services — the catalog item (service, product, protocol, package, combo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id      uuid NULL REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name             text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  type             text NOT NULL CHECK (type IN ('service','product','protocol','package','combo')),
  price            numeric(14,2) NOT NULL CHECK (price >= 0),
  unit_cost        numeric(14,2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),  -- computed from supplies OR manual
  commission_rate  numeric(5,4)  NULL CHECK (commission_rate IS NULL OR (commission_rate >= 0 AND commission_rate <= 1)),  -- override professional default
  duration_minutes integer NULL CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  description      text NULL,
  -- FR-SV-05/06 — Package flags (Phase 5). Kept as columns for schema stability.
  package_sessions integer NULL CHECK (package_sessions IS NULL OR package_sessions > 0),
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz NULL
);

COMMENT ON TABLE  public.services IS
  'KEYRA FR-SV-01/02: catalog (service/product/protocol/package/combo). Price/cost drive profit.';
COMMENT ON COLUMN public.services.type IS
  'Type: service|product|protocol|package|combo. Package/combo are Phase 5.';
COMMENT ON COLUMN public.services.price IS
  'Selling price. numeric(14,2) per NFR-FI-02. Max 999 999 999 999.99.';
COMMENT ON COLUMN public.services.unit_cost IS
  'Rolled-up cost of supplies per unit. Updated when service_supplies change.';
COMMENT ON COLUMN public.services.commission_rate IS
  'Override of professional default commission (0-1). Snapshotted to command_items.';
COMMENT ON COLUMN public.services.duration_minutes IS
  'Default duration for agenda slot (FR-SV-02).';
COMMENT ON COLUMN public.services.package_sessions IS
  'FR-SV-05: number of sessions in package (NULL for non-packages).';

CREATE INDEX IF NOT EXISTS services_org_id_idx        ON public.services (org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS services_category_id_idx   ON public.services (category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS services_active_type_idx   ON public.services (org_id, type, active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS services_name_trgm_idx     ON public.services USING gin (name extensions.gin_trgm_ops);

CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER services_enforce_org_id
  BEFORE UPDATE OF org_id ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();
