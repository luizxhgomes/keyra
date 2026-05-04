import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CadastroForm } from './cadastro-form';
import { getCurrentUser } from '@/lib/auth/get-current-user';

export const metadata = {
  title: 'Criar conta · KEYRA',
  description: 'Crie sua conta KEYRA — gestão financeira para clínicas de estética',
};

export default async function CadastroPage() {
  // Se já autenticado, redirecionar pra dashboard
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">KEYRA</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece a gerir o financeiro da sua clínica.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <CadastroForm />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← Voltar para a página inicial
        </Link>
      </p>
    </main>
  );
}
