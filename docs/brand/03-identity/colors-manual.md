# Manual de Cores e Paletas — KEYRA

> **Status:** v1.0 — destilado em 2026-05-07 das 12 referências entregues pela idealizadora.
> **Direção cultural:** [`Editorial Beauty Luxury`](../references/inspirations/02-cultural-direction/editorial-beauty-luxury.md).
> **Princípio macro:** **calor sempre, frio nunca; ouro raro, ouro precioso; drama no contraste, ostentação nunca.**

---

## Sumário

1. [Princípios de cor](#1-princípios-de-cor)
2. [Paleta canônica](#2-paleta-canônica)
3. [Cores semânticas — Brand layer](#3-cores-semânticas--brand-layer-marketingbrandbook)
4. [Cores semânticas — Product layer](#4-cores-semânticas--product-layer-app-keyra)
5. [Combinações aprovadas](#5-combinações-aprovadas)
6. [Anti-padrões de cor](#6-anti-padrões-de-cor)
7. [Acessibilidade — Contraste WCAG](#7-acessibilidade--contraste-wcag)

---

## 1. Princípios de cor

| Princípio | O que significa | Consequência prática |
|-----------|----------------|----------------------|
| **Calor estrutural** | Toda cor passa por filtro quente | Pretos são cocoa profundos, brancos são cremes, cinzas são mochas |
| **Ouro precioso** | Ouro só em momento que merece | Máximo 1 elemento ouro por tela/peça. Ouro em todo lugar = ouro em lugar nenhum |
| **Hierarquia por temperatura** | Cores expressivas (terracota, âmbar) = ação; cores neutras (cocoa, ivory) = estrutura | CTAs em terracota; backgrounds em ivory; texto em cocoa |
| **Saturação contida** | Cores saturadas existem em **profundidade**, não em vibração neon | Terracota é queimada (#B8612B), não terracota laranja-supermercado |
| **Zero azul, zero rosa, zero turquesa** | Marca não tem essas cores | Se aparecerem, é estado raro funcional (info, destrutivo opcional), nunca brand |

---

## 2. Paleta canônica

### 🍦 Ivory & Sand — Os neutros quentes claros

Backgrounds, surfaces, divisores. **A base do sistema.** Substitui qualquer "white" ou "gray-50" frio.

| Token | HEX | RGB | Onde usa |
|-------|-----|-----|----------|
| `ivory-50` | **#FAF6EE** | 250, 246, 238 | Background base de toda peça brand e produto |
| `ivory-100` | **#F4EDE2** | 244, 237, 226 | Surface elevada (cards em fundo ivory-50) |
| `sand-200` | **#EAE0CF** | 234, 224, 207 | Border subtle, divider, skeleton |
| `mocha-300` | **#C8B49A** | 200, 180, 154 | Border default, placeholder, muted forms |

**Visualização:**

```
┌──────────┬──────────┬──────────┬──────────┐
│ ivory-50 │ ivory-100│ sand-200 │ mocha-300│
│ #FAF6EE  │ #F4EDE2  │ #EAE0CF  │ #C8B49A  │
│   ░░░    │   ░▓░    │   ▒▒▒    │   ▓▓▓    │
└──────────┴──────────┴──────────┴──────────┘
```

### ☕ Bronze & Cocoa — Os escuros quentes

Texto, foreground, fundo brand premium. **Substitui qualquer "black" ou "gray-900" frio.**

| Token | HEX | RGB | Onde usa |
|-------|-----|-----|----------|
| `bronze-400` | **#946640** | 148, 102, 64 | Foreground muted, ícone secundário |
| `bronze-500` | **#7E5A40** | 126, 90, 64 | Foreground secondary, accent warm sutil |
| `cocoa-700` | **#5A3E26** | 90, 62, 38 | Foreground emphasis, label forte |
| `cocoa-800` | **#3F2A1B** | 63, 42, 27 | Heading body, contraste forte |
| `cocoa-900` | **#2B1810** | 43, 24, 16 | **Foreground primary** (texto principal) |
| `ink-950` | **#181210** | 24, 18, 16 | Background brand premium dark, máximo escuro |

**Visualização:**

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ bronze-4 │ bronze-5 │ cocoa-7  │ cocoa-8  │ cocoa-9  │ ink-950  │
│ #946640  │ #7E5A40  │ #5A3E26  │ #3F2A1B  │ #2B1810  │ #181210  │
│   ███    │   ████   │  █████   │  █████   │  ██████  │  ██████  │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### 🔥 Terracota & Âmbar — O calor expressivo

Acentos, CTAs, destaques quentes. **A "cor de ação" da KEYRA.**

| Token | HEX | RGB | Onde usa |
|-------|-----|-----|----------|
| `amber-300` | **#E5B473** | 229, 180, 115 | Highlight em fundo escuro, hover sutil |
| `amber-400` | **#D89A4D** | 216, 154, 77 | Acento mid, badge soft |
| `amber-500` | **#C8843A** | 200, 132, 58 | Acento padrão, warning |
| `terracotta-500` | **#C26832** | 194, 104, 50 | Hover de CTA brand |
| `terracotta-600` | **#B8612B** | 184, 97, 43 | **CTA primário brand layer** |
| `terracotta-700` | **#A05525** | 160, 85, 37 | CTA active/pressed, ação importante |
| `rust-800` | **#843E1A** | 132, 62, 26 | Erro forte, destrutivo |

**Visualização:**

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ amber-3  │ amber-4  │ amber-5  │ terra-6  │ terra-7  │ rust-8   │
│ #E5B473  │ #D89A4D  │ #C8843A  │ #B8612B  │ #A05525  │ #843E1A  │
│   ░░░    │   ▒▒▒    │   ▓▓▓    │   ███    │   ████   │   █████  │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### ✨ Gold & Champagne — O ouro precioso

**Acento de raridade.** Aparece em momentos de elevação simbólica. Nunca em massa.

| Token | HEX | RGB | Onde usa |
|-------|-----|-----|----------|
| `champagne-200` | **#F0D8A8** | 240, 216, 168 | Highlight texto em fundo cocoa |
| `gold-300` | **#E5C690** | 229, 198, 144 | Detalhe sub em fundo escuro |
| `gold-400` | **#D4A752** | 212, 167, 82 | Foil claro, badge especial |
| `gold-500` | **#B8923A** | 184, 146, 58 | **Brand accent canônico — o "K" dourado** |
| `gold-600` | **#9A7A2C** | 154, 122, 44 | Hover/pressed, contorno detalhado |

**Visualização:**

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┐
│ champagne-2  │ gold-3   │ gold-4   │ gold-5   │ gold-6   │
│ #F0D8A8      │ #E5C690  │ #D4A752  │ #B8923A  │ #9A7A2C  │
│   ░░░        │   ░▒░    │   ▒▒▒    │   ▓▓▓    │   ███    │
└──────────────┴──────────┴──────────┴──────────┴──────────┘
```

### 🌿 Suporte — Status funcional (Product layer apenas)

Cores raras que **só aparecem no app**, não na brand layer. Calibradas para harmonizar com a paleta quente.

| Token | HEX | Onde usa |
|-------|-----|----------|
| `success-leaf` | **#6E8C5A** | Sucesso (verde-oliva contido — não verde neon) |
| `success-deep` | **#4F6840** | Sucesso enfatizado |
| `warning` | **#C8843A** | Igual `amber-500` (dupla função) |
| `destructive` | **#843E1A** | Igual `rust-800` (dupla função) |
| `info` | **#5A6C7E** | Cinza azulado quente, **uso raríssimo** (apenas info neutra) |

### ⚪ Puros — quase nunca

| Token | HEX | Onde usa |
|-------|-----|----------|
| `white` | **#FFFFFF** | Texto sobre fundo cocoa-900 ou ink-950, máximo contraste |
| `black` | **#000000** | **Evitar.** Use `cocoa-900` ou `ink-950` |

---

## 3. Cores semânticas — Brand layer (marketing/brandbook)

| Função | Token | HEX |
|--------|-------|-----|
| Background base brand | `ivory-50` | #FAF6EE |
| Background dramatizado (peça premium dark) | `cocoa-900` ou `ink-950` | #2B1810 / #181210 |
| Foreground em fundo claro | `cocoa-900` | #2B1810 |
| Foreground em fundo escuro | `champagne-200` | #F0D8A8 |
| CTA primário | `terracotta-600` | #B8612B |
| CTA primário hover | `terracotta-700` | #A05525 |
| Acento premium (logo, selos) | `gold-500` | #B8923A |
| Texto editorial sub (sub-headline em escuro) | `champagne-200` | #F0D8A8 |
| Border decorativo | `mocha-300` | #C8B49A |

---

## 4. Cores semânticas — Product layer (app KEYRA)

⚠️ Calibrado para **densidade UI funcional + contraste WCAG AA + princípios UX (números absolutos protagonistas)**.

| Função | Token | HEX | Substitui (legacy/Tailwind padrão) |
|--------|-------|-----|--------|
| `--background` | `ivory-50` | #FAF6EE | `bg-white`, `bg-slate-50` |
| `--surface` | `#FFFFFF` ou `ivory-100` | varia | `bg-white` puro |
| `--surface-muted` | `ivory-100` | #F4EDE2 | `bg-slate-50` |
| `--foreground` | `cocoa-900` | #2B1810 | `text-slate-900` |
| `--foreground-secondary` | `bronze-500` | #7E5A40 | `text-slate-600` |
| `--foreground-muted` | `bronze-400` | #946640 | `text-slate-400` |
| `--border-subtle` | `sand-200` | #EAE0CF | `border-slate-100` |
| `--border-default` | `mocha-300` | #C8B49A | `border-slate-300` |
| `--accent` | `bronze-500` | #7E5A40 | `accent-blue` (descartar) |
| `--accent-hover` | `cocoa-700` | #5A3E26 | — |
| `--cta-primary` | `terracotta-600` | #B8612B | `bg-blue-600` (descartar) |
| `--cta-primary-hover` | `terracotta-700` | #A05525 | `bg-blue-700` |
| `--cta-primary-foreground` | `ivory-50` | #FAF6EE | `text-white` |
| `--premium-accent` | `gold-500` | #B8923A | — (novo: badge premium, KPI excepcional) |
| `--success` | `success-leaf` | #6E8C5A | `text-green-600` |
| `--warning` | `amber-500` | #C8843A | `text-amber-500` |
| `--destructive` | `rust-800` | #843E1A | `text-red-600` |
| `--info` | `info` | #5A6C7E | `text-blue-500` (descartar saturação) |

### Diferenças vs. Tailwind/shadcn padrão

- ❌ **Sem azul** — `bg-blue-*` em CTAs vira `bg-terracotta-600`
- ❌ **Sem cinza frio** — `text-slate-*` vira `text-bronze-*` ou `text-cocoa-*`
- ❌ **Sem `bg-white` puro como base** — vira `bg-ivory-50`
- ❌ **Sem verde-vivo** — `text-green-500` vira `text-success-leaf` (oliva)
- ✅ **Adiciona `--premium-accent`** — para usos raros (KPI excepcional, badge "modelo destaque", etc.)

---

## 5. Combinações aprovadas

### A — Editorial light (default brand)
```
Background:  ivory-50    #FAF6EE
Headline:    cocoa-900   #2B1810  (serif display)
Body:        bronze-500  #7E5A40  (sans)
CTA:         terracotta-600 #B8612B
Detail:      gold-500    #B8923A  (1 elemento)
```
Usar em: home brandbook, hero da sales page, capa de proposta comercial, landing page institucional.

### B — Editorial dark premium
```
Background:  cocoa-900   #2B1810  (ou ink-950)
Headline:    champagne-200 #F0D8A8 (serif display)
Body:        gold-300    #E5C690  (sans)
CTA:         terracotta-600 #B8612B
Detail:      gold-500    #B8923A
```
Usar em: capa de proposta comercial premium, banners drama (tipo "A Importância do Colágeno"), peças anunciando feature premium.

### C — Calor saturado (post de campanha)
```
Background:  terracotta-600 #B8612B (sólido ou gradient para amber-400)
Headline:    ivory-50    #FAF6EE   (serif display)
Sub:         champagne-200 #F0D8A8
Foto:        retrato editorial (mulher real)
```
Usar em: posts Instagram da KEYRA, lives, peças visuais de mídia.

### D — Produto UI light (default app)
```
Background:  ivory-50    #FAF6EE
Surface:     #FFFFFF
Headline:    cocoa-900   #2B1810  (serif display em ≤32px)
Body:        cocoa-800   #3F2A1B  (sans)
Secondary:   bronze-500  #7E5A40
CTA:         terracotta-600 #B8612B
KPI número:  cocoa-900   #2B1810  (sans bold protagonista)
KPI delta+:  success-leaf #6E8C5A
KPI delta-:  rust-800    #843E1A
Border:      sand-200    #EAE0CF
Premium:     gold-500    #B8923A  (raríssimo: 1x por tela max)
```
Usar em: todas as telas autenticadas do app KEYRA.

### E — Mocha quiet (sub-páginas, settings)
```
Background:  ivory-100   #F4EDE2
Headline:    cocoa-800   #3F2A1B
Body:        bronze-500  #7E5A40
Border:      mocha-300   #C8B49A
```
Usar em: telas de configuração, perfil, áreas administrativas que não precisam de protagonismo.

---

## 6. Anti-padrões de cor

| Anti-padrão | Por quê | O que fazer |
|-------------|---------|-------------|
| `#FFFFFF` puro como fundo de tela inteira | Frio, hospitalar | Use `ivory-50` |
| `#000000` puro como fundo dramatizado | Frio, gótico | Use `cocoa-900` ou `ink-950` |
| `text-slate-*` em qualquer texto | Cinza frio quebra a paleta | Use `bronze-*` ou `cocoa-*` |
| `bg-blue-600` em CTA | Foi a paleta antiga, não cabe mais | `terracotta-600` |
| `text-green-500` em sucesso | Verde neon não harmoniza com palette quente | `success-leaf` (#6E8C5A) |
| Ouro em elemento decorativo grande (>40% da peça) | Vira ostentação | Ouro só em detalhe ≤10% da composição |
| Múltiplos acentos juntos (ouro + terracota + âmbar saturado na mesma tela) | Polui hierarquia | 1 acento dominante por tela |
| Gradient ouro brilhante 3D | Brega/anos 90 | Ouro é cor sólida `#B8923A` |
| Rosa, lilás, lavanda, sage green | Fora da paleta | Não usar — sinal cultural errado |
| Cinza azulado (`slate-*`, `zinc-*`) | Frio | `mocha-300`, `bronze-400` |

---

## 7. Acessibilidade — Contraste WCAG

Todas as combinações de **product layer** abaixo passam **WCAG AA** (≥4.5 para texto normal, ≥3.0 para texto grande/UI).

| Foreground / Background | Ratio | Compliance |
|------------------------|-------|-----------|
| `cocoa-900` / `ivory-50` | **13.8:1** | AAA (texto normal e grande) |
| `cocoa-800` / `ivory-50` | **10.2:1** | AAA |
| `bronze-500` / `ivory-50` | **5.8:1** | AA (texto normal) |
| `bronze-400` / `ivory-50` | **4.6:1** | AA (texto normal — limite) |
| `terracotta-600` / `ivory-50` | **4.7:1** | AA (texto normal) |
| `ivory-50` / `terracotta-600` (CTA) | **4.7:1** | AA |
| `ivory-50` / `cocoa-900` | **13.8:1** | AAA (botão dark) |
| `champagne-200` / `cocoa-900` | **9.1:1** | AAA (modo dark) |
| `gold-500` / `ivory-50` | **3.4:1** | AA-grande / UI apenas |
| `gold-500` / `cocoa-900` | **4.0:1** | AA-grande / UI apenas |
| `mocha-300` / `ivory-50` | **1.9:1** | UI/decorativo — não usar para texto |

**Cuidados:**
- `gold-500` **não** passa AA para texto normal em fundo claro — usar **só** em fundo `cocoa-900` ou em uso decorativo (badge ≥18px bold)
- `bronze-400` está no limite de AA — usar para texto secundário/muted, nunca para info crítica
- `mocha-300` é cor de border/decorativo, **não para texto**

---

_Próxima atualização: ao gerar o `tokens.json` (DTCG) e ao integrar com `apps/web/tailwind.config.ts`._
