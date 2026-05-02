# Plano de Melhoria — Jornada de Login KEYRA (2026-05-02)

**Origem:** validação real da idealizadora em mobile no celular (Safari iOS) acessando `usekeyra.com`.
**Severidade global:** 🔴 **CRITICAL** — produto fica inacessível para usuária com conta criada.
**Modelo:** análise por estágio + antecipação proativa de erros + plano sistêmico para prevenção.
**Princípio orientador:** "**economize toques, garanta jornada validada, antecipe erros antes que apareçam**" — citação direta da idealizadora.

---

## 0. Sumário executivo

Camila atravessa **6 estágios** entre `usekeyra.com` e o `/dashboard`. Hoje cada estágio tem **fricção ou bug**:

| # | Estágio | Status atual | Severidade |
|---|---------|-------------|------------|
| 1 | Home `usekeyra.com` | ⚠️ "Em construção" + tipografia inconsistente | 🟡 MEDIUM |
| 2 | Login form (`/login`) | ⚠️ Único método (magic link); placeholder ambíguo | 🟡 MEDIUM |
| 3 | Estado "Confira seu e-mail" | 🔴 **Tela estática que não detecta auto-login** | 🔴 HIGH |
| 4 | Email recebido | 🔴 **Subject + body em INGLÊS** (viola pt-BR inegociável) | 🔴 HIGH |
| 5 | Click magic link → `/auth/callback` | ✅ Server route funcional | 🟢 OK |
| 6 | Redirect para `/dashboard` | 🔴 **`error.tsx` ALGO DEU ERRADO** com digest opaco | 🔴 CRITICAL |

**Veredicto:** a jornada de login **não está validada**. Usuária com conta criada cai em página de erro. **Bloqueador absoluto pra go-to-market.**

**Próximo passo proposto:** Sprint 7 dedicada a **Auth UX + Reliability** (M+ ~8 pts) que entrega os 6 estágios polidos + Sentry capturing real + sistema antecipativo de prevenção.

---

## 1. Detalhamento por estágio

### Estágio 1 — Home `usekeyra.com`

**O que Camila vê (screenshot 1 anexado):**
- Cabeçalho "EM CONSTRUÇÃO" em terracota uppercase
- H1 "KEYRA" em preto (`text-5xl font-bold`)
- Subtitle "Financeiro operacional para estética. A agenda dispara o financeiro automaticamente."
- 2 CTAs: "Entrar" (terracota) + "Saber mais" (outline)
- Footer "Login passwordless, organizações, equipe e cadastros já no ar. A agenda inteligente entra na próxima Sprint."

**Problemas identificados:**

| # | Severidade | Problema |
|---|------------|----------|
| 1.1 | 🟡 M | "Em construção" passa imagem amadora para prospect que ainda não conhece o produto. Não é mais verdade — Sprint 6 fechou camada visual completa. |
| 1.2 | 🟢 L | H1 "KEYRA" em `text-5xl font-bold` (token antigo) em vez de `text-display-hero` (Sprint 6.1). Inconsistência tipográfica entre marketing e produto. |
| 1.3 | 🟢 L | Buttons "Entrar"/"Saber mais" não usam `<Button>` shadcn — `text-sm font-medium` em vez de `font-semibold` (Sprint 6.1 AC4). |
| 1.4 | 🟢 L | Footer "A agenda inteligente entra na próxima Sprint" — desatualizado (agenda já entregue na Sprint 2). |

**Plano:**
- Remover banner "EM CONSTRUÇÃO"
- Reescrever copy: "Financeiro que nasce da operação" (positioning real)
- Migrar H1 para `text-display-hero`
- Trocar `<Link>` inline por `<Button asChild>` shadcn (herda `font-semibold` da 6.1)
- Atualizar footer com features reais entregues

---

### Estágio 2 — Login form `/login`

**O que Camila vê (screenshot 3 anexado):**
- "KEYRA" em terracota
- "Entre no seu financeiro operacional."
- Card com label "E-mail" + input com placeholder `voce@clinica.com.br`
- Botão "Enviar link mágico" terracota
- Texto "Sem senha. Você recebe um link único no e-mail e entra com um clique."
- Link "Voltar para a página inicial"

