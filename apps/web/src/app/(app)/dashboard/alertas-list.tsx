'use client';

import { CheckCircle2 } from 'lucide-react';

import type { Alert } from './actions';

/**
 * AlertasList — versão MINIMAL bisect (HOTFIX 2026-05-02).
 *
 * Versão completa (com useDismissedAlerts + AlertCard motion + EmptyState
 * importado de Server) está em git. Esta versão isola se o bug é:
 * - hook `useSyncExternalStore` (`useDismissedAlerts`)
 * - componente `<AlertCard>` (Client com framer-motion)
 * - import Client → Server (`EmptyState`)
 *
 * Se esta versão carregar → bug está em um dos itens acima → re-adiciono
 * peça por peça. Se ainda quebrar → bug é mais fundo (AlertasCard parent).
 */
export function AlertasList({ alerts: _alerts, orgId: _orgId }: { alerts: Alert[]; orgId: string }) {
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
