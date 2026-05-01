'use server';

import { revalidatePath } from 'next/cache';
import {
  endOfMonth,
  endOfWeek,
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

// Suprimir warnings de imports não usados em todas as branches.
void startOfWeek;
void endOfWeek;
void ptBR;
