-- =============================================================================
-- Story 4.10 — Comparativo justo no painel (mesmo período do mês anterior)
--
-- Problema: o painel comparava o mês corrente até hoje com o mês anterior
-- inteiro, somava o mês anterior em JS (sujeito a max_rows = 1000 do PostgREST)
-- e cortava datas em UTC enquanto a view usa America/Sao_Paulo.
--
-- Esta função devolve, para a org do JWT, os totais do mês corrente (dia 1 até
-- hoje) e do mesmo intervalo do mês anterior (dia 1 até o mesmo dia, limitado
-- ao último dia do mês anterior), tudo agregado no banco e no fuso de São Paulo.
--
-- Decisão do owner (04/11/2026): mesmo período para tudo, inclusive custos
-- fixos.
--
-- Segurança: SECURITY INVOKER — a RLS das tabelas de origem continua valendo.
-- Além disso, filtra explicitamente por current_org_id() (sem claim → NULL →
-- zero linhas). Nada de SECURITY DEFINER.
--
-- Valores monetários em centavos (bigint): numeric(14,2) * 100 é inteiro exato,
-- sem arredondamento e sem float.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.dashboard_period_comparison(p_today date DEFAULT NULL)
  RETURNS TABLE (
    today                        date,
    current_start                date,
    current_end                  date,
    previous_start               date,
    previous_end                 date,
    revenue_current_cents        bigint,
    expenses_current_cents       bigint,
    revenue_previous_cents       bigint,
    expenses_previous_cents      bigint,
    paid_commands_current        integer,
    paid_total_current_cents     bigint,
    paid_commands_previous       integer,
    paid_total_previous_cents    bigint,
    appointments_done_current    integer,
    appointments_closed_current  integer,
    appointments_done_previous   integer,
    appointments_closed_previous integer
  )
  LANGUAGE sql
  STABLE
  SECURITY INVOKER
  SET search_path = public, pg_temp
AS $$
  WITH d AS (
    SELECT COALESCE(p_today, (now() AT TIME ZONE 'America/Sao_Paulo')::date) AS today
  ),
  w AS (
    SELECT d.today,
           date_trunc('month', d.today)::date AS cs,
           d.today AS ce,
           (date_trunc('month', d.today) - interval '1 month')::date AS ps,
           LEAST(
             (date_trunc('month', d.today) - interval '1 month')::date
               + (d.today - date_trunc('month', d.today)::date),
             (date_trunc('month', d.today) - interval '1 day')::date
           ) AS pe
      FROM d
  ),
  o AS (SELECT public.current_org_id() AS org_id),
  tx AS (
    SELECT
      COALESCE(sum(t.net_amount)   FILTER (WHERE t.direction = 'credit' AND t.reference_date BETWEEN w.cs AND w.ce), 0) AS rev_cur,
      COALESCE(sum(t.gross_amount) FILTER (WHERE t.direction = 'debit'  AND t.reference_date BETWEEN w.cs AND w.ce), 0) AS exp_cur,
      COALESCE(sum(t.net_amount)   FILTER (WHERE t.direction = 'credit' AND t.reference_date BETWEEN w.ps AND w.pe), 0) AS rev_prev,
      COALESCE(sum(t.gross_amount) FILTER (WHERE t.direction = 'debit'  AND t.reference_date BETWEEN w.ps AND w.pe), 0) AS exp_prev
      FROM w, o, public.transactions t
     WHERE t.org_id = o.org_id
       AND t.deleted_at IS NULL
       AND t.reference_date BETWEEN w.ps AND w.ce
  ),
  cmd AS (
    SELECT
      count(*)                     FILTER (WHERE x.dia BETWEEN w.cs AND w.ce) AS n_cur,
      COALESCE(sum(x.total) FILTER (WHERE x.dia BETWEEN w.cs AND w.ce), 0) AS tot_cur,
      count(*)                     FILTER (WHERE x.dia BETWEEN w.ps AND w.pe) AS n_prev,
      COALESCE(sum(x.total) FILTER (WHERE x.dia BETWEEN w.ps AND w.pe), 0) AS tot_prev
      FROM w, o,
           LATERAL (
             SELECT c.total, (c.paid_at AT TIME ZONE 'America/Sao_Paulo')::date AS dia
               FROM public.commands c
              WHERE c.org_id = o.org_id
                AND c.status = 'paid'
                AND c.deleted_at IS NULL
                AND c.paid_at >= (w.ps::timestamp AT TIME ZONE 'America/Sao_Paulo')
                AND c.paid_at <  ((w.ce + 1)::timestamp AT TIME ZONE 'America/Sao_Paulo')
           ) x
  ),
  ap AS (
    SELECT
      count(*) FILTER (WHERE x.dia BETWEEN w.cs AND w.ce AND x.status = 'done') AS done_cur,
      count(*) FILTER (WHERE x.dia BETWEEN w.cs AND w.ce AND x.status IN ('done','no_show','cancelled')) AS closed_cur,
      count(*) FILTER (WHERE x.dia BETWEEN w.ps AND w.pe AND x.status = 'done') AS done_prev,
      count(*) FILTER (WHERE x.dia BETWEEN w.ps AND w.pe AND x.status IN ('done','no_show','cancelled')) AS closed_prev
      FROM w, o,
           LATERAL (
             SELECT a.status, (a.starts_at AT TIME ZONE 'America/Sao_Paulo')::date AS dia
               FROM public.appointments a
              WHERE a.org_id = o.org_id
                AND a.deleted_at IS NULL
                AND a.starts_at >= (w.ps::timestamp AT TIME ZONE 'America/Sao_Paulo')
                AND a.starts_at <  ((w.ce + 1)::timestamp AT TIME ZONE 'America/Sao_Paulo')
           ) x
  )
  SELECT w.today, w.cs, w.ce, w.ps, w.pe,
         (tx.rev_cur  * 100)::bigint,
         (tx.exp_cur  * 100)::bigint,
         (tx.rev_prev * 100)::bigint,
         (tx.exp_prev * 100)::bigint,
         cmd.n_cur::integer,
         (cmd.tot_cur  * 100)::bigint,
         cmd.n_prev::integer,
         (cmd.tot_prev * 100)::bigint,
         ap.done_cur::integer,
         ap.closed_cur::integer,
         ap.done_prev::integer,
         ap.closed_prev::integer
    FROM w, tx, cmd, ap;
$$;

COMMENT ON FUNCTION public.dashboard_period_comparison(date) IS
  'KEYRA Story 4.10: totais do mês corrente (dia 1 até hoje) e do mesmo intervalo do mês anterior, em America/Sao_Paulo, para a org do JWT. Centavos em bigint. SECURITY INVOKER.';

REVOKE ALL ON FUNCTION public.dashboard_period_comparison(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dashboard_period_comparison(date) TO authenticated;
