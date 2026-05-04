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
 * Returns o display name do usuário atual lendo o claim `full_name` do JWT
 * custom claim (Story auth.7), com fallback no email.
 *
 * Story auth.1 estendeu `public.custom_access_token_hook` para emitir
 * `full_name` lendo de `public.profiles`. Esse claim viaja no JWT, então
 * essa função NÃO faz query extra ao banco — só decoda o cookie já presente.
 *
 * Cobertura de fallbacks (em ordem):
 *   1. JWT custom claim `full_name` (auth.1+ depois do user logar de novo)
 *   2. `user.email` (sempre presente em users autenticados)
 *   3. literal "você" (defensive — só dispara em edge case de session sem user)
 *
 * Traceability: ADR-022 (Auth UX V2), Story auth.7 do EPIC-AUTH-V2.
 */
export async function getCurrentUserDisplayName(): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return 'você';

  const fullNameClaim = decodeJwtClaim(session.access_token, 'full_name');
  if (fullNameClaim && fullNameClaim.length > 0) {
    return fullNameClaim;
  }

  return session.user.email ?? 'você';
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
