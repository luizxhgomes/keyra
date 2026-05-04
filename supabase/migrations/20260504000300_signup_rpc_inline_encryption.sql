-- =============================================================================
-- KEYRA — Migration 030: signup_create_account_atomic com encryption inline
--
-- Story auth.3 do EPIC-AUTH-V2 — refactor pra receber phone plain + chave
-- de criptografia direto na RPC, em vez de exigir que o caller (Server Action)
-- chame pgp_sym_encrypt antes. Single RPC call, atomic, sem manipulação de
-- bytea no client.
--
-- A chave de criptografia (COLUMN_ENCRYPTION_KEY do app, 64 hex chars/256 bits)
-- viaja no payload da RPC criptografada pelo Supabase API (TLS 1.3). Não é
-- ideal — vault do Supabase seria melhor — mas é o approach simples e seguro
-- pra v1.0.0; vault pode evoluir em sprint futura.
-- =============================================================================

DROP FUNCTION IF EXISTS public.signup_create_account_atomic(text, bytea, text, text, text, uuid, uuid, inet, text);

CREATE OR REPLACE FUNCTION public.signup_create_account_atomic(
  p_full_name        text,
  p_phone_e164       text,
  p_encryption_key   text,
  p_clinic_name      text,
  p_cnpj             text,
  p_terms_doc_id     uuid,
  p_privacy_doc_id   uuid,
  p_ip_address       inet  DEFAULT NULL,
  p_user_agent       text  DEFAULT NULL
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp, extensions
AS $$
DECLARE
  v_uid             uuid := auth.uid();
  v_org_id          uuid;
  v_phone_encrypted bytea;
  v_phone_last4     text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_phone_e164 IS NULL OR char_length(btrim(p_phone_e164)) < 8 THEN
    RAISE EXCEPTION 'Phone number is required' USING ERRCODE = '22023';
  END IF;

  IF p_encryption_key IS NULL OR p_encryption_key !~ '^[0-9a-fA-F]{64}$' THEN
    RAISE EXCEPTION 'Invalid encryption key (must be 64 hex chars / 256 bits)' USING ERRCODE = '22023';
  END IF;

  -- Encryption: pgp_sym_encrypt produz bytea cifrado. Chave em hex string.
  v_phone_encrypted := extensions.pgp_sym_encrypt(btrim(p_phone_e164), p_encryption_key);
  v_phone_last4     := right(regexp_replace(p_phone_e164, '\D', '', 'g'), 4);

  -- 1. Update profile (row já existe via trigger on_auth_user_created)
  UPDATE public.profiles
     SET full_name       = btrim(p_full_name),
         phone_encrypted = v_phone_encrypted,
         phone_last_four = v_phone_last4,
         updated_at      = now()
   WHERE id = v_uid;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, full_name, phone_encrypted, phone_last_four)
      VALUES (v_uid, btrim(p_full_name), v_phone_encrypted, v_phone_last4);
  END IF;

  -- 2. Criar organização atomically (delega pra RPC existente)
  v_org_id := public.create_organization_with_owner(p_clinic_name, p_cnpj);

  -- 3. Registrar aceite imutável dos termos vigentes
  INSERT INTO public.user_consent_records (user_id, document_id, ip_address, user_agent)
  VALUES (v_uid, p_terms_doc_id, p_ip_address, p_user_agent),
         (v_uid, p_privacy_doc_id, p_ip_address, p_user_agent)
  ON CONFLICT (user_id, document_id) DO NOTHING;

  RETURN v_org_id;
END;
$$;

COMMENT ON FUNCTION public.signup_create_account_atomic(text, text, text, text, text, uuid, uuid, inet, text) IS
  'KEYRA Story auth.3: RPC unificada do signup. Recebe phone plain + encryption key, criptografa via pgp_sym_encrypt internamente, atualiza profile + cria org via create_organization_with_owner + registra aceite imutável de termos+privacy. Atomic: se falhar, transação rollback e caller compensating-delete o auth.users via service_role.';

GRANT EXECUTE ON FUNCTION public.signup_create_account_atomic(text, text, text, text, text, uuid, uuid, inet, text) TO authenticated;
