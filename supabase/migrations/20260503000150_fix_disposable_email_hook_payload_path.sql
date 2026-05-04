-- =============================================================================
-- KEYRA — Migration 026.5: fix path do email no hook before_user_created
--
-- Story auth.1 do EPIC-AUTH-V2 — fix descoberto durante smoke pós-apply.
-- Bug: a versão original da função em 20260503000100 procurava o email em
--   event.email e event.user_metadata.email, mas o GoTrue (Supabase Auth)
--   envia o payload do before_user_created hook como:
--     {"user_id": "...", "metadata": {...}, "user": {"email": "...", ...}}
--   ou seja, event.user.email — caminho não coberto pela versão original.
--
-- Smoke detectou: signup com smoke-disposable-...@mailinator.com PASSOU
-- mesmo com hook habilitado (logs Auth: "msg":"Hook ran successfully",
-- "success":true). Cleanup imediato do user de teste foi feito.
--
-- Fix: cobrir os 3 paths conhecidos (event.user.email, event.email,
-- event.user_metadata.email) com COALESCE defensivo.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.before_user_created_block_disposable_emails(event jsonb)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  email_addr  text := lower(coalesce(
                       event->'user'->>'email',           -- formato real do GoTrue (descoberto via smoke)
                       event->'user_metadata'->>'email',  -- fallback (defensiva)
                       event->>'email',                    -- fallback (defensiva)
                       ''
                     ));
  email_domain text;
  disposable_domains text[] := ARRAY[
    'mailinator.com',
    '10minutemail.com', '10minutemail.net',
    'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
    'guerrillamailblock.com', 'sharklasers.com', 'grr.la',
    'tempmail.com', 'tempmail.net', 'temp-mail.org',
    'throwawaymail.com', 'getairmail.com', 'mailnesia.com',
    'mintemail.com', 'dispostable.com', 'fakeinbox.com',
    'mytrashmail.com', 'trashmail.com', 'trashmail.net',
    'yopmail.com', 'yopmail.net', 'mailcatch.com',
    'spamgourmet.com', 'mailtothis.com', 'deadaddress.com',
    'fakemailgenerator.com', 'getnada.com', 'jetable.org'
  ];
BEGIN
  IF email_addr = '' OR position('@' in email_addr) = 0 THEN
    RETURN '{}'::jsonb;
  END IF;

  email_domain := split_part(email_addr, '@', 2);

  IF email_domain = ANY(disposable_domains) THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 422,
        'message', 'Use um e-mail permanente para criar sua conta KEYRA. E-mails descartáveis não são aceitos.'
      )
    );
  END IF;

  RETURN '{}'::jsonb;
END;
$$;

COMMENT ON FUNCTION public.before_user_created_block_disposable_emails(jsonb) IS
  'KEYRA Story auth.1 (R13): Supabase Auth before_user_created hook que rejeita signups de domínios descartáveis. Lista canônica de ~30 throwaway services. Lê email com COALESCE de 3 paths (event.user.email, event.user_metadata.email, event.email) por defensiva descoberta via smoke 2026-05-04. NÃO bloqueia provedores legítimos.';
