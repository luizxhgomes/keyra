-- =============================================================================
-- KEYRA: cadastro novo sem sessão
--
-- Com a confirmação de e-mail ativa (mailer_autoconfirm = false), o signUp não
-- devolve sessão. A RPC dependia de auth.uid(), recebia NULL e respondia
-- 'Authentication required', e todo cadastro pelo formulário falhava.
--
-- Agora o servidor informa o usuário recém-criado. Por isso, só service_role
-- executa a função: quem é anon ou authenticated não escolhe o p_user_id.
-- =============================================================================

DROP FUNCTION IF EXISTS public.signup_create_account_atomic(text, text, text, text, text, uuid, uuid, inet, text);

CREATE FUNCTION public.signup_create_account_atomic(
  p_user_id          uuid,
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
  v_org_id          uuid;
  v_phone_encrypted bytea;
  v_phone_last4     text;
BEGIN
  -- Para e-mail já cadastrado, o signUp devolve um id que não existe.
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = '22023';
  END IF;

  -- Cadastro repetido de e-mail ainda não confirmado: não altera nada.
  SELECT org_id INTO v_org_id
    FROM public.memberships
   WHERE user_id = p_user_id AND deleted_at IS NULL
   LIMIT 1;
  IF FOUND THEN
    RETURN v_org_id;
  END IF;

  IF p_phone_e164 IS NULL OR char_length(btrim(p_phone_e164)) < 8 THEN
    RAISE EXCEPTION 'Phone number is required' USING ERRCODE = '22023';
  END IF;

  IF p_encryption_key IS NULL OR p_encryption_key !~ '^[0-9a-fA-F]{64}$' THEN
    RAISE EXCEPTION 'Invalid encryption key (must be 64 hex chars / 256 bits)' USING ERRCODE = '22023';
  END IF;

  v_phone_encrypted := extensions.pgp_sym_encrypt(btrim(p_phone_e164), p_encryption_key);
  v_phone_last4     := right(regexp_replace(p_phone_e164, '\D', '', 'g'), 4);

  UPDATE public.profiles
     SET full_name       = btrim(p_full_name),
         phone_encrypted = v_phone_encrypted,
         phone_last_four = v_phone_last4,
         updated_at      = now()
   WHERE id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, full_name, phone_encrypted, phone_last_four)
      VALUES (p_user_id, btrim(p_full_name), v_phone_encrypted, v_phone_last4);
  END IF;

  -- create_organization_with_owner identifica a dona por auth.uid().
  -- O claim vale só nesta transação.
  PERFORM set_config('request.jwt.claim.sub', p_user_id::text, true);
  v_org_id := public.create_organization_with_owner(p_clinic_name, p_cnpj);

  INSERT INTO public.user_consent_records (user_id, document_id, ip_address, user_agent)
  VALUES (p_user_id, p_terms_doc_id, p_ip_address, p_user_agent),
         (p_user_id, p_privacy_doc_id, p_ip_address, p_user_agent)
  ON CONFLICT (user_id, document_id) DO NOTHING;

  RETURN v_org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.signup_create_account_atomic(uuid, text, text, text, text, text, uuid, uuid, inet, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.signup_create_account_atomic(uuid, text, text, text, text, text, uuid, uuid, inet, text) TO service_role;

NOTIFY pgrst, 'reload schema';
