# Story auth.9: Polish UX completo — jornada de auth afunilada + indicador de força de senha + visual revamp AppShell

## Status

InProgress

## Story

**Como** usuária do KEYRA navegando entre tela de auth (light KEYRA) e área autenticada (AppShell),
**Eu quero** uma experiência visualmente coerente e uma jornada de auth (cadastro / esqueci senha / redefinição) com fases explícitas e feedback de força de senha,
**Para que** eu sinta o produto como uma marca única e consistente, com cada passo da jornada de auth tendo cabeçalho claro do "onde estou" e "o que vem depois", reduzindo fricção e aumentando confiança em momentos críticos como definir senha.

> **Contexto do epic:** Story 9 de 10 do `EPIC-AUTH-V2.md` — Fase D (Polish). Fecha o gap de coerência visual: telas auth foram refinadas em PR #6+#7 (light KEYRA), mas AppShell autenticado mantém o visual original. Adicionalmente, escopo expandido em 2026-05-06 para incluir a "jornada afunilada" e "indicador de força de senha" propostas durante a fiscalização do recovery flow — todos relacionados a polish UX coeso.

## Complexidade

**T-shirt:** L (~8 pontos) — escopo expandido das 5 originais + 3 da expansão de fiscalização.

## Acceptance Criteria

### AC1 — Componente compartilhado `<JourneyProgress />` (jornada afunilada)

1. Criar `apps/web/src/components/auth/JourneyProgress.tsx`.
2. Props: `{ step: 1|2|3|4, total: 4 }`.
3. Renderiza checklist visual horizontal com 4 itens:
   - ✓ verde nos passos completos
   - ⏳ destacado (primary marrom) no passo atual
   - ○ cinza claro nos passos futuros
4. Labels concisos (mobile-first, max 12 chars cada): "Solicitar" · "Verificar" · "Definir" · "Entrar"
5. Acessível: `role="list"`, cada item com `aria-label="Passo X: {label}, {status}"`.
6. Sem dependências novas; usa Tailwind + Lucide icons (`Check`, `Loader2`).

### AC2 — Componente compartilhado `<PasswordStrengthMeter />`

1. Criar `apps/web/src/components/auth/PasswordStrengthMeter.tsx`.
2. Props: `{ password: string }`.
3. Avalia força em 4 níveis (sem dep externa — heurística simples baseada em comprimento + diversidade de classes):
   - **Fraca** (0-1 critérios): vermelho `text-red-600 bg-red-100`
   - **Regular** (2 critérios): âmbar `text-amber-700 bg-amber-100`
   - **Boa** (3 critérios): verde-claro `text-emerald-700 bg-emerald-100`
   - **Forte** (4 critérios + ≥12 chars): verde-escuro `text-emerald-900 bg-emerald-200`
4. Critérios: ≥10 chars · letra minúscula · letra maiúscula · número
5. Renderização: 4 traços horizontais coloridos progressivamente + label texto curto à direita (`Fraca|Regular|Boa|Forte`)
6. Atualiza em tempo real (responde a cada keystroke no input que passa `password`).
7. Renderização condicional: oculto se `password.length === 0`.
8. Aria: `role="status" aria-live="polite"` para feedback assistivo.

### AC3 — Tela `/redefinir-senha/sucesso` (fechamento da jornada)

1. Criar `apps/web/src/app/(auth)/redefinir-senha/sucesso/page.tsx` (Server Component).
2. Sem guard de sessão — ao chegar aqui, sessão já foi invalidada pelo `signOut({scope:'global'})` da action.
3. Renderiza card light KEYRA centralizado com:
   - Bolha do "K" KEYRA (mesma da tela auth)
   - Ícone ✓ verde grande (Lucide `CheckCircle2` 64px) em um círculo bg-emerald-100
   - Título: "Senha alterada com sucesso!"
   - Texto: "Suas outras sessões foram desconectadas por segurança. Faça login com a nova senha."
   - `<JourneyProgress step={4} total={4} />`
   - Botão CTA: "Fazer login" (`<Link href="/login">`)
