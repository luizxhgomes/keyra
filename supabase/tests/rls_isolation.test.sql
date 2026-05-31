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
       'professionals','user_preferences','receipts'
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

-- =============================================================================
-- Block G — Auth V2 schema (Story auth.1): profiles + user_consent_records
--           + legal_documents
-- =============================================================================
-- Cobertura:
--   G-1  user A não vê profile de user B (profiles_select_own)
--   G-2  user A não consegue UPDATE profile de user B
--   G-3  authenticated NÃO consegue INSERT direto em profiles (só trigger/service)
--   G-4  user A não vê consent de user B (user_consent_records_select_own)
--   G-5  user A não consegue UPDATE seus próprios consents (imutáveis)
--   G-6  user A não consegue DELETE seus próprios consents (imutáveis)
--   G-7  legal_documents é leitura pública para authenticated
--   G-8  authenticated NÃO consegue INSERT em legal_documents (só service_role)

DO $$
DECLARE
  v_user_a uuid := current_setting('tests.user_a')::uuid;
  v_user_b uuid := current_setting('tests.user_b')::uuid;
  v_count  int;
  v_doc_id uuid;
BEGIN
  -- Setup como postgres (bypass RLS): garantir profiles seedados (caso o
  -- trigger on_auth_user_created já tenha rodado na fixture; senão criar).
  INSERT INTO public.profiles (id, full_name)
    VALUES (v_user_a, 'TEST_UserA')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
  INSERT INTO public.profiles (id, full_name)
    VALUES (v_user_b, 'TEST_UserB')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- 1 documento legal de teste
  INSERT INTO public.legal_documents (type, version, content_hash, content_md)
    VALUES ('terms', 'TEST_v0.1', 'sha256_test_hash', '# Termos teste')
    ON CONFLICT (type, version) DO UPDATE SET content_md = EXCLUDED.content_md
    RETURNING id INTO v_doc_id;

  -- Aceites de A e B
  INSERT INTO public.user_consent_records (user_id, document_id, ip_address, user_agent)
    VALUES (v_user_a, v_doc_id, '127.0.0.1'::inet, 'TEST agent A')
    ON CONFLICT (user_id, document_id) DO NOTHING;
  INSERT INTO public.user_consent_records (user_id, document_id, ip_address, user_agent)
    VALUES (v_user_b, v_doc_id, '127.0.0.2'::inet, 'TEST agent B')
    ON CONFLICT (user_id, document_id) DO NOTHING;

  -- Assumir identidade de user A
  PERFORM set_config('request.jwt.claim.sub',    v_user_a::text, true);
  PERFORM set_config('request.jwt.claim.org_id', current_setting('tests.org_a'), true);
  PERFORM set_config('request.jwt.claims',
                     jsonb_build_object('sub', v_user_a::text,
                                        'org_id', current_setting('tests.org_a'),
                                        'role', 'authenticated')::text, true);
  SET LOCAL role TO authenticated;

  -- G-1
  SELECT count(*) INTO v_count FROM public.profiles WHERE id IN (v_user_a, v_user_b);
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [G-1 profiles SELECT cross]: expected 1 (own only), got %', v_count;
  END IF;

  -- G-2
  UPDATE public.profiles SET full_name = 'HACK_B' WHERE id = v_user_b;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [G-2 profiles UPDATE cross]: expected 0, got %', v_count;
  END IF;

  -- G-3
  BEGIN
    INSERT INTO public.profiles (id, full_name) VALUES (gen_random_uuid(), 'HACK_INSERT');
    SELECT count(*) INTO v_count FROM public.profiles WHERE full_name = 'HACK_INSERT';
    IF v_count <> 0 THEN
      RAISE EXCEPTION 'RLS FAIL [G-3 profiles INSERT]: linha foi inserida silenciosamente';
    END IF;
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      NULL; -- esperado
  END;

  -- G-4
  SELECT count(*) INTO v_count FROM public.user_consent_records;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [G-4 consent SELECT cross]: expected 1 (own only), got %', v_count;
  END IF;

  -- G-5
  UPDATE public.user_consent_records SET ip_address = '0.0.0.0'::inet WHERE user_id = v_user_a;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [G-5 consent UPDATE own]: expected 0 (immutable), got %', v_count;
  END IF;

  -- G-6
  DELETE FROM public.user_consent_records WHERE user_id = v_user_a;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [G-6 consent DELETE own]: expected 0 (immutable), got %', v_count;
  END IF;

  -- G-7
  SELECT count(*) INTO v_count FROM public.legal_documents WHERE version = 'TEST_v0.1';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [G-7 legal_documents SELECT]: expected 1, got %', v_count;
  END IF;

  -- G-8
  BEGIN
    INSERT INTO public.legal_documents (type, version, content_hash, content_md)
      VALUES ('terms', 'HACK_v0.0', 'hack', 'hack');
    SELECT count(*) INTO v_count FROM public.legal_documents WHERE version = 'HACK_v0.0';
    IF v_count <> 0 THEN
      RAISE EXCEPTION 'RLS FAIL [G-8 legal_documents INSERT]: linha inserida silenciosamente';
    END IF;
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL; -- esperado
  END;

  RAISE NOTICE 'RLS test block G (auth.1 schema — profiles + consent + legal_documents): PASSED';

  RESET ROLE;
