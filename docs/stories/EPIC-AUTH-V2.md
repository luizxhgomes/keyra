# EPIC AUTH V2 — Auth UX completa + Cadastro estruturado + LGPD foundation

**Status:** 🟢 **Fechado parcialmente — 9/10 stories Done (90%) · `auth.6` deferida pendente setup Google Cloud manual**
**Criado em:** 2026-05-03
**Última atualização:** 2026-05-06 — `auth.9` mergeada em PR #11 (prod READY com jornada afunilada + força senha + visual revamp AppShell). EPIC declarado fechado parcialmente pra desbloquear próximas frentes do produto; `auth.6` (Google OAuth) deferida porque exige setup manual no Google Cloud Console — instruções em [`docs/setup/google-oauth-setup.md`](../setup/google-oauth-setup.md). Não bloqueia nenhuma outra frente do KEYRA.
**Origem:** Mapeamento da idealizadora (Luiz) em sessão 2026-05-03 — login considerado "muito feio", único método (magic link) inadequado para uso comercial, ausência de cadastro estruturado, ausência de Google OAuth, bug de duas abas obsoletas no fluxo magic link.
**Auditoria preventiva de segurança:** [`docs/audit/auth-v2-security-audit.md`](../audit/auth-v2-security-audit.md) — 22 riscos identificados com fonte exata + 12 decisões de arquitetura travadas.
**Pré-condição para abrir:** nenhuma (independente).
**Bloqueia:** abertura formal de EPIC-SPRINT-8-HARDENING (que agora torna-se EPIC-SPRINT-9-HARDENING) e validação de jornada-mobile com a idealizadora — porque o login atual é o que ela vai testar e está "muito feio".

---

## Por que existe

A auth atual do KEYRA é passwordless puro (magic link) — decisão tomada na ADR-010 quando ainda era PoC. Para uso comercial, a auditoria de 2026-05-03 mostrou três problemas estruturais e oito problemas críticos de segurança:

| Categoria | Problema | Origem |
|-----------|----------|--------|
| **UX** | Magic link é único método; idealizadora classificou como "muito feio" e "fricção alta" | Smoke real da idealizadora |
| **UX** | Bug de duas abas — clicar no link mágico abre nova aba e a antiga fica obsoleta | Smoke real da idealizadora |
| **UX** | Não existe cadastro estruturado — campos do usuário (nome, celular, clínica) nunca foram coletados | Schema atual |
| **Segurança** | `enable_confirmations = false` no auth.email permite account takeover trivial | `supabase/config.toml:107` |
| **Segurança** | Senha mínima 6 caracteres sem complexidade aceitaria "111111" | `supabase/config.toml:70-73` |
| **Segurança** | Sem CAPTCHA em nenhum fluxo — bot pode encher `auth.users` ou brute force | `supabase/config.toml:78-82` |
| **Segurança** | `auth.users` pode ficar órfão se cadastro falhar entre `signUp` e RPC `create_org` | Inferência do fluxo atual |
| **Segurança** | `phone` como `text` plain violaria NFR-SE-04 do PRD (criptografia em repouso) | PRD `NFR-SE-04` |
| **Segurança** | `phone` em JWT vazaria PII em todo log/Sentry/breadcrumb | Decisão revisada |
| **Segurança** | CNPJ não é UNIQUE — duas pessoas podem cadastrar a mesma clínica gerando duplicação fiscal | `organizations.sql:27` |
| **LGPD** | Não há `user_consent_records` para o controlador (user da plataforma) | Schema atual |
| **LGPD** | Termos versionados sem mecanismo de re-aceite | Sem implementação |

---

## Composição do epic

