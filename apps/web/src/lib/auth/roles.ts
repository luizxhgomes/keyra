import 'server-only';

import { createServerClient } from '@/lib/supabase/server';

import { AuthorizationError, roleRank, type MembershipRole } from './roles-shared';

// Re-export shared pieces so existing server-side callers can keep importing
// from `@/lib/auth/roles` without churn.
export {
  AuthorizationError,
  MEMBERSHIP_ROLES,
  canAssignRole,
  canInvite,
  canManageTeam,
  canModifyMember,
  roleRank,
} from './roles-shared';
export type { MembershipRole } from './roles-shared';

/**
 * Fetches the caller's role in the currently active organization. Returns null
 * when the user has no active membership (should be rare — `requireAuth`
 * catches this before we get here in protected routes).
 *
 * Server-only: uses the Supabase server client.
 */
export async function getCurrentRole(orgId: string): Promise<MembershipRole | null> {
  const supabase = await createServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', auth.user.id)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data) return null;
  return data.role as MembershipRole;
}

/**
 * Guard helper: `requireRole` throws if the caller doesn't have the minimum
 * role. Use inside Server Actions after `requireAuth()` to enforce domain
 * rules (not a substitute for RLS — double defense).
 */
export async function requireRole(orgId: string, min: MembershipRole): Promise<MembershipRole> {
  const role = await getCurrentRole(orgId);
  if (!role) {
    throw new AuthorizationError('Sem membership ativa na organização.');
  }
  if (roleRank(role) < roleRank(min)) {
    throw new AuthorizationError();
  }
  return role;
}
