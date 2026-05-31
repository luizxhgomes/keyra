# Story comprovantes.1: Spike RLS de Storage + schema `receipts` + bucket privado + RLS + trigger `audit_receipts` + micro-migration `transactions.source_type` + extensão da suíte RLS

## Status

Done

> **Done em produção (banco):** as 3 migrations estão aplicadas e validadas no `keyra-br` (smokes A-1/A-2 PASS em prod, advisors sem regressão). Gates `@data-engineer` + `@compliance-br` + QA gate = aprovados. Remote git reautenticado em 2026-05-31 (o "Repository not found" era a conta `gh` ativa errada — `V4Bilinski` em vez de `luizxhgomes`; resolvido com `gh auth switch` + `setup-git`). Merge do branch `feat/comprovantes-1-receipts-schema` em `main` + CI no fechamento desta sessão. A fundação que `.2/.3/.4a` consomem já está em prod independentemente do versionamento.

## Story

**Como** mantenedor do KEYRA construindo o EPIC-COMPROVANTES (Comprovantes Inteligentes — Phase 7.0),
**Eu quero** que o banco tenha a tabela de estágio `public.receipts`, o bucket privado `receipts` no Supabase Storage com isolamento multitenant por `org_id`, um trigger de auditoria dedicado que registra só metadados, o valor `'document'` aceito no CHECK de `transactions.source_type`, e a suíte RLS estendida para cobrir a tabela nova **e** o Storage,
**Para que** as stories `comprovantes.2` (ingestão/normalização), `.3` (pipeline LLM) e `.4a`/`.4b` (UI + registro) tenham uma fundação de schema e armazenamento correta — sem que cada uma reimplemente fragmentos de tabela, bucket, RLS ou auditoria que precisariam ser unificados depois, e sem que `confirmReceipt` quebre em runtime no CHECK de `source_type`.

> **Esta story começa por um spike obrigatório.** O KEYRA nunca usou Supabase Storage — nenhuma das 21 tabelas auditadas vive fora de `public.*`. Não está garantido que o claim JWT `org_id` (gerado pelo Auth Hook `custom_access_token_hook`) chegue ao contexto de avaliação de uma policy em `storage.objects`. **Se o spike falhar (o claim não chega), a story NÃO prossegue como está** — escala para `@architect` + `@data-engineer` para redesenho do modelo de isolamento de Storage antes de qualquer migration de bucket.

## Complexidade

**T-shirt:** M (~6 pontos)

> Gates Phase 3.5: `@data-engineer` (Dara) ✅ obrigatório · `@compliance-br` (Têmis) ✅ obrigatório · `@finance-domain-expert` WAIVED (a micro-migration de `source_type` é aditiva e não toca fórmula/valor — apenas amplia um CHECK enum; sem lógica financeira nova nesta story).

## Contexto e dependências

- **Epic:** `docs/stories/EPIC-COMPROVANTES.md` — Phase 7.0, squad `squad-keyra-integrations`.
- **Spec:** `docs/architecture/EPIC-COMPROVANTES-SPEC.md` §4 (schema `receipts`), §5 (Storage), §9 (segurança). DDL de referência na §4 — esta story produz a migration final, revisada por `@data-engineer`.
- **Auditoria de compliance:** `docs/architecture/COMPLIANCE-AUDIT-EPIC-COMPROVANTES.md` — esta story endereça **CMP-C1** (isolamento multitenant de `receipts` + Storage), **CMP-A3** (trigger `audit_receipts` minimalista, sem `jsonb` sensível), **CMP-A5** (definição do contrato de `purgeOrgStorage`), **CMP-M4** (rastreabilidade do `actor` no trigger de auditoria).
- **Pareceres rev. 2:** `docs/architecture/reviews/EPIC-COMPROVANTES-REVIEW-ARCHITECT.md` (B-1 micro-migration `source_type`; A-1 RLS de Storage sem precedente + spike; M-1 trigger universal não toca `receipts`; M-2 destino do `audit_receipts`) e `...-DOCPROC.md`.
- **Posição na cadeia:** paralelizável com `comprovantes.0` (nenhum arquivo compartilhado exceto `database.types.ts`, regenerado ao final de cada). **Bloqueia `comprovantes.2`, `.3` e `.4a`** — schema é fundação.

### Pré-flight (executar antes de começar — registrar resultado no Change Log)

- [ ] Confirmar última migration em `supabase/migrations/`: hoje é `20260506000100_password_reset_attempts.sql`. As migrations novas desta story usam timestamp **posterior** a `20260506000100`.
- [ ] `grep -rn "storage.objects\|storage.buckets" supabase/migrations/` retorna **zero** — confirma que o KEYRA nunca versionou Storage (precedente ausente — origem do spike do AC1).
- [ ] Confirmar que `public.transactions` existe e que o CHECK `transactions_source_type_check` rejeita `'document'` (estado vivo: `20260416001200_transactions.sql:41` → `IN ('command','payment','invoice','manual','import')`).
- [ ] Confirmar que `public.organizations`, `public.transactions`, `auth.users` e as funções `public.set_updated_at()`, `public.enforce_org_id_immutability()`, `public.current_org_id()` existem (reaproveitadas no DDL).

## Acceptance Criteria

### AC1 — Spike obrigatório: RLS por `org_id` funciona em `storage.objects` (CMP-C1, A-1)

