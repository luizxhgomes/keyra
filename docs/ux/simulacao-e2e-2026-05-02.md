# Simulação E2E paralela — KEYRA Sprint 6 (2026-05-02)

**Validador:** Orchestrator (Claude Opus 4.7) em paralelo com validação manual da idealizadora
**Modo:** Playwright headless mobile 375×667 + análise estática de código + HTTP smoke
**Browser:** Chromium 147.0.7727.15 (chromium-headless-shell 1217)
**Viewport:** 375×667 @ DPR 2, isMobile + hasTouch, UA iPhone 17
**Tempo:** 25 min

---

## Resumo executivo

Capturei **4 screenshots reais em mobile 375×667** (`/tmp/keyra-screenshots/`), validei **computed styles** das páginas públicas, simulei as 6 jornadas via análise de código e confirmei que todas as 4 rotas críticas de criação existem.

**Score: 9.0/10 mantido** (mesmo do relatório `validacao-completa`). Encontrei **1 issue MEDIUM novo** (tema cromático fora de `(app)/`) e **5 itens LOW** (rotas públicas/auth shell ficaram fora do scope da Sprint 6.1). Nenhum bloqueador.

---

## 1. Evidências visuais reais (Playwright headless mobile 375×667)

### `/login` — Tudo verde

```json
{
  "status": 200,
  "title": "Entrar · KEYRA",
  "lang": "pt-BR",
  "viewportMeta": "width=device-width, initial-scale=1",
  "loadTime": "926ms",
  "consoleErrors": [],
  "primaryButtonComputed": {
    "height": "44px",            ← ✅ AA touch target (Story 5.4)
    "fontWeight": "600",          ← ✅ Story 6.1 AC4
    "fontFamily": "Inter, \"Inter Fallback\", system-ui, sans-serif",
                                 ← ✅ Inter Variable carregada (Story 6.1)
    "background": "rgb(199, 106, 56)"  ← #C76A38 terracota primary ✅
  }
}
```

**Screenshot:** `/tmp/keyra-screenshots/02-login.png` (54KB)

**Confirmações visuais:**
- ✅ `text-sm font-semibold` aplicado no botão "Enviar link mágico" (Sprint 6.1 AC4)
- ✅ Inter Variable resolveu corretamente (font-family chain)
- ✅ Touch target 44px exato (Sprint 5.4)
- ✅ pt-BR no `<html lang>` e copy
- ✅ Sem erros runtime no console

### `/` (home) — 1 LOW detectado

```json
{
  "status": 200,
  "title": "KEYRA — Financeiro operacional para estética",
  "h1": {
    "text": "KEYRA",
    "classes": "text-5xl font-bold tracking-tight text-foreground"  ← ⚠️ token antigo
  },
  "consoleErrors": []
}
```

**Issue LOW**: home page ainda usa `text-5xl font-bold` em vez de `text-display-hero`. Sprint 6.1 só migrou H1 dentro de `(app)/`. Página pública ficou fora do scope. Cosmético.

**Screenshot:** `/tmp/keyra-screenshots/01-home.png` (75KB)

### `/dashboard` (sem auth) e `/agenda` (sem auth)

Ambos: HTTP 307 → `/login` (middleware proxy + requireAuth funcionando). Auth gating runtime confirmado em browser real.

---

## 2. Simulação E2E por jornada (análise de código)

### J1 — Onboarding (Camila dia 1)

**Trace de código:**

| Passo | Arquivo:linha | Comportamento confirmado |
|-------|---------------|-------------------------|
| 1. Camila entra `/` | `app/page.tsx:7-43` | ⚠️ H1 em `text-5xl` (LOW — não migrou para `text-display-hero`) |
| 2. Toca "Entrar" | `app/page.tsx:22` | Link para `/login` com `h-11` AA ✅ |
| 3. Login form | `(auth)/login/login-form.tsx:39-137` | `<form>` + Zod + sonner toast ✅ |
| 4. Magic link enviado | `actions.ts` `signInWithOtpAction` | Resend SMTP via Supabase ✅ |
| 5. Click no email | `auth/callback/route.ts` | `exchangeCodeForSession` + `getSafeNext()` ✅ |
| 6. Sem org → onboarding | `onboarding/nova-organizacao/page.tsx:32-35` | `getActiveOrgId()` retorna null → form `OnboardingForm` |
| 7. Cria org via RPC | `create_org_with_owner` | Resolve chicken-and-egg do RLS ✅ |
| 8. Cai em `/dashboard` | `(app)/layout.tsx:15-26` | `requireAuth` + `MotionProvider` ✅ |
| 9. Dashboard zerado | `(app)/dashboard/page.tsx` | `noData = true` → `<EmptyState icon={Sparkles}>` ✅ |
| 10. Routes transition | `(app)/template.tsx` | `routeTransition` 400ms (Sprint 6.2) ✅ |
| 11. Cards entram | `<ScrollFadeRise>` × 4 | `whileInView once: true` (Sprint 6.2) ✅ |

