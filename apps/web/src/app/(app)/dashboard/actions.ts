'use server';

import { endOfDay, endOfMonth, format, startOfDay, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { requireAuth } from '@/lib/auth/require-auth';
import { AuthorizationError, requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function toError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof AuthorizationError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export type DashboardKpis = {
  /** Valores em centavos (integer) — formato esperado por KPICard. */
  revenueMtdCents: number;
  expectedRevenueMtdCents: number;
  expensesMtdCents: number;
  profitMtdCents: number;
  /** Mês passado (mesmo período-relativo) — base do comparativo. */
  revenueLastMonthCents: number;
  expensesLastMonthCents: number;
  profitLastMonthCents: number;
  /** Contador de atendimentos hoje. */
  appointmentsToday: number;
  /** Label do mês passado em pt-BR (ex: "março"). */
  lastMonthLabel: string;
};

const reaisToCents = (value: number | string | null | undefined): number => {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0);
  return Math.round(n * 100);
};

/**
 * Story 4.4 — KPIs do dashboard.
 *
 * Estratégia:
 * 1. View `v_dashboard_kpis` (já agrega current month em America/Sao_Paulo).
 * 2. Query simples de transactions do mês passado (mesmas colunas) para
 *    o comparativo textual (Story 4.7).
 * 3. Lucro = revenue − expenses (linha simplificada — DRE detalhada
 *    fica para Story 4.1).
 *
 * Tudo em centavos (integer) para casar com a API do `KPICard`.
 */
export async function getDashboardKpis(): Promise<ActionResult<DashboardKpis>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);
    const lastStart = lastMonthStart.toISOString().slice(0, 10);
    const lastEnd = lastMonthEnd.toISOString().slice(0, 10);

    const [kpisRes, lastMonthRevenueRes, lastMonthExpensesRes] = await Promise.all([
      supabase
        .from('v_dashboard_kpis')
        .select(
          'revenue_mtd, expected_revenue_mtd, expenses_mtd, appointments_today',
        )
        .eq('org_id', orgId)
        .maybeSingle(),
      supabase
        .from('transactions')
        .select('net_amount')
        .eq('org_id', orgId)
        .eq('direction', 'credit')
        .gte('reference_date', lastStart)
        .lte('reference_date', lastEnd)
        .is('deleted_at', null),
      supabase
        .from('transactions')
        .select('gross_amount')
        .eq('org_id', orgId)
        .eq('direction', 'debit')
        .gte('reference_date', lastStart)
        .lte('reference_date', lastEnd)
        .is('deleted_at', null),
    ]);

    if (kpisRes.error) return { ok: false, error: kpisRes.error.message };
    if (lastMonthRevenueRes.error)
      return { ok: false, error: lastMonthRevenueRes.error.message };
    if (lastMonthExpensesRes.error)
      return { ok: false, error: lastMonthExpensesRes.error.message };

    const k = kpisRes.data;
    const revenueMtdCents = reaisToCents(k?.revenue_mtd);
    const expectedRevenueMtdCents = reaisToCents(k?.expected_revenue_mtd);
    const expensesMtdCents = reaisToCents(k?.expenses_mtd);
    const profitMtdCents = revenueMtdCents - expensesMtdCents;

    const revenueLastMonthCents = (lastMonthRevenueRes.data ?? []).reduce(
      (acc, t) => acc + reaisToCents(t.net_amount),
      0,
    );
    const expensesLastMonthCents = (lastMonthExpensesRes.data ?? []).reduce(
      (acc, t) => acc + reaisToCents(t.gross_amount),
      0,
    );
    const profitLastMonthCents = revenueLastMonthCents - expensesLastMonthCents;

    return {
      ok: true,
      data: {
        revenueMtdCents,
        expectedRevenueMtdCents,
        expensesMtdCents,
        profitMtdCents,
        revenueLastMonthCents,
        expensesLastMonthCents,
        profitLastMonthCents,
        appointmentsToday: Number(k?.appointments_today ?? 0),
        lastMonthLabel: format(lastMonth, 'MMMM', { locale: ptBR }),
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 4.5 — Agenda do dia
// ---------------------------------------------------------------------------

export type AppointmentTodayRow = {
  id: string;
  starts_at: string;
  customer_name: string | null;
  service_name: string;
  professional_name: string;
  status: 'scheduled' | 'done' | 'cancelled' | 'no_show';
};

export async function getAppointmentsToday(): Promise<
  ActionResult<{ rows: AppointmentTodayRow[]; total: number; done: number; cancelled: number }>
> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const now = new Date();
    const dayStart = startOfDay(now).toISOString();
    const dayEnd = endOfDay(now).toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .select(
        `id, starts_at, status,
         customer:customers(full_name),
         service:services(name),
         professional:professionals(display_name)`,
      )
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .gte('starts_at', dayStart)
      .lte('starts_at', dayEnd)
      .order('starts_at', { ascending: true })
      .limit(10);

    if (error) return { ok: false, error: error.message };

    const rows: AppointmentTodayRow[] = (data ?? []).map((r) => {
      const c = r.customer as { full_name: string } | { full_name: string }[] | null;
      const s = r.service as { name: string } | { name: string }[] | null;
      const p = r.professional as { display_name: string } | { display_name: string }[] | null;
      const cust = Array.isArray(c) ? c[0] : c;
      const svc = Array.isArray(s) ? s[0] : s;
      const prof = Array.isArray(p) ? p[0] : p;
      return {
        id: r.id,
        starts_at: r.starts_at,
        customer_name: cust?.full_name ?? null,
        service_name: svc?.name ?? '—',
        professional_name: prof?.display_name ?? '—',
        status: r.status as AppointmentTodayRow['status'],
      };
    });

    let done = 0;
    let cancelled = 0;
    for (const r of rows) {
      if (r.status === 'done') done++;
      else if (r.status === 'cancelled' || r.status === 'no_show') cancelled++;
    }

    return { ok: true, data: { rows, total: rows.length, done, cancelled } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 4.6 — Indicadores
// ---------------------------------------------------------------------------

export type Indicators = {
  ticketMedioCents: number;
  ticketMedioLastMonthCents: number;
  topServiceByQuantity: { name: string; quantity: number } | null;
  topServiceByProfit: { name: string; profitCents: number } | null;
  attendanceRate: number;
  attendanceRateLastMonth: number;
  hasData: boolean;
};

export async function getIndicators(): Promise<ActionResult<Indicators>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
    const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');

    const [cmdsCurRes, cmdsLastRes, dreServiceCurRes, apptCurRes, apptLastRes] = await Promise.all([
      supabase
        .from('commands')
        .select('total')
        .eq('org_id', orgId)
        .eq('status', 'paid')
        .is('deleted_at', null)
        .gte('paid_at', monthStart),
      supabase
        .from('commands')
        .select('total')
        .eq('org_id', orgId)
        .eq('status', 'paid')
        .is('deleted_at', null)
        .gte('paid_at', lastMonthStart)
        .lte('paid_at', lastMonthEnd + 'T23:59:59'),
      supabase
        .from('v_dre_by_service')
        .select('service_name, total_quantity, gross_profit')
        .eq('org_id', orgId)
        .eq('period_month', monthStart),
      supabase
        .from('appointments')
        .select('status')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .gte('starts_at', monthStart + 'T00:00:00'),
      supabase
        .from('appointments')
        .select('status')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .gte('starts_at', lastMonthStart + 'T00:00:00')
        .lte('starts_at', lastMonthEnd + 'T23:59:59'),
    ]);

    if (cmdsCurRes.error) return { ok: false, error: cmdsCurRes.error.message };
    if (cmdsLastRes.error) return { ok: false, error: cmdsLastRes.error.message };
    if (dreServiceCurRes.error) return { ok: false, error: dreServiceCurRes.error.message };
    if (apptCurRes.error) return { ok: false, error: apptCurRes.error.message };
    if (apptLastRes.error) return { ok: false, error: apptLastRes.error.message };

    const ticketMedio = (arr: Array<{ total: number | null }>): number => {
      if (arr.length === 0) return 0;
      const sum = arr.reduce((a, c) => a + Number(c.total ?? 0), 0);
      return Math.round((sum / arr.length) * 100);
    };
    const ticketMedioCents = ticketMedio(cmdsCurRes.data ?? []);
    const ticketMedioLastMonthCents = ticketMedio(cmdsLastRes.data ?? []);

    const dreRows = dreServiceCurRes.data ?? [];
    const topByQty =
      dreRows.length === 0
        ? null
        : dreRows.reduce((m, c) =>
            Number(c.total_quantity ?? 0) > Number(m.total_quantity ?? 0) ? c : m,
          );
    const topByProfit =
      dreRows.length === 0
        ? null
        : dreRows.reduce((m, c) =>
            Number(c.gross_profit ?? 0) > Number(m.gross_profit ?? 0) ? c : m,
          );

    function computeAttendance(rows: Array<{ status: string }>): number {
      const total = rows.filter(
        (r) => r.status === 'done' || r.status === 'no_show' || r.status === 'cancelled',
      ).length;
      if (total === 0) return 0;
      const done = rows.filter((r) => r.status === 'done').length;
      return (done / total) * 100;
    }
    const attendanceRate = computeAttendance(apptCurRes.data ?? []);
    const attendanceRateLastMonth = computeAttendance(apptLastRes.data ?? []);

    return {
      ok: true,
      data: {
        ticketMedioCents,
        ticketMedioLastMonthCents,
        topServiceByQuantity: topByQty
          ? { name: topByQty.service_name ?? '(sem nome)', quantity: Number(topByQty.total_quantity ?? 0) }
          : null,
        topServiceByProfit: topByProfit
          ? {
              name: topByProfit.service_name ?? '(sem nome)',
              profitCents: Math.round(Number(topByProfit.gross_profit ?? 0) * 100),
            }
          : null,
        attendanceRate,
        attendanceRateLastMonth,
        hasData: (cmdsCurRes.data ?? []).length > 0 || (apptCurRes.data ?? []).length > 0,
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 4.9 — Alertas
// ---------------------------------------------------------------------------

export type Alert = {
  id: string;
  severity: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  href: string;
};

export async function getActiveAlerts(): Promise<ActionResult<Alert[]>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');

    const [dreCurRes, dreLastRes, apptRes, lowStockRes] = await Promise.all([
      supabase
        .from('v_dre_monthly')
        .select('revenue_net, net_profit')
        .eq('org_id', orgId)
        .eq('period_month', monthStart)
        .maybeSingle(),
      supabase
        .from('v_dre_monthly')
        .select('net_profit')
        .eq('org_id', orgId)
        .eq('period_month', lastMonthStart)
        .maybeSingle(),
      supabase
        .from('appointments')
        .select('status')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .gte('starts_at', monthStart + 'T00:00:00'),
      supabase
        .from('supplies')
        .select('id, current_stock, reorder_level')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('reorder_level', 'is', null),
    ]);

    if (dreCurRes.error) return { ok: false, error: dreCurRes.error.message };
    if (dreLastRes.error) return { ok: false, error: dreLastRes.error.message };
    if (apptRes.error) return { ok: false, error: apptRes.error.message };
    if (lowStockRes.error) return { ok: false, error: lowStockRes.error.message };

    const alerts: Alert[] = [];

    const profitCur = Number(dreCurRes.data?.net_profit ?? 0);
    const profitLast = Number(dreLastRes.data?.net_profit ?? 0);
    const revenueCur = Number(dreCurRes.data?.revenue_net ?? 0);

    if (profitLast > 0 && profitCur < profitLast * 0.8) {
      const dropPct = ((profitLast - profitCur) / profitLast) * 100;
      alerts.push({
        id: 'profit-drop',
        severity: dropPct > 20 ? 'critical' : 'warning',
        title: 'Queda de lucro',
        description: `Lucro do mês está ${dropPct.toFixed(0)}% abaixo do mês passado.`,
        href: '/financeiro/dre',
      });
    }

    if (revenueCur > 0 && profitCur / revenueCur < 0.15) {
      alerts.push({
        id: 'low-margin',
        severity: 'warning',
        title: 'Margem baixa',
        description: `Margem do mês está abaixo de 15% (${((profitCur / revenueCur) * 100).toFixed(1)}%).`,
        href: '/financeiro/dre-por-servico',
      });
    }

    const apptArr = apptRes.data ?? [];
    if (apptArr.length >= 5) {
      const negatives = apptArr.filter(
        (a) => a.status === 'no_show' || a.status === 'cancelled',
      ).length;
      const rate = negatives / apptArr.length;
      if (rate > 0.25) {
        alerts.push({
          id: 'high-noshow',
          severity: 'warning',
          title: 'Alta taxa de faltas',
          description: `${(rate * 100).toFixed(0)}% dos agendamentos do mês foram falta ou cancelamento.`,
          href: '/agenda',
        });
      }
    }

    const lowStock = (lowStockRes.data ?? []).filter(
      (s) => Number(s.current_stock ?? 0) <= Number(s.reorder_level ?? 0),
    );
    if (lowStock.length >= 3) {
      alerts.push({
        id: 'low-stock',
        severity: 'warning',
        title: 'Estoque baixo',
        description: `${lowStock.length} insumos abaixo do nível de recompra.`,
        href: '/estoque/insumos',
      });
    }

    return { ok: true, data: alerts };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}
