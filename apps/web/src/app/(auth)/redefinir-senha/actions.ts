'use server';

import { z } from 'zod';

import { createServerClient } from '@/lib/supabase/server';

export type ActionResult = { success: true } | { success: false; error: string };

const setNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, 'Mínimo 10 caracteres')
      .regex(/[a-z]/, 'Inclua pelo menos uma letra minúscula')
      .regex(/[A-Z]/, 'Inclua pelo menos uma letra maiúscula')
      .regex(/\d/, 'Inclua pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

/**
 * Server Action — define nova senha após clicar no link de recovery.
 * Story auth.5 do EPIC-AUTH-V2.
 *
 * Pré-requisito: usuário precisa ter sessão temporária de recovery (criada
 * pelo callback handler em `/auth/callback?type=recovery`). Se não tiver
 * sessão, retorna erro estruturado.
 *
 * Após troca de senha bem-sucedida:
 *   - signOut({ scope: 'global' }) invalida todas as sessões refresh-token-ativas
 *     (mitiga R11 — boa prática anti-account-takeover quando reset é resultado
 *     de comprometimento)
 *   - Retorna `{ success: true }` para o client navegar via `router.push`.
 *
 * Por que NÃO `redirect()` server-side aqui (mudança da Story auth.8):
 *   server-side redirect interrompe o fluxo antes do client emitir o
 *   BroadcastChannel `password_reset_completed`, que sincroniza outras abas
 *   abertas em `/esqueci-senha`. O client é responsável por:
 *   1. postar o broadcast e
 *   2. fazer `router.push('/login?password_changed=1')`.
 *
 * Traceability: ADR-022 §11.2; auditoria R11; story auth.5 AC6 + auth.8 AC2.
 */
export async function setNewPasswordAction(
  input: z.input<typeof setNewPasswordSchema>,
): Promise<ActionResult> {
  const parsed = setNewPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? 'Dados inválidos' };
  }

  const supabase = await createServerClient();

  // Confirma sessão recovery — se não houver user, sessão expirou ou link já foi usado.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Sessão de recuperação expirada. Solicite um novo link.',
    };
  }

  // Atualiza senha. Supabase aplica novamente as regras de complexidade configuradas
  // em prod (`auth.0` — min 10 + lower+upper+digit). Defesa em profundidade após Zod.
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (updateError) {
    // Mensagens conhecidas do Supabase para senha fraca / repetida.
    return {
      success: false,
      error:
        updateError.message === 'New password should be different from the old password.'
          ? 'A nova senha precisa ser diferente da atual.'
          : 'Não foi possível atualizar a senha. Tente novamente.',
    };
  }

  // Invalida todas as sessões refresh-token-ativas (R11). User precisa logar de novo
  // em todos os dispositivos com a senha nova — incluindo a aba/sessão atual.
  await supabase.auth.signOut({ scope: 'global' });

  return { success: true };
}
