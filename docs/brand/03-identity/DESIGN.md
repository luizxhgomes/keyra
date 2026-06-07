---
name: KEYRA
version: 1.0.0
lastUpdated: 2026-05-07
owner: brand-chief (orchestrating @michael-johnson)
culturalDirection: Editorial Beauty Luxury
status: source-of-truth
---

# DESIGN.md — Sistema Técnico Unificado KEYRA

> Documento técnico canônico do design system. Para cada tópico, este arquivo é o **mapa**; a documentação humana profunda vive nos arquivos especializados.

---

## 0. Mapa de documentos

### Referência viva (consultar primeiro)
| O quê | Onde |
|-------|------|
| **Brandbook executável** | [`preview.html`](preview.html) (abrir no browser) |
| **Documento canônico de referência ao preview** | [`PREVIEW-REFERENCE.md`](PREVIEW-REFERENCE.md) |

### Documentação técnica
| O quê | Onde |
|-------|------|
| **Source of truth técnica** | [`tokens.json`](tokens.json) (DTCG format) |
| **Manual de cores e paletas** | [`colors-manual.md`](colors-manual.md) |
| **Sistema tipográfico** | [`typography-system.md`](typography-system.md) |
| **Voz e tom** | [`voice-tone.md`](voice-tone.md) |
| **Motion system** | [`motion-system/`](motion-system/) (6 docs + templates Remotion) |
| **Logo** | [`logo/README.md`](logo/README.md) (brief para refinamento) |
| **Brand book consolidado** | [`BRANDBOOK.md`](BRANDBOOK.md) |
| **Direção cultural destilada** | [`../references/inspirations/02-cultural-direction/editorial-beauty-luxury.md`](../references/inspirations/02-cultural-direction/editorial-beauty-luxury.md) |

---

## 1. Fundação

### 1.1. Categoria visual
Editorial Beauty Luxury / Quiet Luxury. **Detalhes em** [`02-cultural-direction/editorial-beauty-luxury.md`](../references/inspirations/02-cultural-direction/editorial-beauty-luxury.md).

### 1.2. As duas camadas

| Camada | Audiência | Densidade visual | Onde |
|--------|-----------|------------------|------|
| **Brand layer** | Mercado, leads, mídia | Editorial, expressiva, dramática | Brandbook, sales page, posts, propostas, eventos, marketing |
| **Product layer** | Camila (usuária) | Funcional, contida, densa | App KEYRA (`apps/web`), emails transacionais, suporte |

Ambas usam **a mesma paleta + as mesmas fontes**. A diferença é **dose**.

### 1.3. Princípios não-negociáveis

1. **Calor sempre, frio nunca** — pretos cocoa, brancos creme, cinzas mocha
2. **Ouro precioso** — máximo 1 elemento gold por tela/peça
3. **Tipografia é a estrela** em brand; **número é a estrela** em product
4. **Drama sob demanda** — 90% silencioso, 10% dramático e ganho
5. **Calmaria, sem jerk** — motion default 320ms ease-out-soft
6. **Zero parallax, zero scroll-jacking** — KEYRA é software, não portfolio

---

## 2. Cores (resumo executivo)

Detalhes completos em [`colors-manual.md`](colors-manual.md). Tokens em [`tokens.json`](tokens.json).

### Paletas principais

| Família | Função | Tokens canônicos |
|---------|--------|-------------------|
| **Ivory & Sand** | Backgrounds, surfaces, divisores | `ivory-50` `#FAF6EE`, `ivory-100` `#F4EDE2`, `sand-200` `#EAE0CF`, `mocha-300` `#C8B49A` |
| **Bronze & Cocoa** | Texto, foreground, fundo brand premium | `bronze-400` `#946640`, `bronze-500` `#7E5A40`, `cocoa-700` `#5A3E26`, `cocoa-800` `#3F2A1B`, `cocoa-900` `#2B1810`, `ink-950` `#181210` |
| **Terracota & Âmbar** | Acentos, CTAs, calor expressivo | `amber-400` `#D89A4D`, `amber-500` `#C8843A`, `terracotta-600` `#B8612B`, `terracotta-700` `#A05525`, `rust-800` `#843E1A` |
| **Gold & Champagne** | Acento precioso (raro) | `champagne-200` `#F0D8A8`, `gold-400` `#D4A752`, `gold-500` `#B8923A`, `gold-600` `#9A7A2C` |
| **Suporte (status, raro)** | Sucesso, warning, erro, info | `success-leaf` `#6E8C5A`, `amber-500` (warning), `rust-800` (destructive), `info-default` `#5A6C7E` |

