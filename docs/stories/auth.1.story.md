# Story auth.1: Schema profiles + user_consent_records + legal_documents + Auth Hook estendido + UNIQUE CNPJ + before_user_created hook

## Status

Ready

## Story

**Como** mantenedor do KEYRA construindo cadastro estruturado e login email+senha,
**Eu quero** que o banco tenha as tabelas, triggers, policies RLS e hooks necessários para armazenar com segurança nome, telefone (criptografado), aceite versionado de Termos+Privacidade, e que o JWT carregue `full_name` para reconhecimento do usuário em qualquer rota,
**Para que** as stories `auth.3` (cadastro), `auth.4` (login senha), `auth.5` (recovery), `auth.6` (Google OAuth) e `auth.7` (custom claim) tenham sobre o que construir — sem que cada uma reimplemente fragmentos de schema/RLS/auditoria que precisariam ser unificados depois.

## Complexidade

**T-shirt:** M+ (~6 pontos)

## Acceptance Criteria

### AC1 — Tabela `public.profiles` (mitiga R5, R19)

1. Migration `supabase/migrations/20260503000100_auth_v2_profiles_consent_legal_docs.sql`.
2. Schema:
   ```sql
   CREATE TABLE public.profiles (
     id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     full_name       text NULL CHECK (full_name IS NULL OR char_length(full_name) BETWEEN 2 AND 120),
     phone_encrypted bytea NULL,                 -- pgp_sym_encrypt (ADR-017)
     phone_last_four text NULL CHECK (phone_last_four IS NULL OR char_length(phone_last_four) = 4),
     created_at      timestamptz NOT NULL DEFAULT now(),
     updated_at      timestamptz NOT NULL DEFAULT now()
   );
   ```
3. **Sem `org_id`** — profile é por-usuário, não por-tenant (memberships fazem o join). Não tenant-scoped.
4. Index em `id` (já é PK) e trigger `set_updated_at` reaproveitando função existente.
5. RLS habilitada com `FORCE ROW LEVEL SECURITY`, policies:
   - `SELECT`: `auth.uid() = id`
   - `UPDATE`: `auth.uid() = id` (mas user NÃO pode mudar `id` ou `created_at` — enforce via trigger ou GENERATED)
   - `INSERT`: bloqueado para `authenticated` (só via trigger `on_auth_user_created` ou RPC do signup)
   - `DELETE`: bloqueado para `authenticated` (cascade quando `auth.users` é deletado)

### AC2 — Tabela `public.legal_documents` (terms+privacy versionados imutáveis)

1. Schema:
   ```sql
   CREATE TABLE public.legal_documents (
     id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     type            text NOT NULL CHECK (type IN ('terms','privacy')),
     version         text NOT NULL,
     content_hash    text NOT NULL,
     content_md      text NOT NULL,
     published_at    timestamptz NOT NULL DEFAULT now(),
     deprecated_at   timestamptz NULL,
     UNIQUE (type, version)
   );
   ```
2. RLS habilitada:
   - `SELECT` para `authenticated`: `true` (todos podem ler termos vigentes)
   - `INSERT/UPDATE/DELETE`: bloqueado para `authenticated` (só via service_role — KEYRA admin só publica termos via migration ou RPC controlada)
3. View `legal_documents_current` retornando última versão não-deprecated por tipo.
4. **Conteúdo dos termos não é seedeado nesta story** — `auth.2` é responsável por escrever e popular v1.0.0.

### AC3 — Tabela `public.user_consent_records` (registro imutável de aceite)

1. Schema:
   ```sql
   CREATE TABLE public.user_consent_records (
     id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     document_id  uuid NOT NULL REFERENCES public.legal_documents(id) ON DELETE RESTRICT,
     accepted_at  timestamptz NOT NULL DEFAULT now(),
     ip_address   inet NULL,
     user_agent   text NULL,
     UNIQUE (user_id, document_id)
   );
   ```
2. **`ON DELETE RESTRICT` em `document_id`** — proibida a exclusão de um documento que tem aceites registrados (preserva auditoria).
3. RLS habilitada com `FORCE`:
   - `SELECT`: `auth.uid() = user_id` (user só vê seus próprios aceites)
   - `INSERT`: `auth.uid() = user_id` (user só registra próprio aceite — chamado pela RPC do signup)
   - `UPDATE`: bloqueado universalmente (registro é imutável após gravado — princípio LGPD de auditabilidade)
   - `DELETE`: bloqueado para `authenticated` (cascade quando user deletado)
