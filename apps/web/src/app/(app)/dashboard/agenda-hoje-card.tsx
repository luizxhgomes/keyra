import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarClock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorMessage, StatusBadge, appointmentStatusToBadge } from '@/components/keyra';

import { getAppointmentsToday } from './actions';

export async function AgendaHojeCard() {
  const result = await getAppointmentsToday();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda de hoje</CardTitle>
        {result.ok ? (
          <CardDescription>
            {result.data.total} {result.data.total === 1 ? 'agendamento' : 'agendamentos'}
            {result.data.done > 0
              ? ` · ${result.data.done} concluído${result.data.done > 1 ? 's' : ''}`
              : ''}
            {result.data.cancelled > 0
              ? ` · ${result.data.cancelled} cancelado${result.data.cancelled > 1 ? 's' : ''}`
              : ''}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {!result.ok ? (
          <ErrorMessage detail={result.error} />
        ) : result.data.rows.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nada agendado para hoje"
            description="Aproveita pra rever o que vem essa semana ou agenda alguém novo."
            action={{ label: 'Abrir agenda', href: '/agenda' }}
            className="py-8"
          />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {result.data.rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium tabular-nums">
                      {format(new Date(r.starts_at), 'HH:mm', { locale: ptBR })}
                      {' · '}
                      {r.customer_name ?? 'Cliente avulso'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.service_name} · {r.professional_name}
                    </p>
                  </div>
                  <StatusBadge status={appointmentStatusToBadge(r.status)} size="sm" />
                </li>
              ))}
            </ul>
            {result.data.total >= 10 ? (
              <p className="mt-3 text-xs">
                <Link href="/agenda" className="text-primary hover:underline">
                  Ver todos →
                </Link>
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
