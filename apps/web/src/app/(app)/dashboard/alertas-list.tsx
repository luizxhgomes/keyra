'use client';

import { CheckCircle2 } from 'lucide-react';

import { useDismissedAlerts } from '@/lib/hooks/use-dismissed-alerts';

/**
 * AlertasList — bisect step 2: hook adicionado, mas resultado ignorado.
 *
 * Se ainda renderizar → bug é no `<AlertCard>` (framer-motion).
 * Se quebrar → bug é no `useSyncExternalStore` do `useDismissedAlerts`.
 */
export function AlertasList({ orgId }: { orgId: string }) {
  // Chama o hook mas ignora resultado — só pra testar hidratação.
  useDismissedAlerts(orgId);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="mb-1 rounded-full bg-muted p-3">
        <CheckCircle2
          className="h-6 w-6 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        Nenhum alerta esta semana
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Sua operação está sob controle. Quando margem cair, falta subir ou estoque baixar, você vê aqui.
      </p>
    </div>
  );
}
