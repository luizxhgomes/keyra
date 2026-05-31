# Retomada — Jornada EPIC-COMPROVANTES (`.1 → .4b`) · 2026-05-31

> **Como usar este documento:** ao reabrir a sessão (após autenticar o MCP `supabase`), leia este arquivo + `docs/STATE.md`. Ele diz exatamente onde paramos, o que falta e os comandos prontos para retomar.

## Mandato da sessão (idealizador: Luiz)

Configurar o banco para receber/tratar dados de qualquer formato (jornada banco↔UI), **recorte: jornada inteira `.1 → .4b`**, **alcance: aplicar em produção**. Validar com skill `senior-backend` + agentes de gate. Aterrado no **EPIC-COMPROVANTES (Phase 7.0)** — já planejado e validado (PR #34).

## Branch

`feat/comprovantes-1-receipts-schema` (partiu de `main`). Trabalho da `.1` **commitado localmente** (sem push — `@devops` + remote a resolver, ver Pendências).

---

## ✅ Concluído nesta sessão (`comprovantes.1` — fundação de banco)

| # | Entrega | Evidência |
|---|---------|-----------|
| 1 | **Spike RLS de Storage (gate duro)** | 🟢 VERDE — `scripts/spike-storage-rls.sh` + `docs/spikes/comprovantes-1-storage-rls-spike.md`. org_a vê 1, org_b vê 1, sem-claim vê 0. |
| 2 | **3 migrations** | `20260531000100_receipts.sql` (tabela+RLS+índices+trigger `audit_receipts`), `…000200_…source_type_document.sql` (CHECK += `'document'`), `…000300_…storage_bucket.sql` (bucket privado + 4 policies). |
| 3 | **Suíte RLS estendida** | Block I (I-1..I-8: receipts + storage.objects) + `'receipts'` no smoke-inverso (Block F). Stubs de `storage` no bootstrap de `run-rls-tests.sh` **e** `.github/workflows/rls-tests.yml`. |
| 4 | **`run-rls-tests.sh` local** | 🟢 PASS — "TODOS OS TESTES RLS PASSARAM" (inclui Block I). |
| 5 | **Smoke trigger `audit_receipts`** | 🟢 `audit_log` = só `{status}`, zero vazamento de `extraction_data`/PII (LGPD Art. 6º III). |
| 6 | **Gate `@data-engineer` (Dara)** | 🟢 **APPROVE** + 2 condições pós-apply (A-1, A-2 — abaixo). M-1 (runbook) e M-3 (word-boundary) já fechados. |
| 7 | **Gate `@compliance-br` (Têmis)** | 🟢 **APPROVE** — CMP-C1/A3/A5/M4 resolvidos e verificados no código. |
| 8 | **`supabase db push`** | 🟢 **APLICADO EM PRODUÇÃO** (`keyra-br`). `migration list` confirma `20260531000100/200/300` no remoto. |
| 9 | Contrato `purgeOrgStorage` (AC7) | SPEC §12.1 + `TD-CMP-003` reclassificado para "rastreado". |
| 10 | Runbook de rollback (AC M-1) | `docs/runbooks/comprovantes-1-rollback.md`. |

---

## ⏳ PENDENTE IMEDIATO — fechar a `.1` (retomar AQUI)

A `.1` está **aplicada em prod e validada localmente**. Falta só **confirmar em produção** (as 2 condições da Dara) + regenerar tipos. **Passos exatos:**

### 1. Confirmar que o MCP `supabase` autenticou
```
/mcp   →  supabase deve aparecer ✓ Connected (não "Pending approval")
```
Os tools `mcp__supabase__execute_sql`, `…__list_tables`, `…__get_advisors` devem ficar disponíveis.

### 2. Rodar a verificação pós-apply
**Via MCP** (preferido): abrir `scripts/verify-comprovantes-1-prod.sql` e colar cada bloco (A schema / B smoke A-2 / C smoke A-1) em `mcp__supabase__execute_sql`.
**Via psql** (fallback): 
```bash
export PGPASSWORD=$(tr -d '\n' < .keyra-secrets/supabase-db-password.txt)
psql "host=aws-1-sa-east-1.pooler.supabase.com port=5432 user=postgres.oapdfhivzojyahvphebs dbname=postgres sslmode=require" -f scripts/verify-comprovantes-1-prod.sql
```
Esperado: A mostra receipts RLS=t/forced=t, 1 policy, 4 triggers (`audit_receipts`, `receipts_enforce_org_id`, `receipts_set_updated_at` + 1 do FK), CHECK com `document`, bucket public=f, 4 storage policies. B/C: `OK` sem ERROR.

### 3. `get_advisors` (security) via MCP — confirmar zero novo alerta de RLS em `receipts`.

### 4. Regenerar tipos + validar
```bash
pnpm typegen   # adiciona receipts + 'document' a apps/web/src/types/database.types.ts
pnpm typecheck && pnpm lint --max-warnings 0
```

### 5. Marcar `comprovantes.1` Done
- Anexar pareceres Dara + Têmis ao Change Log da story `docs/stories/comprovantes.1.story.md`.
- Atualizar checkboxes/DoD da story.
- Sync `docs/STATE.md` (linha EPIC-COMPROVANTES → `.1` Done).

---

## 🔜 Próximas stories (jornada `.2 → .4b`)

| Story | Foco | Bloqueios/pré-requisitos |
|-------|------|--------------------------|
| `comprovantes.2` | Ingestão multi-formato + normalização. **Spike obrigatório TD-CMP-008** (rasterização PDF serverless). | Depende `.1` ✅ |
| `comprovantes.0` | Política v1.1.0 + re-aceite forçado. | **Bloqueia `.3` em prod** (critério de saída do EPIC). Paralelo a `.1/.2`. |
| `comprovantes.3` | Pipeline LLM (`gpt-4o-mini` via AI Gateway) + Zod + cron sweep. | Precisa **`AI_GATEWAY_API_KEY`** (env nova, provisionar no Vercel — `@devops`). `.0` Done antes de ir a prod. |
| `comprovantes.4a` | UI lista + upload + `ReceiptCard`. Gate RSC G5. | Decidir se traz o catálogo shadcn (`bab4fcc`, só na branch `feat/shadcn-ui-catalogo-completo`, não em `main`). |
| `comprovantes.4b` | Tela de revisão + registro em `transactions`. Gates `@finance-domain-expert` + RSC G5. | Depende `.3` + `.4a`. |

---

## ⚠️ Pendências/decisões abertas (não perder)

1. **Remote git quebrado:** `git fetch` retorna `Repository not found` para `luizxhgomes/keyra`. **Push/PR/deploy Vercel afetados** — resolver com `@devops` (novo remote? repo renomeado?) antes do fechamento. O `db push` (Supabase) NÃO depende disso e já foi feito.
2. **`AI_GATEWAY_API_KEY`** — necessária para `.3`. Provisionar no Vercel (3 targets) via `@devops`.
3. **`comprovantes.0`** (Política v1.1.0 + re-aceite) é **gate de compliance inegociável** antes de `.3` ir a prod com comprovantes reais (CMP-A1/A2).
4. **`purgeOrgStorage`** (TD-CMP-003) — implementação obrigatória antes do **go-live** do EPIC (CMP-A5). Contrato já cravado.
5. **Smoke real mobile** da idealizadora (anexar Pix + boleto → virar `transactions` no DRE) é critério de Done de `.4b`/EPIC (regra 4 RSC — build verde ≠ funcional).
6. **CONCERNS de compliance propagados:** `.2` strip EXIF (CMP-M1); `.3` scrubbing Sentry de `extraction_data`/`signed_url` (CMP-A4); `.4b` render só do normalizado + anti-PAN no prompt (CMP-M2/B1).

## Infra/credenciais úteis

- **Projeto Supabase:** `keyra-br` / ref `oapdfhivzojyahvphebs` / Postgres 17.6 / sa-east-1.
- **Pooler:** `aws-1-sa-east-1.pooler.supabase.com:5432` (session mode) · senha em `.keyra-secrets/supabase-db-password.txt`.
- **MCP:** `.mcp.json` (project scope) → `mcp.supabase.com` com `project_ref` + features database/storage/branching/debugging/functions.
- **Tasks da sessão** (TaskCreate): #1-#4 = `.1` (1-3 done, 4 quase); #5=`.2`, #6=`.0`, #7=`.3`, #8=`.4a`, #9=`.4b`, #10=fechamento. (Recriar se a sessão reiniciar.)
