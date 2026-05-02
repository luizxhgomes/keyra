import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/keyra';
import { requireAuth } from '@/lib/auth/require-auth';

import { getActiveAlerts } from './actions';
import { AlertasList } from './alertas-list';

/**
 * `<AlertasCard>` (Server Component) — busca alertas via `getActiveAlerts`
 * e delega renderização para `<AlertasList>` (Client) que aplica filtro de
 * silenciados, cap 3+5+5 e renderiza usando `<AlertCard>` como fonte única.
 *
 * Story 6.3 substituiu o markup inline (border-l-4 + StatusBadge — duas
 * fontes de verdade) por `<AlertCard>` (já existente em `components/keyra/`,
 * com bg colorido + ícone canônico por severity). Persistência de dismiss
 * via localStorage (P2 + P3 do pre-work — `safeLocalStorage` +
 * `useDismissedAlerts` com `useSyncExternalStore`).
 */
export async function AlertasCard() {
  await requireAuth();
  const result = await getActiveAlerts();

  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={result.error} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
        <CardDescription>
          Sinais que merecem sua atenção esta semana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertasList />
      </CardContent>
    </Card>
  );
}
