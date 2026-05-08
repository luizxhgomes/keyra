'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { getMonthCounts, type AgendaMonthCounts } from './actions';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  /** Data atualmente focada no calendário principal (controla qual mês mostrar). */
  currentDate: Date;
  /** Callback quando usuário seleciona um dia (navega o calendário principal). */
  onSelectDay: (date: Date) => void;
  /** Filtro de profissional para refletir nos counts. */
  professionalId: string | null;
}

/**
 * Mini-calendário lateral da agenda — pick rápido de dia + counts mensais.
 *
 * Inspirado em referência fornecida pela idealizadora (2026-05-08, Ref Prodless):
 * mini-cal à esquerda + estatística do período. Adaptado para Editorial Beauty
 * Luxury (paleta KEYRA: cocoa-900 selecionado, mocha-300 weekend, terracota dot
 * para dias com agendamento).
 *
 * Sincroniza counts via `getMonthCounts` quando muda de mês ou profissional.
 */
export function MiniCalendarSide({
  currentDate,
  onSelectDay,
  professionalId,
}: Props) {
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [counts, setCounts] = useState<AgendaMonthCounts | null>(null);

  // Pattern "adjust state during render" (React 19) — sincroniza mês visível
  // com `currentDate` da prop sem violar `react-hooks/set-state-in-effect`.
  const [prevDateKey, setPrevDateKey] = useState(currentDate.getTime());
  if (prevDateKey !== currentDate.getTime()) {
    setPrevDateKey(currentDate.getTime());
    setViewYear(currentDate.getFullYear());
    setViewMonth(currentDate.getMonth());
  }

  // Busca counts quando muda mês ou profissional. Sem setLoading no effect:
  // skeleton renderiza enquanto `counts === null` e dado antigo persiste
  // durante refetch (melhor UX que flicker).
  useEffect(() => {
    let cancelled = false;
    const monthDate = new Date(viewYear, viewMonth, 1)
      .toISOString()
      .slice(0, 10);
    getMonthCounts({
      monthDate,
      ...(professionalId ? { professionalId } : {}),
    })
      .then((data) => {
        if (!cancelled) setCounts(data);
      })
      .catch(() => {
        // silently ignore — sidebar tolerável sem counts
      });
    return () => {
      cancelled = true;
    };
  }, [viewYear, viewMonth, professionalId]);

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const today = new Date();
  const monthLabel = format(firstDay, 'MMMM yyyy', { locale: ptBR });

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const blanks = Array.from({ length: startWeekday });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const isSelected = (day: number) =>
    currentDate.getFullYear() === viewYear &&
    currentDate.getMonth() === viewMonth &&
    currentDate.getDate() === day;

  return (
    <div className="flex flex-col gap-4">
      {/* Mini-calendário */}
      <Card className="shadow-warm-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-base capitalize">
              {monthLabel}
            </CardTitle>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-ivory-100 hover:text-foreground"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-ivory-100 hover:text-foreground"
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {wd.charAt(0)}
              </span>
            ))}
            {blanks.map((_, i) => (
              <span key={`blank-${i}`} aria-hidden="true" />
            ))}
            {days.map((d) => {
              const wd = new Date(viewYear, viewMonth, d).getDay();
              const weekend = wd === 0 || wd === 6;
              const count = counts?.perDay[d] ?? 0;
              const selected = isSelected(d);
              const todayDay = isToday(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onSelectDay(new Date(viewYear, viewMonth, d))}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-md text-xs tabular-nums transition-colors',
                    selected
                      ? 'bg-cocoa-900 font-semibold text-ivory-50'
                      : todayDay
                        ? 'border border-cocoa-900 font-semibold text-cocoa-900'
                        : weekend
                          ? 'text-mocha-300 hover:bg-ivory-100'
                          : 'text-foreground hover:bg-ivory-100',
                  )}
                  aria-label={`${d} ${monthLabel}${count > 0 ? ` — ${count} agendamento${count > 1 ? 's' : ''}` : ''}`}
                  aria-pressed={selected}
                >
                  {d}
                  {count > 0 && !selected && (
                    <span
                      className="absolute bottom-1 h-1 w-1 rounded-full bg-terracotta-500"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Counts do mês */}
      <Card className="shadow-warm-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base">Resumo do mês</CardTitle>
        </CardHeader>
        <CardContent>
          {counts ? (
            <ul className="flex flex-col gap-2 text-sm">
              <CountRow label="Agendados" value={counts.totals.scheduled} dotClass="bg-amber-500" />
              <CountRow label="Concluídos" value={counts.totals.done} dotClass="bg-success-leaf" />
              <CountRow label="Cancelados" value={counts.totals.cancelled} dotClass="bg-mocha-300" />
              <CountRow label="Faltas" value={counts.totals.no_show} dotClass="bg-rust-800" />
            </ul>
          ) : (
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-mocha-300/20" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximo agendamento */}
      {counts?.next && (
        <Card className="shadow-warm-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays
                className="h-4 w-4 text-terracotta-500"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <CardTitle className="font-serif text-base">Próximo agendamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="font-medium text-foreground">{counts.next.serviceName}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(counts.next.starts_at), "EEE, d 'de' MMMM 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {counts.next.customerName ?? 'Cliente avulso'} · {counts.next.professionalName}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CountRow({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number;
  dotClass: string;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-foreground">
        <span className={cn('h-2 w-2 rounded-full', dotClass)} aria-hidden="true" />
        {label}
      </span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </li>
  );
}