4. Touch target ≥ 44px (G3).
5. Animação de entrada idêntica ao SignInCard (`animate-in fade-in zoom-in-95 duration-500`).

### AC4 — Action `setNewPasswordAction` redireciona para `/redefinir-senha/sucesso`

1. Editar `apps/web/src/app/(auth)/redefinir-senha/actions.ts`.
2. Mudar `return { success: true }` mantendo o tipo do retorno, mas o NewPasswordCard navega para `/redefinir-senha/sucesso` (não mais `/login?password_changed=1`).
3. `/login?password_changed=1` continua funcionando (banner verde) — caso o user clique no link de "Fazer login" da tela `/sucesso`, ou caso volte por outro caminho. Não remover.

### AC5 — `RequestResetCard` ganha `<JourneyProgress />`

1. Editar `apps/web/src/components/auth/RequestResetCard.tsx`.
2. Renderiza `<JourneyProgress step={1} total={4} />` no estado `form` (acima do título "Recuperação de senha").
3. Renderiza `<JourneyProgress step={2} total={4} />` no estado `submitted` (acima de "Pedido recebido").
4. Renderiza `<JourneyProgress step={4} total={4} />` no estado `completedElsewhere` — fluxo da auth.8 (BroadcastChannel) também ganha closure visual.

### AC6 — `NewPasswordCard` ganha `<JourneyProgress />` + `<PasswordStrengthMeter />`

1. Editar `apps/web/src/components/auth/NewPasswordCard.tsx`.
2. Renderiza `<JourneyProgress step={3} total={4} />` acima do título "Definir nova senha".
3. Renderiza `<PasswordStrengthMeter password={watchedPassword} />` abaixo do campo "Nova senha" — usa `useWatch` de react-hook-form para sincronizar com o input em tempo real.
4. Critério visual: meter aparece somente após user começar a digitar (oculto se `password.length === 0`).
5. NewPasswordCard ao receber `success` da action, faz `router.push('/redefinir-senha/sucesso')` (não mais `/login?password_changed=1`).

### AC7 — `SignUpCard` (cadastro) ganha `<PasswordStrengthMeter />`

1. Editar `apps/web/src/components/auth/SignUpCard.tsx`.
2. Adicionar `<PasswordStrengthMeter password={watchedPassword} />` abaixo do campo "Senha".
3. Mesmo critério de visibilidade condicional (oculto se vazio).
4. **Não** adicionar `<JourneyProgress />` no cadastro — cadastro tem fluxo próprio (signup → onboarding nova-org → dashboard) que será polido em story futura. Esta story foca recovery + AppShell.

### AC8 — Visual revamp AppShell autenticado (escopo original auth.9)

1. **Sidebar (`apps/web/src/components/layout/Sidebar.tsx`):**
   - Adicionar bolha "K" KEYRA no topo (acima do `NAV_PRIMARY`) — mesmo estilo da tela auth (`h-10 w-10 rounded-full bg-primary text-primary-foreground`)
   - No estado colapsado (sidebar minimizada), bolha aparece centralizada
   - No estado expandido, bolha + label "KEYRA" ao lado (caps tracking-wider)
2. **Header (`apps/web/src/components/layout/AppShell.tsx`):**
   - Adicionar gradient sutil ao header: `background: 'radial-gradient(circle at 50% 0%, hsl(21 56% 50% / 0.04), transparent 60%)'` (intensidade reduzida de 0.08 da auth pra 0.04 — não competir com conteúdo)
   - Manter `border-b border-border` e `bg-background/95 backdrop-blur` existentes
   - Tipografia do "Olá, {nome}" com mesma weight/tracking da tela auth (`font-medium tracking-tight`)
