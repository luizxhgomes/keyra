# EPIC AUTH V2 — Auth UX completa + Cadastro estruturado + LGPD foundation

**Status:** 🟢 Em execução
**Criado em:** 2026-05-03
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

| Story | T-shirt | Pontos | Foco | Gates Phase 3.5 |
|-------|---------|--------|------|------------------|
| `auth.0` | S | 3 | Configuração Supabase Auth de produção (R1, R2, R3, R11, R12, R16, R20, R22) — habilitar email confirmation, senha forte, Turnstile, scrubbing Sentry, OTP 30min, secure password change | `@compliance-br`, `@devops` |
| `auth.1` | M+ | 6 | Schema `profiles` + `user_consent_records` + `legal_documents` + Auth Hook estendido + UNIQUE CNPJ + hook `before_user_created` (R5, R6, R7, R9, R10, R13, R19) | `@data-engineer`, `@compliance-br` |
| `auth.2` | S+ | 4 | Termos + Privacidade v1.0.0 versionados + páginas públicas + endpoint de current-version | `@compliance-br` |
| `auth.3` | L | 8 | Cadastro signup atômico (RPC `signup_create_account_atomic` + Turnstile + libphonenumber + compensating delete) — campos: nome, celular, email, senha+conf, nome clínica, CNPJ, aceite | `@compliance-br`, `@growth-product` |
| `auth.4` | S+ | 4 | Login email+senha (mensagem genérica anti-enumeration, Turnstile após 3 falhas, lockout após 10) | — |
| `auth.5` | M | 5 | Esqueci senha (Turnstile, cooldown por email, signOut global pós-troca) — magic link migra integralmente para esta tela | — |
| `auth.6` | M+ | 6 | Google OAuth (escopo mínimo, fluxo `/cadastro/completar` se faltar dados) | `@compliance-br` |
| `auth.7` | XS | 2 | Custom claim `full_name` no JWT (sem `phone`) | — |
| `auth.8` | XS | 1 | Bug 2 abas via `BroadcastChannel` | — |
| `auth.9` | M | 5 | Visual revamp completo das 5 telas de auth aplicando direção visual KEYRA | `@ux-design-expert` |
| **TOTAL** | — | **44** | — | — |

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

## Histórico

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-03 | 1.0 | Epic criado a partir de mapeamento da idealizadora + auditoria preventiva. Branch `feat/auth-v2` criada a partir de `main`. | `@aiox-master` (Orion) |
