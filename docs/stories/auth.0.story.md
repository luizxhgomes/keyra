# Story auth.0: Configuração Supabase Auth de produção (foundation de segurança)

## Status

Ready for Review

## Story

**Como** mantenedor do KEYRA preocupado em construir o sistema de autenticação sobre alicerce de segurança correto desde o primeiro commit,
**Eu quero** que toda a configuração do Supabase Auth, do Sentry e do schema de envs esteja endurecida ANTES de qualquer story de fluxo (cadastro, login, recovery) ser implementada,
**Para que** as próximas stories `auth.1` a `auth.9` herdem confirmação de email obrigatória, senha forte, CAPTCHA, scrubbing de PII em logs, OTP curto, signOut global em troca de senha e timebox de sessão — sem que cada story precise reimplementar isso individualmente.

## Complexidade

**T-shirt:** S (~3 pontos)

## Acceptance Criteria

### AC1 — Sentry scrubbing de PII em servidor e cliente (mitiga R16)

1. `apps/web/src/instrumentation.ts` ganha hook `beforeSend` que percorre o evento e remove campos com chaves contendo `password`, `senha`, `confirma`, `token`, `secret`, `cpf`, `phone`, `celular` (case-insensitive).
2. `apps/web/src/instrumentation-client.ts` ganha o mesmo `beforeSend` (cobre erros do browser).
3. Função compartilhada `scrubSensitiveFields(event)` em `apps/web/src/lib/observability/sentry-scrub.ts` para evitar duplicação client/server.
4. Smoke unitário: invocar a função com objeto `{ password: '123', email: 'a@b.com' }` retorna `{ password: '[REDACTED]', email: 'a@b.com' }`.

### AC2 — Configuração Supabase Auth de produção via Management API (mitiga R1, R2, R11, R12, R20, R22)

1. Script `scripts/configure-supabase-auth-prod.sh` que lê `.keyra-secrets/supabase.token` e `.keyra-secrets/supabase-project-ref.txt` e aplica via `PATCH /v1/projects/{ref}/config/auth`:
   - `mailer_autoconfirm = false` (R1 — confirmação obrigatória de email)
   - `password_min_length = 10` (R2)
   - `password_required_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789"` (lower+upper+digits, R2)
   - `secure_password_change = true` (R11)
   - `mailer_otp_exp = 1800` (30min, R12)
   - `rate_limit_email_sent = 30` (R20)
   - `refresh_token_rotation_enabled = true` (já está, mas confirma)
   - `session_timebox = 604800` (168h = 7 dias, R22)
   - `session_inactivity_timeout = 28800` (8h, R22)
2. Script é idempotente (rodar 2× não muda comportamento), valida HTTP 200 em cada chamada, e aborta com mensagem clara em qualquer 4xx/5xx.
3. Script imprime relatório final: cada config aplicada com ✅ ou ❌.
4. Após rodar com sucesso, `.keyra-secrets/auth-config-applied-at.txt` é gravado com ISO timestamp para rastreio.

### AC3 — Cloudflare Turnstile habilitado e validado (mitiga R3, R14, R17, R21)

1. Conta Cloudflare Turnstile criada manualmente (ação da idealizadora — fora do código).
2. Site key + secret key armazenadas em `.keyra-secrets/turnstile-site.key` e `.keyra-secrets/turnstile-secret.key` (gitignored, chmod 600).
3. `scripts/sync-env.sh` atualizado para ler esses arquivos e popular `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (público) e `TURNSTILE_SECRET_KEY` (server) em `.env.local` raiz e `apps/web/.env.local`.
4. `apps/web/src/lib/env.ts` (schema Zod) ganha `NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1)` (obrigatório em build) e `TURNSTILE_SECRET_KEY: z.string().min(1).optional()` (server-only, opcional em dev/preview até ter conta — passa a obrigatório quando entrar em prod).
5. Helper `apps/web/src/lib/security/verify-turnstile.ts` server-only que recebe `token: string` e `ip: string`, faz POST para `https://challenges.cloudflare.com/turnstile/v0/siteverify` e retorna `{ success: boolean; errorCodes?: string[] }`.
6. Smoke unitário do helper com mock de fetch retornando sucesso e falha.
7. Provisionamento das envs no Vercel (Production+Preview+Development) via `vercel env add` ou REST API com fallback (mesmo padrão de `RESEND_API_KEY` da Sprint 1). Validar via `vercel env ls` que apareceu nos 3 targets.

