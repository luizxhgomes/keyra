-- =============================================================================
-- KEYRA — Migration 023: views com security_invoker
-- Story 2.7 (concern C2) — @qa (Quinn) → @dev (Dex)
--
-- Purpose: endurecer o esquema impondo que todas as views de leitura rodem
--          com privilégios do INVOCADOR, não do owner. Isso faz a RLS das
--          tabelas-base se aplicar automaticamente em qualquer SELECT, mesmo
--          se a aplicação esquecer o filtro `org_id = current_org_id()`.
--
-- Contexto:
--   - Postgres 15+ suporta `ALTER VIEW ... SET (security_invoker = true)`.
--   - KEYRA roda Postgres 17 (sa-east-1).
--   - Antes desta migration, a defesa era camada única (filtro explícito na
--     Server Action). Agora é defesa em profundidade — RLS automática.
--
-- Traceability: ADR-013 (views como projeção), ADR-012 (RLS multi-tenant).
-- Concern de origem: docs/stories/2.7.story.md §QA Results §C2.
-- =============================================================================

ALTER VIEW public.v_receitas_previstas   SET (security_invoker = true);
ALTER VIEW public.v_dre_monthly          SET (security_invoker = true);
ALTER VIEW public.v_dre_by_service       SET (security_invoker = true);
ALTER VIEW public.v_dre_by_professional  SET (security_invoker = true);
ALTER VIEW public.v_cashflow_daily       SET (security_invoker = true);
ALTER VIEW public.v_dashboard_kpis       SET (security_invoker = true);

COMMENT ON VIEW public.v_receitas_previstas IS
  'KEYRA ADR-013 #5 / FR-AG-04: receita prevista by day/month. Re-evaluated on every read. security_invoker=true (migration 023): RLS de appointments aplicada automaticamente.';
