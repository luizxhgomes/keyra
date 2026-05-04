# EPIC AUTH V2 — Auth UX completa + Cadastro estruturado + LGPD foundation

**Status:** 🟡 Em execução — **6/10 stories Done** (60%)
**Criado em:** 2026-05-03
**Última atualização:** 2026-05-04 — encerramento de sessão com Fase B + visual revamp em prod
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
| `auth.5` | ⏸️ Pendente | M | 5 | Esqueci senha via `resetPasswordForEmail` (NÃO magic link de login — só fluxo de reset) | — | — |
| `auth.6` | ⏸️ Pendente | M+ | 6 | Google OAuth (botão hoje desabilitado com badge "em breve" até esta story) | `@compliance-br` | — |
| `auth.7` | ✅ Done | XS | 2 | Custom claim `full_name` no JWT + AppShell mostra "Olá, {full_name}" | — | PR #5 (`5cd4900`) |
| `auth.8` | ⏸️ Pendente | XS | 1 | Bug 2 abas via `BroadcastChannel` | — | — |
| `auth.9` | ⏸️ Pendente | M | 5 | Visual revamp do AppShell autenticado pra coerência com tela auth (light KEYRA já aplicado nas telas de auth via PR #6+#7) | `@ux-design-expert` | — |
| **TOTAL** | **6/10 Done** | — | **27/44 pts** (61%) | — | — | — |

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
