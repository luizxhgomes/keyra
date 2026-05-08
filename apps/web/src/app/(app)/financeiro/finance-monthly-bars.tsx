'use client';

import { useId } from 'react';
import { m } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { formatCentsBRL } from '@/lib/money';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface Props {
  revenueSparkline: number[];
  expensesSparkline: number[];
}

/**
 * Stacked bar Jan-Dez com Receita (terracota) + Despesas (cocoa) — inspirado
 * em Retail Performance (Img 15) adaptado para paleta Editorial KEYRA.
 *
 * Não usa biblioteca externa — SVG inline com motion stagger por barra.
 */
export function FinanceMonthlyBars({
  revenueSparkline,
  expensesSparkline,
}: Props) {
  const max = Math.max(
    ...revenueSparkline,
    ...expensesSparkline,
    1,
  );
  const containerId = useId();
  const today = new Date();
  const currentMonth = today.getMonth();

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-xl">
          Receita vs Despesas · {today.getFullYear()}
        </CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Legend color="#C26832" label="Receita" />
          <Legend color="#5A3E26" label="Despesas" />
        </div>
      </CardHeader>
      <CardContent>
        <m.div
          variants={variants.kpiRevealContainer}
          initial="hidden"
          animate="visible"
          className="flex items-end gap-2"
          style={{ height: '240px' }}
        >
          {MONTHS.map((label, i) => {
            const rev = revenueSparkline[i] ?? 0;
            const exp = expensesSparkline[i] ?? 0;
            const revHeight = (rev / max) * 100;
            const expHeight = (exp / max) * 100;
            const isCurrent = i === currentMonth;
            return (
              <m.div
                key={`${containerId}-${i}`}
                variants={variants.kpiRevealItem}
                className="group flex flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className="relative flex w-full flex-col-reverse"
                  style={{ height: '200px' }}
                  title={`${label}: receita ${formatCentsBRL(rev)} · despesas ${formatCentsBRL(exp)}`}
                >
                  <div
                    className="w-full rounded-b-sm bg-cocoa-700 transition-opacity group-hover:opacity-90"
                    style={{ height: `${expHeight}%` }}
                  />
                  <div
                    className="w-full rounded-t-sm bg-terracotta-500 transition-opacity group-hover:opacity-90"
                    style={{ height: `${revHeight}%` }}
                  />
                </div>
                <span
                  className={[
                    'text-[10px] font-medium uppercase tracking-wider',
                    isCurrent ? 'text-cocoa-900' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {label}
                </span>
              </m.div>
            );
          })}
        </m.div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-sm"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
