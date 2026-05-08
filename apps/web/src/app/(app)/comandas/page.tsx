import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  EmptyState,
  ErrorMessage,
  StatusBadge,
  commandStatusToBadge,
} from '@/components/keyra';
import { formatBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import { getCommandsStats, listCommands, type CommandStatus } from './actions';
import { ComandasStats } from './comandas-stats';

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
  { value: 'cancelled', label: 'Canceladas' },
];

function isCommandStatus(v: string | undefined): v is CommandStatus | 'all' {
  return (
    v === 'all' ||
    v === 'open' ||
    v === 'finalized' ||
    v === 'paid' ||
    v === 'cancelled'
  );
}

/**
 * Comandas — refinado conforme padrão editorial KEYRA (2026-05-08).
 *
 * - 4 KPI cards no topo (Total mês / Em aberto / Pagas mês / Faturamento)
 *   com variação MoM em pill colorido (success-leaf cresceu / rust-800 caiu)
 * - Tabs de status em segmented control (mesmo padrão da agenda e catálogo)
 * - Tabela editorial com pills coloridos por status
 * - Paginação preservada
 */
export default async function ComandasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusParam = isCommandStatus(params.status) ? params.status : 'all';
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const [result, statsRes] = await Promise.all([
    listCommands({ status: statusParam, page }),
    getCommandsStats(),
  ]);

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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-display text-foreground">Comandas</h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'comanda' : 'comandas'}
          {statusParam !== 'all'
            ? ` no filtro "${STATUS_LABEL[statusParam]}"`
            : ''}
          . As comandas nascem automaticamente ao concluir um atendimento na
          agenda.
        </p>
      </header>

      {statsRes.ok ? (
        <ComandasStats
          totalThisMonth={statsRes.data.totalThisMonth}
          openCount={statsRes.data.openCount}
          paidThisMonth={statsRes.data.paidThisMonth}
          revenueThisMonthCents={statsRes.data.revenueThisMonthCents}
          totalLastMonth={statsRes.data.totalLastMonth}
          openCountLastMonth={statsRes.data.openCountLastMonth}
          paidLastMonth={statsRes.data.paidLastMonth}
          revenueLastMonthCents={statsRes.data.revenueLastMonthCents}
        />
      ) : null}

      {/* Segmented status filter */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-warm-sm">
        <div
          role="tablist"
          aria-label="Filtrar por status"
          className="flex w-full overflow-x-auto rounded-full border border-mocha-300/40 bg-ivory-50 p-0.5 sm:w-fit"
        >
          {FILTER_OPTIONS.map((opt) => {
            const isActive = statusParam === opt.value;
            const href =
              opt.value === 'all' ? '/comandas' : `/comandas?status=${opt.value}`;
            return (
              <Link
                key={opt.value}
                href={href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'flex-1 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all sm:flex-none',
                  isActive
                    ? 'bg-cocoa-900 text-ivory-50 shadow-sm'
                    : 'text-cocoa-800 hover:bg-ivory-100',
                )}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Card className="shadow-warm-sm">
        <CardHeader className="pb-3 flex-row items-baseline justify-between space-y-0">
          <CardTitle className="font-serif text-xl">Lista</CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {rows.length} {rows.length === 1 ? 'item' : 'itens'} nesta página
          </span>
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
            <ul className="divide-y divide-mocha-300/20">
              {rows.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <Link
                    href={`/comandas/${c.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 transition-colors hover:text-cocoa-900"
                  >
                    <div
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/30 to-terracotta-500/20 text-terracotta-500"
                    >
                      <Receipt className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {c.customer_name ?? 'Cliente avulso'}
                        <span className="text-muted-foreground"> · </span>
                        {c.professional_name ?? 'Sem profissional'}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {format(new Date(c.opened_at), "d 'de' MMM yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                        {c.discount_amount > 0
                          ? ` · desconto ${formatBRL(c.discount_amount)}`
                          : ''}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-serif text-base font-light tabular-nums text-foreground">
                      {formatBRL(c.total)}
                    </span>
                    <StatusBadge
                      status={commandStatusToBadge(c.status)}
                      size="sm"
                    />
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
