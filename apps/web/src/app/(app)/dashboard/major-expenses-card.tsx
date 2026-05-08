'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import type { ExpensesByCategoryData } from './actions';

interface Props {
  data: ExpensesByCategoryData;
}

/**
 * Despesas do mês por categoria com pills filtráveis.
 * Inspirado em: dashboard reference (Major Expenses).
 *
 * Adaptação:
 * - Pills com nome de categoria (até 4 maiores)
 * - Categoria selecionada destaca valor + barra proporcional
 * - Mini-bars proporcionais ao share de cada categoria (paleta KEYRA)
 * - Média do mês como subtexto
 *
 * Princípio UX atualizado: gráficos proporcionais permitidos como reforço,
 * desde que número absoluto seja o herói.
 */
const PLACEHOLDER_CATEGORIES = [
  { name: 'Aluguel', heightPct: 70 },
  { name: 'Insumos', heightPct: 50 },
  { name: 'Energia', heightPct: 35 },
  { name: 'Marketing', heightPct: 20 },
];

export function MajorExpensesCard({ data }: Props) {
  const top = data.rows.slice(0, 4);
  const [activeIdx, setActiveIdx] = useState(0);
  const active = top[activeIdx];
  const noData = data.rows.length === 0;

  return (
    <Card className="flex h-full flex-col shadow-warm-sm">
      <CardHeader className="pb-3 flex-row items-baseline justify-between space-y-0">
        <CardTitle className="font-serif text-xl">Maiores despesas</CardTitle>
        <span className="text-xs text-muted-foreground tabular-nums">
          Total:{' '}
          <span className="font-semibold text-foreground">
            {formatCentsBRL(data.totalCents)}
          </span>
        </span>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        {noData ? (
          // Empty state com mock visual — pills + valor placeholder + barras descoradas
          <>
            <div
              className="flex flex-wrap gap-2 opacity-50"
              aria-label="Sem despesas — exemplos de categorias"
            >
              {PLACEHOLDER_CATEGORIES.map((c, idx) => (
                <span
                  key={c.name}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium',
                    idx === 0
                      ? 'border-mocha-300 bg-mocha-300/30 text-mocha-300'
                      : 'border-mocha-300/40 bg-ivory-50 text-mocha-300',
                  )}
                >
                  {c.name}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-1 opacity-50">
              <p className="text-xs uppercase tracking-wider text-mocha-300">
                Aguardando lançamentos
              </p>
              <p className="font-serif text-3xl font-light tracking-tight text-mocha-300 tabular-nums">
                R$ —,—
              </p>
              <p className="text-xs text-mocha-300">
                Lance despesas pra ver categorias e proporções reais
              </p>
            </div>

            <div className="flex h-20 items-end gap-2 opacity-30" aria-hidden="true">
              {PLACEHOLDER_CATEGORIES.map((c, idx) => (
                <div
                  key={`${c.name}-bar`}
                  className="flex flex-1 flex-col items-center"
                >
                  <div
                    className={cn(
                      'w-full rounded-t-md',
                      idx === 0 ? 'bg-mocha-300' : 'bg-mocha-300/40',
                    )}
                    style={{ height: `${c.heightPct}%` }}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {top.map((cat, idx) => (
                <button
                  key={cat.categoryId}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    idx === activeIdx
                      ? 'border-cocoa-900 bg-cocoa-900 text-ivory-50'
                      : 'border-mocha-300/40 bg-ivory-50 text-cocoa-800 hover:border-cocoa-700/50',
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {active && (
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {active.name}
                </p>
                <p className="font-serif text-3xl font-light tracking-tight text-foreground tabular-nums">
                  {formatCentsBRL(active.amountCents)}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {(active.share * 100).toFixed(0)}% do total · Média/lançamento{' '}
                  {formatCentsBRL(data.averageCents)}
                </p>
              </div>
            )}

            <div className="flex h-20 items-end gap-2">
              {top.map((cat, idx) => {
                const heightPct = Math.max(8, cat.share * 100);
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={cat.categoryId + '-bar'}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className="group flex flex-1 flex-col items-center gap-1"
                    aria-label={`${cat.name}: ${formatCentsBRL(cat.amountCents)}`}
                  >
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all',
                        isActive
                          ? 'bg-cocoa-900'
                          : 'bg-mocha-300/40 group-hover:bg-mocha-300/60',
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