**Problemas identificados:**

| # | Severidade | Problema |
|---|------------|----------|
| 2.1 | 🟡 M | **Único método de login** (magic link). Sem OAuth Google/Apple, sem OTP, sem senha. |
| 2.2 | 🟢 L | Placeholder `voce@clinica.com.br` parece pré-preenchido (Camila pode pensar que é o email dela já cadastrado). Trocar para `seu-email@clinica.com.br`. |
| 2.3 | 🟢 L | Logo "KEYRA" em `text-3xl font-bold` (token antigo). |

**Plano:**
- Adicionar **OAuth Google** como opção primária (ver Estágio 3 para racional — reduz drasticamente fricção 3-4)
- Manter magic link como fallback
- Trocar placeholder do input
- Migrar logo para `text-display`

---

### Estágio 3 — Estado "Confira seu e-mail" 🔴 HIGH

**O que Camila vê (screenshot 4 anexado):**
- "Confira seu e-mail" com `<CheckCircle2>` verde grande
- "Enviamos um link mágico para `luizzzhenriqueoficial@gmail.com`. Abra-o no mesmo dispositivo para entrar."
- Botão "Usar outro e-mail"
- Toast Sonner: "Link enviado! Verifique sua caixa de entrada (e o spam)."
- "Voltar para a página inicial"

**Problemas identificados:**

| # | Severidade | Problema |
|---|------------|----------|
| 3.1 | 🔴 HIGH | **Tela estática** sem polling/realtime para detectar quando link é clicado em outro device/aba. Quando Camila clica no link no Gmail, **a aba original do navegador FICA OBSOLETA**. |
| 3.2 | 🔴 HIGH | **Não economiza toques** — exige sair do navegador, abrir email, voltar. Em iOS Safari, multitarefa frequentemente fecha aba original. |
| 3.3 | 🟡 M | Sem **timer/contador** de "link expira em 1h" — Camila não sabe se já passou tempo. |
| 3.4 | 🟡 M | Sem opção de **reenviar** sem precisar trocar email. |

**Plano (Opção C+ recomendada):**

1. **Adicionar polling com `supabase.auth.onAuthStateChange`** — Client Component detecta SIGNED_IN event e auto-redireciona para `/dashboard` mesmo se outro device clicou. Aba original deixa de ser "obsoleta".
2. **Botão "Reenviar link"** com cooldown de 60s.
3. **Timer "link expira em ~1h"** sutil (texto pequeno cinza).
4. **Deep link iOS para email** — `mailto:` com hint para abrir Gmail/Apple Mail nativo.

```tsx
// Esboço técnico:
const supabase = createBrowserClient();
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      router.push('/dashboard');
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

---

### Estágio 4 — Email recebido 🔴 HIGH

**O que Camila vê (screenshot 6 anexado):**
- **Subject: "Your Magic Link"** ⚠️ INGLÊS
- Sender: "KEYRA <no-reply@usekeyra.com>" ✅ pt-BR no nome
- **Body: "Magic Link / Follow this link to login: / Log In"** ⚠️ TUDO INGLÊS

**Problemas identificados:**

| # | Severidade | Problema |
|---|------------|----------|
| 4.1 | 🔴 **HIGH** | **VIOLAÇÃO DE PRINCÍPIO INEGOCIÁVEL**: pt-BR acentuado é regra primária do `CLAUDE.md`. Email é o ponto de **maior visibilidade** do produto (chega na inbox real da usuária) e está em **inglês total**. |
| 4.2 | 🟡 M | Subject "Your Magic Link" não diz que é da KEYRA. Bom para CTR, ruim para reconhecimento de marca. Camila pode marcar como spam. |
| 4.3 | 🟡 M | Body genérico — sem header com logo, sem footer com explicação, sem segurança (instruções "se você não solicitou esse login..."). |

**Plano (URGENTE):**

Customizar templates de email no Supabase Dashboard → Authentication → Email Templates:

```html
<!-- Subject -->
Seu link de acesso à KEYRA

