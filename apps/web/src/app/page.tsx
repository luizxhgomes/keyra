import Link from 'next/link';

/**
 * Public landing — placeholder enquanto a Phase 5 não traz a página de marketing
 * definitiva. Respeita a paleta terracota e leva direto para o login.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <section className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Em construção
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">KEYRA</h1>
          <p className="text-lg text-muted-foreground">
            Financeiro operacional para estética. A agenda dispara o financeiro automaticamente.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entrar
          </Link>
          <a
            href="https://usekeyra.com"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Saber mais
          </a>
        </div>

        <p className="max-w-sm text-xs text-muted-foreground">
          Login passwordless, organizações, equipe e cadastros já no ar. A agenda
          inteligente entra na próxima Sprint.
        </p>
      </section>
    </main>
  );
}
