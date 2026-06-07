# Sistema Tipográfico — KEYRA

> **Status:** v1.0 — destilado em 2026-05-07.
> **Princípio macro:** **uma família serif editorial dramatiza a marca; uma família sans neutra serve a função; a mistura é o personagem.**

---

## 1. As duas famílias

A KEYRA opera com **duas famílias** complementares — não três, não uma. A interação entre serif (voz) e sans (clareza) é o que dá personalidade sem prejudicar leitura funcional.

### 1.1. Display & Editorial — **Fraunces**

**Fraunces** (Google Fonts, open-source, SIL Open Font License). [`https://fonts.google.com/specimen/Fraunces`](https://fonts.google.com/specimen/Fraunces)

**Por que Fraunces:**
- Serif alto-contraste com tons editoriais luxury — bate exatamente nas referências (Beneficios do Botox, A Importância do Colágeno, Seja sua melhor versão)
- Eixo variable: weight 100–900 + soft (0–100) + opsz (9–144)
- Itálico com personalidade (bate "estética" do banner Social Media)
- Open-source — sem custo de licença, embarca em PDF/print sem licensing
- Tem `ss01` (alternate "g") e ligaduras opcionais que elevam o feeling editorial

**Pesos canônicos KEYRA:**
| Peso | Token | Uso |
|------|-------|-----|
| 200 (ExtraLight) | `display-thin` | Hero gigante (≥80px), sub-headlines em peças premium |
| 300 (Light) | `display-light` | Headlines secundárias |
| 500 (Medium) | `display-medium` | Headlines de produto (≤32px) |
| 600 (SemiBold) | `display-semibold` | Headlines marketing impactantes |
| 700 (Bold) | `display-bold` | Drama editorial (KPI gigante, capa de proposta) |
| 200 italic | `display-thin-italic` | Acentos, palavras suaves ("estética", "sua") |
| 600 italic | `display-semibold-italic` | Citação destacada, sub-brand |

**Configuração técnica:**
```css
font-family: 'Fraunces', 'Times New Roman', serif;
font-feature-settings: 'ss01', 'liga';
font-optical-sizing: auto;
```

### 1.2. Sans funcional — **Inter**

**Inter** (Google Fonts, SIL Open Font License). [`https://fonts.google.com/specimen/Inter`](https://fonts.google.com/specimen/Inter)

**Por que Inter:**
- Já é a sans **mais usada e testada** em UI moderna — leitura impecável em densidade alta
- Variable axis: weight 100–900
- Numerals tabulares disponíveis (`tnum`) — **crítico** para o KEYRA (números absolutos de KPI precisam alinhar coluna)
- Frio o suficiente para servir o produto sem competir com a serif editorial
- Já presente no ecosistema (provável uso atual em `apps/web`)

**Pesos canônicos KEYRA:**
| Peso | Token | Uso |
|------|-------|-----|
| 400 (Regular) | `sans-regular` | Body de produto, body de marketing |
| 500 (Medium) | `sans-medium` | Labels UI, navegação, sub-headers |
| 600 (SemiBold) | `sans-semibold` | KPI valores em produto, badges |
| 700 (Bold) | `sans-bold` | KPI número-protagonista (R$ 12.847), CTA |

**Configuração técnica:**
```css
font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
font-feature-settings: 'tnum', 'cv11', 'ss03';
font-optical-sizing: auto;
```

`tnum` ativa numerals tabulares — números monoespaçados em coluna. Essencial em DRE/KPI.

---

## 2. Escala tipográfica

Modular. Base 16px. Razão fluida (não 1.250 fixo) — calibrada peça a peça, mas com âncoras claras.

### 2.1. Brand layer (marketing, brandbook, sales)

| Token | Tamanho | Line-height | Família | Peso | Uso |
|-------|--------|-------------|---------|------|-----|
| `brand-hero` | clamp(64px, 10vw, 144px) | 0.95 | Fraunces | 200 (italic em destaque) | Capa, hero de sales page, abertura de proposta |
| `brand-display-1` | clamp(48px, 6vw, 96px) | 1.0 | Fraunces | 300 / 600 | Headline post Instagram, headline seção |
| `brand-display-2` | clamp(36px, 4.5vw, 64px) | 1.05 | Fraunces | 500 | Headline secundária, sub-hero |
| `brand-headline` | 32px | 1.1 | Fraunces | 600 | Título de seção marketing |
| `brand-subhead` | 24px | 1.3 | Fraunces | 400 / italic | Sub-título editorial |
| `brand-body-large` | 20px | 1.55 | Fraunces ou Inter | 400 | Lead, intro de bloco |
| `brand-body` | 17px | 1.6 | Inter | 400 | Corrido, parágrafos |
| `brand-caption` | 14px | 1.5 | Inter | 500 | Legenda de imagem, fonte editorial |
| `brand-overline` | 12px | 1.0 | Inter | 600 + tracking 0.12em + uppercase | Etiqueta de seção |

### 2.2. Product layer (UI app KEYRA)

⚠️ Calibrado para **densidade roomy + KPI protagonismo + tela única (princípios UX inegociáveis)**.

| Token | Tamanho | Line-height | Família | Peso | Uso |
|-------|--------|-------------|---------|------|-----|
| `ui-page-title` | 32px | 1.15 | Fraunces | 500 | Título de página (`Dashboard`, `Atendimentos`, `DRE`) |
| `ui-section-title` | 24px | 1.2 | Fraunces | 500 | Título de bloco/card grande |
| `ui-card-title` | 18px | 1.3 | Inter | 600 | Título de card de KPI ou item |
| `ui-kpi-value` | clamp(40px, 5vw, 64px) | 1.0 | Inter | 700 + tnum | **Protagonista**: valor de KPI (R$ 12.847) |
| `ui-kpi-value-secondary` | 24px | 1.0 | Inter | 600 + tnum | KPI secundário |
| `ui-kpi-label` | 13px | 1.3 | Inter | 500 + tracking 0.04em + uppercase | Label sob KPI ("Receita do mês") |
| `ui-body` | 15px | 1.55 | Inter | 400 | Body padrão UI |
| `ui-body-emphasis` | 15px | 1.55 | Inter | 600 | Body em destaque |
| `ui-label` | 14px | 1.4 | Inter | 500 | Labels de formulário, navegação |
| `ui-caption` | 13px | 1.45 | Inter | 400 | Texto auxiliar, helper text |
| `ui-micro` | 12px | 1.4 | Inter | 500 + tracking 0.02em | Badges, pills, status |
| `ui-mono` | 13px | 1.5 | `ui-monospace`, Menlo | 400 | Detalhe técnico de erro, ID, hash |

---

## 3. Princípios de aplicação

### 3.1. Mistura como personagem

Toda peça da KEYRA tem **pelo menos um momento serif editorial**. O equilíbrio sugerido:
- **Brand layer:** ~70% serif (Fraunces), ~30% sans (Inter)
- **Product layer:** ~15% serif (apenas títulos de página/seção), ~85% sans (Inter)

### 3.2. Weights extremos

A referência (`Beneficios do Botox`, `Depilação a Laser`) usa **contraste alto entre weights** dentro da mesma frase:

> **BENEFÍCIOS** (Fraunces 300) **DO BOTOX** (Fraunces 700)

KEYRA herda esse padrão em peças marketing — palavra estrutural fica thin/light, palavra-foco fica bold. **Drama tipográfico planejado.**

### 3.3. Itálico como sussurro

Inspirado no banner `Social Media estética` (8º print): **"estética"** em itálico é o detalhe que humaniza. Aplicar em KEYRA:
- Sub-brand expressões: "*sua* clínica", "*essa* venda", "*o* lucro"
- Acentos de voz quando o tom é mentor confiável (ver [`voice-tone.md`](./voice-tone.md))

### 3.4. Numerals tabulares no produto

Em qualquer tela que mostre coluna de número (DRE, lista de transações, KPI grid), `font-feature-settings: 'tnum'` é **obrigatório**. Sem isso, "R$ 1.234,56" e "R$ 9.876,54" desalinham e quebram a leitura financeira.

### 3.5. Letterspacing controlado

| Contexto | Letter-spacing |
|----------|----------------|
| Display Fraunces ≥48px | -0.02em (compactação editorial) |
| Display Fraunces 24–40px | -0.01em |
| Display Fraunces ≤20px | 0 |
| Inter body | 0 |
| Inter overline/uppercase | 0.04em a 0.12em |
| Inter KPI value | 0 (com `tnum` ativo) |

### 3.6. Line-length

| Contexto | Largura ótima |
|----------|---------------|
| Body de marketing/brandbook | 60–75 caracteres |
| Body de produto | 50–65 caracteres |
| Headline display (Fraunces) | 25–45 caracteres |
| Caption | 70–90 caracteres |

Acima desse range = quebra de hierarquia editorial. Abaixo = ficção visual.

### 3.7. Alinhamento e quebra por sentença (canônico)

Regra-mãe em [`.claude/rules/design-system.md` princípio 6](../../../.claude/rules/design-system.md).

**Alinhamento.** Todo heading de brand é **centralizado** — display, h1/h2, eyebrow/overline, lead curto de hero (≤2 linhas), blockquote de fechamento e o bloco do CTA. Permanecem **à esquerda**: lead/subtítulo longo (>2 linhas), body corrido, listas, números/KPI/DRE e tabelas. Limiar prático: acima de 2 linhas → esquerda.

**Quebra por sentença.** Numa headline com mais de uma frase, cada **sentença completa** ocupa a própria linha — um nó próprio, nunca `<br>`. Dentro de cada sentença, `text-wrap: balance` equilibra quando ela precisa quebrar em tela estreita. Nenhuma frase vaza parte de si para a linha de outra (sem órfão entre sentenças, como o "Você" que sobrava em "…sozinha. Você").

**Três salvaguardas da centralização** (sem as três, escorrega para o genérico):
1. **Nenhum heading centralizado é monopeso** — sempre há contraste (thin/bold, roman/italic) no bloco. É o salto de peso, não o eixo, que carrega o drama editorial que o left-align dava de graça.
2. **Measure curta:** ~14-18ch para display/hero, ~28-34ch para h2 de seção. O vazio lateral generoso é o material caro do Quiet Luxury.
3. **Centralizar nunca o parágrafo/body corrido** — destrói o retorno de linha.

**Exceção retórica:** enumeração em rajada ("Sem planilha. Sem domingo perdido. Sem achismo.") fica **junta** por cadência — `balance` cuida da quebra se a viewport estreitar. "Sentença por linha" governa headings, não enumerações no sub.

Modelo mental: **"sentença quebra por estrutura; linha quebra por `balance`; `<br>` não existe."**

---

## 4. Anti-padrões tipográficos

| Anti-padrão | Por quê | O que fazer |
|-------------|---------|-------------|
| Usar **3+ famílias** numa peça | Polui hierarquia | Sempre Fraunces + Inter, nada além |
| Serif em **body de produto** | Reduz legibilidade em UI densa | Body de produto sempre Inter |
| Sans em **título de capa brand** | Perde tom editorial | Título brand sempre Fraunces |
| Weight muito **médio** (400/500 em display) | Pasteurizado, sem caráter | Use 200/300 ou 600/700 — extremos |
| **Texto centralizado** em parágrafo longo | Cansativo, quebra o retorno de linha | Centro em todo heading (e lead curto ≤2 linhas); body, lista, número e tabela à esquerda |
| **Heading de brand left-aligned** | Quebra a regra de centralização canônica (§3.7) | Todo heading é `text-align: center` |
| **`<br>` cego em heading** | Quebra errado no próximo breakpoint e gera órfão | Sentença = nó próprio (`.hl-s`); `text-wrap: balance` equilibra dentro dela |
| **All caps em parágrafo** | Berra | All caps só em overline/label/badge ≤14px |
| Letterspacing em itálico | Quebra fluidez | Itálico vai com letterspacing 0 ou negativo |
| **Texto sobre foto sem véu** | Ilegível | Sempre overlay sutil (ver [colors-manual](./colors-manual.md) seção 4) |
| Display em **branco gelo puro** | Frio | Use `ivory-50` ou `champagne-200` |

---

## 5. Importação técnica

### 5.1. Brand layer (HTML/web sites)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,200..700,0..100;1,9..144,200..700,0..100&family=Inter:wght@400..700&display=swap" rel="stylesheet">
```

### 5.2. Product layer (Next.js — `apps/web/src/app/layout.tsx`)

```tsx
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

// no <html className={`${fraunces.variable} ${inter.variable}`}>
```

### 5.3. Tailwind config (`apps/web/tailwind.config.ts`)

```ts
export default {
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-fraunces)", "Times New Roman", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      fontFeatureSettings: {
        editorial: '"ss01", "liga"',
        tabular: '"tnum"',
      },
    },
  },
};
```

### 5.4. CSS utilities (`globals.css`)

```css
.font-editorial {
  font-family: var(--font-fraunces);
  font-feature-settings: "ss01", "liga";
  font-optical-sizing: auto;
}

