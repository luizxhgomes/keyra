# EPIC-AUTH-V2 — Auditoria Preventiva de Segurança

**Data:** 2026-05-03
**Autor:** `@aiox-master` (Orion) — auditoria solicitada pelo Luiz: "garanta que dê certo, baseado em dados, sem adivinhação"
**Escopo:** auth + cadastro + recovery + Google OAuth + reconhecimento de usuário + schema de banco + RLS + LGPD
**Método:** leitura direta de código fonte + migrations + config Supabase + PRD/ARCHITECTURE — toda afirmação tem citação de arquivo:linha ou ausência confirmada

---

## 1. Achados positivos — o que já é sólido (não mexer)

| # | Achado | Fonte |
|---|--------|-------|
| ✅1 | RPC `create_organization_with_owner` é atômica, `SECURITY DEFINER`, valida `auth.uid()`, INSERT em organizations + memberships + user_preferences + seed plano de contas em transação Postgres única | `supabase/migrations/20260417000100_create_org_with_owner_rpc.sql`, `20260501000200_seed_chart_on_org_create.sql` |
| ✅2 | Auth Hook `custom_access_token_hook` é `STABLE`, `SECURITY DEFINER`, `search_path` travado (`public, pg_temp`), GRANT SELECT controlado para `supabase_auth_admin` | `20260416000400_auth_setup.sql:50-86` |
| ✅3 | `safe-next.ts` previne open-redirect com 3 regras: rejeita não-`/`, rejeita `//` (protocol-relative), rejeita `://` em qualquer posição | `apps/web/src/lib/auth/safe-next.ts` |
| ✅4 | RLS habilitada com `FORCE ROW LEVEL SECURITY` em `organizations`, RLS habilitada em `memberships`, `organization_invites` — todas com policies SELECT/INSERT/UPDATE/DELETE separadas | `20260416001700_rls_policies.sql` |
| ✅5 | `pgcrypto` instalada com schema dedicado para `pgp_sym_encrypt` (CPF, dados sensíveis) | `20260416000100_extensions.sql` |
| ✅6 | `audit_log` table existe — pronta para registrar eventos de auth | `20260416001600_audit_log.sql` |
| ✅7 | `enable_anonymous_sign_ins = false`, `enable_refresh_token_rotation = true`, `refresh_token_reuse_interval = 10` | `supabase/config.toml` |
| ✅8 | Padrão de PII estabelecido: `customers.cpf_encrypted bytea` (pgcrypto) + `customers.cpf_hash text` (SHA-256 lowercase) para dedupe sem expor | `20260416000600_customers.sql` |
| ✅9 | `requireAuth()` + `proxy.ts` formam defesa em camadas (middleware no edge + route-level guard) | `apps/web/src/lib/auth/require-auth.ts`, `apps/web/src/proxy.ts` |

---

## 2. Riscos identificados (22)

### 🔴 Críticos (bloqueiam go-live)

