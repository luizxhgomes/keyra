'use server';

import { revalidatePath } from 'next/cache';
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import { AuthorizationError, requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import { txFiltersSchema, type TransactionFilters } from '@/lib/validators/financeiro';
import { expenseIdSchema, expenseSchema, type ExpenseInput } from '@/lib/validators/expense';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof AuthorizationError) return err.message;
  if (err instanceof z.ZodError) return err.issues.map((i) => i.message).join(' · ');
  if (err instanceof Error) return err.message;
  return fallback;
}

// ---------------------------------------------------------------------------
// Story 3.3 — Transações (visualização)
// ---------------------------------------------------------------------------

export type TransactionDirection = 'credit' | 'debit';

export type TransactionRow = {
  id: string;
  direction: TransactionDirection;
  description: string | null;
  reference_date: string;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  category_name: string | null;
  professional_name: string | null;
  account_name: string;
  origin: string;
  source_type: string | null;
  source_id: string | null;
  is_fixed: boolean;
  settled_at: string | null;
};

const PAGE_SIZE = 50;

export async function listTransactions(
  input: TransactionFilters,
): Promise<
  ActionResult<{
    rows: TransactionRow[];
    total: number;
    totalCredit: number;
    totalDebit: number;
    page: number;
    pageSize: number;
  }>
> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const parsed = txFiltersSchema.parse(input);
    const supabase = await createServerClient();

    const page = parsed.page ?? 1;
    const offset = (page - 1) * PAGE_SIZE;

    let q = supabase
      .from('transactions')
      .select(
        `id, direction, description, reference_date, gross_amount, fee_amount, net_amount,
         origin, source_type, source_id, is_fixed, settled_at,
         category:expense_categories(name),
         professional:professionals(display_name),
         account:accounts(name)`,
        { count: 'exact' },
      )
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('reference_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (parsed.start) q = q.gte('reference_date', parsed.start);
    if (parsed.end) q = q.lte('reference_date', parsed.end);
    if (parsed.direction && parsed.direction !== 'all') {
      q = q.eq('direction', parsed.direction);
    }
    if (parsed.categoryId) q = q.eq('expense_category_id', parsed.categoryId);
    if (parsed.professionalId) q = q.eq('professional_id', parsed.professionalId);
    if (parsed.accountId) q = q.eq('account_id', parsed.accountId);

    const { data, error, count } = await q.range(offset, offset + PAGE_SIZE - 1);
    if (error) return { ok: false, error: error.message };

    const rows: TransactionRow[] = (data ?? []).map((r) => {
      const c = r.category as { name: string } | { name: string }[] | null;
      const p = r.professional as { display_name: string } | { display_name: string }[] | null;
      const a = r.account as { name: string } | { name: string }[] | null;
      const cat = Array.isArray(c) ? c[0] : c;
      const prof = Array.isArray(p) ? p[0] : p;
      const acc = Array.isArray(a) ? a[0] : a;
      return {
        id: r.id,
        direction: r.direction as TransactionDirection,
        description: r.description,
        reference_date: r.reference_date,
        gross_amount: Number(r.gross_amount),
        fee_amount: Number(r.fee_amount),
        net_amount: Number(r.net_amount),
        category_name: cat?.name ?? null,
        professional_name: prof?.display_name ?? null,
        account_name: acc?.name ?? '—',
        origin: r.origin,
        source_type: r.source_type,
        source_id: r.source_id,
        is_fixed: r.is_fixed,
        settled_at: r.settled_at,
      };
    });

    // Totais do período (não da página) — query agregada paralela.
    const totals = await supabase
      .from('transactions')
      .select('direction, net_amount')
      .eq('org_id', orgId)
      .is('deleted_at', null);
    let totalCredit = 0;
    let totalDebit = 0;
    if (!totals.error) {
      for (const t of totals.data ?? []) {
        const v = Number(t.net_amount);
        if (t.direction === 'credit') totalCredit += v;
        else totalDebit += v;
      }
    }

    return {
      ok: true,
      data: {
        rows,
        total: count ?? 0,
        totalCredit,
        totalDebit,
        page,
        pageSize: PAGE_SIZE,
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export type FilterPickers = {
  categories: Array<{ id: string; name: string; kind: string }>;
  professionals: Array<{ id: string; display_name: string }>;
  accounts: Array<{ id: string; name: string }>;
};

export async function listFilterPickers(): Promise<ActionResult<FilterPickers>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const [catRes, profRes, accRes] = await Promise.all([
      supabase
        .from('expense_categories')
        .select('id, name, kind')
        .eq('org_id', orgId)
        .eq('active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      supabase
        .from('professionals')
        .select('id, display_name')
        .eq('org_id', orgId)
        .eq('active', true)
        .is('deleted_at', null)
        .order('display_name', { ascending: true }),
      supabase
        .from('accounts')
        .select('id, name')
        .eq('org_id', orgId)
        .eq('active', true)
        .is('deleted_at', null)
        .order('name', { ascending: true }),
    ]);

    if (catRes.error) return { ok: false, error: catRes.error.message };
    if (profRes.error) return { ok: false, error: profRes.error.message };
    if (accRes.error) return { ok: false, error: accRes.error.message };

    return {
      ok: true,
      data: {
        categories: (catRes.data ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          kind: c.kind,
        })),
        professionals: (profRes.data ?? []).map((p) => ({
          id: p.id,
          display_name: p.display_name,
        })),
        accounts: (accRes.data ?? []).map((a) => ({ id: a.id, name: a.name })),
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 3.4 — Receitas por profissional
// ---------------------------------------------------------------------------

export type RevenueByProfessional = {
  professional_id: string;
  professional_name: string;
  cost_center: string | null;
  total_gross: number;
  total_net: number;
  count: number;
};

export type RevenueByCostCenter = {
  cost_center: string;
  total_gross: number;
  total_net: number;
  count: number;
};

export async function getRevenueByProfessional(input: {
  start?: string;
  end?: string;
}): Promise<
  ActionResult<{ byProfessional: RevenueByProfessional[]; byCostCenter: RevenueByCostCenter[] }>
> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    let q = supabase
      .from('transactions')
      .select(
        `gross_amount, net_amount, professional_id,
         professional:professionals(display_name, cost_center)`,
      )
      .eq('org_id', orgId)
      .eq('direction', 'credit')
      .is('deleted_at', null);

    if (input.start) q = q.gte('reference_date', input.start);
    if (input.end) q = q.lte('reference_date', input.end);

    const { data, error } = await q;
    if (error) return { ok: false, error: error.message };

    // Agrupamento em TS — filtros simples; cap de transações por org não passa
    // de algumas centenas por mês no MVP.
    const profMap = new Map<string, RevenueByProfessional>();
    const ccMap = new Map<string, RevenueByCostCenter>();

    for (const r of data ?? []) {
      if (!r.professional_id) continue;
      const p = r.professional as
        | { display_name: string; cost_center: string | null }
        | { display_name: string; cost_center: string | null }[]
        | null;
      const prof = Array.isArray(p) ? p[0] : p;
      if (!prof) continue;

      const gross = Number(r.gross_amount);
      const net = Number(r.net_amount);

      const existing = profMap.get(r.professional_id) ?? {
        professional_id: r.professional_id,
        professional_name: prof.display_name,
        cost_center: prof.cost_center,
        total_gross: 0,
        total_net: 0,
        count: 0,
      };
      existing.total_gross += gross;
      existing.total_net += net;
      existing.count += 1;
      profMap.set(r.professional_id, existing);

      const ccKey = prof.cost_center ?? 'Sem centro de custo';
      const ccExisting = ccMap.get(ccKey) ?? {
        cost_center: ccKey,
        total_gross: 0,
        total_net: 0,
        count: 0,
      };
      ccExisting.total_gross += gross;
      ccExisting.total_net += net;
      ccExisting.count += 1;
      ccMap.set(ccKey, ccExisting);
    }

    return {
      ok: true,
      data: {
        byProfessional: Array.from(profMap.values()).sort(
          (a, b) => b.total_net - a.total_net,
        ),
        byCostCenter: Array.from(ccMap.values()).sort(
          (a, b) => b.total_net - a.total_net,
        ),
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 3.7 — Fluxo de caixa
// ---------------------------------------------------------------------------

export type CashflowDay = {
  day: string;
  inflow: number;
  outflow: number;
  net: number;
};

export async function getCashflow(input: {
  start: string;
  end: string;
}): Promise<
  ActionResult<{
    days: CashflowDay[];
    currentBalance: number;
    inflowTotal: number;
    outflowTotal: number;
    projectedReceipts: number;
  }>
> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const [dailyRes, balanceRes, projRes] = await Promise.all([
      supabase
        .from('v_cashflow_daily')
        .select('day, inflows, outflows, net')
        .eq('org_id', orgId)
        .gte('day', input.start)
        .lte('day', input.end)
        .order('day', { ascending: true }),
      supabase
        .from('transactions')
        .select('direction, net_amount')
        .eq('org_id', orgId)
        .is('deleted_at', null),
      supabase
        .from('v_receitas_previstas')
        .select('expected_revenue')
        .eq('org_id', orgId)
        .gte('day', input.start)
        .lte('day', input.end),
    ]);

    if (dailyRes.error) return { ok: false, error: dailyRes.error.message };

    const days: CashflowDay[] = (dailyRes.data ?? []).map((d) => ({
      day: d.day as string,
      inflow: Number(d.inflows ?? 0),
      outflow: Number(d.outflows ?? 0),
      net: Number(d.net ?? 0),
    }));

    let currentBalance = 0;
    if (!balanceRes.error) {
      for (const t of balanceRes.data ?? []) {
        const v = Number(t.net_amount);
        currentBalance += t.direction === 'credit' ? v : -v;
      }
    }

    const inflowTotal = days.reduce((a, d) => a + d.inflow, 0);
    const outflowTotal = days.reduce((a, d) => a + d.outflow, 0);

    let projectedReceipts = 0;
    if (!projRes.error) {
      for (const r of projRes.data ?? []) {
        projectedReceipts += Number(r.expected_revenue ?? 0);
      }
    }

    return {
      ok: true,
      data: {
        days,
        currentBalance,
        inflowTotal,
        outflowTotal,
        projectedReceipts,
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// Helper: período padrão para filtros do financeiro (mês corrente).
export async function getDefaultPeriod(): Promise<{ start: string; end: string }> {
  const now = new Date();
  return {
    start: startOfMonth(now).toISOString().slice(0, 10),
    end: endOfMonth(now).toISOString().slice(0, 10),
  };
}

// Helper: período "últimos 30 dias" do hoje, para fluxo de caixa.
export async function getLast30DaysPeriod(): Promise<{ start: string; end: string }> {
  const now = new Date();
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    start: start.toISOString().slice(0, 10),
    end: now.toISOString().slice(0, 10),
  };
}

// ---------------------------------------------------------------------------
// Story 3.5 — Despesas (CRUD)
// ---------------------------------------------------------------------------

export type ExpenseRow = {
  id: string;
  description: string | null;
  reference_date: string;
  gross_amount: number;
  category_name: string | null;
  category_kind: string | null;
  category_is_fixed: boolean;
  supplier_name: string | null;
  account_name: string;
  is_fixed: boolean;
  deleted_at: string | null;
};

export async function listExpenses(input: {
  start?: string;
  end?: string;
  categoryId?: string;
  showArchived?: boolean;
  page?: number;
}): Promise<ActionResult<{ rows: ExpenseRow[]; total: number; page: number; pageSize: number; totalNet: number }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');
    const supabase = await createServerClient();
    const page = Math.max(1, input.page ?? 1);
    const PAGE = 20;
    const offset = (page - 1) * PAGE;

    let q = supabase
      .from('transactions')
      .select(
        `id, description, reference_date, gross_amount, is_fixed, deleted_at,
         supplier:expense_categories!transactions_expense_category_id_fkey(name, kind),
         account:accounts(name)`,
        { count: 'exact' },
      )
      .eq('org_id', orgId)
      .eq('direction', 'debit')
      .order('reference_date', { ascending: false });

    if (!input.showArchived) {
      q = q.is('deleted_at', null);
    }
    if (input.start) q = q.gte('reference_date', input.start);
    if (input.end) q = q.lte('reference_date', input.end);
    if (input.categoryId) q = q.eq('expense_category_id', input.categoryId);

    const { data, error, count } = await q.range(offset, offset + PAGE - 1);
    if (error) return { ok: false, error: error.message };

    const rows: ExpenseRow[] = (data ?? []).map((r) => {
      const cat = r.supplier as
        | { name: string; kind: string }
        | { name: string; kind: string }[]
        | null;
      const c = Array.isArray(cat) ? cat[0] : cat;
      const acc = r.account as { name: string } | { name: string }[] | null;
      const a = Array.isArray(acc) ? acc[0] : acc;
      return {
        id: r.id,
        description: r.description,
        reference_date: r.reference_date,
        gross_amount: Number(r.gross_amount),
        category_name: c?.name ?? null,
        category_kind: c?.kind ?? null,
        category_is_fixed: c?.kind === 'fixed_cost',
        supplier_name: null,
        account_name: a?.name ?? '—',
        is_fixed: r.is_fixed,
        deleted_at: r.deleted_at,
      };
    });

    let totalNet = 0;
    for (const r of rows) totalNet += r.gross_amount;

    return {
      ok: true,
      data: { rows, total: count ?? 0, page, pageSize: PAGE, totalNet },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function getExpense(id: string): Promise<ActionResult<ExpenseInput & { id: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');
    const parsed = expenseIdSchema.parse({ id });
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('transactions')
      .select(
        'id, gross_amount, expense_category_id, description, reference_date, account_id, is_fixed',
      )
      .eq('id', parsed.id)
      .eq('org_id', orgId)
      .eq('direction', 'debit')
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: 'Despesa não encontrada.' };

    return {
      ok: true,
      data: {
        id: data.id,
        grossAmount: Number(data.gross_amount),
        expenseCategoryId: data.expense_category_id ?? '',
        description: data.description ?? '',
        referenceDate: data.reference_date,
        accountId: data.account_id,
        isFixed: data.is_fixed,
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function upsertExpense(
  input: ExpenseInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const parsed = expenseSchema.parse(input);
    const supabase = await createServerClient();

    // Confirma categoria existe e tem kind='expense' / 'variable_cost' / 'fixed_cost' / 'operating_expense' / 'tax'.
    const { data: cat, error: catErr } = await supabase
      .from('expense_categories')
      .select('kind')
      .eq('id', parsed.expenseCategoryId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();
    if (catErr) return { ok: false, error: catErr.message };
    if (!cat) return { ok: false, error: 'Categoria não encontrada.' };
    if (cat.kind === 'revenue') {
      return { ok: false, error: 'Categoria de receita não pode ser usada em despesa.' };
    }

    // is_fixed: usa do form ou inferido pela categoria (kind='fixed_cost')
    const isFixed = parsed.isFixed ?? cat.kind === 'fixed_cost';

    // Composição de description: se há fornecedor/notas, anexa para preservar
    // contexto. Tabela transactions não tem coluna `notes` separada — vai
    // tudo em `description`.
    const descriptionParts = [parsed.description];
    if (parsed.supplierName) descriptionParts.push(`Fornecedor: ${parsed.supplierName}`);
    if (parsed.notes) descriptionParts.push(parsed.notes);

    const payload = {
      org_id: orgId,
      direction: 'debit' as const,
      gross_amount: parsed.grossAmount,
      fee_amount: 0,
      net_amount: parsed.grossAmount,
      expense_category_id: parsed.expenseCategoryId,
      description: descriptionParts.join(' · '),
      reference_date: parsed.referenceDate,
      account_id: parsed.accountId,
      origin: 'manual_expense' as const,
      is_fixed: isFixed,
    };

    if (parsed.id) {
      const { error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', parsed.id)
        .eq('org_id', orgId);
      if (error) return { ok: false, error: error.message };
      revalidatePath('/financeiro');
      return { ok: true, data: { id: parsed.id } };
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...payload, created_by: user.id })
      .select('id')
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Falha ao criar despesa.' };
    }
    revalidatePath('/financeiro');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function archiveExpense(id: string): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const parsed = expenseIdSchema.parse({ id });
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', parsed.id)
      .eq('org_id', orgId)
      .eq('direction', 'debit');
    if (error) return { ok: false, error: error.message };
    revalidatePath('/financeiro');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function unarchiveExpense(id: string): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const parsed = expenseIdSchema.parse({ id });
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: null })
      .eq('id', parsed.id)
      .eq('org_id', orgId)
      .eq('direction', 'debit');
    if (error) return { ok: false, error: error.message };
    revalidatePath('/financeiro');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function listExpenseCategoriesForPicker(): Promise<
  ActionResult<Array<{ id: string; name: string; kind: string }>>
> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('expense_categories')
      .select('id, name, kind')
      .eq('org_id', orgId)
      .eq('active', true)
      .is('deleted_at', null)
      .neq('kind', 'revenue')
      .order('sort_order', { ascending: true });

    if (error) return { ok: false, error: error.message };
    return {
      ok: true,
      data: (data ?? []).map((c) => ({ id: c.id, name: c.name, kind: c.kind })),
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 3.6 — Custos Fixos
// ---------------------------------------------------------------------------

export async function cloneFixedCostsFromLastMonth(): Promise<
  ActionResult<{ created: number; skipped: number }>
> {
  try {
    const { user, orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const supabase = await createServerClient();

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonth = subMonths(now, 1);
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);

    // Busca despesas fixas do mês passado.
    const { data: lastMonthExpenses, error: e1 } = await supabase
      .from('transactions')
      .select('gross_amount, expense_category_id, description, account_id, is_fixed')
      .eq('org_id', orgId)
      .eq('direction', 'debit')
      .eq('is_fixed', true)
      .is('deleted_at', null)
      .gte('reference_date', lastMonthStart.toISOString().slice(0, 10))
      .lte('reference_date', lastMonthEnd.toISOString().slice(0, 10));
    if (e1) return { ok: false, error: e1.message };
    if (!lastMonthExpenses || lastMonthExpenses.length === 0) {
      return { ok: true, data: { created: 0, skipped: 0 } };
    }

    // Busca despesas fixas já lançadas no mês corrente para evitar duplicar.
    const { data: alreadyDone, error: e2 } = await supabase
      .from('transactions')
      .select('description, expense_category_id')
      .eq('org_id', orgId)
      .eq('direction', 'debit')
      .eq('is_fixed', true)
      .is('deleted_at', null)
      .gte('reference_date', currentMonthStart.toISOString().slice(0, 10))
      .lte('reference_date', currentMonthEnd.toISOString().slice(0, 10));
    if (e2) return { ok: false, error: e2.message };

    const existing = new Set(
      (alreadyDone ?? []).map((r) => `${r.expense_category_id}:${r.description}`),
    );

    const today = now.toISOString().slice(0, 10);
    const toInsert = lastMonthExpenses
      .filter((r) => !existing.has(`${r.expense_category_id}:${r.description}`))
      .map((r) => ({
        org_id: orgId,
        direction: 'debit' as const,
        gross_amount: r.gross_amount,
        fee_amount: 0,
        net_amount: r.gross_amount,
        expense_category_id: r.expense_category_id,
        description: r.description,
        reference_date: today,
        account_id: r.account_id,
        origin: 'manual_expense' as const,
        is_fixed: true,
        created_by: user.id,
      }));

    let created = 0;
    if (toInsert.length > 0) {
      const { error: e3 } = await supabase.from('transactions').insert(toInsert);
      if (e3) return { ok: false, error: e3.message };
      created = toInsert.length;
    }

    revalidatePath('/financeiro');
    return {
      ok: true,
      data: {
        created,
        skipped: (lastMonthExpenses?.length ?? 0) - created,
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 4.1 — DRE básica mensal
// ---------------------------------------------------------------------------

export type DreLine = {
  label: string;
  amount: number;
  amountLastMonth: number;
  /** % sobre receita do mês (calculado em TS para evitar 0/0 SQL). */
  percentOfRevenue: number;
};

export type DreMonthly = {
  period: string;
  periodLabel: string;
  lines: {
    revenueGross: DreLine;
    acquirerFees: DreLine;
    revenueNet: DreLine;
    variableCosts: DreLine;
    commissions: DreLine;
    fixedCosts: DreLine;
    operatingExpenses: DreLine;
    taxes: DreLine;
    netProfit: DreLine;
  };
};

export async function getDreMonthly(input: {
  /** Mês de referência no formato YYYY-MM-01. Default: mês corrente. */
  periodMonth?: string;
}): Promise<ActionResult<DreMonthly>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const now = new Date();
    const currentMonth =
      input.periodMonth ?? format(startOfMonth(now), 'yyyy-MM-dd');
    const lastMonth = format(startOfMonth(subMonths(new Date(currentMonth), 1)), 'yyyy-MM-dd');

    const [currentRes, lastRes] = await Promise.all([
      supabase
        .from('v_dre_monthly')
        .select(
          'period_month, revenue_gross, acquirer_fees, revenue_net, variable_costs_manual, commissions, fixed_costs, operating_expenses, taxes, net_profit',
        )
        .eq('org_id', orgId)
        .eq('period_month', currentMonth)
        .maybeSingle(),
      supabase
        .from('v_dre_monthly')
        .select(
          'period_month, revenue_gross, acquirer_fees, revenue_net, variable_costs_manual, commissions, fixed_costs, operating_expenses, taxes, net_profit',
        )
        .eq('org_id', orgId)
        .eq('period_month', lastMonth)
        .maybeSingle(),
    ]);

    if (currentRes.error) return { ok: false, error: currentRes.error.message };
    if (lastRes.error) return { ok: false, error: lastRes.error.message };

    const cur = currentRes.data;
    const last = lastRes.data;

    const num = (v: number | string | null | undefined): number =>
      v === null || v === undefined ? 0 : Number(v);

    const revenueGrossNow = num(cur?.revenue_gross);
    const buildLine = (
      label: string,
      curVal: number,
      lastVal: number,
    ): DreLine => ({
      label,
      amount: curVal,
      amountLastMonth: lastVal,
      percentOfRevenue:
        revenueGrossNow > 0 ? (curVal / revenueGrossNow) * 100 : 0,
    });

    return {
      ok: true,
      data: {
        period: currentMonth,
        periodLabel: format(new Date(currentMonth), "MMMM 'de' yyyy", {
          locale: ptBR,
        }),
        lines: {
          revenueGross: buildLine(
            'Receita Bruta',
            revenueGrossNow,
            num(last?.revenue_gross),
          ),
          acquirerFees: buildLine(
            '(−) Taxas de cartão/Pix',
            num(cur?.acquirer_fees),
            num(last?.acquirer_fees),
          ),
          revenueNet: buildLine(
            '= Receita Líquida',
            num(cur?.revenue_net),
            num(last?.revenue_net),
          ),
          variableCosts: buildLine(
            '(−) Custos Variáveis',
            num(cur?.variable_costs_manual),
            num(last?.variable_costs_manual),
          ),
          commissions: buildLine(
            '(−) Comissões',
            num(cur?.commissions),
            num(last?.commissions),
          ),
          fixedCosts: buildLine(
            '(−) Custos Fixos',
            num(cur?.fixed_costs),
            num(last?.fixed_costs),
          ),
          operatingExpenses: buildLine(
            '(−) Despesas Operacionais',
            num(cur?.operating_expenses),
            num(last?.operating_expenses),
          ),
          taxes: buildLine(
            '(−) Impostos',
            num(cur?.taxes),
            num(last?.taxes),
          ),
          netProfit: buildLine(
            '= Lucro Líquido',
            num(cur?.net_profit),
            num(last?.net_profit),
          ),
        },
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 4.2 — DRE por serviço (DIFERENCIAL vs Conta Azul)
// ---------------------------------------------------------------------------

export type DreByServiceRow = {
  service_id: string;
  service_name: string;
  service_type: 'service' | 'product';
  items_count: number;
  total_quantity: number;
  revenue_gross: number;
  variable_cost: number;
  commissions: number;
  discounts: number;
  gross_profit: number;
  /** Margem = lucro / receita * 100. */
  margin_percent: number;
  /** Variação absoluta vs mesmo mês anterior. */
  delta_profit: number;
};

export async function getDreByService(input: {
  periodMonth?: string;
}): Promise<ActionResult<{ rows: DreByServiceRow[]; periodLabel: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const now = new Date();
    const currentMonth =
      input.periodMonth ?? format(startOfMonth(now), 'yyyy-MM-dd');
    const lastMonth = format(
      startOfMonth(subMonths(new Date(currentMonth), 1)),
      'yyyy-MM-dd',
    );

    const [curRes, lastRes] = await Promise.all([
      supabase
        .from('v_dre_by_service')
        .select(
          'service_id, service_name, service_type, items_count, total_quantity, revenue_gross, variable_cost, commissions, discounts, gross_profit',
        )
        .eq('org_id', orgId)
        .eq('period_month', currentMonth),
      supabase
        .from('v_dre_by_service')
        .select('service_id, gross_profit')
        .eq('org_id', orgId)
        .eq('period_month', lastMonth),
    ]);

    if (curRes.error) return { ok: false, error: curRes.error.message };
    if (lastRes.error) return { ok: false, error: lastRes.error.message };

    const lastMap = new Map<string, number>();
    for (const r of lastRes.data ?? []) {
      if (r.service_id) {
        lastMap.set(r.service_id, Number(r.gross_profit ?? 0));
      }
    }

    const rows: DreByServiceRow[] = (curRes.data ?? [])
      .filter((r): r is typeof r & { service_id: string } => r.service_id !== null)
      .map((r) => {
        const revenue = Number(r.revenue_gross ?? 0);
        const profit = Number(r.gross_profit ?? 0);
        const previousProfit = lastMap.get(r.service_id) ?? 0;
        return {
          service_id: r.service_id,
          service_name: r.service_name ?? '(sem nome)',
          service_type: (r.service_type ?? 'service') as 'service' | 'product',
          items_count: Number(r.items_count ?? 0),
          total_quantity: Number(r.total_quantity ?? 0),
          revenue_gross: revenue,
          variable_cost: Number(r.variable_cost ?? 0),
          commissions: Number(r.commissions ?? 0),
          discounts: Number(r.discounts ?? 0),
          gross_profit: profit,
          margin_percent: revenue > 0 ? (profit / revenue) * 100 : 0,
          delta_profit: profit - previousProfit,
        };
      })
      .sort((a, b) => b.gross_profit - a.gross_profit);

    return {
      ok: true,
      data: {
        rows,
        periodLabel: format(new Date(currentMonth), "MMMM 'de' yyyy", {
          locale: ptBR,
        }),
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 4.3 — Lucro por profissional
// ---------------------------------------------------------------------------

export type DreByProfessionalRow = {
  professional_id: string;
  professional_name: string;
  cost_center: string | null;
  items_count: number;
  revenue_gross: number;
  variable_cost: number;
  commission_to_pay: number;
  gross_profit: number;
  ticket_medio: number;
  delta_profit: number;
};

export async function getDreByProfessional(input: {
  periodMonth?: string;
  costCenter?: string;
}): Promise<ActionResult<{ rows: DreByProfessionalRow[]; periodLabel: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const now = new Date();
    const currentMonth =
      input.periodMonth ?? format(startOfMonth(now), 'yyyy-MM-dd');
    const lastMonth = format(
      startOfMonth(subMonths(new Date(currentMonth), 1)),
      'yyyy-MM-dd',
    );

    const [curRes, lastRes, profsRes] = await Promise.all([
      supabase
        .from('v_dre_by_professional')
        .select(
          'professional_id, professional_name, items_count, revenue_gross, variable_cost, commission_to_pay, gross_profit',
        )
        .eq('org_id', orgId)
        .eq('period_month', currentMonth),
      supabase
        .from('v_dre_by_professional')
        .select('professional_id, gross_profit')
        .eq('org_id', orgId)
        .eq('period_month', lastMonth),
      supabase
        .from('professionals')
        .select('id, cost_center')
        .eq('org_id', orgId)
        .is('deleted_at', null),
    ]);

    if (curRes.error) return { ok: false, error: curRes.error.message };
    if (lastRes.error) return { ok: false, error: lastRes.error.message };
    if (profsRes.error) return { ok: false, error: profsRes.error.message };

    const lastMap = new Map<string, number>();
    for (const r of lastRes.data ?? []) {
      if (r.professional_id) {
        lastMap.set(r.professional_id, Number(r.gross_profit ?? 0));
      }
    }
    const ccMap = new Map<string, string | null>();
    for (const p of profsRes.data ?? []) {
      ccMap.set(p.id, p.cost_center);
    }

    let rows: DreByProfessionalRow[] = (curRes.data ?? [])
      .filter(
        (r): r is typeof r & { professional_id: string } =>
          r.professional_id !== null,
      )
      .map((r) => {
        const revenue = Number(r.revenue_gross ?? 0);
        const items = Number(r.items_count ?? 0);
        const profit = Number(r.gross_profit ?? 0);
        const previousProfit = lastMap.get(r.professional_id) ?? 0;
        return {
          professional_id: r.professional_id,
          professional_name: r.professional_name ?? '(sem nome)',
          cost_center: ccMap.get(r.professional_id) ?? null,
          items_count: items,
          revenue_gross: revenue,
          variable_cost: Number(r.variable_cost ?? 0),
          commission_to_pay: Number(r.commission_to_pay ?? 0),
          gross_profit: profit,
          ticket_medio: items > 0 ? revenue / items : 0,
          delta_profit: profit - previousProfit,
        };
      });

    if (input.costCenter) {
      rows = rows.filter((r) => r.cost_center === input.costCenter);
    }

    rows.sort((a, b) => b.gross_profit - a.gross_profit);

    return {
      ok: true,
      data: {
        rows,
        periodLabel: format(new Date(currentMonth), "MMMM 'de' yyyy", {
          locale: ptBR,
        }),
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Story 4.8 — Metas
// ---------------------------------------------------------------------------

import { goalSchema, type GoalInput } from '@/lib/validators/goal';

export type GoalRow = {
  id: string;
  period_month: string;
  target_revenue: number | null;
  target_profit: number | null;
  target_appointments: number | null;
  notes: string | null;
};

export async function listGoals(input: { year?: number }): Promise<ActionResult<GoalRow[]>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();
    const year = input.year ?? new Date().getFullYear();

    const { data, error } = await supabase
      .from('goals')
      .select('id, period_month, target_revenue, target_profit, target_appointments, notes')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .gte('period_month', `${year}-01-01`)
      .lte('period_month', `${year}-12-31`)
      .order('period_month', { ascending: false });
    if (error) return { ok: false, error: error.message };

    return {
      ok: true,
      data: (data ?? []).map((g) => ({
        id: g.id,
        period_month: g.period_month,
        target_revenue: g.target_revenue === null ? null : Number(g.target_revenue),
        target_profit: g.target_profit === null ? null : Number(g.target_profit),
        target_appointments: g.target_appointments,
        notes: g.notes,
      })),
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function upsertGoal(input: GoalInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const parsed = goalSchema.parse(input);
    const supabase = await createServerClient();

    const payload = {
      org_id: orgId,
      period_month: parsed.periodMonth,
      ...(parsed.targetRevenue !== undefined ? { target_revenue: parsed.targetRevenue } : {}),
      ...(parsed.targetProfit !== undefined ? { target_profit: parsed.targetProfit } : {}),
      ...(parsed.targetAppointments !== undefined
        ? { target_appointments: parsed.targetAppointments }
        : {}),
      ...(parsed.notes ? { notes: parsed.notes } : {}),
    };

    const { data, error } = await supabase
      .from('goals')
      .upsert(payload, { onConflict: 'org_id,period_month' })
      .select('id')
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Falha ao salvar meta.' };
    }
    revalidatePath('/financeiro/metas');
    revalidatePath('/dashboard');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export type GoalProgress = {
  goal: GoalRow | null;
  revenue: { current: number; target: number | null; delta: number | null };
  profit: { current: number; target: number | null; delta: number | null };
  appointments: { current: number; target: number | null; delta: number | null };
  daysRemainingInMonth: number;
};

export async function getCurrentMonthGoalProgress(): Promise<ActionResult<GoalProgress>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = endOfMonth(now);
    const daysRemainingInMonth = Math.max(
      0,
      Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const [goalRes, dreRes, doneRes] = await Promise.all([
      supabase
        .from('goals')
        .select('id, period_month, target_revenue, target_profit, target_appointments, notes')
        .eq('org_id', orgId)
        .eq('period_month', monthStart)
        .is('deleted_at', null)
        .maybeSingle(),
      supabase
        .from('v_dre_monthly')
        .select('revenue_net, net_profit')
        .eq('org_id', orgId)
        .eq('period_month', monthStart)
        .maybeSingle(),
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'done')
        .is('deleted_at', null)
        .gte('starts_at', monthStart + 'T00:00:00'),
    ]);

    if (goalRes.error) return { ok: false, error: goalRes.error.message };
    if (dreRes.error) return { ok: false, error: dreRes.error.message };
    if (doneRes.error) return { ok: false, error: doneRes.error.message };

    const goal = goalRes.data
      ? {
          id: goalRes.data.id,
          period_month: goalRes.data.period_month,
          target_revenue:
            goalRes.data.target_revenue === null ? null : Number(goalRes.data.target_revenue),
          target_profit:
            goalRes.data.target_profit === null ? null : Number(goalRes.data.target_profit),
          target_appointments: goalRes.data.target_appointments,
          notes: goalRes.data.notes,
        }
      : null;

    const revenueCur = Number(dreRes.data?.revenue_net ?? 0);
    const profitCur = Number(dreRes.data?.net_profit ?? 0);
    const appointmentsCur = doneRes.count ?? 0;

    return {
      ok: true,
      data: {
        goal,
        revenue: {
          current: revenueCur,
          target: goal?.target_revenue ?? null,
          delta:
            goal?.target_revenue !== null && goal?.target_revenue !== undefined
              ? revenueCur - goal.target_revenue
              : null,
        },
        profit: {
          current: profitCur,
          target: goal?.target_profit ?? null,
          delta:
            goal?.target_profit !== null && goal?.target_profit !== undefined
              ? profitCur - goal.target_profit
              : null,
        },
        appointments: {
          current: appointmentsCur,
          target: goal?.target_appointments ?? null,
          delta:
            goal?.target_appointments !== null && goal?.target_appointments !== undefined
              ? appointmentsCur - goal.target_appointments
              : null,
        },
        daysRemainingInMonth,
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// Suprimir warnings de imports não usados em todas as branches.
void startOfWeek;
void endOfWeek;