**Issues detectados:**
- LOW: home/login/onboarding shells não migraram para tokens da Sprint 6.1 (`text-5xl`, `text-3xl`, `text-2xl font-semibold` ainda presentes)
- LOW: home button "Entrar" usa `text-sm font-medium` em vez de `font-semibold` (Button component shadcn não está sendo usado — é `<Link>` com classes inline)

**Veredicto J1: ✅ funcional, com 5 itens LOW de polish**

### J2 — Dia típico mobile (FAB → sheet)

**Trace de código:**

| Passo | Arquivo:linha | Confirmado |
|-------|---------------|-----------|
| 1. Camila no `/dashboard` | `(app)/dashboard/page.tsx` | KPIs hero com sombra + ScrollFadeRise ✅ |
| 2. Toca FAB `+` (BottomNav) | `BottomNav.tsx:33-52` | `getFabAction(pathname)` → default `/agenda?novo=1` ✅ |
| 3. aria-label="Criar novo agendamento" | `BottomNav.tsx:33` | `if (!pathname) return { ..., label: 'Criar novo agendamento' }` ✅ |
| 4. Navega `/agenda?novo=1` | `useRouter` Link | Next.js client-side navigation ✅ |
| 5. Calendar-client lê param | `calendar-client.tsx:58-78` | `useSearchParams` + adjust-state-during-render ✅ |
| 6. Abre sheet automático | `calendar-client.tsx:78-83` | `setFormOpen(true)` no primeiro render com `?novo=1` ✅ |
| 7. Sheet entra | `agendamento-form.tsx:129-132` | `<Sheet>` shadcn (tailwindcss-animate slide-in) ✅ |
| 8. 5 fields + preview | `agendamento-form.tsx` | RHF + Zod + preview real-time ✅ |
| 9. Submit | `createAppointment` action | `requireAuth` + insert + EXCLUDE constraint ✅ |
| 10. Toast sucesso | sonner | Sálvia (`--success-bg: hsl(var(--secondary))` 6.2) ✅ |
| 11. Param limpo | `handleFormOpenChange` | `router.replace('/agenda')` sem `?novo=1` ✅ |

**Veredicto J2: ✅ flow completo, fonte única (FAB → query param → sheet)**

### J3 — Fechamento de mês (DRE em < 3s)

**Trace de código:**

| Passo | Arquivo:linha | Confirmado |
|-------|---------------|-----------|
| 1. Sidebar → /financeiro/dre | `Sidebar.tsx` NAV_PRIMARY[5] | Link com `border-l-4` ativo |
| 2. RouteTransition | `(app)/template.tsx` | 400ms fadeRise |
| 3. DRE renderiza | `dre/page.tsx:42-122` | H2 `text-h2` + table |
| 4. Hierarquia visual | `dre/page.tsx:78-91` | Confirmado via grep:<br>`isFinal: bg-muted/50 text-h2 border-t-2 border-border`<br>`isSubtotal: bg-muted/30 text-h3 border-t-2 border-border` |
| 5. Cor por sinal | `dre/page.tsx:84-90` | `text-secondary` (sálvia) ≥ 0 / `text-destructive` < 0 ✅ |
| 6. Ritmo vertical | `py-stack-loose` × 9 ocorrências | 24px entre linhas ✅ |
| 7. Comparativo absoluto | `<ComparativoTexto>` × 3 | "R$ X a mais que mês passado" ✅ |
| 8. Critério "< 3s" | Visual via screenshot real | ⚠️ Pendente validação humana |

**Veredicto J3: ✅ código correto. Critério "< 3s" exige observação humana real.**

### J4 — Convidando profissional

**Trace de código:**

