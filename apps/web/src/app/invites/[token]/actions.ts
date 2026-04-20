'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createServerClient } from '@/lib/supabase/server';

const inputSchema = z.object({
  token: z.string().min(16).max(128),
});

export type AcceptResult =
  | { ok: true; orgId: string }
  | { ok: false; error: string };

/**
 * Consumes an invite token atomically via the `accept_organization_invite` RPC.
 * Caller MUST be authenticated — the RPC itself re-validates via auth.uid().
 */
export async function acceptInvite(
  input: z.infer<typeof inputSchema>,
): Promise<AcceptResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Token inválido.' };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('accept_organization_invite', {
    p_token: parsed.data.token,
  });

  if (error) {
    return { ok: false, error: translatePostgresError(error.message) };
  }

  const orgId = typeof data === 'string' ? data : null;
  if (!orgId) {
    return { ok: false, error: 'Convite não pôde ser aceito.' };
  }

  // Force the switcher / layout to re-read membership.
  revalidatePath('/dashboard');
  revalidatePath('/');

  return { ok: true, orgId };
}

function translatePostgresError(message: string): string {
  if (message.includes('Convite não encontrado')) return 'Convite não encontrado ou já revogado.';
  if (message.includes('já aceito')) return 'Convite já utilizado.';
  if (message.includes('expirado')) return 'Convite expirado — peça um novo.';
  if (message.includes('outro email')) return 'Convite enviado para outro email — faça login com a conta correta.';
  if (message.includes('Authentication required')) return 'Você precisa estar autenticado.';
  return message || 'Erro ao aceitar convite.';
}
