-- =============================================================================
-- KEYRA — Migration 029: RPC signup_create_account_atomic
--
-- Story auth.3 do EPIC-AUTH-V2 — RPC unificada que recebe os dados do form
-- de cadastro e faz TUDO em transação Postgres única:
--
--   1. UPDATE em public.profiles (set full_name + phone_encrypted +
--      phone_last_four). Row já existe — foi criada pelo trigger
--      on_auth_user_created (Story auth.1) quando o Server Action chamou
--      auth.signUp().
--   2. INSERT em public.organizations (via create_organization_with_owner,
--      que já gerencia membership + user_preferences + seed plano de contas).
--   3. INSERT em public.user_consent_records para terms + privacy v1.0.0.
--
-- Se qualquer step falhar, transação inteira ROLLBACK — auth.users criado
-- pelo signUp fica órfão e o caller (Server Action) DELETA via service_role
-- (compensating delete). Mitiga R4 da auditoria.
--
-- SECURITY DEFINER pra contornar RLS chicken-and-egg em organizations.
-- Autorização interna via auth.uid() — só o próprio user pode preencher
-- seu profile. Tampering protection.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.signup_create_account_atomic(
  p_full_name        text,
  p_phone_encrypted  bytea,
  p_phone_last_four  text,
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
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_org_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  -- 1. Update profile (row já existe pelo trigger on_auth_user_created)
  UPDATE public.profiles
     SET full_name       = p_full_name,
         phone_encrypted = p_phone_encrypted,
         phone_last_four = p_phone_last_four,
         updated_at      = now()
   WHERE id = v_uid;

  IF NOT FOUND THEN
    -- Edge case: trigger não rodou (bug ou race) — criar agora.
    INSERT INTO public.profiles (id, full_name, phone_encrypted, phone_last_four)
      VALUES (v_uid, p_full_name, p_phone_encrypted, p_phone_last_four);
  END IF;

  -- 2. Criar organização (delega pra RPC existente que faz membership +
  --    user_preferences + seed plano de contas em transação)
  v_org_id := public.create_organization_with_owner(p_clinic_name, p_cnpj);

  -- 3. Registrar aceite imutável dos termos vigentes
  INSERT INTO public.user_consent_records
    (user_id, document_id, ip_address, user_agent)
  VALUES
    (v_uid, p_terms_doc_id, p_ip_address, p_user_agent),
    (v_uid, p_privacy_doc_id, p_ip_address, p_user_agent)
  ON CONFLICT (user_id, document_id) DO NOTHING;

  RETURN v_org_id;
END;
$$;

COMMENT ON FUNCTION public.signup_create_account_atomic(text, bytea, text, text, text, uuid, uuid, inet, text) IS
  'KEYRA Story auth.3: RPC unificada do signup. Atualiza profile + cria org + registra aceite em uma transação. Se falhar, caller deve compensating-delete o auth.users via service_role.';

GRANT EXECUTE ON FUNCTION public.signup_create_account_atomic(text, bytea, text, text, text, uuid, uuid, inet, text) TO authenticated;