4. Index em `(user_id, document_id)`.

### AC4 — UNIQUE INDEX parcial em `organizations.cnpj` (mitiga R7)

1. `CREATE UNIQUE INDEX organizations_cnpj_unique ON public.organizations (cnpj) WHERE cnpj IS NOT NULL AND deleted_at IS NULL;`
2. Pre-flight desta story já confirmou que NÃO há CNPJ duplicado em prod hoje (zero rows com `COUNT(*) > 1`).
3. Se em algum momento futuro houver soft-delete e reentrada com mesmo CNPJ, o index parcial permite (porque exclui `deleted_at IS NOT NULL`).

### AC5 — Trigger `on_auth_user_created` (mitiga R19)

1. Função `public.handle_new_auth_user()` `SECURITY DEFINER` com `search_path = public, pg_temp`.
2. Trigger `AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();`
3. Função INSERT em `public.profiles (id, created_at)` com defaults — campos `full_name`/`phone_*` ficam NULL e são preenchidos pelo signup flow ou por `auth.6` (Google OAuth callback).
4. GRANT EXECUTE adequado para `supabase_auth_admin` (mesmo padrão do `custom_access_token_hook` existente).
5. Smoke: criar `auth.users` via service_role → row em `profiles` aparece automaticamente com mesmo `id`.

### AC6 — Auth Hook `custom_access_token_hook` estendido com `full_name` (mitiga R6, prepara `auth.7`)

1. Função existente é alterada (`CREATE OR REPLACE FUNCTION`) para também buscar `full_name` em `profiles` e adicionar ao claim:
   ```sql
   IF resolved_org IS NOT NULL THEN
     claims := jsonb_set(claims, '{org_id}', to_jsonb(resolved_org::text), true);
   END IF;

   SELECT p.full_name INTO v_full_name FROM public.profiles p WHERE p.id = target_user;
   IF v_full_name IS NOT NULL THEN
     claims := jsonb_set(claims, '{full_name}', to_jsonb(v_full_name), true);
   END IF;
   ```
2. **NÃO incluir `phone`** — PII em JWT vaza em logs/Sentry/breadcrumb (D5 da auditoria).
3. GRANT SELECT em `public.profiles` para `supabase_auth_admin`.
4. Backward-compatible: usuários existentes sem profile (caso de borda) continuam logando — só não recebem `full_name` no claim.

### AC7 — Hook `before_user_created` rejeitando domínios descartáveis (mitiga R13)

1. Função `public.before_user_created_block_disposable_emails(event jsonb) RETURNS jsonb` com lista de ~30 domínios descartáveis canônicos (mailinator, 10minutemail, guerrillamail, tempmail, yopmail, etc.).
2. Retorna `{"error": {"http_code": 422, "message": "..."}}` para domínios bloqueados; `{}` para permitidos.
3. **NÃO bloquear** gmail, outlook, icloud, hotmail, yahoo, uol, ig, terra, bol, globo (provedores legítimos brasileiros e internacionais).
4. Hook **NÃO é registrado automaticamente pela migration** — requer chamada à Management API (`PATCH /v1/projects/{ref}/config/auth` com `hook_before_user_created_enabled=true` e `hook_before_user_created_uri="pg-functions://postgres/public/before_user_created_block_disposable_emails"`). Script `scripts/configure-supabase-auth-hooks.sh` faz isso após apply da migration.
5. Smoke: signup com `teste@mailinator.com` → 422; signup com `teste@gmail.com` → 200.

### AC8 — Suíte RLS estendida (regression test)

1. `supabase/tests/rls_isolation.test.sql` ganha 3 blocos novos:
   - `profiles`: user A não vê profile de user B; user A não consegue UPDATE profile de user B; INSERT direto bloqueado para `authenticated`
   - `user_consent_records`: user A não vê consent de user B; user A não consegue UPDATE seus próprios consents (imutáveis)
   - `legal_documents`: ambos users veem todos os termos publicados (read-only)
2. CI workflow `.github/workflows/rls-tests.yml` continua verde (sem mudança de YAML — só ampliação dos asserts).

### AC9 — Tipos TypeScript regenerados

1. `pnpm typegen` regenera `apps/web/src/types/database.types.ts` incluindo `profiles`, `user_consent_records`, `legal_documents`.
2. `pnpm typecheck` passa sem erros.
3. `pnpm lint --max-warnings 0` passa.

### AC10 — Branch + commit + push + PR + merge + Vercel READY

