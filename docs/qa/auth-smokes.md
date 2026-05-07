# Auth Smokes — guia operacional

Esta página agrupa todos os smokes de validação do EPIC-AUTH-V2 (Stories `auth.5` + `auth.8`) que foram criados na sessão de fiscalização de 2026-05-06. O objetivo é fechar os gaps identificados na imagem da fiscalização — cada item tem **forma automatizada** (script) ou **roteiro humano** (checklist).

---

## Mapa: smoke pendente → artefato

| Pendência (fiscalização) | Artefato | Tipo | Roda em | CI |
|---|---|---|---|---|
| Anti-bombing real | [`scripts/smoke-auth-cooldown.sh`](../../scripts/smoke-auth-cooldown.sh) | Bash + psql ROLLBACK | Prod (zero side-effect) | Manual ou setup local |
| Anti-enumeration real | [`scripts/smoke-auth-timing.sh`](../../scripts/smoke-auth-timing.sh) | Bash + curl Server Action | Local dev (`pnpm dev`) | Manual |
| Email identidade KEYRA | [`scripts/validate-recovery-template.sh`](../../scripts/validate-recovery-template.sh) | Bash + Supabase Mgmt API | Prod (idempotente) | ✅ Automático em push main (`auth-recovery-template-drift`) |
| SignOut global (R11) | [`scripts/smoke-auth-signout-global.sh`](../../scripts/smoke-auth-signout-global.sh) | Bash + Admin API + psql | Prod (efeito real) | Manual após deploy de mudança em auth |
| Mobile 375px completo | [`docs/qa/checklists/auth-recovery-mobile-375.md`](checklists/auth-recovery-mobile-375.md) | Checklist humano (7 etapas) | Idealizadora | — |
| Broadcast 2 abas | Mesmo checklist (Etapa 6) | Checklist humano | Idealizadora desktop | — |

---

## Quick reference

### Validar template recovery em prod (cobre #6)

```bash
./scripts/validate-recovery-template.sh
# Output esperado: ✅ 7/7 asserts PASS
# Falha → reaplique com ./scripts/configure-supabase-recovery-template.sh
```

Roda automaticamente no CI a cada push em `main` se os secrets `SUPABASE_ACCESS_TOKEN` e `SUPABASE_PROJECT_REF` estiverem configurados em `Settings → Secrets and variables → Actions`. Sem secrets, o job é no-op.

### Validar cooldown anti-bombing (cobre #3)

```bash
./scripts/smoke-auth-cooldown.sh
# Output esperado: ✅ 4/4 asserts PASS (first_call=true · second_call=false · other_email=true · rows_inserted=2)
# ROLLBACK aplicado — zero impacto em dados reais
```

Pré-requisito: `psql` instalado (macOS: `brew install libpq && brew link --force libpq`).

### Validar anti-enumeration por timing (cobre #2)

```bash
# Em outro terminal: pnpm dev
./scripts/smoke-auth-timing.sh
# Default: 5 trials, threshold 300ms
# Customizar:
./scripts/smoke-auth-timing.sh --trials=10 --base-url=http://localhost:3000
```

Funciona apenas em dev local porque usa `dev-bypass` do Turnstile. Em prod precisa Playwright (story futura).

### Validar signOut global (cobre #4)

```bash
USER_TEST_EMAIL=luizxhenriquepro@gmail.com ./scripts/smoke-auth-signout-global.sh
# ⚠️ EFEITO COLATERAL: faz logout REAL do user em todos dispositivos.
# Pré-requisito: USER_TEST_EMAIL precisa ter sessão ativa (ao menos 1 refresh_token).
```

Validação programática: lê `auth.refresh_tokens` antes/depois e asserta `count_after == 0`.

### Smoke completo mobile 375px (cobre #1, #5, #7)

Abrir [`docs/qa/checklists/auth-recovery-mobile-375.md`](checklists/auth-recovery-mobile-375.md) e seguir as 7 etapas em smartphone real (não DevTools). Critério de Done: **7/7 etapas marcadas**.

---

## Telemetria pós-smoke

Após qualquer smoke real envolvendo `/esqueci-senha`, validar no Sentry (https://sentry.io/organizations/seal-digital/issues/):

1. Filtro: `category:auth.recovery`
2. Esperado por outcome:
   - `outcome: success` → quando reset legítimo dispara
   - `outcome: cooldown` → quando 2º pedido é bloqueado por 60s
   - `outcome: turnstile_fail` → bot scripted
   - `outcome: supabase_error` → falha transitória da Supabase
   - `outcome: invalid_input` → email mal formatado / Zod fail

Volume anormal de `cooldown` ou `turnstile_fail` pode indicar ataque em andamento — definir alarme no Sentry conforme baseline aparecer.

---

## Quando rodar cada smoke

| Trigger | Smokes obrigatórios |
|---|---|
| Push de mudança em `apps/web/src/app/(auth)/**` | template-drift (CI), cooldown (manual), timing (local), checklist humano |
| Push de migration em `supabase/migrations/` que toque `password_reset_attempts` ou RPC | cooldown |
| Push de mudança em `setNewPasswordAction` ou `signOut` calls | signout-global (manual + 2 dispositivos) |
| Mudança no template via dashboard (suspeita) | template-drift roda automático no próximo push em main |
| Deploy prod com Auth UX mudada | checklist mobile-375 com idealizadora |

---

## Origem destes smokes

Sessão de fiscalização 2026-05-06 — após Stories `auth.5` + `auth.8` em prod, a auditoria identificou 6 smokes obrigatórios não executados (premissas dos ACs e Critério Done do EPIC). Esta página + os 4 scripts + o checklist + o job CI fecham 100% do gap dentro do que dá pra automatizar com a stack atual (sem Playwright).
