# Validação Manual da Idealizadora — Issues encontrados em campo (2026-05-02)

**Validadora:** Idealizadora KEYRA (Luiz, simulando persona Camila)
**Modo:** Celular real (mesma rede WiFi, http://192.168.0.50:3000)
**Status:** EM ANDAMENTO — issues sendo registrados conforme aparecem

---

## Issue #1 — Login fica estático após enviar magic link (alta fricção UX)

**Severidade:** 🔴 **HIGH**
**Tela:** `/login`
**Descoberto em:** 2026-05-02 — primeira tela testada
**Persona afetada:** Camila — porta de entrada do produto, **toda** sessão começa aqui
**Anexo visual:** screenshot enviado pela idealizadora (form com `voce@clinica.com.br` + botão terracota "Enviar link mágico")

### O que acontece hoje

1. Camila abre o app / clica "Entrar"
2. Vê form com campo de email + botão "Enviar link mágico"
3. Preenche email
4. Toca "Enviar link mágico"
5. **Tela vira estado "Confira seu e-mail"** com `<CheckCircle2>` e copy "Enviamos um link mágico para X. Abra-o no mesmo dispositivo para entrar."
6. **Camila precisa:**
   - Sair do navegador/app
   - Abrir app de email (Gmail / Apple Mail / etc.)
   - Esperar email chegar (pode demorar segundos)
   - Encontrar email da KEYRA
   - Tocar no link mágico
   - Voltar ao navegador
   - **A tela "estática" anterior fica obsoleta** (sessão antiga no browser)
7. Retoma jornada — total: ~5-8 toques + troca de app

### Por que é problema

**Citação direta da idealizadora:**
> "A tela fica estática e o usuário precisa sair do app e ir pro e-mail e a tela estática fica obsoleta e deixa a experiência muito disperça, economize a quantidade de toques na tela para facilitar o acesso e garantir uma boa jornada na experiência do usuário."

**Análise UX:**
- **Quebra de fluxo**: Camila sai do contexto KEYRA → contexto email → volta. Cada troca de app é cognitive load.
- **Tela "obsoleta"**: o estado "Confira seu e-mail" perde validade quando o link é clicado em outra aba — a tela original fica congelada sem feedback de progresso
- **Sem fallback rápido**: única opção é magic link. Não há OTP de 6 dígitos, não há OAuth (Google/Apple), não há senha
- **Mobile real piora**: navegador mobile + email app + multitarefa = perda de contexto frequente. Em desktop é mais tolerável; mobile (target da Camila) é crítico

### Análise técnica do código atual

**Arquivo:** `apps/web/src/app/(auth)/login/login-form.tsx`

```tsx
// Estado atual — 2 estados mutuamente exclusivos:
//   1. idle      → form de email
//   2. submitting → spinner
//   3. sent      → "Confira seu e-mail" estático
if (emailSent) {
  return (
    <div role="status" aria-live="polite">
      <CheckCircle2 />
      <h2>Confira seu e-mail</h2>
      <p>Enviamos um link mágico para X. Abra-o no mesmo dispositivo para entrar.</p>
      <Button onClick={() => setEmailSent(null)}>Usar outro e-mail</Button>
    </div>
  );
}
```

O estado `emailSent` é local (useState) e não tem polling, realtime ou listener para detectar quando o link foi clicado.

**Backend:** Supabase Auth com `signInWithOtp` (magic link only). Suporta também:
- OTP via email (código de 6 dígitos)
- OAuth providers (Google, Apple, Microsoft, etc.)
- Senha tradicional
- Passkeys (WebAuthn)

### Opções de fix (decisão da idealizadora pendente)

#### Opção A — OAuth Google + magic link como fallback ⭐ recomendado para mobile

**Esforço:** M (~5 pts · 1 dia)
**Toques:** 2-3 (toca "Entrar com Google" → Google modal → confirma → autenticado)
**Setup:** Google Cloud Console + Supabase Auth provider config
**UX:** Camila provavelmente usa Gmail. Sem sair do navegador (modal in-place na maioria dos casos).
**Risco:** depende de OAuth quota/billing do Google (gratuito até X requests/mês)

#### Opção B — OTP de 6 dígitos (código numérico em vez de link) ⭐ recomendado para "passwordless"

**Esforço:** S (~3 pts · 0,5 dia)
**Toques:** ainda precisa abrir email, mas só copia 6 dígitos (não clica link)
**UX:** mantém "passwordless" mas reduz fricção do click+redirect. iOS 17+ auto-sugere código se for SMS (não funciona com email, só SMS).
**Vantagem:** copy/paste do OTP funciona dentro do mesmo app — usuária não perde sessão
**Implementação:** `supabase.auth.verifyOtp({ email, token: '123456', type: 'email' })`

#### Opção C — Polling no estado "Confira seu e-mail" para detectar login automático

**Esforço:** S (~3 pts · 0,5 dia)
**Toques:** mesmos do magic link atual, mas tela ATUAL detecta o login e redireciona automaticamente quando outra aba/dispositivo autenticar
**UX:** se Camila clica magic link no mesmo dispositivo (recomendação atual), a tela "Confira seu e-mail" detecta a sessão criada e redireciona automaticamente para `/dashboard`. Sem refresh manual.
**Implementação:** `supabase.auth.onAuthStateChange` listener no client + redirect quando session aparece
**Vantagem:** mantém magic link sem trocar arquitetura

#### Opção D — Senha tradicional como opção secundária

**Esforço:** M (~5 pts · 1 dia)
**Toques:** menos (1 toque após digitar email + senha)
**UX:** padrão clássico, mas exige Camila gerenciar/lembrar senha. Contra-indicado pelo design original do KEYRA ("sem senha — você recebe link no email")
**Não recomendado** — viola tese original

#### Opção E — Combinação A + C (recomendada)

OAuth Google **+** polling no fallback magic link. Cobre:
- Camila com Gmail: 2 toques (Opção A)
- Camila sem Gmail ou que prefere email: magic link com auto-redirect (Opção C)

### Recomendação do orchestrator

**Implementar Opção C imediatamente** (3 pts, sem deps externas, mantém arquitetura) **+** abrir Opção A para discussão com Camila real (validar se ela usa Gmail/Apple ID).

**Justificativa:**
- Opção C é fix mecânico de UX que **não muda o modelo de auth** — fica transparente, Camila ganha auto-redirect sem refresh
- Opção A é mudança maior (OAuth provider + privacy policy + termos atualizados) — vale validar com persona real antes de implementar
- Opção B é alternativa boa mas exige Camila aprender padrão "código de 6 dígitos" se ela já está acostumada com magic link

### Próximos passos

- [ ] Idealizadora decide entre A, B, C ou combinação após terminar validação completa
- [ ] Story 7.1 (Login UX) abre com escopo da decisão
- [ ] Phase 2.5 Anti-Regression Gates aplicada no draft (G1 princípios + G3 touch target ≥44px nos novos botões OAuth)

---

## Issue #2 — Dashboard explode com "ALGO DEU ERRADO" após login válido 🔴 CRITICAL

**Severidade:** 🔴 **CRITICAL** — produto inacessível para usuária com conta criada
**Tela:** `/dashboard` (após `/auth/callback`)
**Descoberto em:** 2026-05-02 11:44 — fluxo end-to-end com magic link
**Anexo visual:** screenshot 7 (header "Clinica Luiz Henrique" + card vermelho "ALGO DEU ERRADO")
**Código do erro:** `3213099672` (digest opaco)

### O que aconteceu (passo-a-passo)

1. Camila acessou `usekeyra.com` (home OK — screenshot 1)
2. Clicou "Entrar"
3. Preencheu email no `/login` (screenshot 3)
4. Vê "Confira seu e-mail" + toast "Link enviado!" (screenshot 4)
5. Foi pro Gmail, recebeu email **em INGLÊS** (screenshot 6 — "Your Magic Link / Follow this link to login: / Log In") 🔴 violação pt-BR
6. Clicou "Log In"
7. Voltou pro navegador
8. Cai em `/dashboard` com:
   - **Header autenticado correto** (org "Clinica Luiz Henrique" + avatar "L")
   - **BottomNav mobile renderizado** (Dashboard / Agenda / + / Pacientes / Mais)
   - **Card vermelho "ALGO DEU ERRADO" / "Não foi possível carregar essa tela."**
   - Código `3213099672` opaco
   - Botões "Tentar novamente" / "Voltar ao dashboard" (este último redundante)

### Análise

- ✅ Auth funcionou (sessão criada, JWT com `org_id` válido)
- ✅ `(app)/layout.tsx` carregou (AppShell renderizou — daí vem org switcher + BottomNav)
- ❌ **Algo dentro do `dashboard/page.tsx` ou seus Server Components quebrou** (AlertasCard, MetaCard, IndicadoresCard, AgendaHojeCard, ou page.tsx)
- ❌ **`error.tsx` tem TODO de Sentry capture** — digest é opaco porque stacktrace nunca foi enviado para Sentry. Sentry está instrumentado (`instrumentation*.ts`), mas o boundary global do `(app)/` **não chama `Sentry.captureException`**.

### Análise técnica completa em:

📄 **`docs/ux/plano-melhoria-jornada-login-2026-05-02.md`** — plano completo com:
- 6 estágios da jornada de login analisados
- 10 bugs antecipados (B1-B10)
- 5 gates novos de prevenção (G5-G9)
- Story 7.1 — Auth UX + Reliability proposta (M+ ~8 pts)
- Cronograma sugerido em 3 semanas
- Story 7.0 (1h) **URGENTE** para habilitar Sentry capture e desbloquear debug

### Plano imediato

**Story 7.0 — Sentry capture (1 hora, ANTES de qualquer outra coisa):**

```tsx
// apps/web/src/app/(app)/error.tsx — fix de 1 linha
import * as Sentry from '@sentry/nextjs';
useEffect(() => {
  Sentry.captureException(error); // ← adicionar
  console.error('[KEYRA] Unhandled error:', error);
}, [error]);
```

Sem isso, o digest `3213099672` permanece opaco e não conseguimos identificar o root cause do B1.

---

## Issue #3 — `/mais` → 404 "This page could not be found" 🔴 HIGH

**Severidade:** 🔴 **HIGH** — link morto na navegação primária mobile
**Tela:** BottomNav (5º item "Mais")
**Descoberto em:** 2026-05-02 11:58 — anexo screenshot 1 deste turno

### Causa raiz confirmada

`apps/web/src/components/layout/BottomNav.tsx:23` aponta para `/mais` mas a rota **não existe** em `apps/web/src/app/(app)/`:

```ts
const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/mais', label: 'Mais', icon: MoreHorizontal },  // ← rota inexistente
] as const;
```

**Padrão**: o item "Mais" do BottomNav mobile é uma tela de "menu hamburger" que deveria listar funcionalidades secundárias (Comandas, Serviços, Financeiro, Estoque, Time, Configurações, Sair). Quando feito desktop, esses itens vivem na Sidebar; quando mobile, vivem em /mais.

### Plano (vai virar Story 7.3 — incluído na Sprint 7)

Criar `apps/web/src/app/(app)/mais/page.tsx` com:
- Lista vertical de links secundários (Comandas, Serviços, Financeiro, Estoque, Time, Configurações)
- Botão "Sair" no rodapé
- Org switcher visível
- H1 com `text-display`
- Cada item com `min-h-[44px]` AA

---

## Issue #4 — `/configuracoes` → "This page couldn't load" 🔴 HIGH

**Severidade:** 🔴 **HIGH** — link morto na Sidebar (Story 6.5 já documentou como tech debt LOW, mas Camila chega lá facilmente e vê erro genérico)
**Tela:** Sidebar NAV_SECONDARY[1]
**Descoberto em:** 2026-05-02 11:58 — anexo screenshot 2 deste turno (dark mode "This page couldn't load / Reload Back")

### Causa raiz confirmada

`apps/web/src/components/layout/Sidebar.tsx:39` aponta para `/configuracoes` mas a rota **não existe**:

```ts
const NAV_SECONDARY = [
  { href: '/team', label: 'Time', icon: UserCog },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },  // ← rota inexistente
] as const;
```

A Story 6.5 documentou em "Out of Scope": "rota `/configuracoes` continua sendo placeholder (rota inexistente — comportamento idêntico ao da Sidebar antiga, sem regressão)". **Isso é uma falha de processo do `@po`**: aceitar comportamento quebrado como "tech debt" só porque já estava quebrado antes não é OK quando produção é a porta de entrada da Camila.

A tela em dark é o **error de browser nativo** (não `error.tsx` do KEYRA), o que sugere que a request retornou algo que o browser não conseguiu renderizar — possivelmente o NextJS `not-found` default (sem `not-found.tsx` customizado no `(app)/`).

### Plano (vai virar parte da Story 7.3 + Story 7.4 não-found)

**Curto prazo (Story 7.3):** criar página `/configuracoes` mínima viável com:
- Org info (nome, CNPJ, criada em)
- Email transacional (ler, sem editar — Phase 5+)
- "Em breve: editar dados da clínica, billing, integrações"
- Link "Sair" também aqui
- Igual padrão visual do `/team`

**Curto prazo (Story 7.4):** criar `app/(app)/not-found.tsx` customizado com EmptyState + link "Voltar ao dashboard". Resolve qualquer rota inexistente futura.

---

## Outras issues encontradas (continuar registrando)

| # | Severidade | Tela | Descrição | Status |
|---|------------|------|-----------|--------|
| 1 | 🔴 HIGH | `/login` | Tela estática após enviar magic link | ✅ registrado |
| 2 | 🔴 CRITICAL | `/dashboard` pós-login | "Algo deu errado" digest 3213099672 | ✅ registrado + plano completo |
| 3 | 🔴 HIGH | `/mais` (BottomNav) | 404 — rota não existe | ✅ registrado |
| 4 | 🔴 HIGH | `/configuracoes` (Sidebar) | Browser error — rota não existe | ✅ registrado |
| 5 | — | — | — | aguardando |

---

## Resumo do que foi validado até agora

| Tela | Status | Issues |
|------|--------|--------|
| `/` (home) | ⚠️ "Em construção" + tokens antigos | B4, B7 |
| `/login` | ⚠️ Único método + tela estática + placeholder ambíguo | #1 HIGH, B5, B8 |
| `/login` "Confira seu e-mail" | 🔴 Sem auto-detect de login | #1 HIGH (B2) |
| Email do magic link | 🔴 INGLÊS total (viola princípio inegociável) | B3 HIGH |
| `/auth/callback` | ✅ Server route OK (sem feedback visual) | B6 MEDIUM |
| `/dashboard` pós-login | 🔴 ALGO DEU ERRADO digest opaco | #2 CRITICAL (B1) |

(Idealizadora ainda validando — continua...)
