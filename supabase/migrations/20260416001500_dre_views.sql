-- =============================================================================
-- KEYRA — Migration 015: DRE Views (Basic + per-Service + per-Professional)
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: DRE básica automática + DRE por serviço/profissional.
-- Traceability: FR-DR-01, FR-DR-02, FR-DR-03; NFR-PE-03 (<3s DRE).
--
-- Design notes:
--   - Starts as plain VIEWS (MVP Phase 4). Upgrade to MATERIALIZED VIEWS when
--     Phase 5 performance budget demands (NFR-PE-03 defines <3s at 12-month range;
--     views + proper indexes handle MVP volume of ~200 appointments/mo).
--   - All views are tenant-safe: they include org_id; the consuming queries
--     should filter by org_id (RLS on underlying tables already enforces this).
--   - DRE por serviço uses command_items (not services) for snapshot accuracy.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- v_dre_monthly — the DRE básica (FR-DR-01)
--   Revenue: sum of credit transactions (origin=command_payment OR manual_income)
--   Variable cost: sum of debit transactions where category.kind='variable_cost'
--                  PLUS command_items.unit_cost × quantity for paid commands
--   Fixed cost: sum of debit transactions where category.kind='fixed_cost'
--   Operating expense: kind='operating_expense'
--   Tax: kind='tax'
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_dre_monthly AS
WITH month_bounds AS (
  SELECT org_id,
         date_trunc('month', reference_date)::date AS period_month
    FROM public.transactions
   WHERE deleted_at IS NULL
   GROUP BY org_id, date_trunc('month', reference_date)::date
),
revenues AS (
  SELECT t.org_id,
         date_trunc('month', t.reference_date)::date AS period_month,
         sum(t.net_amount) AS revenue_net,
         sum(t.gross_amount) AS revenue_gross,
         sum(t.fee_amount) AS acquirer_fees
    FROM public.transactions t
   WHERE t.direction = 'credit'
     AND t.deleted_at IS NULL
   GROUP BY t.org_id, date_trunc('month', t.reference_date)::date
),
expenses AS (
  SELECT t.org_id,
         date_trunc('month', t.reference_date)::date AS period_month,
         sum(t.gross_amount) FILTER (WHERE ec.kind = 'variable_cost')      AS variable_costs_manual,
         sum(t.gross_amount) FILTER (WHERE ec.kind = 'fixed_cost')         AS fixed_costs,
         sum(t.gross_amount) FILTER (WHERE ec.kind = 'operating_expense')  AS operating_expenses,
         sum(t.gross_amount) FILTER (WHERE ec.kind = 'tax')                AS taxes,
         sum(t.gross_amount) FILTER (WHERE ec.kind = 'other' OR ec.id IS NULL) AS other_expenses
    FROM public.transactions t
    LEFT JOIN public.expense_categories ec ON ec.id = t.expense_category_id
   WHERE t.direction = 'debit'
     AND t.deleted_at IS NULL
   GROUP BY t.org_id, date_trunc('month', t.reference_date)::date
),
command_costs AS (
  -- Variable cost from insumos consumed (snapshotted in command_items.unit_cost)
  SELECT c.org_id,
         date_trunc('month', c.paid_at)::date AS period_month,
         sum(ci.unit_cost * ci.quantity) AS variable_costs_supplies,
         sum(ci.unit_price * ci.quantity * ci.commission_rate) AS commissions
    FROM public.commands c
    JOIN public.command_items ci ON ci.command_id = c.id AND ci.org_id = c.org_id
   WHERE c.status = 'paid'
     AND c.deleted_at IS NULL
   GROUP BY c.org_id, date_trunc('month', c.paid_at)::date
)
SELECT mb.org_id,
       mb.period_month,
       COALESCE(r.revenue_net, 0)                   AS revenue_net,
       COALESCE(r.revenue_gross, 0)                 AS revenue_gross,
       COALESCE(r.acquirer_fees, 0)                 AS acquirer_fees,
       COALESCE(cc.variable_costs_supplies, 0)      AS variable_costs_supplies,
       COALESCE(e.variable_costs_manual, 0)         AS variable_costs_manual,
       COALESCE(cc.commissions, 0)                  AS commissions,
       COALESCE(e.fixed_costs, 0)                   AS fixed_costs,
       COALESCE(e.operating_expenses, 0)            AS operating_expenses,
       COALESCE(e.taxes, 0)                         AS taxes,
       COALESCE(e.other_expenses, 0)                AS other_expenses,
       (COALESCE(r.revenue_net, 0)
        - COALESCE(cc.variable_costs_supplies, 0)
        - COALESCE(e.variable_costs_manual, 0)
        - COALESCE(cc.commissions, 0)
        - COALESCE(e.fixed_costs, 0)
        - COALESCE(e.operating_expenses, 0)
        - COALESCE(e.taxes, 0)
        - COALESCE(e.other_expenses, 0))            AS net_profit
  FROM month_bounds mb
  LEFT JOIN revenues       r  ON r.org_id = mb.org_id  AND r.period_month = mb.period_month
  LEFT JOIN expenses       e  ON e.org_id = mb.org_id  AND e.period_month = mb.period_month
  LEFT JOIN command_costs  cc ON cc.org_id = mb.org_id AND cc.period_month = mb.period_month;

COMMENT ON VIEW public.v_dre_monthly IS
  'KEYRA FR-DR-01: DRE básica mensal — Receita - Custos Variáveis - Comissões - Fixos - Despesas - Impostos = Lucro.';

