import Link from 'next/link';
import type { Metadata } from 'next';

import { getSafeNext } from '@/lib/auth/safe-next';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta KEYRA com um link mágico enviado por e-mail.',
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

/**
 * Login screen — magic link flow (ADR-010).
 *
 * Server Component shell. The form itself is a Client Component so we can
 * drive the two-phase UX (email input → "confira seu e-mail") without
 * round-tripping the full page.
 *
 * `?next=` é encaminhado ao formulário para sobreviver ao magic link e cair
 * de volta no destino original (ex.: `/invites/{token}`).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next = getSafeNext(rawNext);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-primary">
            KEYRA
          </Link>
          <p className="text-sm text-muted-foreground">
            Entre no seu financeiro operacional.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link
            href="/"
            className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Voltar para a página inicial
          </Link>
        </p>
      </div>
    </main>
  );
}
