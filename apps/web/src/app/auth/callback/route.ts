import { NextResponse, type NextRequest } from 'next/server';

import { getActiveOrgId } from '@/lib/auth/get-current-user';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Magic link callback handler.
 *
 * Flow:
 *   1. Supabase Auth emails the user a link of the form
 *      `{SITE_URL}/auth/callback?code=<one-time-code>`.
 *   2. User clicks it → browser GETs this handler.
 *   3. We exchange the code for a session (sets auth cookies via `@supabase/ssr`).
 *   4. We route based on whether the user already has a membership.
 *
 * Error handling:
 *   - Missing/invalid code → /login?error=invalid_code
 *   - Exchange failure → /login?error=exchange_failed
 *
 * Traceability: ADR-010, ADR-012.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Supabase surfaces errors (expired link, etc.) via query params directly.
  if (errorParam) {
    const reason = mapSupabaseAuthError(errorParam, errorDescription);
    return NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid_code', origin));
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=exchange_failed', origin));
  }

  // Session cookies are now set. Decide where to route: onboarding if no
  // membership yet, dashboard otherwise. Custom JWT claim `org_id` is set
  // by public.custom_access_token_hook (ADR-012).
  const orgId = await getActiveOrgId();
  const target = orgId ? '/dashboard' : '/onboarding/nova-organizacao';

  return NextResponse.redirect(new URL(target, origin));
}

function mapSupabaseAuthError(code: string, description: string | null): string {
  const blob = `${code} ${description ?? ''}`.toLowerCase();
  if (blob.includes('expired')) return 'link_expired';
  if (blob.includes('otp') || blob.includes('invalid')) return 'invalid_code';
  return 'auth_error';
}
