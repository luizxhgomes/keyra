import Link from 'next/link';

export const metadata = {
  title: 'Esqueci minha senha · KEYRA',
};

/**
 * Placeholder até a Story auth.5 implementar `resetPasswordForEmail`.
 * Visual coerente com SignInCard / SignUpCard (cores light KEYRA).
 */
export default function EsqueciSenhaPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% 0%, hsl(21 56% 50% / 0.08), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 ease-out hover:scale-110">
          <span className="text-xl font-bold tracking-tight">K</span>
        </div>

        <h2 className="mb-1 text-xl font-semibold text-foreground">Recuperação de senha</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          A recuperação automática estará disponível em breve. Enquanto isso, escreva pra{' '}
          <a
            href="mailto:suporte@usekeyra.com"
            className="font-semibold text-primary underline underline-offset-2 transition-colors duration-150 hover:text-primary-700"
          >
            suporte@usekeyra.com
          </a>{' '}
          e nossa equipe redefine sua senha em até 1 dia útil.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition-all duration-200 hover:bg-primary-600 hover:shadow-md"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
