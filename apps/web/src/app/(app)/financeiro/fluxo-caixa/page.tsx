import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/money';

import { getCashflow, getLast30DaysPeriod } from '../actions';

type PageProps = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function FluxoCaixaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = await getLast30DaysPeriod();
  const start = params.start ?? period.start;
  const end = params.end ?? period.end;

  // Cap de 365 dias para proteger performance (AC4 da Story 3.7)
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffDays = Math.abs(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays > 365) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">
            Período máximo: 365 dias. Encurte o intervalo para visualizar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const result = await getCashflow({ start, end });
  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">Erro: {result.error}</p>
        </CardContent>
      </Card>
    );
  }

  const { days, currentBalance, inflowTotal, outflowTotal, projectedReceipts } =
    result.data;

  // Comparativo textual: saldo do mesmo dia do mês passado vs hoje
  const sameDayLastMonth = subDays(new Date(end), 30);
  const sameDayLabel = format(sameDayLastMonth, "d 'de' MMM", { locale: ptBR });

  // Acumulado dia a dia (sem mutação após render — React Compiler)
  const startBalance = currentBalance - days.reduce((a, d) => a + d.net, 0);
  const tableRows: Array<typeof days[number] & { accumulated: number }> = [];
  days.reduce((runningBalance, d) => {
    const accumulated = runningBalance + d.net;
    tableRows.push({ ...d, accumulated });
    return accumulated;
  }, startBalance);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCell
          label="Saldo atual"
          value={formatBRL(currentBalance)}
          positive={currentBalance >= 0}
        />
        <SummaryCell label="Entradas (período)" value={formatBRL(inflowTotal)} positive />
        <SummaryCell
          label="Receita prevista (período)"
          value={formatBRL(projectedReceipts)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Default: últimos 30 dias. Cap de 365 dias por consulta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/financeiro/fluxo-caixa"
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
          <CardTitle>Movimento diário</CardTitle>
          <CardDescription>
            Entradas (verde) e saídas (vermelho) por dia + saldo acumulado. Comparativo
            referência: saldo de {sameDayLabel} (mesmo dia há ~30 dias).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem movimentos no período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 font-medium">Data</th>
                    <th className="py-2 pr-3 text-right font-medium">Entradas</th>
                    <th className="py-2 pr-3 text-right font-medium">Saídas</th>
                    <th className="py-2 pr-3 text-right font-medium">Líquido</th>
                    <th className="py-2 text-right font-medium">Saldo acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((d) => (
                    <tr key={d.day} className="border-b border-border">
                      <td className="py-2 pr-3">
                        {format(new Date(d.day), "d 'de' MMM", { locale: ptBR })}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-emerald-700">
                        {d.inflow > 0 ? `+${formatBRL(d.inflow)}` : '—'}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-destructive">
                        {d.outflow > 0 ? `-${formatBRL(d.outflow)}` : '—'}
                      </td>
                      <td
                        className={`py-2 pr-3 text-right tabular-nums font-medium ${
                          d.net >= 0 ? 'text-emerald-700' : 'text-destructive'
                        }`}
                      >
                        {d.net >= 0 ? '+' : ''}
                        {formatBRL(d.net)}
                      </td>
                      <td
                        className={`py-2 text-right tabular-nums font-semibold ${
                          d.accumulated >= 0 ? '' : 'text-destructive'
                        }`}
                      >
                        {formatBRL(d.accumulated)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50">
                    <td className="py-2 pr-3 font-semibold">Total no período</td>
                    <td className="py-2 pr-3 text-right tabular-nums font-semibold text-emerald-700">
                      +{formatBRL(inflowTotal)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums font-semibold text-destructive">
                      -{formatBRL(outflowTotal)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums font-bold">
                      {inflowTotal - outflowTotal >= 0 ? '+' : ''}
                      {formatBRL(inflowTotal - outflowTotal)}
                    </td>
                    <td className="py-2 text-right tabular-nums font-bold">
                      {formatBRL(currentBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projeção</CardTitle>
          <CardDescription>
            Receita prevista do período (agendamentos com status agendado e vencimento no
            intervalo). Despesas fixas projetadas serão exibidas quando o motor de
            recorrência automática chegar (Phase 5).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <span className="text-muted-foreground">Entradas previstas: </span>
            <span className="font-semibold tabular-nums">
              {formatBRL(projectedReceipts)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Soma de price_snapshot dos agendamentos com status `scheduled` no período.
          </p>
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
