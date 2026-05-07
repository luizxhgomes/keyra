# Story brand.6: Auth flows + onboarding com novo visual brand layer

## Status

Draft

## Story

Esta story é parte do **Epic BRAND-INTEGRATION** (`docs/stories/EPIC-BRAND-INTEGRATION.md`). Aplica o brandbook canônico KEYRA na infraestrutura `apps/web` em escopo bem definido para não regredir nem expandir além do necessário.

## Complexidade

**T-shirt:** M (~5pts)

## Dependencies

brand.1, brand.2, brand.3, brand.4

## Pré-leitura obrigatória

1. `docs/brand/03-identity/preview.html` (abrir no browser)
2. `docs/brand/03-identity/PREVIEW-REFERENCE.md` (mapa canônico)
3. `docs/brand/03-identity/DESIGN.md` §9.bis (Lei da Densidade Proporcional)
4. `docs/brand/03-identity/tokens.json` (single source of truth)
5. `docs/dev/rsc-boundary-rules.md` (4 regras inegociáveis)

## Acceptance Criteria

A definir formalmente em sessão de draft via `@sm *draft brand.6`. Esboço:

- AC1 — /login com hero brand layer (Fraunces hero + ivory-50 bg + terracotta CTA)
- AC2 — /cadastro com mesmo padrão visual + 4 estados de voz nos erros
- AC3 — /esqueci-senha + /redefinir-senha + sucesso atualizados
- AC4 — /onboarding/nova-organizacao com narrativa "Cadeia Viva" reforçada na copy
- AC5 — Compliance gate (LGPD audit) por tocar formulários com dados pessoais
- AC6 — Smoke real em mobile com idealizadora antes de Done

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
