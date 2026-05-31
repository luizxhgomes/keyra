# Spike — comprovantes.1 / AC1 — RLS por `org_id` em `storage.objects`

**Veredito: 🟢 VERDE** · **Data:** 2026-05-31 · **Autor:** `@aiox-master` (Orion) · **Gate:** duro (bloqueia AC2–AC8 se VERMELHO)

## Pergunta do spike

O KEYRA nunca usou Supabase Storage — as 21 tabelas auditadas vivem todas em `public.*` e filtram por `org_id` via claim JWT. **Não estava garantido** que o claim `org_id` (injetado pelo Auth Hook `custom_access_token_hook`) chegasse ao contexto de avaliação de uma policy em `storage.objects` (outro schema, outro modelo de policy). Construir a migration de bucket sobre essa premissa não verificada é o "segundo bloqueador latente" do parecer arquitetural A-1.

## Procedimento

Ambiente efêmero `postgres:17` + **stubs fiéis** do schema `storage` (`buckets`, `objects`, `foldername()`) — nunca produção. Script reexecutável: [`scripts/spike-storage-rls.sh`](../../scripts/spike-storage-rls.sh).

1. Criar bucket `receipts` (`public = false`) + 2 objetos: `{org_a}/r-a/original.jpg` e `{org_b}/r-b/original.jpg` (seed como `postgres`, bypassa RLS).
2. `ENABLE` + `FORCE ROW LEVEL SECURITY` em `storage.objects`.
3. Policy filtrando o **primeiro segmento do path** (`(storage.foldername(name))[1]`) contra o claim.
4. Impersonar `authenticated` com `request.jwt.claims` contendo `org_id = org_a` (mesmo mecanismo do `rls_isolation.test.sql`).
5. Verificar isolamento + cross-tenant INSERT bloqueado.

Testadas **duas predicates candidatas**:
- **A)** `(storage.foldername(name))[1] = public.current_org_id()::text` — helper canônico (padrão vivo de `public`)
- **B)** `(storage.foldername(name))[1] = (auth.jwt() ->> 'org_id')` — DDL de referência do AC6

## Saída observada (contagens)

| Perspectiva (role `authenticated`) | Objetos visíveis no bucket `receipts` | Esperado |
|------------------------------------|---------------------------------------|----------|
| `postgres` (superuser — bypassa RLS) | 2 (total real) | — |
| `org_a` (`11111111-…`) | **1** (só `11111111…`) | 1 ✅ |
| `org_b` (`22222222-…`) | **1** (só `22222222…`) | 1 ✅ |
| sem claim `org_id` | **0** | 0 ✅ (deny — invariante #1) |
| `org_a` → INSERT em `{org_b}/…` | **bloqueado** (`check_violation`) | bloqueado ✅ |

Ambos os cenários (A e B) passaram sem `EXCEPTION` — com `ON_ERROR_STOP=1` + `set -e`, qualquer falha de isolamento abortaria o script antes do fim.

## Veredito e decisão

🟢 **VERDE.** O claim `org_id` resolve no contexto de policy de `storage.objects` exatamente como em `public.*`. RLS em `storage.objects` é avaliado pelo mesmo motor do Postgres; `current_org_id()` (SECURITY DEFINER STABLE) lê as mesmas GUCs `request.jwt.*`.

**Predicate canônica escolhida: A — `public.current_org_id()::text`** — consistência com as 16 tabelas tenant-scoped vivas (`<tabela>_tenant_isolation`). A `.1` prossegue para AC2–AC8 (bucket via `current_org_id()`).

## Implicação para a suíte de teste (AC8) e CI

O `run-rls-tests.sh` e o CI sobem `postgres:17` **vanilla** — sem o schema `storage`. Para a migration de bucket (`*_receipts_storage_bucket.sql`) e os asserts I-7/I-8 rodarem, o **bootstrap do ambiente de teste recebe stubs de `storage`** (`buckets`, `objects`, `foldername()`), no mesmo lugar onde já cria os stubs de `auth`. No Supabase real esses objetos já existem (gerenciados pela plataforma) — a migration de bucket nunca cria tabelas/funções de `storage`, só faz `INSERT` do bucket + `CREATE POLICY`.

## Escopo NÃO coberto (validado em outras stories)

O spike prova o **mecanismo de policy** (filtro por path segment vs claim). A integração end-to-end com o storage-api real (upload via API, signed URL ≤ 60 s) é exercida em `comprovantes.2`/`.3`/`.4b` e confirmada no smoke real (regra 4 RSC).