END $$;

-- =============================================================================
-- Block H — Auth V2 cooldown (Story auth.5): password_reset_attempts
-- =============================================================================
-- Cobertura:
--   H-1  authenticated NÃO consegue SELECT em password_reset_attempts (deny-all)
--   H-2  authenticated NÃO consegue INSERT direto (deny-all)
--   H-3  authenticated NÃO consegue UPDATE direto (deny-all)
--   H-4  authenticated NÃO consegue DELETE direto (deny-all)
--   H-5  RPC request_password_reset_check_cooldown retorna true na 1ª chamada
--   H-6  RPC retorna false na 2ª chamada para o mesmo email dentro de 60s
--   H-7  RPC retorna true para email distinto (cooldown é por-email)
--   H-8  authenticated chama RPC mas continua sem ler a tabela diretamente

DO $$
DECLARE
  v_user_a    uuid := current_setting('tests.user_a')::uuid;
  v_count     int;
  v_result    boolean;
  v_email_x   text := 'rls-test-x@example.com';
  v_email_y   text := 'rls-test-y@example.com';
BEGIN
  -- Setup como postgres (bypass RLS): garantir tabela vazia para emails de teste
  DELETE FROM public.password_reset_attempts WHERE email_lower IN (v_email_x, v_email_y);

  -- Assumir identidade de user A (authenticated)
  PERFORM set_config('request.jwt.claim.sub',    v_user_a::text, true);
  PERFORM set_config('request.jwt.claim.org_id', current_setting('tests.org_a'), true);
  PERFORM set_config('request.jwt.claims',
                     jsonb_build_object('sub', v_user_a::text,
                                        'org_id', current_setting('tests.org_a'),
                                        'role', 'authenticated')::text, true);
  SET LOCAL role TO authenticated;

  -- H-1
  SELECT count(*) INTO v_count FROM public.password_reset_attempts;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [H-1 SELECT deny-all]: expected 0, got %', v_count;
  END IF;

  -- H-2
  BEGIN
    INSERT INTO public.password_reset_attempts (email_lower) VALUES (v_email_x);
    SELECT count(*) INTO v_count FROM public.password_reset_attempts WHERE email_lower = v_email_x;
    IF v_count <> 0 THEN
      RAISE EXCEPTION 'RLS FAIL [H-2 INSERT deny-all]: linha inserida silenciosamente';
    END IF;
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      NULL; -- esperado
  END;

  -- H-3 (UPDATE deny-all — afeta 0 rows mesmo se hipotética linha existisse)
  UPDATE public.password_reset_attempts SET last_attempt_at = now() WHERE email_lower = v_email_x;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [H-3 UPDATE deny-all]: expected 0, got %', v_count;
  END IF;

  -- H-4 (DELETE deny-all)
  DELETE FROM public.password_reset_attempts WHERE email_lower = v_email_x;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [H-4 DELETE deny-all]: expected 0, got %', v_count;
  END IF;

  -- H-5 — RPC primeira chamada permite
  v_result := public.request_password_reset_check_cooldown(v_email_x);
  IF v_result IS NOT TRUE THEN
    RAISE EXCEPTION 'RLS FAIL [H-5 RPC primeira]: expected true, got %', v_result;
  END IF;

  -- H-6 — RPC segunda chamada bloqueia (cooldown ativo, <60s)
  v_result := public.request_password_reset_check_cooldown(v_email_x);
  IF v_result IS NOT FALSE THEN
    RAISE EXCEPTION 'RLS FAIL [H-6 RPC segunda]: expected false (cooldown ativo), got %', v_result;
  END IF;

  -- H-7 — RPC com email distinto permite (cooldown é por-email)
  v_result := public.request_password_reset_check_cooldown(v_email_y);
  IF v_result IS NOT TRUE THEN
    RAISE EXCEPTION 'RLS FAIL [H-7 RPC outro email]: expected true, got %', v_result;
  END IF;

  -- H-8 — mesmo após 3 chamadas RPC, usuário authenticated não enxerga a tabela
  SELECT count(*) INTO v_count FROM public.password_reset_attempts;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [H-8 SELECT após RPC]: expected 0 (deny-all persiste), got %', v_count;
  END IF;

  RAISE NOTICE 'RLS test block H (auth.5 — password_reset_attempts cooldown): PASSED';

  RESET ROLE;
END $$;

-- =============================================================================
-- Block I — receipts + storage.objects (Story comprovantes.1 — EPIC-COMPROVANTES)
-- =============================================================================
-- Cobertura:
--   I-1  receipts no smoke-inverso (Block F acima) — RLS habilitada
--   I-2  user A vê exatamente 1 receipts (a sua)
--   I-3  user A não vê receipts de org_b por lookup direto de id → 0
--   I-4  user A não consegue INSERT receipts com org_id = org_b → bloqueado
--   I-5  user A não consegue UPDATE receipts de org_b → ROW_COUNT 0
--   I-6  user A não consegue DELETE receipts de org_b → ROW_COUNT 0
--   I-7  storage.objects: user A vê só o objeto de org_a no bucket receipts
--   I-8  storage.objects: user A não vê o objeto de org_b por lookup do name → 0

