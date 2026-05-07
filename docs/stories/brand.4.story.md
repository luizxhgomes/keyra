# Story brand.4: Voice migration: copy-guidelines aplicado em toasts/empty/erros

## Status

Draft

## Story

Esta story é parte do **Epic BRAND-INTEGRATION** (`docs/stories/EPIC-BRAND-INTEGRATION.md`). Aplica o brandbook canônico KEYRA na infraestrutura `apps/web` em escopo bem definido para não regredir nem expandir além do necessário.

## Complexidade

**T-shirt:** M (~5pts)

## Dependencies

brand.1, brand.2

## Pré-leitura obrigatória

1. `docs/brand/03-identity/preview.html` (abrir no browser)
2. `docs/brand/03-identity/PREVIEW-REFERENCE.md` (mapa canônico)
3. `docs/brand/03-identity/DESIGN.md` §9.bis (Lei da Densidade Proporcional)
4. `docs/brand/03-identity/tokens.json` (single source of truth)
5. `docs/dev/rsc-boundary-rules.md` (4 regras inegociáveis)

## Acceptance Criteria

A definir formalmente em sessão de draft via `@sm *draft brand.4`. Esboço:

- AC1 — Toasts (sucesso, warn, error) reescritos nos 4 estados de voz (mentora, cúmplice, direta, editorial) conforme docs/ux/copy-guidelines.md + voice-tone.md
- AC2 — Empty states com microcopy mentora ("Você ainda não tem X. Cadastre Y para Z")
- AC3 — Mensagens de erro com formato: título humano + detalhe técnico em mono pequeno + recovery action
- AC4 — Eliminação de "amiga", "incrível", "show", "destravar", "estamos com você" do código
- AC5 — Greps zerados de copy técnica crua (status='paid', record updated, etc.)

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