| Story | Status | T-shirt | Pontos | Foco | Gates | Mergeada em |
|-------|--------|---------|--------|------|-------|-------------|
| `auth.0` | ✅ Done | S | 3 | Config Supabase Auth prod, Sentry scrubbing, Turnstile envs, ADR-022 | `@compliance-br` ✅ | PR #3 (`dbc753e`) |
| `auth.1` | ✅ Done | M+ | 6 | Schema profiles + consent + legal_documents + UNIQUE CNPJ + Auth Hook estendido com full_name + before_user_created hook | `@data-engineer` ✅ + `@compliance-br` ✅ | PR #4 (`eaa3520`) |
| `auth.2` | ✅ Done | S+ | 4 | Termos + Privacidade v1.0.0 versionados + páginas públicas /termos /privacidade | `@compliance-br` ✅ | PR #5 (`5cd4900`) |
| `auth.3` | ✅ Done | L | 8 | Cadastro signup atômico (RPC + Turnstile + libphonenumber + compensating delete) | `@compliance-br` ✅ + `@growth-product` ✅ | PR #5 (`5cd4900`) |
| `auth.4` | ✅ Done | S+ | 4 | Login email+senha (sem magic link, mensagem genérica anti-enumeration) | — | PR #5 (`5cd4900`) |
| `auth.5` | ✅ Done | M | 5 | Esqueci senha via `resetPasswordForEmail` + cooldown 60s server-side + signOut global + template recovery pt-BR aplicado em prod (P0 fix em PR #10 com token_hash flow) | — | PR #8 (`5d9e71d`) + PR #10 (`f5256ba`) |
| `auth.6` | ⏸️ **Deferida** | M+ | 6 | Google OAuth — **aguarda setup manual no Google Cloud Console** ([instruções](../setup/google-oauth-setup.md)). Botão "EM BREVE" continua exibido em `/login` e `/cadastro` até a story rodar. | `@compliance-br` | — |
| `auth.7` | ✅ Done | XS | 2 | Custom claim `full_name` no JWT + AppShell mostra "Olá, {full_name}" | — | PR #5 (`5cd4900`) |
| `auth.8` | ✅ Done | XS | 1 | Bug 2 abas via `BroadcastChannel` — helper centralizado + listener com cleanup + estado `completedElsewhere` com precedência | — | PR #9 (`c54d443`) |
| `auth.9` | ✅ Done | L | 8 | Polish UX completo (escopo expandido na fiscalização 2026-05-06): jornada afunilada (`<JourneyProgress />` 4 fases) + indicador força senha (`<PasswordStrengthMeter />`) + tela `/redefinir-senha/sucesso` + visual revamp AppShell (Sidebar bolha "K", header gradient, UserMenu bg-primary) | `@ux-design-expert` | PR #11 (`3e3ab97`) |
| **TOTAL** | **9/10 Done** | — | **41/47 pts** (87%) | — | — | — |

> **Pontos atualizados:** `auth.9` foi expandida de M (5) para L (8) durante a fiscalização (consolidou 3 frentes correlatas). Total do epic subiu de 44 para 47. Done acompanha proporcionalmente.

### PRs adicionais desta sessão (não eram stories formais)

| PR | SHA | O quê |
|----|-----|-------|
| #6 | `79794cb` | Visual dark glassmorphism (HextaUI puro) — REVERTIDA pelo PR #7 |
| #7 | `14ec8e3` + `5ad5805` | Reverter cores pra light KEYRA mantendo estrutura HextaUI (cores cream/bege + primary marrom) |

---

## Ordem de execução

```
Fase A — Foundation
  auth.0 (config Supabase) ──► destrava todas
                              │
                              ├──► auth.1 (schema)
                              └──► auth.2 (textos legais) ◄── auth.1 (dependência cruzada de legal_documents)

Fase B — Fluxos funcionais (paralelos após Fase A)
  auth.3 (cadastro)
  auth.4 (login senha)
  auth.7 (custom claim full_name)

Fase C — Recuperação + social (paralelos após Fase B)
  auth.5 (esqueci senha)  ──► auth.8 (2 abas fix)
  auth.6 (Google OAuth)

Fase D — Polish
  auth.9 (visual revamp completo das 5 telas)
```

---

## Cross-reference com squads

Este epic não tem squad próprio — usa os agentes core (`@sm`, `@po`, `@dev`, `@qa`, `@devops`) com gates Phase 3.5 acionados conforme escopo:

| Story | Phase 3.5 gates acionados |
|-------|---------------------------|
| `auth.0` | `@compliance-br` (config LGPD-relevante) |
| `auth.1` | `@data-engineer` (DDL) + `@compliance-br` (PII storage) |
| `auth.2` | `@compliance-br` (textos legais) |
| `auth.3` | `@compliance-br` (PII collection + consent) + `@growth-product` (toca onboarding/funnel) |
| `auth.4` | — |
| `auth.5` | — |
| `auth.6` | `@compliance-br` (OAuth Google fornece email+nome — atenção PII) |
| `auth.7` | — |
| `auth.8` | — |
| `auth.9` | `@ux-design-expert` (estética) |

---

## Estratégia de branch e deploy

- **Branch única:** `feat/auth-v2` (a partir de `main` em 2026-05-03)
- **Deploy:** preview Vercel automático a cada push na branch
- **Smoke da idealizadora:** obrigatório no preview antes de merge
- **Merge:** PR aprovada por gate condicional + smoke validado → merge para `main` → deploy prod
- **Backlog visível:** cada story Done atualiza `STATE.md` na branch antes do próximo commit

---

## Riscos residuais aceitos (após o epic completo)

| Risco | Mitigação fora de escopo | Decisão |
|-------|--------------------------|---------|
| Brute force massivamente distribuído | Cloudflare Pro WAF | Aceito — Turnstile + Vercel WAF cobrem casos serial; distribuído precisa Pro |
| Phishing externo dos usuários | User education nos Termos | Aceito — não tem como mitigar dentro do produto |
| Compromisso do dispositivo do user | Out of scope | Aceito |

---

## Pendências de produto postergadas (autorização da idealizadora 2026-05-03)

Estas decisões podem ser feitas no futuro com placeholder textual nos Termos sem bloquear `auth.2`:

| Pergunta | Placeholder atual | Quando decidir |
|----------|-------------------|----------------|
| Personalidade jurídica que assina os Termos | `[KEYRA — pessoa jurídica a constituir]` | Quando KEYRA virar empresa formal (CNPJ) |
| Foro de jurisdição | `Comarca de São Paulo/SP` (default) | Junto com a decisão acima |
| Retenção de dados após cancelamento | **30 dias** (decidido em 2026-05-03) | ✅ |

---

## Critério de Done do epic completo

- Todos os 22 riscos com mitigação implementada e verificada (auditoria como checklist)
- Suíte RLS estendida cobrindo `profiles`, `user_consent_records`, `legal_documents` — verde no CI
- Smoke manual mobile 375px da idealizadora cobrindo: cadastro novo, login, esqueci senha, login Google, segundo acesso reconhecendo nome
- `pnpm typecheck` + `pnpm lint --max-warnings 0` + `./scripts/check-rsc-boundaries.sh` verdes
- ADR-022 publicado em `docs/architecture/ARCHITECTURE.md`
- Sentry config validada com scrubbing de senha (R16)
- 0 órfãos em `auth.users` sem `profiles` (smoke transacional via psql)
- Round de teste com usuário-bot tentando: signup com email descartável, brute force login, password "111111" — todos rejeitados

---

## Dependências cruzadas entre stories (registradas durante execução)

### `auth.2` (Termos + Privacidade) deve documentar 6 subprocessors

Originada do gate `@compliance-br` em `auth.0` (2026-05-03):

| Subprocessor | Localização | Função | Base legal LGPD |
|---|---|---|---|
| Supabase Inc. | Singapore/US (dados sa-east-1 BR) | Banco + auth | Execução do contrato (Art. 7º V) |
| Vercel Inc. | US | Hosting + edge | Execução do contrato (Art. 7º V) |
| Resend | US | Emails transacionais | Execução do contrato (Art. 7º V) |
| Cloudflare Inc. | Global | CAPTCHA Turnstile (cookie + IP, sem PII direta) | Legítimo interesse (Art. 7º IX) |
| Sentry | US | Observabilidade (sem PII por scrubbing R16) | Legítimo interesse (Art. 7º IX) |
| Google Cloud | US | OAuth Google (após `auth.6`) | Consentimento explícito (Art. 7º I) |

**`auth.2` precisa nomear todos os 6 na seção "Compartilhamento de dados" da Política de Privacidade.** Sem isto, o Termos publicado fica em desconformidade com Art. 9º (transparência) da LGPD.

## Histórico

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-03 | 1.0 | Epic criado a partir de mapeamento da idealizadora + auditoria preventiva. Branch `feat/auth-v2` criada a partir de `main`. | `@aiox-master` (Orion) |
| 2026-05-03 | 1.1 | Story `auth.0` Ready for Review com gate `@compliance-br` APPROVE + 2 CONCERNS (Sentry e Cloudflare como subprocessors). CONCERNS propagados para escopo de `auth.2` como dependências cruzadas. | `@aiox-master` (Orion) atuando como `@compliance-br` |
| 2026-05-06 | 1.2 | Story `auth.5` (Esqueci senha) Done em prod. Abertura da Fase C. Migration 20260506000100 (password_reset_attempts + RPC cooldown SECURITY DEFINER + 4 deny-all policies) aplicada via `supabase db push` com smoke transacional verde via psql. Template recovery pt-BR aplicado via Management API (`mailer_subjects_recovery="Redefinir sua senha do KEYRA"` + 6925 chars HTML identidade KEYRA) com snapshot defensivo + validação GET. 13 arquivos novos/modificados (migration, RPC, runbook, email template, script, 3 backend, 4 frontend, env.ts, types, banners). 6 riscos da auditoria mitigados (R3 Turnstile · R8 anti-enumeration · R11 signOut global · R12 otp 30min · R14 cooldown 60s · R16 Sentry sem PII). QA self-gate 7/7 PASS. Total: 7/10 stories Done (73%). | `@aiox-master` (Orion) atuando como SDC completo |
| 2026-05-06 | 1.3 | Story `auth.8` (BroadcastChannel) Done na sequência. 4 arquivos cirúrgicos (helper `lib/auth/broadcast.ts` + ajuste em `setNewPasswordAction` + 2 cards). Mudou `setNewPasswordAction` para retornar `{success:true}` (em vez de `redirect()`) liberando o broadcast no client antes da navegação. PR #9 mergeada em `c54d443`. Total: 8/10 stories Done (80%). | `@aiox-master` (Orion) atuando como SDC completo |
| 2026-05-06 | 1.4 | **🔴 P0 fix descoberto via fiscalização E2E real:** usuário REAL clicando em link de email caía em `/login?error=invalid_code` — Supabase emitia link com hash fragment (`#access_token=...`) que não chega no server. Implementado **token_hash flow** recomendado pela Supabase pra SSR (cross-device safe): template recovery v2.0 aponta pra `/auth/callback?token_hash={{ .TokenHash }}&type=recovery`; callback handler ganha `verifyOtp({type, token_hash})` server-side. Validado E2E real contra prod 12/12 PASS + smoke humano da idealizadora. PR #10 mergeada em `f5256ba`. | `@aiox-master` (Orion) atuando como `@dev` + `@qa` |
| 2026-05-06 | 1.5 | Story `auth.9` Done — escopo expandido (M → L) consolidando 3 frentes: (1) Jornada afunilada via `<JourneyProgress />` em RequestResetCard + NewPasswordCard + tela nova `/redefinir-senha/sucesso`; (2) Indicador `<PasswordStrengthMeter />` em SignUpCard + NewPasswordCard (heurística simples sem zxcvbn); (3) Visual revamp AppShell — Sidebar com bolha "K" KEYRA, header com gradient terracota sutil, UserMenu avatar `bg-primary`. PR #11 mergeada em `3e3ab97`. E2E real contra prod 12/12 PASS pós-merge. Total: 9/10 stories Done (87%). | `@aiox-master` (Orion) atuando como SDC completo |
| 2026-05-06 | 2.0 | **EPIC-AUTH-V2 fechado parcialmente — 9/10 (90%)**. `auth.6` (Google OAuth) declarada **deferida** porque exige setup manual no Google Cloud Console (criar OAuth 2.0 Client ID, configurar consent screen, gerar Client ID + Client Secret) que não pode ser automatizado. Instruções completas em [`docs/setup/google-oauth-setup.md`](../setup/google-oauth-setup.md). Botão "EM BREVE" do Google permanece exibido em `/login` até a story rodar. EPIC não bloqueia nenhuma outra frente do KEYRA — recovery + cadastro + login email/senha + AppShell coeso já em prod e validados. | `@aiox-master` (Orion) |
