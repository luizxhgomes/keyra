import 'server-only';

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { getActiveOrgId, getCurrentUser } from '@/lib/auth/get-current-user';

/**
 * Server-side auth guard for Server Components / Server Actions.
 *
 * Behavior:
 *   - If no user         → redirect('/login')
 *   - If user, no org    → redirect('/onboarding/nova-organizacao')
 *   - Otherwise          → return { user, orgId }
 *
 * Use this at the TOP of any protected page/layout/action. Middleware still
 * does a first-pass redirect, but route-level `requireAuth` covers the edge
 * cases where a user's membership was deleted mid-session.
 *
 * Traceability: ADR-010, ADR-011, ADR-012.
 */
export async function requireAuth(): Promise<{ user: User; orgId: string }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const orgId = await getActiveOrgId();
  if (!orgId) {
    redirect('/onboarding/nova-organizacao');
  }

  return { user, orgId };
}