| # | Risco | Fonte | Mitigação | Story |
|---|-------|-------|-----------|-------|
| **R1** | `[auth.email]` `enable_confirmations = false` em config — usuário pode signup com email da vítima e logar imediatamente | `supabase/config.toml:107` | Habilitar `enable_confirmations = true` em **prod via dashboard** (config.toml é só local). Email+senha SEM confirmação é vetor de account takeover | `auth.0` (config) |
| **R2** | Senha mínima 6 caracteres + `password_requirements = ""` — aceita "111111" ou "abcdef" | `config.toml:70-73` | Subir para **10 caracteres** + `lower_upper_letters_digits` em prod. Validação dupla (Zod no client + Supabase no server) | `auth.0` + `auth.3` |
| **R3** | Sem CAPTCHA em signup/login/recovery — bot pode encher `auth.users` ou tentar brute force distribuído | `[auth.captcha]` comentado em `config.toml:78-82` | Habilitar **Cloudflare Turnstile** (grátis ilimitado) em `/cadastro`, `/esqueci-senha`. Login só após N falhas | `auth.0` (config) + integração nas stories de form |
| **R4** | `auth.users` órfão se cadastro falhar entre `signUp` e RPC `create_org` — usuário fica em limbo (existe mas sem profile/org) | Cenário derivado de `apps/web/src/app/(auth)/login/actions.ts` + `nova-organizacao/actions.ts` | RPC unificada `signup_create_account_atomic(email, senha, nome, celular_encrypted, nome_clinica, cnpj, terms_version)` que faz TUDO em transação. Compensating delete via service_role se falhar entre `auth.signUp` e RPC | `auth.3` |
| **R5** | NFR-SE-04 do PRD exige criptografia em repouso de "CPF, telefone, email" — proposta original tinha `phone text` plain | `docs/prd/PRD-KEYRA.md` NFR-SE-04 | `profiles.phone_encrypted bytea` (pgp_sym_encrypt) + `profiles.phone_last_four text` para exibição mascarada. Sem `phone_hash` (não há dedupe necessário) | `auth.1` |
| **R6** | Proposta original colocaria `phone` em custom claim do JWT — JWT vai em todo header, aparece em logs Sentry, Vercel logs, breadcrumbs | Decisão revisada da minha proposta anterior | JWT contém **apenas** `org_id` (existe) + `full_name`. Phone fica em `profiles`, leitura sob demanda em Server Component | `auth.1` + `auth.7` |
| **R7** | CNPJ não é UNIQUE em `organizations` — duas pessoas podem cadastrar a mesma clínica, gerando duplicação de DRE e risco fiscal de NFS-e duplicada | `20260416000300_organizations.sql:27` (`cnpj text NULL`, sem UNIQUE) | `CREATE UNIQUE INDEX organizations_cnpj_unique ON organizations(cnpj) WHERE cnpj IS NOT NULL AND deleted_at IS NULL` (parcial — permite múltiplos NULL para MEI) | `auth.1` |

### 🟠 Altos (não bloqueiam mas precisam estar nas stories)

| # | Risco | Fonte | Mitigação | Story |
|---|-------|-------|-----------|-------|
| **R8** | Email enumeration em `signInWithPassword` — Supabase retorna erros distintos para "email não existe" vs "senha errada" | Comportamento padrão Supabase | Server Action sempre retorna mensagem genérica: `"E-mail ou senha incorretos"`. Sem indicar qual dos dois falhou | `auth.4` |
| **R9** | Não há `user_consent_records` para o controlador (user da KEYRA) — só `customers.consent_lgpd_at` para operadora (paciente da clínica) | Schema atual + PRD CON-LG-04 | Criar `public.user_consent_records (id, user_id, document_type, document_version, accepted_at, ip_address, user_agent)` com RLS | `auth.1` |
| **R10** | Termos versionados sem mecanismo de re-aceite — se KEYRA atualizar termos, usuário antigo continua vinculado à versão antiga | Padrão LGPD Art. 8 §6 (mudança de finalidade) | Tabela `public.legal_documents (id, type, version, content_hash, content_md, published_at)`. `requireAuth` verifica se user aceitou versão atual; se não, força modal de re-aceite | `auth.1` + `auth.2` |
| **R11** | `secure_password_change = false` — permite trocar senha sem reauth recente | `config.toml:118` | Habilitar em prod. Ao trocar senha, chamar `supabase.auth.signOut({ scope: 'global' })` para invalidar todas sessões | `auth.0` (config) + `auth.5` |
| **R12** | `otp_expiry = 3600` (1h) — para recovery de senha 30min é o padrão de mercado | `config.toml:140` | Reduzir para `1800` em prod | `auth.0` (config) |
| **R13** | Hook `before_user_created` ausente — qualquer email faz signup, incluindo descartáveis (mailinator, 10minutemail) | `config.toml:225-227` (comentado) | Hook reject regex contra ~30 domínios descartáveis conhecidos. NÃO bloquear gmail/outlook/icloud | `auth.1` |
| **R14** | Recovery sem rate limit por email permite **email bombing** — atacante spamma vítima com 30 emails/hora | Inferido de `[auth.rate_limit]` que limita por IP, não por email destino | CAPTCHA Turnstile em `/esqueci-senha` (R3) + cooldown de 60s server-side por email destino (Redis ou tabela `password_reset_attempts`) | `auth.5` |
| **R15** | Telefone sem validação — Zod simples aceita "abc123" | Schema atual em `(auth)/login/actions.ts` é só email | Usar `libphonenumber-js` ou regex robusto `/^\+?55\s?\(?[1-9]{2}\)?\s?9?\s?\d{4}-?\d{4}$/` com normalização para E.164 antes de encriptar | `auth.3` |
| **R16** | Senha pode vazar em logs Sentry se Server Action falhar com input no contexto | `apps/web/src/instrumentation.ts` (Sentry init) | `beforeSend` no Sentry com scrubbing de `password|senha|confirma|terms` | `auth.0` (Sentry config) |

