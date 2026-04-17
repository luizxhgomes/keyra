import 'server-only';

import type { User } from '@supabase/supabase-js';

import { createServerClient } from '@/lib/supabase/server';

/**
 * Returns the current Supabase user (or null) as seen from a Server Component
 * or Server Action. Reads the session cookie set by `@supabase/ssr`.
 *
 * Traceability: ADR-010 (Supabase Auth), ADR-011 (RLS tenant isolation).
 *
 * Prefer `requireAuth()` when you need to GUARANTEE authentication — that
 * helper redirects to /login on miss.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the active organization id for the current user, as materialized
 * in the JWT custom claim (`org_id`) set by `public.custom_access_token_hook`.
 *
 * Falls back to reading `user_preferences.active_org_id` if the claim is
 * missing (e.g. session minted before first membership existed — onboarding
 * edge case). Returns null if the user has no membership at all.
 *
 * Traceability: ADR-012 (JWT custom claim org_id).
 */
export async function getActiveOrgId(): Promise<string | null> {
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  // Primary source: custom claim baked into the JWT by the Auth Hook.
  // The claim is set in supabase/migrations/20260416000400_auth_setup.sql.
  const rawClaim = (session.user.app_metadata as Record<string, unknown>)?.['org_id'];
  if (typeof rawClaim === 'string' && rawClaim.length > 0) {
    return rawClaim;
  }

  // JWT access_token also carries the claim — try decoding as a secondary
  // fallback. We avoid a network trip by parsing the base64 payload directly.
  const decoded = decodeJwtClaim(session.access_token, 'org_id');
  if (decoded) {
    return decoded;
  }

  // Last-resort fallback: read user_preferences directly. RLS allows the user
  // to read their own row.
  const { data: pref } = await supabase
    .from('user_preferences')
    .select('active_org_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (pref?.active_org_id) {
    return pref.active_org_id;
  }

  // Truly no org → caller must route to onboarding.
  return null;
}

/**
 * Minimal JWT payload decoder — no signature verification (we trust the
 * cookie already validated by Supabase). Only used to sniff known claims
 * for UX routing decisions, never for authorization.
 */
function decodeJwtClaim(token: string, claim: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payloadPart = parts[1];
    if (!payloadPart) return null;
    const payload = JSON.parse(
      Buffer.from(payloadPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
    ) as Record<string, unknown>;
    const value = payload[claim];
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
}
