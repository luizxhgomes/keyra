-- =============================================================================
-- KEYRA — Migration: transactions.source_type += 'document'
-- Story comprovantes.1 (AC5) — micro-migration aditiva
--
-- Purpose: habilitar o valor 'document' no CHECK de transactions.source_type.
--   comprovantes.4b insere transactions com source_type='document',
--   source_id=receipt.id. Sem este valor, confirmReceipt quebra no CHECK em
--   runtime (bloqueador B-1 do parecer arquitetural rev. 2).
-- Traceability: EPIC-COMPROVANTES-SPEC §4 (B-1), ADR-023.
--
-- Natureza: ADITIVA e retrocompatível. O novo conjunto é superconjunto do
--   antigo ('command','payment','invoice','manual','import'); nenhuma linha
--   existente é tocada nem invalidada. Migration SEPARADA da de receipts porque
--   toca uma tabela já em produção — isola o risco e o rollback.
--
-- Estado vigente (20260416001200_transactions.sql:41):
--   CHECK (source_type IS NULL OR source_type IN
--          ('command','payment','invoice','manual','import'))
-- =============================================================================

-- Descobre o nome real do CHECK de source_type (defesa contra naming
-- auto-gerado divergente) e o remove antes de recriar com a lista ampliada.
DO $$
DECLARE
  v_conname text;
BEGIN
  SELECT con.conname
    INTO v_conname
    FROM pg_constraint con
    JOIN pg_class      rel ON rel.oid = con.conrelid
    JOIN pg_namespace  nsp ON nsp.oid = rel.relnamespace
   WHERE nsp.nspname = 'public'
     AND rel.relname = 'transactions'
     AND con.contype = 'c'
     -- word-boundary: casa a coluna source_type sem risco de match parcial (M-3 do gate @data-engineer)
     AND pg_get_constraintdef(con.oid) ~ '\msource_type\M'
   LIMIT 1;

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.transactions DROP CONSTRAINT %I', v_conname);
  END IF;
END $$;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_source_type_check
  CHECK (source_type IS NULL
         OR source_type IN ('command','payment','invoice','manual','import','document'));

COMMENT ON COLUMN public.transactions.source_type IS
  'command | payment | invoice | manual | import | document. '
  '''document'' (EPIC-COMPROVANTES / comprovantes.4b): transação criada a partir '
  'de um comprovante revisado; source_id aponta para public.receipts.id.';