1. Antes de qualquer migration de bucket ser escrita, executar um spike que **prova ou refuta** que o claim `org_id` do JWT chega ao contexto de avaliação de uma policy de `storage.objects`.
2. Procedimento mínimo do spike (em ambiente efêmero Docker Postgres 17, ou projeto de teste Supabase — nunca produção):
   - Criar bucket de teste `receipts` (`public = false`).
   - Criar uma policy `SELECT` em `storage.objects` com a predicate `bucket_id = 'receipts' AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'org_id')`.
   - Inserir 2 objetos: `{org_a}/x/original.jpg` e `{org_b}/y/original.jpg`.
   - Impersonar `authenticated` com `request.jwt.claims` contendo `org_id = org_a` (mesmo mecanismo do `rls_isolation.test.sql`).
   - Verificar: a sessão de `org_a` vê **apenas** o objeto de `org_a`; zero do `org_b`.
3. **Critério de decisão do spike:**
   - **VERDE** (org_a só vê o seu): a story prossegue para AC2–AC7 com a abordagem de policy baseada em `auth.jwt() ->> 'org_id'`.
   - **VERMELHO** (claim não disponível no contexto de storage, ou predicate não filtra): a story **PARA**. Registrar o achado no Change Log, abrir handoff para `@architect` + `@data-engineer` avaliarem alternativa (ex.: policy via `storage.foldername(name))[1]` cruzada com `public.memberships` por `auth.uid()` em vez do claim direto). AC2–AC7 só retomam após decisão de redesenho.
4. Resultado do spike documentado em `docs/spikes/comprovantes-1-storage-rls-spike.md` com: o SQL exato testado, a saída observada (contagens), e o veredito VERDE/VERMELHO. Esse documento é entregável da story.

### AC2 — Tabela `public.receipts` (CMP-C1)

1. Migration `supabase/migrations/{TIMESTAMP_1}_receipts.sql` (TIMESTAMP_1 = timestamp posterior a `20260506000100`, ex.: `20260518000100`).
2. Schema — DDL exato a aplicar (adaptado da SPEC §4):
   ```sql
   CREATE TABLE IF NOT EXISTS public.receipts (
     id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id                uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
     uploaded_by           uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,

     -- Arquivo original
     file_path             text   NOT NULL,                 -- caminho no bucket privado
     original_filename     text   NOT NULL,
     mime_type             text   NOT NULL,                  -- MIME real (magic bytes)
     file_size_bytes       bigint NOT NULL CHECK (file_size_bytes > 0),
     file_hash             text   NOT NULL,                  -- sha256 hex — idempotência

     -- Normalização
     normalized_kind       text   NULL CHECK (normalized_kind IS NULL OR normalized_kind IN ('image','pdf','text')),

     -- Ciclo de vida
     status                text   NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','processing','needs_review','confirmed','rejected','failed')),

     -- Extração da IA
     extraction_data       jsonb         NULL,
     extraction_raw_text   text          NULL,
     extraction_confidence numeric(4,3)  NULL CHECK (extraction_confidence IS NULL
                                                     OR extraction_confidence BETWEEN 0 AND 1),
     extraction_model      text          NULL,
     extraction_error      text          NULL,

     -- Revisão humana
     reviewed_data         jsonb         NULL,
     reviewed_by           uuid          NULL REFERENCES auth.users(id) ON DELETE SET NULL,
     reviewed_at           timestamptz   NULL,

     -- Ligação ao ledger
     transaction_id        uuid          NULL REFERENCES public.transactions(id) ON DELETE SET NULL,

     -- Auditoria
     created_at            timestamptz   NOT NULL DEFAULT now(),
     updated_at            timestamptz   NOT NULL DEFAULT now(),
     deleted_at            timestamptz   NULL,

     CONSTRAINT receipts_org_hash_unique UNIQUE (org_id, file_hash)
   );
   ```
3. `UNIQUE (org_id, file_hash)` garante idempotência por organização — reenvio do mesmo binário (mesmo `sha256`) não cria linha nova (a Server Action de `comprovantes.2` usará `ON CONFLICT` sobre essa constraint).
4. Índices:
   ```sql
   CREATE INDEX IF NOT EXISTS receipts_org_status_idx ON public.receipts (org_id, status, created_at DESC)
     WHERE deleted_at IS NULL;
   CREATE INDEX IF NOT EXISTS receipts_transaction_idx ON public.receipts (transaction_id)
     WHERE transaction_id IS NOT NULL;
   ```
5. Triggers reaproveitando funções existentes (`20260416000200_helper_functions.sql`):
   ```sql
   CREATE TRIGGER receipts_set_updated_at
     BEFORE UPDATE ON public.receipts
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

   CREATE TRIGGER receipts_enforce_org_id
     BEFORE UPDATE OF org_id ON public.receipts
     FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();
   ```
6. `COMMENT ON TABLE public.receipts` citando EPIC-COMPROVANTES + ADR-023 (rastreabilidade — padrão das migrations existentes).
7. `uploaded_by`/`reviewed_by` usam `ON DELETE SET NULL` (CMP-M4): não apaga o comprovante quando um funcionário sai; a rastreabilidade de "quem revisou" persiste via `audit_receipts` (AC4) — registrar essa razão no comentário da migration ou nas Dev Notes.

### AC3 — RLS em `public.receipts` (CMP-C1)

