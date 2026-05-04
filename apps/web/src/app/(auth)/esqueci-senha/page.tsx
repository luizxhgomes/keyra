import Link from 'next/link';

export const metadata = {
  title: 'Esqueci minha senha · KEYRA',
};

/**
 * Placeholder até a Story auth.5 implementar `resetPasswordForEmail`.
 * Visual coerente com SignInGlassCard / SignUpGlassCard (dark glass).
 */
export default function EsqueciSenhaPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#121212] px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(189,125,77,0.15), transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 text-center shadow-2xl ring-1 ring-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 shadow-lg ring-1 ring-white/20 transition-transform duration-300 ease-out hover:scale-110">
          <span className="text-xl font-bold tracking-tight text-white">K</span>
        </div>

        <h2 className="mb-1 text-xl font-semibold text-white">Recuperação de senha</h2>
        <p className="mt-3 text-sm text-white/70">
          A recuperação automática estará disponível em breve. Enquanto isso, escreva pra{' '}
          <a
            href="mailto:suporte@usekeyra.com"
            className="font-medium text-white underline underline-offset-2 transition-colors duration-150 hover:text-white/80"
          >
            suporte@usekeyra.com
          </a>{' '}
          e nossa equipe redefine sua senha em até 1 dia útil.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition-all duration-200 hover:bg-white/[0.18] hover:shadow-lg"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
