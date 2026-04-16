-- =============================================================================
-- KEYRA — Migration 002: Helper Functions
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Reusable helper functions used by RLS policies and triggers.
-- Traceability: ADR-011 (RLS by org_id), ADR-012 (JWT custom claim org_id),
--               NFR-SE-05 (audit log — updated_at trigger), NFR-FI-03 (integrity).
--
-- Design notes:
--   - All helpers live in schema `public` to be reachable from policies.
--   - `current_org_id()` is SECURITY DEFINER + STABLE so RLS can inline it.
--   - `is_org_member(org_id, required_role)` allows fine-grained role checks.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- current_org_id() — returns the org_id from the JWT custom claim.
-- Used in every tenant-scoped RLS policy (ADR-011).
-- Fails closed: if the claim is missing, returns NULL and policies deny access.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_org_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT NULLIF(
    COALESCE(
      current_setting('request.jwt.claim.org_id', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    ),
    ''
  )::uuid;
$$;

COMMENT ON FUNCTION public.current_org_id() IS
  'KEYRA ADR-012: returns org_id from JWT custom claim. Returns NULL if missing -> RLS denies.';

-- NOTE: is_org_member(uuid, text) é definida em 20260416000300_organizations.sql
--       (depende da tabela `memberships` criada lá).

-- -----------------------------------------------------------------------------
-- set_updated_at() — generic BEFORE UPDATE trigger for updated_at columns.
-- Applied to every table with updated_at (see migrations 003+).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'KEYRA: generic BEFORE UPDATE trigger maintaining updated_at = now().';

-- -----------------------------------------------------------------------------
-- enforce_org_id() — trigger helper that blocks changes to org_id.
-- Prevents accidental tenant-switching at the row level.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_org_id_immutability()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.org_id IS DISTINCT FROM NEW.org_id THEN
    RAISE EXCEPTION 'org_id is immutable (row % in table %)', OLD.id, TG_TABLE_NAME
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_org_id_immutability() IS
  'KEYRA ADR-011: prevents any UPDATE from changing org_id. Defense-in-depth vs RLS bypass.';

-- -----------------------------------------------------------------------------
-- decimal_round_half_even(value, digits) — banker's rounding for financial
-- values. NFR-FI-01 mandates HALF_EVEN rounding.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.round_half_even(value numeric, digits integer DEFAULT 2)
  RETURNS numeric
  LANGUAGE plpgsql
  IMMUTABLE
AS $$
DECLARE
  multiplier numeric := power(10::numeric, digits);
  scaled     numeric := value * multiplier;
  floored    numeric := floor(scaled);
  diff       numeric := scaled - floored;
BEGIN
  IF diff = 0.5 THEN
    -- Round half to even
    IF (floored::bigint % 2) = 0 THEN
      RETURN floored / multiplier;
    ELSE
      RETURN (floored + 1) / multiplier;
    END IF;
  ELSIF diff > 0.5 THEN
    RETURN (floored + 1) / multiplier;
  ELSE
    RETURN floored / multiplier;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.round_half_even(numeric, integer) IS
  'KEYRA NFR-FI-01: banker''s rounding (HALF_EVEN) for deterministic financial math.';
