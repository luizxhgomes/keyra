import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorMessage } from '@/components/keyra';
import { Receipt } from 'lucide-react';
import { formatBRL } from '@/lib/money';

import {
  getDefaultPeriod,
  listExpenseCategoriesForPicker,
  listExpenses,
} from '../actions';
import { DespesaRowActions } from './despesa-row-actions';

type PageProps = {
  searchParams: Promise<{
    start?: string;
    end?: string;
    category?: string;
    archived?: string;
    page?: string;
  }>;
};

export default async function DespesasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = await getDefaultPeriod();
  const start = params.start ?? period.start;
  const end = params.end ?? period.end;
  const showArchived = params.archived === '1';
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const [expRes, catRes] = await Promise.all([
    listExpenses({
      start,
      end,
      ...(params.category ? { categoryId: params.category } : {}),
      showArchived,
      page,
    }),
    listExpenseCategoriesForPicker(),
  ]);

  if (!expRes.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={expRes.error} />
        </CardContent>
      </Card>
    );
  }

  const { rows, total, totalNet, pageSize } = expRes.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const categories = catRes.ok ? catRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-h2">Despesas</h2>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'lançamento' : 'lançamentos'} no período · Total{' '}
            <span className="font-semibold tabular-nums">{formatBRL(totalNet)}</span>
          </p>
        </div>
        <Link href="/financeiro/despesas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova despesa
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Período + categoria. Toggle para mostrar arquivadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/financeiro/despesas"
            method="get"
            className="grid grid-cols-1 gap-3 sm:grid-cols-4"
          >
            <label className="flex flex-col gap-1.5 text-sm">
              <span>De</span>
              <input
                type="date"
                name="start"
                defaultValue={start}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span>Até</span>
              <input
                type="date"
                name="end"
                defaultValue={end}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span>Categoria</span>
              <select
                name="category"
                defaultValue={params.category ?? ''}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1">
                Filtrar
              </Button>
              {showArchived ? <input type="hidden" name="archived" value="1" /> : null}
            </div>
            <div className="sm:col-span-4">
              <Link
                href={
                  showArchived
                    ? `/financeiro/despesas?start=${start}&end=${end}`
                    : `/financeiro/despesas?start=${start}&end=${end}&archived=1`
                }
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {showArchived ? 'Ocultar arquivadas' : 'Mostrar arquivadas'}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Sem despesas no período"
              description="Quando você cadastrar despesas (aluguel, energia, fornecedores), elas aparecem aqui e entram automaticamente no fluxo de caixa e na DRE."
              action={{ label: 'Cadastrar despesa', href: '/financeiro/despesas/nova' }}
            />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r) => {
                const isArchived = !!r.deleted_at;
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <Link
                        href={`/financeiro/despesas/${r.id}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {r.description ?? '(sem descrição)'}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(r.reference_date), "d 'de' MMM yyyy", {
                          locale: ptBR,
                        })}
                        {r.category_name ? ` · ${r.category_name}` : ''}
                        {' · '}
                        {r.account_name}
                        {r.is_fixed ? ' · fixo' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isArchived ? <Badge variant="outline">Arquivada</Badge> : null}
                      <span className="text-sm font-semibold tabular-nums text-destructive">
                        {formatBRL(r.gross_amount)}
                      </span>
                      <DespesaRowActions id={r.id} archived={isArchived} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/financeiro/despesas?start=${start}&end=${end}${
                  params.category ? `&category=${params.category}` : ''
                }${showArchived ? '&archived=1' : ''}&page=${page - 1}`}
              >
                <Button variant="ghost" size="sm">
                  Anterior
                </Button>
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/financeiro/despesas?start=${start}&end=${end}${
                  params.category ? `&category=${params.category}` : ''
                }${showArchived ? '&archived=1' : ''}&page=${page + 1}`}
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
