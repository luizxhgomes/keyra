# Fase 4 — Visual Identity

> **Status:** ✅ **v1.0 ENTREGUE em 2026-05-07.** Pendente apenas design do logo.
> **Owner:** `@michael-johnson` (sistema visual entregue) + `@sagi-haviv` (logo pendente).
> **Fonte:** 12 referências visuais entregues pela idealizadora.

---

## ✅ Entregáveis prontos

### 🎯 Referência canônica (sempre consultar primeiro)

| Arquivo | Conteúdo | Lê primeiro? |
|---------|----------|--------------|
| [`preview.html`](preview.html) | **Brandbook vivo executável** · fonte visual canônica da marca | ✅ Sim, abrir no browser |
| [`PREVIEW-REFERENCE.md`](PREVIEW-REFERENCE.md) | **Documento canônico** · mapa do preview, catálogo de componentes, workflow de extensão | ✅ Sim, leitura obrigatória |

### Documentação técnica de apoio

| Arquivo | Conteúdo | Quando consultar |
|---------|----------|------------------|
| [`BRANDBOOK.md`](BRANDBOOK.md) | Brand book consolidado · apresentação narrativa | Para parceiros e agências |
| [`DESIGN.md`](DESIGN.md) | Sistema técnico unificado + Lei da Densidade Proporcional | Para implementação |
| [`tokens.json`](tokens.json) | DTCG tokens · single source of truth | Para tooling |
| [`colors-manual.md`](colors-manual.md) | Manual de cores e paletas completo | Quando precisar de cor |
| [`typography-system.md`](typography-system.md) | Sistema tipográfico (Fraunces + Inter) | Quando precisar de fonte |
| [`voice-tone.md`](voice-tone.md) | Voz e tom · 4 estados | Quando escrever copy |
| [`motion-system/README.md`](motion-system/README.md) | Motion system completo (6 docs + 4 templates Remotion) | Quando precisar de animação |

---

## ⬜ Pendente

| Arquivo | Owner | Status |
|---------|-------|--------|
| [`logo/`](logo/) — design + assets SVG | `@sagi-haviv` | Brief pronto em [`logo/README.md`](logo/README.md), aguardando ativação |

---

## Estrutura

```
03-identity/
├── README.md                       ← você está aqui
├── BRANDBOOK.md                    ✅ apresentação narrativa
├── DESIGN.md                       ✅ mapa técnico
├── tokens.json                     ✅ DTCG
├── colors-manual.md                ✅
├── typography-system.md            ✅
├── voice-tone.md                   ✅
├── logo/
│   └── README.md                   ✅ brief; design ⬜
└── motion-system/
    ├── README.md                   ✅
    ├── motion-principles.md        ✅
    ├── motion-tokens.md            ✅
    ├── motion-vocabulary.md        ✅
    ├── micro-interactions.md       ✅
    ├── page-transitions.md         ✅
    └── remotion-templates/
        ├── README.md               ✅
        ├── post-instagram-template.md
        ├── kpi-reveal-template.md
        ├── audiogram-template.md
        └── brand-intro-template.md
```

---

## Como ativar próximas etapas

### Para fechar o logo
```
/brand:sagi-haviv
*logo-evaluation
```
Consumir o brief em [`logo/README.md`](logo/README.md).

### Para implementar tokens em `apps/web`
Criar story via `@sm` consumindo [`DESIGN.md` §9](DESIGN.md). Implementação por `@dev`.

### Para gerar primeiro vídeo brand
```
Skill('remotion-animator')
```
Consumir um dos 4 templates em [`motion-system/remotion-templates/`](motion-system/remotion-templates/).

---

## Validação cross-system

Toda peça/tela KEYRA passa pelo checklist em [`DESIGN.md` §10](DESIGN.md#10-validação-cross-system) antes de ser publicada. Resumo: tokens semânticos, sem azul/verde-neon, ouro ≤1x, Fraunces+Inter only, contraste WCAG AA, motion respeita `prefers-reduced-motion`.

---

_v1.0 entregue em 2026-05-07. Próxima revisão ao concluir design de logo._