3. **UserMenu (`apps/web/src/components/layout/UserMenu.tsx`):**
   - Avatar usa bolha primary (mesma cor do "K" da tela auth) com inicial do nome em vez de cinza neutro
   - Dropdown items com hover `hover:bg-primary/5` em vez de `hover:bg-muted` (sutil tom KEYRA)
4. **OrgSwitcher (`apps/web/src/components/layout/OrgSwitcher.tsx`):**
   - Item ativo destacado com `text-primary font-medium`
   - Checkmark com `text-primary` em vez de `text-foreground`
5. **BottomNav (mobile, `apps/web/src/components/layout/BottomNav.tsx`):**
   - Item ativo com `text-primary` (já tem ou não? validar)
   - FAB do "novo" com `bg-primary` (provavelmente já tem) e shadow KEYRA (`shadow-lg shadow-primary/20`)

### AC9 — Quality gates (mantém o padrão)

1. `pnpm typecheck` passa
2. `pnpm lint --max-warnings 0` passa
3. `./scripts/check-rsc-boundaries.sh` PASS — atenção especial pra `JourneyProgress` (Server-safe) e `PasswordStrengthMeter` (Client por causa de live-update)

### AC10 — Anti-regressão CRÍTICA: fluxo de recovery continua funcionando

1. Após implementação, rodar `node scripts/e2e-auth-recovery-real.mjs` contra preview Vercel:
   - Espera-se 12/12 PASS
   - URL final: agora termina em `/redefinir-senha/sucesso` em vez de cair direto no login
   - **Adaptar o script:** mudar assertion `final URL = /redefinir-senha` (que continua igual no callback) e adicionar nova assertion sobre destino pós-`updateUser` (que deve ser `/sucesso`, não mais `/login?password_changed=1`)
2. Validação humana final: idealizadora segue o fluxo completo em mobile e confirma:
   - Indicador de progresso aparece em todas as 4 telas
   - Indicador de força aparece e atualiza ao digitar
   - Tela de sucesso aparece antes de cair no login
   - AppShell autenticado pós-login tem coerência visual com tela auth

### AC11 — Branch + commit + push + PR + merge + Vercel READY + E2E real

1. Branch `feat/auth-v2-story-9` partindo de `main` atual (`f0c5985` ou mais recente)
2. Conventional commits estruturados
3. PR aberta com test plan completo
4. CI checks PASS (RSC audit + RLS suite + Vercel preview + auth-recovery-template-drift)
5. E2E real contra preview: 12/12 PASS
6. Smoke real da idealizadora em mobile com checklist atualizado
7. Após OK, merge squash em main; Vercel prod deploy READY
8. STATE.md sincronizado: header + §1 + §8 Histórico

## Tasks / Subtasks

### Setup
- [ ] Branch `feat/auth-v2-story-9` partindo de `main` (`f0c5985`)

### Componentes compartilhados (AC1 + AC2)
- [ ] `apps/web/src/components/auth/JourneyProgress.tsx`
- [ ] `apps/web/src/components/auth/PasswordStrengthMeter.tsx`

### Tela de sucesso (AC3 + AC4)
- [ ] `apps/web/src/app/(auth)/redefinir-senha/sucesso/page.tsx`
- [ ] Editar `actions.ts` se necessário (opcional — pode ficar no client)

### Cards modificados (AC5 + AC6 + AC7)
- [ ] Editar `RequestResetCard.tsx` (4 estados ganham JourneyProgress)
- [ ] Editar `NewPasswordCard.tsx` (JourneyProgress + PasswordStrengthMeter + redirect mudado)
- [ ] Editar `SignUpCard.tsx` (PasswordStrengthMeter)

### AppShell visual revamp (AC8)
- [ ] Editar `Sidebar.tsx` (bolha KEYRA topo)
- [ ] Editar `AppShell.tsx` (gradient header)
- [ ] Editar `UserMenu.tsx` (avatar primary + hover)
- [ ] Editar `OrgSwitcher.tsx` (active state primary)
- [ ] Verificar/editar `BottomNav.tsx` (active state primary + FAB shadow)

