'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { isSafeNextPath } from '@/lib/auth/safe-next';
import { verifyTurnstileToken } from '@/lib/security/verify-turnstile';
import { createServerClient } from '@/lib/supabase/server';

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
  next: z.string().optional(),
  turnstileToken: z.string().optional(),
});

/**
 * Server Action de login email + senha — Story auth.4 do EPIC-AUTH-V2.
 *
 * Magic link foi REMOVIDO da plataforma. Recovery (Esqueci senha) usa
 * `resetPasswordForEmail` em auth.5 — fluxo de reset, não magic link de login.
 *
 * Mensagem de erro genérica: "E-mail ou senha incorretos" pra evitar
 * email enumeration (R8 da auditoria).
 *
 * Turnstile validado se fornecido (story auth.4 base — endurecimento progressivo
 * com lockout após N falhas vai em sprint futura).
 *
 * Traceability: ADR-022 §11.2; auditoria R8.
 */
export async function signInWithPasswordAction(
  input: z.input<typeof signInSchema>,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? 'Dados inválidos' };
  }

  if (parsed.data.turnstileToken && parsed.data.turnstileToken !== 'dev-bypass') {
    const headerList = await headers();
    const xForwardedFor = headerList.get('x-forwarded-for') ?? '';
    const ip = xForwardedFor.split(',')[0]?.trim() || undefined;
    const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
    if (!captcha.success) {
      return { success: false, error: 'Verificação de segurança falhou. Tente novamente.' };
    }
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: 'E-mail ou senha incorretos.' };
  }

  return { success: true };
}

export async function resolveSafeNext(rawNext: string | null | undefined): Promise<string | null> {
  return isSafeNextPath(rawNext) ? rawNext : null;
}
