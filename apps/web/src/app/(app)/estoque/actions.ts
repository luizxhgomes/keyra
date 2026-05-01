'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import { AuthorizationError, requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import {
  serviceSupplyDetachSchema,
  serviceSupplyLinkSchema,
  supplyIdSchema,
  supplySchema,
  type SupplyInput,
} from '@/lib/validators/supply';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof AuthorizationError) return err.message;
  if (err instanceof z.ZodError) return err.issues.map((i) => i.message).join(' · ');
  if (err instanceof Error) return err.message;
  return fallback;
}

export type SupplyRow = {
  id: string;
  name: string;
  unit: string;
  unit_cost: number;
  current_stock: number;
  reorder_level: number | null;
  supplier_name: string | null;
  active: boolean;
};

export type SupplyDetail = SupplyRow;

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Listagens
// ---------------------------------------------------------------------------

export async function listSupplies(input: {
  query?: string;
  showArchived?: boolean;
  page?: number;
}): Promise<ActionResult<{ rows: SupplyRow[]; total: number; page: number; pageSize: number }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');

    const supabase = await createServerClient();
    const page = Math.max(1, input.page ?? 1);
    const offset = (page - 1) * PAGE_SIZE;

    let q = supabase
      .from('supplies')
      .select(
        'id, name, unit, unit_cost, current_stock, reorder_level, supplier_name, active',
        { count: 'exact' },
      )
      .eq('org_id', orgId)
      .order('name', { ascending: true });

    if (input.showArchived) {
      q = q.not('deleted_at', 'is', null);
    } else {
      q = q.is('deleted_at', null);
    }
    if (input.query && input.query.trim().length > 0) {
      q = q.ilike('name', `%${input.query.trim()}%`);
    }

    const { data, error, count } = await q.range(offset, offset + PAGE_SIZE - 1);
    if (error) return { ok: false, error: error.message };

    const rows = (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      unit: r.unit,
      unit_cost: Number(r.unit_cost),
      current_stock: Number(r.current_stock),
      reorder_level: r.reorder_level === null ? null : Number(r.reorder_level),
      supplier_name: r.supplier_name,
      active: r.active,
    }));

    return {
      ok: true,
      data: { rows, total: count ?? 0, page, pageSize: PAGE_SIZE },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function getSupply(id: string): Promise<ActionResult<SupplyDetail>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const parsed = supplyIdSchema.parse({ id });
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('supplies')
      .select('id, name, unit, unit_cost, current_stock, reorder_level, supplier_name, active')
      .eq('id', parsed.id)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: 'Insumo não encontrado.' };

    return {
      ok: true,
      data: {
        id: data.id,
        name: data.name,
        unit: data.unit,
        unit_cost: Number(data.unit_cost),
        current_stock: Number(data.current_stock),
        reorder_level: data.reorder_level === null ? null : Number(data.reorder_level),
        supplier_name: data.supplier_name,
        active: data.active,
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Mutações
// ---------------------------------------------------------------------------

export async function upsertSupply(input: SupplyInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const parsed = supplySchema.parse(input);
    const supabase = await createServerClient();

    const payload = {
      org_id: orgId,
      name: parsed.name,
      unit: parsed.unit,
      unit_cost: parsed.unitCost,
      ...(parsed.reorderLevel !== undefined ? { reorder_level: parsed.reorderLevel } : {}),
      ...(parsed.supplierName ? { supplier_name: parsed.supplierName } : {}),
      active: parsed.active,
    };

    if (parsed.id) {
      const { error } = await supabase
        .from('supplies')
        .update(payload)
        .eq('id', parsed.id)
        .eq('org_id', orgId);
      if (error) return { ok: false, error: error.message };

      // Se mudou o unit_cost, recalcula custo de todos os serviços que dependem.
      await recalcServicesUsingSupply(parsed.id, orgId);

      revalidatePath('/estoque/insumos');
      revalidatePath(`/estoque/insumos/${parsed.id}`);
      revalidatePath('/servicos');
      return { ok: true, data: { id: parsed.id } };
    }

    const { data, error } = await supabase
      .from('supplies')
      .insert(payload)
      .select('id')
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Não foi possível criar o insumo.' };
    }
    revalidatePath('/estoque/insumos');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function archiveSupply(
  input: z.infer<typeof supplyIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const { id } = supplyIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('supplies')
      .update({ deleted_at: new Date().toISOString(), active: false })
      .eq('id', id)
      .eq('org_id', orgId);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/estoque/insumos');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function unarchiveSupply(
  input: z.infer<typeof supplyIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const { id } = supplyIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('supplies')
      .update({ deleted_at: null, active: true })
      .eq('id', id)
      .eq('org_id', orgId);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/estoque/insumos');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Movimentações (read-only)
// ---------------------------------------------------------------------------

export type MovementRow = {
  id: string;
  supply_name: string;
  movement_type:
    | 'entry'
    | 'exit'
    | 'adjustment'
    | 'service_consumption'
    | 'loss';
  quantity: number;
  unit_cost_at_move: number | null;
  source_type: 'command' | 'manual' | 'import' | null;
  notes: string | null;
  created_at: string;
};

export async function listInventoryMovements(input: {
  page?: number;
}): Promise<ActionResult<{ rows: MovementRow[]; total: number; page: number; pageSize: number }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const page = Math.max(1, input.page ?? 1);
    const offset = (page - 1) * PAGE_SIZE;

    const { data, error, count } = await supabase
      .from('inventory_movements')
      .select(
        'id, movement_type, quantity, unit_cost_at_move, source_type, notes, created_at, supply:supplies(name)',
        { count: 'exact' },
      )
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) return { ok: false, error: error.message };

    const rows: MovementRow[] = (data ?? []).map((r) => {
      const s = r.supply as { name: string } | { name: string }[] | null;
      const supplyName = Array.isArray(s) ? (s[0]?.name ?? '—') : (s?.name ?? '—');
      return {
        id: r.id,
        supply_name: supplyName,
        movement_type: r.movement_type as MovementRow['movement_type'],
        quantity: Number(r.quantity),
        unit_cost_at_move:
          r.unit_cost_at_move === null ? null : Number(r.unit_cost_at_move),
        source_type: (r.source_type ?? null) as MovementRow['source_type'],
        notes: r.notes,
        created_at: r.created_at,
      };
    });

    return {
      ok: true,
      data: { rows, total: count ?? 0, page, pageSize: PAGE_SIZE },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// BOM (service_supplies) — vinculação na tab "Insumos" do serviço
// ---------------------------------------------------------------------------

export type ServiceBomRow = {
  supply_id: string;
  supply_name: string;
  unit: string;
  unit_cost: number;
  quantity: number;
};

export async function listServiceBom(
  serviceId: string,
): Promise<ActionResult<ServiceBomRow[]>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const parsed = z.object({ id: z.string().uuid() }).parse({ id: serviceId });
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('service_supplies')
      .select('supply_id, quantity, supply:supplies(name, unit, unit_cost)')
      .eq('service_id', parsed.id)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };

    const rows: ServiceBomRow[] = (data ?? [])
      .map((row) => {
        const s = row.supply as
          | { name: string; unit: string; unit_cost: number | string }
          | { name: string; unit: string; unit_cost: number | string }[]
          | null;
        const sup = Array.isArray(s) ? s[0] : s;
        if (!sup) return null;
        return {
          supply_id: row.supply_id,
          supply_name: sup.name,
          unit: sup.unit,
          unit_cost: Number(sup.unit_cost),
          quantity: Number(row.quantity),
        };
      })
      .filter((r): r is ServiceBomRow => r !== null);

    return { ok: true, data: rows };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function attachSupplyToService(
  input: z.input<typeof serviceSupplyLinkSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const parsed = serviceSupplyLinkSchema.parse(input);
    const supabase = await createServerClient();

    // upsert por (service_id, supply_id) — UNIQUE constraint garante 1 linha
    // por par. Usamos onConflict pra simplicidade.
    const { error } = await supabase
      .from('service_supplies')
      .upsert(
        {
          org_id: orgId,
          service_id: parsed.serviceId,
          supply_id: parsed.supplyId,
          quantity: parsed.quantity,
        },
        { onConflict: 'service_id,supply_id' },
      );

    if (error) return { ok: false, error: error.message };

    await recalcServiceUnitCost(parsed.serviceId, orgId);

    revalidatePath(`/servicos/${parsed.serviceId}`);
    revalidatePath('/servicos');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function detachSupplyFromService(
  input: z.input<typeof serviceSupplyDetachSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const parsed = serviceSupplyDetachSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('service_supplies')
      .delete()
      .eq('service_id', parsed.serviceId)
      .eq('supply_id', parsed.supplyId)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };

    await recalcServiceUnitCost(parsed.serviceId, orgId);

    revalidatePath(`/servicos/${parsed.serviceId}`);
    revalidatePath('/servicos');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Recálculo de unit_cost (interno)
// ---------------------------------------------------------------------------

/**
 * Recalcula `services.unit_cost` como `SUM(service_supplies.quantity *
 * supplies.unit_cost)` para um serviço específico. Roda em duas queries
 * (read agregado + UPDATE). Não usa trigger no banco para manter o cálculo
 * visível na aplicação — quando precisarmos de defesa em profundidade,
 * adicionar um trigger é trivial.
 */
async function recalcServiceUnitCost(serviceId: string, orgId: string): Promise<void> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('service_supplies')
    .select('quantity, supply:supplies(unit_cost)')
    .eq('service_id', serviceId)
    .eq('org_id', orgId);
  if (error) throw new Error(`Falha ao recalcular custo: ${error.message}`);

  let total = 0;
  for (const row of data ?? []) {
    const s = row.supply as
      | { unit_cost: number | string }
      | { unit_cost: number | string }[]
      | null;
    const sup = Array.isArray(s) ? s[0] : s;
    if (!sup) continue;
    total += Number(row.quantity) * Number(sup.unit_cost);
  }
  // Arredonda em centavos (numeric(14,2) no banco — passar o número JS é
  // seguro para esse range).
  const rounded = Math.round(total * 100) / 100;

  const { error: updateErr } = await supabase
    .from('services')
    .update({ unit_cost: rounded })
    .eq('id', serviceId)
    .eq('org_id', orgId);
  if (updateErr) throw new Error(`Falha ao atualizar custo: ${updateErr.message}`);
}

/**
 * Quando o `unit_cost` de um insumo muda, todos os serviços que o usam
 * precisam recompor o `services.unit_cost`. Busca primeiro a lista de
 * serviços impactados (via `service_supplies`) e dispara o recálculo.
 */
async function recalcServicesUsingSupply(supplyId: string, orgId: string): Promise<void> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('service_supplies')
    .select('service_id')
    .eq('supply_id', supplyId)
    .eq('org_id', orgId);
  if (error) return; // não bloqueia o upsert se a propagação falhar
  for (const row of data ?? []) {
    await recalcServiceUnitCost(row.service_id, orgId);
  }
}

// ---------------------------------------------------------------------------
// Pickers para a tab Insumos do serviço
// ---------------------------------------------------------------------------

export type SupplyPicker = { id: string; name: string; unit: string; unit_cost: number };

export async function listActiveSuppliesForPicker(): Promise<ActionResult<SupplyPicker[]>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('supplies')
      .select('id, name, unit, unit_cost')
      .eq('org_id', orgId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) return { ok: false, error: error.message };

    return {
      ok: true,
      data: (data ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        unit: s.unit,
        unit_cost: Number(s.unit_cost),
      })),
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}
