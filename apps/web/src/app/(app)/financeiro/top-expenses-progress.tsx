import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import type { TopExpenseCategoryRow } from './actions';

interface Props {
  rows: TopExpenseCategoryRow[];
  totalCents: number;
}

/**
 * Top categorias de despesas com mini progress bars — inspirado em Kodo Img 22
 * (Expense Tracker com progress bars). Adaptado para paleta KEYRA.
 *
 * Top 5 categorias do mês corrente, com:
 * - Nome + valor absoluto + % do total
 * - Barra horizontal proporcional (cocoa-900 → terracota gradient)
 * - Linha de "Outras categorias" condensada se houver mais
 */
export function TopExpensesProgress({ rows, totalCents }: Props) {
  const isEmpty = rows.length === 0;

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3 flex-row items-baseline justify-between space-y-0">
        <CardTitle className="font-serif text-xl">
          Despesas por categoria
        </CardTitle>
        <span className="text-xs text-muted-foreground tabular-nums">
          Total:{' '}
          <span className="font-semibold text-foreground">
            {formatCentsBRL(totalCents)}
          </span>
        </span>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma despesa registrada este mês.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((r, idx) => {
              const pct = Math.round(r.share * 100);
              const accent = idx === 0 ? 'cocoa' : idx === 1 ? 'terracota' : 'mocha';
              return (
                <li key={r.categoryId} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-foreground">
                      {r.name}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {formatCentsBRL(r.amountCents)}
                      </span>{' '}
                      · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-mocha-300/20">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-base',
                        accent === 'cocoa' && 'bg-cocoa-900',
                        accent === 'terracota' && 'bg-terracotta-500',
                        accent === 'mocha' && 'bg-mocha-300',
                      )}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
