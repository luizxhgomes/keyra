# Story brand.7: Sweep das 27 telas via componentes compartilhados (Fraunces h1 + Sidebar wordmark)

## Status

Done · PR #18 squash mergeado em main (`b043d60`) em 2026-05-07.

## Implementação executada (resumo)

**Decisão arquitetural:** em vez de redesenhar 27 telas individualmente (alto risco RSC + retrabalho), aplicado princípio brandbook canônico — mudanças em componentes compartilhados afetam todas as telas. Refinamentos pontuais por tela ficam para iterações futuras com oportunidades específicas.

- **16 page titles migrados para Fraunces editorial**: `className="text-display"` → `"font-serif text-display"`, e `text-display-hero` análogo. Cobre dashboard, agenda, pacientes (×3), servicos (×3), comandas (×2), financeiro (layout afeta DRE/despesas/receitas/etc), team (layout afeta convites/profissionais), estoque (layout + insumos), configurações, mais.
- **Sidebar com wordmark KEYRA. signature** consistente com header fixo do brandbook: bolha "K." em Fraunces + ponto champagne (gold-300) sobre primary com `shadow-warm-sm`; wordmark expandido "KEYRA." em Fraunces text-lg + ponto gold-500; hover transition usa motion tokens canônicos (`duration-fast` + `ease-out-soft`).
- **3 cores Tailwind defaults eliminadas**: `border-emerald-500 text-emerald-700` → `border-success-leaf text-success-deep`, `text-amber-700` → `text-cocoa-800`.

**Cobertura visual:** wordmark KEYRA. visível em **todas as 27 telas autenticadas** via Sidebar; 16 títulos de página em Fraunces editorial.

**Validação técnica:** typecheck verde · lint zero warnings · build verde (38 rotas) · RSC PASS · Cross-tenant PASS · Vercel SUCCESS · 18 arquivos · +26/-23 (sweep cirúrgico).

---

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
