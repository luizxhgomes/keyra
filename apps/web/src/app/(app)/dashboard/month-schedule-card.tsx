import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/keyra';
import { cn } from '@/lib/utils';

import { getMonthScheduleHeatmap } from './actions';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Calendário mensal com destaque por densidade de agendamentos.
 * Inspirado em: dashboard reference (Schedule card).
 *
 * Adaptação Editorial Beauty Luxury:
 * - Dias sem agendamento: muted-foreground discreto
 * - Dias com agendamento: paleta KEYRA (mocha → terracota → cocoa) por intensidade
 * - Hoje: pill cocoa preenchido
 * - Fim de semana: tom suavizado (mocha-300)
 */
export async function MonthScheduleCard() {
  const result = await getMonthScheduleHeatmap();

  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={result.error} />
        </CardContent>
      </Card>
    );
  }

  const { monthLabel, firstWeekday, days, totalAppointments } = result.data;

  // Espaços vazios antes do primeiro dia (alinhamento com weekday).
  const blanks = Array.from({ length: firstWeekday });

  return (
    <Card className="@container flex h-full flex-col shadow-warm-sm">
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between">
          <CardTitle className="font-serif text-xl capitalize">{monthLabel}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {totalAppointments}{' '}
            {totalAppointments === 1 ? 'agendamento' : 'agendamentos'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((wd) => (
            <span
              key={wd}
              className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {wd}
            </span>
          ))}
          {blanks.map((_, i) => (
            <span key={`blank-${i}`} aria-hidden="true" />
          ))}
          {days.map((d) => (
            <div
              key={d.day}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-full text-sm tabular-nums transition-colors',
                d.isToday
                  ? 'bg-cocoa-900 font-semibold text-ivory-50'
                  : d.intensity === 'high'
                    ? 'bg-terracotta-500/20 font-medium text-terracotta-700'
                    : d.intensity === 'mid'
                      ? 'bg-amber-300/30 text-cocoa-800'
                      : d.intensity === 'low'
                        ? 'bg-mocha-300/20 text-cocoa-700'
                        : d.isWeekend
                          ? 'text-mocha-300'
                          : 'text-muted-foreground hover:bg-ivory-100',
              )}
              title={d.count > 0 ? `${d.count} agendamento(s)` : undefined}
            >
              {d.day}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
