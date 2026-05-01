import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { getActiveAlerts } from './actions';

const SEVERITY_CLASS: Record<'warning' | 'critical' | 'info', string> = {
  warning: 'border-amber-500 bg-amber-50 text-amber-900',
  critical: 'border-destructive bg-destructive/10 text-destructive',
  info: 'border-blue-500 bg-blue-50 text-blue-900',
};

export async function AlertasCard() {
  const result = await getActiveAlerts();

  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">Erro: {result.error}</p>
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
              className={`flex items-start gap-3 rounded-md border-l-4 p-3 ${
                SEVERITY_CLASS[a.severity]
              }`}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs">{a.description}</p>
                <Link
                  href={a.href}
                  className="mt-1 inline-block text-xs font-medium underline"
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