-- -----------------------------------------------------------------------------
-- v_dre_by_service — FR-DR-02 (diferencial vs Conta Azul)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_dre_by_service AS
SELECT c.org_id,
       date_trunc('month', c.paid_at)::date AS period_month,
       ci.service_id,
       s.name                                AS service_name,
       s.type                                AS service_type,
       count(*)                              AS items_count,
       sum(ci.quantity)                      AS total_quantity,
       sum(ci.unit_price * ci.quantity)      AS revenue_gross,
       sum(ci.unit_cost  * ci.quantity)      AS variable_cost,
       sum(ci.unit_price * ci.quantity * ci.commission_rate) AS commissions,
       sum(ci.discount_amount)               AS discounts,
       (sum(ci.unit_price * ci.quantity)
        - sum(ci.unit_cost  * ci.quantity)
        - sum(ci.unit_price * ci.quantity * ci.commission_rate)
        - sum(ci.discount_amount))           AS gross_profit
  FROM public.command_items ci
  JOIN public.commands c ON c.id = ci.command_id AND c.org_id = ci.org_id
  JOIN public.services s ON s.id = ci.service_id AND s.org_id = ci.org_id
 WHERE c.status = 'paid'
   AND c.deleted_at IS NULL
 GROUP BY c.org_id, date_trunc('month', c.paid_at)::date, ci.service_id, s.name, s.type;

COMMENT ON VIEW public.v_dre_by_service IS
  'KEYRA FR-DR-02 (diferencial): lucro por serviço por mês. Fonte: command_items (snapshots).';

-- -----------------------------------------------------------------------------
-- v_dre_by_professional — FR-DR-03
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_dre_by_professional AS
SELECT c.org_id,
       date_trunc('month', c.paid_at)::date AS period_month,
       ci.professional_id,
       p.display_name                        AS professional_name,
       count(*)                              AS items_count,
       sum(ci.unit_price * ci.quantity)      AS revenue_gross,
       sum(ci.unit_cost  * ci.quantity)      AS variable_cost,
       sum(ci.unit_price * ci.quantity * ci.commission_rate) AS commission_to_pay,
       (sum(ci.unit_price * ci.quantity)
        - sum(ci.unit_cost  * ci.quantity)
        - sum(ci.unit_price * ci.quantity * ci.commission_rate)) AS gross_profit
  FROM public.command_items ci
  JOIN public.commands c ON c.id = ci.command_id AND c.org_id = ci.org_id
  LEFT JOIN public.professionals p ON p.id = ci.professional_id AND p.org_id = ci.org_id
 WHERE c.status = 'paid'
   AND c.deleted_at IS NULL
 GROUP BY c.org_id, date_trunc('month', c.paid_at)::date, ci.professional_id, p.display_name;

COMMENT ON VIEW public.v_dre_by_professional IS
  'KEYRA FR-DR-03: lucro bruto gerado por cada profissional por mês.';

-- -----------------------------------------------------------------------------
-- v_cashflow_daily — FR-FI-06 (saldo, entradas, saídas por dia)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_cashflow_daily AS
SELECT t.org_id,
       t.reference_date AS day,
       sum(CASE WHEN t.direction = 'credit' THEN t.net_amount ELSE 0 END) AS inflows,
       sum(CASE WHEN t.direction = 'debit'  THEN t.net_amount ELSE 0 END) AS outflows,
       sum(CASE WHEN t.direction = 'credit' THEN t.net_amount ELSE -t.net_amount END) AS net
  FROM public.transactions t
 WHERE t.deleted_at IS NULL
 GROUP BY t.org_id, t.reference_date;

COMMENT ON VIEW public.v_cashflow_daily IS
  'KEYRA FR-FI-06: fluxo de caixa diário (entradas, saídas, saldo).';

-- -----------------------------------------------------------------------------
-- v_dashboard_kpis — supporting view for the single-screen dashboard (FR-DA-*)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_dashboard_kpis AS
SELECT o.id AS org_id,
       date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')::date AS current_month,
       -- Revenue (realized — paid commands this month)
       COALESCE((SELECT sum(net_amount)
                   FROM public.transactions t
                  WHERE t.org_id = o.id AND t.direction = 'credit'
                    AND t.reference_date >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')::date
                    AND t.deleted_at IS NULL), 0) AS revenue_mtd,
       -- Expected revenue (scheduled appointments remaining in the month)
       COALESCE((SELECT sum(price_snapshot)
                   FROM public.appointments a
                  WHERE a.org_id = o.id AND a.status = 'scheduled'
                    AND a.starts_at >= now()
                    AND a.starts_at < (date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') + interval '1 month')
                    AND a.deleted_at IS NULL), 0) AS expected_revenue_mtd,
       -- Expenses (debit transactions this month)
       COALESCE((SELECT sum(gross_amount)
                   FROM public.transactions t
                  WHERE t.org_id = o.id AND t.direction = 'debit'
                    AND t.reference_date >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')::date
                    AND t.deleted_at IS NULL), 0) AS expenses_mtd,
       -- Appointments today
       COALESCE((SELECT count(*)
                   FROM public.appointments a
                  WHERE a.org_id = o.id
                    AND a.starts_at >= date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo')
                    AND a.starts_at <  date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + interval '1 day'
                    AND a.deleted_at IS NULL), 0) AS appointments_today
  FROM public.organizations o
 WHERE o.deleted_at IS NULL;

COMMENT ON VIEW public.v_dashboard_kpis IS
  'KEYRA FR-DA-03/04/05: KPIs da tela única (revenue MTD, expected, expenses, appointments today).';
