'use client';

import { m } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  weekDaily: Array<{ weekday: number; cents: number }>;
  totalWeekCents: number;
  todayWeekday: number;
}

/**
 * Daily Costing Chart — inspirado em Kodo Img 22 (barras roxo da semana).
 * Adaptado para paleta KEYRA: barras cocoa (não-hoje) + terracota (hoje
 * destacado). Exibe valor flutuante acima do dia atual quando há gasto.
 */
export function DailyCostingChart({
  weekDaily,
  totalWeekCents,
  todayWeekday,
}: Props) {
  const max = Math.max(...weekDaily.map((d) => d.cents), 1);

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between">
          <CardTitle className="font-serif text-xl">Gasto da semana</CardTitle>
          <span className="font-serif text-xl font-light tabular-nums text-foreground">
            {formatCentsBRL(totalWeekCents)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Despesas por dia da semana corrente
        </p>
      </CardHeader>
      <CardContent>
        <m.div
          variants={variants.kpiRevealContainer}
          initial="hidden"
          animate="visible"
          className="flex items-end gap-3"
          style={{ height: '180px' }}
        >
          {weekDaily.map((d) => {
            const heightPct = (d.cents / max) * 100;
            const isToday = d.weekday === todayWeekday;
            const hasValue = d.cents > 0;
            return (
              <m.div
                key={d.weekday}
                variants={variants.kpiRevealItem}
                className="group relative flex flex-1 flex-col items-center gap-2"
              >
                {isToday && hasValue && (
                  <span className="absolute -top-7 rounded-full border border-mocha-300/40 bg-ivory-50 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-cocoa-900 shadow-warm-sm">
                    {formatCentsBRL(d.cents)}
                  </span>
                )}
                <div
                  className="relative flex w-full items-end"
                  style={{ height: '140px' }}
                  title={`${WEEKDAYS[d.weekday]}: ${formatCentsBRL(d.cents)}`}
                >
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all',
                      isToday
                        ? 'bg-terracotta-500 shadow-warm-sm'
                        : 'bg-cocoa-700/40 group-hover:bg-cocoa-700/60',
                    )}
                    style={{ height: `${Math.max(heightPct, hasValue ? 4 : 0)}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium uppercase tracking-wider',
                    isToday ? 'text-cocoa-900' : 'text-muted-foreground',
                  )}
                >
                  {WEEKDAYS[d.weekday]}
                </span>
              </m.div>
            );
          })}
        </m.div>
      </CardContent>
    </Card>
  );
}
