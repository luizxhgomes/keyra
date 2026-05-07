# Marca KEYRA — Mapa de Leitura

> **Status:** v1.0 — identidade visual base destilada em 2026-05-07.
> **Squad responsável:** [`squads/brand/`](../../squads/brand/) — 6 minds + Brand Chief.
> **Convenção:** todo conteúdo de identidade da KEYRA vive aqui. Pesquisas competitivas amplas seguem em [`docs/research/`](../research/) — esta pasta apenas aponta para elas.

---

## Sequência de construção (regra do squad brand)

```
1. Strategy → 2. Position → 3. Name → 4. Identity → 5. Activate
```

| Fase | Pasta | Status atual KEYRA |
|------|-------|--------------------|
| 1. Strategy | [`01-strategy/`](01-strategy/) | ⬜ A produzir — destilar de áudios + PRD |
| 2. Positioning | [`01-strategy/positioning-canvas.md`](01-strategy/) | ⬜ A produzir — Dunford canvas |
| 3. Naming | [`02-naming/`](02-naming/) | ✅ Nome decidido (KEYRA + `usekeyra.com`); rationale a documentar |
| 4. Identity | [`03-identity/`](03-identity/) | ✅ **v1.0 ENTREGUE** (cores, tipografia, motion, voz, brandbook). Logo pendente. |
| 5. Activate | [`04-activate/`](04-activate/) | ⬜ A produzir |

---

## ✅ O que está pronto na Fase 4 — Identity

### Documento mestre de referência

| Arquivo | Conteúdo |
|---------|----------|
| 🎯 [`03-identity/preview.html`](03-identity/preview.html) | **Brandbook vivo executável** — fonte visual canônica da marca. Toda produção visual KEYRA consulta antes de existir. |
| 📖 [`03-identity/PREVIEW-REFERENCE.md`](03-identity/PREVIEW-REFERENCE.md) | **Documento canônico de referência** — mapa do preview.html, catálogo de componentes, workflow de extensão. **Leitura obrigatória antes de produzir qualquer peça.** |

### Documentação técnica de apoio

| Arquivo | Conteúdo |
|---------|----------|
| [`03-identity/BRANDBOOK.md`](03-identity/BRANDBOOK.md) | **Brand book consolidado** — apresentação narrativa da marca |
| [`03-identity/DESIGN.md`](03-identity/DESIGN.md) | **Sistema técnico unificado** + Lei da Densidade Proporcional (§9.bis) |
| [`03-identity/tokens.json`](03-identity/tokens.json) | **DTCG tokens** — single source of truth (cores, fontes, spacing, radius, shadow, motion) |
| [`03-identity/colors-manual.md`](03-identity/colors-manual.md) | **Manual de cores e paletas completo** |
| [`03-identity/typography-system.md`](03-identity/typography-system.md) | Sistema tipográfico (Fraunces + Inter) |
| [`03-identity/voice-tone.md`](03-identity/voice-tone.md) | Voz e tom · 4 estados |
| [`03-identity/motion-system/`](03-identity/motion-system/) | **Motion System completo** (6 docs) |
| [`03-identity/motion-system/remotion-templates/`](03-identity/motion-system/remotion-templates/) | 4 templates Remotion para vídeo brand layer |
| [`03-identity/logo/README.md`](03-identity/logo/README.md) | Brief de logo para refinamento profissional |

### Fonte das decisões
12 referências visuais entregues pela idealizadora em 2026-05-07, destiladas em:
- [`references/inspirations/02-cultural-direction/editorial-beauty-luxury.md`](references/inspirations/02-cultural-direction/editorial-beauty-luxury.md) — DNA da direção visual
- [`references/inspirations/01-brands/`](references/inspirations/01-brands/) — análise de 3 logos referência (Kibana, Studio88-R, Peppermint)
- [`references/inspirations/_assets/`](references/inspirations/_assets/) — 12 imagens originais salvas

---

## Estrutura completa

