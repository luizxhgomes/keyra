# EPIC · BRAND-INTEGRATION

> **Status:** Active. Plano de infraestrutura para aplicar o brandbook KEYRA v1 a toda a aplicação (`apps/web`).
> **Origem:** decisão estratégica de 2026-05-07 do idealizador, após consolidação do brandbook em `docs/brand/03-identity/preview.html` e `PREVIEW-REFERENCE.md`.
> **Owner:** `@aiox-master` (Orion) coordena, `@dev` executa por story, `@qa` audita, `@devops` faz push.

---

## 1. Por que este Epic existe

A aplicação `apps/web` foi construída sob direção visual anterior (terracota `#C66A38` HSL + Inter solo + paleta sálvia `#457A50`). A direção visual atual, formalizada após 12 referências entregues pela idealizadora, é **Editorial Beauty Luxury** com:

- Paleta canônica: ivory/sand/mocha/bronze/cocoa + terracotta-600 `#B8612B` + gold `#B8923A` + champagne
- Tipografia dupla: **Fraunces** (editorial) + **Inter** (funcional)
- Conceito proprietário: **Cadeia Viva**
- Logo signature: KEYRA. com ponto dourado
- Motion system: 320ms ease-out-soft, 6 princípios inegociáveis
- Lei da Densidade Proporcional: zero órfãos em qualquer grid
- Voz em 4 estados: mentora, cúmplice, direta, editorial
- 4 templates Remotion canônicos para vídeo brand layer

**Sem este Epic, o produto e o brandbook falam línguas diferentes.** Com este Epic, a marca canta em uma única chave em todos os pontos de contato.

## 2. Escopo (mapa do que será migrado)

### 2.1. Fundação técnica
- `apps/web/src/app/layout.tsx` (next/font/google: Fraunces + Inter)
- `apps/web/src/app/globals.css` (CSS variables KEYRA + motion tokens + reduced-motion)
- `apps/web/tailwind.config.ts` (paleta canônica + transition durations + easings + warm shadows)

### 2.2. Componentes-base do produto
- `components/keyra/*` (KPICard, ComparativoTexto, AlertCard, StatusBadge, EmptyState, EmptyStateAction, ErrorMessage, Skeleton, LegalDocument)
- `components/ui/*` (shadcn estendido com tokens KEYRA: button, card, input, badge, alert-dialog, dropdown-menu, select, sheet, textarea, checkbox, label)
- `components/layout/*` (AppShell, Sidebar, BottomNav, Topbar)
- `components/auth/*` (formulários de login, cadastro, reset)

### 2.3. Rotas autenticadas (27 telas)
- `(app)/dashboard/*`
- `(app)/agenda/*`
- `(app)/comandas/*`
- `(app)/financeiro/*` (DRE, despesas, receitas, fluxo-caixa, custos-fixos, categorias, metas, transações, dre-por-servico, dre-por-profissional)
- `(app)/pacientes/*`
- `(app)/servicos/*`
- `(app)/estoque/*`
- `(app)/team/*`
- `(app)/configuracoes/*`
- `(app)/mais/*`
- `(app)/layout.tsx` (AppShell global)

### 2.4. Rotas auth (5 telas)
- `(auth)/login`
- `(auth)/cadastro`
- `(auth)/esqueci-senha`
- `(auth)/redefinir-senha` + sucesso
- `onboarding/nova-organizacao`

### 2.5. Rotas públicas (2 telas)
- `(public)/termos`
- `(public)/privacidade`

### 2.6. Email transacional
- `apps/web/src/emails/*`

### 2.7. Motion & vídeo
- `apps/web/src/lib/motion/*` (tokens em CSS + Framer Motion presets)
- `apps/web/remotion/*` (a criar — composições brand layer)

## 3. Anti-escopo (o que **não** entra neste Epic)

- ❌ Mudança de funcionalidade (apenas visual + voz)
- ❌ Refator de schema/RLS/migrations
- ❌ Novas features de produto
- ❌ Otimização de performance fora do escopo brand
- ❌ Logo SVG profissional (continua pendente; usa wordmark Fraunces como placeholder)
- ❌ Movement architecture (Fase 5 do brand squad, story dedicada futura)

## 4. Stories ordenadas (8 stories)

| # | Story | T-shirt | Owner | Bloqueia |
|---|---|---|---|---|
| **brand.1** | Foundation: tokens + fontes + globals.css + tailwind | M (~5pts) | @dev | brand.2-8 |
| **brand.2** | Components/keyra migrados (KPI, AlertCard, EmptyState, Skeleton, etc.) | L (~8pts) | @dev | brand.4, brand.5 |
| **brand.3** | Components/ui (shadcn) override com tokens KEYRA | M (~5pts) | @dev | brand.5 |
| **brand.4** | Voice migration: copy-guidelines aplicado em toasts/empty/erros/labels | M (~5pts) | @dev | brand.7 |
| **brand.5** | Motion system: View Transitions + Framer Motion presets + page-fade + kpi-reveal | L (~8pts) | @dev | brand.7 |
| **brand.6** | Auth flows + onboarding: novo visual brand layer | M (~5pts) | @dev | — |
| **brand.7** | Telas autenticadas (27 rotas) com migração visual completa | XL (~13pts) | @dev | — |
| **brand.8** | Setup Remotion + Brand Intro template | S (~3pts) | @dev | — |

