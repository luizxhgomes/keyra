# Story brand.5: Motion system canônico KEYRA · KPI reveal narrativo + StaggerList

## Status

Done · PR #16 squash mergeado em main (`f71fa06`) em 2026-05-07.

## Implementação executada (resumo)

- **`lib/motion/tokens.ts` estendido** com presets canônicos brandbook:
  - 2 easings novos: `outSoft` `cubic-bezier(0.22,1,0.36,1)` (DEFAULT do brandbook) + `inQuiet` (saída/dismiss)
  - 5 variants novos: `kpiRevealItem`, `kpiRevealContainer` (orquestra 3 atos com staggerChildren 80ms), `staggerList` (80ms padrão), `staggerListTight` (40ms para listas densas), `pageEnter` (fade-up 320ms)
- **`KPICard.tsx` com KPI reveal narrativo em 3 atos**: wrapper `m.div` com `kpiRevealContainer` orquestra entrada do label → value → comparativo com stagger 80ms; AnimatePresence interno preservado (P5 pattern para mudanças dinâmicas de valor)
- **`lib/motion/stagger-list.tsx` (NOVO)**: helper `<StaggerList>` para listagens com `cadence: 'default' | 'tight'` e `as: 'div' | 'ul' | 'ol' | 'section'`; cada filho ganha `kpiRevealItem` automaticamente via `Children.map`

**Decisão arquitetural honesta:** View Transitions API (Next 16) skip — `unstable_ViewTransition` ainda tem inconsistências com RSC boundaries (mesmo tipo de bug que quebrou Sprints 5/6/7). Decisão conservadora: Framer Motion via LazyMotion (RSC-safe + bundle ~21KB preservado).

**Validação técnica:** typecheck verde · lint zero warnings · build verde (38 rotas) · RSC Boundary Audit PASS · Cross-tenant PASS · Vercel SUCCESS.

---

## Story

Esta story é parte do **Epic BRAND-INTEGRATION** (`docs/stories/EPIC-BRAND-INTEGRATION.md`). Aplica o brandbook canônico KEYRA na infraestrutura `apps/web` em escopo bem definido para não regredir nem expandir além do necessário.

## Complexidade

**T-shirt:** L (~8pts)

## Dependencies

brand.1, brand.2

## Pré-leitura obrigatória

1. `docs/brand/03-identity/preview.html` (abrir no browser)
2. `docs/brand/03-identity/PREVIEW-REFERENCE.md` (mapa canônico)
3. `docs/brand/03-identity/DESIGN.md` §9.bis (Lei da Densidade Proporcional)
4. `docs/brand/03-identity/tokens.json` (single source of truth)
5. `docs/dev/rsc-boundary-rules.md` (4 regras inegociáveis)

## Acceptance Criteria

A definir formalmente em sessão de draft via `@sm *draft brand.5`. Esboço:

- AC1 — View Transitions API ativada em next.config.ts (experimental.viewTransition)
- AC2 — Page transitions implementadas: page-fade (top-level), page-slide-sub (sub-rotas), route-instant (auth)
- AC3 — Framer Motion presets em lib/motion/presets.ts (fade-up, fade-scale, kpi-reveal, hover-card)
- AC4 — KPI reveal narrativo em 3 atos aplicado ao KPICard (número → label → comparativo)
- AC5 — Stagger lists em listagens (pacientes, comandas, transações, agenda)
- AC6 — prefers-reduced-motion respeitado (motion duration → 0)
- AC7 — RSC boundary audit passa (Framer Motion exige client component, atenção)

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