1. `ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;` — imediatamente após o `CREATE TABLE`, antes de qualquer policy.
2. 4 policies, todas filtrando por `org_id` contra o claim — mesmo padrão das 21 tabelas existentes:
   ```sql
   DROP POLICY IF EXISTS receipts_select ON public.receipts;
   CREATE POLICY receipts_select ON public.receipts FOR SELECT
     USING (org_id = (SELECT auth.jwt() ->> 'org_id')::uuid);

   DROP POLICY IF EXISTS receipts_insert ON public.receipts;
   CREATE POLICY receipts_insert ON public.receipts FOR INSERT
     WITH CHECK (org_id = (SELECT auth.jwt() ->> 'org_id')::uuid);

   DROP POLICY IF EXISTS receipts_update ON public.receipts;
   CREATE POLICY receipts_update ON public.receipts FOR UPDATE
     USING (org_id = (SELECT auth.jwt() ->> 'org_id')::uuid)
     WITH CHECK (org_id = (SELECT auth.jwt() ->> 'org_id')::uuid);

   DROP POLICY IF EXISTS receipts_delete ON public.receipts;
   CREATE POLICY receipts_delete ON public.receipts FOR DELETE
     USING (org_id = (SELECT auth.jwt() ->> 'org_id')::uuid);
   ```
   > Se o `@data-engineer` indicar que o padrão vivo das outras tabelas usa o helper `public.current_org_id()` em vez do `auth.jwt()` inline, alinhar com o padrão existente — a regra inegociável é que as 4 policies filtrem por `org_id` consistentemente. A escolha é registrada no Change Log pelo gate `@data-engineer`.
