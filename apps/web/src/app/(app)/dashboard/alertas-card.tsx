import Link from 'next/link';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  EmptyState,
  ErrorMessage,
  StatusBadge,
  alertSeverityToBadge,
} from '@/components/keyra';

import { getActiveAlerts } from './actions';

/**
 * Cores de borda lateral e do ícone usam **tokens semânticos** alinhados
 * com o `<StatusBadge>` (`alertSeverityToBadge`). Story 5.7 removeu o
 * `border-blue-500` / `text-blue-700` inline, deixando o `<StatusBadge>`
 * como única fonte de verdade do status no pill e os tokens (`border-info`,
 * `text-info`) na borda lateral. Sem duplicação.
 */
const SEVERITY_BORDER: Record<'warning' | 'critical' | 'info', string> = {
  warning: 'border-amber-500',
  critical: 'border-destructive',
  info: 'border-info',
};

const SEVERITY_ICON: Record<'warning' | 'critical' | 'info', string> = {
  warning: 'text-amber-700',
  critical: 'text-destructive',
  info: 'text-info',
};

export async function AlertasCard() {
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

  // Empty state positivo: não some quando 0 alertas — reforça que está
  // tudo sob controle (Status Quo a favor). Story 5.7.
  if (result.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
          <CardDescription>
            Sinais que merecem sua atenção esta semana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CheckCircle2}
            title="Nenhum alerta esta semana"
            description="Sua operação está sob controle. Quando margem cair, falta subir ou estoque baixar, você vê aqui."
          />
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
        <ul className="space-y-2">
          {result.data.map((a) => (
            <li
              key={a.id}
              role={a.severity === 'critical' ? 'alert' : undefined}
              className={`flex items-start gap-3 rounded-md border-l-4 bg-card p-3 ${
                SEVERITY_BORDER[a.severity]
              }`}
            >
              <AlertTriangle
                className={`mt-0.5 h-4 w-4 shrink-0 ${SEVERITY_ICON[a.severity]}`}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{a.title}</p>
                  <StatusBadge
                    status={alertSeverityToBadge(a.severity)}
                    size="sm"
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.description}
                </p>
                <Link
                  href={a.href}
                  className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Investigar →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