| Passo | Arquivo:linha | Confirmado |
|-------|---------------|-----------|
| 1. Sidebar → /team | `Sidebar.tsx` NAV_SECONDARY[0] | Link com `border-t border-border` separando ✅ |
| 2. Card Membros + Convites | `team/page.tsx` | `<EmptyState icon={Mail} action="Enviar convite">` ✅ |
| 3. Toca CTA | EmptyState `action.href` | Link `/team/convites` ✅ |
| 4. Form de convite | `team/convites/page.tsx:102` | `<ConviteForm />` |
| 5. Submit | `inviteUser` action | Resend + `accept_organization_invite` RPC ✅ |
| 6. Toast sucesso | sonner | Sálvia (Sprint 6.2 AC2.6) ✅ |

**Veredicto J4: ✅ flow completo + Sprint 6.5 garante que `aria-label` em `/team` é fallback default (correto — convite via página, não FAB)**

### J5 — Alerta de estoque + dismiss

**Trace de código:**

| Passo | Arquivo:linha | Confirmado |
|-------|---------------|-----------|
| 1. Dashboard renderiza AlertasCard | `dashboard/alertas-card.tsx:24-56` | Server fetch `getActiveAlerts` + delega Client `<AlertasList>` |
| 2. AlertasList aplica cap 3+5+5 | `alertas-list.tsx:42-60` | reduce imutável (compatível React Compiler) |
| 3. Filtra dismissed | `alertas-list.tsx:38, 61` | `useDismissedAlerts` hook ✅ |
| 4. Renderiza AlertCard warning | `alertas-list.tsx:88-101` | `<AlertCard severity="warning"+ secondaryAction>` ✅ |
| 5. Toca [Investigar →] | `AlertCard.tsx:88-93` | `<Link href={action.href}>` com `min-h-[44px]` ✅ |
| 6. Toca [Silenciar 7 dias] | `AlertCard.tsx:96-103` | button `min-h-[44px]` + onClick `dismiss(a.id)` ✅ |
| 7. localStorage persiste | `use-dismissed-alerts.ts:81-91` | `safeLocalStorage.setJSON` + `dispatchEvent('storage')` ✅ |
| 8. UI atualiza imediatamente | `useSyncExternalStore` | snapshot re-leitura ✅ |
| 9. Empty state se todos silenciados | `alertas-list.tsx:62-74` | `BellOff` + contador ✅ |
| 10. Critical NÃO silencia | `alertas-list.tsx:91-99` | `severity !== 'critical'` ✅ |

**Veredicto J5: ✅ flow exemplar — Pre-implementação P1-P5 da 6.3 cumpre o protocolo**

### J6 — Cancelamento/falta

**Trace de código:**

| Passo | Arquivo:linha | Confirmado |
|-------|---------------|-----------|
| 1. /agenda → click evento | `calendar-client.tsx:91-94` | `handleEventClick` + setSelectedEvent |
| 2. EventDetailSheet abre | `event-detail-sheet.tsx` | Bottom sheet mobile (Sheet shadcn) ✅ |
| 3. Toca "Cancelar" | `event-detail-sheet.tsx` | Abre `<CancelDialog>` |
| 4. Combobox motivo + textarea | `cancel-dialog.tsx:37-49` | 4 motivos canônicos + "Outro" ✅ |
| 5. Confirma | `cancel-dialog.tsx:97` | `changeAppointmentStatus({ to: 'cancelled', reason })` |
| 6. Server action | `actions.ts` | Validator Zod + UPDATE + audit_log via trigger ✅ |
| 7. Toast sálvia | sonner | `--success-bg: hsl(var(--secondary))` ✅ |
| 8. Calendar refetch | `onChanged` callback | `calendarRef.current?.refetchEvents()` ✅ |
| 9. ReceitaCard atualiza | `revalidatePath('/agenda')` | Sticky no topo recalcula ✅ |
| 10. StatusBadge muda | `StatusBadge.tsx:191-220` | `<m.span subtleScale + key={status}>` Sprint 6.2 ✅ |

**Veredicto J6: ✅ flow completo + motion correto**

---

## 3. Pre-flight de rotas críticas (smoke)

| Rota | Existe? |
|------|---------|
| `/pacientes/novo` | ✅ |
| `/servicos/novo` | ✅ |
| `/financeiro/despesas/nova` | ✅ |
| `/estoque/insumos/novo` | ✅ |

Todas as 4 rotas que `getFabAction` mapeia (Sprint 6.5) **existem implementadas**. Sem 404s no FAB contextual.

---

## 4. Issues encontrados durante simulação E2E

### MEDIUM (1)

