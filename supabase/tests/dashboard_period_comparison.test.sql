-- =============================================================================
-- KEYRA — Story 4.10: dashboard_period_comparison()
--
-- Prova da regra "mesmo período do mês anterior", do fuso America/Sao_Paulo,
-- da soma no banco sem limite de linhas e do isolamento entre clínicas.
--
-- Como a suíte RLS, roda em Postgres puro (sem pgTAP): qualquer divergência
-- aborta com RAISE EXCEPTION. Tudo dentro de BEGIN/ROLLBACK.
-- =============================================================================

BEGIN;
SET LOCAL client_min_messages TO WARNING;
SET LOCAL role TO postgres;

-- -----------------------------------------------------------------------------
-- 1. Janela de datas (não depende de dados)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  c record;
BEGIN
  FOR c IN
    SELECT * FROM (VALUES
      -- hoje,        início atual,  início anterior, fim anterior
      ('2026-11-04'::date, '2026-11-01'::date, '2026-10-01'::date, '2026-10-04'::date), -- dia 4
      ('2026-11-01',       '2026-11-01',       '2026-10-01',       '2026-10-01'),       -- dia 1
      ('2026-12-31',       '2026-12-01',       '2026-11-01',       '2026-11-30'),       -- 31 contra mês de 30
      ('2026-03-31',       '2026-03-01',       '2026-02-01',       '2026-02-28'),       -- 31/03 contra fevereiro
      ('2028-03-30',       '2028-03-01',       '2028-02-01',       '2028-02-29'),       -- ano bissexto
      ('2028-02-29',       '2028-02-01',       '2028-01-01',       '2028-01-29'),       -- 29/02
      ('2027-01-15',       '2027-01-01',       '2026-12-01',       '2026-12-15')        -- virada de ano
    ) AS t(today, cs, ps, pe)
  LOOP
    SELECT * INTO r FROM public.dashboard_period_comparison(c.today);
    IF r.current_start <> c.cs OR r.current_end <> c.today
       OR r.previous_start <> c.ps OR r.previous_end <> c.pe THEN
      RAISE EXCEPTION 'JANELA FAIL [%]: got % a % / % a %',
        c.today, r.current_start, r.current_end, r.previous_start, r.previous_end;
    END IF;
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Fixtures: duas clínicas
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_user_a uuid := '41041041-0000-0000-0000-00000000000a';
  v_user_b uuid := '41041041-0000-0000-0000-00000000000b';
  v_org_a uuid; v_org_b uuid;
  v_acc_a uuid; v_acc_b uuid;
  v_svc_a uuid; v_prof_a uuid;
