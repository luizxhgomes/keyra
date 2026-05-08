import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Flag, Receipt } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import type { OutstandingCommandRow } from './actions';

interface Props {
  rows: OutstandingCommandRow[];
}

/**
 * Tabela de comandas em aberto — inspirado em "Outstanding Invoices" (Img 15/18).
 *
 * Adaptação:
 * - "Priority flag" = cliente recorrente (3+ comandas pagas em 12 meses)
 * - "Status" omitido (todas open por design — não há diferenciação útil)
 * - Idade da comanda em vez de Invoice ID estático (mais acionável)
 * - Cores KEYRA: cocoa-900 nome, terracota dot recorrente
 */
export function OutstandingCommandsTable({ rows }: Props) {
  const isEmpty = rows.length === 0;

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3 flex-row items-baseline justify-between space-y-0">
        <CardTitle className="font-serif text-xl">Comandas em aberto</CardTitle>
        <Link
          href="/comandas?status=open"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Ver todas →
        </Link>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="rounded-full bg-success-leaf/10 p-3">
              <Receipt
                className="h-5 w-5 text-success-leaf"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <p className="text-sm font-medium text-foreground">
              Tudo em dia
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Sem comandas em aberto. Toda comanda gerada já foi paga ou cancelada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mocha-300/30 text-left">
                  <Th>Cliente</Th>
                  <Th>Profissional</Th>
                  <Th>Aberta há</Th>
                  <Th align="right">Valor</Th>
                  <Th align="right">Prioridade</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-mocha-300/20 transition-colors hover:bg-ivory-100"
                  >
                    <Td>
                      <Link
                        href={`/comandas/${r.id}`}
                        className="font-medium text-foreground hover:text-cocoa-900"
                      >
                        {r.customerName ?? 'Cliente avulso'}
                      </Link>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        #{r.shortId}
                      </p>
                    </Td>
                    <Td>{r.professionalName ?? '—'}</Td>
                    <Td>
                      <span
                        className={cn(
                          'tabular-nums',
                          r.ageDays > 7 ? 'text-rust-800' : 'text-foreground',
                        )}
                      >
                        {r.ageDays === 0
                          ? 'hoje'
                          : r.ageDays === 1
                            ? '1 dia'
                            : `${r.ageDays} dias`}
                      </span>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {format(new Date(r.openedAt), "d 'de' MMM", {
                          locale: ptBR,
                        })}
                      </p>
                    </Td>
                    <Td align="right" mono>
                      {formatCentsBRL(r.totalCents)}
                    </Td>
                    <Td align="right">
                      {r.priorityFlag ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-terracotta-500"
                          title="Cliente recorrente (3+ comandas pagas em 12 meses)"
                        >
                          <Flag
                            className="h-3 w-3 fill-current"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          Recorrente
                        </span>
                      ) : (
                        <span className="text-[10px] text-mocha-300">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={cn(
        'pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground',
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  mono = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        'py-3 text-foreground',
        align === 'right' ? 'text-right' : 'text-left',
        mono ? 'tabular-nums' : '',
      )}
    >
      {children}
    </td>
  );
}
