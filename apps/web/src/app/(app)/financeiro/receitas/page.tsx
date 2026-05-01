import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/money';

import { getDefaultPeriod, getRevenueByProfessional } from '../actions';

type PageProps = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function ReceitasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = await getDefaultPeriod();
  const start = params.start ?? period.start;
  const end = params.end ?? period.end;

  const result = await getRevenueByProfessional({ start, end });
  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">Erro: {result.error}</p>
        </CardContent>
      </Card>
    );
  }

  const { byProfessional, byCostCenter } = result.data;
  const totalGross = byProfessional.reduce((a, p) => a + p.total_gross, 0);
  const totalNet = byProfessional.reduce((a, p) => a + p.total_net, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
          <CardDescription>
            Receitas realizadas (transações com direção `credit`) no intervalo selecionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/financeiro/receitas"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryCell label="Bruto (período)" value={formatBRL(totalGross)} />
        <SummaryCell label="Líquido (período)" value={formatBRL(totalNet)} positive />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Por profissional</CardTitle>
          <CardDescription>Ordenado por receita líquida (maior → menor).</CardDescription>
        </CardHeader>
        <CardContent>
          {byProfessional.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sem receitas no período. Conclua atendimentos e registre pagamentos para
              ver os números aqui.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {byProfessional.map((p) => (
                <li
                  key={p.professional_id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.professional_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.cost_center ?? 'Sem centro de custo'} · {p.count}{' '}
                      {p.count === 1 ? 'atendimento' : 'atendimentos'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatBRL(p.total_net)}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      bruto {formatBRL(p.total_gross)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por centro de custo</CardTitle>
          <CardDescription>
            Soma das receitas dos profissionais agrupadas pelo `cost_center` deles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {byCostCenter.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem receitas no período.</p>
          ) : (
            <ul className="divide-y divide-border">
              {byCostCenter.map((c) => (
                <li
                  key={c.cost_center}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.cost_center}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.count} {c.count === 1 ? 'atendimento' : 'atendimentos'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatBRL(c.total_net)}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      bruto {formatBRL(c.total_gross)}
                    </p>
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
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`text-xl font-semibold tabular-nums ${
          positive ? 'text-emerald-700' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
