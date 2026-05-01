import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/money';

import {
  getDefaultPeriod,
  listFilterPickers,
  listTransactions,
  type TransactionDirection,
} from '../actions';

type PageProps = {
  searchParams: Promise<{
    start?: string;
    end?: string;
    direction?: string;
    category?: string;
    professional?: string;
    account?: string;
    page?: string;
  }>;
};

const ORIGIN_LABEL: Record<string, string> = {
  command_payment: 'Comanda paga',
  manual_income: 'Receita manual',
  manual_expense: 'Despesa manual',
  bank_import: 'Importação',
  adjustment: 'Ajuste',
};

function isDirection(v: string | undefined): v is TransactionDirection | 'all' {
  return v === 'credit' || v === 'debit' || v === 'all';
}

export default async function TransacoesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = await getDefaultPeriod();
  const start = params.start ?? period.start;
  const end = params.end ?? period.end;
  const direction = isDirection(params.direction) ? params.direction : 'all';
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const [txRes, pickerRes] = await Promise.all([
    listTransactions({
      start,
      end,
      direction,
      ...(params.category ? { categoryId: params.category } : {}),
      ...(params.professional ? { professionalId: params.professional } : {}),
      ...(params.account ? { accountId: params.account } : {}),
      page,
    }),
    listFilterPickers(),
  ]);

  if (!txRes.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">Erro: {txRes.error}</p>
        </CardContent>
      </Card>
    );
  }

  const { rows, total, totalCredit, totalDebit, pageSize } = txRes.data;
  const liquid = totalCredit - totalDebit;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pickers = pickerRes.ok
    ? pickerRes.data
    : { categories: [], professionals: [], accounts: [] };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCell label="Entradas (período)" value={formatBRL(totalCredit)} positive />
        <SummaryCell label="Saídas (período)" value={formatBRL(totalDebit)} />
        <SummaryCell
          label="Líquido (todo histórico)"
          value={formatBRL(liquid)}
          positive={liquid >= 0}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Defina período, direção, categoria, profissional ou conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/financeiro/transacoes"
            method="get"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
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
              <span>Direção</span>
              <select
                name="direction"
                defaultValue={direction}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todas</option>
                <option value="credit">Entradas</option>
                <option value="debit">Saídas</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span>Categoria</span>
              <select
                name="category"
                defaultValue={params.category ?? ''}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {pickers.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span>Profissional</span>
              <select
                name="professional"
                defaultValue={params.professional ?? ''}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {pickers.professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span>Conta</span>
              <select
                name="account"
                defaultValue={params.account ?? ''}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {pickers.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button type="submit" className="w-full">
                Filtrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <CardDescription>
            {total} {total === 1 ? 'movimento' : 'movimentos'} no período. Entradas em verde,
            saídas em vermelho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sem transações no período/filtro selecionado.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">
                      {r.description ??
                        (r.category_name
                          ? r.category_name
                          : ORIGIN_LABEL[r.origin] ?? r.origin)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.reference_date), "d 'de' MMM yyyy", { locale: ptBR })}
                      {r.professional_name ? ` · ${r.professional_name}` : ''}
                      {' · '}
                      {r.account_name}
                      {r.is_fixed ? ' · fixo' : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        r.direction === 'credit' ? 'text-emerald-700' : 'text-destructive'
                      }`}
                    >
                      {r.direction === 'credit' ? '+' : '-'}
                      {formatBRL(r.net_amount)}
                    </p>
                    {r.fee_amount > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        bruto {formatBRL(r.gross_amount)} · taxa {formatBRL(r.fee_amount)}
                      </p>
                    ) : null}
                    <Badge variant="outline" className="mt-1">
                      {ORIGIN_LABEL[r.origin] ?? r.origin}
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
              <Link href={buildHref({ ...params, page: String(page - 1) })}>
                <Button variant="ghost" size="sm">
                  Anterior
                </Button>
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link href={buildHref({ ...params, page: String(page + 1) })}>
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

function SummaryCell({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`text-xl font-semibold tabular-nums ${
          positive === true
            ? 'text-emerald-700'
            : positive === false
              ? 'text-destructive'
              : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function buildHref(params: Record<string, string | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') u.set(k, v);
  }
  const s = u.toString();
  return `/financeiro/transacoes${s ? `?${s}` : ''}`;
}
