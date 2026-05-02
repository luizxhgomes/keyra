import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Receipt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorMessage, StatusBadge, commandStatusToBadge } from '@/components/keyra';
import { formatBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import { listCommands, type CommandStatus } from './actions';

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

const STATUS_LABEL: Record<CommandStatus, string> = {
  open: 'Aberta',
  finalized: 'Finalizada',
  paid: 'Paga',
  cancelled: 'Cancelada',
};

const FILTER_OPTIONS: Array<{ value: 'all' | CommandStatus; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'open', label: 'Abertas' },
  { value: 'finalized', label: 'Finalizadas' },
  { value: 'paid', label: 'Pagas' },
];

function isCommandStatus(v: string | undefined): v is CommandStatus | 'all' {
  return v === 'all' || v === 'open' || v === 'finalized' || v === 'paid' || v === 'cancelled';
}

export default async function ComandasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusParam = isCommandStatus(params.status) ? params.status : 'all';
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const result = await listCommands({ status: statusParam, page });
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display">Serviços</h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'atendimento' : 'atendimentos'}
          {statusParam !== 'all' ? ` · filtro: ${STATUS_LABEL[statusParam]}` : ''}.
          Os serviços nascem automaticamente ao concluir um atendimento na agenda.
        </p>
      </header>

      <nav aria-label="Filtro de status" className="flex flex-wrap gap-1 border-b border-border">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = statusParam === opt.value;
          const href = opt.value === 'all' ? '/comandas' : `/comandas?status=${opt.value}`;
          return (
            <Link
              key={opt.value}
              href={href}
              className={cn(
                'inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {opt.label}
            </Link>
          );
        })}
      </nav>

      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
          <CardDescription>
            Clique em uma linha para ver detalhes e editar (apenas comandas abertas).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={
                statusParam !== 'all'
                  ? 'Nada nesse filtro'
                  : 'Você ainda não tem comandas'
              }
              description={
                statusParam !== 'all'
                  ? `Nenhuma comanda no filtro "${STATUS_LABEL[statusParam]}". Tente outro filtro ou volte para "Todas".`
                  : 'A comanda nasce automaticamente quando você marca um atendimento como concluído. Comece criando um agendamento e concluindo na agenda.'
              }
              action={
                statusParam !== 'all'
                  ? { label: 'Ver todas', href: '/comandas' }
                  : { label: 'Ir para a agenda', href: '/agenda' }
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/comandas/${c.id}`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {c.customer_name ?? 'Cliente avulso'} ·{' '}
                      {c.professional_name ?? 'Sem profissional'}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(c.opened_at), "d 'de' MMM, HH:mm", { locale: ptBR })}
                      {c.discount_amount > 0
                        ? ` · desconto ${formatBRL(c.discount_amount)}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatBRL(c.total)}
                    </span>
                    <StatusBadge status={commandStatusToBadge(c.status)} size="sm" />
                  </div>
                </li>
              ))}
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
            {page > 1 ? (
              <Link
                href={`/comandas?${new URLSearchParams({
                  ...(statusParam !== 'all' ? { status: statusParam } : {}),
                  page: String(page - 1),
                }).toString()}`}
              >
                <Button variant="ghost" size="sm">
                  Anterior
                </Button>
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/comandas?${new URLSearchParams({
                  ...(statusParam !== 'all' ? { status: statusParam } : {}),
                  page: String(page + 1),
                }).toString()}`}
              >
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
