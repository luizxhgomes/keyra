import { notFound } from 'next/navigation';

import { LegalDocument } from '@/components/keyra';
import { createServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Política de Privacidade · KEYRA',
  description: 'Política de privacidade da plataforma KEYRA, versão 1.0.0 vigente.',
};

export default async function PrivacidadePage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('legal_documents_current')
    .select('version, content_md, published_at')
    .eq('type', 'privacy')
    .maybeSingle();

  if (error || !data || !data.version || !data.content_md) {
    notFound();
  }

  return (
    <LegalDocument
      title="Política de Privacidade"
      version={data.version}
      publishedAt={data.published_at}
      contentMd={data.content_md}
      altLinks={[{ href: '/termos', label: 'Termos de Uso' }]}
    />
  );
}