### Quality gates (AC9)
- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint --max-warnings 0` ✅
- [ ] `./scripts/check-rsc-boundaries.sh` PASS

### Validação E2E (AC10)
- [ ] Adaptar `scripts/e2e-auth-recovery-real.mjs` (URL final = /sucesso) — só etapa 4 do script
- [ ] Rodar contra preview Vercel — 12/12 PASS
- [ ] Atualizar checklist `docs/qa/checklists/auth-recovery-mobile-375.md` com novas etapas (indicador progresso, força, tela sucesso)

### Push & merge (AC11)
- [ ] Commit estruturado em commits separados (1 por frente)
- [ ] Push branch
- [ ] PR aberta com test plan
- [ ] CI checks PASS
- [ ] Smoke real da idealizadora em mobile (mandatory)
- [ ] Merge squash em main
- [ ] Vercel prod deploy READY
- [ ] E2E real pós-deploy contra usekeyra.com — 12/12 PASS
- [ ] STATE.md sync

## Dependencies

- **Internas:** `auth.5` ✅ Done (recovery funcional) · `auth.8` ✅ Done (BroadcastChannel — JourneyProgress completedElsewhere também aproveita) · `auth.4` ✅ Done (banner password_changed que continua funcional)
- **Externas:** nenhuma. Sem schema, sem envs novas, sem Mgmt API.

## Definition of Done

- [ ] Todos os 11 ACs atendidos
- [ ] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `./scripts/check-rsc-boundaries.sh` verdes
- [ ] E2E real contra preview Vercel: 12/12 PASS (anti-regressão recovery)
- [ ] PR mergeada em main; Vercel prod deploy READY
- [ ] E2E real contra prod usekeyra.com pós-deploy: 12/12 PASS
- [ ] **Smoke real da idealizadora em mobile 375px**: 4 telas da jornada com indicador visível, indicador de força responsivo, tela sucesso aparecendo, AppShell pós-login coerente
- [ ] STATE.md atualizado refletindo `auth.9` Done

## Dev Notes

### Por que combinar 3 frentes em 1 story

Inicialmente `auth.9` era apenas "visual revamp AppShell". Durante a fiscalização da `auth.5/8` (2026-05-06) identifiquei 2 melhorias UX adicionais — jornada afunilada e indicador de força. O usuário autorizou consolidar em uma única story porque:

1. As 3 frentes são polish de COERÊNCIA visual e UX
2. Compartilham os mesmos arquivos de touch (cards de auth, redirects)
3. Validação humana mobile é UMA única passada cobrindo tudo
4. PR única reduz overhead de CI/preview/smoke

Trade-off: story L (8 pts) em vez de M (5 pts). Aceito porque o ganho de coesão supera.

### Por que não adicionar JourneyProgress no cadastro

Cadastro tem jornada PRÓPRIA (signup atômico → onboarding nova-org → dashboard) que merece sua própria definição de "passos". Misturar com a jornada de recovery confundiria. Esta story foca recovery (auth.5+8) + cadastro recebe APENAS o PasswordStrengthMeter (que faz sentido isoladamente).

### Por que `/redefinir-senha/sucesso` não tem guard

A action `setNewPasswordAction` chama `signOut({scope:'global'})` ANTES de retornar `{success:true}`. Quando NewPasswordCard navega para `/sucesso`, a sessão já foi destruída — qualquer guard `getUser()` retornaria null e redirecionaria pra login, frustrando a tela de fechamento. Solução: tela é PÚBLICA, não tem dado sensível (só copy + CTA).

Risco: alguém pode acessar `/redefinir-senha/sucesso` direto sem ter feito reset. Resposta: sem problema — vê uma tela de "Senha alterada com sucesso, faça login" e clica no botão. Pior caso é uma confusão pequena, não vazamento de dado.

### Heurística de força de senha (sem zxcvbn)

`zxcvbn` é a referência (~400KB), mas é overhead pra MVP. Heurística simples cobre 80% do valor:

```
critérios = {
  ≥10 chars,
  tem minúscula,
  tem maiúscula,
  tem número,
}

