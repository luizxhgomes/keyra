'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import {
  AuthorizationError,
  requireRole,
} from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import { patientIdSchema, patientSchema, type PatientInput } from '@/lib/validators/patient';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof AuthorizationError) return err.message;
  if (err instanceof z.ZodError) return err.issues.map((i) => i.message).join(' · ');
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function upsertPatient(
  input: PatientInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await requireAuth();
    // `professional` e superiores podem mutar pacientes. viewer só lê.
    await requireRole(orgId, 'professional');

    const parsed = patientSchema.parse(input);
    const supabase = await createServerClient();

    const payload = {
      org_id: orgId,
      full_name: parsed.fullName,
      ...(parsed.phone ? { phone: parsed.phone } : {}),
      ...(parsed.email ? { email: parsed.email } : {}),
      ...(parsed.birthDate ? { birth_date: parsed.birthDate } : {}),
      ...(parsed.notes ? { notes: parsed.notes } : {}),
    };

    if (parsed.id) {
      const { error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', parsed.id)
        .eq('org_id', orgId);
      if (error) return { ok: false, error: error.message };
      revalidatePath('/pacientes');
      revalidatePath(`/pacientes/${parsed.id}`);
      return { ok: true, data: { id: parsed.id } };
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Não foi possível criar o paciente.' };
    }

    revalidatePath('/pacientes');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function archivePatient(
  input: z.infer<typeof patientIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const { id } = patientIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };
    revalidatePath('/pacientes');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function unarchivePatient(
  input: z.infer<typeof patientIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const { id } = patientIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: null })
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };
    revalidatePath('/pacientes');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}
