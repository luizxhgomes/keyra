# PREVIEW-REFERENCE — Brandbook Vivo da KEYRA

> **Status:** documento canônico de referência. Source of truth visual do sistema KEYRA.
> **Atualizado em:** 7 de maio de 2026.
> **Arquivo de implementação:** [`preview.html`](preview.html) (1972 linhas, autocontido).
> **Como abrir:** `open docs/brand/03-identity/preview.html` no terminal, ou pelo Finder.

---

## 1. Por que este documento existe

O `preview.html` é o brandbook executável da KEYRA. Cada decisão visual da marca está implementada lá, com cores reais, tipografia real, motion real, componentes reais. Este documento é o **mapa** desse arquivo: aponta o que existe, onde encontrar, como reusar e quando consultar.

**Regra inegociável:** antes de produzir qualquer peça nova (post, slide, email, tela do app, vídeo, proposta comercial, brindes, materiais físicos), o agente ou designer abre o `preview.html` e identifica o componente, padrão de cor, tipografia, motion ou combinação canônica equivalente. **Nada se inventa do zero quando já existe na referência.**

---

## 2. Como usar este documento

### Workflow obrigatório antes de qualquer produção visual

1. **Abrir o `preview.html` em browser.** Validar visualmente o que existe.
2. **Identificar a categoria da peça** que será produzida (post de campanha, KPI, hero, sales page, slide, etc.).
3. **Buscar o componente equivalente** na seção §4 deste documento.
4. **Copiar tokens, cores, tipografia, motion** do componente referenciado, sem inventar variantes.
5. **Consultar a Lei da Densidade Proporcional** ([`DESIGN.md` §9.bis](DESIGN.md)) antes de criar qualquer grid.
6. **Validar contra anti-padrões** documentados no preview (seção 09 e [`BRANDBOOK.md` §11](BRANDBOOK.md)).
7. **Aprovar internamente** comparando lado a lado com o preview.

Se algo precisar existir e não está no preview ainda, o caminho é **estender o preview primeiro**, depois usar. Nunca produzir peça externa sem ancoragem visual.

---

## 3. Mapa das seções implementadas no preview

| # | Section ID | Título visível | O que documenta |
|---|---|---|---|
| Hero | `header` | "Sua clínica rendendo mais." | Voz da marca, hierarquia tipográfica máxima, hero meta |
| TOC fixo | `nav.toc` | KEYRA. (logo + navegação) | Logo principal aplicada, TOC scrollável mobile, active highlight |
| 00 | `#concept` | "Premium é precisão, não ostentação." | Manifesto, mecanismo Cadeia Viva, conceito proprietário |
| 01 | `#vision` | "A clínica vira financeiro sozinha" | Visão da marca, posicionamento competitivo |
| 02 | `#logo` | "Conceitos para o letterform" | 12 explorações de logo (6 primários + 6 sistema signature do ponto) |
| 03 | `#colors` | "Palette canônica: warm always, cool never" | Sistema cromático completo (5 famílias, 25 swatches) |
| 04 | `#typography` | "Fraunces encontra Inter" | Sistema tipográfico (escalas brand e produto, drama tipográfico) |
| 05 | `#components` | "Como o app se sente" | Componentes vivos do produto (botões, inputs, KPI, toast, empty state) |
| 06 | `#motion` | "Calmaria com gravitas" | Motion system (4 demos: hover, kpi-reveal, card hover, tokens) |
| 07 | `#combos` | "Cinco modos de aplicar a marca" | Combinações canônicas A-E (editorial light/dark/quente/produto/quiet) |
| 08 | `#mockups` | "Posts no espírito das suas referências" | Aplicações de campanha (6 mockups CSS-only) |
| 09 | `#anti` | "O que não é KEYRA" | 6 anti-padrões com cor real |
| 10 | `#validation` | "Antes de você dizer sim" | Checklist de validação estratégica |
| Footer | `footer` | Credit + links | Documentação relacionada |

---

## 4. Catálogo de componentes (com código de referência)

### 4.1. Logo · 12 variações canônicas

**Localização no preview:** Section `#logo`.

#### Concepts primários (6)

| ID | Aplicação | Composição |
|---|---|---|
| Concept A | Wordmark padrão | KEYRA + ponto gold |
| Concept B | Wordmark + sublinha | KEYRA + linha gold abaixo |
| Concept A dark | Sobre cocoa-900 | KEYRA. em champagne sobre fundo escuro |
| Monograma favicon | Favicon, app icon | K. em ouro sobre cocoa premium |
| Monograma + dot | Avatar simples | K. em cocoa sobre ivory |
| Monoline outline | Premium foil | K outline em gold sobre cocoa |

