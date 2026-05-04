import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Esqueci minha senha · KEYRA',
};

/**
 * Placeholder até a Story auth.5 implementar `resetPasswordForEmail`.
 *
 * Quando auth.5 sair: form aqui pede e-mail, dispara `resetPasswordForEmail`,
 * usuário recebe link que leva pra /redefinir-senha onde define senha nova.
 *
 * Magic link de login está REMOVIDO da plataforma — não vai voltar nem aqui.
 */
export default function EsqueciSenhaPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Recuperação de senha</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A recuperação automática estará disponível em breve. Enquanto isso, escreva pra{' '}
          <a
            href="mailto:suporte@usekeyra.com"
            className="font-medium text-primary hover:underline"
          >
            suporte@usekeyra.com
          </a>{' '}
          e nossa equipe redefine sua senha em até 1 dia útil.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/login">Voltar ao login</Link>
        </Button>
      </div>
    </main>
  );
}
