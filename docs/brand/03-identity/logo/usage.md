# KEYRA · Logo Usage & Brand Book

> **Status:** Logo signature canônico ativo em produção · brand v1.2 (ponto via `<tspan>` tipográfico).
> **Componente React:** `apps/web/src/components/brand/KeyraLogo.tsx`
> **Assets SVG:** `docs/brand/03-identity/logo/_assets/`
> **Atualizado em:** 7 de maio de 2026.

## 0. ⚠️ Regra inegociável · Ponto signature via `<tspan>` tipográfico

**Decisão arquitetural brand v1.2:** o ponto signature é renderizado via `<tspan>` dentro do mesmo `<text>` do wordmark, não via `<circle>` posicionado manualmente. Isso garante:

1. **Posição automática** — kerning real do font (Fraunces) coloca o ponto na posição tipograficamente correta após a última letra, sem cálculo manual de `cx`.
2. **Tamanho proporcional natural** — o glifo do ponto-final do Fraunces tem geometria nativa proporcional ao font-size (Sagi Haviv: "use a tipografia, não invente em cima dela").
3. **Coerência** — o ponto é parte do mesmo objeto tipográfico, não um adorno solto.
4. **Escalabilidade** — qualquer font-size resulta em ponto proporcional automaticamente.

### Padrão canônico do SVG

```svg
<text x="0" y="62" font-family="Fraunces,serif" font-size="72" font-weight="700"
      letter-spacing="-2" fill="#2B1810">
  KEYRA<tspan fill="#B8923A">.</tspan>
</text>
```

A cor do ponto vem do `fill` do `<tspan>`. Posição, tamanho e baseline são automáticos via kerning do font.

### ViewBox calibrados (com folga pra ponto + tagline + kerning)

| Variant | viewBox | font-size | letter-spacing |
|---|---|---|---|
| Primary | `0 0 280 80` | 72 | -2 |
| Monogram | `0 0 72 64` | 56 | -1 |
| Lockup | `0 0 360 140` | 92 | -2.5 |
| Stacked K | `0 0 220 260` | 140 | -2 |

**Regra do viewBox:** sempre dimensionar com **folga horizontal de ~15-20% sobre a largura natural do texto + ponto**, evitando recortes em qualquer fallback de font.

### Cores aprovadas para o ponto

- `#B8923A` (gold-500) · canônico em qualquer theme

---

## 1. Avaliação CGH 5-pillar (Sagi Haviv)

| Pilar | Pergunta | Veredito |
|---|---|---|
| **Appropriate** | Consistente com o que a marca faz e para quem fala? | ✅ Editorial luxury serif + ponto dourado discreto. Tom premium sem ostentação, alinhado a clínicas de estética profissional 30-45 anos. Não é tech-bro, não é spa fofo, não é luxo Trump. |
| **Distinctive** | Diferencia visualmente dos concorrentes? | ✅ Trinks (Stone) usa wordmark genérico, Belle Software usa script feminino datado, Conta Azul usa azul corporativo. Nenhum usa wordmark serif + ponto signature. |
| **Simple** | Funciona em 16×16px? Funciona monocromático? | ✅ Lê em 16×16 (favicon `icon.svg` testado). Funciona em mono cocoa-900 sem o ponto dourado, conservando reconhecimento. |
| **Memorable** | Após 3s de exposição, alguém rascunha de memória? | ✅ "KEYRA" em serif + ponto à direita. Estrutura de 6 elementos (5 letras + 1 ponto) é simples o suficiente. |
| **Versatile** | Aplica em ivory-50, cocoa-900, foto editorial, foil dourado? | ✅ 4 variants × 3 themes = 12 aplicações canônicas cobrem todos os cenários. |

**Score CGH:** 5/5. Aprovado para produção.

---

## 2. Variantes canônicas

### Primary (KEYRA. horizontal)
**Uso:** header de site, header de email, capa de proposta, hero de sales page.
**Asset:** [`keyra-primary.svg`](_assets/keyra-primary.svg) · light theme · cocoa-900 + gold-500
**Componente:** `<KeyraLogo variant="primary" theme="light" />`

### Primary Dark (sobre cocoa-900)
**Uso:** capa de proposta premium dark, banner editorial drama.
**Asset:** [`keyra-primary-dark.svg`](_assets/keyra-primary-dark.svg) · champagne-200 + gold-500
**Componente:** `<KeyraLogo variant="primary" theme="dark" />`

### Monogram (K.)
**Uso:** favicon, app icon, avatar social media, marca d'água.
**Asset:** [`keyra-monogram.svg`](_assets/keyra-monogram.svg) (light) · [`keyra-monogram-dark.svg`](_assets/keyra-monogram-dark.svg)
**Componente:** `<KeyraLogo variant="monogram" theme="light" />`
**Favicon ativo:** `apps/web/public/icon.svg`

### Lockup com tagline
**Uso:** hero de proposta comercial, capa de pitch deck, slide de abertura.
**Asset:** [`keyra-lockup-tagline.svg`](_assets/keyra-lockup-tagline.svg)
**Componente:** `<KeyraLogo variant="lockup-tagline" theme="light" />`
**Tagline canônica:** "sua clínica rendendo mais."

### Stacked vertical
**Uso:** cabeçalhos editoriais, peças quadradas/verticais, sticker.
**Asset:** [`keyra-stacked.svg`](_assets/keyra-stacked.svg)
**Componente:** `<KeyraLogo variant="stacked" theme="light" />`

---

