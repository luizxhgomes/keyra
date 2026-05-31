-- =============================================================================
-- KEYRA — Verificação pós-apply de comprovantes.1 em PRODUÇÃO (keyra-br)
-- Fecha as 2 condições do gate @data-engineer (A-1 storage, A-2 trigger) + DoD.
--
-- Como rodar:
--   (a) via MCP supabase (após autenticar): cole cada bloco em execute_sql.
--   (b) via psql:
--       export PGPASSWORD=$(tr -d '\n' < .keyra-secrets/supabase-db-password.txt)
--       psql "host=aws-1-sa-east-1.pooler.supabase.com port=5432 \
--             user=postgres.oapdfhivzojyahvphebs dbname=postgres sslmode=require" \
--             -f scripts/verify-comprovantes-1-prod.sql
--
-- Os smokes B e C são transacionais (BEGIN/ROLLBACK) — NÃO deixam dado em prod.
-- =============================================================================

\echo '═══ A. SCHEMA (read-only) — receipts, RLS, trigger, CHECK, bucket, policies ═══'
SELECT 'receipts_rls'      AS item, relrowsecurity::text AS enabled, relforcerowsecurity::text AS forced
  FROM pg_class WHERE oid = 'public.receipts'::regclass;
SELECT 'receipts_policy'   AS item, policyname, cmd FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'receipts';
SELECT 'receipts_trigger'  AS item, tgname FROM pg_trigger
  WHERE tgrelid = 'public.receipts'::regclass AND NOT tgisinternal ORDER BY tgname;
SELECT 'source_type_check' AS item, pg_get_constraintdef(oid) AS def FROM pg_constraint
  WHERE conrelid = 'public.transactions'::regclass AND conname = 'transactions_source_type_check';
SELECT 'bucket'            AS item, id, public::text FROM storage.buckets WHERE id = 'receipts';
SELECT 'storage_policy'    AS item, policyname, cmd FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'receipts_objects_%'
  ORDER BY policyname;

\echo '═══ B. SMOKE A-2 — trigger audit_receipts minimaliza em prod (transacional) ═══'
BEGIN;
DO $$
DECLARE v_org uuid; v_rcpt uuid; v_audit int; v_leak int;
BEGIN
  INSERT INTO public.organizations (name) VALUES ('TMP_SMOKE_A2_rollback') RETURNING id INTO v_org;
  INSERT INTO public.receipts (org_id, file_path, original_filename, mime_type, file_size_bytes, file_hash, status, extraction_data, reviewed_data)
  VALUES (v_org, v_org::text || '/x/o.jpg', 'pix.jpg', 'image/jpeg', 1000, 'SMOKE_A2', 'pending',
    '{"gross_amount":"1500.00","counterparty":"Maria Silva","cpf":"123.456.789-00"}'::jsonb,
    '{"gross_amount":"1500.00","counterparty":"Maria Silva"}'::jsonb)
  RETURNING id INTO v_rcpt;
  UPDATE public.receipts SET status = 'needs_review' WHERE id = v_rcpt;

  SELECT count(*) INTO v_audit FROM public.audit_log WHERE resource_type = 'receipts' AND resource_id = v_rcpt;
  SELECT count(*) INTO v_leak  FROM public.audit_log WHERE resource_type = 'receipts' AND resource_id = v_rcpt
    AND (coalesce(before::text,'') || coalesce(after::text,'')) ~* '(counterparty|gross_amount|maria|cpf|1500)';

  IF v_audit <> 2 THEN RAISE EXCEPTION 'A-2 FAIL: audit rows=% (esperado 2)', v_audit; END IF;
  IF v_leak  <> 0 THEN RAISE EXCEPTION 'A-2 FAIL [LGPD]: % linha(s) de audit vazando PII/valor', v_leak; END IF;
  RAISE NOTICE 'A-2 OK: % linhas de audit, 0 vazamento — trigger minimaliza em prod', v_audit;
END $$;
ROLLBACK;

\echo '═══ C. SMOKE A-1 — isolamento real de storage.objects, 2 perspectivas (transacional) ═══'
-- Nota: usa SET LOCAL role authenticated. Se o role do pooler não permitir SET ROLE,
-- este bloco falha — nesse caso a prova de isolamento real fica para o smoke
-- end-to-end da idealizadora em comprovantes.4b (upload autenticado via API),
-- conforme a story delega (AC6.6). A validação A (policies existem) + o spike local
-- já cobrem o mecanismo.
BEGIN;
DO $$
DECLARE v_a uuid; v_b uuid; v_cnt int;
BEGIN
  INSERT INTO public.organizations (name) VALUES ('TMP_SMOKE_A1_a') RETURNING id INTO v_a;
  INSERT INTO public.organizations (name) VALUES ('TMP_SMOKE_A1_b') RETURNING id INTO v_b;
  INSERT INTO storage.objects (bucket_id, name) VALUES
    ('receipts', v_a::text || '/r/o.jpg'),
    ('receipts', v_b::text || '/r/o.jpg');

  PERFORM set_config('request.jwt.claims',
    jsonb_build_object('role','authenticated','org_id', v_a::text)::text, true);
  SET LOCAL role authenticated;

  SELECT count(*) INTO v_cnt FROM storage.objects WHERE bucket_id = 'receipts';
  IF v_cnt <> 1 THEN RAISE EXCEPTION 'A-1 FAIL: org A enxerga % objeto(s) (esperado 1, o seu)', v_cnt; END IF;
  SELECT count(*) INTO v_cnt FROM storage.objects WHERE bucket_id = 'receipts' AND name LIKE v_b::text || '/%';
  IF v_cnt <> 0 THEN RAISE EXCEPTION 'A-1 FAIL: org A enxerga objeto de org B (vazamento cross-tenant)'; END IF;

  RESET ROLE;
  RAISE NOTICE 'A-1 OK: isolamento real confirmado (storage.foldername + policy de produção)';
END $$;
ROLLBACK;

\echo '═══ FIM — sem ERROR acima = comprovantes.1 confirmada em produção ═══'