### Mapeamento semântico — Product layer

```
--background:           ivory-50
--surface:              white ou ivory-100
--foreground:           cocoa-900
--foreground-secondary: bronze-500
--foreground-muted:     bronze-400
--border-subtle:        sand-200
--border-default:       mocha-300
--cta-primary:          terracotta-600
--cta-primary-hover:    terracotta-700
--success:              success-leaf
--warning:              amber-500
--destructive:          rust-800
--premium-accent:       gold-500  (uso raro, ≤1 por tela)
```

### Combinações canônicas
Ver [`colors-manual.md` §5](colors-manual.md#5-combinações-aprovadas) — 5 combinações aprovadas (A: editorial light, B: editorial dark premium, C: calor saturado, D: produto UI light, E: mocha quiet).

### Acessibilidade
Todas as combinações product layer passam **WCAG AA** (≥4.5 texto normal). Tabela completa em [`colors-manual.md` §7](colors-manual.md#7-acessibilidade--contraste-wcag).

---

## 3. Tipografia (resumo executivo)

Detalhes completos em [`typography-system.md`](typography-system.md).

### Famílias

| Família | Fonte | Licença | Uso |
|---------|-------|---------|-----|
| **Serif editorial** | **Fraunces** | OFL (Google Fonts) | Display, hero, headlines, títulos de página |
| **Sans funcional** | **Inter** | OFL (Google Fonts) | Body, UI, KPIs (com `tnum`), labels |
| **Mono** | system `ui-monospace` | system | Detalhe técnico, ID, hash |

### Pesos canônicos

- **Fraunces:** 200 (display thin), 300 (light), 500 (medium), 600 (semibold), 700 (bold) + itálico em 200 e 600
- **Inter:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Escala — Brand layer

| Token | Tamanho | Família | Peso |
|-------|--------|---------|------|
| `brand-hero` | clamp(64,10vw,144) | Fraunces | 200 (italic em destaque) |
| `brand-display-1` | clamp(48,6vw,96) | Fraunces | 300/600 |
| `brand-display-2` | clamp(36,4.5vw,64) | Fraunces | 500 |
| `brand-headline` | 32 | Fraunces | 600 |
| `brand-subhead` | 24 | Fraunces | 400/italic |
| `brand-body` | 17 | Inter | 400 |

### Escala — Product layer

| Token | Tamanho | Família | Peso |
|-------|--------|---------|------|
| `ui-page-title` | 32 | Fraunces | 500 |
| `ui-section-title` | 24 | Fraunces | 500 |
| `ui-card-title` | 18 | Inter | 600 |
| `ui-kpi-value` | clamp(40,5vw,64) | Inter | 700 + tnum |
| `ui-kpi-label` | 13 | Inter | 500 + uppercase + tracking 0.04em |
| `ui-body` | 15 | Inter | 400 |
| `ui-label` | 14 | Inter | 500 |
| `ui-caption` | 13 | Inter | 400 |

### Princípios
- **Mistura como personagem:** brand 70% serif + 30% sans; product 15% serif + 85% sans
- **Weights extremos:** 200 com 600/700 na mesma frase (drama editorial)
- **Itálico como sussurro:** *sua* clínica, *este* mês — destaque humano
- **`tnum` obrigatório** em qualquer coluna de número financeiro

---

## 4. Spacing (Roomy)

Herdado de [`docs/ux/spacing-tokens.md`](../../ux/spacing-tokens.md). Base 4px:

| Token | Valor |
|-------|-------|
| 0 | 0 |
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 5 | 20px |
| 6 | 24px |
| 8 | 32px |
| 10 | 40px |
| 12 | 48px |
| 16 | 64px |
| 20 | 80px |
| 24 | 96px |
| 32 | 128px |

Densidade `roomy` é princípio inegociável — vide [docs/ux/spacing-tokens.md](../../ux/spacing-tokens.md).

---

## 5. Border radius

Editorial sutil. Não pode ser muito redondo (perde gravitas).

| Token | Valor | Uso |
|-------|-------|-----|
| `none` | 0 | Tipografia precisa, blocos editoriais |
| `xs` | 2px | Inputs sub |
| `sm` | 4px | Inputs, buttons pequenos |
| `md` | 8px | Cards, buttons, inputs |
| `lg` | 12px | Cards grandes, modais |
| `xl` | 16px | Hero containers |
| `full` | 9999px | Pills, avatars |

---

## 6. Shadows (Warm)

Sombras baseadas em **cocoa** (`rgba(43, 24, 16, …)`), não slate.

| Token | Valor |
|-------|-------|
| `xs` | 0 1px 2px rgba(43,24,16,0.04) |
| `sm` | 0 2px 4px rgba(43,24,16,0.06) |
| `md` | 0 4px 8px rgba(43,24,16,0.08) |
| `lg` | 0 8px 16px rgba(43,24,16,0.12) |
| `xl` | 0 16px 32px rgba(43,24,16,0.16) |
| `premium-glow` | 0 0 24px rgba(184,146,58,0.18) — **uso raro** |

---

## 7. Motion

Detalhes em [`motion-system/`](motion-system/) (6 docs + templates Remotion).

### Tokens essenciais

```
duration:  instant 100 / fast 200 / base 320 / slow 480 / cinematic 720 (ms)
easing:    out-soft (default), in-out-editorial, in-quiet, out-bounce-subtle (raro)
distance:  whisper 4 / small 8 / medium 16 / large 32 (px)
stagger:   tight 40 / small 80 / medium 120 / large 160 (ms)
scale:     quiet 0.98 / default 0.96 / pronounced 0.92
```

### Padrões nomeados (vocabulary)
`fade-up` (default), `fade-scale`, `fade-quiet`, `dismiss-quiet`, `kpi-reveal` (KPI narrativo), `hover-card`, `hover-cta`, `focus-input`, `press-feedback`, `page-fade`, `page-slide-sub`, `route-instant`, `gold-shimmer` (raro), `success-celebration` (≤2x/sessão).

### Templates Remotion
4 templates canônicos para vídeo brand layer:
- [`post-instagram-template.md`](motion-system/remotion-templates/post-instagram-template.md) (1080×1350)
- [`kpi-reveal-template.md`](motion-system/remotion-templates/kpi-reveal-template.md) (1080×1920)
- [`audiogram-template.md`](motion-system/remotion-templates/audiogram-template.md) (depoimento)
- [`brand-intro-template.md`](motion-system/remotion-templates/brand-intro-template.md) (logo reveal)

Conexão com skill `remotion-animator` — ver [`motion-system/README.md`](motion-system/README.md).

---

## 8. Componentes (Product layer)

Componentes do produto vivem em `apps/web/src/components/`:
- `components/ui/` — shadcn/ui base estendido com tokens KEYRA
- `components/keyra/` — primitivos do produto (`KPICard`, `ComparativoTexto`, `AlertCard`, `StatusBadge`, `EmptyState`, `ErrorMessage`)

### Migração (a executar)

| Tarefa | Resp. |
|--------|-------|
| Adicionar Fraunces via `next/font/google` em `app/layout.tsx` | Story `@dev` |
| Estender `tailwind.config.ts` com tokens KEYRA (importar de `tokens.json`) | Story `@dev` |
| Substituir `bg-white` → `bg-ivory-50` em rotas `(app)` | Story `@dev` |
| Substituir `text-slate-*` → `text-bronze-*`/`text-cocoa-*` | Story `@dev` |
| Substituir `bg-blue-*` (CTAs) → `bg-terracotta-600` | Story `@dev` |
| Aplicar `font-tabular` nos containers de KPI/DRE | Story `@dev` |
| Implementar motion tokens em CSS variables (globals.css) | Story `@dev` |
| Implementar page transitions (View Transitions API) | Story `@dev` |
| Aplicar micro-interactions nos componentes chave | Story `@dev` |

Stories devem ser criadas por `@sm` consumindo este DESIGN.md como input.

---

## 9. Implementação técnica

### 9.1. Estrutura `apps/web/src/`

```
app/
├── layout.tsx               ← Importa Fraunces + Inter via next/font/google
└── globals.css              ← CSS variables dos tokens KEYRA
lib/
├── brand-tokens.ts          ← (a criar) Generated TS de tokens.json
└── ...
components/
├── ui/                      ← shadcn estendido
├── keyra/                   ← primitivos (KPICard, etc.)
└── motion/                  ← (a criar) wrapper Framer Motion + presets dos tokens
remotion/                    ← (a criar) Compositions Remotion
├── Root.tsx
├── compositions/
│   ├── PostInstagram.tsx
│   ├── KPIReveal.tsx
│   ├── Audiogram.tsx
│   └── BrandIntro.tsx
└── (assets via public/brand-assets/)
```

### 9.2. globals.css canônico (a aplicar)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* === Color tokens === */
  --color-ivory-50: #FAF6EE;
  --color-ivory-100: #F4EDE2;
  --color-sand-200: #EAE0CF;
  --color-mocha-300: #C8B49A;
  --color-bronze-400: #946640;
  --color-bronze-500: #7E5A40;
  --color-cocoa-700: #5A3E26;
  --color-cocoa-800: #3F2A1B;
  --color-cocoa-900: #2B1810;
  --color-ink-950: #181210;
  --color-amber-400: #D89A4D;
  --color-amber-500: #C8843A;
  --color-terracotta-600: #B8612B;
  --color-terracotta-700: #A05525;
  --color-rust-800: #843E1A;
  --color-champagne-200: #F0D8A8;
  --color-gold-500: #B8923A;
  --color-success-leaf: #6E8C5A;

  /* === Semantic — Product === */
  --background: var(--color-ivory-50);
  --surface: #FFFFFF;
  --foreground: var(--color-cocoa-900);
  --foreground-secondary: var(--color-bronze-500);
  --foreground-muted: var(--color-bronze-400);
  --border-subtle: var(--color-sand-200);
  --border-default: var(--color-mocha-300);
  --cta-primary: var(--color-terracotta-600);
  --cta-primary-hover: var(--color-terracotta-700);
  --cta-primary-foreground: var(--color-ivory-50);
  --success: var(--color-success-leaf);
  --warning: var(--color-amber-500);
  --destructive: var(--color-rust-800);
  --premium-accent: var(--color-gold-500);

  /* === Motion === */
  --motion-duration-instant: 100ms;
  --motion-duration-fast: 200ms;
  --motion-duration-base: 320ms;
  --motion-duration-slow: 480ms;
  --motion-duration-cinematic: 720ms;
  --motion-easing-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-easing-in-out-editorial: cubic-bezier(0.65, 0, 0.35, 1);
  --motion-easing-in-quiet: cubic-bezier(0.7, 0, 0.84, 0);
  --motion-distance-whisper: 4px;
  --motion-distance-small: 8px;
  --motion-distance-medium: 16px;
  --motion-distance-large: 32px;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-instant: 0ms;
    --motion-duration-fast: 0ms;
    --motion-duration-base: 0ms;
    --motion-duration-slow: 0ms;
    --motion-duration-cinematic: 0ms;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-inter), -apple-system, sans-serif;
  font-feature-settings: "tnum";
}

