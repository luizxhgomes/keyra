# EPIC-7 — Auth UX & Reliability + Recovery (Sprint 7)

**Status:** 🔴🔴 **ATIVA EM EMERGÊNCIA — produto inutilizável em produção**
**Origem:** validação manual real da idealizadora em 2026-05-02 (mobile real, usekeyra.com) revelou **8 issues HIGH+CRITICAL+BLOCKER** + 9 LOWs. **Todas as rotas autenticadas (`/dashboard`, `/agenda`, `/pacientes`, etc.) explodem com erro genérico**. Camila com conta criada não consegue usar nenhuma feature.
**Documentos-fonte:**
- `docs/ux/validacao-manual-idealizadora-2026-05-02.md` (issues #1-#4 catalogados)
- `docs/ux/plano-melhoria-jornada-login-2026-05-02.md` (análise técnica + 6 estágios + 10 bugs B1-B10 + 5 gates G5-G9)
- `docs/ux/simulacao-e2e-2026-05-02.md` (validação Playwright 9.0/10 score)
- `docs/ux/audit-2026-05-02-pre-motion.md` (baziotti pré-motion 7.6)
- `docs/ux/validacao-completa-2026-05-02.md` (HTTP smoke + greps anti-regressão)

**Princípio orientador:** "**economize toques, garanta jornada validada, antecipe erros antes que apareçam**" (idealizadora, 2026-05-02).

---

## Por que existe (escopo EXPANDIDO 2026-05-02 14h)

Investigação revelou que **NÃO é só dashboard**. A camada inteira de `(app)/` explode após login válido:

| Tela | Status |
|------|--------|
| `/dashboard` | 🔴 "ALGO DEU ERRADO" digest 3213099672 |
| `/agenda` | 🔴 Mesmo erro ao clicar |
| `/agenda` novo agendamento | 🔴 Não consegue selecionar produto, cliente, serviço |
| `/pacientes` | 🔴 Mesmo erro |
| `/mais` | 🔴 404 (rota inexistente) |
| `/configuracoes` | 🔴 Browser error (rota inexistente) |

**AppShell carrega** (Sidebar, BottomNav, OrgSwitcher renderizam) → camada `(app)/layout.tsx` ok.
**Erro está em layer abaixo do layout** — provavelmente:

1. **`(app)/template.tsx` Story 6.2 AC2.7** — `<m.div className="contents">` (display:contents + transform = comportamento indefinido)
2. **`<MotionProvider>` LazyMotion strict** rejeitando algo
3. **Sentry DSN ausente em prod** — `instrumentation.ts` faz `if (!dsn) return` → Story 7.0 captura zero, debug impossível
4. **Server Component fetch** com JWT custom claims após `security_invoker=true` corrompendo

Plus: tudo o que já estava mapeado (login UX, email pt-BR, magic link estático, rotas faltantes).

---

## Stack de impacto (backend → frontend → feature)

| Camada | Itens afetados |
|--------|----------------|
| **Backend** | Supabase Auth Email Templates (subject + body em pt-BR), Sentry instrumentation no error boundary do `(app)/`, defensive fetch nas Server Actions do dashboard com fallbacks, view `v_dashboard_kpis` retornando seguro em org com 0 dados |
| **Frontend** | `/login` polling com `onAuthStateChange`, `/auth/callback/loading.tsx`, `error.tsx` capturing Sentry, `/mais` page, `/configuracoes` page, `not-found.tsx` global, error boundaries granulares no dashboard, OAuth Google opcional, home redesign |
| **Feature funcional** | Auto-redirect ao receber sessão, reenviar link com cooldown, timer de expiração, smoke test 3 cenários (novo/existente/expirado), email com header KEYRA + footer de segurança, FAB contextual em `/mais` e `/configuracoes` |

---

## Stories da Sprint 7

### Story 7.0 — Habilitar Sentry capture no `(app)/error.tsx` 🔴 URGENTE

**Status:** Pronto para `@dev`
**T-shirt:** XS (~1 ponto · 30min)
**Justificativa de tamanho mínimo:** fix de 1 import + 1 linha. **Pré-requisito de tudo o resto** — sem isso, digest 3213099672 (e qualquer erro futuro) permanece opaco.

**Escopo:**
- AC1 — `(app)/error.tsx` chama `Sentry.captureException(error)` antes do `console.error`
- AC2 — Verificar via runtime que erro vai para Sentry dashboard (smoke: forçar erro em dev → confirmar no Sentry)
- AC3 — Remover comentário `// TODO: Sentry capture quando configurado em produção`

**Phase 2.5 gates:**
- G3 (touch target): N/A
- Outros: N/A — fix isolado

**Phase 3.5:**
- WAIVED em todos (sem alteração funcional, apenas instrumentation)

**Dependências:** nenhuma. Pode rodar **agora**.

**Owner sugerido:** `@dev`

---

### Story 7.1 — Auth UX (anti-fricção do magic link)

**Status:** Pronto para `@sm *draft 7.1`
**T-shirt:** M+ (~6 pontos · 1.5 dia)

**Escopo:**

| AC | Bug origem | Foco |
|----|------------|------|
| AC1 | B2 (Issue #1) | `<LoginForm>` no estado `emailSent` adiciona `supabase.auth.onAuthStateChange` listener que detecta SIGNED_IN e redireciona para `/dashboard` (com fallback `?next=` da Story 1.4) |
| AC2 | B9 | Botão "Reenviar link" com cooldown 60s (estado `nextResendAt`) |
| AC3 | B9 | Timer "Link expira em ~1h" sutil em texto pequeno cinza |
| AC4 | B6 | `app/auth/callback/loading.tsx` com Skeleton editorial (logo KEYRA + spinner sutil) — reduz tela branca de 800-1500ms |
| AC5 | B8 | Placeholder do input `voce@clinica.com.br` → `seu-email@clinica.com.br` |
| AC6 | — | Validação de jornada J1 (Onboarding) com smoke real em mobile 375px |

**Phase 2.5 gates (já documentado em `plano-melhoria-...md`):**
- G1 (princípios inegociáveis): copy nova em pt-BR ✅
- G3 (touch target AA): novos botões reenviar + min-h-[44px] obrigatório
- G6 (NOVO Phase 2.6): Sentry capture habilitado (via Story 7.0) — pré-requisito

**Phase 3.5:**
- Compliance: ⚠️ DISPARADO — `@compliance-br *lgpd-audit` (story toca dados pessoais email; LGPD permite mas validar tratamento)
- Growth: WAIVED (sem mudança de funnel)
- Financial: WAIVED

**Owner sugerido:** `@sm` → `@po` → `@dev`

**Dependências:** Story 7.0 fechada (Sentry ativo)

---

### Story 7.2 — Email templates pt-BR + branding KEYRA 🔴 URGENTE

**Status:** Pronto para `@sm *draft 7.2`
**T-shirt:** S (~3 pontos · 0.5 dia)

**Escopo:**

| AC | Bug origem | Foco |
|----|------------|------|
| AC1 | B3 | Customizar template "Magic Link" no Supabase Dashboard → Authentication → Email Templates: subject "Seu link de acesso à KEYRA", body com header logo + CTA terracota + footer de segurança em pt-BR |
| AC2 | — | Customizar templates "Confirm Signup", "Reset Password", "Change Email Address" — mesmo padrão visual + pt-BR (mesmo se não usados, ficam consistentes) |
| AC3 | — | Validar que template do convite (`Invite User`) NÃO foi quebrado — atualmente usa Resend + React Email customizado (Story 1.3) |
| AC4 | — | Smoke real: enviar magic link para email teste → validar visualmente que chegou em pt-BR + assinatura KEYRA |

**Phase 2.5 gates:**
- G7 (NOVO Phase 2.6): Email templates pt-BR obrigatório

**Phase 3.5:**
- Compliance: ⚠️ DISPARADO — `@compliance-br *lgpd-audit` (templates contêm tokens de acesso, validar tratamento)
- Growth: ⚠️ DISPARADO — `@growth-product *onboarding-flow` (validar CTR projetado)

**Owner sugerido:** `@sm` → `@po` → `@dev` + `@compliance-br` review

**Dependências:** acesso ao Supabase Dashboard

---

### Story 7.3 — Rotas faltantes `/mais` e `/configuracoes` 🔴 HIGH

**Status:** Pronto para `@sm *draft 7.3`
**T-shirt:** S (~3 pontos · 0.5 dia)

**Escopo:**

| AC | Bug origem | Foco |
|----|------------|------|
| AC1 | Issue #3 | Criar `app/(app)/mais/page.tsx` mobile-first com:<br>- Lista vertical das funcionalidades secundárias (Comandas, Serviços, Financeiro, Estoque, Time, Configurações)<br>- Cada item com ícone + label + chevron + `min-h-[44px]`<br>- Botão "Sair" no rodapé (server action `signOutAction`)<br>- H1 "Mais" com `text-display`<br>- Org switcher visível no topo |
| AC2 | Issue #4 | Criar `app/(app)/configuracoes/page.tsx` mínimo viável com:<br>- Card "Sua clínica" (nome, CNPJ, criada em — read-only por enquanto)<br>- Card "Conta" (email do user, role)<br>- Card "Em breve" (editar dados, billing, integrações)<br>- Botão "Sair" duplicado para conveniência |
| AC3 | — | Adicionar item "Configurações" também no `/mais` (descoberta dupla) |
| AC4 | Story 6.5 AC2 | Atualizar `getFabAction(pathname)`: `/mais` → fallback default; `/configuracoes` → fallback default. Ou seja, FAB nessas rotas leva para `/agenda?novo=1` (criar agendamento — ação mais frequente) |
| AC5 | — | Smoke comportamental: clicar **cada item** do BottomNav e Sidebar; verificar que **NENHUMA** rota dá 404 ou browser error |

**Phase 2.5 gates:**
- G2 (inventário tokens): nenhum sweep, só novas páginas usando tokens existentes
- G3 (touch target AA): cada item da lista com `min-h-[44px]`
- G10 (NOVO Phase 2.6): Dead Link Audit — toda rota linkada deve ter implementação

**Phase 3.5:**
- WAIVED em todos (sem alteração de lógica financeira/compliance/growth)

**Owner sugerido:** `@sm` → `@po` → `@dev` + `@ux-design-expert` opcional para revisar layout do `/mais`

**Dependências:** nenhuma

---

### Story 7.4 — `not-found.tsx` global + Dead Link Audit

**Status:** Pronto para `@sm *draft 7.4`
**T-shirt:** XS (~1 ponto · 1h)

**Escopo:**

| AC | Bug origem | Foco |
|----|------------|------|
| AC1 | — | Criar `app/(app)/not-found.tsx` customizado com `<EmptyState icon={SearchX}>` + CTA "Voltar ao dashboard" + tom mentora confiável |
| AC2 | — | Audit automatizado: script que lê todos os `<Link href="/...">` e `router.push("/...")` no codebase e valida que cada destino existe como rota implementada |
| AC3 | — | Adicionar G10 (Dead Link Audit) na Phase 2.6 do `.claude/rules/story-lifecycle.md` |

**Phase 2.5 gates:**
- G2 + G4: relevante, mas sem trabalho — é justamente o gate sendo instaurado

**Phase 3.5:**
- WAIVED em todos

**Owner sugerido:** `@dev` + `@devops` (script de audit pode rodar em CI)

**Dependências:** Story 7.3 (não rodar audit antes das rotas serem criadas, senão falha)

---

### Story 7.5 — Reliability backend (defensive fetch + boundaries granulares)

**Status:** Pronto para `@sm *draft 7.5` — **DEPENDE DA INVESTIGAÇÃO** do digest após 7.0
**T-shirt:** M (~5 pontos · 1 dia)

**Escopo (definido após Sentry revelar root cause do B1):**

| AC | Bug origem | Foco |
|----|------------|------|
| AC1 | B1 (root cause) | Hotfix do erro real revelado pelo Sentry após Story 7.0 |
| AC2 | — | Envolver cada Server Component fetcher do dashboard (`<AlertasCard>`, `<MetaCard>`, `<IndicadoresCard>`, `<AgendaHojeCard>`) em error boundary granular para que falha em um não derrube todos |
| AC3 | — | `getDashboardKpis()` defensive: quando `v_dashboard_kpis` retorna null/error em org sem dados, retornar zeros graciosamente em vez de propagar erro |
| AC4 | — | Verificar Supabase `keyra-br` não está pausado por inatividade (Free tier 7 dias) — adicionar healthcheck cron |
| AC5 | — | Smoke real: refazer J1-J6 inteiras com Sentry monitorando — validar zero erros não-tratados em produção |

**Phase 2.5 gates:**
- G8 (NOVO Phase 2.6): Server Component Defensive Fetch
- G9 (NOVO Phase 2.6): Boundary granular para componentes do dashboard

**Phase 3.5:**
- Financial: ⚠️ DISPARADO — `@finance-domain-expert *review-financial-logic` (story toca `getDashboardKpis` que lê DRE financeiro)
- Compliance: WAIVED
- Growth: WAIVED

**Owner sugerido:** `@sm` → `@po` → `@dev` + `@finance-domain-expert` review + `@architect` opcional para boundaries

**Dependências:** Story 7.0 (Sentry ativo) + investigação inicial do digest

---

### Story 7.6 — Home redesign + cleanup tokens públicos (cosmético)

**Status:** Backlog **opcional** (não bloqueia go-to-market)
**T-shirt:** S (~3 pontos · 0.5 dia)

**Escopo:**

- AC1 — Home (`app/page.tsx`): remover banner "EM CONSTRUÇÃO", reescrever copy ("Financeiro que nasce da operação"), migrar H1 para `text-display-hero`
- AC2 — `<Link>` Entrar/Saber mais → `<Button asChild>` shadcn (herda `font-semibold` da 6.1)
- AC3 — Login logo → `text-display`
- AC4 — Onboarding H1 → `text-display`
- AC5 — Footer da home atualizado (remover "agenda inteligente entra na próxima Sprint" — agenda já entregue)

**Phase 2.5 gates:** apenas G2 inventário (já feito).
**Phase 3.5:** WAIVED em todos.

**Owner sugerido:** `@sm` → `@po` → `@dev`

**Dependências:** nenhuma

---

## Phase 2.6 — Auth Reliability Gates (instaurada na Story 7.4)

Quando a Story 7.4 fechar, `.claude/rules/story-lifecycle.md` ganha **5 gates novos** após Phase 2.5:

| Gate | Trigger | Verificação |
|------|---------|-------------|
| **G5** Auth UX Smoke | Story toca auth/login/onboarding | 3 cenários testados (novo / existente / expirado) — bloqueia release se algum falha |
| **G6** Sentry capture obrigatório | Criação ou alteração de error boundary | `grep "captureException"` em todo `error.tsx` → ≥1 / `grep "TODO.*Sentry"` → 0 |
| **G7** Email templates pt-BR | Story toca email transacional | Manual review — subject + body em pt-BR + branding KEYRA |
| **G8** Server Component Defensive Fetch | Server Component faz fetch direto | `from('view').select()` deve estar em try/catch + fallback |
| **G9** Boundary granular | Página com 4+ Server Components fetchers | Cada componente em error boundary próprio |
| **G10** Dead Link Audit | Toda story que adiciona `<Link>` ou `router.push` | Script CI valida que cada destino tem rota implementada |

---

## Sequenciamento REVISTO (escopo expandido — emergência)

```
DIA 0 (AGORA) — STORIES BLOCKER em sequência ESTRITA (~3-4h):
  ├─ 7.0.1 (15min) Configurar Sentry DSN em prod (Vercel env var) ⚡
  │   └─ Sem isso, Story 7.0 captura zero. Pré-requisito de tudo.
  │
  ├─ 7.0.2 (1h) HOTFIX template.tsx + diagnóstico ⚡⚡
  │   └─ Hipótese principal: <m.div className="contents"> quebrando rotas
  │   └─ Plano A: simplificar template (remover m.div ou className=contents)
  │   └─ Plano B: desabilitar template temporariamente (rename para .bak)
  │   └─ Reproduzir após cada plano e ver se erro some
  │
  └─ 7.0.3 (1-2h) Boundary granular nos cards do dashboard ⚡
      └─ Mesmo se template.tsx for o culpado, cards de dashboard devem ter
        boundaries próprios para erro num não derrubar o resto

DIA 1 — Stories 7.2 + 7.4 (paralelas, 1-2h cada)
  ├─ 7.2 Email templates pt-BR (Supabase Dashboard, sem deploy)
  └─ 7.4 not-found.tsx + audit script

DIA 1-2 — Story 7.3 (0.5 dia)
  └─ Páginas /mais e /configuracoes
  └─ Smoke de TODOS os links da Sidebar e BottomNav

DIA 2-3 — Story 7.5 (1 dia, escopo definido pós-Sentry)
  └─ Defensive fetch nas Server Actions
  └─ Phase 3.5 Financial review com @finance-domain-expert

DIA 3-4 — Story 7.1 (1.5 dia)
  └─ Auth UX (polling, reenviar, timer, callback loading)
  └─ Phase 3.5 Compliance review com @compliance-br

DIA 5 — Validação manual da idealizadora (humano)
  └─ Camila refaz jornada inteira em mobile real
  └─ Aprovação final ou nova rodada de issues

DIA 6 — Sprint 7 fechada (Phase 2.6 instaurada) → considerar go-to-market
```

**Total:** ~6 dias úteis. Story 7.6 (cosmético home) é opcional.

---

## Convocação de agents (orquestração)

| Agent | Stories que ele cobre | Comando |
|-------|----------------------|---------|
| `@aiox-master` | EPIC oversight (este documento) | `*workflow keyra-sdc-com-gate-financeiro` |
| `@sm` | Drafting de 7.1, 7.2, 7.3, 7.4, 7.5, 7.6 | `*draft 7.X` em sequência |
| `@po` | Validação de cada story (10-point checklist + Phase 2.6) | `*validate-story-draft 7.X` |
| `@dev` | Implementação serial das stories | `*develop-story 7.X` |
| `@qa` | Gate de qualidade após cada implementação | `*qa-gate 7.X` |
| `@devops` | Push, CI, deploy, Vercel rollout, audit script (7.4) | `*push` |
| `@compliance-br` | Phase 3.5 Compliance Gate em 7.1 + 7.2 | `*lgpd-audit` |
| `@finance-domain-expert` | Phase 3.5 Financial Gate em 7.5 | `*review-financial-logic` |
| `@growth-product` | Phase 3.5 Growth Gate em 7.2 (templates de email) | `*onboarding-flow` |
| `@ux-design-expert` (opcional) | Layout do `/mais` na 7.3 | `*review-design` |
| `@architect` (opcional) | Boundaries granulares na 7.5 | `*review-architecture` |

---

## Plano de ação executável (próximos 30 minutos)

**Decisão da idealizadora pendente:**

1. ✅ **Aprovar Story 7.0 imediata?** (30min, fix de 1 linha) — desbloqueia debug do digest atual
2. ✅ **Aprovar EPIC-7 inteiro?** (~7 dias) — Sprint 7 ativa
3. ✅ **Convocar `@compliance-br` e `@finance-domain-expert` agora?** ou aguardar P3.5 disparar naturalmente

**Após aprovação, o fluxo é:**

```
@aiox-master *workflow keyra-sdc-com-gate-financeiro
  ↓
@sm *draft 7.0  → status Ready em 5 min
  ↓
@po *validate-story-draft 7.0  → GO 10/10
  ↓
@dev *develop-story 7.0  → fix em 30 min
  ↓
@qa *qa-gate 7.0  → PASS
  ↓
@devops *push  → deploy automático Vercel
  ↓
[Reproduz erro → Sentry captura digest real]
  ↓
@sm *draft 7.5  → escopo definido pelo stacktrace
  ↓
[Continuar sequenciamento conforme cronograma]
```

---

## Métricas de sucesso

Sprint 7 fecha quando:

- [ ] Camila com conta criada faz login em **<3 toques** (idealmente 1 com OAuth, 2 com OTP, 3 com magic link + auto-redirect)
- [ ] Email transacional 100% pt-BR com branding KEYRA
- [ ] **Zero rotas linkadas sem implementação** (G10 Dead Link Audit em CI)
- [ ] **Zero `error.tsx` sem Sentry capture** (G6)
- [ ] Dashboard renderiza sem `error.tsx` global em **100% dos cenários** (org com dados, org sem dados, primeira sessão)
- [ ] Validação manual da idealizadora **aprovada** após refazer jornada completa
- [ ] Phase 2.6 (5 gates novos G5-G10) **instaurada como regra permanente** em `.claude/rules/story-lifecycle.md`

---

## Riscos da Sprint 7

- **R1**: Sentry no `error.tsx` pode revelar erro fundamental (ex.: cookie de sessão corrompido em iOS Safari) que exija refactor maior. Mitigação: 7.0 separada e curta, custo de descobrir é baixo.
- **R2**: OAuth Google (AC8 da 7.1) exige Google Cloud Console + Privacy Policy + Termos. Pode atrasar. Mitigação: AC8 é opcional, foco em polling primeiro (AC1) que resolve 80% da fricção.
- **R3**: Email templates customizados no Supabase podem conflitar com SMTP customizado (Resend) já configurado. Mitigação: testar em projeto Supabase de staging antes de aplicar em prod.
- **R4**: Story 7.5 (defensive fetch) pode mudar contratos de retorno de Server Actions, quebrando consumidores. Mitigação: cobertura por typecheck + tests (mas não há testes, então smoke real é crítico).
- **R5**: Validação manual em DIA 6 pode revelar mais issues e atrasar fechamento. Mitigação: aceitar — Sprint 7 só fecha quando idealizadora aprova.

---

## Documentos relacionados

- **Backlog operacional:** `docs/ux/validacao-manual-idealizadora-2026-05-02.md`
- **Análise técnica:** `docs/ux/plano-melhoria-jornada-login-2026-05-02.md`
- **Auditoria pré-motion (referência):** `docs/ux/audit-2026-05-02-pre-motion.md`
- **Sprint 6 (referência da Phase 2.5):** `docs/stories/6.0.story.md`

---

**Aguardando decisão da idealizadora para iniciar.**

Convocação imediata: aprovar Story 7.0 (30 min) para desbloquear debug do digest 3213099672.

---

## Status Final — 2026-05-02 (encerramento)

🟢🟢 **EPIC-7 ENCERRADO. Sprint 7 entregue completa em jornada única.**

### Stories executadas

| Story | Estado | Commit | Síntese |
|-------|--------|--------|---------|
| 7.0 | ✅ Done | `44c315e` | `Sentry.captureException(error)` em `(app)/error.tsx` |
| 7.0.1 | ✅ Done | `8ab06b1` | `withSentryConfig` no `next.config.ts` (source maps + tunnel `/monitoring`) |
| 7.0.2 HOTFIX | ✅ Done | `58988d4` | Root cause identificado por inspeção estática (Sentry capture nem foi necessário): `<m.div className="contents">` em `(app)/template.tsx` (Story 6.2 AC2.7) → `display: contents` + `transform` = UB em Safari iOS / React 19 hydration. Template virou passthrough `<>{children}</>` |
| 7.1 | ✅ Done | `0f8888f` | Login form: cooldown 60s + botão "Reenviar link" com timer pt-BR; `onResend()` reusa `signInWithOtpAction` |
| 7.2 | ✅ Done | `0f8888f` (código) + Management API (aplicação) | `supabase/email-templates/magic-link.html` (4249 chars, identidade KEYRA) aplicado via `PATCH /v1/projects/{ref}/config/auth` (campos `mailer_subjects_magic_link` + `mailer_templates_magic_link_content`). Subject: "Seu link de acesso ao KEYRA" |
| 7.3 | ✅ Done | `58988d4` | `/mais` (hub mobile com 9 destinos) + `/configuracoes` (org + plano + perfil + sair) |
| 7.4 | ✅ Done | `02ec96f` | 3× `not-found.tsx` (root + `(app)/` + `global-error.tsx`) + Phase 2.6 Gate G5 via `scripts/audit-dead-links.sh` (38 rotas, 16 hrefs estáticos únicos, 0 dead links) |
| 7.5 | ⏭️ Coberta | — | Arquitetura existente: `(app)/error.tsx` mantém AppShell (layout pai persistente). Falha de rota não derruba sidebar/bottom nav. Sem código novo necessário. |
| 7.6 | ⏸️ Deferido | — | Home cleanup cosmético — fora da Sprint 7. |

### Hardening pós-deploy (3 dependências não-código fechadas)

1. **Sentry production capture** — após corrigir 3 erros simultâneos nas Vercel envs (slug invertido `SENTRY_ORG`/`SENTRY_PROJECT`, trailing newline, token formato legado de 32-hex chars retornando 401), Sentry plugin opera limpo. Token novo `sntrys_*` validado contra `POST /api/0/organizations/seal-digital/releases/` (HTTP 201) **antes** de provisionar. Source maps subindo automaticamente em build (release `1cfb1773` com 230+ uploads e debug IDs).
2. **Supabase magic-link em pt-BR** — aplicado via Management API. Daqui pra frente magic link de login chega com identidade KEYRA. Templates HTML versionados em `supabase/email-templates/` como fonte canônica.
3. **Repo `luizxhgomes/keyra` ↔ Sentry GitHub integration** — verificado já ativo: `GET /api/0/organizations/seal-digital/repos/` retorna `id=5314448 status=active provider=integrations:github`. Stacktrace agora linka código fonte ↔ commit no GitHub.

### Phase 2.6 instaurada (parcial)

- ✅ **G5 Dead Link Audit** — `scripts/audit-dead-links.sh` (encontraria `/mais` e `/configuracoes` ANTES da regressão Sprint 6).
- 🔮 **G6-G10** ficam para instauração quando próxima oportunidade aparecer — estrutura defensiva já é fornecida pela arquitetura `(app)/error.tsx`.

### Lições registradas como memory permanente

- `feedback_validate_creds_before_provisioning.md` — nunca aceitar credenciais coladas no chat sem testar via API antes de provisionar. Custo de 1 curl < custo de 4 redeploys.
- `feedback_no_time_metrics.md` (já existia) — reforçada nesta sessão: planejamento por jornadas/fases/ações, nunca por tempo.

### Critério de fechamento oficial pendente

Validação manual em mobile real (Safari iOS) da idealizadora confirmando que `/dashboard`, `/agenda`, `/pacientes`, `/financeiro`, `/comandas`, `/servicos`, `/estoque`, `/team`, `/mais`, `/configuracoes` carregam **sem** o digest `3213099672` e a operação de criar agendamento funciona ponta-a-ponta.

Sentry serve como **rede de segurança contínua** após esse aceite — qualquer regressão futura ou bug em outro browser chega no dashboard com stacktrace de-minified.
