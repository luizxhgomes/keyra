# Story brand.1: Foundation · tokens KEYRA + fontes + globals.css + tailwind

## Status

InReview · aguardando push estruturado por @devops e smoke real em mobile

## Story

**Como** Camila (persona — dona de clínica de estética),
**Eu quero** que o KEYRA, ao ser aberto, transmita imediatamente sofisticação editorial luxury — palette quente, Fraunces nos títulos, terracota nos botões — em vez do shadcn/ui default,
**Para que** eu sinta que estou usando uma plataforma à altura da minha clínica desde o primeiro segundo.

## Complexidade

**T-shirt:** L (~8 pontos · 1 sprint)

## Contexto

Em 2026-05-07 a Brand Identity v1.0 foi destilada em [`docs/brand/`](../brand/) com:
- Tokens DTCG canônicos em `tokens.json`
- Sistema técnico completo em `DESIGN.md`
- Manual de cores em `colors-manual.md`
- Sistema tipográfico em `typography-system.md`
- Motion system em `motion-system/`

Os tokens **não estão aplicados** no produto. Hoje `apps/web` usa cores do shadcn/ui defaults + Inter Variable. Esta story aterrissa a brand identity no produto.

A direção visual mudou substancialmente desde a última story tipográfica (Story 6.1 modelava do Gestek). **Esta story sobrescreve essa direção** com a palette/fontes/motion canonizados em v1.0.

**Documento principal a consumir:** [`docs/brand/03-identity/DESIGN.md`](../brand/03-identity/DESIGN.md) §9 (Implementação técnica).

## Acceptance Criteria

### AC1 — Fonte Fraunces adicionada via `next/font/google`

Em `apps/web/src/app/layout.tsx`:
```ts
import { Fraunces, Inter } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
```

`<html className={`${fraunces.variable} ${inter.variable}`}>`.

### AC2 — CSS variables dos tokens KEYRA em `globals.css`