1. Branch `feat/auth-v2-story-1` partindo de `main` atual (`bb83ac2`).
2. Conventional commits.
3. PR aberta com body estruturado.
4. CI checks PASS (RSC audit + RLS suite + Vercel deploy).
5. Após gates `@data-engineer` + `@compliance-br` APPROVE + `@qa` PASS, merge squash em main.
6. Vercel prod deploy READY.
7. STATE.md sincronizado.

## Tasks / Subtasks

- [ ] Pre-flight (já feito): CNPJ duplicado verificado, última migration confirmada, target tables ausentes
- [ ] Branch `feat/auth-v2-story-1` partindo de `main`
- [ ] Migration `20260503000100_auth_v2_profiles_consent_legal_docs.sql` com 9 ACs estruturais
- [ ] Validação local (Docker Postgres efêmero se disponível) — apply da migration + smoke transacional
- [ ] `supabase/tests/rls_isolation.test.sql` ampliado com 3 blocos novos (profiles, consent, legal_documents)
- [ ] **AGUARDA AUTORIZAÇÃO IDEALIZADORA:** `supabase db push` aplicando migration em prod (mudança em sistema externo, schema novo)
- [ ] Após apply: `pnpm typegen` regenera types
- [ ] Smoke pós-apply: criar user de teste via service_role → confirmar profile criado pelo trigger
- [ ] **AGUARDA AUTORIZAÇÃO IDEALIZADORA:** registrar `before_user_created` hook via Management API (`scripts/configure-supabase-auth-hooks.sh`)
- [ ] Validar GET após PATCH (defesa contra silent-drop, lição da `auth.0`)
- [ ] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `./scripts/check-rsc-boundaries.sh`
- [ ] Gate `@data-engineer` (Dara) — review DDL, RLS, índices, performance
- [ ] Gate `@compliance-br` (Têmis) — review storage de PII (`phone_encrypted` via pgcrypto), imutabilidade do consent, base legal
- [ ] QA self-gate (@qa)
- [ ] Commit final + push + PR open + CI verde + smoke prod + merge squash
- [ ] STATE.md sync

## Dependencies

- **Interna:** `auth.0` (foundation) ✅ Done. Esta story depende de Sentry scrubbing já ativo (caso a migration falhe, error capturado fica sem PII).
- **Externa (idealizadora):** autorização para `supabase db push` em prod (schema change). Autorização para registrar `before_user_created` hook via Management API.

## Definition of Done

- [ ] Todos os 10 ACs atendidos
- [ ] Migration aplicada em prod e validada via GET (3 tabelas existem, RLS habilitada, trigger funciona)
- [ ] `pnpm typegen` regenerou types incluindo as 3 tabelas novas
- [ ] Suíte RLS estendida verde no CI
- [ ] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `./scripts/check-rsc-boundaries.sh` verdes
- [ ] Smoke transacional via service_role: cria `auth.users` → profile aparece automaticamente; tenta INSERT em consent imutável → bloqueado por RLS
- [ ] Gate `@data-engineer` APPROVE (DDL + RLS + índices)
- [ ] Gate `@compliance-br` APPROVE (PII storage + consent imutável + base legal)
- [ ] PR mergeado em main; Vercel prod deploy READY
- [ ] STATE.md atualizado refletindo `auth.1` Done
- [ ] Conteúdo dos termos NÃO é responsabilidade desta story — fica para `auth.2`

## Dev Notes

### Por que `phone` é encrypted antes de armazenar

NFR-SE-04 do PRD obriga: "Dados pessoais sensíveis (CPF, telefone, email) devem ser **criptografados em repouso**". Padrão estabelecido em `customers.cpf_encrypted bytea` via `pgp_sym_encrypt(...)` usando `COLUMN_ENCRYPTION_KEY` (256 bits hex). Mesmo padrão se aplica a `profiles.phone_encrypted`.

`phone_last_four text` permite exibir "(11) ****-1234" na UI sem decriptar — útil para confirmação visual sem expor PII.

Email NÃO precisa de encryption-at-column adicional porque já é gerenciado pelo Supabase Auth (criptografia em repouso nativa via `auth.users`).

### Por que NÃO armazenar `phone` no JWT

Decisão D5 da auditoria: JWT vai em todo header de request, aparece em Sentry breadcrumb, Vercel logs, edge cache. Phone em claim = vazamento sistemático de PII. JWT só carrega `org_id` (existente) + `full_name` (novo nesta story). Phone é lido sob demanda em `profiles` quando precisar exibir.