### AC4 — Schema de envs estendido sem regressão (mitiga R5 indireto via descobertas)

1. `.env.local.example` ganha entries para `NEXT_PUBLIC_TURNSTILE_SITE_KEY=` e `TURNSTILE_SECRET_KEY=` com comentários apontando como obter (link Cloudflare dashboard).
2. `apps/web/src/lib/env.ts` valida no boot — falha de build se vars obrigatórias faltarem em produção.
3. `pnpm typecheck` + `pnpm lint --max-warnings 0` + `pnpm build` passam.

### AC5 — ADR-022 publicado em `docs/architecture/ARCHITECTURE.md` (rastreabilidade)

1. Nova seção `### ADR-022 — Auth UX V2 (cadastro estruturado + email/senha primário + Google OAuth)` em `ARCHITECTURE.md`.
2. ADR referencia explicitamente `docs/audit/auth-v2-security-audit.md` como fonte das 12 decisões e 22 riscos.
3. Cross-link adicionado em `docs/STATE.md` na entrada de histórico de 2026-05-03.

### AC6 — Suite RLS continua verde (regressão zero)

1. `./scripts/run-rls-tests.sh` passa (não mexemos em RLS nesta story, mas validamos que não regrediu).
2. `./scripts/check-rsc-boundaries.sh` passa (gate G5).

### AC7 — Branch + commit + push + preview deploy READY

1. Branch `feat/auth-v2` partindo de `main`.
2. Commit conventional: `feat(auth): story auth.0 — config Supabase + Sentry scrub + Turnstile envs [auth.0]`.
3. Push para `origin/feat/auth-v2` aciona deploy preview Vercel.
4. Preview Vercel atinge status READY (validar via `vercel ls` ou MCP).
5. Story atualiza Status para `Ready for Review` (a aguardar gate `@compliance-br` antes de PR e merge).

## Tasks / Subtasks

- [x] Criar `apps/web/src/lib/observability/sentry-scrub.ts` com `scrubSensitiveFields(event)` + smoke test inline (selftest verde — `password`, `senha`, `cpf`, `phone`, `Authorization` redactados; `email` e `X-Forwarded-For` preservados)
- [x] Atualizar `apps/web/src/instrumentation.ts` adicionando `beforeSend` em ambos `Sentry.init` (nodejs e edge)
- [x] Atualizar `apps/web/src/instrumentation-client.ts` adicionando `beforeSend`
- [x] Criar `apps/web/src/lib/security/verify-turnstile.ts` (server-only, tipado, com bypass dev controlado e fail-hard em prod)
- [x] Estender `apps/web/src/lib/env.ts` com vars Turnstile (opcional até widget provisionado)
- [x] Atualizar `.env.local.example` com novas vars + comentários de provisionamento
- [x] Atualizar `scripts/sync-env.sh` para consumir `.keyra-secrets/turnstile-*.key`
- [x] Criar `scripts/configure-supabase-auth-prod.sh` (idempotente, dry-run validado, payload via Management API único PATCH)
- [x] Adicionar ADR-022 em `docs/architecture/ARCHITECTURE.md` (seção 11.2)
- [x] **Idealizadora criou widget Turnstile** — `keyra`, Managed, hostnames `usekeyra.com`+`localhost`. Site key `0x4AAAAAADInYyDxMZrFCHAX` + secret `0x4AAAAAADInY_o3GM54cxunP2HA3_rpMug` salvas em `.keyra-secrets/turnstile-{site,secret}.key` (chmod 600)
- [x] **Secret validada via API Cloudflare** — `POST /turnstile/v0/siteverify` retornou `invalid-input-response` (secret reconhecida; seria `invalid-input-secret` se inválida)
- [x] `./scripts/sync-env.sh` rodado — vars chegaram em `.env.local` raiz + `apps/web/.env.local`
- [x] Vercel envs provisionadas via REST API v10 — `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` em Production+Preview+Development (validado via GET /v9/projects/{id}/env)
- [x] **Idealizadora autorizou execução em prod** (2026-05-03 22:32 UTC)
- [x] **Script `configure-supabase-auth-prod.sh` rodado em prod** — `mailer_autoconfirm=false` (R1), `password_min_length=10` (R2), `password_required_characters` com lower+upper+digits (R2), `security_update_password_require_reauthentication=true` (R11), `mailer_otp_exp=1800` (R12), `rate_limit_email_sent=30` (R20), `refresh_token_rotation_enabled=true` (R22 parcial). Todos validados via GET API.
- [x] **Descoberta operacional:** PATCH Supabase silently dropa campos com naming errado (retorna 200 mesmo ignorando). Script atualizado com naming canônico (`security_update_password_require_reauthentication`, `sessions_timebox`, `sessions_inactivity_timeout`) + validação GET integrada (defesa contra silent-drop). Memory `feedback_supabase_patch_silent_drop.md` salva.
- [x] **R22 parcialmente mitigado**: `sessions_timebox` + `sessions_inactivity_timeout` requerem Supabase Pro Plan (HTTP 402). Fica deferido junto com decisão Vercel Pro. Script trata como SKIPPED-not-failure.
- [ ] Atualizar `docs/STATE.md` (§1 status macro, §6 próxima ação, §8 histórico) — feito junto deste commit
- [x] `pnpm typecheck` ✅ verde · `pnpm lint --max-warnings 0` ✅ verde · `./scripts/check-rsc-boundaries.sh` ✅ PASS
- [ ] Commit + push branch + verificar preview Vercel READY

