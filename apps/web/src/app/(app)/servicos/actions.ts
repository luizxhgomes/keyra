'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import { AuthorizationError, requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import {
  categoryIdSchema,
  categorySchema,
  serviceIdSchema,
  serviceSchema,
  type CategoryInput,
  type ServiceInput,
} from '@/lib/validators/service';

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
// Categories
// ---------------------------------------------------------------------------

export async function upsertCategory(
  input: CategoryInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const parsed = categorySchema.parse(input);
    const supabase = await createServerClient();

    const payload = {
      org_id: orgId,
      name: parsed.name,
      ...(parsed.color ? { color: parsed.color } : {}),
      ...(parsed.sortOrder !== undefined ? { sort_order: parsed.sortOrder } : {}),
    };

    if (parsed.id) {
      const { error } = await supabase
        .from('service_categories')
        .update(payload)
        .eq('id', parsed.id)
        .eq('org_id', orgId);
      if (error) return { ok: false, error: error.message };
      revalidatePath('/servicos');
      revalidatePath('/servicos/categorias');
      return { ok: true, data: { id: parsed.id } };
    }

    const { data, error } = await supabase
      .from('service_categories')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Não foi possível criar a categoria.' };
    }
    revalidatePath('/servicos');
    revalidatePath('/servicos/categorias');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function archiveCategory(
  input: z.infer<typeof categoryIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const { id } = categoryIdSchema.parse(input);
    const supabase = await createServerClient();

    // Desvincula serviços que apontam para esta categoria (FK já tem ON DELETE SET NULL,
    // mas fazemos soft-delete, então precisamos limpar manualmente).
    await supabase
      .from('services')
      .update({ category_id: null })
      .eq('category_id', id)
      .eq('org_id', orgId);

    const { error } = await supabase
      .from('service_categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };
    revalidatePath('/servicos');
    revalidatePath('/servicos/categorias');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function upsertService(
  input: ServiceInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const parsed = serviceSchema.parse(input);
    const supabase = await createServerClient();

    const commissionRate =
      parsed.commissionPercent !== undefined ? parsed.commissionPercent / 100 : undefined;

    const payload = {
      org_id: orgId,
      name: parsed.name,
      type: parsed.type,
      price: parsed.price,
      ...(parsed.unitCost !== undefined ? { unit_cost: parsed.unitCost } : {}),
      ...(commissionRate !== undefined ? { commission_rate: commissionRate } : {}),
      ...(parsed.type === 'service' && parsed.durationMinutes !== undefined
        ? { duration_minutes: parsed.durationMinutes }
        : {}),
      ...(parsed.description ? { description: parsed.description } : {}),
      ...(parsed.categoryId ? { category_id: parsed.categoryId } : { category_id: null }),
      active: parsed.active ?? true,
    };

    if (parsed.id) {
      const { error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', parsed.id)
        .eq('org_id', orgId);
      if (error) return { ok: false, error: error.message };
      revalidatePath('/servicos');
      return { ok: true, data: { id: parsed.id } };
    }

    const { data, error } = await supabase
      .from('services')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Não foi possível criar o serviço.' };
    }
    revalidatePath('/servicos');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function archiveService(
  input: z.infer<typeof serviceIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const { id } = serviceIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('services')
      .update({ active: false, deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };
    revalidatePath('/servicos');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}
