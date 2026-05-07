import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

import { getActiveOrgId } from '@/lib/auth/get-current-user';
import { isSafeNextPath } from '@/lib/auth/safe-next';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Auth callback handler — suporta DOIS fluxos de email-based auth:
 *
 * 1. Token Hash flow (recomendado pra SSR — usado por recovery/auth.5):
 *    - Email link: /auth/callback?token_hash=<hash>&type=recovery
 *    - Server-side: verifyOtp({type, token_hash}) — cross-device safe
 *      (não exige code_verifier no browser do usuário)
 *    - Doc: https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr
 *
 * 2. PKCE code flow (legacy magic link / OAuth):
 *    - Email link: /auth/callback?code=<code>
 *    - Server-side: exchangeCodeForSession(code) — exige code_verifier
 *      no cookie (mesmo browser que iniciou o flow)
 *
 * Roteamento pós-sucesso:
 *   - type=recovery → /redefinir-senha (sessão temporária pra updateUser)
 *   - default → /dashboard (se org_id no JWT) ou /onboarding (se sem membership)
 *   - ?next= seguro → preserva (convites, etc.)
 *
 * Erros:
 *   - Missing token_hash & code → /login?error=invalid_code
 *   - Verify/exchange falha → /login?error=exchange_failed
 *   - Link expirado (Supabase reporta via ?error=) → /login?error=link_expired
 *
 * Traceability: ADR-010, ADR-012, Story auth.5 AC4 (token_hash flow), Story
 * auth.8 (BroadcastChannel cross-tab depois deste callback).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Supabase surfaces errors (expired link, etc.) via query params directly.
  if (errorParam) {
    const reason = mapSupabaseAuthError(errorParam, errorDescription);
    return NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
  }

  const supabase = await createServerClient();

  // ---- Path 1: Token Hash flow (verifyOtp server-side, cross-device safe) ----
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${classifyVerifyError(error.message)}`, origin),
      );
    }

    // Recovery: sessão temporária — manda direto pro form de nova senha
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/redefinir-senha', origin));
    }

    // Outros tipos (signup, email_change, etc.): rota padrão pós-login
    return routeAfterAuth(supabase, searchParams, origin);
  }

  // ---- Path 2: PKCE code flow (exchangeCodeForSession) ----
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL('/login?error=exchange_failed', origin));
    }

    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/redefinir-senha', origin));
    }

    // Magic link / OAuth: refresh session pra Auth Hook injetar org_id no JWT
    await supabase.auth.refreshSession();
    return routeAfterAuth(supabase, searchParams, origin);
  }

  // Sem token_hash nem code — link mal formado
  return NextResponse.redirect(new URL('/login?error=invalid_code', origin));
}

async function routeAfterAuth(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  searchParams: URLSearchParams,
  origin: string,
): Promise<NextResponse> {
  // ?next= seguro tem precedência (convites, etc.)
  const rawNext = searchParams.get('next');
  if (isSafeNextPath(rawNext)) {
    return NextResponse.redirect(new URL(rawNext, origin));
  }

  // Sem next: dashboard se membership existe, senão onboarding
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

function classifyVerifyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('expired')) return 'link_expired';
  if (m.includes('invalid') || m.includes('not found')) return 'invalid_code';
  return 'exchange_failed';
}