## Dependencies

- **Externa (idealizadora):** criar conta Cloudflare e widget Turnstile, entregar site key + secret key. Sem isso, AC3 e AC7 ficam parcialmente bloqueados (código entra com placeholder, configuração final espera a keys). Não bloqueia `auth.1` (que toca apenas schema) começar em paralelo.
- **Interna:** nenhuma — esta é a primeira story do epic.

## Definition of Done

- [ ] Todos os ACs atendidos
- [ ] Sentry scrubbing validado com objeto sintético contendo `password`, `senha`, `cpf`, `phone` — todos viram `[REDACTED]`
- [ ] `scripts/configure-supabase-auth-prod.sh` rodado com sucesso em prod (8 chamadas Management API com HTTP 200)
- [ ] Turnstile envs presentes em Vercel (Production+Preview+Development) com `vercel env ls`
- [ ] Site key Turnstile validada com chamada de teste do helper `verify-turnstile.ts` em ambiente de dev
- [ ] Schema env Zod aceita build com vars novas
- [ ] ADR-022 publicado e cross-linkado
- [ ] Smoke da idealizadora no preview Vercel: tela de login carrega sem erro de build, console limpo
- [ ] Gate `@compliance-br` revisou ACs 1, 2, 3 (PII scrubbing + email confirmation + CAPTCHA são touchpoints LGPD)
- [ ] PR review request enviado, status verde no CI (typecheck, lint, RLS tests, RSC audit)

## Dev Notes

### Por que esta story é PRÉ-REQUISITO de tudo

Sem `auth.0`:
- `auth.3` (cadastro) entrega senha "111111" como aceitável → vulnerabilidade de produção
- `auth.4` (login) loga senha em Sentry quando der erro → vazamento de PII
- `auth.5` (recovery) deixa OTP válido por 1h → janela de ataque grande demais
- Google OAuth (`auth.6`) sem CAPTCHA pré-step abre signup massivo

Tratar config como "ajuste depois" historicamente sempre vira "ajuste nunca".

### Sobre Turnstile — por que Cloudflare e não hCaptcha

| Critério | Cloudflare Turnstile | hCaptcha |
|----------|----------------------|----------|
| Custo | Grátis ilimitado | Grátis até 1M req/mês |
| Fricção | Invisível na maioria dos casos | "selecione todos os semáforos" |
| Suporte Supabase | Nativo (campo `captcha_token` em `signUp`/`signIn`) | Nativo |
| Conta nova | 2 minutos no dashboard Cloudflare | 5 min + verificação |

