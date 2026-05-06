import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { NewPasswordCard } from '@/components/auth/NewPasswordCard';
import { createServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Redefinir senha · KEYRA',
  description: 'Escolha uma senha nova para sua conta KEYRA.',
};

/**
 * Tela de redefinição de senha — Story auth.5 do EPIC-AUTH-V2.
 *
 * Acesso protegido: requer sessão temporária de recovery (criada pelo callback
 * handler ao validar `?type=recovery&code=...` no email link). Sem sessão,
 * redireciona pra /login com mensagem amigável.
 *
 * Após submit bem-sucedido, action redireciona pra /login?password_changed=1.
 */
export default async function RedefinirSenhaPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=no_recovery_session');
  }

  return <NewPasswordCard />;
}
