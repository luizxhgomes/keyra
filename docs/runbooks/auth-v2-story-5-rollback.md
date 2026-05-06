# Runbook — Rollback da Story `auth.5` (Esqueci Senha)

**Status:** plano de contingência (não foi disparado)
**Story:** `docs/stories/auth.5.story.md`
**EPIC:** `docs/stories/EPIC-AUTH-V2.md`
**Migration alvo:** `supabase/migrations/20260506000100_password_reset_attempts.sql`

---

## Quando disparar este rollback

- Cooldown bug bloqueando todos os usuários (ex.: RPC retornando sempre `false`).
- Template de email recovery aplicado em prod gerando bounce massivo.
- Server Action `requestPasswordResetAction` em loop / timeout afetando toda autenticação.
- Sentry capturando volume anormal de erros em `(auth)/esqueci-senha` ou `(auth)/redefinir-senha`.

> **NÃO disparar para:**
> - Erros isolados de usuário (ex.: 1 email bouncing) → checar `auth.audit_log_entries`.
> - Cooldown legítimo bloqueando o **mesmo** email duas vezes em 60s.
> - Smoke da idealizadora reclamando de UX (refinar copy, não reverter).

---

## Rollback A — Frontend / Server Actions (revert do PR)

```bash
# Identifica o commit do merge da auth.5
git log --oneline --grep="auth.5" -10

# Cria branch de rollback a partir de main
git checkout main
git pull
git checkout -b hotfix/revert-auth-5

# Reverte o merge
git revert -m 1 <SHA-DO-MERGE>

# Push direto (rotina de hotfix de produção — autoriza @devops)
@devops *push hotfix/revert-auth-5 --to main --message "revert: auth.5 (motivo: ...)"
```

Tempo estimado: 2-3 minutos (Vercel rebuild).

---

## Rollback B — Schema (drop da tabela e RPC)

```sql
-- Conectar ao Supabase prod com role privilegiada (service_role ou owner)
-- via supabase studio (SQL Editor) ou psql remoto.

BEGIN;

-- 1) Drop função RPC
DROP FUNCTION IF EXISTS public.request_password_reset_check_cooldown(text) CASCADE;

-- 2) Drop tabela (CASCADE remove policies)
DROP TABLE IF EXISTS public.password_reset_attempts CASCADE;

-- 3) Confirmar limpeza
SELECT to_regclass('public.password_reset_attempts');             -- esperado: NULL
SELECT proname FROM pg_proc WHERE proname = 'request_password_reset_check_cooldown';  -- esperado: 0 rows

-- Se tudo OK:
COMMIT;
```

Tempo estimado: <30s.

> **Atenção:** Se a Server Action ainda estiver no código (ainda não rodou Rollback A), ela passará a falhar (RPC ausente). Sempre rodar **A primeiro, B depois** — exceto se o frontend já estiver protegido por feature flag.

---

## Rollback C — Template de email recovery (Management API)

Restaurar template padrão Supabase (em inglês) ou template anterior (se houver snapshot):

```bash
# Pré-requisitos: .keyra-secrets/supabase.token + .keyra-secrets/supabase-project-ref.txt

REF=$(tr -d '[:space:]' < .keyra-secrets/supabase-project-ref.txt)
TOKEN=$(tr -d '[:space:]' < .keyra-secrets/supabase.token)

# Ver template atual (snapshot defensivo antes de mexer)
curl -s -H "Authorization: Bearer ${TOKEN}" \
  "https://api.supabase.com/v1/projects/${REF}/config/auth" \
  | jq '.mailer_subjects_recovery, .mailer_templates_recovery_content' \
  > .keyra-secrets/recovery-template-snapshot.json

# Restaurar default Supabase (string vazia → Supabase usa template embutido)
curl -s -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"mailer_subjects_recovery":null,"mailer_templates_recovery_content":null}' \
  "https://api.supabase.com/v1/projects/${REF}/config/auth"

# Validar via GET (defesa contra silent-drop)
curl -s -H "Authorization: Bearer ${TOKEN}" \
  "https://api.supabase.com/v1/projects/${REF}/config/auth" \
  | jq '.mailer_subjects_recovery, .mailer_templates_recovery_content'
```

Tempo estimado: <1 minuto.

---

## Pós-rollback — comunicação

1. **Idealizadora**: avisar via canal habitual com diagnóstico curto:
   - O que quebrou (1 frase)
   - O que foi revertido (A, B, C — pode ser parcial)
   - Próximos passos (refazer story em sprint X com correção)
2. **Sentry**: marcar issues em `(auth)/esqueci-senha` ou `(auth)/redefinir-senha` como `resolved` com nota `revert auth.5`.
3. **STATE.md**: voltar status da `auth.5` para `Draft` na §3 e adicionar entrada em §8 Histórico explicando o revert.
4. **`auth.5.story.md`**: adicionar entrada no Change Log com `Rollback executado em {data}; motivo: ...`

---

## Inputs para post-mortem

- Logs Vercel `/api/*` últimas 6h: `vercel logs --follow`
- Sentry issues filtrando `transaction:/(auth)/esqueci-senha` ou `transaction:/(auth)/redefinir-senha`
- Supabase audit log: `SELECT * FROM auth.audit_log_entries WHERE created_at > now() - interval '6 hours' ORDER BY created_at DESC LIMIT 200`
- Sentry breadcrumbs `request_password_reset` agregados por `outcome`

---

*Runbook criado em 2026-05-06 junto com o draft da Story auth.5.*
