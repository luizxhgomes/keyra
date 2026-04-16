-- =============================================================================
-- KEYRA — Migration 006: Customers (CRM)
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Patients / clients (CRM-basico).
-- Traceability: FR-PA-01, FR-PA-02, FR-PA-03, FR-PA-04; CON-LG-01..06 (LGPD).
--
-- Design notes:
--   - Phone + email are in plain text for MVP (common in estética); CPF is
--     encrypted at column level per ADR-017 using pgp_sym_encrypt.
--   - birth_date enables FR-IN-08 future (upsell campaigns by age / birthday).
--   - For right-to-erasure, DELETE is allowed but preferred flow is anonymize
--     (set PII columns to NULL and keep aggregates) — handled by app code.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name         text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 200),
  phone             text NULL,                 -- E.164 preferred (+55...)
  email             extensions.citext NULL,
  birth_date        date NULL,
  notes             text NULL,                 -- free-form notes (no clinical data — see CON-ES-07)
  cpf_encrypted     bytea NULL,                -- pgp_sym_encrypt (ADR-017)
  cpf_hash          text NULL,                 -- SHA-256 lowercase for dedupe lookups
  external_ref      text NULL,                 -- for future imports (Gestek/Conta Azul)
  consent_lgpd_at   timestamptz NULL,          -- CON-LG-04: explicit consent timestamp
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz NULL,
  UNIQUE (org_id, cpf_hash)                    -- per-org dedupe by CPF
);

COMMENT ON TABLE  public.customers IS
  'KEYRA FR-PA-01: CRM pacientes. PII (cpf) encrypted via ADR-017.';
COMMENT ON COLUMN public.customers.cpf_encrypted IS
  'Encrypted with pgp_sym_encrypt using COLUMN_ENCRYPTION_KEY (ADR-017).';
COMMENT ON COLUMN public.customers.cpf_hash IS
  'SHA-256 hash of normalized CPF for deterministic lookup/dedupe (cannot reverse).';
COMMENT ON COLUMN public.customers.notes IS
  'Free-form notes. CON-ES-07: NOT clinical prontuario — MVP is financial only.';

CREATE INDEX IF NOT EXISTS customers_org_id_idx       ON public.customers (org_id)               WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS customers_full_name_trgm   ON public.customers USING gin (full_name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS customers_phone_idx        ON public.customers (org_id, phone)        WHERE deleted_at IS NULL AND phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS customers_email_idx        ON public.customers (org_id, email)        WHERE deleted_at IS NULL AND email IS NOT NULL;

CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER customers_enforce_org_id
  BEFORE UPDATE OF org_id ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();
