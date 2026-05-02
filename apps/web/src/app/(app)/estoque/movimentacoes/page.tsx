import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorMessage, StatusBadge, movementTypeToBadge } from '@/components/keyra';
import { ArrowDownCircle } from 'lucide-react';
import { formatBRL } from '@/lib/money';

import { listInventoryMovements } from '../actions';

type PageProps = {
  searchParams: Promise<{ page?: string; command?: string }>;
};

export default async function MovimentacoesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const commandFilter = params.command;

  const result = await listInventoryMovements({
    page,
    ...(commandFilter ? { commandId: commandFilter } : {}),
  });
  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={result.error} />
        </CardContent>
      </Card>
    );
  }

  const { rows, total, pageSize } = result.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2">Movimentações</h2>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'movimento' : 'movimentos'} registrados.
          {commandFilter ? (
            <>
              {' · '}
              <span>Filtrado por comanda #{commandFilter.slice(0, 8)}</span>
              {' · '}
              <Link href="/estoque/movimentacoes" className="underline">
                Limpar filtro
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <CardDescription>
            Apenas leitura. Entradas manuais entram numa próxima fase. Consumos
            automáticos são gravados quando uma comanda é paga (rateio do BOM).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              icon={ArrowDownCircle}
              title="Sem movimentações ainda"
              description="Quando você concluir um atendimento e pagar a comanda, o KEYRA registra automaticamente o consumo de cada insumo da BOM aqui."
            />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((m) => {
                const isNegative = m.quantity < 0;
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{m.supply_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(m.created_at), "d 'de' MMM, HH:mm", {
                          locale: ptBR,
                        })}
                        {m.notes ? ` · ${m.notes}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge
                        status={movementTypeToBadge(m.movement_type)}
                        size="sm"
                      />
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          isNegative ? 'text-destructive' : 'text-emerald-700'
                        }`}
                      >
                        {isNegative ? '' : '+'}
                        {m.quantity}
                      </span>
                      {m.unit_cost_at_move !== null ? (
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {formatBRL(m.unit_cost_at_move)}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-between text-sm text-muted-foreground"
        >
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {hasPrev ? (
              <Link href={`/estoque/movimentacoes?page=${page - 1}`}>
                <Button variant="ghost" size="sm">
                  Anterior
                </Button>
              </Link>
            ) : null}
            {hasNext ? (
              <Link href={`/estoque/movimentacoes?page=${page + 1}`}>
                <Button variant="ghost" size="sm">
                  Próxima
                </Button>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
