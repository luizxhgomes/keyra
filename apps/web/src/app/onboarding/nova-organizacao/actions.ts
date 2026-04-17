'use server';

import { z } from 'zod';

import { createServerClient } from '@/lib/supabase/server';

export type CreateOrgResult =
  | { success: true; data: { orgId: string } }
  | { success: false; error: string };

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome da clínica é obrigatório')
    .max(120, 'Máximo 120 caracteres'),
  cnpj: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.replace(/\D/g, '') : ''))
    .refine((value) => value === '' || value.length === 14, {
      message: 'CNPJ deve ter 14 dígitos (ou fique em branco)',
    })
    .transform((value) => (value === '' ? null : value)),
});

/**
 * Creates the first organization for the current user and makes them owner.
 *
 * There is no Postgres transaction available over PostgREST, so we emulate
 * one with compensating writes:
 *
 *   1. INSERT organizations → newOrgId
 *   2. INSERT memberships (user, newOrgId, 'owner')
 *   3. UPSERT user_preferences (user, active_org_id=newOrgId, onboarding_done=true)
 *
 * If step 2 or 3 fails, we best-effort DELETE the organization so the user
 * isn't left with a ghost tenant they can't access (RLS would block any view
 * of it). Audit log trigger on `organizations` will record the rollback.
 *
 * After success, we refresh the Supabase session so the next JWT minted for
 * this user carries the `org_id` claim (emitted by the Auth Hook from the
 * freshly-inserted membership).
 *
 * Traceability: ADR-011 (RLS), ADR-012 (JWT org_id), FR-MT-01.
 */
export async function createFirstOrganizationAction(
  input: z.input<typeof schema>,
): Promise<CreateOrgResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? 'Dados inválidos' };
  }

  const supabase = await createServerClient();

  // Sanity: we must have a user here (page is protected). But guard anyway —
  // a direct call to the action from a logged-out client should fail loudly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sessão expirada. Faça login novamente.' };
  }

  // 1) Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: parsed.data.name,
      cnpj: parsed.data.cnpj,
      timezone: 'America/Sao_Paulo',
      created_by: user.id,
    })
    .select('id')
    .single();

  if (orgError || !org) {
    return {
      success: false,
      error: orgError?.message
        ? `Não foi possível criar a clínica: ${orgError.message}`
        : 'Não foi possível criar a clínica.',
    };
  }

  const newOrgId = org.id;

  // 2) Create owner membership
  const { error: memErr } = await supabase.from('memberships').insert({
    user_id: user.id,
    org_id: newOrgId,
    role: 'owner',
    accepted_at: new Date().toISOString(),
  });

  if (memErr) {
    await bestEffortDeleteOrg(supabase, newOrgId);
    return {
      success: false,
      error: `Falha ao associar você como owner: ${memErr.message}`,
    };
  }

  // 3) Upsert user_preferences so the Auth Hook picks this org as active.
  const { error: prefErr } = await supabase.from('user_preferences').upsert(
    {
      user_id: user.id,
      active_org_id: newOrgId,
      onboarding_done: true,
    },
    { onConflict: 'user_id' },
  );

  if (prefErr) {
    await bestEffortDeleteOrg(supabase, newOrgId);
    return {
      success: false,
      error: `Falha ao salvar preferências: ${prefErr.message}`,
    };
  }

  // 4) Force session refresh so next JWT carries org_id custom claim.
  // If this fails, it's non-fatal — the next page load will refresh via
  // middleware. But try anyway to keep the UX snappy.
  await supabase.auth.refreshSession();

  return { success: true, data: { orgId: newOrgId } };
}

async function bestEffortDeleteOrg(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  orgId: string,
): Promise<void> {
  // RLS: the owner (just-inserted) can delete it. If membership insert
  // failed, this user may no longer qualify as owner → the delete may be
  // silently no-op'd by RLS. Either way we surface the primary error above.
  try {
    await supabase.from('organizations').delete().eq('id', orgId);
  } catch {
    // Swallow — best-effort compensation only.
  }
}
