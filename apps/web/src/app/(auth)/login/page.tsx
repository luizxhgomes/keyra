import type { Metadata } from 'next';

import { SignInCard } from '@/components/auth/SignInCard';
import { getSafeNext } from '@/lib/auth/safe-next';

export const metadata: Metadata = {
  title: 'Entrar · KEYRA',
  description: 'Acesse sua conta KEYRA com email e senha.',
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

/**
 * Tela de login — visual dark glassmorphism estilo HextaUI adaptado à
 * identidade KEYRA. Story auth.4 visual revamp (Fase B incrementada
 * 2026-05-04).
 *
 * `?next=` preservado pra fluxo de retorno pós-login (convite, etc.).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next = getSafeNext(rawNext);

  return <SignInCard next={next} />;
}