<!-- Body HTML -->
<table width="100%" style="background: #FAF8F5; padding: 32px;">
  <tr><td align="center">
    <table width="480" style="background: #FFFFFF; border-radius: 8px; padding: 32px; font-family: Inter, sans-serif;">
      <tr><td>
        <h1 style="color: #C66A38; font-size: 32px; font-weight: 600; margin: 0 0 16px;">KEYRA</h1>
        <h2 style="font-size: 20px; color: #2E2A25; margin: 0 0 16px;">Seu link de acesso</h2>
        <p style="color: #5A5249; margin: 0 0 24px;">
          Toque no botão abaixo para entrar na sua conta. O link expira em 1 hora e funciona apenas uma vez.
        </p>
        <a href="{{ .ConfirmationURL }}"
           style="display: inline-block; background: #C66A38; color: white; padding: 12px 24px;
                  border-radius: 6px; text-decoration: none; font-weight: 600;">
          Entrar na KEYRA
        </a>
        <p style="color: #5A5249; font-size: 14px; margin: 24px 0 0;">
          Se você não solicitou este acesso, pode ignorar este e-mail com segurança.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
```

Templates a customizar:
- `Magic Link` (este caso)
- `Confirm Signup`
- `Invite User` (já customizado via Resend + React Email — verificar)
- `Reset Password` (não usado, mas configurar)
- `Change Email Address` (não usado, mas configurar)

---

### Estágio 5 — Click magic link → `/auth/callback`

**Comportamento atual** (`apps/web/src/app/auth/callback/route.ts`):

1. Recebe `?code=<token>`
2. `exchangeCodeForSession(code)`
3. `refreshSession()` para Auth Hook injetar `org_id` no JWT
4. Verifica `?next=` (open redirect-safe via `isSafeNextPath`)
5. Default: `getActiveOrgId()` → `/dashboard` ou `/onboarding/nova-organizacao`

**Status:** ✅ **Server route OK** — código robusto, com error handling, ADRs 010/012 cumpridos.

**1 problema identificado:**

| # | Severidade | Problema |
|---|------------|----------|
| 5.1 | 🟡 M | Sem **feedback visual durante o redirect** — Camila vê navegador em branco entre click e dashboard (ou em nosso caso, error). Tempo médio: 800-1500ms. |

**Plano:**
- Criar `app/auth/callback/loading.tsx` com `Skeleton` editorial (KEYRA logo + spinner sutil) — reduz percepção de "tela branca" para 200ms.

---

### Estágio 6 — Redirect para `/dashboard` 🔴 **CRITICAL**

**O que Camila vê (screenshot 7 anexado):**
- Header com OrgSwitcher "Clinica Luiz Henrique" ✅ — autenticação OK, JWT carregado, org ativa
- Avatar "L" no canto direito ✅
- Card vermelho "ALGO DEU ERRADO"
- "Não foi possível carregar essa tela."
- Copy mentora confiável (Sprint 5.2 funcional)
- **Código do erro: `3213099672`** — digest opaco do React/Next
- Botões: "Tentar novamente" + "Voltar ao dashboard" (este último redundante, já estamos no dashboard)
- BottomNav mobile com 5 itens (Dashboard ativo, Agenda, +, Pacientes, Mais)

**Análise técnica:**

A camada de erro funcionou exatamente como projetada na **Story 5.2** — `(app)/error.tsx` capturou erro não-tratado dentro do route group autenticado e mostrou tela humanizada.

**MAS o root cause ESCAPOU sem rastreamento porque:**

```tsx
// apps/web/src/app/(app)/error.tsx:24-27
useEffect(() => {
  // TODO: Sentry capture quando configurado em produção  ⚠️ TODO ABERTO
  console.error('[KEYRA] Unhandled error:', error);
}, [error]);
```

**Sentry está INSTRUMENTADO** (`apps/web/src/instrumentation.ts` + `apps/web/src/instrumentation-client.ts`), mas **NÃO chamado neste error boundary**. Resultado: digest `3213099672` é completamente opaco — não há stacktrace, não há request id, não há informação correlacionada nos logs.

**Suspeitas técnicas (rankeadas por probabilidade):**

| # | Suspeita | Probabilidade | Como verificar |
|---|---------|---------------|----------------|
| A | Server Component (`AlertasCard`, `MetaCard`, `IndicadoresCard`, `AgendaHojeCard`) lança erro fora do try/catch durante render — possivelmente no fetch Supabase de view sem dados (`v_dashboard_kpis` vazio) | ALTA | Adicionar Sentry capture em error.tsx + reproduzir |
| B | Erro de hidratação React 19 com framer-motion `LazyMotion strict` rejeitando algum `<motion.*>` | MÉDIA | Conferi greps — sem `<motion.*>` órfão. Mas pode ter import do tipo errado. |
| C | Cookie de sessão em estado inconsistente — Auth Hook atrasou inserir `org_id` no JWT, primeira query retorna vazio mas Layout passou | MÉDIA | Verificar logs do Supabase Auth |
| D | Timeout de query Supabase Free (cold start após pause de 7 dias?) | BAIXA | Verificar se Supabase pausou (last activity registrada) |
| E | Conflito entre `MotionProvider` (Client) e `Sentry` instrumentation | BAIXA | Logs do browser com `console.error` |
| F | Erro de timezone em date-fns (`subMonths`, `format` ptBR) renderizando algum mês inválido | BAIXA | Testar em data específica |

**Plano:**

1. **🔴 URGENTE — Habilitar Sentry capture no `error.tsx`** (1 linha):
   ```tsx
   import * as Sentry from '@sentry/nextjs';
   useEffect(() => {
     Sentry.captureException(error);
     console.error('[KEYRA] Unhandled error:', error);
   }, [error]);
   ```

2. **Reproduzir o erro** — refazer fluxo com Sentry capturing → ler stacktrace real

3. **Adicionar boundary granular nos cards do dashboard** — cada `<AlertasCard>`, `<MetaCard>`, etc envolto em `<ErrorBoundary fallback={<ErrorMessage />}>` para que erro num card não derrube o dashboard inteiro

4. **Botão "Voltar ao dashboard" redundante** quando já estamos no dashboard — trocar por "Voltar ao login" ou "Sair e entrar novamente"

5. **Defensive code em `getDashboardKpis`** — quando view retorna `null` (org sem dados), retornar zeros sem propagar erro

---

## 2. Antecipação proativa de erros (Sistema de prevenção)

A idealizadora pediu: **"quero que sejam antecipados para que sejam identificados de forma prévia para serem corrigidos antecipadamente."**

Aqui está o sistema proposto — **5 gates novos** para abrir Phase 2.6 ou expandir Phase 2.5 existente:

### Gate G5 — Auth UX Smoke (sempre antes de release)

Trigger: qualquer story que toca auth, callback, login, onboarding.

Verificação manual ou automatizada:

```bash
# Cenário 1: Usuário novo
1. Abrir / em mobile real
2. Toca Entrar
3. Preenche email novo
4. Recebe email em pt-BR
5. Clica link no Gmail
6. Volta ao app — auto-redirect para /onboarding/nova-organizacao
7. Cria org
8. Cai em /dashboard sem erro