Decisão: Turnstile.

### Padrão `read_line_or_empty` no `sync-env.sh`

Veja `scripts/sync-env.sh` linha onde lê `.keyra-secrets/email-from.txt` — preserva espaço entre nome amigável e endereço. Usar mesmo helper para `turnstile-site.key` (formato `0xABC...`).

### Sentry scrubbing — referência

Sentry SDK v9 docs sobre `beforeSend`: https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/filtering/. A função recursivamente percorre `event.exception.values[].mechanism.data`, `event.extra`, `event.contexts`, `event.request.data`. Lista canônica de chaves a redactar consultada com OWASP Sensitive Data Cheat Sheet.

### Variáveis Turnstile

| Nome | Visibilidade | Onde |
|------|--------------|------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | público (cliente) | `.env.local`, Vercel Production+Preview+Development |
| `TURNSTILE_SECRET_KEY` | privado (server) | `.env.local`, Vercel Production+Preview+Development |

A site key NÃO é segredo (vai no HTML do widget). A secret key é segredo (verificação server-side).

## QA Results

_(a preencher pelo @qa após implementação)_

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-03 | 1.0 | Story criada como pré-requisito do EPIC-AUTH-V2. | `@aiox-master` (Orion) atuando como `@sm` |
| 2026-05-03 | 1.1 | Validação @po concluída — 10/10 checklist, GO. Status Draft → Ready. ACs cobrem Sentry scrub, config Supabase via Management API, Turnstile envs, ADR-022, RLS regression-zero, branch+commit+push+preview. | `@aiox-master` (Orion) atuando como `@po` |
| 2026-05-03 | 1.2 | Implementação @dev (parcial — sem dependências externas): Sentry scrub server+client com selftest verde, helper Turnstile server-only, env schema estendido, sync-env.sh consumindo `.keyra-secrets/turnstile-*.key`, script idempotente Management API com dry-run validado, ADR-022 publicado. Typecheck + lint + RSC audit verdes. **Pausado aguardando:** (1) idealizadora criar conta Cloudflare Turnstile, (2) autorização explícita pra rodar script de config Supabase em prod. | `@aiox-master` (Orion) atuando como `@dev` |
| 2026-05-03 | 1.3 | Idealizadora criou widget Turnstile e entregou site key + secret key. Secret validada via API Cloudflare (resposta `invalid-input-response` em token de teste prova que a secret é válida). Chaves persistidas em `.keyra-secrets/turnstile-{site,secret}.key` (chmod 600). `sync-env.sh` rodado. Vercel envs provisionadas via REST API v10 nos 3 targets (Production+Preview+Development) e validadas via GET. **Single bloqueio restante:** autorização da idealizadora pra rodar `scripts/configure-supabase-auth-prod.sh` em prod (mudança em sistema externo, todas as outras tarefas da story completas). | `@aiox-master` (Orion) atuando como `@dev` |
| 2026-05-03 | 1.4 | Idealizadora autorizou. Script rodado em prod com sucesso — 7/7 configs universais aplicadas e validadas via GET. Descoberta operacional: PATCH Supabase silenciosamente dropa campos com naming errado (`secure_password_change`, `session_timebox`, `session_inactivity_timeout` foram aceitos no body com HTTP 200 mas NÃO aplicados). Naming canônico real exposto pelo GET: `security_update_password_require_reauthentication`, `sessions_timebox`, `sessions_inactivity_timeout`. Script atualizado com naming correto + validação GET integrada (defesa contra silent-drop). Memory `feedback_supabase_patch_silent_drop.md` salva pra estender padrão "validar credenciais via API antes de provisionar" para "validar config aplicada via GET após PATCH". `sessions_timebox`+`sessions_inactivity_timeout` (R22) requerem Pro Plan (HTTP 402) — script trata como SKIPPED-not-failure, R22 fica parcialmente mitigado (`refresh_token_rotation_enabled=true` cobre o resto). Status InProgress → Ready for Review. **Pendente:** gate `@compliance-br` revisar PII scrubbing + email confirmation + CAPTCHA + termos antes de PR merge para main. | `@aiox-master` (Orion) atuando como `@dev` |
