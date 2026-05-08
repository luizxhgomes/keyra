# KEYRA · Logo Usage & Brand Book

> **Status:** Logo signature canônico ativo em produção · brand v1.1 (calibração proporcional do ponto).
> **Componente React:** `apps/web/src/components/brand/KeyraLogo.tsx`
> **Assets SVG:** `docs/brand/03-identity/logo/_assets/`
> **Atualizado em:** 7 de maio de 2026.

## 0. ⚠️ Regra inegociável · Calibração do ponto signature

O ponto dourado segue **proporção fixa em TODAS as variants**. Não alterar sem revisar este documento + o componente `<KeyraLogo />`.

| Eixo | Regra | Cálculo |
|---|---|---|
| **Posição vertical (cy)** | Centro do ponto na **baseline** da letra adjacente | `cy = y do <text>` (mesma baseline) |
| **Posição horizontal (cx)** | Gap proporcional ao font-size, equivalente ao letter-spacing natural | `cx = textEndX + (fontSize × 0.18)` |
| **Tamanho (raio)** | Proporcional ao stroke do terminal do "A"/"K" | `r = fontSize × 0.085` |
| **Cor** | `gold-500` `#B8923A` em qualquer theme | constante em todos os formatos |

### Tabela de valores calibrados

| Variant | font-size | text endX | gap (18%) | cx ponto | cy (baseline) | raio (8.5%) |
|---|---|---|---|---|---|---|
| Primary (240×80) | 72 | ~206 | ~13 | **219** | **62** | **6** |
| Monogram (64×64) | 56 | ~38 | ~10 | **48** | **52** | **5** |
| Lockup (320×140) | 92 | ~262 | ~17 | **279** | **80** | **8** |
| Stacked K (200×240) | 140 | ~145 | ~25 | **158** | **120** | **12** |

**Princípio:** o ponto NUNCA fica acima da baseline (não é altura média da letra). Sempre na linha onde os serifs descansam, à direita da última letra com gap proporcional.

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