score = critérios.filter(true).length

se senha.length ≥ 12 e score === 4: 'Forte'
se score === 4: 'Boa'
se score === 3: 'Boa'
se score === 2: 'Regular'
senão: 'Fraca'
```

Critérios alinhados com regra Supabase de prod (`auth.0`). Mensagens em pt-BR.

Pós-MVP, se telemetria mostrar que users criam senhas fracas mesmo com meter, considerar `zxcvbn-ts` (versão tree-shake, ~100KB).

### Cuidado com SignUpCard PasswordStrengthMeter

SignUpCard usa `react-hook-form` `useWatch` sutil — adicionar mais um watch pode causar re-renders desnecessários. Validar perf no preview (DevTools React Profiler — re-renders por keystroke devem ficar ≤ 3).

### Visual revamp AppShell — princípio "tom, não tema"

Não estou propondo trocar TUDO no AppShell pra cor primary. A coerência vem por sutilezas:
- Bolha "K" no Sidebar (assinatura visual)
- Gradient sutil no header (mesma textura da tela auth, intensidade reduzida)
- Hover/active states com primary/5 (em vez de muted neutro)
- Avatar do user com primary (item de identidade visual forte)

Isso preserva a "calmaria" do dashboard (números, KPIs, tabelas) sem competir com conteúdo, mas planta o KEYRA visualmente.

### Phase 3.5 gates

- **`@ux-design-expert` (Uma)** — story toca estética em escala. Gate mandatory antes do @qa.

### Phase 2.5 gates

| Gate | Aplica? | Como mitigar |
|------|---------|--------------|
| G1 — Princípios inegociáveis | Sim (copy nova) | Sem `.toFixed()`, sem `%`, sem gráfico |
| G2 — Tokens semânticos | Sim (cores) | Reusar tokens existentes (primary, emerald, amber, red) |
| G3 — Touch target 44×44 | Sim (CTA "Fazer login") | `min-h-[44px]` |
| G4 — Fonte única | Sim (PasswordStrengthMeter como fonte única) | Reuso em SignUpCard + NewPasswordCard sem código duplicado |
| G5 — RSC boundary audit | Sim (toca `(auth)/` e `layout/`) | `./scripts/check-rsc-boundaries.sh` PASS antes de Done |

### Plano de rollback

Se UX mudou pior que antes, revert do PR:
```bash
git revert -m 1 <SHA-DO-MERGE>
@devops *push hotfix/revert-auth-9 --to main
```

Sem rollback de schema (nenhum). Sem rollback de envs (nenhuma). Sem rollback de Mgmt API (nenhuma).

### Traceability

- ADR-022 (Auth UX V2) — `docs/architecture/ARCHITECTURE.md` §11.2
- EPIC — `docs/stories/EPIC-AUTH-V2.md` (Fase D — Polish)
- Origem da expansão — fiscalização 2026-05-06 (`docs/qa/auth-smokes.md`)

## QA Results

_(a preencher pelo @qa após implementação)_

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-06 | 1.0 | Story criada como Draft com escopo expandido (3 frentes: visual revamp AppShell + jornada afunilada + indicador força senha) — usuário autorizou consolidação durante a fiscalização do recovery. T-shirt L (8 pts). 11 ACs cobrindo componentes compartilhados (JourneyProgress + PasswordStrengthMeter), tela `/redefinir-senha/sucesso`, modificação dos 3 cards (Request, NewPassword, SignUp) + AppShell (Sidebar/Header/UserMenu/OrgSwitcher/BottomNav). E2E real obrigatório como anti-regressão da `auth.5`. | `@aiox-master` (Orion) atuando como `@sm` (River) |
