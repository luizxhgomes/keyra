/**
 * Login placeholder.
 *
 * TODO (Story 1.2): implementar fluxo email + senha + magic link com Supabase Auth
 * (ADR-010). Validação react-hook-form + Zod. Empty/error/loading states obrigatórios
 * conforme `00-design-principles.md` §9.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Entrar no KEYRA</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tela de login será implementada na Story 1.2 (Supabase Auth + email + magic link).
        </p>
        <div
          aria-live="polite"
          className="mt-6 rounded-md border border-dashed border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground"
        >
          Em breve: formulário com email, senha e link mágico.
        </div>
      </div>
    </main>
  );
}