| # | Arquivo:linha | Descrição | Fix sugerido |
|---|---------------|-----------|--------------|
| M1 | `app/page.tsx:15` | Home `<h1>` ainda em `text-5xl font-bold` em vez de `text-display-hero`. Quando usuário não-logado abre `usekeyra.com` (porta de entrada do produto!), vê tipografia da era pré-Sprint 6.1 | Migrar para `text-display-hero` (mesmo token do `/dashboard`). 1-line change |

### LOW (4)

| # | Arquivo:linha | Descrição |
|---|---------------|-----------|
| L1 | `(auth)/login/page.tsx:36` | Logo "KEYRA" com `text-3xl font-bold` — manter intencional (logo) ou migrar pro `text-display`? Decisão de design |
| L2 | `onboarding/nova-organizacao/page.tsx:51` | H1 "Vamos criar sua clínica" em `text-2xl font-semibold` — onboarding shell fora do scope 6.1 |
| L3 | `app/page.tsx:22-33` | Buttons "Entrar" / "Saber mais" com `text-sm font-medium` (não usam `<Button>` shadcn que ganhou `font-semibold` na 6.1) |
| L4 | `(auth)/login/login-form.tsx:108` | Placeholder `voce@clinica.com.br` (sem acento) — convencional em mocks de email mas pode trocar para `seu-email@clinica.com.br` |
| L5 | `(auth)/login/login-form.tsx:74-76` | EmailSent state usa `text-secondary-500` em vez de `text-secondary` token e `text-lg font-semibold` em vez de `text-h3` |

### Padrão detectado

Todos os 5 itens estão em **rotas públicas / auth shells** (`/`, `/login`, `/onboarding`). A Sprint 6.1 migrou os 14 H1 dentro de `(app)/` mas **não tocou nas rotas externas**. Isso explica a inconsistência tipográfica entre "primeira impressão" (home) e "produto" (dashboard).

**Não é regressão silenciosa** — é gap de scope original. Ou foi intencional ("login é portal estático") ou foi esquecimento.

---

## 5. Recomendação

### Opção A — Aceitar como está
**Argumento:** rotas públicas são porta de entrada com função distinta. Diferenciação tipográfica entre "marketing/auth" e "produto" é padrão (ex.: Linear app vs linear.app).

### Opção B — Story 6.0.1 cosmética (10 min)
**Escopo:** migrar 5 itens LOW + 1 MEDIUM para tokens da 6.1.
**Custo:** trivial. Bundle size: zero impact.
**Ganho:** consistência tipográfica edge-to-edge.

### Recomendo Opção A para MVP

Razão: o produto está **funcionalmente íntegro**. As rotas externas servem propósito distinto (entrada/auth) e a inconsistência atual não bloqueia jornada nem viola princípio inegociável. Se for fazer go-to-market, abrir Story 6.0.1 cosmética 1 dia antes do launch — não agora.

---

## 6. Tabela final de validação

| Jornada | Trace código | Rotas existem | Components | Motion | Auth gating | Veredicto |
|---------|--------------|----------------|------------|--------|-------------|-----------|
| **J1 Onboarding** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ OK + 5 LOW polish |
| **J2 Mobile típico** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ OK |
| **J3 Fechamento DRE** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ OK (critério "< 3s" pendente humano) |
| **J4 Convidando** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ OK |
| **J5 Alerta+dismiss** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ OK exemplar |
| **J6 Cancelamento** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ OK |

**Todas as 6 jornadas funcionalmente íntegras. 1 MEDIUM cosmético + 4-5 LOW na superfície externa do produto.**

---

## 7. Limitações desta simulação

- **Não testou auth real**: magic link via email exige cliques humanos
- **Não testou Supabase live**: dados reais de produção não foram tocados
- **Não testou motion percebido**: animações 150-300ms só revelam UX em uso humano
- **Não testou em iPhone real**: simulação Playwright é fiel mas não 100% (touch latency, font rendering nativo)

Esses pontos são **exatamente** o que a validação manual humana (paralela à minha) cobre. As 2 validações são complementares, não substitutas.

---

## 8. Anexos

- Screenshots: `/tmp/keyra-screenshots/{01-home.png, 02-login.png, 03-dashboard-redirect.png, 04-agenda-redirect.png}`
- Report JSON: `/tmp/keyra-screenshots/report-v2.json`
- Script Playwright: `/tmp/keyra-mobile-v2.mjs`
- Validação completa estática: `docs/ux/validacao-completa-2026-05-02.md`
- Guia de validação manual: `docs/ux/validacao-mobile-camila-2026-05-02.md`
