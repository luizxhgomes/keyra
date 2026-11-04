-- Cadastro novo: a RPC roda sem sessão, porque o e-mail ainda não foi confirmado.
-- Só o servidor (service_role) pode chamá-la. Tudo termina em ROLLBACK.
BEGIN;
SET LOCAL client_min_messages TO WARNING;

CREATE TEMP TABLE t_ctx ON COMMIT DROP AS
SELECT gen_random_uuid() AS uid, gen_random_uuid() AS fantasma,
       (SELECT id FROM public.legal_documents_current WHERE type = 'terms') AS terms,
       (SELECT id FROM public.legal_documents_current WHERE type = 'privacy') AS privacy;
GRANT SELECT ON t_ctx TO anon, authenticated, service_role;

INSERT INTO auth.users (id, email) SELECT uid, uid || '@teste.keyra.invalid' FROM t_ctx;

-- 1. anon e authenticated não executam
DO $$
DECLARE c record; r text;
BEGIN
  SELECT * INTO c FROM t_ctx;
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    EXECUTE format('SET LOCAL ROLE %I', r);
    BEGIN
      PERFORM public.signup_create_account_atomic(c.uid, 'Teste', '+5511912345678', repeat('a', 64), 'Clínica', NULL, c.terms, c.privacy);
      RAISE EXCEPTION 'FALHOU: % executou a RPC de cadastro', r USING ERRCODE = 'P0001';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    RESET ROLE;
  END LOOP;
END $$;

-- 2. Usuário inexistente não vira conta (signUp devolve id falso para e-mail já cadastrado)
SET LOCAL ROLE service_role;
DO $$
DECLARE c record;
BEGIN
  SELECT * INTO c FROM t_ctx;
  BEGIN
    PERFORM public.signup_create_account_atomic(c.fantasma, 'Teste', '+5511912345678', repeat('a', 64), 'Clínica', NULL, c.terms, c.privacy);
    RAISE EXCEPTION 'FALHOU: aceitou usuário inexistente' USING ERRCODE = 'P0001';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
END $$;
RESET ROLE;

-- 3. service_role cria tudo, sem sessão e sem JWT de usuário
SET LOCAL ROLE service_role;
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
DO $$
DECLARE c record; v_org uuid; v_again uuid;
BEGIN
  SELECT * INTO c FROM t_ctx;
  v_org := public.signup_create_account_atomic(c.uid, 'Teste Cadastro', '+5511912345678', repeat('a', 64), 'Clínica Teste', NULL, c.terms, c.privacy, '127.0.0.1', 'teste');
  IF v_org IS NULL THEN RAISE EXCEPTION 'FALHOU: sem organização'; END IF;
  PERFORM set_config('app.teste_org', v_org::text, true);

  -- 4. Repetir o cadastro devolve a mesma clínica e não altera o perfil
  v_again := public.signup_create_account_atomic(c.uid, 'Invasor', '+5511900000000', repeat('a', 64), 'Outra', NULL, c.terms, c.privacy);
  IF v_again IS DISTINCT FROM v_org THEN RAISE EXCEPTION 'FALHOU: cadastro repetido criou outra clínica'; END IF;
END $$;
RESET ROLE;

DO $$
DECLARE c record; v_org uuid := current_setting('app.teste_org')::uuid; n int;
BEGIN
  SELECT * INTO c FROM t_ctx;
  SELECT count(*) INTO n FROM public.memberships WHERE user_id = c.uid AND org_id = v_org AND role = 'owner';
  IF n <> 1 THEN RAISE EXCEPTION 'FALHOU: vínculo de dona, %', n; END IF;
  SELECT count(*) INTO n FROM public.user_consent_records WHERE user_id = c.uid;
  IF n <> 2 THEN RAISE EXCEPTION 'FALHOU: aceites, %', n; END IF;
  SELECT count(*) INTO n FROM public.profiles WHERE id = c.uid AND full_name = 'Teste Cadastro' AND phone_encrypted IS NOT NULL AND phone_last_four = '5678';
  IF n <> 1 THEN RAISE EXCEPTION 'FALHOU: perfil'; END IF;
  SELECT count(*) INTO n FROM public.accounts WHERE org_id = v_org;
  IF n = 0 THEN RAISE EXCEPTION 'FALHOU: plano de contas'; END IF;
  RAISE NOTICE 'SIGNUP ATOMIC: TODOS OS TESTES PASSARAM';
END $$;

ROLLBACK;
