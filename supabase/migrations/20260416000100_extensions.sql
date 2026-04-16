-- =============================================================================
-- KEYRA — Migration 001: Extensions
-- Story 0.4 — @data-engineer (Dara)
-- Date: 2026-04-16
--
-- Purpose: Enable Postgres extensions required by the KEYRA data model.
-- Traceability: ADR-017 (pgcrypto for column encryption), ADR-013 (uuid PKs),
--               FR-PA-03/04 (full-text search on customer history later).
--
-- Idempotent: uses IF NOT EXISTS.
-- =============================================================================

-- UUID generation (gen_random_uuid comes from pgcrypto in Postgres 13+, but we
-- also enable uuid-ossp for compatibility with legacy helpers if needed).
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Trigram indexes for fuzzy search on customer name, service name, supplier.
-- Used by future FR-AG-07 (faltantes search), FR-SV-01 (catalog search).
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;

-- Citext for case-insensitive email columns (auth.users already uses lower(),
-- but our invites/memberships benefit from it).
CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA extensions;

-- btree_gist — required for exclusion constraints on appointment time ranges
-- (prevents double-booking the same professional). Used in migration 008.
CREATE EXTENSION IF NOT EXISTS "btree_gist" WITH SCHEMA extensions;

COMMENT ON EXTENSION pgcrypto IS 'KEYRA: used for gen_random_uuid and pgp_sym_encrypt (ADR-017)';
COMMENT ON EXTENSION pg_trgm  IS 'KEYRA: trigram fuzzy search for CRM and catalog';
COMMENT ON EXTENSION btree_gist IS 'KEYRA: used for appointment EXCLUDE USING gist (no double-booking)';
