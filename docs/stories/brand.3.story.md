# Story brand.3: Components UI shadcn override com tokens KEYRA

## Status

Done · PR #14 squash mergeado em main (`ba3d396`) em 2026-05-07.

## Implementação executada (resumo)

10 componentes shadcn migrados para palette canônica KEYRA + motion tokens + warm shadows:

- **button.tsx**: motion tokens (`duration-fast` + `ease-out-soft`) + warm shadow (`shadow-warm-sm` + `hover:shadow-warm-md`) + `active:scale-[0.98]` (press feedback tátil) + variant `premium` adicionada (`bg-gold-500` + `hover:shadow-premium-glow`)
- **card.tsx**: `shadow-warm-sm` + transition motion + CardTitle ganha `font-serif` (Fraunces) + `tracking-tight`
- **input.tsx + textarea.tsx**: motion tokens + `hover:border-bronze-500` + `focus-visible:border-bronze-500` (calor crescente)
- **badge.tsx**: 3 variants novos: `success` (success-leaf/20 + success-deep), `warning` (amber-300/40 + cocoa-900), `premium` (gold-500 + cocoa-900)
- **checkbox.tsx**: motion + hover bronze-500
- **alert-dialog.tsx + sheet.tsx**: backdrop `bg-black/80` → `bg-cocoa-900/60` (warm overlay editorial); `shadow-lg` → `shadow-warm-lg`
- **dropdown-menu.tsx + select.tsx**: `shadow-md/lg` → `shadow-warm-md/lg`

**Validação técnica:** typecheck verde · lint zero warnings · build verde (38 rotas) · RSC Boundary Audit PASS · Cross-tenant PASS · Vercel SUCCESS.

---

## Story

Esta story é parte do **Epic BRAND-INTEGRATION** (`docs/stories/EPIC-BRAND-INTEGRATION.md`). Aplica o brandbook canônico KEYRA na infraestrutura `apps/web` em escopo bem definido para não regredir nem expandir além do necessário.

## Complexidade

**T-shirt:** M (~5pts)

## Dependencies

brand.1

## Pré-leitura obrigatória

1. `docs/brand/03-identity/preview.html` (abrir no browser)
2. `docs/brand/03-identity/PREVIEW-REFERENCE.md` (mapa canônico)
3. `docs/brand/03-identity/DESIGN.md` §9.bis (Lei da Densidade Proporcional)
4. `docs/brand/03-identity/tokens.json` (single source of truth)
5. `docs/dev/rsc-boundary-rules.md` (4 regras inegociáveis)

## Acceptance Criteria

A definir formalmente em sessão de draft via `@sm *draft brand.3`. Esboço:

- AC1 — Override de tokens shadcn em components/ui/* (button, card, input, badge, alert-dialog, dropdown-menu, select, sheet, textarea, checkbox, label) consumindo tokens KEYRA
- AC2 — Greps zerados de slate-*, blue-*, gray-* nesses arquivos
- AC3 — Smoke visual em Storybook ou playground (se existir) ou em rota dev
- AC4 — Touch targets ≥44px AA preservados
- AC5 — RSC boundary audit passa

## Definition of Done

- [ ] ACs implementadas
- [ ] Lint zero warnings, typecheck zero errors
- [ ] CodeRabbit zero CRITICAL/HIGH
- [ ] G5 RSC boundary audit passa
- [ ] Smoke test em mobile (rotas afetadas)
- [ ] Validação visual contra preview.html (lado a lado)
- [ ] PR aberto, revisado, mergeado por @devops
- [ ] STATE.md atualizado

## Change Log

| Data | Ação | Agente |
|------|------|--------|
| 2026-05-07 | Story criada como Draft pelo Orion (aiox-master) consolidando Epic BRAND-INTEGRATION | aiox-master |
