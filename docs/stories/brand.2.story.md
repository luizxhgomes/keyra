# Story brand.2: Components/keyra migrados (KPI, AlertCard, EmptyState, Skeleton, ComparativoTexto, StatusBadge, ErrorMessage)

## Status

Draft

## Story

Esta story é parte do **Epic BRAND-INTEGRATION** (`docs/stories/EPIC-BRAND-INTEGRATION.md`). Migra os componentes-base do produto KEYRA em `apps/web/src/components/keyra/*` para consumirem os tokens canônicos da brand identity (palette KEYRA, container queries, motion tokens, voz mentora).

## Complexidade

**T-shirt:** L (~8pts · 1.5 sprints)

## Dependencies

brand.1 (foundation) — bloqueante. Tokens precisam estar ativos no `tailwind.config.ts` e CSS vars no `globals.css`.

## Pré-leitura obrigatória

1. `docs/brand/03-identity/preview.html` (abrir no browser, focar nas seções 02 Logo, 04 Tipografia, 05 Componentes)
2. `docs/brand/03-identity/PREVIEW-REFERENCE.md` §4.4 (catálogo de componentes do produto)
3. `docs/brand/03-identity/colors-manual.md` §4 (semantic mapping product layer)
4. `docs/brand/03-identity/typography-system.md` §2.2 (escala product layer)
5. `docs/brand/03-identity/motion-system/micro-interactions.md` (estados por componente)

## Acceptance Criteria

### AC1 — KPICard
- Container queries `container-type: inline-size` no card
- `font-size: clamp(28px, 13cqi, 44px)` no value
- `font-feature-settings: "tnum"` ativo
- Reveal narrativo em 3 atos (número → label → comparativo) com stagger 80ms
- Hover: shadow warm-md → warm-lg + translateY(-1px)
- Cores: cocoa-900 no value, bronze-500 no label, success-leaf/rust-800 no delta
- Estados: default, loading (skeleton), error
- A label sempre uppercase tracking 0.08em, cor bronze-500

### AC2 — AlertCard
- 3 variants semânticas: success-leaf, amber-500 (warning), rust-800 (destructive)
- Border-left 4px na cor semântica + ícone na cor + título cocoa-900 + body bronze-500
- Estados de voz aplicados (cúmplice no success, direta no warn/destructive)

### AC3 — EmptyState
- Ícone outline 24px em círculo bg ivory-100 com cor bronze-500
- Título Fraunces 500 24px cocoa-900
- Body Inter 15px bronze-500
- CTA terracotta-600
- Voz mentora calorosa: "Você ainda não tem X. Cadastre Y para Z" (sem "use o botão acima")

### AC4 — Skeleton
- Animação shimmer warm: gradient sand-200 → ivory-100 → sand-200, 1.4s linear infinite
- prefers-reduced-motion: animação desabilitada, fundo ivory-100 estático
- Variants: text, card, kpi

### AC5 — ComparativoTexto
- Fraunces 300 italic 15-16px
- success-leaf para positivo, rust-800 para negativo
- Formato canônico: "R$ 2.300 a mais que abril" (mentora confiável)

### AC6 — StatusBadge
- Pills com radius full
- Inter 600 12px tracking 0.04em uppercase
- Variants semânticas KEYRA (paid/done/cancelled/no_show traduzidos para "paga", "concluído", "cancelado", "falta")

### AC7 — ErrorMessage
- Container border destructive
- Título humano cocoa-900
- Detalhe técnico em mono pequeno bronze-400
- Recovery CTA quando aplicável

### AC8 — Greps zerados
- Zero `text-slate-*` em components/keyra/*
- Zero `bg-blue-*` em components/keyra/*
- Zero `text-emerald-*` em components/keyra/*
- Zero `text-red-500` (usar destructive token)
- Zero hex inline (tudo via tokens)

### AC9 — RSC boundary audit passa
- `./scripts/check-rsc-boundaries.sh` retorna PASS

### AC10 — Smoke real em mobile
Idealizadora valida em iPhone real os componentes em rotas que os usam (Dashboard, listagens, modais).

## Definition of Done

- [ ] Todos os AC1-AC10 verdes
- [ ] Lint zero warnings, typecheck zero errors
- [ ] CodeRabbit zero CRITICAL/HIGH
- [ ] Validação visual contra preview.html §05 Componentes (lado a lado)
- [ ] PR aberto, revisado, mergeado por @devops
- [ ] STATE.md atualizado

## Change Log

| Data | Ação | Agente |
|------|------|--------|
| 2026-05-07 | Story criada como Draft pelo Orion (aiox-master) consolidando Epic BRAND-INTEGRATION | aiox-master |
