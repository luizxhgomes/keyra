import { requireAuth } from '@/lib/auth/require-auth';
import { ErrorMessage } from '@/components/keyra';

import { getReceipts } from './actions';
import { ComprovantesClient } from './comprovantes-client';

/**
 * Comprovantes Inteligentes (EPIC-COMPROVANTES / Phase 7.0).
 * Anexar comprovante (foto/print/PDF/...) → IA lê → revisão humana → transação.
 * O header "Financeiro" + sub-nav vêm do layout do segmento.
 */
export default async function ComprovantesPage() {
  await requireAuth();
  const res = await getReceipts();

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground">Comprovantes</h2>
        <p className="text-sm text-muted-foreground">
          Anexe um comprovante — uma foto, um print ou um PDF. A IA lê os dados e você confirma o
          lançamento. O arquivo fica guardado com segurança.
        </p>
      </div>

      {res.ok ? (
        <ComprovantesClient initialReceipts={res.data} />
      ) : (
        <ErrorMessage detail={res.error} />
      )}
    </section>
  );
}
