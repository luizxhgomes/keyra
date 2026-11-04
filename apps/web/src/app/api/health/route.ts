import { NextResponse } from 'next/server';

import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Checagem de saúde com consulta real ao banco. O cron diário da Vercel chama
 * esta rota, o que também impede a pausa do Supabase Free (1 semana sem uso).
 * Dispensável quando o projeto for para um plano pago.
 */
export async function GET() {
  const supabase = await createServerClient();
  const { error } = await supabase.from('legal_documents_current').select('version').limit(1);

  return NextResponse.json({ ok: !error }, { status: error ? 503 : 200 });
}
