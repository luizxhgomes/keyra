-- =============================================================================
-- KEYRA — Migration 026: Auth V2 schema (profiles + user_consent_records +
--                       legal_documents + UNIQUE CNPJ + Auth Hook estendido +
--                       trigger on_auth_user_created + hook anti-descartáveis)
--
-- Story auth.1 do EPIC-AUTH-V2.
-- Auditoria preventiva: docs/audit/auth-v2-security-audit.md (R5, R6, R7, R9,
-- R10, R13, R19).
-- ADR-022: docs/architecture/ARCHITECTURE.md §11.2.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. UNIQUE INDEX parcial em organizations.cnpj (R7 — bloqueia duplicação)
-- -----------------------------------------------------------------------------
-- Pre-flight desta story confirmou zero CNPJ duplicado em prod (2026-05-03).
-- Index parcial permite múltiplos NULL (MEI sem CNPJ) e ignora soft-deleted.

CREATE UNIQUE INDEX IF NOT EXISTS organizations_cnpj_unique
  ON public.organizations (cnpj)
  WHERE cnpj IS NOT NULL AND deleted_at IS NULL;

COMMENT ON INDEX public.organizations_cnpj_unique IS
  'KEYRA Story auth.1 (R7): bloqueia duas clínicas se cadastrarem com mesmo CNPJ. Parcial — permite NULL múltiplos para MEI e ignora soft-deletes.';

-- -----------------------------------------------------------------------------
-- 2. Tabela profiles — dados pessoais do USER da plataforma KEYRA (não pacientes)
-- -----------------------------------------------------------------------------
-- Por-usuário, NÃO tenant-scoped (usuário pode pertencer a múltiplas
-- organizations via memberships). Trigger on_auth_user_created garante
-- invariante "todo auth.user tem profile" (R19).
--
-- phone_encrypted (bytea via pgp_sym_encrypt) cumpre NFR-SE-04 do PRD.
-- phone_last_four permite display mascarado sem decrypt.

CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text NULL CHECK (full_name IS NULL OR char_length(full_name) BETWEEN 2 AND 120),
  phone_encrypted bytea NULL,                  -- pgp_sym_encrypt (ADR-017)
  phone_last_four text NULL CHECK (phone_last_four IS NULL OR char_length(phone_last_four) = 4),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS
  'KEYRA EPIC-AUTH-V2 Story auth.1: dados pessoais do user da plataforma (não pacientes). Por-usuário, não tenant-scoped. PII (phone) encrypted via pgcrypto (NFR-SE-04 do PRD).';
COMMENT ON COLUMN public.profiles.phone_encrypted IS
  'KEYRA NFR-SE-04: telefone criptografado em repouso via pgp_sym_encrypt(text, COLUMN_ENCRYPTION_KEY). Decrypt apenas em Server Action sob necessidade.';
COMMENT ON COLUMN public.profiles.phone_last_four IS
  'KEYRA: últimos 4 dígitos em texto plano para display mascarado (ex: "(11) ****-1234"). Não considerado PII isoladamente.';

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
-- INSERT/DELETE bloqueados para authenticated:
--   INSERT só via trigger on_auth_user_created (SECURITY DEFINER) ou service_role.
--   DELETE cascade quando auth.users é deletado (cobre LGPD direito ao esquecimento via Sprint 9).

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 3. Tabela legal_documents — termos + privacidade versionados imutáveis
-- -----------------------------------------------------------------------------
-- Conteúdo dos termos NÃO é seedeado nesta story — auth.2 escreve v1.0.0
-- via migration nova. Esta story só cria o vaso.

CREATE TABLE IF NOT EXISTS public.legal_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text NOT NULL CHECK (type IN ('terms','privacy')),
  version         text NOT NULL,
  content_hash    text NOT NULL,
  content_md      text NOT NULL,
  published_at    timestamptz NOT NULL DEFAULT now(),
  deprecated_at   timestamptz NULL,
  UNIQUE (type, version)
);

COMMENT ON TABLE public.legal_documents IS
  'KEYRA EPIC-AUTH-V2 Story auth.1: Termos de Uso + Política de Privacidade versionados. CON-LG-04 do PRD. Imutável após publicação — atualização = nova versão.';
COMMENT ON COLUMN public.legal_documents.content_hash IS
  'SHA-256 (lowercase hex) do conteúdo content_md, para detectar tampering. auth.2 calcula no momento da publicação.';
COMMENT ON COLUMN public.legal_documents.deprecated_at IS
  'Quando uma versão é substituída, marcar este timestamp. Não deletar — preserva auditoria de aceite via user_consent_records.document_id.';

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
-- Não FORCE — ler termos é leitura pública para qualquer authenticated.

DROP POLICY IF EXISTS legal_documents_select_all ON public.legal_documents;

CREATE POLICY legal_documents_select_all ON public.legal_documents
  FOR SELECT TO authenticated
  USING (true);

-- INSERT/UPDATE/DELETE bloqueados para authenticated. Apenas service_role
-- (via migration ou RPC controlada) pode publicar/deprecar termos.

-- View conveniência: última versão não-deprecated por tipo.
DROP VIEW IF EXISTS public.legal_documents_current;
CREATE VIEW public.legal_documents_current
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (type)
  id, type, version, content_hash, content_md, published_at
FROM public.legal_documents
WHERE deprecated_at IS NULL
ORDER BY type, published_at DESC;

COMMENT ON VIEW public.legal_documents_current IS
  'KEYRA Story auth.1: última versão vigente de cada tipo legal (terms, privacy). security_invoker=true respeita RLS do consultante.';