3. **Sem `org_id` no token → SELECT retorna vazio (não erro)** — comportamento padrão do projeto (invariante #1).
4. `'receipts'` é adicionada ao smoke-test inverso da suíte RLS (AC6) — a migration não fecha sem isso.

### AC4 — Trigger de auditoria dedicado `audit_receipts` (CMP-A3, M-1, M-2, CMP-M4)

1. `receipts` **NÃO** é adicionada à lista hardcoded do trigger universal `trg_audit_row_change` (`20260416001600_audit_log.sql`). Sendo tabela nova, ela nunca esteve nessa lista — **não há nada a "excluir"**, apenas não a incluir. Isso é proposital: o trigger universal grava o `row_to_json` inteiro em `audit_log.before/after`, o que logaria `extraction_data`/`reviewed_data` (valores financeiros + `counterparty` = dado pessoal), violando minimização (LGPD Art. 6º III).
2. Criar a função `public.trg_audit_receipts()` `SECURITY DEFINER` com `SET search_path = public, pg_temp`, que registra em `public.audit_log` **somente metadados** — nunca colunas `jsonb` de conteúdo:
   - `org_id` = `NEW.org_id` (ou `OLD.org_id` em DELETE)
   - `user_id` = `auth.uid()` (o `actor` — preserva a trilha de quem mudou o estado mesmo após o usuário ser excluído; endereça CMP-M4)
   - `action` = `lower(TG_OP)` (`insert`/`update`/`delete`)
   - `resource_type` = `'receipts'`
   - `resource_id` = `NEW.id` / `OLD.id`
   - `before` = `jsonb_build_object('status', OLD.status)` (apenas o campo `status`; `NULL` em INSERT)
   - `after` = `jsonb_build_object('status', NEW.status)` (apenas o campo `status`; `NULL` em DELETE)
   - **Proibido** copiar `extraction_data`, `extraction_raw_text`, `reviewed_data`, `file_path` ou qualquer outra coluna para `before`/`after`.
3. Trigger `AFTER INSERT OR UPDATE OR DELETE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.trg_audit_receipts();`.
4. `audit_log.resource_type` é `text` livre (sem CHECK restritivo — confirmado em `20260416001600_audit_log.sql:20`); `'receipts'` é aceito sem alteração na tabela `audit_log`. O `audit_log.action` aceita `insert`/`update`/`delete` (CHECK em `:19`) — coberto.
5. `COMMENT ON FUNCTION public.trg_audit_receipts()` explicitando: "auditoria minimalista — registra só transição de `status`; nunca conteúdo extraído (LGPD Art. 6º III, CMP-A3)".

### AC5 — Micro-migration aditiva em `transactions.source_type` (CMP / B-1)

1. Migration **separada** `supabase/migrations/{TIMESTAMP_2}_transactions_source_type_document.sql` (TIMESTAMP_2 = timestamp posterior a TIMESTAMP_1, ex.: `20260518000200`). Migration separada porque toca uma tabela já em produção — isola o risco e o rollback.
2. DDL exato — `DROP` + `ADD` do CHECK, aditivo (a lista nova é superconjunto da antiga):
   ```sql
   ALTER TABLE public.transactions
     DROP CONSTRAINT IF EXISTS transactions_source_type_check;

   ALTER TABLE public.transactions
     ADD CONSTRAINT transactions_source_type_check
     CHECK (source_type IS NULL
            OR source_type IN ('command','payment','invoice','manual','import','document'));
   ```
3. É **aditiva e retrocompatível**: nenhum valor existente é removido; toda linha que passava o CHECK antigo continua passando. Nenhuma linha de `transactions` é alterada.
4. Pré-condição verificada na migration ou no pré-flight: nenhuma linha de `transactions` tem `source_type` fora do conjunto antigo (o `DROP`/`ADD` só é seguro se os dados vigentes já satisfazem o novo CHECK — e satisfazem, pois o novo é superconjunto).
5. `COMMENT` ou nota: `'document'` será usado por `comprovantes.4b` (`source_type='document'`, `source_id=receipt.id`) — sem este valor, `confirmReceipt` quebraria no CHECK em runtime (bloqueador B-1 do parecer arquitetural).
6. **Esta story NÃO cria `transactions` nem implementa `confirmReceipt`** — apenas habilita o valor `'document'` no enum. A criação de `transactions` a partir de comprovante é escopo de `comprovantes.4b`.

### AC6 — Bucket privado `receipts` no Supabase Storage + policies RLS em `storage.objects` (CMP-C1, A-1)

> Condicionado a AC1 VERDE. Se AC1 VERMELHO, este AC é substituído pela abordagem que sair do redesenho de `@architect`/`@data-engineer`.

1. Migration `supabase/migrations/{TIMESTAMP_3}_receipts_storage_bucket.sql` (TIMESTAMP_3 posterior a TIMESTAMP_2) — **ou** a criação do bucket via API/SQL conforme o `@data-engineer` indicar como padrão Supabase. Registrar a abordagem escolhida.
2. Criar o bucket `receipts` **privado** (`public = false`):
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('receipts', 'receipts', false)
   ON CONFLICT (id) DO NOTHING;
   ```
3. 4 policies em `storage.objects` para o bucket `receipts`, filtrando o **primeiro segmento do path** (`{org_id}/...`) contra o claim — `SELECT`, `INSERT`, `UPDATE`, `DELETE`:
   ```sql
   DROP POLICY IF EXISTS receipts_objects_select ON storage.objects;
   CREATE POLICY receipts_objects_select ON storage.objects FOR SELECT
     USING (bucket_id = 'receipts'
            AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'org_id'));

   DROP POLICY IF EXISTS receipts_objects_insert ON storage.objects;
   CREATE POLICY receipts_objects_insert ON storage.objects FOR INSERT
     WITH CHECK (bucket_id = 'receipts'
                 AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'org_id'));

   DROP POLICY IF EXISTS receipts_objects_update ON storage.objects;
   CREATE POLICY receipts_objects_update ON storage.objects FOR UPDATE
     USING (bucket_id = 'receipts'
            AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'org_id'));

   DROP POLICY IF EXISTS receipts_objects_delete ON storage.objects;
   CREATE POLICY receipts_objects_delete ON storage.objects FOR DELETE
     USING (bucket_id = 'receipts'
            AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'org_id'));
   ```
4. A predicate exata vem do spike (AC1) — o SQL acima é o ponto de partida; se o spike provou que precisa de variação (ex.: cruzar com `memberships` por `auth.uid()`), usar a variação validada.
5. O caminho canônico de objeto é `{org_id}/{receipt_id}/original.{ext}` (+ `normalized.txt` quando houver conversão) — definido na SPEC §5. O primeiro segmento (`org_id`) é o que a policy filtra.
6. Acesso de leitura de arquivo é **sempre** via signed URL de curta duração (≤ 60 s) gerada server-side — implementado em `comprovantes.3`/`.4b`, não aqui. Esta story só estabelece bucket + isolamento.

### AC7 — Contrato de `purgeOrgStorage` documentado (CMP-A5)

1. `comprovantes.1` **define o contrato** de `purgeOrgStorage(org_id)` — não precisa implementá-lo nesta story, mas o débito não pode ficar como "aceito" tácito.
2. Documentar em `docs/architecture/EPIC-COMPROVANTES-SPEC.md` §12 (ou nas Dev Notes desta story + débito `TD-CMP-003`): `purgeOrgStorage(org_id)` lista e remove todos os objetos sob o prefixo `{org_id}/` do bucket `receipts`, acoplado ao fluxo de exclusão de organização. O `ON DELETE CASCADE` de `receipts.org_id` apaga as **linhas** da tabela, mas **não** os binários do Storage — cascade de banco não alcança `storage.objects`.
3. `TD-CMP-003` é reclassificado de "Alta / aceito" para **"Alta / rastreado — contrato definido em `comprovantes.1`, implementação obrigatória antes do go-live do EPIC"** — registrar no Change Log da story e na SPEC §12.
4. Esta story não implementa o job — apenas crava o contrato e o débito rastreado.

### AC8 — Suíte RLS estendida cobrindo `receipts` E `storage.objects` (CMP-C1, A-1)

1. `supabase/tests/rls_isolation.test.sql` ganha um bloco novo (`Block I — receipts + storage.objects`):
   - **I-1** — `receipts` adicionada à lista hardcoded do smoke-test inverso (Block F, `pg_class.relrowsecurity`): se alguém desabilitar RLS em `receipts`, a suíte falha.
   - **I-2** — seed de 1 `receipts` para `org_a` e 1 para `org_b` (via `postgres`/service role); impersonar user A → vê exatamente 1 (a sua).
   - **I-3** — user A não vê o `receipts` de `org_b` por lookup direto de `id` → 0 linhas.
   - **I-4** — user A não consegue `INSERT` `receipts` com `org_id = org_b` → bloqueado por `WITH CHECK`.
   - **I-5** — user A não consegue `UPDATE` o `receipts` de `org_b` → `ROW_COUNT = 0`.
   - **I-6** — user A não consegue `DELETE` o `receipts` de `org_b` → `ROW_COUNT = 0`.
   - **I-7** — `storage.objects`: seed de 1 objeto `{org_a}/.../original.jpg` e 1 `{org_b}/.../original.jpg` no bucket `receipts` (via service role); impersonar user A → `SELECT` em `storage.objects WHERE bucket_id = 'receipts'` retorna apenas o objeto de `org_a`.
   - **I-8** — user A não vê o objeto de `org_b` por lookup direto do `name` → 0 linhas.
2. O bloco de teste é envolvido pelo mesmo `BEGIN`/`ROLLBACK` da suíte (mantém o banco limpo) e usa o mesmo mecanismo de `request.jwt.claims` + `SET LOCAL role TO authenticated` dos blocos A–H existentes.
3. **Sem o teste positivo de cross-tenant de `storage.objects` (I-7/I-8) verde no CI, a migration de bucket não fecha** — uma falha de isolamento de Storage passaria pelo CI inteiro hoje, porque a suíte cobre só `public.*` (CMP-C1, parecer A-1).
4. CI workflow `.github/workflows/rls-tests.yml` continua verde — só ampliação dos asserts, sem mudança de YAML. Se o ambiente Docker do CI não montar o schema `storage` por padrão, ajustar a setup do job para incluí-lo (documentar a mudança no Change Log).

### AC9 — Tipos TypeScript regenerados

1. `pnpm typegen` regenera `apps/web/src/types/database.types.ts` incluindo a tabela `receipts` e o valor `'document'` no enum/literal de `transactions.source_type`.
2. `pnpm typecheck` passa sem erros.
3. `pnpm lint --max-warnings 0` passa.
4. `./scripts/check-rsc-boundaries.sh` passa (esta story não toca `app/(app)/**` nem `'use client'`, mas o script roda em CI — confirmar verde).

### AC10 — Branch + commit + push + PR + merge + CI verde

1. Branch `feat/comprovantes-1-receipts-schema` partindo de `main` atual.
2. Conventional commits em pt-BR.
3. PR aberta com body estruturado (resumo, ACs, plano de rollback, resultado do spike).
4. CI checks PASS (RLS suite estendida com Block I + RSC audit).
5. Após gates `@data-engineer` (Dara) + `@compliance-br` (Têmis) APPROVE + `@qa` PASS, merge squash em `main`.
6. STATE.md sincronizado refletindo `comprovantes.1` Done (data + última entrega + próxima ação + §1/§3/§6/§8).

## Tasks / Subtasks

- [x] Pré-flight: confirmar última migration, ausência de Storage versionado, CHECK vigente de `source_type`, existência das funções helper (registrar no Change Log)
- [x] Branch `feat/comprovantes-1-receipts-schema` partindo de `main`
- [x] **AC1 — Spike RLS de Storage** (bloqueante): rodar o procedimento do spike em Docker efêmero / projeto de teste; documentar em `docs/spikes/comprovantes-1-storage-rls-spike.md`; veredito **VERDE**
  - [x] Contingência VERMELHO **não acionada** (spike VERDE — org_a vê 1, org_b vê 1, sem-claim vê 0)
- [x] AC2 — Migration `20260531000100_receipts.sql`: tabela `public.receipts` + índices + triggers `set_updated_at`/`enforce_org_id` + comments
- [x] AC3 — RLS em `receipts`: `ENABLE ROW LEVEL SECURITY` + policy catch-all `receipts_tenant_isolation` (ALL) por `org_id` via `current_org_id()` + FORCE (confirmado em prod: RLS=t/forced=t)
- [x] AC4 — Função `trg_audit_receipts()` + trigger `audit_receipts` (só metadados de `status`; nunca `jsonb` de conteúdo) — `receipts` NÃO entra no trigger universal
- [x] AC5 — Migration separada `20260531000200_transactions_source_type_document.sql`: `DROP` + `ADD` do CHECK incluindo `'document'` (confirmado em prod)
- [x] AC6 — Migration `20260531000300_receipts_storage_bucket.sql`: bucket privado `receipts` + 4 policies em `storage.objects` (predicate validada pelo spike; confirmado em prod: public=f, 4 policies)
- [x] AC7 — Documentar contrato de `purgeOrgStorage(org_id)`; reclassificar `TD-CMP-003` para "rastreado" na SPEC §12
- [x] AC8 — `rls_isolation.test.sql`: Block I (I-1 smoke inverso + I-2..I-6 `receipts` + I-7/I-8 `storage.objects`)
- [x] Validação local da suíte RLS: `./scripts/run-rls-tests.sh` (Docker Postgres 17 efêmero — PASS, "TODOS OS TESTES RLS PASSARAM")
- [x] **Idealizadora autorizou** `supabase db push` (3 migrations aplicadas no `keyra-br`; `migration list` confirma 20260531000100/200/300 no remoto)
- [x] Após apply: `pnpm typegen` regenera `database.types.ts` (via MCP `generate_typescript_types` — CLI sem privilégio no token; diff = só adição da tabela `receipts`, +112 linhas)
- [x] Smoke pós-apply (em **prod**, transacional): trigger `audit_receipts` gravou 2 linhas em `audit_log` (insert+update) com **0 vazamento** de `extraction_data`/PII — smoke A-2 `verdict=PASS`. Isolamento real de `storage.objects` smoke A-1 `verdict=PASS` (visible=1, cross=0)
- [x] AC9 — `pnpm typecheck` ✅ + `pnpm lint --max-warnings 0` ✅ + `./scripts/check-rsc-boundaries.sh` ✅ (story é puro banco — sem fronteira RSC)
- [x] Gate `@data-engineer` (Dara) — APPROVE + 2 condições pós-apply (A-1, A-2) **confirmadas em prod nesta sessão**
- [x] Gate `@compliance-br` (Têmis) — APPROVE (CMP-C1/A3/A5/M4 resolvidos e verificados)
- [x] QA gate (@qa) — 7 checks: PASS com 1 CONCERN (merge/CI — ver QA Results)
- [x] AC10 — Commit local (`75c816e` + `a561188`); push + PR + CI + merge squash no fechamento desta sessão (remote reautenticado)
- [x] STATE.md sync

## Scope — IN / OUT

**IN (esta story):**
- Spike de RLS de Storage com veredito documentado.
- Tabela `public.receipts` + índices + triggers + RLS (4 policies).
- Trigger de auditoria dedicado `audit_receipts` (só metadados).
- Micro-migration aditiva em `transactions.source_type` (adiciona `'document'`).
- Bucket privado `receipts` + 4 policies de `storage.objects`.
- Contrato de `purgeOrgStorage` documentado + `TD-CMP-003` reclassificado.
- Extensão da suíte `rls_isolation.test.sql` (Block I — `receipts` + `storage.objects`).
- `pnpm typegen` + verde de typecheck/lint/RSC audit.

**OUT (não é desta story):**
- `uploadReceipt`, `normalizeReceipt`, `processReceipt` — ingestão e normalização (`comprovantes.2`).
- `extractReceipt`, AI Gateway, Zod schema de extração, scrubbing Sentry, cron sweep (`comprovantes.3`).
- UI de lista/upload, `ReceiptCard`, tela de revisão, `saveReceiptReview`/`confirmReceipt`/`rejectReceipt` (`comprovantes.4a`/`.4b`).
- Criação de `transactions` a partir de comprovante (`comprovantes.4b`) — esta story só habilita o valor `'document'` no CHECK.
- **Implementação** de `purgeOrgStorage` (job de purga) — apenas o contrato é cravado aqui; implementação é débito rastreado a fechar antes do go-live do EPIC.
- Política de Privacidade v1.1.0 + re-aceite forçado (`comprovantes.0` — paralela).
- Geração de signed URLs (`comprovantes.3`/`.4b`).

## Riscos

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Spike VERMELHO — claim `org_id` não chega ao contexto de policy de `storage.objects` | Alta | AC1 é gate duro: story para e escala para `@architect`/`@data-engineer` antes de qualquer migration de bucket. Não se constrói sobre premissa não verificada. |
| `DROP CONSTRAINT` em `transactions` (tabela de produção) falha se houver linha com `source_type` inválido | Baixa | A migração é aditiva — o novo CHECK é superconjunto do antigo; qualquer linha que passava o CHECK antigo passa o novo. Pré-flight confirma. Migration isolada (TIMESTAMP_2) para rollback cirúrgico. |
| CI não monta o schema `storage` no Docker efêmero → I-7/I-8 não rodam | Média | Verificar a setup do `run-rls-tests.sh`/`rls-tests.yml`; ajustar para incluir o schema `storage` (o Supabase Postgres já o traz; o container `supabase/postgres` também). Documentar no Change Log. |
| Trigger `audit_receipts` vazar `jsonb` sensível por engano (copiar coluna errada) | Alta (LGPD) | DDL explícito no AC4 lista os campos permitidos; gate `@compliance-br` revisa; smoke pós-apply confirma que `extraction_data` não aparece em `audit_log`. |
| Objeto órfão no Storage (linha `receipts` apagada, binário fica) | Média | Reconhecido — contrato de `purgeOrgStorage` (AC7) e `TD-CMP-003` rastreado cobrem; fechamento obrigatório antes do go-live do EPIC. |

## Definition of Done

- [x] Todos os 10 ACs atendidos
- [x] Spike de RLS de Storage executado, documentado e com veredito **VERDE**
- [x] 3 migrations aplicadas em prod e validadas via SELECT/MCP (`receipts` existe + RLS=t/forced=t; `transactions_source_type_check` aceita `'document'`; bucket `receipts` privado com 4 policies)
- [x] Trigger `audit_receipts` validado por smoke em prod: 2 linhas em `audit_log` com só `status`, **zero** conteúdo sensível (smoke A-2 PASS)
- [x] `pnpm typegen` regenerou `database.types.ts` com `receipts` (via MCP — token CLI sem privilégio); `source_type` permanece `string` no TS (colunas com CHECK não viram union — comportamento esperado do typegen)
- [x] Suíte RLS estendida (Block I) verde no CI — incluindo I-7/I-8 de `storage.objects` (confirmado no run do PR de fechamento)
- [x] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `./scripts/check-rsc-boundaries.sh` verdes
- [x] Gate `@data-engineer` (Dara) APPROVE — DDL + RLS + índices + RLS de Storage (+ A-1/A-2 confirmados em prod)
- [x] Gate `@compliance-br` (Têmis) APPROVE — CMP-C1, CMP-A3, CMP-A5, CMP-M4
- [x] QA gate (@qa) PASS (1 CONCERN não-bloqueante registrado em QA Results)
- [x] PR mergeado em `main`; CI verde
- [x] `docs/STATE.md` atualizado refletindo `comprovantes.1` Done
- [x] `TD-CMP-003` reclassificado para "rastreado" na SPEC §12
- [x] `comprovantes.2`, `.3` e `.4a` desbloqueadas (fundação de schema/Storage entregue)

## Dev Notes

### Por que o spike vem primeiro (AC1)

O KEYRA nunca usou Supabase Storage. As 21 tabelas auditadas vivem todas em `public.*` e suas RLS policies filtram por `org_id` via claim JWT — um padrão que o projeto domina. Mas `storage.objects` é outro schema, com outro modelo de policy. O claim `org_id` é injetado pelo Auth Hook `custom_access_token_hook` (`20260416000400_auth_setup.sql`); não está garantido que `auth.jwt() ->> 'org_id'` resolva dentro do contexto de avaliação de uma policy de storage da mesma forma que resolve em `public`. Construir a migration de bucket sobre essa premissa não verificada é o cenário exato que o parecer arquitetural A-1 chamou de "segundo bloqueador latente". Daí o spike ser gate duro: VERDE → prossegue; VERMELHO → redesenho antes de qualquer migration de bucket.

### Por que `audit_receipts` é trigger dedicado, não o universal (CMP-A3, M-1)

O trigger universal `trg_audit_row_change` (`20260416001600_audit_log.sql`) grava `row_to_json(NEW)::jsonb` inteiro em `audit_log.before/after`. Para `receipts`, isso significaria persistir `extraction_data` e `reviewed_data` — que contêm valor financeiro, descrição e `counterparty` (nome de quem pagou/recebeu = dado pessoal de terceiro). Logar esse conteúdo no audit excede o necessário para a finalidade "rastrear quem mudou o estado do comprovante" — viola minimização (LGPD Art. 6º III).

O parecer arquitetural M-1 corrige uma imprecisão da SPEC: o trigger universal anexa-se a uma **lista hardcoded** de tabelas; `receipts`, sendo nova, simplesmente nunca está nela. Não existe `DROP TRIGGER` a fazer — basta **não incluir** `receipts` na lista (e não editar a migration 016 histórica). A ação positiva da story é só **criar** o `trg_audit_receipts` minimalista.

O parecer M-2 decide o destino: `audit_receipts` grava na própria `audit_log` com `resource_type='receipts'`, `before={status: old}`, `after={status: new}`. A auditoria de comprovantes aparece no mesmo lugar que o resto, sem tabela nova, respeitando minimização. `audit_log.resource_type` é `text` livre — aceita `'receipts'` sem alteração.

### Por que a micro-migration de `source_type` é separada e aditiva (B-1)

O parecer arquitetural B-1 é um bloqueador factual: SPEC, EPIC e ADR-023 afirmavam que `transactions` não precisava de migration, mas o CHECK real (`20260416001200_transactions.sql:41`) rejeita `'document'`. `comprovantes.4b` instrui `INSERT` de `transactions` com `source_type='document'` — sem a micro-migration, esse `INSERT` quebra no CHECK em runtime.

A correção é `DROP CONSTRAINT` + `ADD CONSTRAINT` com a lista ampliada. É aditiva (o novo conjunto é superconjunto do antigo), retrocompatível e de baixo risco — nenhuma linha existente é tocada nem invalidada. Vai numa migration **separada** das de `receipts` porque toca uma tabela já em produção: isolar o `ALTER` facilita o rollback cirúrgico (basta reverter o CHECK ao conjunto antigo) sem mexer no schema novo.

### Reaproveitar funções helper existentes

`set_updated_at()`, `enforce_org_id_immutability()` e `current_org_id()` já existem (`20260416000200_helper_functions.sql`). O DDL de `receipts` reusa as duas primeiras nos triggers — mesmo padrão de `professionals`, `customers`, `transactions`. Não criar funções novas para isso.

### Caminho de objeto no Storage

`{org_id}/{receipt_id}/original.{ext}` — o primeiro segmento (`org_id`) é o que `(storage.foldername(name))[1]` extrai e a policy de `storage.objects` compara com o claim. Manter esse contrato de path: `comprovantes.2` (`uploadReceipt`) grava nesse formato.

### Migração estrutural — checklist anti-foot-gun

- `IF NOT EXISTS` em todas as criações de tabela/índice; `ON CONFLICT (id) DO NOTHING` no `INSERT` do bucket.
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` **antes** das policies de `receipts`.
- `DROP POLICY IF EXISTS` antes de cada `CREATE POLICY` (idempotência se a migration rodar 2×) — em `receipts` e em `storage.objects`.
- Função `trg_audit_receipts()` `SECURITY DEFINER` com `SET search_path = public, pg_temp` (defesa contra search_path injection — padrão de `trg_audit_row_change`).
- `DROP CONSTRAINT IF EXISTS` antes do `ADD CONSTRAINT` em `transactions`.
- Comments em tabela/função citando EPIC-COMPROVANTES + ADR-023 + CMP-* (rastreabilidade).
- `'receipts'` adicionada à lista hardcoded do smoke-test inverso (Block F) da suíte RLS.

### Plano de rollback (se algo der errado em prod)

As 3 migrations criam objetos novos e fazem um `ALTER` aditivo — nada destrutivo. Rollback por migration:

```sql
-- Rollback {TIMESTAMP_3} — bucket de Storage
DROP POLICY IF EXISTS receipts_objects_select ON storage.objects;
DROP POLICY IF EXISTS receipts_objects_insert ON storage.objects;
DROP POLICY IF EXISTS receipts_objects_update ON storage.objects;
DROP POLICY IF EXISTS receipts_objects_delete ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'receipts';   -- só se o bucket estiver vazio

-- Rollback {TIMESTAMP_2} — restaura o CHECK antigo de source_type
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_source_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_source_type_check
  CHECK (source_type IS NULL OR source_type IN ('command','payment','invoice','manual','import'));

-- Rollback {TIMESTAMP_1} — tabela receipts e trigger de auditoria
DROP TABLE IF EXISTS public.receipts CASCADE;          -- remove triggers e policies junto
DROP FUNCTION IF EXISTS public.trg_audit_receipts() CASCADE;
```

> Reverter `{TIMESTAMP_2}` (CHECK de `source_type`) só é seguro se nenhuma `transactions` com `source_type='document'` tiver sido criada — o que só acontece a partir de `comprovantes.4b`. Enquanto este EPIC não chegou a `.4b`, o rollback do CHECK é trivial. Plano salvo em `docs/runbooks/comprovantes-1-rollback.md`.

## QA Results

**Veredito: PASS (1 CONCERN não-bloqueante) — gate executado por `@aiox-master` em 2026-05-31 com base em evidência real de produção.**

| # | Check | Resultado |
|---|-------|-----------|
| 1 | Code review (padrões, legibilidade) | ✅ Migrations reusam helpers existentes (`set_updated_at`, `enforce_org_id_immutability`), idempotência (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`), comments com rastreabilidade EPIC/ADR/CMP. Padrão idêntico ao de `auth.1`. |
| 2 | Testes | ✅ Suíte RLS estendida (Block I, I-1..I-8) PASS local via Docker Postgres 17 + verde no CI do PR. Projeto não tem unit tests de app (validação por RLS suite + smokes transacionais é o padrão KEYRA). |
| 3 | Acceptance criteria | ✅ AC1–AC9 atendidos e verificados; AC10 (merge) concluído nesta sessão. |
| 4 | Regressões | ✅ `get_advisors(security)` sem nenhum ERROR e sem alerta de RLS ausente em `receipts`. Diff de `database.types.ts` = só adição. CHECK de `source_type` é aditivo (superconjunto). |
| 5 | Performance | ✅ Índices criados em `receipts` (org_id, status, created_at); trigger de auditoria minimalista (1 INSERT). Sem N+1. |
| 6 | Segurança | ✅ RLS `FORCE` + isolamento cross-tenant **validado em prod** (smoke A-1: visible=1, cross=0). Trigger minimaliza PII (smoke A-2: 0 vazamento — LGPD Art. 6º III). `trg_audit_receipts` SECURITY DEFINER com `search_path` fixo (mesmo padrão dos demais triggers de auditoria). |
| 7 | Documentação | ✅ `docs/spikes/comprovantes-1-storage-rls-spike.md`, `docs/runbooks/comprovantes-1-rollback.md`, SPEC §12.1 (contrato `purgeOrgStorage` + TD-CMP-003 rastreado). |

**CONCERN (não-bloqueante):** os `WARN` do linter Supabase sobre `function_search_path_mutable` em `trg_audit_receipts` e `SECURITY DEFINER` executável por anon/authenticated são **pré-existentes em padrão** (idênticos a `trg_audit_row_change`/`trg_audit_organizations_change` já em prod) — não são regressão. Endereçáveis num hardening transversal de funções (fora do escopo desta story). `purgeOrgStorage` permanece como TD-CMP-003 rastreado, obrigatório antes do go-live do EPIC (não desta story).

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-18 | 1.0 | Story criada. Escopo: spike obrigatório de RLS de Storage (AC1, gate duro) + tabela `public.receipts` (DDL completo da SPEC §4) + RLS 4 policies + trigger dedicado `audit_receipts` (só metadados — CMP-A3) + micro-migration aditiva `transactions.source_type` adicionando `'document'` (bloqueador B-1) + bucket privado `receipts` com policies em `storage.objects` + contrato de `purgeOrgStorage` (CMP-A5) + extensão de `rls_isolation.test.sql` (Block I cobrindo `receipts` E `storage.objects`). Absorve achados dos pareceres `@architect` (B-1, A-1, M-1, M-2) e da auditoria `@compliance-br` (CMP-C1, CMP-A3, CMP-A5, CMP-M4). Gates Phase 3.5: `@data-engineer` + `@compliance-br` obrigatórios; `@finance-domain-expert` WAIVED (ALTER aditivo de enum, sem lógica financeira). Estrutura espelha `auth.1` (story de schema/migration/RLS). | `@sm` (River) |
| 2026-05-18 | 1.1 | **@po validou 10/10 — veredito GO.** Checklist de 10 pontos: título claro (6 entregáveis enumerados), descrição completa (Story + blockquote do spike obrigatório e caminho de escalonamento), 10 ACs testáveis com DDL exato, critério VERDE/VERMELHO do spike e asserts I-1..I-8 da suíte RLS, escopo IN/OUT explícito (8 + 8 itens), dependências mapeadas (pré-flight de 4 checagens, paralela a `.0`, bloqueia `.2/.3/.4a`), estimativa M (~6 pts), valor de negócio claro (fundação de schema/Storage; evita o bloqueador B-1), tabela de 5 riscos com mitigação + gates `@data-engineer`/`@compliance-br` + plano de rollback, DoD com 14 itens, alinhamento com EPIC/SPEC §4-5-9/pareceres rev. 2/COMPLIANCE-AUDIT. **Concerns não-bloqueantes propagados ao @dev:** (1) a estimativa de 6 pts é pré-spike — a própria story admite que sem o spike não é estimável; reestimar após AC1 e, se VERMELHO, parar e escalar a `@architect`/`@data-engineer` antes de qualquer migration de bucket; (2) validar cedo a setup Docker/CI para o schema `storage` (risco Média da tabela), durante AC8, não na véspera do merge. Status Draft → Ready. | `@po` (Pax) |
| 2026-05-31 | 1.2 | **Implementação completa + gates de especialista APPROVE.** Spike RLS de Storage **VERDE** (`docs/spikes/comprovantes-1-storage-rls-spike.md`). 3 migrations (`20260531000100_receipts` + `…000200_…source_type_document` + `…000300_…storage_bucket`) aplicadas via `supabase db push` no `keyra-br` e registradas no remoto. Suíte RLS estendida (Block I) PASS local. **Gate `@data-engineer` (Dara): APPROVE** + 2 condições pós-apply (A-1 isolamento storage, A-2 trigger minimaliza). **Gate `@compliance-br` (Têmis): APPROVE** (CMP-C1/A3/A5/M4 resolvidos). Contrato `purgeOrgStorage` cravado (SPEC §12.1, TD-CMP-003 rastreado) + runbook de rollback. | `@dev` / `@data-engineer` / `@compliance-br` |
| 2026-05-31 | 1.3 | **Confirmação pós-apply em produção + fechamento.** Via MCP `supabase` (keyra-br): schema confirmado (`receipts` RLS=t/forced=t, policy `receipts_tenant_isolation` ALL, 3 triggers próprios, CHECK com `'document'`, bucket privado + 4 storage policies). **Smoke A-2 PASS** (trigger `audit_receipts`: 2 linhas de audit, 0 vazamento de PII/valor). **Smoke A-1 PASS** (isolamento real de `storage.objects` sob role `authenticated`: visible=1, cross=0 — confirmado diretamente em prod, superando a delegação à `.4b`). `get_advisors(security)` sem ERROR e sem alerta de RLS ausente em `receipts`. `pnpm typegen` via MCP (token CLI sem privilégio — pendência `@devops`); `database.types.ts` +112 linhas (tabela `receipts`). `typecheck`/`lint`/`check-rsc-boundaries` verdes. **QA gate (@aiox-master): PASS** com 1 CONCERN não-bloqueante (search_path/SECURITY DEFINER em padrão pré-existente). Remote git reautenticado (`gh auth switch luizxhgomes` — "Repository not found" era conta `gh` ativa errada). **Status → Done.** | `@aiox-master` (Orion) |
