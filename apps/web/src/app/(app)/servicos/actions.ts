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

// ---------------------------------------------------------------------------
// Refinamento Fase 1 — Catálogo stats (4 KPIs com variação MoM)
// ---------------------------------------------------------------------------

export type CatalogStats = {
  totalItems: number;
  activeItems: number;
  totalCategories: number;
  uncategorizedItems: number;
  /** Variação % vs final do mês passado (positivo = cresceu). null se sem base. */
  totalItemsDelta: number | null;
  activeItemsDelta: number | null;
  totalCategoriesDelta: number | null;
  uncategorizedItemsDelta: number | null;
};

export async function getCatalogStats(): Promise<ActionResult<CatalogStats>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    // Cutoff: fim do mês passado às 23:59:59 (compara contagens "antes" vs "agora")
    const now = new Date();
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    ).toISOString();

    const [
      svcAllRes,
      svcActiveRes,
      svcAllPastRes,
      svcActivePastRes,
      catAllRes,
      uncatRes,
      catAllPastRes,
      uncatPastRes,
    ] = await Promise.all([
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('deleted_at', null),
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('active', true)
        .is('deleted_at', null),
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .lte('created_at', endOfLastMonth),
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('active', true)
        .lte('created_at', endOfLastMonth),
      supabase
        .from('service_categories')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('deleted_at', null),
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('category_id', null)
        .is('deleted_at', null),
      supabase
        .from('service_categories')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .lte('created_at', endOfLastMonth),
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('category_id', null)
        .is('deleted_at', null)
        .lte('created_at', endOfLastMonth),
    ]);

    if (svcAllRes.error) return { ok: false, error: svcAllRes.error.message };
    if (svcActiveRes.error)
      return { ok: false, error: svcActiveRes.error.message };
    if (catAllRes.error) return { ok: false, error: catAllRes.error.message };
    if (uncatRes.error) return { ok: false, error: uncatRes.error.message };

    const totalItems = svcAllRes.count ?? 0;
    const activeItems = svcActiveRes.count ?? 0;
    const totalCategories = catAllRes.count ?? 0;
    const uncategorizedItems = uncatRes.count ?? 0;
    const totalItemsPast = svcAllPastRes.count ?? 0;
    const activeItemsPast = svcActivePastRes.count ?? 0;
    const totalCategoriesPast = catAllPastRes.count ?? 0;
    const uncategorizedItemsPast = uncatPastRes.count ?? 0;

    function delta(now: number, past: number): number | null {
      if (past === 0) return now > 0 ? 100 : null;
      return Math.round(((now - past) / past) * 100);
    }

    return {
      ok: true,
      data: {
        totalItems,
        activeItems,
        totalCategories,
        uncategorizedItems,
        totalItemsDelta: delta(totalItems, totalItemsPast),
        activeItemsDelta: delta(activeItems, activeItemsPast),
        totalCategoriesDelta: delta(totalCategories, totalCategoriesPast),
        uncategorizedItemsDelta: delta(uncategorizedItems, uncategorizedItemsPast),
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}