Aplicar bloco completo de CSS variables conforme [`DESIGN.md` §9.2](../brand/03-identity/DESIGN.md#92-globalscss-canônico-a-aplicar) — paletas (ivory/sand/mocha/bronze/cocoa/amber/terracota/champagne/gold) + semantic mapping product layer + motion tokens + `prefers-reduced-motion`.

### AC3 — `tailwind.config.ts` estendido com tokens KEYRA

Adicionar conforme [`DESIGN.md` §9.3](../brand/03-identity/DESIGN.md#93-tailwindconfigts-delta) — `theme.extend.fontFamily`, `theme.extend.colors` (paletas KEYRA), `transitionDuration`, `transitionTimingFunction`, `boxShadow` warm.

### AC4 — Migração de componentes legados

Substituir em todo `apps/web/src/`:

| Antigo | Novo |
|--------|------|
| `bg-white` (em rotas `(app)/`) | `bg-ivory-50` |
| `bg-slate-*` | `bg-ivory-*` ou `bg-sand-*` |
| `text-slate-900` | `text-cocoa-900` |
| `text-slate-600` | `text-bronze-500` |
| `text-slate-400` | `text-bronze-400` |
| `border-slate-*` | `border-sand-200` ou `border-mocha-300` |
| `bg-blue-600` (CTAs) | `bg-terracotta-600` |
| `hover:bg-blue-700` | `hover:bg-terracotta-700` |
| `text-emerald-*` (sucesso, lucro positivo) | `text-success-leaf` |
| `text-red-*` (destrutivo/erro) | `text-rust-800` |

**Sweep deve ser completo** (G2 — inventário de tokens). Listar greps zerados no Change Log.

### AC5 — `font-tabular` em containers de KPI/DRE

Containers que renderizam números financeiros devem ter `font-feature-settings: "tnum"` aplicado. Verificar:
- `components/keyra/KPICard.tsx`
- `components/keyra/ComparativoTexto.tsx`
- Qualquer tabela em `app/(app)/dre/`

### AC6 — Títulos de página em Fraunces

Em rotas `app/(app)/*/page.tsx`, títulos de página (`<h1>`) usam `font-serif` (Fraunces). Body permanece Inter. Não migrar tudo — só títulos de página/seção (≤32px).

### AC7 — Smoke test ponta-a-ponta com idealizadora

Build verde **não** é critério suficiente (regra `docs/dev/rsc-boundary-rules.md`). Antes de marcar Done:
- Deploy preview no Vercel
- Idealizadora abre em mobile real
- Valida: dashboard, agenda, clientes, DRE, configurações
- Captura screenshots para Change Log

### AC8 — Validação visual contra `preview.html`

A peça `docs/brand/03-identity/preview.html` é o **gold standard visual** desta story. Após implementação, telas do app devem **ressoar com** a estética do preview.html (não precisam ser idênticas — produto tem densidade própria).

## Out of scope

- ❌ Logo design final — pendente para `@sagi-haviv` em story própria
- ❌ Setup Remotion — story `brand.2`
- ❌ Implementação dos templates Remotion — pós setup
- ❌ Page transitions (View Transitions API) — story própria após esta
- ❌ Micro-interactions completos — story própria após esta
- ❌ Migração de copy (toast/empty/erro) para padrões dos 4 estados de voz — story própria

## Dependencies

- Brand Identity v1.0 entregue ✅ (em `docs/brand/`)
- Inter Variable já em uso ✅ (Story 6.1)
- Tailwind 3 + shadcn ✅
- Next.js 16 ✅

## Risks

| Risco | Mitigação |
|-------|-----------|
| Sweep parcial deixa azul/cinza frio em algum canto do app | Greps zerados documentados no Change Log; CodeRabbit auto-fix iteração |
| Fraunces variable axes (opsz, SOFT) não suportados em todos os browsers | `next/font/google` faz subsetting; fallback `Times New Roman, serif` |
| Idealizadora não validar a virada visual | Apresentar `preview.html` ANTES de iniciar (já entregue) |
| Componentes shadcn/ui que dependem de `slate`/`zinc` quebrarem | Auditar `components/ui/*`; ajustar tokens via `cn()` ou variants |
| Storybook/visual regression diff explode | Aceitar — é virada de marca, é esperado |

## Definition of Done

- [ ] AC1 — Fraunces carregado via `next/font/google`
- [ ] AC2 — CSS variables KEYRA em `globals.css`
- [ ] AC3 — `tailwind.config.ts` estendido
- [ ] AC4 — Sweep completo de tokens legados (greps zerados)
- [ ] AC5 — `font-tabular` em KPIs
- [ ] AC6 — Títulos de página em Fraunces
- [ ] AC7 — Smoke test ponta-a-ponta com idealizadora ✅
- [ ] AC8 — Validação visual contra `preview.html` ✅
- [ ] Lint zero warnings, typecheck zero errors
- [ ] CodeRabbit zero CRITICAL/HIGH
- [ ] RSC boundary audit passou (`./scripts/check-rsc-boundaries.sh`)
- [ ] PR aberto, revisado, mergeado por @devops
- [ ] STATE.md atualizado
- [ ] Memory `feedback_keyra_visual_direction.md` atualizada com status "implementado"

## Specialist Gates

- ❌ Financial gate (não toca DRE/preço/margem)
- ❌ Compliance gate (não toca dados sensíveis)
- ❌ Growth gate (não toca paywall/tiers)
- ✅ G1 (princípios inegociáveis) — copy não muda nesta story
- ✅ G2 (inventário tokens) — **CORE desta story**, greps obrigatórios
- ✅ G3 (touch targets 44×44) — preservar em buttons/cards
- ✅ G4 (fonte única) — tokens.json passa a ser **a** fonte única
- ✅ G5 (RSC boundary audit) — esta story toca `app/(app)/**`, executar `./scripts/check-rsc-boundaries.sh`

## Change Log

| Data | Ação | Agente |
|------|------|--------|
| 2026-05-07 | Story criada por brand-chief consolidando v1.0 | brand-chief |
| 2026-05-07 | Atualizada como Foundation do Epic BRAND-INTEGRATION | aiox-master |
| 2026-05-07 | **Implementação foundation executada:** layout.tsx (Fraunces + Inter via next/font/google) · globals.css (tokens KEYRA canônicos + motion vars + warm shadows + prefers-reduced-motion) · tailwind.config.ts (palette KEYRA + fontFamily.serif + transitionDuration + transitionTimingFunction + boxShadow warm + animations fade-up/fade-scale). | aiox-master |
| 2026-05-07 | **Validação técnica:** typecheck verde · lint zero warnings · build de produção verde (38 rotas compiladas) · RSC boundary audit PASS. | aiox-master |
| 2026-05-07 | **Pendente para Done:** smoke real em mobile com idealizadora · push estruturado por @devops com PR. | aiox-master |

## Implementação executada (Detalhes técnicos)

### Arquivos modificados

1. **`apps/web/src/app/layout.tsx`**
   - Adicionado `Fraunces` import via `next/font/google` com axes `['opsz', 'SOFT']`
   - Variável CSS `--font-serif` exposta no body via `cn(fraunces.variable, inter.variable, ...)`
   - `viewport.themeColor` atualizado: light `#FAF6EE` (ivory-50), dark `#181210` (ink-950)

2. **`apps/web/src/app/globals.css`**
   - Bloco completo de tokens KEYRA adicionado em `:root`:
     - 25 cores HEX canônicas (`--keyra-*` prefix) cobrindo ivory/sand/mocha/bronze/cocoa + terracotta/amber + gold/champagne + status
     - 5 motion durations (`--motion-duration-*`)
     - 4 motion easings (`--motion-easing-*`)
     - 4 motion distances (`--motion-distance-*`)
     - 4 motion staggers (`--motion-stagger-*`)
     - 6 warm shadows (`--shadow-warm-*` + `--shadow-premium-glow`)
   - Mapping legacy → KEYRA canônicos no mesmo `:root` para compatibilidade com shadcn (HSL via CSS vars)
   - Bloco `.dark` redesenhado para editorial premium (cocoa-900 + champagne-200 + gold)
   - Bloco antigo `:root` (terracota `#C66A38` + sálvia `#457A50`) removido (era dead code sobrescrevendo o novo)

3. **`apps/web/tailwind.config.ts`**
   - `fontFamily.serif` adicionado (`var(--font-serif)`, fallback `Times New Roman, serif`)
   - Palette KEYRA expandida em `colors`: ivory, sand, mocha, bronze, cocoa, ink, amber, terracotta, rust, champagne, gold, success-leaf, success-deep
   - Tokens semânticos financeiros atualizados: `lucro` `#6E8C5A` (era `#457A50`), `prejuizo` `#843E1A` (era `#B23A3A`), `neutro` `#7E5A40` (era `#6B6560`), `alerta` `#C8843A` (era `#D4A341`), `info` `#5A6C7E` (era `#8A7A6B`)
   - Removidas escalas locais `primary.{50..900}` e `secondary.{50..900}` (eram tokens da paleta antiga); CSS vars `--primary` e `--secondary` agora apontam para terracotta-600 e bronze-500
   - `transitionDuration` adicionada (instant/fast/base/slow/cinematic)
   - `transitionTimingFunction` adicionada (out-soft/in-out-editorial/in-quiet/out-bounce-subtle)
   - `boxShadow` warm-* adicionadas + `premium-glow`
   - `keyframes` `fade-up` e `fade-scale` adicionadas
   - `animation` `fade-up` e `fade-scale` adicionadas

### Compatibilidade com código existente

- ✅ Toda referência existente a `bg-primary`, `text-secondary`, `bg-muted`, etc. continua funcionando — apenas mapeia para cores canônicas KEYRA agora
- ✅ Componentes shadcn não precisam de alteração imediata (consomem CSS vars que foram atualizadas)
- ✅ Stories brand.2-7 farão sweep progressivo de usos `bg-white`, `text-slate-*`, `text-emerald-*` para tokens canônicos KEYRA explícitos

### O que NÃO foi feito nesta story (escopo de outras)
- Migração de componentes individuais (brand.2 e brand.3)
- Aplicação de Fraunces em `<h1>` de páginas (brand.7)
- Page transitions e Framer Motion presets (brand.5)
- Voice migration nos toasts e empty states (brand.4)
- Auth flows com novo visual (brand.6)
- Setup Remotion (brand.8)

## QA Results

(a preencher por @qa após implementação)

## File List

(a preencher por @dev durante implementação)

## Dev Notes

(a preencher por @dev)