-- -----------------------------------------------------------------------------
-- 4. Tabela user_consent_records — registro IMUTÁVEL de aceite (R9, R10, LGPD)
-- -----------------------------------------------------------------------------
-- LGPD Art. 9º §6º exige auditabilidade do consentimento — UPDATE/DELETE
-- pelo próprio usuário comprometeria evidência. Bloqueado por RLS.
--
-- ON DELETE RESTRICT em document_id: proibida exclusão de doc com aceites.

CREATE TABLE IF NOT EXISTS public.user_consent_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id  uuid NOT NULL REFERENCES public.legal_documents(id) ON DELETE RESTRICT,
  accepted_at  timestamptz NOT NULL DEFAULT now(),
  ip_address   inet NULL,
  user_agent   text NULL,
  UNIQUE (user_id, document_id)
);

COMMENT ON TABLE public.user_consent_records IS
  'KEYRA EPIC-AUTH-V2 Story auth.1: registro auditável imutável do aceite de Termos+Privacidade pelo usuário. CON-LG-04 do PRD. Imutável após gravado (LGPD Art. 9º §6º). Para revogar consentimento, criar registro NOVO em tabela futura user_consent_revocations (Sprint 9), nunca deletar.';

CREATE INDEX IF NOT EXISTS user_consent_records_user_id_idx
  ON public.user_consent_records (user_id);

ALTER TABLE public.user_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consent_records FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_consent_records_select_own ON public.user_consent_records;
DROP POLICY IF EXISTS user_consent_records_insert_own ON public.user_consent_records;
-- UPDATE/DELETE bloqueados universalmente (incluso para próprio user) — imutabilidade.

CREATE POLICY user_consent_records_select_own ON public.user_consent_records
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY user_consent_records_insert_own ON public.user_consent_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. Trigger on_auth_user_created — invariante "todo auth.user tem profile" (R19)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS
  'KEYRA Story auth.1 (R19): trigger handler que cria row mínima em profiles para cada novo auth.users. Demais campos (full_name, phone) preenchidos pelo signup flow ou pelo OAuth callback. ON CONFLICT DO NOTHING para idempotência.';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.handle_new_auth_user() TO supabase_auth_admin;
    GRANT INSERT ON public.profiles TO supabase_auth_admin;
  END IF;
END
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- 6. Auth Hook custom_access_token_hook estendido com full_name (R6, prepara auth.7)
-- -----------------------------------------------------------------------------
-- Adiciona claim full_name lendo de profiles. NÃO inclui phone (PII em JWT
-- vaza em logs/Sentry — D5 da auditoria). Backward-compatible: usuários
-- antigos sem profile continuam logando, só não recebem o claim.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  claims        jsonb := COALESCE(event->'claims', '{}'::jsonb);
  target_user   uuid  := (event->>'user_id')::uuid;
  resolved_org  uuid;
  v_full_name   text;
BEGIN
  -- Pick preferred active org if any
  SELECT up.active_org_id INTO resolved_org
    FROM public.user_preferences up
   WHERE up.user_id = target_user
     AND up.active_org_id IS NOT NULL;

  -- Fallback: oldest active membership
  IF resolved_org IS NULL THEN
    SELECT m.org_id INTO resolved_org
      FROM public.memberships m
     WHERE m.user_id = target_user
       AND m.deleted_at IS NULL
     ORDER BY m.created_at ASC
     LIMIT 1;
  END IF;

  IF resolved_org IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}', to_jsonb(resolved_org::text), true);
  END IF;

  -- Story auth.1 (R6, D5): full_name em claim para reconhecimento sem query
  -- extra. Phone NÃO incluído (vaza PII em logs).
  SELECT p.full_name INTO v_full_name
    FROM public.profiles p
   WHERE p.id = target_user;

  IF v_full_name IS NOT NULL THEN
    claims := jsonb_set(claims, '{full_name}', to_jsonb(v_full_name), true);
  END IF;

  RETURN jsonb_build_object('claims', claims);
END;
$$;

COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS
  'KEYRA ADR-012 + Story auth.1: Supabase Auth hook injetando org_id e full_name custom claims em todo JWT. Phone NÃO incluído por design (D5 — PII em headers vaza em logs).';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
    GRANT SELECT ON public.profiles TO supabase_auth_admin;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- 7. Hook before_user_created_block_disposable_emails (R13)
-- -----------------------------------------------------------------------------
-- Lista canônica de ~30 domínios de "throwaway email" services. NÃO bloqueia
-- provedores legítimos (gmail, outlook, icloud, hotmail, yahoo, uol, etc).
-- Hook precisa ser REGISTRADO via Management API após apply desta migration:
--   PATCH /v1/projects/{ref}/config/auth com:
--     hook_before_user_created_enabled = true
--     hook_before_user_created_uri = 'pg-functions://postgres/public/before_user_created_block_disposable_emails'
-- Script: scripts/configure-supabase-auth-hooks.sh

CREATE OR REPLACE FUNCTION public.before_user_created_block_disposable_emails(event jsonb)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  email_addr  text := lower(coalesce(event->'user_metadata'->>'email', event->>'email', ''));
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
  'KEYRA Story auth.1 (R13): Supabase Auth before_user_created hook que rejeita signups de domínios de email descartável conhecidos. Lista canônica de ~30 throwaway services. NÃO bloqueia provedores legítimos. Requer registro via Management API após apply.';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.before_user_created_block_disposable_emails(jsonb) TO supabase_auth_admin;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Fim da migration. ACs do Story auth.1 atendidos pela DDL acima:
--   AC1 profiles, AC2 legal_documents, AC3 user_consent_records,
--   AC4 organizations_cnpj_unique, AC5 trigger on_auth_user_created,
--   AC6 custom_access_token_hook estendido,
--   AC7 before_user_created_block_disposable_emails.
-- AC8 (suíte RLS) e AC9 (typegen) tratados em arquivos separados.
-- =============================================================================