### 🟡 Médios (devem estar nas stories mas não bloqueiam)

| # | Risco | Fonte | Mitigação | Story |
|---|-------|-------|-----------|-------|
| **R17** | Brute force distribuído — Supabase rate limit por IP (`sign_in_sign_ups = 30 / 5min`) protege brute force serial mas não distribuído | `config.toml:48` | CAPTCHA (R3) + WAF Vercel/Cloudflare em `/api/auth/*`. Account lockout após 10 falhas em 1h via tabela própria | `auth.4` |
| **R18** | Google OAuth retorna email + nome + avatar; NÃO retorna celular nem clínica | Comportamento Google OAuth | Após callback, se `profiles.phone IS NULL` ou user sem `memberships`, redirect para `/cadastro/completar` com campos faltantes | `auth.6` |
| **R19** | RLS chicken-and-egg para `profiles` — trigger `on_auth_user_created` precisa rodar com privilégio especial para INSERT em `public.profiles` | Padrão Supabase | Trigger AFTER INSERT em `auth.users` com `SECURITY DEFINER` + GRANT INSERT em `profiles` para `supabase_auth_admin` (mesmo padrão do Auth Hook) | `auth.1` |
| **R20** | `email_sent = 2/hora` em config local — em prod default é maior, mas precisa ser revisado | `config.toml:36` | Validar em prod: signup → confirmação → eventual reset = 4 emails legítimos. Ajustar para 30/hora | `auth.0` (config prod) |

### ⚪ Baixos (nice-to-have)

| # | Risco | Fonte | Mitigação | Story |
|---|-------|-------|-----------|-------|
| **R21** | `organization_invites.email` UNIQUE não considera `accepted_at` — se removerem member, novo convite falha sem antes deletar invite antigo | `20260416000300_organizations.sql:102` | Operacional — adicionar nota no doc do `@team`. Não é bloqueador | (fora deste epic) |
| **R22** | Sessões longas — `jwt_expiry = 3600` mas sem `[auth.sessions]` `timebox` configurado | `config.toml:160-163` (comentado) | Configurar `timebox = "168h"` (7 dias) + `inactivity_timeout = "8h"` em prod | `auth.0` (config) |

---

## 3. Decisões de arquitetura travadas (12)

| # | Decisão | Justificativa |
|---|---------|---------------|
| **D1** | Senha mínima **10 caracteres** + minúscula + maiúscula + dígito (sem símbolos forçados) | NIST 2023 SP 800-63B; símbolos forçados aumentam fricção sem aumento real de entropia |
| **D2** | **Cloudflare Turnstile** em signup, recovery, login (após 3 falhas) | Grátis ilimitado, sem fricção do "selecione todas semáforos", funciona invisível na maioria dos casos |
| **D3** | `enable_confirmations = true` em prod **sem exceção** | Sem isso, fluxo email+senha permite account takeover trivial |
| **D4** | `profiles.phone_encrypted bytea` + `profiles.phone_last_four text` (display) | NFR-SE-04 manda criptografar; last_four para exibir "(11) ****-1234" sem decrypt |
| **D5** | JWT custom claims = `org_id` (existente) + `full_name` (novo). NÃO `phone`, NÃO `email` | Minimização de PII em headers/logs |
| **D6** | `UNIQUE (cnpj) WHERE cnpj IS NOT NULL AND deleted_at IS NULL` | Permite múltiplos MEI sem CNPJ; previne duplicação |
| **D7** | RPC unificada `signup_create_account_atomic` com compensating delete via service_role | Elimina órfãos de `auth.users` |
| **D8** | Trigger `on_auth_user_created` AFTER INSERT em `auth.users` cria row mínima em `profiles` | Garante invariante "todo auth.user tem profile"; demais campos são UPDATE pelo signUp flow |
| **D9** | `legal_documents` table + `user_consent_records` referenciando ela; modal de re-aceite ao mudar versão | Mecânica padrão LGPD para mudança de finalidade |
| **D10** | `secure_password_change = true` + `signOut({ scope: 'global' })` ao trocar senha | Invalida todos os refresh tokens em todos os dispositivos |
| **D11** | `otp_expiry = 1800` (30min) em prod para recovery | Padrão de mercado |
| **D12** | Hook `before_user_created` com lista de ~30 domínios descartáveis | Sem bloquear provedores legítimos |

