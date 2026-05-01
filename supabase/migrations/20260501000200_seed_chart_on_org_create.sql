-- =============================================================================
-- KEYRA — Migration 024: seed do plano de contas ao criar organização
-- Story 3.2 — pré-requisito para registrar pagamentos.
--
-- Purpose:
--   1. Atualiza `create_organization_with_owner` para chamar
--      `seed_default_chart_of_accounts` automaticamente, garantindo que
--      qualquer org nova nasça com payment_methods + accounts + plano de
--      contas pronto.
--   2. Backfill nas orgs já existentes que ainda não têm payment_methods.
--
-- Note: a função `seed_default_chart_of_accounts` é idempotente (todos os
--       INSERTs usam `ON CONFLICT DO NOTHING`), então é seguro chamar
--       múltiplas vezes para a mesma org.
-- =============================================================================

-- Atualiza a RPC para sempre disparar o seed após criar a organização.
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  p_name  text,
  p_cnpj  text DEFAULT NULL
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_new_org_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_name IS NULL OR char_length(btrim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Organization name is required' USING ERRCODE = '22023';
  END IF;

  -- 1) Create the organization
  INSERT INTO public.organizations (name, cnpj, created_by)
    VALUES (btrim(p_name), NULLIF(btrim(p_cnpj), ''), v_uid)
    RETURNING id INTO v_new_org_id;

  -- 2) Create the owner membership
  INSERT INTO public.memberships (user_id, org_id, role, accepted_at)
    VALUES (v_uid, v_new_org_id, 'owner', now());

  -- 3) Upsert user_preferences to set this as active org + mark onboarding done
  INSERT INTO public.user_preferences (user_id, active_org_id, onboarding_done)
    VALUES (v_uid, v_new_org_id, true)
  ON CONFLICT (user_id) DO UPDATE
    SET active_org_id   = EXCLUDED.active_org_id,
        onboarding_done = true,
        updated_at      = now();

  -- 4) Seed plano de contas + payment_methods + accounts (idempotente)
  PERFORM public.seed_default_chart_of_accounts(v_new_org_id);

  RETURN v_new_org_id;
END;
$$;

COMMENT ON FUNCTION public.create_organization_with_owner(text, text) IS
  'KEYRA Story 1.2 + 3.2: atomic org+owner+seed creation.';

-- Backfill: aplica o seed em orgs existentes que ainda não têm payment_methods.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT o.id
      FROM public.organizations o
     WHERE o.deleted_at IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM public.payment_methods pm WHERE pm.org_id = o.id
       )
  LOOP
    PERFORM public.seed_default_chart_of_accounts(r.id);
  END LOOP;
END $$;