#### Sistema signature do ponto (6)

| ID | Aplicação | Composição |
|---|---|---|
| Lockup horizontal | Wordmark + tagline | KEYRA. \| sua clínica rendendo mais |
| Selo circular | Badges, stickers, avatares | KEYRA. dentro de círculo gold |
| Letterspacing editorial | Capas, hero premium | KEYRA. com tracking 0.24em |
| Lowercase | Tom contemporâneo soft | keyra. em peso 300 |
| Stack vertical | Cabeçalhos editoriais | K. acima de KEYRA empilhado |
| Pontuação editorial | Sub-brand e categorias | KEYRA · estética. |

**Regra do ponto signature:** o ponto ocupa entre 18 e 28 por cento da altura da letra à esquerda dele, sempre `gold-500` em fundo claro ou `champagne-200` em fundo escuro premium.

### 4.2. Cores · sistema cromático

**Localização:** Section `#colors`. **Tokens completos:** [`tokens.json`](tokens.json) e [`colors-manual.md`](colors-manual.md).

| Família | Aplicação primária |
|---|---|
| Ivory & Sand (50, 100, 200, 300) | Backgrounds, surfaces, divisores |
| Bronze & Cocoa (400, 500, 700, 800, 900, ink-950) | Texto, foreground, fundo brand premium |
| Terracota & Âmbar (amber 300/400/500, terracotta 500/600/700, rust 800) | Acentos, CTAs, calor expressivo |
| Gold & Champagne (champagne 200, gold 300/400/500/600) | Acento precioso, máximo 1 elemento por tela |
| Status (success-leaf, warning, destructive, info) | Estados funcionais do produto |

### 4.3. Tipografia

**Localização:** Section `#typography`. **Sistema completo:** [`typography-system.md`](typography-system.md).

| Família | Fonte | Uso |
|---|---|---|
| Editorial | Fraunces | Display, headlines, hero, títulos de página |
| Funcional | Inter | Body, UI, KPIs com numerais tabulares |
| Mono | ui-monospace | Detalhe técnico apenas (códigos de erro, IDs) |

**Regra de ouro:** duas famílias, jamais três. Brand layer 70% serifa, product layer 85% sem serifa. Drama tipográfico em pesos extremos (200 com 700 na mesma frase). Itálico como sussurro.

### 4.4. Componentes do produto

**Localização:** Section `#components`. Cada componente está implementado e funcional.

| Componente | Estados | Tokens consumidos |
|---|---|---|
| Button primary | default, hover, focus, press, disabled, loading | terracotta-600, terracotta-700, ivory-50 |
| Button secondary | default, hover, focus, press | ivory-50, bronze-500, cocoa-900 |
| Button ghost | default, hover | bronze-500, ivory-100 |
| Button destructive | default, hover | rust-800, ivory-50 |
| Button premium | default, hover (com glow) | gold-500, gold-600, premium-glow shadow |
| Input | default, focus, error, disabled, filled | mocha-300, bronze-500, rust-800 |
| KPI Card | default, hover, loading, reveal | container queries `13cqi`, tnum, success-leaf, rust-800 |
| Toast | sucesso, warn, error | border-left + ícone semântico |
| Empty state | qualquer | ícone + título serif + body bronze + CTA |

### 4.5. Motion

**Localização:** Section `#motion`. **Sistema completo:** [`motion-system/`](motion-system/).

#### Tokens canônicos

| Token | Valor | Uso |
|---|---|---|
| Duration | 100 / 200 / **320** / 480 / 720 ms | base 320ms é o default |
| Easing default | cubic-bezier(0.22, 1, 0.36, 1) | out-soft (toda entrada) |
| Distância | 4 / **8** / 16 / 32 px | small 8px é fade-up default |
| Stagger | 40 / **80** / 120 / 160 ms | small 80ms é lista padrão |

#### Padrões nomeados implementados no preview

- `fade-up` (default reveal-on-scroll)
- `kpi-reveal` (3 atos: número → label → comparativo)
- `hover-card` (translateY -1px + shadow warm)
- `hover-cta` (background aquece terracotta-600 → terracotta-700)
- `gold-shimmer` (premium button pulse, 6s loop sutil)
- `loop-indicator` (barra fina dourada que pulsa no ritmo de 4500ms)
- `page-fade` via View Transitions API

### 4.6. Combinações canônicas (5)

**Localização:** Section `#combos`.