### Por que `consent_records` é imutável

LGPD exige auditabilidade do consentimento (Art. 9º §6º). Permitir UPDATE/DELETE pelo próprio usuário compromete a evidência de aceite. RLS bloqueia ambos.

Para "retirar consentimento", a UX correta é: criar registro NOVO de revogação (futura tabela `user_consent_revocations` em Sprint 9) — não apagar o histórico.

### Por que `legal_documents` é INSERT-only via service_role

Mudança de versão de termos é evento auditável e versionado. `auth.2` (próxima story) vai inserir v1.0.0 via migration nova — não via app. Isso garante imutabilidade do conteúdo (`content_hash` deve bater com SHA-256 de `content_md` — não testado nesta story, fica para `auth.2`).

### Por que `before_user_created` precisa de chamada à Management API separada

Hook não é registrado automaticamente quando a função existe. Supabase exige `PATCH /v1/projects/{ref}/config/auth` setando `hook_before_user_created_enabled=true` e `hook_before_user_created_uri`. Script novo `scripts/configure-supabase-auth-hooks.sh` faz isso de forma idempotente + valida via GET (lição `auth.0`).

### Lista de domínios descartáveis (não-exaustiva, atualizar conforme abuso)

mailinator.com, 10minutemail.com, 10minutemail.net, guerrillamail.com, guerrillamail.net, guerrillamail.org, guerrillamailblock.com, sharklasers.com, grr.la, tempmail.com, tempmail.net, temp-mail.org, throwawaymail.com, getairmail.com, mailnesia.com, mintemail.com, dispostable.com, fakeinbox.com, mytrashmail.com, trashmail.com, trashmail.net, yopmail.com, yopmail.net, mailcatch.com, spamgourmet.com, mailtothis.com, deadaddress.com, fakemailgenerator.com, getnada.com, jetable.org

(30 domínios — base canônica de "throwaway email" services).

### Migration estrutural — checklist anti-foot-gun

- ✅ `IF NOT EXISTS` em todas as criações de tabelas/índices
- ✅ `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` antes das policies
- ✅ `FORCE ROW LEVEL SECURITY` em `profiles` e `user_consent_records` (impede bypass por superuser owner)
- ✅ `DROP POLICY IF EXISTS` antes de cada `CREATE POLICY` (idempotência se aplicada 2×)
- ✅ Functions `SECURITY DEFINER` com `SET search_path = public, pg_temp` (defesa contra search_path injection)
- ✅ Triggers usam `BEFORE`/`AFTER INSERT` apropriado
- ✅ `ON DELETE CASCADE` para `auth.users` + `ON DELETE RESTRICT` para `legal_documents` em consent
- ✅ Comments em cada tabela citando PRD/ADR (rastreabilidade)

### Plano de rollback (se algo der errado em prod)

Migration cria objetos novos (não destrutivos exceto a alteração da função `custom_access_token_hook`). Rollback:

```sql
DROP TABLE IF EXISTS public.user_consent_records CASCADE;
DROP TABLE IF EXISTS public.legal_documents CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.before_user_created_block_disposable_emails(jsonb) CASCADE;
DROP INDEX IF EXISTS public.organizations_cnpj_unique;
-- Restaurar função custom_access_token_hook na versão pré-mudança (cópia em supabase/migrations/20260416000400_auth_setup.sql:50-86)
```

Plano salvo em `docs/runbooks/auth-v2-story-1-rollback.md`.

## QA Results

_(a preencher pelo @qa após implementação)_

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-03 | 1.0 | Story criada com pre-flight verde (zero CNPJ duplicado em prod, target tables ausentes, última migration `20260501000300`). Schema novo com 3 tabelas + extensão de Auth Hook + 2 hooks (trigger + before_user_created) + UNIQUE INDEX parcial + suíte RLS estendida. ACs cobrem encryption-at-column, imutabilidade de consent, hook pra bloquear emails descartáveis, e custom claim full_name no JWT. | `@aiox-master` (Orion) atuando como `@sm` (River) |
| 2026-05-03 | 1.1 | @po validou 10/10 (título claro, AC testáveis com smoke, scope IN/OUT explícito separando conteúdo de termos pra auth.2, dependências mapeadas, plano de rollback presente, alinhamento com ADRs e NFR-SE-04). Status Draft → Ready. | `@aiox-master` (Orion) atuando como `@po` (Pax) |
