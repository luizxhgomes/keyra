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
 * Delegates to the Postgres function `create_organization_with_owner`
 * (SECURITY DEFINER) which atomically:
 *   1. INSERT into organizations
 *   2. INSERT owner membership
 *   3. UPSERT user_preferences.active_org_id + onboarding_done = true
 *
 * This bypasses the chicken-and-egg RLS problem: the client cannot
 * INSERT...RETURNING on organizations because the SELECT implied by RETURNING
 * requires is_org_member(), which fails until the membership row exists.
 * The DEFINER function runs as owner and enforces authorization internally
 * via auth.uid().
 *
 * After success we refresh the Supabase session so the next JWT minted for
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sessão expirada. Faça login novamente.' };
  }

  // Atomic call via SECURITY DEFINER RPC. Sidesteps RLS chicken-and-egg.
  const rpcParams: { p_name: string; p_cnpj?: string } = { p_name: parsed.data.name };
  if (parsed.data.cnpj !== null) {
    rpcParams.p_cnpj = parsed.data.cnpj;
  }
  const { data: newOrgId, error: rpcError } = await supabase.rpc(
    'create_organization_with_owner',
    rpcParams,
  );

  if (rpcError || !newOrgId) {
    return {
      success: false,
      error: rpcError?.message
        ? `Não foi possível criar a clínica: ${rpcError.message}`
        : 'Não foi possível criar a clínica.',
    };
  }

  // Force session refresh so next JWT carries org_id custom claim.
  // Non-fatal if it fails — middleware refresh on next request will pick it up.
  await supabase.auth.refreshSession();

  return { success: true, data: { orgId: newOrgId as string } };
}