| Combinação | Background | Foreground | CTA | Aplicação |
|---|---|---|---|---|
| A · Editorial light | ivory-50 | cocoa-900 | terracotta-600 | Hero institucional, capa de proposta |
| B · Editorial dark premium | cocoa-900 | champagne-200 | gold-500 detail | Drama editorial, peça premium |
| C · Calor saturado | terracotta-600 | ivory-50 | sem CTA | Post de campanha Instagram |
| D · Produto UI light | ivory-50 | cocoa-900 | terracotta-600 | App KEYRA padrão |
| E · Mocha quiet | ivory-100 | cocoa-800 | bronze-500 | Settings, áreas administrativas |

### 4.7. Aplicações de campanha (6 mockups)

**Localização:** Section `#mockups`. Cada mockup é um exemplo CSS-only de post Instagram.

| Mockup | Cor base | Estilo |
|---|---|---|
| Dicas para você cuidar da sua pele | terracotta-600 → rust-800 (gradient) | Headline thin com palavra-foco bold |
| Benefícios do Botox | branco | Drama editorial puro, sem foto |
| Depilação a Laser | amber-400 → terracotta-700 | Headline foco grande |
| Seja sua melhor versão | amber-400 → gold-500 → cocoa-800 | Drama de degradê warm |
| Social Media estética | cocoa-900 | Tipografia em camadas, sub em itálico gold |
| A Importância do Colágeno | ink-950 | Drama puro, sem foto, headline em gold |

**Pattern visual:** display serif gigante + cor saturada quente como protagonista + assinatura social discreta no rodapé.

### 4.8. Anti-padrões visualizados (6)

**Localização:** Section `#anti`. Cada bloco mostra a cor real do anti-padrão (azul corporativo, rosa-bebê, etc.).

| Anti-padrão | Por que evitar |
|---|---|
| Tech corporativo (azul saturado) | Frio, masculino, padronizado |
| Spa infantilizado (rosa-bebê e lavanda) | Diminutivo, KEYRA é negócio sério |
| Beauty hiperfeminino (rosa choque) | Geração errada |
| ERP institucional (azul e cinza) | Anti-classe, sai como banco |
| Skincare millennial (verde sálvia) | Tendência morrendo |
| Luxo ostentação (preto e ouro 3D) | Vulgar, não quiet luxury |

---

## 5. Decisões canônicas registradas no preview

### 5.1. Mecanismo único: Cadeia Viva

Conceito proprietário documentado em §00 (Manifesto). O financeiro nasce automaticamente da operação: atendimento gera comanda, comanda gera transação, transação alimenta DRE, DRE informa decisão. Linha contínua. Sem lançamento manual.

**Aplicação:** sempre que precisar explicar o diferencial da KEYRA, usar a frase "construída de dentro para fora" e o nome Cadeia Viva como conceito-chave.

### 5.2. Ponto signature dourado

Elemento de marca proprietário. Aparece como pingo do letterform (KEYRA.), pontuação editorial (KEYRA · estética.), pontos cardinais do selo circular, e pode estender-se a qualquer aplicação. Cor sólida `gold-500` em fundo claro, `champagne-200` em fundo escuro.

**Aplicação:** todo lockup, selo, monograma e versão do logo carrega o ponto. Em peças marketing, o ponto pode aparecer isolado como signature.

### 5.3. Categoria visual: Editorial Beauty Luxury

Documentada em [`02-cultural-direction/editorial-beauty-luxury.md`](../references/inspirations/02-cultural-direction/editorial-beauty-luxury.md). Vizinhança: Aesop, Hermès, Le Labo, Vogue Brasil, Quiet Luxury.

### 5.4. Lei da Densidade Proporcional

Inegociável. Documentação em [`DESIGN.md` §9.bis](DESIGN.md). Nenhum grid pode terminar com órfãos. Tabela canônica de colunas por número de itens. CSS anti-órfão automático obrigatório.

### 5.5. Motion: 6 princípios

1. Calmaria com gravitas (default 320ms ease-out-soft, sem bounce)
2. Reveal narrativo em três atos (KPI: número → label → comparativo)
3. Sensação têxtil (fade + scale + warm shadow)
4. Drama sob demanda (90% silencioso, 10% ganho)
5. Calor crescente (hover aquece, nunca esfria)
6. Zero parallax, zero scroll-jacking

### 5.6. Voz: 4 estados

| Estado | Aplicação | Exemplo |
|---|---|---|
| Mentora (default) | Body, dashboard, status | "Sua clínica fez R$ 2.300 a mais que abril." |
| Cúmplice | Sucesso, acerto | "Comanda fechada. R$ 850 entraram agora." |
| Direta | Erro, problema | "Sua margem caiu 8%. Veja onde ajustar." |
| Editorial | Brand, hero, capa | "Sua clínica rendendo mais. Sem planilha. Sem domingo. Sem achismo." |

