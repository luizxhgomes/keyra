import type { Metadata } from 'next';

import { SignInCard } from '@/components/auth/SignInCard';
import { getSafeNext } from '@/lib/auth/safe-next';

export const metadata: Metadata = {
  title: 'Entrar · KEYRA',
  description: 'Acesse sua conta KEYRA com email e senha.',
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    password_changed?: string | string[];
    error?: string | string[];
  }>;
};

/**
 * Tela de login — visual dark glassmorphism estilo HextaUI adaptado à
 * identidade KEYRA. Story auth.4 visual revamp (Fase B incrementada
 * 2026-05-04).
 *
 * `?next=` preservado pra fluxo de retorno pós-login (convite, etc.).
 * `?password_changed=1` exibe banner verde após reset bem-sucedido (Story auth.5).
 * `?error=link_expired|no_recovery_session|exchange_failed|invalid_code` exibe banner
 * vermelho com CTA específico (Story auth.5).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next = getSafeNext(rawNext);

  const passwordChanged =
    (Array.isArray(sp.password_changed) ? sp.password_changed[0] : sp.password_changed) === '1';
  const errorCode = Array.isArray(sp.error) ? sp.error[0] : sp.error;

  return <SignInCard next={next} passwordChanged={passwordChanged} errorCode={errorCode ?? null} />;
}