h1, h2, .font-editorial {
  font-family: var(--font-fraunces), serif;
  font-feature-settings: "ss01", "liga";
}
```

### 9.3. tailwind.config.ts (delta)

```ts
export default {
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-fraunces)", "Times New Roman", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ivory: { 50: "#FAF6EE", 100: "#F4EDE2" },
        sand: { 200: "#EAE0CF" },
        mocha: { 300: "#C8B49A" },
        bronze: { 400: "#946640", 500: "#7E5A40" },
        cocoa: { 700: "#5A3E26", 800: "#3F2A1B", 900: "#2B1810" },
        ink: { 950: "#181210" },
        amber: { 400: "#D89A4D", 500: "#C8843A" },
        terracotta: { 600: "#B8612B", 700: "#A05525" },
        rust: { 800: "#843E1A" },
        champagne: { 200: "#F0D8A8" },
        gold: { 400: "#D4A752", 500: "#B8923A", 600: "#9A7A2C" },
        "success-leaf": "#6E8C5A",
      },
      transitionDuration: {
        instant: "100ms", fast: "200ms", base: "320ms", slow: "480ms", cinematic: "720ms",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-editorial": "cubic-bezier(0.65, 0, 0.35, 1)",
        "in-quiet": "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(43, 24, 16, 0.04)",
        sm: "0 2px 4px 0 rgba(43, 24, 16, 0.06)",
        md: "0 4px 8px 0 rgba(43, 24, 16, 0.08)",
        lg: "0 8px 16px 0 rgba(43, 24, 16, 0.12)",
        xl: "0 16px 32px 0 rgba(43, 24, 16, 0.16)",
        "premium-glow": "0 0 24px 0 rgba(184, 146, 58, 0.18)",
      },
    },
  },
};
```

---

## 9.bis Lei da Densidade Proporcional (REGRA INEGOCIÁVEL)

> **Estabelecida em:** 7 de maio de 2026 · após auditoria de grids do brandbook.
> **Status:** non-negotiable. Toda produção futura (logo grid, post grid, anti-padrão grid, qualquer grid de cards) consulta esta lei **antes** de definir colunas.

### Princípio macro

**Nenhum grid pode terminar com órfãos visíveis na última linha.** A última linha sempre preenche a largura total, ou os elementos órfãos são centralizados/expandidos para ocupar 100% do canvas. Respiros de espaço vazio à direita ou abaixo são **proibidos** em design system premium, pois transmitem desorganização e quebram a hierarquia visual.

### Tabela canônica · cols ideais por número de itens em desktop (≥1024px)

| Itens no grid | Colunas ideais | Layout final | Anti-padrão (proibido) |
|---|---|---|---|
| 2 | 2 | 2×1 cheia | 1+1 empilhado em desktop |
| 3 | 3 | 3×1 cheia | 2+1 com órfão |
| 4 | 2 ou 4 | 2×2 ou 4×1 cheia | 3+1 com órfão |
| 5 | 6 com spans | 3 itens span-2 + 2 itens centralizados (col 2-5) | 4+1 com órfão único |
| 6 | 3 ou 2 | 3×2 ou 2×3 cheias | 4+2 com órfãos à direita |
| 7 | 4+3 com spans | 4×1 + 3 itens centralizados linha 2 | 4+3 com vazio |
| 8 | 4 | 4×2 cheias | 3+3+2 com órfãos |
| 9 | 3 | 3×3 cheias | 4+4+1 órfão |
| 10 | 5 ou 2 | 5×2 ou 2×5 | 4+4+2 com órfãos |
| 11 | spans | 4+4+3 centralizados | 4+4+3 sem centralizar |
| 12 | 4, 3 ou 6 | 4×3, 3×4 ou 6×2 cheias | qualquer com vazio |

### Tabela canônica · cols por breakpoint

| Itens | Desktop (≥1024) | Tablet (768-1024) | Mobile (640-768) | Small (<640) |
|---|---|---|---|---|
| 2 | 2 | 2 | 2 ou 1 | 1 |
| 3 | 3 | 3 ou 2 (com 3º full) | 1 | 1 |
| 4 | 2×2 | 2×2 | 1 | 1 |
| 5 | 3+2 centralizado | 2×2 + 5º full | 1 | 1 |
| 6 | 3×2 | 2×3 | 2×3 | 1 |
| 9 | 3×3 | 3×3 | 1 ou 2 (último full) | 1 |
| 12 | 4×3 ou 3×4 | 2×6 ou 3×4 | 2×6 | 1 |

### Anti-órfão automático (CSS template padrão)

Para grids dinâmicos onde o número de itens pode crescer, **sempre** incluir as regras anti-órfão:

```css
/* Padrão de 3 colunas com anti-órfão automático */
.qualquer-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:24px;
}
/* Se o último item ficar sozinho na linha, ocupa width total */
.qualquer-grid > *:nth-last-child(1):nth-child(3n+1){grid-column:1 / -1}
/* Se sobrarem 2 órfãos, primeiro ocupa 2 cols + segundo continua normal */
.qualquer-grid > *:nth-last-child(2):nth-child(3n+1){grid-column:span 2}
```

Para grids de 2 e 4 colunas, lógica equivalente com `nth-child(2n+1)` e `nth-child(4n+1)`.

### Padding e gap proporcionais (ajustáveis por breakpoint)

| Breakpoint | Section padding | Shell padding | Grid gap (cards grandes) | Grid gap (cards densos) |
|---|---|---|---|---|
| ≥1280px | 96px / 32px | 32px | 24px | 16px |
| 1024-1280 | 80px / 24px | 24px | 24px | 16px |
| 768-1024 | 80px / 24px | 24px | 20px | 16px |
| 640-768 | 64px / 20px | 20px | 16px | 12px |
| <640 | 64px / 16px | 16px | 12px | 8px |

**Regra de bolso:** o gap encolhe com o viewport, mas o aspect-ratio dos cards permanece. Padding interno do card também encolhe proporcionalmente (multiplicador 0.7×).

### Container queries obrigatórios em cards com texto/número

Sempre que um card contém tipografia que precisa caber sem overflow (KPI, headline gigante, logo letterspacing), **container queries** são mandatórias:

```css
.card{
  container-type:inline-size;
  overflow:hidden;
}
.card-content{
  font-size:clamp(MIN, Ncqi, MAX);
}
```

Onde `Ncqi` é a porcentagem da largura interna do card. Cálculo: `cqi = font_target_px / card_width_px × 100`.

### Checklist anti-órfão (rodar antes de aprovar qualquer grid novo)

- [ ] Calculei quantos itens o grid terá em produção?
- [ ] Consultei a tabela canônica para definir colunas ideais?
- [ ] A última linha do grid em desktop preenche a largura total?
- [ ] Em tablet (≤1024px), a contagem de colunas mantém zero órfãos?
- [ ] Em mobile (≤768px), a contagem foi recalculada?
- [ ] Apliquei regras CSS anti-órfão automático para o caso de itens crescerem?
- [ ] Cards com texto/número usam container queries (`cqi`)?
- [ ] Padding e gap escalam proporcionalmente por breakpoint?

**Se alguma resposta for NÃO, o grid não é aprovado para produção.**

### Por que essa lei existe

Origem documentada: 7 de maio de 2026, após auditoria do brandbook revelar grid de 6 logos em 4 colunas (4+2 órfãos). O retrabalho consumiu tempo de design e quebrou a percepção premium em três sessões consecutivas. Esta lei elimina retrabalho ao tornar a densidade proporcional não opcional.

---

## 9.ter Lei da Quebra por Sentença + Centralização (REGRA INEGOCIÁVEL)

> **Estabelecida em 7 de junho de 2026.** Enunciado de marca na regra-mãe [`.claude/rules/design-system.md` princípio 6](../../../.claude/rules/design-system.md); racional editorial em [`typography-system.md §3.7`](typography-system.md).

### Princípio macro

Headline não quebra por palavra — quebra por **sentença** (estrutura) e centraliza. Numa headline com mais de uma frase, cada sentença completa é um nó próprio que ocupa a própria linha; dentro de cada nó, `text-wrap: balance` equilibra quando a sentença precisa quebrar em tela estreita. `<br>` manual em heading é proibido. Modelo mental: **"sentença quebra por estrutura; linha quebra por `balance`; `<br>` não existe."**

### Padrão de markup canônico

| Classe | Papel | `display` | `text-wrap` |
|--------|-------|-----------|-------------|
| `.headline` | wrapper do heading | `block`, centralizado, com `max-inline-size` (measure) | — |
| `.hl-s` | uma **sentença** (frase com ponto final) | `block` | `balance` (equilibra dentro da sentença) |
| `.hl-line` | um **verso** autoral (hero composto) | `block` | normal (quebra deliberada, sem balance) |

`.hl-s` resolve órfão **entre** sentenças (cada uma é nó separado) **e dentro** da sentença (balance). `.hl-line` é só para o hero composto, onde a quebra é intencional (dois pesos diferentes), não uma frase sendo equilibrada.

### CSS template (referência — aplicado em `preview.html` e espelhado no app)

```css
/* Heading centralizado com measure curta */
.headline{
  text-align:center;
  margin-inline:auto;
  text-wrap:balance;            /* fallback para sentença única */
}
.hl-s{ display:block; text-wrap:balance; }   /* uma sentença por linha */
.hl-line{ display:block; }                    /* um verso por linha (hero) */