# Cenário 2: Usuário existente (Camila)
1. Abrir / em mobile real
2. Toca Entrar
3. Preenche email já cadastrado
4. Recebe email em pt-BR
5. Clica link
6. Volta ao app — auto-redirect para /dashboard
7. Dashboard renderiza sem error.tsx

# Cenário 3: Magic link expirado
1. Receber link
2. Aguardar > 1h
3. Clicar — deve mostrar /login?error=link_expired com copy clara
```

**Falha em qualquer cenário = bloqueio do release.**

### Gate G6 — Sentry Capture obrigatório

Trigger: criação ou alteração de qualquer `error.tsx` ou error boundary.

Verificação:

```bash
grep -rn "TODO.*Sentry\|TODO.*Sentry capture" apps/web/src
# Esperado: 0 matches
grep -rn "captureException" apps/web/src/app/**/error.tsx
# Esperado: ≥ 1 por error.tsx
```

**Sem Sentry capture = digest opaco = debug impossível em prod.**

### Gate G7 — Email templates pt-BR obrigatório

Trigger: qualquer story que toca email transacional (Supabase Auth ou Resend).

Verificação:

```sql
-- Supabase Dashboard → Authentication → Email Templates → cada template
-- Manual: subject e body devem estar em pt-BR
```

Anti-padrão: email com "Magic Link", "Reset Password", "Confirm Signup" em inglês.

### Gate G8 — Server Component Defensive Fetch

Trigger: criação de Server Component que faz fetch direto do Supabase (sem ActionResult wrapper).

Verificação: todo `from('view_or_table').select(...)` deve estar em try/catch que retorna `{ ok: false, error: ... }` em vez de propagar.

```tsx
// ❌ BAD — propaga erro fora do tryCatch
const { data, error } = await supabase.from('v_dashboard_kpis').select('*');
return <div>{data.value}</div>;