**Total:** ~52 pontos · 8 stories · ~3 sprints típicas

### 4.1. Diagrama de dependências

```
brand.1 (foundation) ──┬── brand.2 (components keyra) ──┬── brand.5 (motion)
                       ├── brand.3 (components ui)      │
                       ├── brand.4 (voice)              │
                       ├── brand.6 (auth)               │
                       └── brand.8 (remotion)           │
                                                        │
                                          brand.7 (telas) ◄─── (precisa 2,3,4,5)
```

## 5. Definition of Done do Epic

- [ ] Todas as 8 stories Done com gates passando
- [ ] Smoke test ponta-a-ponta com idealizadora em mobile real (regra `docs/dev/rsc-boundary-rules.md`)
- [ ] CodeRabbit zero CRITICAL/HIGH em todas as stories
- [ ] RSC boundary audit passando (`./scripts/check-rsc-boundaries.sh`)
- [ ] Lighthouse mobile ≥85 (perf), ≥95 (a11y) em rotas-chave
- [ ] WCAG AA validado em todas as telas com texto/contraste
- [ ] `prefers-reduced-motion` respeitado em 100% das animações
- [ ] STATE.md atualizado a cada story Done
- [ ] PRs revisados e mergeados pelo @devops
- [ ] Memória `feedback_keyra_visual_direction.md` atualizada com status "implementado"

## 6. Specialist Gates obrigatórios

| Gate | Aplica em | Quem |
|---|---|---|
| **G2 Inventário de tokens** | Todas as stories | @dev (greps zerados no Change Log) |
| **G3 Touch targets 44×44 AA** | brand.2, brand.3, brand.7 | @dev |
| **G4 Fonte única real** | brand.1, brand.3 | @dev |
| **G5 RSC Boundary Audit** | brand.2, brand.3, brand.5, brand.7 | @dev |
| **Compliance gate** | brand.6 (auth toca CPF) | @compliance-br *lgpd-audit |
| **Growth gate** | nenhuma (não toca paywall) | — |
| **Financial gate** | nenhuma (não toca DRE/preço) | — |

## 7. Riscos e mitigações

| Risco | Severidade | Mitigação |
|---|---|---|
| Bug RSC similar à Sprint 5/6/7 | 🔴 Alta | Smoke real obrigatório a cada story; `check-rsc-boundaries.sh` em CI |
| Migração de cor quebra contraste WCAG | 🟡 Média | Tabela WCAG AA validada em `colors-manual.md §7` |
| Fraunces axes não suportados em browsers velhos | 🟡 Média | Fallback `Times New Roman, serif` + `next/font/google` faz subsetting |
| Componentes shadcn dependendo de tokens slate/zinc | 🟡 Média | Auditoria via grep + override via `cn()` ou variants |
| Sweep de tokens parcial deixa azul/cinza órfão | 🟡 Média | Greps zerados obrigatórios em cada story |
| Idealizadora rejeita virada visual em prod | 🔴 Alta | preview.html já validado; PR review com screenshots antes do merge |

## 8. Plano de execução

### Fase 0 — Preparação (concluída)
- ✅ `EPIC-BRAND-INTEGRATION.md` criado (este documento)
- ✅ Stories brand.1 e brand.2 atualizadas
- ✅ Stories brand.3 a brand.8 criadas

### Fase 1 — Foundation (brand.1)
- @dev implementa tokens + fontes
- Smoke local
- @qa gate
- @devops PR + merge

### Fase 2 — Componentes (brand.2 + brand.3 paralelos)
- Pode ser paralelizado (componentes/keyra é independente de components/ui)

### Fase 3 — Voice + Motion (brand.4 + brand.5 paralelos)
- Migração de copy + setup motion system

### Fase 4 — Auth (brand.6)
- Auth flows com novo visual

### Fase 5 — Telas (brand.7)
- Sweep das 27 rotas autenticadas
- Esta é a story XL: pode ser quebrada em sub-stories (brand.7.1 dashboard, 7.2 financeiro, 7.3 pacientes, etc.) durante draft

### Fase 6 — Remotion (brand.8)
- Setup Remotion + primeiro template em produção

## 9. Como executar

### Comando para iniciar
```
@aiox-master *plan create EPIC-BRAND-INTEGRATION
```

### Comando para iniciar primeira story
```
@po *validate-story-draft brand.1
@dev *develop-story brand.1
```

### Squad apropriado
Este Epic se beneficia do squad workflow `keyra-sdc-com-gate-financeiro` (mesmo sem ser financeiro, o template tem RSC audit + smoke real obrigatório).

```
@aiox-master *workflow keyra-sdc-com-gate-financeiro
```

## 10. Tracking & visibilidade

- Estado canônico do Epic: `docs/STATE.md` (atualizar a cada story Done)
- Implementação trackable: `docs/IMPLEMENTATION-MAP.md` (matriz feature × tela × tabela × ADR × story)
- Validação visual: comparar cada tela contra `docs/brand/03-identity/preview.html`

---

_Criado em 7 de maio de 2026 por Orion (aiox-master) após análise de 27 rotas autenticadas + 5 auth + 2 public + onboarding em apps/web. Source-of-truth visual: docs/brand/03-identity/preview.html. Mapa canônico: docs/brand/03-identity/PREVIEW-REFERENCE.md._