/* Measure (max-inline-size) por nível tipográfico — o vazio lateral é o luxo */
.headline.is-hero  { max-inline-size:16ch; }  /* display/hero */
.headline.is-title { max-inline-size:32ch; }  /* h2 de seção */
```

Markup da headline-teste (era left-aligned + órfão "Você"):

```html
<h2 class="title headline is-title">
  <span class="hl-s">A clínica vira financeiro <em>sozinha</em>.</span>
  <span class="hl-s">Você decide com <strong>clareza</strong>.</span>
</h2>
```

### Escopo de centralização (o que centraliza · o que não)

**Centraliza:** display/hero, h1/h2, eyebrow/overline, lead curto de hero (≤2 linhas), blockquote de fechamento, bloco do CTA.
**À esquerda:** lead/subtítulo longo (>2 linhas), body corrido, listas, números/KPI/DRE, tabelas. Limiar: acima de 2 linhas → esquerda. Lead longo centraliza o **bloco** (`margin-inline:auto` + `max-inline-size`), nunca o texto corrido interno.

### Três salvaguardas (sem as três, vira genérico)

1. Nenhum heading centralizado é **monopeso** — sempre contraste (thin/bold, roman/italic) no bloco.
2. **Measure curta** obrigatória (~14-18ch hero, ~28-34ch h2) — o vazio lateral é o material caro.
3. **Nunca** centralizar parágrafo/body corrido.

**Exceção retórica:** enumeração em rajada ("Sem planilha. Sem domingo perdido. Sem achismo.") fica junta por cadência — `balance` quebra se necessário.

### Checklist (rodar antes de aprovar qualquer headline nova)

- [ ] Headline multi-sentença usa um `.hl-s` por frase (nenhum `<br>`)?
- [ ] O heading está centralizado e com `max-inline-size` (measure) por nível?
- [ ] Há contraste de peso no bloco (não é monopeso)?
- [ ] Body/lista/número/tabela permanecem à esquerda?
- [ ] Em mobile (375px), nenhuma sentença gera órfão (balance ativo)?

**Se alguma resposta for NÃO, a headline não é aprovada para produção.**

### Por que essa lei existe

Origem: 7 de junho de 2026. A idealizadora abriu o brandbook e a headline de seção "A clínica vira financeiro *sozinha*. Você decide com **clareza**." deixava "Você" órfão no fim da primeira linha — o `text-wrap: balance` distribuía as palavras igualmente entre as duas sentenças, em vez de respeitar o limite de frase. Os títulos também eram left-aligned. Esta lei torna a quebra por sentença e a centralização canônicas, eliminando o retrabalho de reequilibrar headlines peça a peça.

---

## 10. Validação cross-system

Antes de marcar uma tela/peça como "pronta":

| Eixo | Pergunta | Refer |
|------|---------|-------|
| Cor | Usei tokens semânticos (não hex inline)? | `colors-manual.md` |
| Cor | Algum azul, verde-neon, rosa-bebê? Se sim, fora. | `colors-manual.md` §6 |
| Cor | Ouro aparece ≤1x na tela? | `colors-manual.md` §1 |
| Tipografia | Famílias usadas: só Fraunces + Inter? | `typography-system.md` |
| Tipografia | KPI tem `tnum`? | `typography-system.md` §3.4 |
| Voz | Toast/empty state passa pelos 4 estados? | `voice-tone.md` |
| Motion | Duration vem de tokens? | `motion-tokens.md` |
| Motion | Hover aquece (não esfria)? | `motion-principles.md` |
| Motion | Respeita `prefers-reduced-motion`? | `motion-tokens.md` §8 |
| Acessibilidade | Contraste WCAG AA passa? | `colors-manual.md` §7 |

---

## 11. Versionamento

Este DESIGN.md é versionado em conjunto com `tokens.json`. Mudanças significativas:
1. Atualizar `tokens.json` (single source of truth)
2. Atualizar este DESIGN.md (mapa)
3. Atualizar arquivos especializados (`colors-manual.md`, etc.) onde aplicável
4. Criar story `@sm` para refletir mudanças em `apps/web` se afetar produto
5. Atualizar `lastUpdated` no frontmatter

---

_Source-of-truth técnica do design system KEYRA. Para apresentação narrativa da marca, ver [BRANDBOOK.md](BRANDBOOK.md)._
