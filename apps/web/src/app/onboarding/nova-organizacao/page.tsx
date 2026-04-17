import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { getActiveOrgId, getCurrentUser } from '@/lib/auth/get-current-user';

import { OnboardingForm } from './onboarding-form';

export const metadata: Metadata = {
  title: 'Criar sua clínica',
  description: 'Em 30 segundos você começa a usar o KEYRA.',
};

/**
 * Onboarding — create the first organization.
 *
 * Access rules:
 *   - Must be logged in (else → /login).
 *   - If already has a membership → /dashboard (skip onboarding).
 *
 * Rendered OUTSIDE the `(app)` route group so there's no Sidebar / BottomNav.
 * This is the "naked" auth-adjacent shell.
 *
 * Traceability: FR-MT-01 (user can create first org), ADR-011.
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const orgId = await getActiveOrgId();
  if (orgId) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-primary">
            KEYRA
          </Link>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Onboarding · passo 1 de 1
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Vamos criar sua clínica
            </h1>
            <p className="text-sm text-muted-foreground">
              Em 30 segundos você começa. Depois você completa endereço, logo e equipe
              quando quiser.
            </p>
          </div>

          {!user.email_confirmed_at ? (
            <div
              className="mb-4 rounded-md border border-alerta/40 bg-alerta/10 px-4 py-3 text-xs text-foreground"
              role="note"
            >
              Seu e-mail ainda não foi confirmado. Abra o link que enviamos para{' '}
              <span className="font-medium">{user.email}</span> antes de começar.
            </div>
          ) : null}

          <OnboardingForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Você entrou como <span className="font-medium">{user.email}</span>.
        </p>
      </div>
    </main>
  );
}