BEGIN
  INSERT INTO public.organizations (name) VALUES ('TEST410_OrgA') RETURNING id INTO v_org_a;
  INSERT INTO public.organizations (name) VALUES ('TEST410_OrgB') RETURNING id INTO v_org_b;
  INSERT INTO auth.users (id, email, aud, role) VALUES
    (v_user_a, 'test410a@keyra.app', 'authenticated', 'authenticated'),
    (v_user_b, 'test410b@keyra.app', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.memberships (user_id, org_id, role) VALUES (v_user_a, v_org_a, 'owner'), (v_user_b, v_org_b, 'owner');

  INSERT INTO public.accounts (org_id, name, kind) VALUES (v_org_a, 'TEST410 Caixa', 'cash') RETURNING id INTO v_acc_a;
  INSERT INTO public.accounts (org_id, name, kind) VALUES (v_org_b, 'TEST410 Caixa', 'cash') RETURNING id INTO v_acc_b;
  INSERT INTO public.services (org_id, name, type, price, unit_cost) VALUES (v_org_a, 'TEST410 Limpeza', 'service', 200, 20) RETURNING id INTO v_svc_a;
  INSERT INTO public.professionals (org_id, display_name) VALUES (v_org_a, 'TEST410 Dra A') RETURNING id INTO v_prof_a;

  -- Org A — receitas (crédito: net = gross − fee)
  INSERT INTO public.transactions (org_id, account_id, direction, gross_amount, fee_amount, net_amount, origin, reference_date) VALUES
    (v_org_a, v_acc_a, 'credit', 1000.00, 30.00, 970.00, 'manual_income', '2026-10-02'),  -- anterior, dentro
    (v_org_a, v_acc_a, 'credit',  500.55,  0.00, 500.55, 'manual_income', '2026-10-04'),  -- anterior, último dia
    (v_org_a, v_acc_a, 'credit', 9999.00,  0.00, 9999.00,'manual_income', '2026-10-05'),  -- anterior, FORA (dia 5)
    (v_org_a, v_acc_a, 'credit', 1200.10,  0.10, 1200.00,'manual_income', '2026-11-03'),  -- atual
    (v_org_a, v_acc_a, 'credit',  800.00,  0.00, 800.00, 'manual_income', '2026-11-10');  -- atual, FUTURO (fora)
  INSERT INTO public.transactions (org_id, account_id, direction, gross_amount, fee_amount, net_amount, origin, reference_date, deleted_at) VALUES
    (v_org_a, v_acc_a, 'credit',  777.00,  0.00, 777.00, 'manual_income', '2026-11-02', now());  -- apagada (fora)

  -- Org A — despesas (débito: usa gross), inclusive custo fixo
  INSERT INTO public.transactions (org_id, account_id, direction, gross_amount, fee_amount, net_amount, origin, reference_date, is_fixed) VALUES
    (v_org_a, v_acc_a, 'debit', 3000.00, 0, 3000.00, 'manual_expense', '2026-10-01', true),   -- aluguel outubro, dentro
    (v_org_a, v_acc_a, 'debit',  150.25, 0,  150.25, 'manual_expense', '2026-10-20', false),  -- anterior, fora
    (v_org_a, v_acc_a, 'debit',  410.40, 0,  410.40, 'manual_expense', '2026-11-04', false),  -- atual
    (v_org_a, v_acc_a, 'debit', 3000.00, 0, 3000.00, 'manual_expense', '2026-11-06', true);   -- aluguel novembro, FUTURO (fora)

  -- Org B — não pode aparecer para A
  INSERT INTO public.transactions (org_id, account_id, direction, gross_amount, fee_amount, net_amount, origin, reference_date) VALUES
    (v_org_b, v_acc_b, 'credit', 55555.00, 0, 55555.00, 'manual_income', '2026-11-02'),
    (v_org_b, v_acc_b, 'debit',  44444.00, 0, 44444.00, 'manual_expense', '2026-10-02');

  -- Comandas pagas (fuso: paid_at em UTC, dia contado em São Paulo)
  INSERT INTO public.commands (org_id, status, subtotal, paid_at) VALUES
    (v_org_a, 'paid', 300.00, '2026-10-03 12:00-03'),   -- anterior
    (v_org_a, 'paid', 100.00, '2026-10-04 23:30-03'),   -- anterior (03:30 UTC do dia 5!)
    (v_org_a, 'paid', 250.00, '2026-11-01 01:00+00'),   -- 31/10 22h em SP → fora das duas janelas
    (v_org_a, 'paid', 200.00, '2026-11-02 10:00-03'),   -- atual
    (v_org_a, 'paid', 101.00, '2026-11-04 22:00-03');   -- atual (01:00 UTC do dia 5!)

  -- Agendamentos (comparecimento)
  INSERT INTO public.appointments (org_id, service_id, professional_id, starts_at, ends_at, status, price_snapshot) VALUES
    (v_org_a, v_svc_a, v_prof_a, '2026-10-01 09:00-03', '2026-10-01 10:00-03', 'done', 200),
    (v_org_a, v_svc_a, v_prof_a, '2026-10-02 09:00-03', '2026-10-02 10:00-03', 'no_show', 200),
    (v_org_a, v_svc_a, v_prof_a, '2026-10-15 09:00-03', '2026-10-15 10:00-03', 'cancelled', 200), -- fora
    (v_org_a, v_svc_a, v_prof_a, '2026-11-03 09:00-03', '2026-11-03 10:00-03', 'done', 200),
    (v_org_a, v_svc_a, v_prof_a, '2026-11-04 09:00-03', '2026-11-04 10:00-03', 'done', 200),
    (v_org_a, v_svc_a, v_prof_a, '2026-11-20 09:00-03', '2026-11-20 10:00-03', 'cancelled', 200), -- futuro, fora
    (v_org_a, v_svc_a, v_prof_a, '2026-11-04 15:00-03', '2026-11-04 16:00-03', 'scheduled', 200); -- não fechado

  -- Volume: 1.500 lançamentos de R$ 1,11 no período anterior (acima de max_rows = 1000)
  INSERT INTO public.transactions (org_id, account_id, direction, gross_amount, fee_amount, net_amount, origin, reference_date)
  SELECT v_org_a, v_acc_a, 'credit', 1.11, 0, 1.11, 'manual_income', '2026-10-03'
    FROM generate_series(1, 1500);

  PERFORM set_config('t410.user_a', v_user_a::text, false);
  PERFORM set_config('t410.org_a',  v_org_a::text,  false);
  PERFORM set_config('t410.user_b', v_user_b::text, false);
  PERFORM set_config('t410.org_b',  v_org_b::text,  false);
END $$;

-- -----------------------------------------------------------------------------
-- 3. Valores como usuária da clínica A (RLS ativa)
-- -----------------------------------------------------------------------------
DO $$
DECLARE r record;
BEGIN
  PERFORM set_config('request.jwt.claim.sub',    current_setting('t410.user_a'), true);
  PERFORM set_config('request.jwt.claim.org_id', current_setting('t410.org_a'),  true);
  PERFORM set_config('request.jwt.claims', jsonb_build_object(
    'sub', current_setting('t410.user_a'), 'role', 'authenticated',
    'org_id', current_setting('t410.org_a'))::text, true);
  SET LOCAL role TO authenticated;

  SELECT * INTO r FROM public.dashboard_period_comparison('2026-11-04');

  -- receita anterior: 970,00 + 500,55 + 1500 × 1,11 (1.665,00) = 3.135,55
  IF r.revenue_previous_cents <> 313555 THEN
    RAISE EXCEPTION 'VALOR FAIL [receita anterior]: esperado 313555, veio %', r.revenue_previous_cents;
  END IF;
  -- receita atual: 1.200,00 (futura e apagada ficam fora)
  IF r.revenue_current_cents <> 120000 THEN
    RAISE EXCEPTION 'VALOR FAIL [receita atual]: esperado 120000, veio %', r.revenue_current_cents;
  END IF;
  -- despesa anterior: aluguel 3.000,00 (dia 20 fora); org B fora
  IF r.expenses_previous_cents <> 300000 THEN
    RAISE EXCEPTION 'VALOR FAIL [despesa anterior]: esperado 300000, veio %', r.expenses_previous_cents;
  END IF;
  -- despesa atual: 410,40 (aluguel do dia 6 ainda é futuro)
  IF r.expenses_current_cents <> 41040 THEN
    RAISE EXCEPTION 'VALOR FAIL [despesa atual]: esperado 41040, veio %', r.expenses_current_cents;
  END IF;
  -- comandas: anterior 2 (300 + 100), atual 2 (200 + 101); a de 31/10 22h SP fica fora
  IF r.paid_commands_previous <> 2 OR r.paid_total_previous_cents <> 40000 THEN
    RAISE EXCEPTION 'FUSO FAIL [comandas anterior]: % / %', r.paid_commands_previous, r.paid_total_previous_cents;
  END IF;
  IF r.paid_commands_current <> 2 OR r.paid_total_current_cents <> 30100 THEN
    RAISE EXCEPTION 'FUSO FAIL [comandas atual]: % / %', r.paid_commands_current, r.paid_total_current_cents;
  END IF;
  -- comparecimento: anterior 1 de 2; atual 2 de 2
  IF r.appointments_done_previous <> 1 OR r.appointments_closed_previous <> 2
     OR r.appointments_done_current <> 2 OR r.appointments_closed_current <> 2 THEN
    RAISE EXCEPTION 'VALOR FAIL [comparecimento]: %/% e %/%',
      r.appointments_done_previous, r.appointments_closed_previous,
      r.appointments_done_current, r.appointments_closed_current;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Conferência contra SUM direto (como postgres, filtrando a org A)
-- -----------------------------------------------------------------------------
RESET role;
DO $$
DECLARE v_sum numeric;
BEGIN
  SELECT sum(net_amount) INTO v_sum FROM public.transactions
   WHERE org_id = current_setting('t410.org_a')::uuid AND direction = 'credit'
     AND deleted_at IS NULL AND reference_date BETWEEN '2026-10-01' AND '2026-10-04';
  IF v_sum * 100 <> 313555 THEN
    RAISE EXCEPTION 'SUM FAIL: SQL direto deu %', v_sum;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. Isolamento: usuária B só vê a própria clínica; sem claim, nada
-- -----------------------------------------------------------------------------
DO $$
DECLARE r record;
BEGIN
  PERFORM set_config('request.jwt.claim.sub',    current_setting('t410.user_b'), true);
  PERFORM set_config('request.jwt.claim.org_id', current_setting('t410.org_b'),  true);
  PERFORM set_config('request.jwt.claims', jsonb_build_object(
    'sub', current_setting('t410.user_b'), 'role', 'authenticated',
    'org_id', current_setting('t410.org_b'))::text, true);
  SET LOCAL role TO authenticated;

  SELECT * INTO r FROM public.dashboard_period_comparison('2026-11-04');
  IF r.revenue_current_cents <> 5555500 OR r.expenses_previous_cents <> 4444400
     OR r.revenue_previous_cents <> 0 OR r.paid_commands_current <> 0 THEN
    RAISE EXCEPTION 'ISOLAMENTO FAIL [org B]: % / % / % / %',
      r.revenue_current_cents, r.expenses_previous_cents, r.revenue_previous_cents, r.paid_commands_current;
  END IF;
END $$;

RESET role;
DO $$
DECLARE r record;
BEGIN
  PERFORM set_config('request.jwt.claim.sub',    '', true);
  PERFORM set_config('request.jwt.claim.org_id', '', true);
  PERFORM set_config('request.jwt.claims',       '', true);
  SET LOCAL role TO authenticated;

  SELECT * INTO r FROM public.dashboard_period_comparison('2026-11-04');
  IF r.revenue_current_cents <> 0 OR r.revenue_previous_cents <> 0
     OR r.expenses_current_cents <> 0 OR r.paid_commands_previous <> 0 THEN
    RAISE EXCEPTION 'ISOLAMENTO FAIL [sem claim]: retornou valores';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 6. Função não é SECURITY DEFINER
-- -----------------------------------------------------------------------------
RESET role;
DO $$
BEGIN
  IF (SELECT prosecdef FROM pg_proc WHERE proname = 'dashboard_period_comparison') THEN
    RAISE EXCEPTION 'SEGURANÇA FAIL: dashboard_period_comparison é SECURITY DEFINER';
  END IF;
END $$;

ROLLBACK;

DO $$ BEGIN RAISE NOTICE 'STORY 4.10 — dashboard_period_comparison: TODOS OS TESTES PASSARAM'; END $$;
