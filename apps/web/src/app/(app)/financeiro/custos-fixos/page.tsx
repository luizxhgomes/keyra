import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComparativoTexto, EmptyState, ErrorMessage } from '@/components/keyra';
import { Repeat } from 'lucide-react';
import { formatBRL } from '@/lib/money';

import { getDefaultPeriod, listExpenses } from '../actions';
import { CloneFixedCostsButton } from './clone-button';

type PageProps = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function CustosFixosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = await getDefaultPeriod();
  const start = params.start ?? period.start;
  const end = params.end ?? period.end;

  // 3 meses para média móvel (mês atual + 2 anteriores)
  const m1Start = format(subMonths(new Date(start), 2), 'yyyy-MM-01', { locale: ptBR });
  const m1End = end;

  // Período corrente
  const currentRes = await listExpenses({
    start,
    end,
    page: 1,
  });

  // Histórico para média móvel: chama listExpenses 3 vezes seria caro;
  // pegamos todas as despesas dos últimos 3 meses e filtramos só `is_fixed=true` em TS.
  const historyRes = await listExpenses({
    start: m1Start,
    end: m1End,
    page: 1,
  });

  if (!currentRes.ok || !historyRes.ok) {
    const errorDetail = !currentRes.ok
      ? currentRes.error
      : !historyRes.ok
        ? historyRes.error
        : 'desconhecido';
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={errorDetail} />
        </CardContent>
      </Card>
    );
  }

  const fixedThisPeriod = currentRes.data.rows.filter((r) => r.is_fixed);
  const totalFixed = fixedThisPeriod.reduce((a, r) => a + r.gross_amount, 0);

  // Média móvel: agrupa por mês os últimos 3 meses
  const monthlyTotals = new Map<string, number>();
  for (const r of historyRes.data.rows) {
    if (!r.is_fixed) continue;
    const month = r.reference_date.slice(0, 7); // YYYY-MM
    monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + r.gross_amount);
  }
  const monthlyValues = Array.from(monthlyTotals.values());
  const movingAverage =
    monthlyValues.length > 0
      ? monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length
      : 0;

  // Variação vs média móvel (Story 6.4 — usa <ComparativoTexto>).
  // delta em centavos para o componente. sentiment:
  //   - custo caiu (variationAbsolute < 0) = positive (favorável para clínica)
  //   - custo subiu = negative
  //   - sem variação = neutral
  const variationAbsolute = totalFixed - movingAverage;
  const variationDeltaCents = Math.round(variationAbsolute * 100);
  const variationSentiment: 'positive' | 'negative' | 'neutral' =
    variationAbsolute < 0 ? 'positive' : variationAbsolute > 0 ? 'negative' : 'neutral';
  const hasHistory = movingAverage > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-h2">Custos fixos</h2>
          <p className="text-sm text-muted-foreground">
            Despesas marcadas como fixas (categoria `fixed_cost` ou flag manual no
            lançamento). Recorrência manual via botão de clone.
          </p>
        </div>
        <CloneFixedCostsButton />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCell label="Total no período" value={formatBRL(totalFixed)} />
        <SummaryCell label="Média móvel (3m)" value={formatBRL(movingAverage)} />
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-label uppercase text-muted-foreground">Variação</p>
          {hasHistory ? (
            <div className="mt-1">
              <ComparativoTexto
                delta={variationDeltaCents}
                period="média móvel"
                sentiment={variationSentiment}
                format="full"
              />
            </div>
          ) : (
            <p className="text-xl text-muted-foreground">sem histórico</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Período do mês corrente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/financeiro/custos-fixos"
            method="get"
            className="flex flex-wrap items-end gap-3"
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
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Filtrar
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos fixos do período</CardTitle>
        </CardHeader>
        <CardContent>
          {fixedThisPeriod.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title="Sem custos fixos no período"
              description="Aluguel, salários, internet… Use o botão acima para clonar do mês passado ou cadastre uma nova despesa marcando a flag “Custo fixo”."
              action={{ label: 'Cadastrar custo fixo', href: '/financeiro/despesas/nova' }}
            />
          ) : (
            <ul className="divide-y divide-border">
              {fixedThisPeriod.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">{r.description ?? '(sem descrição)'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.reference_date), "d 'de' MMM yyyy", {
                        locale: ptBR,
                      })}
                      {r.category_name ? ` · ${r.category_name}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">fixo</Badge>
                    <span className="text-sm font-semibold tabular-nums text-destructive">
                      {formatBRL(r.gross_amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
      <p className="text-label uppercase text-muted-foreground">{label}</p>
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