## 3. Cores canônicas

| Theme | Wordmark | Ponto | Tagline |
|---|---|---|---|
| `light` (default) | `cocoa-900` `#2B1810` | `gold-500` `#B8923A` | `bronze-500` `#7E5A40` |
| `dark` (premium) | `champagne-200` `#F0D8A8` | `gold-500` `#B8923A` | `gold-300` `#E5C690` |
| `gold` (foil/raro) | `gold-500` `#B8923A` | `gold-500` `#B8923A` | `gold-600` `#9A7A2C` |

**O ponto dourado é a assinatura proprietária da marca.** Sempre `gold-500` em fundo claro/escuro, exceto em foil de impressão (onde pode ser metálico real). Nunca trocar para outra cor.

---

## 4. Clear space

Espaço respiratório mínimo ao redor do logo = **altura da letra "K"** em qualquer direção. Em peças premium (capas, hero, propostas), usar **2× altura do K**.

```
       ↕ K-height
  ┌──────────────────────┐
  │                      │
↔ │      KEYRA.          │ ↔  ← K-height clear space
  │                      │
  └──────────────────────┘
       ↕ K-height
```

---

## 5. Tamanho mínimo

| Suporte | Width mínimo | Height mínimo |
|---|---|---|
| Digital · web/app | 80px | 24px |
| Digital · favicon/monograma | 16px × 16px | 16px × 16px |
| Impresso · papelaria | 25mm | 8mm |
| Foil/embossed · alto padrão | 40mm | 12mm |

Abaixo desses limites, o ponto dourado não é mais perceptível e a marca perde signature.

---

## 6. Aplicações ativas em produção

| Onde | Variant | Theme | Componente |
|---|---|---|---|
| `Sidebar.tsx` (collapsed) | monogram | dark | `<KeyraLogo variant="monogram" theme="dark" height={20} decorative />` |
| `Sidebar.tsx` (expanded) | primary | light | `<KeyraLogo variant="primary" theme="light" height={22} />` |
| `SignInCard.tsx` | primary | light | `<KeyraLogo variant="primary" theme="light" height={32} />` |
| `SignUpCard.tsx` | idem | idem | idem |
| `RequestResetCard.tsx` | idem | idem | idem |
| `NewPasswordCard.tsx` | idem | idem | idem |
| `onboarding/nova-organizacao` | primary | light | `<KeyraLogo variant="primary" theme="light" height={48} />` |
| `apps/web/public/icon.svg` | monogram | light | favicon SVG |

---

## 7. Decisão técnica · `<text>` em SVG

O componente `<KeyraLogo />` e os SVG standalone usam `<text font-family="Fraunces, ...">`, **não paths convertidos**. Razão:

- **Garante perfeição tipográfica** (Fraunces real, não aproximação)
- **Escalável infinitamente** sem perda
- **Pequeno em tamanho** (~500 bytes vs. ~3KB de paths)
- **Editável** em qualquer SVG editor profissional

⚠️ **Para foil/print/embossed profissional**, o designer humano deve:

1. Abrir o SVG canônico (ex: `keyra-primary.svg`) em Illustrator/Figma
2. Selecionar o `<text>` e converter em paths (`Type → Create Outlines` no Illustrator)
3. Salvar como nova variante (ex: `keyra-primary-print.svg`)

Isso garante que a impressão renderiza igual em qualquer máquina, mesmo sem Fraunces instalada.

---

## 8. Anti-padrões (proibidos)

| Anti-padrão | Por quê |
|---|---|
| Trocar Fraunces por outra serif (Playfair, Cormorant, etc.) | Quebra signature da marca |
| Ponto em cor diferente de gold-500/champagne | Ponto é a assinatura proprietária |
| Esticar/comprimir letterform | Fraunces 700 -2 letterspacing é canônico |
| Adicionar sombra/efeito 3D | Anti-brandbook (princípio quiet luxury) |
| Inscrever em ícone botânico (folha, gota) | Categoria errada (KEYRA não é spa/wellness) |
| Animação de logo em loop | Drama é raro, motion não é decoração |
| Cor sólida do wordmark em RGB diferente do brandbook | Apenas cocoa-900, champagne-200 ou gold-500 |
| Logo girando, flip 3D, parallax | Anti-quiet luxury |

---

## 9. Como gerar PNG/PDF a partir dos SVGs

```bash
# Inkscape (CLI)
inkscape keyra-primary.svg --export-type=png --export-dpi=300 -o keyra-primary@3x.png

# rsvg-convert (libRSVG)
rsvg-convert -w 1500 keyra-primary.svg -o keyra-primary-1500w.png

# Browser (manual)
1. Abrir o SVG no Chrome
2. F12 → Sources → salvar com fundo transparente via CSS
3. Print to PDF para vetor preservado
```

---

## 10. Próximos passos

| Tarefa | Owner |
|---|---|
| Refinamento artesanal do letterform K (curva orgânica do brandbook) | Designer humano (Sagi Haviv ou refinement local) |
| Versão monoline outline para uso premium foil | Designer humano + asset SVG novo |
| Aplicação em material físico (cartão de visita, embalagem) | Designer humano com print specs |
| Teste em 16×16 favicon real em diferentes browsers | QA visual |
| Conversão de `<text>` para `<path>` para versões "print-safe" | Designer humano via Illustrator |

---

_Brand Book de logo da KEYRA. Para qualquer aplicação visual, consultar este documento + `apps/web/src/components/brand/KeyraLogo.tsx` antes de produzir._
