-- =============================================================================
-- KEYRA — Migration 012: Transactions (financial ledger) and Payments
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Financial ledger (entradas/saídas) + command payments (FR-CO-04).
-- Traceability: FR-CO-04 (payment), FR-CO-05 (fee), FR-FI-01 (auto tx from payment),
--               FR-FI-02 (manual expense), FR-FI-06 (cash flow), NFR-FI-01..03.
--
-- Design notes:
--   - Two related tables: payments (per-command settlement events) and
--     transactions (the pure ledger). Each payment generates exactly 1 transaction
--     via trigger (ADR-013 #3). The ledger also accepts manual_income/expense.
--   - transactions.direction: 'credit' (entrada) or 'debit' (saída).
--   - transactions.origin: command_payment | manual_expense | manual_income |
--                          bank_import | adjustment.
--   - gross_amount, fee_amount, net_amount all stored explicitly for auditability
--     (NFR-FI-03: soma de comandas pagas = receita do DRE).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- transactions — the financial ledger (source of truth)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  account_id            uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  expense_category_id   uuid NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  professional_id       uuid NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,  -- FR-FI-04
  customer_id           uuid NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  direction             text NOT NULL CHECK (direction IN ('credit','debit')),
  -- Financial values
  gross_amount          numeric(14,2) NOT NULL CHECK (gross_amount >= 0),
  fee_amount            numeric(14,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
  net_amount            numeric(14,2) NOT NULL CHECK (net_amount >= 0),
  -- Classification
  origin                text NOT NULL CHECK (origin IN ('command_payment','manual_income','manual_expense','bank_import','adjustment')),
  description           text NULL,
  reference_date        date NOT NULL DEFAULT current_date,    -- competência
  settled_at            timestamptz NULL,                       -- when money lands (for acquirer D+N)
  -- Source references (loose — can point to commands, payments, documents)
  source_type           text NULL CHECK (source_type IS NULL OR source_type IN ('command','payment','invoice','manual','import')),
  source_id             uuid NULL,
  -- Flags
  is_fixed              boolean NOT NULL DEFAULT false,   -- FR-CP-01 / FR-FI-03: fixed vs variable
  -- Audit
  created_by            uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz NULL,
  -- NFR-FI-03: net must equal gross - fee for credits; for debits we accept gross=net and fee=0
  CONSTRAINT transactions_amount_coherent CHECK (
    (direction = 'credit' AND net_amount = gross_amount - fee_amount)
    OR (direction = 'debit'  AND fee_amount = 0 AND net_amount = gross_amount)
  )
);

COMMENT ON TABLE  public.transactions IS
  'KEYRA FR-FI-01/02/06: financial ledger. Source of truth for DRE and cash flow.';
COMMENT ON COLUMN public.transactions.direction IS
  'credit = entrada (receita); debit = saída (despesa/custo).';
COMMENT ON COLUMN public.transactions.origin IS
  'command_payment (auto) | manual_income | manual_expense | bank_import (Phase 7) | adjustment.';
COMMENT ON COLUMN public.transactions.reference_date IS
  'Competência — the accounting date; may differ from settled_at (acquirer D+N).';
COMMENT ON COLUMN public.transactions.is_fixed IS
  'FR-CP-01 / FR-FI-03: true for fixed costs (aluguel, salários), false for variable.';

CREATE INDEX IF NOT EXISTS transactions_org_id_idx         ON public.transactions (org_id)                                WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_org_date_idx       ON public.transactions (org_id, reference_date DESC)           WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_direction_idx      ON public.transactions (org_id, direction, reference_date)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_account_idx        ON public.transactions (account_id, reference_date DESC)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_category_idx       ON public.transactions (expense_category_id)                   WHERE deleted_at IS NULL AND expense_category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_professional_idx   ON public.transactions (professional_id, reference_date DESC)  WHERE deleted_at IS NULL AND professional_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_source_idx         ON public.transactions (source_type, source_id)                WHERE source_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_origin_idx         ON public.transactions (org_id, origin, reference_date);

CREATE TRIGGER transactions_set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER transactions_enforce_org_id
  BEFORE UPDATE OF org_id ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();
