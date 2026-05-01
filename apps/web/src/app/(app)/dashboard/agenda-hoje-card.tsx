import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { getAppointmentsToday } from './actions';

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Agendado',
  done: 'Realizado',
  cancelled: 'Cancelado',
  no_show: 'Falta',
};

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-900',
  done: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-stone-200 text-stone-700',
  no_show: 'bg-amber-100 text-amber-900',
};

export async function AgendaHojeCard() {
  const result = await getAppointmentsToday();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda de hoje</CardTitle>
        {result.ok ? (
          <CardDescription>
            {result.data.total} {result.data.total === 1 ? 'agendamento' : 'agendamentos'}
            {result.data.done > 0 ? ` · ${result.data.done} concluído${result.data.done > 1 ? 's' : ''}` : ''}
            {result.data.cancelled > 0
              ? ` · ${result.data.cancelled} cancelado${result.data.cancelled > 1 ? 's' : ''}`
              : ''}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {!result.ok ? (
          <p className="text-sm text-destructive">Erro: {result.error}</p>
        ) : result.data.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem agendamentos para hoje.{' '}
            <Link href="/agenda" className="text-primary hover:underline">
              Use a agenda
            </Link>{' '}
            para criar.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {result.data.rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2">
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
                  <Badge variant="secondary" className={STATUS_BADGE[r.status]}>
                    {STATUS_LABEL[r.status]}
                  </Badge>
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
