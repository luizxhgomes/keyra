import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const STATUS_BADGE: Record<CommandStatus, string> = {
  open: 'bg-amber-100 text-amber-900 hover:bg-amber-100',
  finalized: 'bg-blue-100 text-blue-900 hover:bg-blue-100',
  paid: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100',
  cancelled: 'bg-stone-200 text-stone-700 hover:bg-stone-200',
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
          <p className="text-sm text-destructive">Erro: {result.error}</p>
        </CardContent>
      </Card>
    );
  }

  const { rows, total, pageSize } = result.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Comandas</h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'comanda' : 'comandas'}
          {statusParam !== 'all' ? ` · filtro: ${STATUS_LABEL[statusParam]}` : ''}.
          Comandas nascem automaticamente ao concluir um atendimento.
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
            <p className="text-sm text-muted-foreground">
              {statusParam !== 'all'
                ? `Sem comandas no filtro "${STATUS_LABEL[statusParam]}".`
                : 'Sem comandas ainda. Conclua um atendimento na agenda para gerar a primeira.'}
            </p>
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
                    <Badge variant="secondary" className={STATUS_BADGE[c.status]}>
                      {STATUS_LABEL[c.status]}
                    </Badge>
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
