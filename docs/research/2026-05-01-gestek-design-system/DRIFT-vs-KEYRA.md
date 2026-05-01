# Drift Report — Gestek vs KEYRA

**Data:** 2026-05-01
**Fonte Gestek:** https://www.gestek.com.br/ (extraído via skill `design-system-md`, archetype marketing-gradient + material-elevation)
**Fonte KEYRA:** `apps/web/tailwind.config.ts` + `apps/web/src/app/globals.css` + `apps/web/src/components/ui/card.tsx` + `apps/web/src/components/keyra/KPICard.tsx`
**Diretriz:** **Gestek é referência para modelar, NÃO para copiar.** A KEYRA tem persona diferente (mulheres empreendedoras, sofisticação editorial); o Gestek é landing institucional com archetype "marketing-gradient" — bom em densidade espacial, fraco em acessibilidade e profundidade tokenizacional.

---

## 1. Side-by-side dos tokens centrais

### 1.1 Paleta

| Categoria | Gestek | KEYRA atual | Decisão |
|-----------|--------|-------------|---------|
| **Primary** | `#00b1c5` (azul ciano saturado) | `#C66A38` (terracota queimada) | **Manter KEYRA.** Terracota é assinatura de marca; azul ciano é genérico de saúde. |
| **Secondary** | `#d35186` (rosa choque) | `#457A50` (sálvia) | **Manter KEYRA.** Rosa choque do Gestek é exatamente o "feminino infantilizado" que a idealizadora pediu para evitar. Sálvia comunica saúde/calma sem clichê de gênero. |
| **Surface** | `#ffffff` (branco puro) | `#FAF8F5` (off-white quente) | **Manter KEYRA.** Off-white quente puxa o conjunto pra paleta editorial; branco puro do Gestek deixa o site frio apesar da cor de marca colorida. |
| **Text** | `#333333` / `#666666` | HSL `36 10% 16%` (#2E2A25) / `30 6% 40%` (#6B6560) | **Manter KEYRA.** Tons quentes alinhados ao surface — Gestek usa cinza neutro frio que conflita com a paleta colorida dele. |
| **Success** | `#5fd500` (verde ácido) | `#457A50` (sálvia) | **Manter KEYRA.** Verde ácido do Gestek é quase fluorescente — ruim em telas escuras e sinaliza "permitido" mais que "lucro". Sálvia é mais sofisticada. |
| **Error** | `#ab3565` (rosa-bordô) | `#B23A3A` (vermelho-terra) | **Manter KEYRA.** Vermelho-terra coordena com a paleta quente; rosa-bordô do Gestek é estranho. |
| **Quantidade total** | 16 cores nomeadas | ~14 (com escalas 50-900 em primary/secondary) | **KEYRA mais profundo** — escalas tonais permitem contraste fino. |

**Veredicto paleta:** KEYRA já está superior ao Gestek em assinatura de marca, harmonia tonal e legibilidade. **Nenhuma mudança necessária.**

### 1.2 Tipografia

| Aspecto | Gestek | KEYRA atual | Decisão |
|---------|--------|-------------|---------|
| **Famílias** | 1 (Titillium Web) | 1 (Inter, via `var(--font-sans)`) | **Manter família única** — Gestek prova que dá pra ter voz editorial sem par tipográfico. |
| **Range de weights** | 200-700 (200, 300, 400, 700) | 400, 500, 600, 700 (Inter normal) | **EVOLUIR KEYRA** → Inter Variable com weights 200-800. Weight 200 em hero (40-56px) cria "ar editorial" sem precisar de serif. |
| **Escala** | 22 níveis (de `caption-small` 12px a `display-hero` 55px) | 7 níveis (text-xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 3xl 30 / 5xl 48) | **EVOLUIR KEYRA** → adicionar `text-display` (40px ultralight) e `text-hero` (56px ultralight) para KPI values e H1 de página. |
| **line-height** | 120% headings · 150% corpo · 100% buttons | Tailwind defaults (mistura) | **CODIFICAR KEYRA** → tokens `leading-tight` (120%) para headings/KPIs · `leading-normal` (150%) para corpo · `leading-none` (100%) para buttons. |
| **letter-spacing** | 0em em quase tudo · 0.05em em labels uppercase | `tracking-tight`, `tracking-wide` ad-hoc | **CODIFICAR KEYRA** → display headings com `tracking-tight` (-0.02em); corpo `tracking-normal`; labels uppercase `tracking-widest` (0.1em — mais respiro que Gestek). |
| **Numbers** | sem `tabular-nums` declarado | `tabular-nums` aplicado em `[data-kpi-value]` (`globals.css:88-93`) | **KEYRA superior.** Manter. |

**Decisão tipográfica final (revisada):** **NÃO adicionar Fraunces/serif.** A direção mudou após ver Gestek: voz editorial vai vir de **Inter Variable + escala expandida + weights extremos (200/400/600/800) + tracking calibrado**. Mais barato (1 fonte), mais coeso (uma família), e segue Apple Health e Stripe Dashboard que fazem isso com sucesso. Se em 60 dias com piloto pago a sensação ainda for "muito Inter", aí adiciona Fraunces como upgrade reversível.

### 1.3 Spacing

| Token | Gestek | KEYRA atual | Decisão |
|-------|--------|-------------|---------|
| xs | 5px | Tailwind `1` (4px) | Próximo. |
| sm | 10px | Tailwind `2.5` (10px) | Igual. |
| **md** | **20px** | Tailwind `4` (16px) ou `5` (20px) | **Codificar `space-md = 20px`** como token semântico — entre elementos relacionados. |
| **lg** | **40px** | Tailwind `8` (32px) ou `10` (40px) | **Codificar `space-lg = 40px`** — entre seções de uma página. |
| xl | 80px | Tailwind `20` (80px) | Igual. |
| xxl | 150px | — | Não precisa para dashboard. |
| **Card padding interno** | 40-60px | `p-6` (24px) | **Aumentar para `p-8` (32px)** ou tokens `space-card-padding-y/x = 24-32px`. Persona quer respirar. |
| **Gap entre cards** | ~32-40px | `gap-3` (12px) ou `gap-4` (16px) | **Aumentar para `gap-6` (24px)** entre KPIs e `gap-8` (32px) entre seções. |
| **Densidade declarada** | `very-roomy` | "compact-medium" (estimado) | **EVOLUIR KEYRA → `roomy`.** Não tão exagerado quanto Gestek (que é landing), mas mais respiro que hoje. |

**Decisão spacing:** criar tokens semânticos KEYRA (`space-card-padding`, `space-section-gap`, `space-page-gap`, `space-stack-{tight|base|loose}`) e aplicar progressivamente. Gestek dá referência alta de "very-roomy" (md=20, lg=40, xl=80) — KEYRA adota nível "roomy" (md=20, lg=32, xl=48) para dashboard, evitando densidade landing-page.

### 1.4 Shadows + Surface

| Aspecto | Gestek | KEYRA atual | Decisão |
|---------|--------|-------------|---------|
| **Shadow intensity** | `strong` (3 shadows) | `shadow-sm` em cards (default) | **Manter KEYRA leve.** Gestek tem sombras fortes de archetype `material-elevation` — adequado para landing, exagerado para dashboard. KEYRA pode adicionar `shadow-md` em cards-hero (hover, active state) mas o default fica `sm`. |
| **Surface treatment** | `shadowed` | flat (sem elevation principal) | **KEYRA caminho intencional.** Editorial moderno usa whitespace + tipografia para hierarquia, não sombras. Manter. |
| **Border radius** | 6 níveis (até bem arredondados) | `--radius: 0.5rem` (8px) + lg/md/sm derivados | **Manter KEYRA.** 8px é discrição editorial; Gestek arredonda mais por archetype landing. |

### 1.5 Componentes-chave

| Componente | Gestek (observado) | KEYRA atual | Aprendizado |
|------------|-------------------|-------------|-------------|
| **Hero numbers** | sem dashboard real (é landing) | `KPICard` com 3 variants (hero 5xl / secondary 4xl / compact 2xl) | **KEYRA superior** — Gestek não é dashboard, não tem KPI. Manter `KPICard`. |
| **Buttons** | `font-weight: 700` em todos os buttons | shadcn default 500-600 | **EVOLUIR** → button text `font-semibold` (600) padrão, `font-bold` (700) em CTAs primários. Mais peso = mais affordance. |
| **Tipografia de label** | `letter-spacing: 0.05em` + `font-weight: 700` em `.label` (12px) | `text-xs uppercase tracking-wide text-muted-foreground` (KPICard:63) | **Próximo.** Manter padrão atual; considerar `tracking-widest` (0.1em) para mais respiro nos uppercase. |

---

## 2. O que KEYRA APRENDE com Gestek

1. **✅ Densidade `roomy` (não `very-roomy`)**: tokens de spacing semânticos com escala maior que Tailwind default. Card padding 24-32px ao invés de `p-6` (24); gap entre cards 24px ao invés de 16px; gap entre seções 32-48px.
2. **✅ Família única + weights extremos**: trocar Inter por Inter Variable e adotar weights 200/400/600/800. Weight 200 em hero/display cria voz editorial sem custo de bundle adicional.
3. **✅ Escala tipográfica expandida**: adicionar `text-display` (40px) e `text-hero` (56px) com `font-weight: 200` + `leading-tight` + `tracking-tight`. Aplicar em KPI values e H1 de página principal.
4. **✅ Buttons com weight 600-700**: aumentar peso visual dos botões. Hoje `Button` shadcn é `font-medium` (500) — KEYRA adota `font-semibold` (600) padrão e `font-bold` (700) em primary CTA.
5. **✅ Tokens semânticos de spacing**: `space-card-padding`, `space-section-gap`, `space-page-gap` ao invés de classes Tailwind ad-hoc. Permite mudar densidade do produto inteiro num arquivo só.

## 3. O que KEYRA EVITA do Gestek

1. **❌ Acessibilidade F (25/100)**: só 2/8 pares de cor passam AA. KEYRA não pode descer a esse nível — manter rigor WCAG AA mínimo (issues do baziotti em §1.3 ainda valem).
2. **❌ Tokenização F (40/100)**: Gestek tem só 14% high confidence — falta CSS variables, abusa de hex literais. KEYRA já é melhor (HSL custom + escalas 50-900). Manter.
3. **❌ Archetype `marketing-gradient + material-elevation`**: Gestek é landing institucional. KEYRA é dashboard — archetype-alvo é `notion-editorial` ou `apple-health-clarity` (whitespace + tipografia + shadows leves), não Material/marketing.
4. **❌ Paleta de gênero estereotipado**: rosa-choque + verde-ácido é "feminino infantilizado" que a idealizadora pediu para evitar. Manter terracota + sálvia.
5. **❌ Branco puro como surface**: KEYRA continua em off-white quente (`#FAF8F5`) — coordena com a paleta editorial.
6. **❌ Fonte single-purpose** (Titillium Web): trocar para fonte com variáveis (Inter Variable, Manrope Variable ou similar) para weights infinitamente granulares. Gestek está preso em 4 weights.

---

## 4. Tabela de decisão consolidada

| Dimensão | Manter KEYRA | Evoluir (modelar Gestek) | Substituir |
|----------|--------------|--------------------------|------------|
| Paleta de cor | ✅ | — | — |
| Família tipográfica | ✅ (Inter) | Trocar para Inter Variable (weights 100-800) | — |
| Escala tipográfica | parcial | Adicionar `text-display` (40px/200wght) + `text-hero` (56px/200wght) | — |
| line-height tokens | — | Codificar `leading-tight`/`leading-normal`/`leading-none` por categoria | — |
| letter-spacing | — | Codificar `tracking-tight`/`tracking-normal`/`tracking-widest` por categoria | — |
| Spacing scale | — | Tokens semânticos `space-card-padding`, `space-section-gap`, `space-page-gap` (escala roomy) | — |
| Shadows | ✅ (manter sutis) | — | — |
| Border radius | ✅ | — | — |
| Surface | ✅ (off-white quente) | — | — |
| Numbers (tabular-nums) | ✅ | — | — |
| Button weight | — | Subir para `font-semibold` padrão, `font-bold` em primary | — |

---

## 5. Como isso muda o plano da Sprint 5/6

A auditoria do baziotti foi calibrada antes da pesquisa Gestek. Com o drift agora mapeado, ajustes:

**Story 6.1 (era "Par tipográfico Fraunces + Inter"):**
→ Vira **"Inter Variable + escala expandida + tokens de leading/tracking"**. Mais barato (1 fonte), mais coeso, segue Gestek + Apple Health + Stripe.

**Story 5.5 (NOVA):**
→ **Sistema de tokens de spacing semânticos** (`--space-card-padding`, `--space-section-gap`, `--space-page-gap`, `--space-stack-{tight,base,loose}`) + aplicação em `Card`, `KPICard`, `dashboard/page.tsx`, `financeiro/dre/page.tsx`. Validação: KPI values (R$ 1.234.567,89) com padding lateral suficiente para não tocar borda; tabular-nums; weight 600 em valores monetários.

**Story 5.6 (NOVA):**
→ **Auditoria pt-BR completa** — revisar copy de todas as 24+ páginas. Acentuação correta, "você"/"hoje"/"este mês" no lugar de termos técnicos (`status='paid'` → "paga"; "MTD" → "este mês"); formato BR de datas e moeda; mensagens de erro humanizadas.

**Princípio inegociável reforçado:** o número absoluto sempre é o herói da tela. Nenhum deslocamento, sombra, gradiente ou animação pode roubar atenção do `R$ X` — função antes de decoração.