---

## 4. Plano de stories — versão FINAL com ACs de segurança

### Nova story `auth.0` — Configuração Supabase Auth de produção (PRÉ-REQUISITO)

**Pontos:** S (3) · **Gates:** `@compliance-br`, `@devops`

ACs de segurança (todos via Supabase Management API ou Dashboard):
- `enable_confirmations = true` (R1)
- `minimum_password_length = 10`, `password_requirements = "lower_upper_letters_digits"` (R2)
- CAPTCHA Turnstile habilitado, secret em env (R3)
- `secure_password_change = true` (R11)
- `otp_expiry = 1800` (R12)
- `email_sent = 30` por hora (R20)
- `[auth.sessions]` `timebox = "168h"`, `inactivity_timeout = "8h"` (R22)
- Sentry `beforeSend` com scrubbing de `password|senha|confirma` (R16)

**Bloqueia:** todas as outras stories `auth.*`

---

### `auth.1` — Schema profiles + consent + legal_documents + auth hook estendido

**Pontos:** M+ (6) · **Gates:** `@data-engineer`, `@compliance-br`

ACs:
- Tabela `public.profiles (id FK auth.users, full_name text NOT NULL CHECK length BETWEEN 2 AND 120, phone_encrypted bytea, phone_last_four text CHECK char_length = 4 OR NULL, created_at, updated_at)` com RLS (`SELECT/UPDATE` próprio user)
- Tabela `public.legal_documents (id, type IN ('terms','privacy'), version text UNIQUE per type, content_hash text, content_md text, published_at, deprecated_at)` — read-only para `authenticated`
- Tabela `public.user_consent_records (id, user_id FK auth.users, document_id FK legal_documents, accepted_at, ip_address inet, user_agent text)` com RLS (próprio user pode SELECT/INSERT, nunca UPDATE/DELETE — imutável)
- Trigger `AFTER INSERT ON auth.users` → INSERT em `public.profiles` com `id`, `created_at` (R19)
- `UNIQUE INDEX organizations_cnpj_unique` (parcial, R7)
- Auth Hook estendido para incluir `full_name` em claims (lê de `profiles`) (D5)
- Hook `before_user_created` rejeitando ~30 domínios descartáveis (R13)
- Suíte RLS atualizada: `rls_isolation.test.sql` valida que user A não vê profile/consent de user B
- `pnpm typegen` regenera types

**Bloqueia:** `auth.3`, `auth.4`, `auth.5`, `auth.6`, `auth.7`

---

### `auth.2` — Documentos legais (Termos + Privacidade) versão 1

**Pontos:** S+ (4) · **Gates:** `@compliance-br` (escrita+revisão)

ACs:
- Redigir `docs/legal/terms-v1.md` e `docs/legal/privacy-v1.md` em pt-BR (KEYRA = controladora dos dados do user; clínica = controladora dos dados dos pacientes; KEYRA = operadora desses)
- Seed inicial em `legal_documents` com versão `v1.0.0` para ambos
- Páginas públicas `/termos` e `/privacidade` renderizando `content_md` da última versão
- Header de versão visível ("Vigente desde DD/MM/AAAA — versão X.Y.Z")
- Endpoint `/api/legal/current-version` para o middleware checar re-aceite (R10)

**Bloqueia:** `auth.3`

---

### `auth.3` — Cadastro novo usuário (signup atômico)

**Pontos:** L (8) · **Gates:** `@compliance-br`, `@growth-product`

ACs:
- Nova rota `(auth)/cadastro/page.tsx` + `cadastro-form.tsx` + `actions.ts`
- Form com 8 campos:
  1. Nome (Zod min 2, max 120)
  2. Celular (Zod regex E.164 + libphonenumber-js — R15)
  3. E-mail (Zod email)
  4. Senha (Zod min 10, regex lower+upper+digit — R2)
  5. Confirmar senha (refine = senha)
  6. Nome da clínica (Zod min 1, max 120)
  7. CNPJ (Zod opcional, 14 dígitos)
  8. Aceite Termos + Privacidade (checkbox required, Zod refine `=== true`)
