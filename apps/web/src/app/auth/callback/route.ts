import { NextResponse, type NextRequest } from 'next/server';

import { getActiveOrgId } from '@/lib/auth/get-current-user';
import { isSafeNextPath } from '@/lib/auth/safe-next';
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
  const type = searchParams.get('type');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Supabase surfaces errors (expired link, etc.) via query params directly.
  if (errorParam) {
    const reason = mapSupabaseAuthError(errorParam, errorDescription);
    // Recovery links expirados também voltam pro login com sinal específico
    // para a UI exibir CTA "Solicite um novo link" (Story auth.5 AC4).
    const target = type === 'recovery' ? `/login?error=${reason}` : `/login?error=${reason}`;
    return NextResponse.redirect(new URL(target, origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid_code', origin));
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=exchange_failed', origin));
  }

  // Recovery flow (Story auth.5): a sessão criada acima é uma sessão temporária
  // de recuperação. Não rotear pra dashboard nem onboarding — manda direto
  // pra tela de definir nova senha, onde a Server Action chamará
  // updateUser({ password }) e em seguida signOut({ scope: 'global' }).
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/redefinir-senha', origin));
  }

  // Session cookies are now set. Force one more refresh so the Auth Hook
  // gets to run on the fresh session — this guarantees the JWT has the
  // `org_id` claim for returning users (users who already have membership)
  // and keeps the new-user path deterministic.
  await supabase.auth.refreshSession();

  // Se o magic link veio com `?next=` (ex.: aceite de convite), priorizamos
  // sempre que o caminho for seguro — o destino do convite resolve por conta
  // própria a UX correta (a página `/invites/[token]` mostra "aceitar",
  // "email diferente", "expirado" etc.). Sem isto, um convidado novo cairia
  // em `/onboarding/nova-organizacao` em vez do convite que disparou o login.
  const rawNext = searchParams.get('next');
  if (isSafeNextPath(rawNext)) {
    return NextResponse.redirect(new URL(rawNext, origin));
  }

  // Default: onboarding se não houver membership; dashboard caso contrário.
  // `getActiveOrgId()` lê o claim do JWT (ADR-012) com fallback em
  // `user_preferences` (migration 021), garantindo roteamento correto mesmo
  // antes do access token novo terminar de propagar.
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
