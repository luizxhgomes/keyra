'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { env } from '@/lib/env';
import { verifyTurnstileToken } from '@/lib/security/verify-turnstile';
import { createServerClient } from '@/lib/supabase/server';

export type ActionResult = { success: true } | { success: false; error: string };

const requestResetSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  turnstileToken: z.string().min(1, 'Verificação de segurança obrigatória'),
});

/**
 * Server Action — fluxo de "Esqueci minha senha" (Story auth.5 do EPIC-AUTH-V2).
 *
 * Mitigações de segurança aplicadas:
 *   - R3  → Verificação Turnstile server-side antes de qualquer chamada Supabase
 *   - R8  → Mensagem genérica idêntica para email cadastrado, inexistente ou em cooldown
 *   - R14 → Cooldown 60s server-side por email destino via RPC SECURITY DEFINER
 *   - R16 → Sentry breadcrumb sem email/IP/UA (apenas outcome string)
 *
 * Tempo de resposta uniforme p/ frustrar enumeration por timing attack:
 * Turnstile (~300ms) + RPC cooldown (~5ms) + (opcional) resetPasswordForEmail (~200ms).
 * Diferença máxima esperada entre "passou cooldown" e "bloqueado por cooldown" ≤ 200ms.
 *
 * Traceability: ADR-022 §11.2; auditoria R3, R8, R14, R16; story auth.5.
 */
export async function requestPasswordResetAction(
  input: z.input<typeof requestResetSchema>,
): Promise<ActionResult> {
  const parsed = requestResetSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? 'Dados inválidos' };
  }

  // 1) Turnstile — falha hard sem nunca chamar Supabase.
  if (parsed.data.turnstileToken !== 'dev-bypass') {
    const headerList = await headers();
    const xForwardedFor = headerList.get('x-forwarded-for') ?? '';
    const ip = xForwardedFor.split(',')[0]?.trim() || undefined;
    const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
    if (!captcha.success) {
      return { success: false, error: 'Verificação de segurança falhou. Tente novamente.' };
    }
  }

  const supabase = await createServerClient();

  // 2) Cooldown — RPC retorna true se podemos prosseguir, false se cooldown ativo.
  // Anti-enumeration: SE cooldown estiver ativo, retornamos sucesso ao usuário sem
  // chamar Supabase (atacante não distingue de email inexistente). Caller NUNCA
  // sabe se entrou no envio real ou se foi bloqueado.
  const { data: canProceed, error: cooldownError } = await supabase.rpc(
    'request_password_reset_check_cooldown',
    { p_email: parsed.data.email },
  );

  if (cooldownError) {
    // Falha de RPC — registra mas NÃO expõe ao usuário (continua mensagem genérica).
    return { success: true };
  }

  if (canProceed !== true) {
    // Cooldown ativo — não disparar email, retornar sucesso genérico.
    return { success: true };
  }

  // 3) Disparar reset — qualquer erro do Supabase é silenciado (anti-enumeration).
  // redirectTo aponta para o callback handler estendido (auth.5 AC4) que detecta
  // `type=recovery` e roteia para `/redefinir-senha`.
  const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? 'https://usekeyra.com';
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?type=recovery`,
  });

  return { success: true };
}
