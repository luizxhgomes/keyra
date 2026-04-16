-- =============================================================================
-- KEYRA — Migration 018: Seed helper — pre-configured chart of accounts
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Provide a function that bootstraps a new organization with a
--          ready-to-use plano de contas for estética + default payment methods.
-- Traceability: FR-FI-05 (plano de contas pré-configurado),
--               FR-CO-04/05 (payment methods com taxa), D10 (template fixo MVP).
--
-- Usage:
--   SELECT public.seed_default_chart_of_accounts('{org_uuid}'::uuid);
--
-- Idempotent: uses ON CONFLICT DO NOTHING via UNIQUE(org_id, name).
-- This is a HELPER (not auto-applied) — Server Actions call it during
-- organization onboarding (Phase 1).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.seed_default_chart_of_accounts(p_org_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY INVOKER   -- runs under caller's RLS
AS $$
DECLARE
  v_revenue_root uuid;
  v_var_root     uuid;
  v_fixed_root   uuid;
  v_op_root      uuid;
  v_tax_root     uuid;
BEGIN
  -- ============== ROOT CATEGORIES =====================================
  INSERT INTO public.expense_categories (org_id, name, kind, is_default, sort_order)
  VALUES (p_org_id, 'Receitas',          'revenue',            true, 10)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING
  RETURNING id INTO v_revenue_root;

  IF v_revenue_root IS NULL THEN
    SELECT id INTO v_revenue_root FROM public.expense_categories
     WHERE org_id = p_org_id AND name = 'Receitas' AND parent_id IS NULL;
  END IF;

  INSERT INTO public.expense_categories (org_id, name, kind, is_default, sort_order)
  VALUES (p_org_id, 'Custos Variáveis',  'variable_cost',      true, 20)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING
  RETURNING id INTO v_var_root;
  IF v_var_root IS NULL THEN
    SELECT id INTO v_var_root FROM public.expense_categories
     WHERE org_id = p_org_id AND name = 'Custos Variáveis' AND parent_id IS NULL;
  END IF;

  INSERT INTO public.expense_categories (org_id, name, kind, is_default, sort_order)
  VALUES (p_org_id, 'Custos Fixos',      'fixed_cost',         true, 30)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING
  RETURNING id INTO v_fixed_root;
  IF v_fixed_root IS NULL THEN
    SELECT id INTO v_fixed_root FROM public.expense_categories
     WHERE org_id = p_org_id AND name = 'Custos Fixos' AND parent_id IS NULL;
  END IF;

  INSERT INTO public.expense_categories (org_id, name, kind, is_default, sort_order)
  VALUES (p_org_id, 'Despesas Operacionais','operating_expense', true, 40)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING
  RETURNING id INTO v_op_root;
  IF v_op_root IS NULL THEN
    SELECT id INTO v_op_root FROM public.expense_categories
     WHERE org_id = p_org_id AND name = 'Despesas Operacionais' AND parent_id IS NULL;
  END IF;

  INSERT INTO public.expense_categories (org_id, name, kind, is_default, sort_order)
  VALUES (p_org_id, 'Impostos',          'tax',                true, 50)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING
  RETURNING id INTO v_tax_root;
  IF v_tax_root IS NULL THEN
    SELECT id INTO v_tax_root FROM public.expense_categories
     WHERE org_id = p_org_id AND name = 'Impostos' AND parent_id IS NULL;
  END IF;

  -- ============== CHILDREN: Receitas ================================
  INSERT INTO public.expense_categories (org_id, parent_id, name, kind, is_default, sort_order) VALUES
    (p_org_id, v_revenue_root, 'Serviços de Estética',    'revenue', true, 11),
    (p_org_id, v_revenue_root, 'Venda de Produtos',       'revenue', true, 12),
    (p_org_id, v_revenue_root, 'Pacotes',                 'revenue', true, 13),
    (p_org_id, v_revenue_root, 'Outras Receitas',         'revenue', true, 19)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING;

  -- ============== CHILDREN: Custos Variáveis ========================
  INSERT INTO public.expense_categories (org_id, parent_id, name, kind, is_default, sort_order) VALUES
    (p_org_id, v_var_root, 'Insumos (Produtos)',          'variable_cost', true, 21),
    (p_org_id, v_var_root, 'Comissões',                    'variable_cost', true, 22),
    (p_org_id, v_var_root, 'Taxas de Cartão/Pix',          'variable_cost', true, 23),
    (p_org_id, v_var_root, 'Embalagens e Descartáveis',    'variable_cost', true, 24)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING;

  -- ============== CHILDREN: Custos Fixos ============================
  INSERT INTO public.expense_categories (org_id, parent_id, name, kind, is_default, sort_order) VALUES
    (p_org_id, v_fixed_root, 'Aluguel',                    'fixed_cost', true, 31),
    (p_org_id, v_fixed_root, 'Energia Elétrica',           'fixed_cost', true, 32),
    (p_org_id, v_fixed_root, 'Água e Esgoto',              'fixed_cost', true, 33),
    (p_org_id, v_fixed_root, 'Internet e Telefonia',       'fixed_cost', true, 34),
    (p_org_id, v_fixed_root, 'Salários Fixos',             'fixed_cost', true, 35),
    (p_org_id, v_fixed_root, 'Pró-labore',                 'fixed_cost', true, 36),
    (p_org_id, v_fixed_root, 'Software/Sistemas',          'fixed_cost', true, 37)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING;

  -- ============== CHILDREN: Despesas Operacionais ===================
  INSERT INTO public.expense_categories (org_id, parent_id, name, kind, is_default, sort_order) VALUES
    (p_org_id, v_op_root, 'Marketing e Anúncios',          'operating_expense', true, 41),
    (p_org_id, v_op_root, 'Material de Escritório',        'operating_expense', true, 42),
    (p_org_id, v_op_root, 'Manutenção de Equipamentos',    'operating_expense', true, 43),
    (p_org_id, v_op_root, 'Limpeza e Higiene',             'operating_expense', true, 44),
    (p_org_id, v_op_root, 'Cursos e Atualização',          'operating_expense', true, 45),
    (p_org_id, v_op_root, 'Outras Despesas',               'operating_expense', true, 49)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING;

  -- ============== CHILDREN: Impostos ================================
  INSERT INTO public.expense_categories (org_id, parent_id, name, kind, is_default, sort_order) VALUES
    (p_org_id, v_tax_root, 'Simples Nacional (DAS)',       'tax', true, 51),
    (p_org_id, v_tax_root, 'ISS',                           'tax', true, 52),
    (p_org_id, v_tax_root, 'IRPF / IRPJ',                   'tax', true, 53)
  ON CONFLICT (org_id, name, parent_id) DO NOTHING;

  -- ============== DEFAULT ACCOUNTS ==================================
  INSERT INTO public.accounts (org_id, name, kind, opening_balance) VALUES
    (p_org_id, 'Caixa',                          'cash',        0),
    (p_org_id, 'Conta Corrente',                 'checking',    0),
    (p_org_id, 'Maquininha (Acquirer)',          'acquirer',    0)
  ON CONFLICT (org_id, name) DO NOTHING;

  -- ============== DEFAULT PAYMENT METHODS ===========================
  -- Rates are indicative 2026 BR market values; user can edit.
  INSERT INTO public.payment_methods (org_id, name, kind, fee_rate, fee_fixed, settlement_days) VALUES
    (p_org_id, 'Pix',                            'pix',            0.0000, 0,  0),
    (p_org_id, 'Dinheiro',                       'cash',           0.0000, 0,  0),
    (p_org_id, 'Cartão Débito',                  'debit_card',     0.0199, 0,  1),
    (p_org_id, 'Cartão Crédito à vista',         'credit_card',    0.0349, 0, 30),
    (p_org_id, 'Cartão Crédito parcelado',       'credit_card',    0.0429, 0, 30),
    (p_org_id, 'Transferência Bancária',         'bank_transfer',  0.0000, 0,  1)
  ON CONFLICT (org_id, name) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION public.seed_default_chart_of_accounts(uuid) IS
  'KEYRA FR-FI-05 / D10: bootstrap estética chart of accounts + accounts + payment methods for an org.';