---

## 6. Workflow de extensão (quando algo novo precisa existir)

### Passo 1: confirmar que não existe
Abrir `preview.html`, percorrer as 13 seções. Se já existe um componente/padrão equivalente, reusar. **Inventar variante nova é antipremium.**

### Passo 2: estender o preview primeiro
Se realmente novo, adicionar o componente ao `preview.html` na seção apropriada. Documentar no `PREVIEW-REFERENCE.md` (este arquivo). Atualizar `tokens.json` se houver token novo.

### Passo 3: validar contra a Lei da Densidade Proporcional
Antes de aprovar, rodar o checklist anti-órfão de [`DESIGN.md` §9.bis](DESIGN.md).

### Passo 4: validar contra anti-padrões
Confirmar que a peça não tem azul corporativo, rosa-bebê, ostentação dourada, etc.

### Passo 5: validar contra os 6 princípios de motion
Se a peça tem movimento, confirmar que respeita calmaria, calor crescente, zero parallax.

### Passo 6: validar voz e tom
Confirmar que a copy está em pt-BR culto direto, sem "amiga", sem "incrível", sem motivacional vazio.

### Passo 7: produzir
Só agora produzir a peça externa, com todas as decisões já validadas.

---

## 7. Histórico de evolução do preview

| Data | Mudança principal |
|---|---|
| 2026-05-07 | Criação inicial do preview.html com 11 seções, 6 conceitos de logo, 5 combinações |
| 2026-05-07 | Conceito Cadeia Viva nomeado, manifesto adicionado como seção 00 |
| 2026-05-07 | Logo expandido para 12 conceitos (sistema signature do ponto) |
| 2026-05-07 | Tokens canônicos refatorados (tipografia legível) |
| 2026-05-07 | KPI Reveal sem botão, com auto-loop e indicador animado |
| 2026-05-07 | Lead-columns aplicado em 8 sections (newspaper editorial) |
| 2026-05-07 | Manifesto reescrito (Hopkins audit 91/100) |
| 2026-05-07 | Lei da Densidade Proporcional estabelecida (anti-órfão) |
| 2026-05-07 | Logo principal aplicada no header fixo (KEYRA. com ponto gold) |
| 2026-05-07 | Selo circular corrigido (wordmark centralizado dentro do círculo) |

---

## 8. Documentação relacionada

| Documento | Quando consultar |
|---|---|
| [`preview.html`](preview.html) | Toda produção visual: a referência viva |
| [`BRANDBOOK.md`](BRANDBOOK.md) | Apresentação narrativa para parceiros e agências |
| [`DESIGN.md`](DESIGN.md) | Sistema técnico unificado e Lei da Densidade Proporcional |
| [`tokens.json`](tokens.json) | Source of truth de cores, fontes, spacing, motion |
| [`colors-manual.md`](colors-manual.md) | Manual completo de cores com WCAG |
| [`typography-system.md`](typography-system.md) | Sistema tipográfico detalhado |
| [`voice-tone.md`](voice-tone.md) | Voz da marca em 4 estados |
| [`motion-system/`](motion-system/) | Motion completo (6 docs + 4 templates Remotion) |
| [`logo/README.md`](logo/README.md) | Brief de design do logo profissional |

---

## 9. Como invocar este sistema

| Necessidade | Comando |
|---|---|
| Validar visualmente uma peça nova | `open docs/brand/03-identity/preview.html` |
| Auditoria visual completa | `/brand:brand-chief *brand-audit` |
| Refinamento profissional do logo | Brief em [`logo/README.md`](logo/README.md) |
| Gerar vídeo brand layer | Templates em [`motion-system/remotion-templates/`](motion-system/remotion-templates/) |
| Posicionamento formal | `/brand:april-dunford` |

---

## 10. Regra final do Brand Chief

**Toda produção visual KEYRA passa por este documento antes de existir externamente.** Sem exceção. Sem atalho. Sem "vou fazer rápido sem consultar". O brandbook vivo (preview.html) é a constituição visual da marca, e este documento é o índice da constituição.

Se algo for produzido violando uma decisão registrada aqui, é considerado **anti-marca** e deve ser refeito antes de chegar ao público.

A finalidade desta regra: **eliminar retrabalho, eliminar improviso, garantir coerência editorial luxury em todos os canais.**

---

_Criado em 7 de maio de 2026 pelo Brand Chief, com base em 12 referências entregues pela idealizadora e nas decisões consolidadas no preview.html. Atualizar este documento sempre que o preview ganhar nova section, novo componente ou nova decisão canônica._
