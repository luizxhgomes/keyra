'use server';

import { createServerClient } from '@/lib/supabase/server';

export type UserOrganization = {
  orgId: string;
  name: string;
  role: 'owner' | 'admin' | 'professional' | 'viewer';
  isActive: boolean;
};

export type GetUserOrgsResult =
  | { success: true; data: UserOrganization[] }
  | { success: false; error: string };

/**
 * Returns the list of organizations the current user belongs to, along with
 * which one is currently active (from `user_preferences.active_org_id`).
 *
 * RLS allows the user to read their own memberships and the `organizations`
 * rows they're a member of. No service-role access needed (ADR-011).
 */
export async function getUserOrganizationsAction(): Promise<GetUserOrgsResult> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  // Join memberships → organizations. Supabase PostgREST syntax uses the FK
  // relationship name (org_id → organizations).
  const { data: memberships, error } = await supabase
    .from('memberships')
    .select(
      `
        org_id,
        role,
        organizations!inner ( id, name, deleted_at )
      `,
    )
    .eq('user_id', user.id)
    .is('deleted_at', null);

  if (error) {
    return { success: false, error: error.message };
  }

  // Active org lookup — use user_preferences as source of truth for the UI.
  // (The JWT claim is the source of truth for RLS; UI state can diverge
  // briefly between switch + session refresh.)
  const { data: pref } = await supabase
    .from('user_preferences')
    .select('active_org_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const activeOrgId = pref?.active_org_id ?? null;

  type Row = {
    org_id: string;
    role: 'owner' | 'admin' | 'professional' | 'viewer';
    organizations:
      | { id: string; name: string; deleted_at: string | null }
      | Array<{ id: string; name: string; deleted_at: string | null }>
      | null;
  };

  const rows = (memberships ?? []) as Row[];

  const orgs: UserOrganization[] = rows
    .map((row) => {
      // Supabase embeds a single related row as either the object or a
      // 1-element array depending on schema introspection — normalize.
      const org = Array.isArray(row.organizations)
        ? row.organizations[0]
        : row.organizations;
      if (!org || org.deleted_at !== null) return null;
      return {
        orgId: row.org_id,
        name: org.name,
        role: row.role,
        isActive: row.org_id === activeOrgId,
      } satisfies UserOrganization;
    })
    .filter((value): value is UserOrganization => value !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return { success: true, data: orgs };
}
