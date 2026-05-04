import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Termos de Uso · KEYRA',
  description: 'Termos de uso da plataforma KEYRA — vigente versão 1.0.0',
};

/**
 * Página pública /termos — exibe a versão vigente (não-deprecated) do tipo
 * 'terms' lendo da view `legal_documents_current` (security_invoker=true,
 * RLS permite SELECT pra `authenticated`).
 *
 * Story auth.2 do EPIC-AUTH-V2.
 *
 * Renderização: content_md em <article> com `whitespace-pre-wrap` + tipografia
 * Tailwind `prose`. Sem react-markdown nesta versão — texto puro com tipografia
 * é suficiente para v1.0.0; rich rendering pode evoluir em sprint futura.
 */
export default async function TermosPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('legal_documents_current')
    .select('version, content_md, published_at')
    .eq('type', 'terms')
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">KEYRA</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Versão {data.version} · vigente desde{' '}
          {data.published_at
            ? new Date(data.published_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : '—'}
        </p>
      </header>

      <article className="prose prose-sm max-w-none whitespace-pre-wrap font-sans text-foreground">
        {data.content_md}
      </article>

      <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← Voltar à página inicial
        </Link>
        {' · '}
        <Link href="/privacidade" className="hover:text-foreground">
          Política de Privacidade
        </Link>
      </footer>
    </main>
  );
}
