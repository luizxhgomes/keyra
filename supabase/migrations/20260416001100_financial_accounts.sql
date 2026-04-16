-- =============================================================================
-- KEYRA — Migration 011: Financial Accounts, Expense Categories, Payment Methods
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Chart of accounts infrastructure used by transactions & payments.
-- Traceability: FR-FI-03 (classificação), FR-FI-05 (plano de contas pré-configurado),
--               FR-CP-01 (custos fixos), FR-FI-06 (fluxo de caixa).
--
-- Design notes:
--   - accounts = cashbox/bank/acquirer (where money lives).
--   - expense_categories = chart-of-accounts tree for DRE grouping (FR-FI-05).
--     kind ∈ {revenue, variable_cost, fixed_cost, operating_expense, tax, other}.
--   - payment_methods = Pix/credito/debito/dinheiro with configurable tax rate
--     (FR-CO-05: descontar taxa automaticamente).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- accounts — cashbox, bank, acquirer (Cielo, Stone etc)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name           text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  kind           text NOT NULL CHECK (kind IN ('cash','checking','savings','acquirer','wallet','other')),
  opening_balance numeric(14,2) NOT NULL DEFAULT 0,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz NULL,
  UNIQUE (org_id, name)
);

COMMENT ON TABLE public.accounts IS
  'KEYRA FR-FI-06: financial accounts (cash, bank, acquirers). Balance = opening + sum(transactions).';

CREATE INDEX IF NOT EXISTS accounts_org_id_idx ON public.accounts (org_id) WHERE deleted_at IS NULL;

CREATE TRIGGER accounts_set_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER accounts_enforce_org_id
  BEFORE UPDATE OF org_id ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- expense_categories — plano de contas (FR-FI-05)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  parent_id   uuid NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  kind        text NOT NULL CHECK (kind IN ('revenue','variable_cost','fixed_cost','operating_expense','tax','other')),
  code        text NULL,            -- optional accounting code (e.g., "3.1.01")
  is_default  boolean NOT NULL DEFAULT false,  -- pre-configured template
  active      boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz NULL,
  UNIQUE (org_id, name, parent_id)
);

COMMENT ON TABLE  public.expense_categories IS
  'KEYRA FR-FI-05: plano de contas (chart of accounts) with pre-configured estética template.';
COMMENT ON COLUMN public.expense_categories.kind IS
  'revenue | variable_cost | fixed_cost | operating_expense | tax | other. Drives DRE grouping.';

CREATE INDEX IF NOT EXISTS expense_categories_org_id_idx ON public.expense_categories (org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS expense_categories_parent_idx ON public.expense_categories (parent_id);
CREATE INDEX IF NOT EXISTS expense_categories_kind_idx   ON public.expense_categories (org_id, kind) WHERE deleted_at IS NULL;

CREATE TRIGGER expense_categories_set_updated_at
  BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER expense_categories_enforce_org_id
  BEFORE UPDATE OF org_id ON public.expense_categories
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- payment_methods — Pix, credito, debito, dinheiro with configurable tax rate
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  kind            text NOT NULL CHECK (kind IN ('pix','credit_card','debit_card','cash','bank_transfer','voucher','other')),
  fee_rate        numeric(5,4)  NOT NULL DEFAULT 0 CHECK (fee_rate >= 0 AND fee_rate < 1),  -- 3.5% = 0.035
  fee_fixed       numeric(14,2) NOT NULL DEFAULT 0 CHECK (fee_fixed >= 0),
  settlement_days integer       NOT NULL DEFAULT 0 CHECK (settlement_days >= 0),            -- D+N
  default_account_id uuid NULL REFERENCES public.accounts(id) ON DELETE SET NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz NULL,
  UNIQUE (org_id, name)
);

COMMENT ON TABLE  public.payment_methods IS
  'KEYRA FR-CO-04/05: payment methods with configurable fee (rate+fixed) and settlement (D+N).';

CREATE INDEX IF NOT EXISTS payment_methods_org_id_idx ON public.payment_methods (org_id) WHERE deleted_at IS NULL;

CREATE TRIGGER payment_methods_set_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER payment_methods_enforce_org_id
  BEFORE UPDATE OF org_id ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- goals — metas mensais (FR-IN-06 / FR-DA-07)
-- MVP-ready schema (Phase 6 for UI); schema stable.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_month    date NOT NULL,                         -- first day of month
  target_revenue  numeric(14,2) NULL CHECK (target_revenue IS NULL OR target_revenue >= 0),
  target_profit   numeric(14,2) NULL CHECK (target_profit IS NULL OR target_profit >= 0),
  target_appointments integer NULL CHECK (target_appointments IS NULL OR target_appointments >= 0),
  notes           text NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz NULL,
  UNIQUE (org_id, period_month)
);

COMMENT ON TABLE public.goals IS
  'KEYRA FR-IN-06: monthly goals (revenue/profit/count). Dashboard exibe gap vs meta (FR-DA-07).';

CREATE INDEX IF NOT EXISTS goals_org_period_idx ON public.goals (org_id, period_month) WHERE deleted_at IS NULL;

CREATE TRIGGER goals_set_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER goals_enforce_org_id
  BEFORE UPDATE OF org_id ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();
