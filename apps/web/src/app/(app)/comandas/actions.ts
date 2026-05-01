'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import { AuthorizationError, requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import {
  addCommandItemSchema,
  applyDiscountSchema,
  commandIdSchema,
  removeCommandItemSchema,
} from '@/lib/validators/command';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof AuthorizationError) return err.message;
  if (err instanceof z.ZodError) return err.issues.map((i) => i.message).join(' · ');
  if (err instanceof Error) return err.message;
  return fallback;
}

export type CommandStatus = 'open' | 'finalized' | 'paid' | 'cancelled';

export type CommandRow = {
  id: string;
  status: CommandStatus;
  customer_name: string | null;
  professional_name: string | null;
  subtotal: number;
  discount_amount: number;
  total: number;
  paid_amount: number;
  opened_at: string;
};

export type CommandItem = {
  id: string;
  service_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  commission_rate: number;
  discount_amount: number;
  total: number;
};

export type CommandDetail = CommandRow & {
  appointment_id: string | null;
  notes: string | null;
  finalized_at: string | null;
  paid_at: string | null;
  items: CommandItem[];
};

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Listagem
// ---------------------------------------------------------------------------

export async function listCommands(input: {
  status?: CommandStatus | 'all';
  page?: number;
}): Promise<ActionResult<{ rows: CommandRow[]; total: number; page: number; pageSize: number }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');

    const supabase = await createServerClient();
    const page = Math.max(1, input.page ?? 1);
    const offset = (page - 1) * PAGE_SIZE;

    let q = supabase
      .from('commands')
      .select(
        `id, status, subtotal, discount_amount, total, paid_amount, opened_at,
         customer:customers(full_name),
         professional:professionals(display_name)`,
        { count: 'exact' },
      )
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('opened_at', { ascending: false });

    if (input.status && input.status !== 'all') {
      q = q.eq('status', input.status);
    }

    const { data, error, count } = await q.range(offset, offset + PAGE_SIZE - 1);
    if (error) return { ok: false, error: error.message };

    const rows: CommandRow[] = (data ?? []).map((r) => {
      const cust = r.customer as { full_name: string } | { full_name: string }[] | null;
      const prof = r.professional as
        | { display_name: string }
        | { display_name: string }[]
        | null;
      const customer = Array.isArray(cust) ? cust[0] : cust;
      const professional = Array.isArray(prof) ? prof[0] : prof;
      return {
        id: r.id,
        status: r.status as CommandStatus,
        customer_name: customer?.full_name ?? null,
        professional_name: professional?.display_name ?? null,
        subtotal: Number(r.subtotal),
        discount_amount: Number(r.discount_amount),
        total: Number(r.total),
        paid_amount: Number(r.paid_amount),
        opened_at: r.opened_at,
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
// Detalhe
// ---------------------------------------------------------------------------

export async function getCommand(id: string): Promise<ActionResult<CommandDetail>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');
    const parsed = commandIdSchema.parse({ id });
    const supabase = await createServerClient();

    const [headRes, itemsRes] = await Promise.all([
      supabase
        .from('commands')
        .select(
          `id, status, appointment_id, subtotal, discount_amount, total, paid_amount,
           notes, opened_at, finalized_at, paid_at,
           customer:customers(full_name),
           professional:professionals(display_name)`,
        )
        .eq('id', parsed.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .maybeSingle(),
      supabase
        .from('command_items')
        .select(
          'id, service_id, description, quantity, unit_price, unit_cost, commission_rate, discount_amount, total',
        )
        .eq('command_id', parsed.id)
        .eq('org_id', orgId)
        .order('created_at', { ascending: true }),
    ]);

    if (headRes.error) return { ok: false, error: headRes.error.message };
    if (!headRes.data) return { ok: false, error: 'Comanda não encontrada.' };
    if (itemsRes.error) return { ok: false, error: itemsRes.error.message };

    const head = headRes.data;
    const cust = head.customer as { full_name: string } | { full_name: string }[] | null;
    const prof = head.professional as
      | { display_name: string }
      | { display_name: string }[]
      | null;
    const customer = Array.isArray(cust) ? cust[0] : cust;
    const professional = Array.isArray(prof) ? prof[0] : prof;

    return {
      ok: true,
      data: {
        id: head.id,
        status: head.status as CommandStatus,
        appointment_id: head.appointment_id,
        customer_name: customer?.full_name ?? null,
        professional_name: professional?.display_name ?? null,
        subtotal: Number(head.subtotal),
        discount_amount: Number(head.discount_amount),
        total: Number(head.total),
        paid_amount: Number(head.paid_amount),
        opened_at: head.opened_at,
        finalized_at: head.finalized_at,
        paid_at: head.paid_at,
        notes: head.notes,
        items: (itemsRes.data ?? []).map((i) => ({
          id: i.id,
          service_id: i.service_id,
          description: i.description,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          unit_cost: Number(i.unit_cost),
          commission_rate: Number(i.commission_rate),
          discount_amount: Number(i.discount_amount),
          total: Number(i.total),
        })),
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Mutações em command_items
// ---------------------------------------------------------------------------

/**
 * Adiciona item à comanda. Trigger `trg_command_items_recompute` atualiza
 * `commands.subtotal` automaticamente. `command_items.total` é GENERATED.
 */
export async function addCommandItem(
  input: z.input<typeof addCommandItemSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');
    const parsed = addCommandItemSchema.parse(input);
    const supabase = await createServerClient();

    // Confirma que a comanda existe e está aberta antes de adicionar item.
    const { data: cmd, error: cmdErr } = await supabase
      .from('commands')
      .select('status')
      .eq('id', parsed.commandId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();
    if (cmdErr) return { ok: false, error: cmdErr.message };
    if (!cmd) return { ok: false, error: 'Comanda não encontrada.' };
    if (cmd.status !== 'open') {
      return {
        ok: false,
        error: 'Comanda não está aberta — não é possível adicionar itens.',
      };
    }

    // Snapshot de unit_cost e commission_rate vem do serviço atual (não do
    // momento do agendamento — é um item adicional, não derivado da agenda).
    const { data: svc, error: svcErr } = await supabase
      .from('services')
      .select('unit_cost, commission_rate')
      .eq('id', parsed.serviceId)
      .eq('org_id', orgId)
      .maybeSingle();
    if (svcErr) return { ok: false, error: svcErr.message };
    if (!svc) return { ok: false, error: 'Serviço não encontrado.' };

    const { data, error } = await supabase
      .from('command_items')
      .insert({
        org_id: orgId,
        command_id: parsed.commandId,
        service_id: parsed.serviceId,
        description: parsed.description,
        quantity: parsed.quantity,
        unit_price: parsed.unitPrice,
        unit_cost: Number(svc.unit_cost ?? 0),
        commission_rate: Number(svc.commission_rate ?? 0),
        discount_amount: 0,
      })
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Falha ao adicionar item.' };
    }

    revalidatePath('/comandas');
    revalidatePath(`/comandas/${parsed.commandId}`);
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function removeCommandItem(
  input: z.input<typeof removeCommandItemSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');
    const parsed = removeCommandItemSchema.parse(input);
    const supabase = await createServerClient();

    const { data: cmd, error: cmdErr } = await supabase
      .from('commands')
      .select('status')
      .eq('id', parsed.commandId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();
    if (cmdErr) return { ok: false, error: cmdErr.message };
    if (!cmd || cmd.status !== 'open') {
      return {
        ok: false,
        error: 'Apenas comandas abertas aceitam edição de itens.',
      };
    }

    const { error } = await supabase
      .from('command_items')
      .delete()
      .eq('id', parsed.itemId)
      .eq('command_id', parsed.commandId)
      .eq('org_id', orgId);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/comandas');
    revalidatePath(`/comandas/${parsed.commandId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Desconto e finalização
// ---------------------------------------------------------------------------

export async function applyCommandDiscount(
  input: z.input<typeof applyDiscountSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');
    const parsed = applyDiscountSchema.parse(input);
    const supabase = await createServerClient();

    const { data: cmd, error: cmdErr } = await supabase
      .from('commands')
      .select('status, subtotal')
      .eq('id', parsed.commandId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();
    if (cmdErr) return { ok: false, error: cmdErr.message };
    if (!cmd) return { ok: false, error: 'Comanda não encontrada.' };
    if (cmd.status !== 'open') {
      return { ok: false, error: 'Apenas comandas abertas aceitam desconto.' };
    }

    if (parsed.discountAmount > Number(cmd.subtotal)) {
      return {
        ok: false,
        error: 'Desconto não pode ser maior que o subtotal da comanda.',
      };
    }

    const { error } = await supabase
      .from('commands')
      .update({ discount_amount: parsed.discountAmount })
      .eq('id', parsed.commandId)
      .eq('org_id', orgId);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/comandas/${parsed.commandId}`);
    revalidatePath('/comandas');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function finalizeCommand(
  input: z.input<typeof commandIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');
    const parsed = commandIdSchema.parse(input);
    const supabase = await createServerClient();

    const { data: cmd, error: cmdErr } = await supabase
      .from('commands')
      .select('status, total')
      .eq('id', parsed.id)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();
    if (cmdErr) return { ok: false, error: cmdErr.message };
    if (!cmd) return { ok: false, error: 'Comanda não encontrada.' };
    if (cmd.status !== 'open') {
      return { ok: false, error: 'Apenas comandas abertas podem ser finalizadas.' };
    }
    if (Number(cmd.total) <= 0) {
      return { ok: false, error: 'Comanda sem itens — adicione ao menos um item.' };
    }

    const { error } = await supabase
      .from('commands')
      .update({ status: 'finalized', finalized_at: new Date().toISOString() })
      .eq('id', parsed.id)
      .eq('org_id', orgId);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/comandas/${parsed.id}`);
    revalidatePath('/comandas');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Picker de serviço para "adicionar item"
// ---------------------------------------------------------------------------

export type ServicePicker = {
  id: string;
  name: string;
  price: number;
  type: 'service' | 'product';
};

export async function listActiveServicesForPicker(): Promise<ActionResult<ServicePicker[]>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('services')
      .select('id, name, price, type')
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
        price: Number(s.price),
        type: s.type as 'service' | 'product',
      })),
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}
