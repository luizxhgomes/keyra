import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage, StatusBadge, alertSeverityToBadge } from '@/components/keyra';

import { getActiveAlerts } from './actions';

const SEVERITY_BORDER: Record<'warning' | 'critical' | 'info', string> = {
  warning: 'border-amber-500',
  critical: 'border-destructive',
  info: 'border-blue-500',
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

  if (result.data.length === 0) return null;

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
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  a.severity === 'critical'
                    ? 'text-destructive'
                    : a.severity === 'warning'
                      ? 'text-amber-700'
                      : 'text-blue-700'
                }`}
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
