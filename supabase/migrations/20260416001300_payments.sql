-- =============================================================================
-- KEYRA — Migration 013: Payments (Command settlements)
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Payment events against a command (Pix/cartão/dinheiro).
-- Traceability: FR-CO-04 (registro de pagamento), FR-CO-05 (taxa automática),
--               FR-FI-01 (auto transaction on payment).
--
-- Design notes:
--   - 1 command N payments (FR-CO-04 allows partial / multi-method).
--   - ADR-013 #3: payment 1:1 transaction — trigger in migration 014 generates
--     the corresponding transaction atomically with the INSERT.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  command_id          uuid NOT NULL REFERENCES public.commands(id) ON DELETE RESTRICT,
  payment_method_id   uuid NOT NULL REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  account_id          uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  -- Snapshots at the moment of payment (preserve history if method fee later changes)
  gross_amount        numeric(14,2) NOT NULL CHECK (gross_amount > 0),
  fee_rate_snapshot   numeric(5,4)  NOT NULL DEFAULT 0 CHECK (fee_rate_snapshot >= 0 AND fee_rate_snapshot < 1),
  fee_fixed_snapshot  numeric(14,2) NOT NULL DEFAULT 0 CHECK (fee_fixed_snapshot >= 0),
  fee_amount          numeric(14,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
  net_amount          numeric(14,2) NOT NULL CHECK (net_amount >= 0),
  installments        integer       NOT NULL DEFAULT 1 CHECK (installments >= 1),
  external_reference  text NULL,                              -- Pix txid, acquirer NSU, etc.
  paid_at             timestamptz NOT NULL DEFAULT now(),
  settled_at          timestamptz NULL,
  notes               text NULL,
  -- Linkage to generated transaction (set by trigger)
  transaction_id      uuid NULL UNIQUE REFERENCES public.transactions(id) ON DELETE RESTRICT,
  created_by          uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz NULL,
  CONSTRAINT payments_amount_coherent CHECK (net_amount = gross_amount - fee_amount)
);

COMMENT ON TABLE  public.payments IS
  'KEYRA FR-CO-04/05: payment events per command. 1:1 transaction via trigger (ADR-013 #3).';
COMMENT ON COLUMN public.payments.fee_amount IS
  'Computed fee = (gross * fee_rate_snapshot) + fee_fixed_snapshot. App rounds HALF_EVEN.';

CREATE INDEX IF NOT EXISTS payments_org_id_idx         ON public.payments (org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS payments_command_idx        ON public.payments (command_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS payments_method_idx         ON public.payments (payment_method_id);
CREATE INDEX IF NOT EXISTS payments_account_idx        ON public.payments (account_id);
CREATE INDEX IF NOT EXISTS payments_paid_at_idx        ON public.payments (org_id, paid_at DESC) WHERE deleted_at IS NULL;

CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER payments_enforce_org_id
  BEFORE UPDATE OF org_id ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();
