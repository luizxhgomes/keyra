-- =============================================================================
-- KEYRA — Migration: bucket privado `receipts` + RLS em storage.objects
-- Story comprovantes.1 (AC6) — predicate validada no spike AC1 (VERDE)
--
-- Purpose: bucket privado para os binários dos comprovantes, isolado por org_id.
--   Caminho canônico: {org_id}/{receipt_id}/original.{ext} (+ normalized.txt).
--   O primeiro segmento do path (org_id) é o que as policies filtram contra o
--   claim JWT, via public.current_org_id() — exatamente o mecanismo provado no
--   spike (docs/spikes/comprovantes-1-storage-rls-spike.md).
-- Traceability: EPIC-COMPROVANTES-SPEC §5, CMP-C1, parecer A-1.
--
-- IMPORTANTE: NÃO fazemos ALTER TABLE storage.objects (ENABLE RLS etc.) — no
--   Supabase real storage.objects já vem com RLS habilitado e é owned por
--   supabase_storage_admin; um ALTER por postgres daria permission denied. Só
--   inserimos o bucket e criamos policies (fluxo SQL documentado do Supabase).
--   No ambiente de teste (postgres:17 vanilla) os stubs de storage habilitam
--   RLS no bootstrap (scripts/run-rls-tests.sh e .github/workflows/rls-tests.yml).
-- =============================================================================

-- Bucket privado (idempotente)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- 4 policies por operação em storage.objects, restritas ao bucket `receipts`,
-- filtrando o primeiro segmento do path ({org_id}) contra o claim.
DROP POLICY IF EXISTS receipts_objects_select ON storage.objects;
CREATE POLICY receipts_objects_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts'
         AND (storage.foldername(name))[1] = public.current_org_id()::text);

DROP POLICY IF EXISTS receipts_objects_insert ON storage.objects;
CREATE POLICY receipts_objects_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts'
              AND (storage.foldername(name))[1] = public.current_org_id()::text);

DROP POLICY IF EXISTS receipts_objects_update ON storage.objects;
CREATE POLICY receipts_objects_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'receipts'
         AND (storage.foldername(name))[1] = public.current_org_id()::text)
  WITH CHECK (bucket_id = 'receipts'
              AND (storage.foldername(name))[1] = public.current_org_id()::text);

DROP POLICY IF EXISTS receipts_objects_delete ON storage.objects;
CREATE POLICY receipts_objects_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'receipts'
         AND (storage.foldername(name))[1] = public.current_org_id()::text);