```
docs/brand/
├── 00-INDEX.md                                ← você está aqui
├── 01-strategy/                               ← Fase 1 (a produzir)
│   └── README.md
├── 02-naming/                                 ← Fase 3 (KEYRA decidido)
│   └── README.md
├── 03-identity/                               ← Fase 4 (v1.0 ENTREGUE)
│   ├── README.md
│   ├── BRANDBOOK.md                          ← apresentação narrativa
│   ├── DESIGN.md                             ← mapa técnico unificado
│   ├── tokens.json                           ← DTCG source of truth
│   ├── colors-manual.md                      ← manual de cores completo
│   ├── typography-system.md                  ← Fraunces + Inter
│   ├── voice-tone.md                         ← 4 estados de voz
│   ├── logo/
│   │   └── README.md                         ← brief de design (aguarda @sagi-haviv)
│   └── motion-system/
│       ├── README.md
│       ├── motion-principles.md              ← 6 princípios
│       ├── motion-tokens.md                  ← durations, easings, distances
│       ├── motion-vocabulary.md              ← padrões nomeados
│       ├── micro-interactions.md             ← hovers, focus, toast, modal
│       ├── page-transitions.md               ← rotas no app
│       └── remotion-templates/
│           ├── README.md
│           ├── post-instagram-template.md    ← 1080×1350
│           ├── kpi-reveal-template.md        ← 1080×1920 Reels
│           ├── audiogram-template.md         ← depoimento
│           └── brand-intro-template.md       ← logo reveal 3-5s
├── 04-activate/                               ← Fase 5 (a produzir)
│   └── README.md
└── references/
    ├── competitors/
    │   └── INDEX.md                          ← aponta para docs/research/
    └── inspirations/
        ├── README.md
        ├── _assets/                          ← 12 imagens originais
        ├── 01-brands/
        │   ├── 01-kibana.md
        │   ├── 02-studio88-r-monogram.md
        │   └── 03-peppermint.md
        └── 02-cultural-direction/
            └── editorial-beauty-luxury.md   ← DNA destilado
```

---

## Como invocar o squad

| Comando | Quando usar |
|---------|-------------|
| `/brand:brand-chief` | Entrada principal — orquestra o fluxo |
| `*brand-from-zero` | Workflow completo de 5 fases |
| `*brand-audit` | Auditoria multi-dimensional |
| `/brand:marty-neumeier` | Diagnóstico estratégico (Fase 1) |
| `/brand:april-dunford` | Posicionamento (Fase 2) |
| `/brand:sagi-haviv` | Logo (Fase 4 — pendente) |
| `/brand:michael-johnson` | Sistema visual (Fase 4 — base v1.0 entregue) |
| `/brand:emily-heyward` | Movimento (Fase 5) |
| `Skill('remotion-animator')` | Gerar vídeo brand layer respeitando motion-system |

---

## Direção visual oficial — sumário

**Categoria:** Editorial Beauty Luxury / Quiet Luxury.

**Paleta-chave:**
- Neutros quentes: ivory, sand, mocha, bronze, cocoa
- CTA: terracotta (não azul)
- Acento precioso: gold-500 (raríssimo)
- **Zero** azul, rosa, turquesa, sage, lilás

**Tipografia:** Fraunces (serif editorial) + Inter (sans funcional).

**Motion:** calmaria com gravitas, default 320ms ease-out-soft, hover aquece.

**Voz:** mentora confiável (4 estados: mentora, cúmplice, direta, editorial).

**Persona-target:** Camila — empreendedora 30-45 anos dona de clínica de estética, não-financista, pt-BR direto.

---

## Próximas ações priorizadas

1. **Logo design** com `@sagi-haviv` consumindo [`03-identity/logo/README.md`](03-identity/logo/README.md)
2. **Brand strategy formal** com `@marty-neumeier` (Fase 1)
3. **Positioning canvas** com `@april-dunford` (Fase 2)
4. **Implementar tokens em `apps/web`** — story `@dev` consumindo [`DESIGN.md` §9](03-identity/DESIGN.md)
5. **Setup Remotion** em `apps/web/remotion/` para usar templates
6. **Movement architecture** com `@emily-heyward` (Fase 5)

---

_Última atualização: 2026-05-07 · v1.0 da identidade visual entregue._
