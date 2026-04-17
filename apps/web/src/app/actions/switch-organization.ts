'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createServerClient } from '@/lib/supabase/server';

export type SwitchOrgResult =
  | { success: true }
  | { success: false; error: string };

const schema = z.object({
  orgId: z.string().uuid('orgId deve ser um UUID'),
});

/**
 * Switches the active organization for the current user.
 *
 * 1. Verifies the user has a membership on the target org (RLS does this
 *    implicitly — the UPDATE below only touches `user_preferences`, so we
 *    pre-check membership to avoid setting a stale pointer).
 * 2. UPSERT `user_preferences.active_org_id`.
 * 3. Refresh the Supabase session so the next JWT minted for this user
 *    carries the new `org_id` custom claim (ADR-012).
 * 4. Revalidate / cache — caller should hard-navigate on success.
 */
export async function switchOrganizationAction(
  input: z.input<typeof schema>,
): Promise<SwitchOrgResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? 'orgId inválido' };
  }

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sessão expirada. Faça login novamente.' };
  }

  // 1) Verify membership. `.select().single()` with RLS returns null if the
  // user has no access to that org — which is the right answer here.
  const { data: membership, error: memErr } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('org_id', parsed.data.orgId)
    .is('deleted_at', null)
    .maybeSingle();

  if (memErr) {
    return { success: false, error: memErr.message };
  }

  if (!membership) {
    return { success: false, error: 'Você não tem acesso a essa clínica.' };
  }

  // 2) Persist preference
  const { error: prefErr } = await supabase.from('user_preferences').upsert(
    {
      user_id: user.id,
      active_org_id: parsed.data.orgId,
      onboarding_done: true,
    },
    { onConflict: 'user_id' },
  );

  if (prefErr) {
    return { success: false, error: prefErr.message };
  }

  // 3) Refresh session → next JWT carries new org_id
  await supabase.auth.refreshSession();

  // 4) Invalidate cached renders for all routes — the data scope changed.
  revalidatePath('/', 'layout');

  return { success: true };
}
