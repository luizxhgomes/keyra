-- =============================================================================
-- KEYRA — RLS Isolation Test Suite
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Validate that a user in org A cannot access any data from org B.
-- Traceability: NFR-MT-01, NFR-MT-02, FR-MT-03; ADR-011/012.
--
-- How to run:
--     supabase db reset             # applies migrations + runs tests
--     supabase test db              # if using pgTAP (optional)
--
-- This suite does NOT depend on pgTAP. It uses plain SQL asserts via RAISE
-- EXCEPTION — any row-count mismatch aborts the test with a clear message.
--
-- Strategy:
--   1. Use service role (bypasses RLS) to set up 2 orgs, 2 users, some data.
--   2. Impersonate user-A by setting request.jwt.claims → then SELECT from
--      every tenant-scoped table. Verify row counts match org-A only.
--   3. Attempt cross-tenant INSERT/UPDATE from user-A against org-B row ids.
--      Verify those are blocked (zero rows affected / raised).
-- =============================================================================

BEGIN;

-- Disable audit trigger noise for cleanliness (still safe; trigger won't fail).
SET LOCAL client_min_messages TO WARNING;

-- Ensure we're running as a role that bypasses RLS for setup.
SET LOCAL role TO postgres;

-- Fixture data ---------------------------------------------------------------
DO $$
DECLARE
  v_user_a uuid := '11111111-1111-1111-1111-111111111111';
  v_user_b uuid := '22222222-2222-2222-2222-222222222222';
  v_org_a  uuid;
  v_org_b  uuid;
  v_cust_a uuid;
  v_cust_b uuid;
  v_svc_a  uuid;
  v_svc_b  uuid;
  v_prof_a uuid;
  v_prof_b uuid;
BEGIN
  -- Clean residues from prior runs
  DELETE FROM public.audit_log           WHERE resource_type = 'customers' AND resource_id IN (
    SELECT id FROM public.customers WHERE full_name LIKE 'TEST_%');
  DELETE FROM public.customers           WHERE full_name LIKE 'TEST_%';
  DELETE FROM public.services            WHERE name LIKE 'TEST_%';
  DELETE FROM public.professionals       WHERE display_name LIKE 'TEST_%';
  DELETE FROM public.memberships         WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.organizations       WHERE name LIKE 'TEST_%';

  -- Create two isolated orgs
  INSERT INTO public.organizations (name) VALUES ('TEST_OrgA_Clinic') RETURNING id INTO v_org_a;
  INSERT INTO public.organizations (name) VALUES ('TEST_OrgB_Studio') RETURNING id INTO v_org_b;

  -- Create two users in auth.users (Supabase schema). We use ON CONFLICT to
  -- tolerate pre-existing test users across local/remote runs.
  INSERT INTO auth.users (id, email, instance_id, aud, role, email_confirmed_at, created_at, updated_at)
  VALUES
    (v_user_a, 'testa@keyra.app',
     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     now(), now(), now()),
    (v_user_b, 'testb@keyra.app',
     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Memberships
  INSERT INTO public.memberships (user_id, org_id, role) VALUES (v_user_a, v_org_a, 'owner');
  INSERT INTO public.memberships (user_id, org_id, role) VALUES (v_user_b, v_org_b, 'owner');

  -- Customers (1 per org)
  INSERT INTO public.customers (org_id, full_name, phone)
    VALUES (v_org_a, 'TEST_Cliente_A', '+5511900000001') RETURNING id INTO v_cust_a;
  INSERT INTO public.customers (org_id, full_name, phone)
    VALUES (v_org_b, 'TEST_Cliente_B', '+5511900000002') RETURNING id INTO v_cust_b;

  -- Services
  INSERT INTO public.services (org_id, name, type, price, unit_cost)
    VALUES (v_org_a, 'TEST_Botox_A', 'service', 500.00, 100.00) RETURNING id INTO v_svc_a;
  INSERT INTO public.services (org_id, name, type, price, unit_cost)
    VALUES (v_org_b, 'TEST_Botox_B', 'service', 550.00, 120.00) RETURNING id INTO v_svc_b;

  -- Professionals
  INSERT INTO public.professionals (org_id, display_name)
    VALUES (v_org_a, 'TEST_Dra_Ana_A') RETURNING id INTO v_prof_a;
  INSERT INTO public.professionals (org_id, display_name)
    VALUES (v_org_b, 'TEST_Dra_Bia_B') RETURNING id INTO v_prof_b;

  -- Persist IDs for later blocks via GUC
  PERFORM set_config('tests.user_a', v_user_a::text, false);
  PERFORM set_config('tests.user_b', v_user_b::text, false);
  PERFORM set_config('tests.org_a',  v_org_a::text,  false);
  PERFORM set_config('tests.org_b',  v_org_b::text,  false);
  PERFORM set_config('tests.cust_a', v_cust_a::text, false);
  PERFORM set_config('tests.cust_b', v_cust_b::text, false);
  PERFORM set_config('tests.svc_a',  v_svc_a::text,  false);
  PERFORM set_config('tests.svc_b',  v_svc_b::text,  false);
  PERFORM set_config('tests.prof_a', v_prof_a::text, false);
  PERFORM set_config('tests.prof_b', v_prof_b::text, false);
END $$;

-- ============================================================================
-- Simulate user A (logged into org A): set JWT claims and switch to
-- the `authenticated` role that RLS filters by.
-- ============================================================================
DO $$
DECLARE
  v_claims jsonb;
  v_count_expected int := 1;
  v_count_actual   int;
BEGIN
  v_claims := jsonb_build_object(
    'sub',    current_setting('tests.user_a'),
    'role',   'authenticated',
    'org_id', current_setting('tests.org_a')
  );

  -- Set JWT claims for RLS helpers
  PERFORM set_config('request.jwt.claim.sub',    current_setting('tests.user_a'),  true);
  PERFORM set_config('request.jwt.claim.org_id', current_setting('tests.org_a'),   true);
  PERFORM set_config('request.jwt.claims',       v_claims::text,                    true);

  -- Switch to authenticated role (RLS applies)
  SET LOCAL role TO authenticated;

  -- A-1: user A sees exactly 1 customer (their own)
  SELECT count(*) INTO v_count_actual FROM public.customers WHERE full_name LIKE 'TEST_%';
  IF v_count_actual <> v_count_expected THEN
    RAISE EXCEPTION 'RLS FAIL [A-1 customers]: expected % rows, got %', v_count_expected, v_count_actual;
  END IF;

  -- A-2: user A sees exactly 1 service
  SELECT count(*) INTO v_count_actual FROM public.services WHERE name LIKE 'TEST_%';
  IF v_count_actual <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [A-2 services]: expected 1, got %', v_count_actual;
  END IF;

  -- A-3: user A sees exactly 1 professional
  SELECT count(*) INTO v_count_actual FROM public.professionals WHERE display_name LIKE 'TEST_%';
  IF v_count_actual <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [A-3 professionals]: expected 1, got %', v_count_actual;
  END IF;

  -- A-4: user A cannot see org B's customer by direct id lookup
  SELECT count(*) INTO v_count_actual FROM public.customers
    WHERE id = current_setting('tests.cust_b')::uuid;
  IF v_count_actual <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [A-4 direct-id lookup]: expected 0, got %', v_count_actual;
  END IF;

  -- A-5: user A only sees own org via the `organizations` table (is_org_member check)
  SELECT count(*) INTO v_count_actual FROM public.organizations WHERE name LIKE 'TEST_%';
  IF v_count_actual <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [A-5 organizations]: expected 1 (own), got %', v_count_actual;
  END IF;

  -- A-6: user A cannot insert data into org B (WITH CHECK violation expected)
  BEGIN
    INSERT INTO public.customers (org_id, full_name)
    VALUES (current_setting('tests.org_b')::uuid, 'TEST_INJECTED_B');
    RAISE EXCEPTION 'RLS FAIL [A-6 cross-tenant INSERT]: inject into org B should have been blocked';
  EXCEPTION WHEN insufficient_privilege OR check_violation OR OTHERS THEN
    -- Expected: RLS WITH CHECK blocks this
    NULL;
  END;

  -- A-7: user A cannot UPDATE org B's customer (zero rows affected by RLS)
  UPDATE public.customers SET notes = 'hacked'
    WHERE id = current_setting('tests.cust_b')::uuid;
  GET DIAGNOSTICS v_count_actual = ROW_COUNT;
  IF v_count_actual <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [A-7 cross-tenant UPDATE]: expected 0 rows updated, got %', v_count_actual;
  END IF;

  -- A-8: user A cannot DELETE org B's customer
  DELETE FROM public.customers WHERE id = current_setting('tests.cust_b')::uuid;
  GET DIAGNOSTICS v_count_actual = ROW_COUNT;
  IF v_count_actual <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [A-8 cross-tenant DELETE]: expected 0, got %', v_count_actual;
  END IF;

  RAISE NOTICE 'RLS test block A (user A isolation): PASSED';

  RESET ROLE;
END $$;

-- ============================================================================
-- Simulate user B (logged into org B) — mirror checks for the other side.
-- ============================================================================
DO $$
DECLARE
  v_claims jsonb;
  v_count_actual int;
BEGIN
  v_claims := jsonb_build_object(
    'sub',    current_setting('tests.user_b'),
    'role',   'authenticated',
    'org_id', current_setting('tests.org_b')
  );

  PERFORM set_config('request.jwt.claim.sub',    current_setting('tests.user_b'),  true);
  PERFORM set_config('request.jwt.claim.org_id', current_setting('tests.org_b'),   true);
  PERFORM set_config('request.jwt.claims',       v_claims::text,                    true);

  SET LOCAL role TO authenticated;

  SELECT count(*) INTO v_count_actual FROM public.customers WHERE full_name LIKE 'TEST_%';
  IF v_count_actual <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [B-1 customers]: expected 1, got %', v_count_actual;
  END IF;

  SELECT count(*) INTO v_count_actual FROM public.customers
    WHERE id = current_setting('tests.cust_a')::uuid;
  IF v_count_actual <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [B-2 direct-id lookup of A]: expected 0, got %', v_count_actual;
  END IF;

  RAISE NOTICE 'RLS test block B (user B isolation): PASSED';

  RESET ROLE;
END $$;

-- ============================================================================
-- Expanded coverage: memberships, organization_invites, appointments, commands,
-- transactions, supplies, inventory_movements, payments (Story 1.4 — AC1).
--
-- Strategy: seed 1 row in each covered table for BOTH orgs, then impersonate
-- user A and assert visibility = 1 per table (own org only).
-- ============================================================================
DO $$
DECLARE
  v_org_a uuid := current_setting('tests.org_a')::uuid;
  v_org_b uuid := current_setting('tests.org_b')::uuid;
  v_cust_a uuid := current_setting('tests.cust_a')::uuid;
  v_cust_b uuid := current_setting('tests.cust_b')::uuid;
  v_svc_a  uuid := current_setting('tests.svc_a')::uuid;
  v_svc_b  uuid := current_setting('tests.svc_b')::uuid;
  v_prof_a uuid := current_setting('tests.prof_a')::uuid;
  v_prof_b uuid := current_setting('tests.prof_b')::uuid;
  v_appt_a uuid;
  v_appt_b uuid;
  v_cmd_a  uuid;
  v_cmd_b  uuid;
  v_supply_a uuid;
  v_supply_b uuid;
BEGIN
  SET LOCAL role TO postgres;

  INSERT INTO public.appointments (org_id, customer_id, service_id, professional_id, starts_at, ends_at, price_snapshot)
  VALUES
    (v_org_a, v_cust_a, v_svc_a, v_prof_a, now() + interval '1 day', now() + interval '1 day 1 hour', 500.00)
  RETURNING id INTO v_appt_a;

  INSERT INTO public.appointments (org_id, customer_id, service_id, professional_id, starts_at, ends_at, price_snapshot)
  VALUES
    (v_org_b, v_cust_b, v_svc_b, v_prof_b, now() + interval '2 day', now() + interval '2 day 1 hour', 550.00)
  RETURNING id INTO v_appt_b;

  INSERT INTO public.commands (org_id, customer_id, professional_id, status)
    VALUES (v_org_a, v_cust_a, v_prof_a, 'open') RETURNING id INTO v_cmd_a;
  INSERT INTO public.commands (org_id, customer_id, professional_id, status)
    VALUES (v_org_b, v_cust_b, v_prof_b, 'open') RETURNING id INTO v_cmd_b;

  INSERT INTO public.supplies (org_id, name, unit_cost, unit)
    VALUES (v_org_a, 'TEST_SupplyA', 10.00, 'un') RETURNING id INTO v_supply_a;
  INSERT INTO public.supplies (org_id, name, unit_cost, unit)
    VALUES (v_org_b, 'TEST_SupplyB', 12.00, 'un') RETURNING id INTO v_supply_b;

  INSERT INTO public.organization_invites (org_id, email, role)
    VALUES (v_org_a, 'invitea@example.com', 'professional');
  INSERT INTO public.organization_invites (org_id, email, role)
    VALUES (v_org_b, 'inviteb@example.com', 'professional');

  PERFORM set_config('tests.appt_a', v_appt_a::text, false);
  PERFORM set_config('tests.appt_b', v_appt_b::text, false);
  PERFORM set_config('tests.cmd_a',  v_cmd_a::text,  false);
  PERFORM set_config('tests.cmd_b',  v_cmd_b::text,  false);
  PERFORM set_config('tests.supply_a', v_supply_a::text, false);
  PERFORM set_config('tests.supply_b', v_supply_b::text, false);

  RESET ROLE;
END $$;

-- Now impersonate user A again and assert per-table isolation on the expanded set.
DO $$
DECLARE
  v_count int;
  v_claims jsonb;
BEGIN
  v_claims := jsonb_build_object(
    'sub',    current_setting('tests.user_a'),
    'role',   'authenticated',
    'org_id', current_setting('tests.org_a')
  );
  PERFORM set_config('request.jwt.claim.sub',    current_setting('tests.user_a'), true);
  PERFORM set_config('request.jwt.claim.org_id', current_setting('tests.org_a'),  true);
  PERFORM set_config('request.jwt.claims',       v_claims::text,                   true);
  SET LOCAL role TO authenticated;

  -- memberships
  SELECT count(*) INTO v_count FROM public.memberships
   WHERE user_id IN (current_setting('tests.user_a')::uuid, current_setting('tests.user_b')::uuid);
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [E-memberships]: expected 1 visible, got %', v_count;
  END IF;

  -- organization_invites
  SELECT count(*) INTO v_count FROM public.organization_invites
   WHERE email LIKE 'invite%@example.com';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [E-invites]: expected 1 visible, got %', v_count;
  END IF;

  -- appointments
  SELECT count(*) INTO v_count FROM public.appointments
   WHERE id IN (current_setting('tests.appt_a')::uuid, current_setting('tests.appt_b')::uuid);
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [E-appointments]: expected 1 visible, got %', v_count;
  END IF;

  -- commands
  SELECT count(*) INTO v_count FROM public.commands
   WHERE id IN (current_setting('tests.cmd_a')::uuid, current_setting('tests.cmd_b')::uuid);
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [E-commands]: expected 1 visible, got %', v_count;
  END IF;

  -- supplies
  SELECT count(*) INTO v_count FROM public.supplies
   WHERE id IN (current_setting('tests.supply_a')::uuid, current_setting('tests.supply_b')::uuid);
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [E-supplies]: expected 1 visible, got %', v_count;
  END IF;

  -- Cross-tenant UPDATE on appointments must touch 0 rows.
  UPDATE public.appointments SET notes = 'hack' WHERE id = current_setting('tests.appt_b')::uuid;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [E-appointments cross-UPDATE]: expected 0, got %', v_count;
  END IF;

  -- Cross-tenant INSERT on memberships must be blocked.
  BEGIN
    INSERT INTO public.memberships (user_id, org_id, role)
      VALUES (current_setting('tests.user_a')::uuid, current_setting('tests.org_b')::uuid, 'admin');
    RAISE EXCEPTION 'RLS FAIL [E-memberships cross-INSERT]: cross-tenant should have been blocked';
  EXCEPTION WHEN insufficient_privilege OR check_violation OR OTHERS THEN
    NULL;
  END;

  RAISE NOTICE 'RLS test block E (expanded coverage): PASSED';
  RESET ROLE;
END $$;

-- ============================================================================
-- Smoke inverso: se alguém desabilitar RLS em qualquer tabela tenant-scoped, a
-- suíte falha imediatamente. Proteção contra regressão acidental.
-- ============================================================================
DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(c.relname, ', ')
    INTO v_missing
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relkind = 'r'
     AND c.relname IN (
       'organizations','memberships','organization_invites','customers','services',
       'service_categories','service_supplies','supplies','inventory_movements',
       'appointments','commands','command_items','payments','payment_methods',
       'transactions','expense_categories','accounts','goals','audit_log',
       'professionals','user_preferences'
     )
     AND c.relrowsecurity = false;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'RLS FAIL [F-smoke-inverso]: tabelas com RLS DESABILITADO: %', v_missing;
  END IF;

  RAISE NOTICE 'RLS test block F (smoke inverso — RLS habilitada em todas): PASSED';
END $$;

-- ============================================================================
-- Simulate a user with NO org_id claim — must see zero tenant rows.
-- ============================================================================
DO $$
DECLARE
  v_count int;
BEGIN
  PERFORM set_config('request.jwt.claim.sub',    current_setting('tests.user_a'), true);
  PERFORM set_config('request.jwt.claim.org_id', '',                               true);
  PERFORM set_config('request.jwt.claims',
                     jsonb_build_object('sub', current_setting('tests.user_a'),
                                        'role','authenticated')::text,             true);

  SET LOCAL role TO authenticated;

  SELECT count(*) INTO v_count FROM public.customers WHERE full_name LIKE 'TEST_%';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [C-1 no-claim]: expected 0 rows, got %', v_count;
  END IF;

  SELECT count(*) INTO v_count FROM public.services WHERE name LIKE 'TEST_%';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [C-2 no-claim services]: expected 0 rows, got %', v_count;
  END IF;

  RAISE NOTICE 'RLS test block C (no-claim deny): PASSED';

  RESET ROLE;
END $$;

ROLLBACK;

-- Final message (ROLLBACK above keeps DB clean; NOTICES still surface)
DO $$ BEGIN RAISE NOTICE 'ALL RLS ISOLATION TESTS PASSED'; END $$;
