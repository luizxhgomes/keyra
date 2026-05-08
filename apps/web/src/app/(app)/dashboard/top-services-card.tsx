import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/keyra';
import { formatCentsBRL } from '@/lib/money';

import { getTopServicesByRevenue } from './actions';

/**
 * Top serviços do mês por receita gerada.
 * Inspirado em: dashboard reference (Top Income card).
 *
 * Adaptação:
 * - Avatar com inicial do serviço (sem foto)
 * - Receita em destaque (Fraunces)
 * - Quantidade como sub-info
 * - Chevron à direita pra ação (futuro: link pra DRE por serviço)
 */
export async function TopServicesCard() {
  const result = await getTopServicesByRevenue(3);

  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={result.error} />
        </CardContent>
      </Card>
    );
  }

  const rows = result.data;

  const isEmpty = rows.length === 0;
  // Quando vazio: 3 linhas placeholder visualmente preenchidas
  const placeholderRows = [
    { name: 'Limpeza de pele', quantity: '—', amountLabel: 'aguardando vendas' },
    { name: 'Massagem', quantity: '—', amountLabel: 'aguardando vendas' },
    { name: 'Drenagem linfática', quantity: '—', amountLabel: 'aguardando vendas' },
  ];

  return (
    <Card className="flex h-full flex-col shadow-warm-sm">
      <CardHeader className="pb-3 flex-row items-baseline justify-between space-y-0">
        <CardTitle className="font-serif text-xl">Top serviços</CardTitle>
        <Link
          href="/financeiro/dre-por-servico"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver todos →
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        {isEmpty ? (
          <ul className="flex flex-col gap-3" aria-label="Sem dados — exemplos do que aparecerá">
            {placeholderRows.map((p, idx) => (
              <li
                key={`placeholder-${idx}`}
                className="flex items-center gap-3 rounded-lg p-2 -mx-2 opacity-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mocha-300/30 text-sm font-semibold text-mocha-300">
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-mocha-300">{p.name}</p>
                  <p className="text-xs text-mocha-300">{p.amountLabel}</p>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-mocha-300"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((s, idx) => (
              <li
                key={s.serviceId || idx}
                className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-ivory-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/40 to-terracotta-500/30 text-sm font-semibold text-cocoa-800">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {s.quantity} {s.quantity === 1 ? 'venda' : 'vendas'}
                    {' · '}
                    <span className="font-semibold text-cocoa-800">
                      {formatCentsBRL(s.revenueCents)}
                    </span>
                  </p>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
