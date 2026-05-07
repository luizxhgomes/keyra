# Story brand.7: Telas autenticadas (27 rotas) com migração visual completa

## Status

Draft

## Story

Esta story é parte do **Epic BRAND-INTEGRATION** (`docs/stories/EPIC-BRAND-INTEGRATION.md`). Aplica o brandbook canônico KEYRA na infraestrutura `apps/web` em escopo bem definido para não regredir nem expandir além do necessário.

## Complexidade

**T-shirt:** XL (~13pts)

## Dependencies

brand.1-6

## Pré-leitura obrigatória

1. `docs/brand/03-identity/preview.html` (abrir no browser)
2. `docs/brand/03-identity/PREVIEW-REFERENCE.md` (mapa canônico)
3. `docs/brand/03-identity/DESIGN.md` §9.bis (Lei da Densidade Proporcional)
4. `docs/brand/03-identity/tokens.json` (single source of truth)
5. `docs/dev/rsc-boundary-rules.md` (4 regras inegociáveis)

## Acceptance Criteria

A definir formalmente em sessão de draft via `@sm *draft brand.7`. Esboço:

- AC1 — Layout (app)/layout.tsx atualizado com AppShell premium (sidebar 240px ivory-100 + topbar ivory-50 + bottomnav mobile)
- AC2 — Dashboard com KPIs em grid 2x2 ou 4x1 (Lei da Densidade), KPI Reveal narrativo em todas as métricas
- AC3 — Financeiro/* (10 rotas) com tabelas DRE em font-tabular, cores semânticas KEYRA
- AC4 — Pacientes/* com listagem em stagger, cards hover warm shadow
- AC5 — Servicos/*, Estoque/*, Team/*, Configuracoes/*, Mais/*, Comandas/*, Agenda/* todos passados pelo brandbook
- AC6 — Greps zerados de bg-white, text-slate-*, bg-blue-*, text-emerald-* em (app)/**
- AC7 — Smoke real em mobile com idealizadora cobrindo as 27 rotas (pode ser amostragem em 10 rotas-chave)
- AC8 — Esta story pode ser quebrada em sub-stories durante draft: 7.1 dashboard, 7.2 financeiro, 7.3 pacientes/servicos, 7.4 estoque/team, 7.5 configuracoes/mais

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
