-- =============================================================================
-- KEYRA — Migration 025: cost_center em professionals
-- Story 3.4 — agrupamento de receitas por centro de custo (FR-FI-04)
--
-- Centro de custo é text livre por enquanto (autocomplete na UI agrupa por
-- centros já existentes na org). Normalização case-insensitive fica para
-- Phase 5 se necessário.
-- =============================================================================

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS cost_center text NULL;

CREATE INDEX IF NOT EXISTS professionals_cost_center_idx
  ON public.professionals (org_id, cost_center)
  WHERE deleted_at IS NULL AND cost_center IS NOT NULL;

COMMENT ON COLUMN public.professionals.cost_center IS
  'KEYRA FR-FI-04: centro de custo do profissional (ex: "Estética Facial", "Corporal").';
