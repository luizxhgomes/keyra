import { Award, AlertTriangle, PieChart, TrendingDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorMessage } from '@/components/keyra';
import { formatBRL } from '@/lib/money';

import { getDreByService } from '../actions';

type PageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function DreByServicePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getDreByService({
    ...(params.month ? { periodMonth: params.month } : {}),
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

  const { rows, periodLabel } = result.data;
  const top3Ids = new Set(rows.slice(0, 3).map((r) => r.service_id));

  const totals = rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.revenue_gross,
      variableCost: acc.variableCost + r.variable_cost,
      commissions: acc.commissions + r.commissions,
      profit: acc.profit + r.gross_profit,
    }),
    { revenue: 0, variableCost: 0, commissions: 0, profit: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">DRE por serviço — {periodLabel}</h2>
        <p className="text-sm text-muted-foreground">
          Lucro de cada procedimento individualmente. <strong>Diferencial KEYRA:</strong>{' '}
          Conta Azul/Omie não entregam isso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Por procedimento</CardTitle>
          <CardDescription>
            Ordenado por lucro líquido (maior → menor). Margem = lucro / receita.
            Top 3, margem &lt; 20% e prejuízo recebem badges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              icon={PieChart}
              title="Sem comandas pagas no período"
              description="O lucro de cada serviço aparece aqui depois que você marca atendimentos como concluídos e registra os pagamentos."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Serviço</th>
                    <th className="py-2 pr-3 text-right font-medium">Atend.</th>
                    <th className="py-2 pr-3 text-right font-medium">Receita</th>
                    <th className="py-2 pr-3 text-right font-medium">Custo</th>
                    <th className="py-2 pr-3 text-right font-medium">Comissão</th>
                    <th className="py-2 pr-3 text-right font-medium">Lucro</th>
                    <th className="py-2 text-right font-medium">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isTop = top3Ids.has(r.service_id);
                    const isLowMargin = r.margin_percent < 20 && r.gross_profit >= 0;
                    const isLoss = r.gross_profit < 0;
                    return (
                      <tr key={r.service_id} className="border-b border-border">
                        <td className="py-2 pr-3">
                          <span className="inline-flex items-center gap-2">
                            {r.service_name}
                            {isTop ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500 text-emerald-700"
                              >
                                <Award className="mr-1 h-3 w-3" /> Top
                              </Badge>
                            ) : null}
                            {isLowMargin ? (
                              <Badge
                                variant="outline"
                                className="border-amber-500 text-amber-700"
                              >
                                <AlertTriangle className="mr-1 h-3 w-3" /> Margem baixa
                              </Badge>
                            ) : null}
                            {isLoss ? (
                              <Badge variant="outline" className="border-destructive text-destructive">
                                <TrendingDown className="mr-1 h-3 w-3" /> Prejuízo
                              </Badge>
                            ) : null}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {r.items_count}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {formatBRL(r.revenue_gross)}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums text-destructive">
                          {formatBRL(r.variable_cost)}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums text-destructive">
                          {formatBRL(r.commissions)}
                        </td>
                        <td
                          className={`py-2 pr-3 text-right tabular-nums font-semibold ${
                            r.gross_profit >= 0 ? 'text-emerald-700' : 'text-destructive'
                          }`}
                        >
                          {formatBRL(r.gross_profit)}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {r.margin_percent.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-semibold">
                    <td className="py-2 pr-3">Total</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {rows.reduce((a, r) => a + r.items_count, 0)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {formatBRL(totals.revenue)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-destructive">
                      {formatBRL(totals.variableCost)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-destructive">
                      {formatBRL(totals.commissions)}
                    </td>
                    <td
                      className={`py-2 pr-3 text-right tabular-nums ${
                        totals.profit >= 0 ? 'text-emerald-700' : 'text-destructive'
                      }`}
                    >
                      {formatBRL(totals.profit)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {totals.revenue > 0
                        ? `${((totals.profit / totals.revenue) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
