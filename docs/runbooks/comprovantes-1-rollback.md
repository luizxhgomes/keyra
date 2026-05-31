# Runbook — Rollback de `comprovantes.1` (receipts + storage + source_type)

**Story:** `comprovantes.1` (EPIC-COMPROVANTES) · **Migrations:** `20260531000100_receipts.sql`, `20260531000200_transactions_source_type_document.sql`, `20260531000300_receipts_storage_bucket.sql`

As 3 migrations criam objetos novos e fazem **um `ALTER` aditivo** — nada destrutivo de dados de produção. O rollback é, portanto, simples e seguro **enquanto nenhuma `transactions` com `source_type='document'` tiver sido criada** (o que só acontece a partir de `comprovantes.4b`).

## Pré-condição de segurança

```sql
-- DEVE retornar 0 antes de reverter a migration 000200 (CHECK de source_type).
SELECT count(*) FROM public.transactions WHERE source_type = 'document';
```

Se > 0: NÃO reverter o CHECK de `source_type` (linhas com `'document'` violariam o CHECK antigo). Reverter só `000300` e `000100` nesse caso, ou tratar as linhas antes.

## Rollback (ordem inversa do apply)

```sql
-- Rollback 20260531000300 — bucket de Storage + policies
DROP POLICY IF EXISTS receipts_objects_select ON storage.objects;
DROP POLICY IF EXISTS receipts_objects_insert ON storage.objects;
DROP POLICY IF EXISTS receipts_objects_update ON storage.objects;
DROP POLICY IF EXISTS receipts_objects_delete ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'receipts';   -- só se o bucket estiver vazio

-- Rollback 20260531000200 — restaura o CHECK antigo de source_type (ver pré-condição)
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_source_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_source_type_check
  CHECK (source_type IS NULL OR source_type IN ('command','payment','invoice','manual','import'));

-- Rollback 20260531000100 — tabela receipts + trigger de auditoria
DROP TABLE IF EXISTS public.receipts CASCADE;          -- remove triggers e policies junto
DROP FUNCTION IF EXISTS public.trg_audit_receipts() CASCADE;
```

## Observações

- `DROP TABLE public.receipts CASCADE` remove os triggers (`receipts_set_updated_at`, `receipts_enforce_org_id`, `audit_receipts`) e a policy (`receipts_tenant_isolation`) junto.
- O `audit_log` já gravado para `resource_type='receipts'` **permanece** (append-only) — é histórico legítimo, não precisa ser limpo.
- Se houver binários no bucket antes do `DELETE FROM storage.buckets`, esvaziá-los primeiro (`purgeOrgStorage` ou via dashboard) — o `DELETE` falha se o bucket não estiver vazio.