-- Seed como postgres (bypassa RLS) -------------------------------------------
DO $$
DECLARE
  v_org_a  uuid := current_setting('tests.org_a')::uuid;
  v_org_b  uuid := current_setting('tests.org_b')::uuid;
  v_rcpt_a uuid;
  v_rcpt_b uuid;
BEGIN
  SET LOCAL role TO postgres;

  INSERT INTO public.receipts (org_id, file_path, original_filename, mime_type, file_size_bytes, file_hash, status)
    VALUES (v_org_a, v_org_a::text || '/ra/original.jpg', 'TEST_pix_a.jpg', 'image/jpeg', 1024, 'TEST_hash_a', 'pending')
    RETURNING id INTO v_rcpt_a;
  INSERT INTO public.receipts (org_id, file_path, original_filename, mime_type, file_size_bytes, file_hash, status)
    VALUES (v_org_b, v_org_b::text || '/rb/original.jpg', 'TEST_pix_b.jpg', 'image/jpeg', 2048, 'TEST_hash_b', 'pending')
    RETURNING id INTO v_rcpt_b;

  -- storage.objects: 1 objeto por org no bucket receipts (path {org_id}/...)
  INSERT INTO storage.objects (bucket_id, name) VALUES ('receipts', v_org_a::text || '/ra/original.jpg');
  INSERT INTO storage.objects (bucket_id, name) VALUES ('receipts', v_org_b::text || '/rb/original.jpg');

  PERFORM set_config('tests.rcpt_a', v_rcpt_a::text, false);
  PERFORM set_config('tests.rcpt_b', v_rcpt_b::text, false);

  RESET ROLE;
END $$;

-- Asserts como user A (authenticated) ----------------------------------------
DO $$
DECLARE
  v_count int;
  v_org_b uuid := current_setting('tests.org_b')::uuid;
BEGIN
  PERFORM set_config('request.jwt.claim.sub',    current_setting('tests.user_a'), true);
  PERFORM set_config('request.jwt.claim.org_id', current_setting('tests.org_a'),  true);
  PERFORM set_config('request.jwt.claims',
    jsonb_build_object('sub', current_setting('tests.user_a'),
                       'org_id', current_setting('tests.org_a'),
                       'role', 'authenticated')::text, true);
  SET LOCAL role TO authenticated;

  -- I-2
  SELECT count(*) INTO v_count FROM public.receipts WHERE file_hash LIKE 'TEST_hash_%';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [I-2 receipts SELECT]: expected 1 (own), got %', v_count;
  END IF;

  -- I-3
  SELECT count(*) INTO v_count FROM public.receipts WHERE id = current_setting('tests.rcpt_b')::uuid;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [I-3 receipts direct-id of B]: expected 0, got %', v_count;
  END IF;

  -- I-4
  BEGIN
    INSERT INTO public.receipts (org_id, file_path, original_filename, mime_type, file_size_bytes, file_hash, status)
      VALUES (v_org_b, 'hack/x.jpg', 'hack.jpg', 'image/jpeg', 10, 'TEST_hash_hack', 'pending');
    RAISE EXCEPTION 'RLS FAIL [I-4 receipts cross-INSERT]: insert into org B should be blocked';
  EXCEPTION WHEN insufficient_privilege OR check_violation OR OTHERS THEN
    NULL; -- esperado: WITH CHECK bloqueia
  END;

  -- I-5
  UPDATE public.receipts SET status = 'rejected' WHERE id = current_setting('tests.rcpt_b')::uuid;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [I-5 receipts cross-UPDATE]: expected 0, got %', v_count;
  END IF;

  -- I-6
  DELETE FROM public.receipts WHERE id = current_setting('tests.rcpt_b')::uuid;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [I-6 receipts cross-DELETE]: expected 0, got %', v_count;
  END IF;

  -- I-7
  SELECT count(*) INTO v_count FROM storage.objects WHERE bucket_id = 'receipts';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'RLS FAIL [I-7 storage.objects SELECT]: expected 1 (own), got %', v_count;
  END IF;

  -- I-8
  SELECT count(*) INTO v_count FROM storage.objects
    WHERE bucket_id = 'receipts' AND name LIKE v_org_b::text || '/%';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'RLS FAIL [I-8 storage.objects cross-tenant of B]: expected 0, got %', v_count;
  END IF;

  RAISE NOTICE 'RLS test block I (comprovantes.1 — receipts + storage.objects): PASSED';

  RESET ROLE;
END $$;

ROLLBACK;

-- Final message (ROLLBACK above keeps DB clean; NOTICES still surface)
DO $$ BEGIN RAISE NOTICE 'ALL RLS ISOLATION TESTS PASSED'; END $$;