- Turnstile widget integrado (R3)
- Server Action `signUpAndCreateAccountAction`:
  1. Valida Zod
  2. Verifica Turnstile via API server-to-server
  3. Chama `supabase.auth.signUp({ email, password, options: { emailRedirectTo, data: { signup_intent: 'self_serve' } } })`
  4. Se sucesso → chama RPC `signup_create_account_atomic(...)` (R4)
  5. RPC faz: criptografa phone via pgp_sym_encrypt, INSERT/UPDATE `profiles`, INSERT `user_consent_records` (terms + privacy versões atuais), chama `create_organization_with_owner(p_name=clinica, p_cnpj)`
  6. Se RPC falha → chama service_role para deletar `auth.users` órfão (compensating delete)
  7. Mensagem de erro genérica em caso de email já existente: "Não foi possível criar a conta com esse e-mail" (R8)
- Mensagem de sucesso: "Verifique seu e-mail para confirmar sua conta" (R1)
- Smoke: cadastrar conta nova end-to-end + validar que CNPJ duplicado é rejeitado (R7)

**Depende:** `auth.0`, `auth.1`, `auth.2`
**Bloqueia:** smoke da idealizadora

---

### `auth.4` — Login email + senha (método principal)

**Pontos:** S+ (4) · **Gates:** —

ACs:
- Refazer `(auth)/login/login-form.tsx` para campos email + senha + "Lembrar de mim"
- Server Action `signInWithPasswordAction`:
  1. Zod valida email + senha presente (mas SEM checar regex de senha — só validação no signup)
  2. `supabase.auth.signInWithPassword`
  3. Erro mapeado SEMPRE para `"E-mail ou senha incorretos"` (R8)
  4. Após 3 falhas no mesmo email em 5min, exigir Turnstile (R17)
  5. Após 10 falhas em 1h, account lockout temporário (15min) — tabela `auth_attempts (email, attempt_at, success boolean)` com RLS service_role only
- Botão secundário "Esqueci minha senha" → `/esqueci-senha`
- Botão secundário "Não tenho conta — cadastrar" → `/cadastro`
- **NENHUM** método magic link nesta tela

**Depende:** `auth.0`, `auth.1`

---

### `auth.5` — Esqueci minha senha (magic link só aqui)

**Pontos:** M (5) · **Gates:** —

ACs:
- Nova rota `(auth)/esqueci-senha/page.tsx` + form com email + Turnstile (R14)
- Server Action `sendPasswordRecoveryAction`:
  1. Zod valida email
  2. Verifica Turnstile
  3. Cooldown server-side de 60s por email destino (R14) — usar tabela `password_reset_attempts (email, attempted_at)` ou Vercel KV
  4. `supabase.auth.resetPasswordForEmail(email, { redirectTo: /redefinir-senha })`
  5. SEMPRE retornar sucesso visual ("Se o email existe, enviamos um link") — não revelar enumeração
- Nova rota `(auth)/redefinir-senha/page.tsx` que recebe code + permite definir nova senha (mesmo regex de força do signup)
- Após troca → `signOut({ scope: 'global' })` automaticamente (R11)
- Magic link via OTP **sai integralmente** das outras telas — vive apenas aqui

**Depende:** `auth.4`

---

### `auth.6` — Login com Google (OAuth)

**Pontos:** M+ (6) · **Gates:** `@compliance-br`

