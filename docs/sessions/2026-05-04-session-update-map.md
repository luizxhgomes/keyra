# Session Update Map — 2026-05-04

**Sessão:** 2026-05-03 a 2026-05-04 (multi-dia)
**Contexto:** Mapeamento UX da idealizadora → abertura EPIC-AUTH-V2 → execução completa da Fase A + B + visual revamp.

Este documento serve como **checkpoint de encerramento de sessão** — lista tudo que foi feito, o que foi atualizado nos docs, e dá feedback final de conformidade.

---

## 1. Stories executadas (6 de 10 do EPIC-AUTH-V2)

| Story | Status | PR | SHA squash em main |
|-------|--------|-----|---------------------|
| `auth.0` Foundation segurança | ✅ Done | [#3](https://github.com/luizxhgomes/keyra/pull/3) | `dbc753e` |
| `auth.1` Schema profiles+consent+legal_documents+hook update | ✅ Done | [#4](https://github.com/luizxhgomes/keyra/pull/4) | `eaa3520` |
| `auth.2` Termos + Privacidade v1.0.0 | ✅ Done | [#5](https://github.com/luizxhgomes/keyra/pull/5) | `5cd4900` |
| `auth.3` Cadastro estruturado | ✅ Done | [#5](https://github.com/luizxhgomes/keyra/pull/5) | `5cd4900` |
| `auth.4` Login email+senha | ✅ Done | [#5](https://github.com/luizxhgomes/keyra/pull/5) | `5cd4900` |
| `auth.7` Custom claim full_name no AppShell | ✅ Done | [#5](https://github.com/luizxhgomes/keyra/pull/5) | `5cd4900` |
| `auth.5` resetPasswordForEmail (recovery sem magic link) | ⏸️ Pendente | — | — |
| `auth.6` Google OAuth | ⏸️ Pendente | — | — |
| `auth.8` BroadcastChannel | ⏸️ Pendente | — | — |
| `auth.9` Visual revamp AppShell autenticado | ⏸️ Pendente | — | — |

### PRs adicionais (visual revamp não-story)

| PR | SHA | O quê |
|----|-----|-------|
| [#6](https://github.com/luizxhgomes/keyra/pull/6) | `79794cb` | Dark glassmorphism (revertido) |
| [#7](https://github.com/luizxhgomes/keyra/pull/7) | `14ec8e3` + `5ad5805` | Light KEYRA mantendo estrutura HextaUI |

**Total mergeado em main:** 5 PRs (#3, #4, #5, #6, #7) + 1 commit de redeploy trigger (`5ad5805`).

---

## 2. Migrations Supabase em prod

Todas registradas em `supabase_migrations.schema_migrations`:

| Versão | Conteúdo |
|--------|----------|
| `20260503000100` | Schema base: `profiles` + `legal_documents` + `user_consent_records` + UNIQUE CNPJ + trigger `on_auth_user_created` + `before_user_created_block_disposable_emails` + backfill profiles |
| `20260503000150` | Fix: hook lê `event.user.email` (path correto do GoTrue, descoberto via smoke) |
| `20260503000200` | `CREATE OR REPLACE` da `custom_access_token_hook` adicionando claim `full_name` + `EXCEPTION WHEN OTHERS RETURN event` (fallback defensivo) |
| `20260504000100` | Seed `legal_documents` v1.0.0 (Termos + Privacidade) + RLS pra anon |
| `20260504000200` | RPC `signup_create_account_atomic` (signature inicial) |
| `20260504000300` | RPC `signup_create_account_atomic` final com encryption inline (`pgp_sym_encrypt`) |

---

## 3. Configurações em sistemas externos

| Sistema | Mudança | Validação |
|---------|---------|-----------|
| **Supabase Auth (prod)** | `mailer_autoconfirm=false`, `password_min_length=10`, `password_required_characters=lower+upper+digits`, `security_update_password_require_reauthentication=true`, `mailer_otp_exp=1800`, `rate_limit_email_sent=30`, `refresh_token_rotation_enabled=true` | 7/7 validados via GET API |
| **Supabase Auth Hooks** | `hook_before_user_created_enabled=true` apontando pra função PG | Smoke: signup com `@mailinator.com` → 422 ✅ |
| **Cloudflare Turnstile** | Widget `keyra` criado (Managed mode, hostnames `usekeyra.com`+`localhost`) | Secret validada via API Cloudflare antes de provisionar |
| **Vercel envs** | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` em Production+Preview+Development | Confirmado via GET `/v9/projects/{id}/env` |
| **Supabase Admin API** | Senha temporária `Keyra2026Test!` setada nos 2 users existentes do Luiz | Login email+senha funcional em prod |
| **Supabase profiles (prod)** | `full_name="Luiz Henrique"` populado nos 2 profiles existentes | Hook emite claim com full_name confirmado via invocação direta |

---

## 4. Documentos atualizados nesta sessão (encerramento 2026-05-04)

| Documento | O que mudou |
|-----------|-------------|
| `docs/STATE.md` | Header consolidado refletindo 6 stories Done + 6 migrations + light KEYRA em prod. §6 Próxima Ação atualizada com auth.5/6/8/9 pendentes. |
| `docs/architecture/ARCHITECTURE.md` | **ADR-010 marcado como SUPERSEDED** por ADR-022. Texto histórico preservado. ADR-022 já estava publicado em §11.2 desde a sessão da auth.0. |
| `docs/stories/EPIC-AUTH-V2.md` | Status `🟢 Em execução` → `🟡 6/10 Done`. Tabela de stories com status individual + SHA da PR. |
| `docs/stories/auth.0.story.md` + `auth.1.story.md` | Marcadas como Done com Change Log completo (criadas durante a sessão) |
| `docs/audit/auth-v2-security-audit.md` | Criado durante a sessão, 744 linhas com 22 riscos + 12 decisões |
| `docs/runbooks/auth-v2-story-1-rollback.md` | Runbook de rollback do hook custom_access_token_hook (`<30s` via psql) |
| `docs/legal/terms-v1.0.0.md` + `privacy-v1.0.0.md` | Textos legais redigidos (com placeholders KEYRA pré-CNPJ formal — autorizado pela idealizadora) |
| `docs/sessions/2026-05-04-session-update-map.md` | Este documento — checkpoint de encerramento |

### Documentos NÃO modificados nesta sessão (mas que podem precisar revisão futura)

| Documento | Razão de não ter mudado |
|-----------|--------------------------|
| `CLAUDE.md` | Não houve novas regras AIOX nesta sessão. Apenas execução de epic já existente. |
| `.claude/rules/*.md` | Idem. RSC boundary rules da sessão anterior continuam vigentes. |
| `docs/IMPLEMENTATION-MAP.md` | Não atualizado nesta sessão por escolha de escopo — pode precisar de update futuro adicionando `profiles`, `user_consent_records`, `legal_documents` na matriz. **Isto não bloqueia encerramento da sessão**, é refinamento de doc. |
| `docs/prd/PRD-KEYRA.md` | Não foi tocado. Mudanças de auth são compatíveis com NFR-SE-* e CON-LG-* já existentes no PRD. |

---

## 5. Memories permanentes criadas/atualizadas

| Memory file | Tipo | Conteúdo |
|-------------|------|----------|
| `feedback_supabase_patch_silent_drop.md` | feedback | Lição: Supabase PATCH retorna 200 silenciosamente droppando campos com naming errado — sempre validar via GET após PATCH |
| `feedback_vercel_pro_deferred.md` | feedback | Vercel Pro deferido pela idealizadora — não sugerir como ação imediata |
| `reference_turnstile_widget.md` | reference | Widget Turnstile do KEYRA (sitekey, hostnames, helper, rotation futura) |
| `MEMORY.md` (index) | atualizado | 3 entries novas adicionadas |

---

## 6. Aprendizados operacionais desta sessão

| Lição | Onde aplicar daqui pra frente |
|-------|-------------------------------|
| **Stories de foundation precisam ser explicitas sobre "0% impacto visual"** | Em qualquer story que seja só backend/config, avisar antes da aprovação que UI não muda |
| **Smoke pós-apply pega bugs reais que code review não pega** | Manter prática de smoke E2E logo após cada apply em prod |
| **PATCH Supabase Management API silently dropa campos com naming errado** | Sempre validar via GET após qualquer PATCH (memory permanente registrada) |
| **API de "promote preview to production" do Vercel só aceita deployments target=production** | Pra promover preview → prod, usar Dashboard ou novo deploy via CLI; não tentar API direta |
| **Refactor extra (renames, .gitignore, etc.) numa tarefa simples gera atrito desnecessário** | Quando o pedido é "trocar X", limitar diff a X. Refactor extra vira story própria. |
| **Empty commit pode ser CANCELED pelo Vercel se outro deploy estiver em pipeline paralelo** | Usar diff mínimo real (1 linha em qualquer arquivo) em vez de empty commit pra triggar webhook |

---

## 7. Status executável em prod (verificável agora)

```bash
# Ir em https://usekeyra.com/login
# Login: luizzzhenriqueoficial@gmail.com / Keyra2026Test!
# Resultado: tela light KEYRA com email+senha, dashboard mostra "Olá, Luiz Henrique"
```

| Verificação | Como verificar | Resultado esperado |
|-------------|----------------|---------------------|
| `/login` carrega | `curl -s -o /dev/null -w "%{http_code}" https://usekeyra.com/login` | 200 |
| Cor light KEYRA aplicada | `curl -s https://usekeyra.com/login \| grep -c 'bg-background'` | ≥ 1 |
| Dark removido | `curl -s https://usekeyra.com/login \| grep -c 'bg-\[#121212\]'` | 0 |
| `/cadastro` 200 com 8 campos | abrir manualmente | 8 inputs visíveis |
| `/termos` v1.0.0 | `curl -s https://usekeyra.com/termos \| grep -c 'Termos de Uso da KEYRA'` | 1 |
| `/privacidade` v1.0.0 | `curl -s https://usekeyra.com/privacidade \| grep -c 'Política de Privacidade'` | ≥ 1 |
| Hook anti-mailinator | tentar signup com `@mailinator.com` | 422 erro |

---

## 8. Pendências NÃO-bloqueantes pra próxima sessão

1. **Validação manual da idealizadora em mobile real** — abrir `/login` em iPhone/Android e confirmar visual + login funcional (recomendado antes de abrir auth.5)
2. **Stories auth.5, 6, 8, 9** — pendentes do EPIC-AUTH-V2
3. **`docs/IMPLEMENTATION-MAP.md`** — atualizar matriz com `profiles`, `user_consent_records`, `legal_documents`
4. **Sprint 8 hardening original** — congelada (vira "Sprint 9" quando Auth V2 fechar). Stories `h8.1-h8.8` ainda válidas.
5. **Pendências jurídicas dos Termos** — KEYRA ainda sem CNPJ formal; quando virar pessoa jurídica, redrafetar Termos v1.1.0 e forçar re-aceite via modal
6. **Rotação de credentials antigas** — Vercel/Supabase/Sentry tokens expostos em chat anterior (risco aceito)

Nenhuma das 6 acima bloqueia uso atual da plataforma.

---

## ✅ Feedback final de encerramento

**Pode encerrar a sessão com segurança.**

Critérios de "tudo no sistema" cumpridos:
- ✅ Todas as 6 stories Done estão mergeadas em `main` (SHAs verificados)
- ✅ Vercel prod deploy em READY no commit `5ad5805` (último redeploy)
- ✅ 6 migrations registradas em `supabase_migrations.schema_migrations`
- ✅ Configurações Supabase Auth + Turnstile + Vercel envs validadas via GET API
- ✅ STATE.md, ARCHITECTURE.md (ADR-010 superseded), EPIC-AUTH-V2.md atualizados
- ✅ Memories permanentes salvas (Supabase silent-drop, Vercel Pro deferido, Turnstile widget)
- ✅ Mapa de atualização (este documento) commitado
- ✅ `usekeyra.com` operacional com tela auth light KEYRA + login funcional

Próxima sessão: começar pela leitura de `docs/STATE.md` (header) + este documento + `docs/stories/EPIC-AUTH-V2.md` pra contexto.
