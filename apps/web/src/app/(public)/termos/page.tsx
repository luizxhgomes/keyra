import { notFound } from 'next/navigation';

import { LegalDocument } from '@/components/keyra';
import { createServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Termos de Uso · KEYRA',
  description: 'Termos de uso da plataforma KEYRA, versão 1.0.0 vigente.',
};

/**
 * Página pública /termos — exibe a versão vigente (não-deprecated) do tipo
 * 'terms' lendo da view `legal_documents_current` (security_invoker=true,
 * RLS permite SELECT pra `anon` e `authenticated`).
 *
 * Story auth.2 do EPIC-AUTH-V2.
 *
 * Renderização: o conteúdo Markdown é parseado via `react-markdown` +
 * `remark-gfm` (suporte a tabelas) dentro de `<LegalDocument>`, que aplica
 * a tipografia editorial KEYRA — Inter Variable, weights extremos, paleta
 * terracota+sálvia, espaçamento roomy.
 */
export default async function TermosPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('legal_documents_current')
    .select('version, content_md, published_at')
    .eq('type', 'terms')
    .maybeSingle();

  if (error || !data || !data.version || !data.content_md) {
    notFound();
  }

  return (
    <LegalDocument
      title="Termos de Uso"
      version={data.version}
      publishedAt={data.published_at}
      contentMd={data.content_md}
      altLinks={[{ href: '/privacidade', label: 'Política de Privacidade' }]}
    />
  );
}