ACs:
- Provider Google habilitado no Supabase Dashboard (configuração via Management API ou manual)
- OAuth client criado no Google Cloud Console com `https://usekeyra.com/auth/callback` autorizado
- Botão "Entrar com Google" em `/login` e `/cadastro`
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ..., scopes: 'email profile' } })` — escopo mínimo
- Callback `(auth)/auth/callback/route.ts` estendido:
  - Após `exchangeCodeForSession`, ler `auth.users.user_metadata.full_name` do Google
  - Se `profiles.full_name IS NULL` → UPDATE com nome do Google
  - Se `memberships` vazio → redirect `/cadastro/completar` (R18) — coleta celular, nome clínica, CNPJ, aceite termos
  - Se tudo preenchido → redirect `/dashboard`
- LGPD: registro de consentimento criado quando user aceita termos no fluxo `/cadastro/completar`

**Depende:** `auth.0`, `auth.1`, `auth.4`

---

### `auth.7` — Custom claims JWT (`full_name`)

**Pontos:** XS (2) · **Gates:** —

ACs:
- Estender `custom_access_token_hook` para também incluir `full_name` do `profiles` no JWT
- TypeScript types do JWT atualizados em `apps/web/src/types/auth.ts`
- Helper `getCurrentUserDisplayName()` server-side lê de claim sem query
- Header da app exibe "Olá, {full_name}" no lugar do email
- Smoke: login → JWT inspect → `full_name` presente; mudar `full_name` no `profiles` → próximo refresh JWT carrega o novo nome

**Depende:** `auth.1`

---

### `auth.8` — Bug 2 abas (BroadcastChannel)

**Pontos:** XS (1) · **Gates:** —

ACs:
- Tela `/login/check-email` (do recovery) registra `BroadcastChannel('keyra-auth')`
- Callback envia `{ type: 'session-established' }` após `exchangeCodeForSession`
- Listener fecha a aba origem com `window.close()`
- Fallback: se `window.close()` falhar (não foi `window.open`), mostrar mensagem "Você pode fechar essa aba"

**Depende:** `auth.5`

---

### `auth.9` — Visual revamp completo (auth screens)

**Pontos:** M (5) · **Gates:** `@ux-design-expert`

ACs:
- Aplicar direção visual KEYRA (memory `feedback_keyra_visual_direction.md`):
  - Sofisticação editorial (não rosa-bebê)
  - Tipografia com weights extremos
  - Spacing tokens roomy
  - Azul liberado para uso funcional
- Telas afetadas: `/login`, `/cadastro`, `/cadastro/completar`, `/esqueci-senha`, `/redefinir-senha`
- Acessibilidade: contraste WCAG AA, ARIA labels, focus visible
- Smoke mobile 375px da idealizadora — critério de Done

**Depende:** `auth.4`, `auth.5`, `auth.6`

---

## 5. Resumo executivo

| Métrica | Versão original | Versão pós-auditoria |
|---------|-----------------|----------------------|
| Stories | 9 | **10** (adiciona `auth.0` config) |
| Pontos | 32 | **44** (+12 pts em ACs de segurança) |
| Riscos críticos cobertos | 0 | **7/7** |
| Riscos altos cobertos | 0 | **9/9** |
| Riscos médios cobertos | 0 | **4/4** |
| Decisões de arquitetura travadas | 0 | **12** |
| ADRs adicionais | 0 | recomendado adicionar **ADR-022 — Auth UX V2** referenciando esta auditoria |

---

## 6. Pendências de produto que precisam de definição da idealizadora

| Pergunta | Por quê |
|----------|---------|
| Quem assina os Termos e Política de Privacidade (KEYRA SA / KEYRA LTDA / MEI da idealizadora)? | LGPD obriga identificar o controlador. Sem isso `auth.2` não pode escrever os termos com personalidade jurídica correta. |
| Período de retenção de dados após cancelamento (30/60/90 dias)? | LGPD direito ao esquecimento (CON-LG-03) — precisa estar nos Termos. |
| Local de jurisdição em caso de disputa (foro KEYRA)? | Padrão é foro do CNPJ da KEYRA. |

Sem essas respostas, `auth.2` é redigida com placeholders que precisam revisão jurídica antes de publicar.

---

## 7. Critério de Done do epic completo

- Todos os 22 riscos com mitigação implementada e verificada
- Suíte RLS estendida cobrindo `profiles`, `user_consent_records`, `legal_documents` — verde no CI
- Smoke manual mobile 375px da idealizadora cobrindo: cadastro novo, login, esqueci senha, login Google, segundo acesso reconhecendo nome
- `pnpm typecheck` + `pnpm lint --max-warnings 0` + `./scripts/check-rsc-boundaries.sh` verdes
- ADR-022 publicado referenciando esta auditoria
- Sentry config validada com scrubbing de senha (R16)
- 0 órfãos em `auth.users` sem `profiles` (smoke transacional via psql)
- Pelo menos 1 round de teste com usuário-bot tentando: signup com email descartável, brute force login, password "111111" — todos rejeitados

---

**Fim do documento.** Atualização ao final de cada story `auth.*` em "Mudanças aplicadas vs auditoria".
