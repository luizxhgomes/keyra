'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { isSafeNextPath } from '@/lib/auth/safe-next';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Server Action result contract used across KEYRA.
 *
 * Every Server Action returns either `{ success: true, data }` or
 * `{ success: false, error }`. No throws to the client — errors are UX state.
 */
export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  /** Caminho relativo de retorno pós-magic-link. Validado de novo aqui
   * com `isSafeNextPath` por defesa em profundidade — entradas inválidas
   * são silenciosamente descartadas. */
  next: z.string().optional(),
});

/**
 * Sends a Supabase magic link to the user's email.
 *
 * The email redirect points to our own `/auth/callback` route handler, which
 * exchanges the one-time `code` for a session and then routes the user to the
 * dashboard (if they have a membership) or to onboarding (first login ever).
 *
 * Traceability: ADR-010 (Supabase Auth — passwordless primary).
 */
export async function signInWithOtpAction(
  input: z.input<typeof signInSchema>,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? 'E-mail inválido' };
  }

  const supabase = await createServerClient();

  // Resolve origin for emailRedirectTo. In production this is
  // https://usekeyra.vercel.app; in dev, whatever the dev server uses.
  const headerList = await headers();
  const origin =
    headerList.get('origin') ??
    (headerList.get('host')
      ? `${headerList.get('x-forwarded-proto') ?? 'https'}://${headerList.get('host')}`
      : 'https://usekeyra.vercel.app');

  const safeNext = isSafeNextPath(parsed.data.next) ? parsed.data.next : null;
  const callbackUrl = safeNext
    ? `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`
    : `${origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl,
      // shouldCreateUser defaults to true — a brand-new email auto-signs-up
      // and lands in the onboarding flow (no separate signup page per ADR-010).
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      success: false,
      error: translateSupabaseError(error.message),
    };
  }

  return { success: true };
}

/**
 * Surface Supabase's English-ish error strings as user-friendly PT-BR.
 * Narrow whitelist — unknown errors fall back to a generic message so we
 * never leak internal details.
 */
function translateSupabaseError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }
  if (lower.includes('invalid') && lower.includes('email')) {
    return 'E-mail inválido.';
  }
  if (lower.includes('signup') && lower.includes('disabled')) {
    return 'Cadastros estão temporariamente desabilitados.';
  }
  return 'Não foi possível enviar o link. Tente novamente em instantes.';
}