// ✅ GOOD — try/catch + fallback
try {
  const result = await getDashboardKpis();
  if (!result.ok) return <ErrorMessage detail={result.error} />;
  return <div>{result.data.value}</div>;
} catch {
  return <ErrorMessage detail="Erro ao carregar" />;
}
```

### Gate G9 — Boundary granular para componentes do dashboard

Trigger: qualquer página com 4+ Server Components que façam fetch independente.

Verificação: cada Server Component fetcher deve estar em error boundary próprio (`<ErrorBoundary fallback={<ErrorMessage />}>`) para isolar falhas.

Anti-padrão: erro em `MetaCard` derruba `AlertasCard` + `IndicadoresCard` + `AgendaHojeCard` simultaneamente.

---

## 3. Story 7.1 — Auth UX + Reliability (proposta)

**T-shirt:** M+ (~8 pontos · 2 dias)

**Escopo (8 ACs):**

- AC1 — `(app)/error.tsx` captura via `Sentry.captureException(error)` (G6 cumprido)
- AC2 — Templates Supabase Auth em pt-BR (G7 cumprido)
- AC3 — Polling `onAuthStateChange` no estado "Confira seu e-mail" (Estágio 3.1) — auto-redirect quando link clicado em outro device
- AC4 — Botão "Reenviar link" com cooldown 60s (Estágio 3.4)
- AC5 — Timer "link expira em ~1h" (Estágio 3.3)
- AC6 — `/auth/callback/loading.tsx` (Estágio 5.1) — Skeleton editorial
- AC7 — Defensive fetch em `getDashboardKpis()` + boundary granular nos 4 cards do dashboard (Estágio 6 - prevenção)
- AC8 — OAuth Google como opção primária no `/login` form (Estágio 2.1) — recomendado mas validar com Camila se ela usa Gmail antes

**Pre-implementação obrigatória (Phase 2.5 + nova Phase 2.6 com G5-G9):**

- P1 — Sentry capture habilitado **antes** de qualquer trabalho (5 min, prereq para debug)
- P2 — Reproduzir erro digest 3213099672 com Sentry novo + capturar stacktrace
- P3 — Inventariar Server Components do dashboard que fazem fetch (G8)
- P4 — Listar todos os Email Templates do Supabase Auth (G7)
- P5 — Definir cooldown e timer (decisões antecipadas para AC4 e AC5)

**Phase 3.5:**
- Financial Gate: WAIVED (sem alteração de fórmulas)
- Compliance Gate: ⚠️ **DISPARADO** — story toca email + auth, dispara `@compliance-br *lgpd-audit` para validar templates pt-BR + tratamento de tokens
- Growth Gate: ⚠️ **DISPARADO se OAuth entrar** — disparar `@growth-product *onboarding-flow` para validar funnel impact

**Out of Scope:**
- Senha tradicional (viola tese passwordless do KEYRA)
- Passkeys/WebAuthn (Phase 5+)
- 2FA/MFA (Phase 5+ se necessário)
- Login social com mais providers além do Google (Apple ID requer Apple Developer fee, Microsoft/Azure exige conta enterprise — esperar demanda real)
- Self-service de "esqueci minha senha" (não há senha)

---

## 4. Bugs antecipados que essa investigação revelou

Catalogados aqui como backlog imediato — alguns viram ACs da Story 7.1, outros são stories irmãs.

| # | Severidade | Origem | Item |
|---|-----------|--------|------|
| B1 | 🔴 CRITICAL | Estágio 6 | Dashboard explode com erro genérico após login válido — root cause desconhecido (Sentry off) |
| B2 | 🔴 HIGH | Estágio 3 | Tela "Confira seu e-mail" não detecta auto-login (polling ausente) |
| B3 | 🔴 HIGH | Estágio 4 | Email Supabase Auth em INGLÊS (viola pt-BR inegociável) |
| **B11** | 🔴 **HIGH** | **BottomNav** | **`/mais` link sem rota implementada → 404 (Issue #3)** |
| **B12** | 🔴 **HIGH** | **Sidebar** | **`/configuracoes` link sem rota implementada → browser error (Issue #4)** |
| B4 | 🟡 MEDIUM | Estágio 1 | Home com "EM CONSTRUÇÃO" + tipografia antiga |
| B5 | 🟡 MEDIUM | Estágio 2 | Único método de login (sem OAuth/OTP) |
| B6 | 🟡 MEDIUM | Estágio 5 | Sem feedback durante callback (tela branca 800-1500ms) |
| B7 | 🟢 LOW | Estágio 1 | Footer desatualizado ("agenda inteligente entra na próxima Sprint") |
| B8 | 🟢 LOW | Estágio 2 | Placeholder `voce@clinica.com.br` ambíguo |
| B9 | 🟢 LOW | Estágio 3 | Sem reenviar / sem timer |
| B10 | 🟢 LOW | Estágio 6 | Botão "Voltar ao dashboard" redundante quando já está no dashboard |
| **B13** | 🟢 **LOW** | **Sem `not-found.tsx`** | **NextJS default 404 em inglês ("This page could not be found")** — viola pt-BR |

---

## 5. Cronograma sugerido (post-validação manual)

**Semana 1 (urgência):**
- Story 7.0 (1 hora) — habilitar Sentry capture em `error.tsx` + redeploy. **DESBLOQUEIA debug** do digest atual.
- Reproduzir digest 3213099672 com Sentry → identificar root cause do B1
- Hotfix B1 conforme stacktrace revelar

**Semana 1-2:**
- Story 7.1 (2 dias) — Auth UX + Reliability conforme escopo acima
- Story 7.2 (0.5 dia) — Email templates pt-BR (B3) — pode ir junto com 7.1 mas é isolado

**Semana 2-3 (após validação manual completa da idealizadora):**
- Story 7.3 — Home redesign + Out-of-Scope da 6.1 (B4, B7, restante dos LOW)
- Story 7.4 — OAuth Google se decidido (B5, requer Google Cloud Console + Privacy Policy)

---

## 6. Compromisso com prevenção

Antes de qualquer release futuro tocar auth/login/email, **G5-G9 viram regra obrigatória em `.claude/rules/story-lifecycle.md`** (extensão da Phase 2.5 instaurada na Story 6.0).

Isso garante:
- ❌ Nunca mais "TODO Sentry capture" esquecido em prod
- ❌ Nunca mais email transacional em inglês
- ❌ Nunca mais Server Component sem try/catch derrubando dashboard inteiro
- ❌ Nunca mais auth flow sem smoke test de 3 cenários (novo, existente, expirado)

**Phase 2.6 — Auth Reliability Gates** será a evolução natural após esta validação real.

---

## 7. Aguardando próximos issues da idealizadora

Este documento é vivo. À medida que a idealizadora valide outras telas e encontre mais bugs, são adicionados aqui (referenciando issues por #) e priorizados no backlog.

**Próximos passos:**
1. ✅ Issue #1 (login estático) registrado em `validacao-manual-idealizadora-2026-05-02.md`
2. ✅ Issue #2 (dashboard explode pós-login) registrado neste documento como B1
3. ⏳ Aguardando próximas observações da validação em curso
