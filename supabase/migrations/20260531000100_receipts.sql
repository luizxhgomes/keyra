-- =============================================================================
-- KEYRA — Migration: receipts (EPIC-COMPROVANTES / Phase 7.0)
-- Story comprovantes.1 — @data-engineer (Dara) + @aiox-master (Orion)
--
-- Purpose: tabela-estágio entre o arquivo anexado e o ledger (`transactions`).
--   Camila anexa um comprovante (qualquer formato) → IA extrai → ela revisa →
--   vira `transactions`. Esta tabela guarda o arquivo, a extração da IA, a
--   revisão humana e o `transaction_id` resultante.
-- Traceability: ADR-023 (provider lock + arquitetura), EPIC-COMPROVANTES-SPEC §4,
--               COMPLIANCE-AUDIT CMP-C1 (isolamento), CMP-A3 (audit minimalista),
--               CMP-M4 (rastreabilidade do actor).
--
-- Decisões desta migration:
--   - RLS: policy catch-all `receipts_tenant_isolation` FOR ALL via
--     public.current_org_id() — espelha o padrão vivo das 16 tabelas
--     tenant-scoped (20260416001700_rls_policies.sql:122). A SPEC §4 sugeria 4
--     policies com auth.jwt() inline; alinhamos ao helper canônico (decisão do
--     gate @data-engineer; predicate validada no spike AC1 — VERDE).
--   - Auditoria: trigger DEDICADO `audit_receipts` (só `status`), NUNCA o
--     trigger universal `trg_audit_row_change` (que gravaria o jsonb inteiro,
--     vazando extraction_data/reviewed_data — viola LGPD Art. 6º III).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.receipts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by           uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Arquivo original (binário vive no bucket privado `receipts`)
  file_path             text   NOT NULL,                  -- {org_id}/{receipt_id}/original.{ext}
  original_filename     text   NOT NULL,
  mime_type             text   NOT NULL,                   -- MIME real (magic bytes), não a extensão
  file_size_bytes       bigint NOT NULL CHECK (file_size_bytes > 0),
  file_hash             text   NOT NULL,                   -- sha256 hex — idempotência por org

  -- Normalização (o que foi preparado para a IA ler)
  normalized_kind       text   NULL CHECK (normalized_kind IS NULL OR normalized_kind IN ('image','pdf','text')),

  -- Ciclo de vida
  status                text   NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','processing','needs_review','confirmed','rejected','failed')),

  -- Extração da IA
  extraction_data       jsonb         NULL,                -- objeto validado pelo Zod schema (SPEC §7)
  extraction_raw_text   text          NULL,                -- texto bruto lido pela IA
  extraction_confidence numeric(4,3)  NULL CHECK (extraction_confidence IS NULL
                                                  OR extraction_confidence BETWEEN 0 AND 1),
  extraction_model      text          NULL,                -- ex.: 'openai/gpt-4o-mini'
  extraction_error      text          NULL,

  -- Revisão humana (a IA propõe, o humano decide)
  reviewed_data         jsonb         NULL,                -- o que o humano confirmou/corrigiu
  reviewed_by           uuid          NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at           timestamptz   NULL,

  -- Ligação ao ledger
  transaction_id        uuid          NULL REFERENCES public.transactions(id) ON DELETE SET NULL,

  -- Auditoria
  created_at            timestamptz   NOT NULL DEFAULT now(),
  updated_at            timestamptz   NOT NULL DEFAULT now(),
  deleted_at            timestamptz   NULL,

  -- Idempotência: o mesmo binário (sha256) não cria linha nova na mesma org.
  CONSTRAINT receipts_org_hash_unique UNIQUE (org_id, file_hash)
);

COMMENT ON TABLE public.receipts IS
  'KEYRA EPIC-COMPROVANTES (ADR-023): estágio entre o arquivo anexado e o ledger. '
  'Captura → normalização → extração IA → revisão humana → transactions. '
  'Auditoria via trigger dedicado audit_receipts (só status — LGPD Art. 6º III).';
COMMENT ON COLUMN public.receipts.uploaded_by IS
  'ON DELETE SET NULL (CMP-M4): a saída de um funcionário não apaga o comprovante; '
  'a trilha de quem mudou o estado persiste em audit_log via trigger audit_receipts.';
COMMENT ON COLUMN public.receipts.reviewed_by IS
  'ON DELETE SET NULL (CMP-M4): preserva o comprovante mesmo que o revisor seja excluído.';
COMMENT ON COLUMN public.receipts.file_hash IS
  'sha256 hex do binário original. UNIQUE(org_id, file_hash) garante idempotência por org.';

CREATE INDEX IF NOT EXISTS receipts_org_status_idx
  ON public.receipts (org_id, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS receipts_transaction_idx
  ON public.receipts (transaction_id) WHERE transaction_id IS NOT NULL;

-- Triggers reaproveitando funções helper existentes (20260416000200_helper_functions.sql)
DROP TRIGGER IF EXISTS receipts_set_updated_at ON public.receipts;
CREATE TRIGGER receipts_set_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS receipts_enforce_org_id ON public.receipts;
CREATE TRIGGER receipts_enforce_org_id
  BEFORE UPDATE OF org_id ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- RLS — isolamento por org_id (padrão vivo: catch-all FOR ALL via current_org_id)
-- -----------------------------------------------------------------------------
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS receipts_tenant_isolation ON public.receipts;
CREATE POLICY receipts_tenant_isolation ON public.receipts
  FOR ALL TO authenticated
  USING (org_id = public.current_org_id())
  WITH CHECK (org_id = public.current_org_id());

-- Grant explícito (ALTER DEFAULT PRIVILEGES da migration 017 já cobre tabelas
-- futuras; mantemos explícito para clareza e independência de ordem).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipts TO authenticated;

-- -----------------------------------------------------------------------------
-- Auditoria DEDICADA — só transição de status, nunca conteúdo (CMP-A3 / LGPD)
-- receipts NÃO entra na lista hardcoded do trigger universal trg_audit_row_change.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_audit_receipts()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_org_id uuid;
  v_id     uuid;
  v_before jsonb;
  v_after  jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_org_id := OLD.org_id; v_id := OLD.id;
    v_before := jsonb_build_object('status', OLD.status);
    v_after  := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    v_org_id := NEW.org_id; v_id := NEW.id;
    v_before := jsonb_build_object('status', OLD.status);
    v_after  := jsonb_build_object('status', NEW.status);
  ELSE -- INSERT
    v_org_id := NEW.org_id; v_id := NEW.id;
    v_before := NULL;
    v_after  := jsonb_build_object('status', NEW.status);
  END IF;

  -- Minimização: APENAS metadados de status. Proibido copiar extraction_data,
  -- reviewed_data, extraction_raw_text, file_path ou qualquer outra coluna.
  INSERT INTO public.audit_log (org_id, user_id, action, resource_type, resource_id, before, after)
  VALUES (v_org_id, auth.uid(), lower(TG_OP), 'receipts', v_id, v_before, v_after);

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.trg_audit_receipts() IS
  'KEYRA CMP-A3 (LGPD Art. 6º III — minimização): auditoria de receipts registra '
  'só a transição de status; NUNCA o conteúdo extraído (extraction_data, '
  'reviewed_data, file_path). receipts é excluída do trigger universal de propósito.';

DROP TRIGGER IF EXISTS audit_receipts ON public.receipts;
CREATE TRIGGER audit_receipts
  AFTER INSERT OR UPDATE OR DELETE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.trg_audit_receipts();
