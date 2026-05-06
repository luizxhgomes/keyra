import type { Metadata } from 'next';

import { RequestResetCard } from '@/components/auth/RequestResetCard';

export const metadata: Metadata = {
  title: 'Esqueci minha senha · KEYRA',
  description: 'Receba um link no seu e-mail para redefinir a senha do KEYRA.',
};

/**
 * Tela de pedido de redefinição de senha — Story auth.5 do EPIC-AUTH-V2.
 *
 * Substitui o placeholder anterior que direcionava pra suporte@usekeyra.com.
 * Toda lógica de cooldown, Turnstile e anti-enumeration vive na Server Action
 * `requestPasswordResetAction` em `./actions.ts`.
 */
export default function EsqueciSenhaPage() {
  return <RequestResetCard />;
}