.font-tabular {
  font-feature-settings: "tnum";
}
```

---

## 6. Mapeamento contra estado atual

### Estado atual em `apps/web/`
A inspeção do código atual deve revelar uso de fontes default (provavelmente Inter via Tailwind ou system fonts). Para migrar:

1. Adicionar Fraunces via `next/font/google` em `layout.tsx`
2. Atualizar `tailwind.config.ts` para mapear `font-serif` → Fraunces
3. Aplicar `font-serif` nos títulos de página (`<h1>`, `<h2>` em rotas `(app)`)
4. Manter `font-sans` (Inter) como default em `<body>`
5. Adicionar utility `.font-tabular` em containers de KPI/DRE

**Quem executa:** Story de implementação a ser criada com `@sm` após aprovação deste manual.

---

## 7. Exemplos visuais (descritivos)

### Hero de sales page (bloco centralizado · verso por linha)
```
            Sua clínica           [Fraunces 200 italic, 96px · verso .hl-line]
          rendendo mais.          [Fraunces 700, 96px · verso .hl-line]

  Sem planilha. Sem domingo perdido. Sem achismo.   [Inter 400, 18px · tríade junta]
           Quero conhecer →        [Terracotta-600 button · bloco centralizado]
```
Bloco inteiro centralizado. Os dois versos do título quebram por **estrutura** (`.hl-line`), não por `<br>`. A tríade do sub fica **junta** (rajada/cadência); `balance` quebra se a viewport estreitar.

### Capa de proposta comercial
```
[Fraunces 700, 64px, cocoa-900]    KEYRA
[Inter 500, 14px, uppercase, gold-500]    PROPOSTA COMERCIAL · 2026
                                   ────────
[Fraunces 200 italic, 32px]        para Camila Aquino
[Inter 400, 15px]                  Clínica Estética [Nome]
```

### Card de KPI no app
```
[Inter 500, 13px, uppercase, bronze-500, tracking 0.04em]    RECEITA DO MÊS
[Inter 700, 56px, cocoa-900, tnum]                           R$ 12.847,30
[Fraunces 400 italic, 16px, success-leaf]                    R$ 2.300 a mais que abril
```

### Post Instagram (coerente com refs)
```
[Background: terracotta-600 #B8612B]
[Foto editorial à direita: mulher real]
[Fraunces 700, 88px, ivory-50]    BENEFÍCIOS
[Fraunces 300, 88px, ivory-50]    DO BOTOX
[Inter 500, 12px, uppercase, gold-300]    @KEYRA · BLOG
```

---

_Próxima atualização: ao gerar `tokens.json` DTCG e implementar em `apps/web`._
