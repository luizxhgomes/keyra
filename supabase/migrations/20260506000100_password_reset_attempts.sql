-- =============================================================================
-- KEYRA — Migration: password_reset_attempts (cooldown anti-bombing)
-- =============================================================================
-- Story:    auth.5 do EPIC-AUTH-V2
-- Risco:    R14 da auditoria (`docs/audit/auth-v2-security-audit.md`) —
--           email-bombing via repetição rápida de pedidos de reset.
-- Decisão:  D2 (Turnstile) + cooldown 60s server-side por email destino.
-- Padrão:   Tabela mínima (PK email_lower + last_attempt_at) consultada via
--           RPC SECURITY DEFINER. Sem `org_id` — recurso é por-email, escopo
--           global do Supabase Auth (não tenant-scoped).
--
-- LGPD:     `email_lower` é PII de baixo risco (já presente em auth.users).
--           Sem IP, sem User-Agent, sem outras informações — minimização
--           Art. 6º III. Retenção operacional: limpeza periódica >24h fica
--           para job futuro Inngest (fora do escopo desta story).
-- =============================================================================

-- ---- 1) Tabela --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.password_reset_attempts (
  email_lower      text PRIMARY KEY,
  last_attempt_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.password_reset_attempts IS
  'Cooldown server-side por email destino para mitigar email-bombing (auditoria R14, EPIC-AUTH-V2 auth.5). Acesso exclusivo via RPC request_password_reset_check_cooldown.';

COMMENT ON COLUMN public.password_reset_attempts.email_lower IS
  'Email destino normalizado para lower-case (PK). Mantém uma linha por email histórico — limpeza >24h pode ser feita por job futuro.';

COMMENT ON COLUMN public.password_reset_attempts.last_attempt_at IS
  'Timestamp do último pedido aceito. Próximo pedido só passa após (now() - last_attempt_at) > 60s.';

-- ---- 2) RLS ------------------------------------------------------------------
-- Tabela é estritamente service-side (acesso via RPC). Bloqueio total pelo
-- caminho normal de SQL.
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_attempts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_all_select_authenticated ON public.password_reset_attempts;
CREATE POLICY deny_all_select_authenticated
  ON public.password_reset_attempts
  FOR SELECT
  TO authenticated, anon
  USING (false);

DROP POLICY IF EXISTS deny_all_insert_authenticated ON public.password_reset_attempts;
CREATE POLICY deny_all_insert_authenticated
  ON public.password_reset_attempts
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_all_update_authenticated ON public.password_reset_attempts;
CREATE POLICY deny_all_update_authenticated
  ON public.password_reset_attempts
  FOR UPDATE
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_all_delete_authenticated ON public.password_reset_attempts;
CREATE POLICY deny_all_delete_authenticated
  ON public.password_reset_attempts
  FOR DELETE
  TO authenticated, anon
  USING (false);

-- ---- 3) RPC de cooldown (SECURITY DEFINER) ----------------------------------
-- Retorna `true` se o pedido pode prosseguir (cooldown vencido OU primeira vez),
-- `false` se ainda está dentro da janela de 60s. INSERT/UPDATE atômico via
-- ON CONFLICT — evita race condition entre dois pedidos simultâneos.
CREATE OR REPLACE FUNCTION public.request_password_reset_check_cooldown(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_email_lower text;
  v_inserted    boolean;
BEGIN
  -- Normaliza email (defesa em profundidade — server-side já faz lower, mas
  -- garantimos aqui também).
  v_email_lower := lower(trim(p_email));

  IF v_email_lower IS NULL OR length(v_email_lower) = 0 THEN
    -- Email vazio/inválido — não acumula attempt, retorna true para que o
    -- caller siga o fluxo padrão (Supabase resetPasswordForEmail vai validar
    -- e silenciosamente descartar).
    RETURN true;
  END IF;

  -- Tenta inserir; se já existe, só atualiza se passou >60s.
  -- O RETURNING true só retorna linha quando UPDATE acontece (ou INSERT novo).
  -- Se UPDATE não rola (cooldown ativo), o RETURNING retorna 0 linhas →
  -- v_inserted permanece false.
  WITH upsert AS (
    INSERT INTO public.password_reset_attempts (email_lower, last_attempt_at)
    VALUES (v_email_lower, now())
    ON CONFLICT (email_lower) DO UPDATE
      SET last_attempt_at = now()
      WHERE password_reset_attempts.last_attempt_at < now() - interval '60 seconds'
    RETURNING true AS ok
  )
  SELECT COALESCE((SELECT ok FROM upsert), false) INTO v_inserted;

  RETURN v_inserted;
END;
$$;

COMMENT ON FUNCTION public.request_password_reset_check_cooldown(text) IS
  'Story auth.5 — cooldown server-side por email destino (60s). Retorna true se pedido pode prosseguir, false se cooldown ativo. Anti-enumeration: caller chama Supabase resetPasswordForEmail apenas se true; se false, retorna sucesso ao usuário sem disparar email (atacante não distingue cooldown de email inexistente).';

-- ---- 4) GRANTS --------------------------------------------------------------
-- Server Action chama via createServerClient (anon role) ou service-role.
-- Permitimos `anon` e `authenticated` executarem porque é a Server Action
-- que controla quando chamar — RLS bloqueia tudo, RPC SECURITY DEFINER faz
-- bypass controlado.
GRANT EXECUTE ON FUNCTION public.request_password_reset_check_cooldown(text)
  TO anon, authenticated, service_role;

-- ---- 5) Sanity check (opcional — não falha se não rodar) --------------------
-- Smoke transacional pós-apply (rodar manualmente):
--   BEGIN;
--   SELECT public.request_password_reset_check_cooldown('smoke@example.com');  -- true
--   SELECT public.request_password_reset_check_cooldown('smoke@example.com');  -- false (cooldown)
--   ROLLBACK;
