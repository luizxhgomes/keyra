import { Users } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorMessage } from '@/components/keyra';
import { formatBRL } from '@/lib/money';

import { getDreByProfessional } from '../actions';

type PageProps = {
  searchParams: Promise<{ month?: string; cc?: string }>;
};

export default async function DreByProfessionalPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getDreByProfessional({
    ...(params.month ? { periodMonth: params.month } : {}),
    ...(params.cc ? { costCenter: params.cc } : {}),
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
  const totals = rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.revenue_gross,
      commission: acc.commission + r.commission_to_pay,
      profit: acc.profit + r.gross_profit,
    }),
    { revenue: 0, commission: 0, profit: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-h2">DRE por profissional — {periodLabel}</h2>
        <p className="text-sm text-muted-foreground">
          Performance individual. Use para decisões de retenção, promoção e ajuste de
          comissão.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Por profissional</CardTitle>
          <CardDescription>
            Ordenado por lucro líquido. Lucro = Receita − Custo de insumos − Comissão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sem atendimentos pagos no período"
              description="Quando você concluir e cobrar atendimentos, o lucro de cada profissional aparece aqui automaticamente."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-stack-loose pr-3 font-medium">Profissional</th>
                    <th className="py-stack-loose pr-3 font-medium">Centro</th>
                    <th className="py-stack-loose pr-3 text-right font-medium">Atend.</th>
                    <th className="py-stack-loose pr-3 text-right font-medium">Ticket médio</th>
                    <th className="py-stack-loose pr-3 text-right font-medium">Receita</th>
                    <th className="py-stack-loose pr-3 text-right font-medium">Comissão</th>
                    <th className="py-stack-loose text-right font-medium">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.professional_id} className="border-b border-border">
                      <td className="py-stack-loose pr-3 font-medium">{r.professional_name}</td>
                      <td className="py-stack-loose pr-3 text-muted-foreground">
                        {r.cost_center ?? '—'}
                      </td>
                      <td className="py-stack-loose pr-3 text-right tabular-nums">
                        {r.items_count}
                      </td>
                      <td className="py-stack-loose pr-3 text-right tabular-nums">
                        {formatBRL(r.ticket_medio)}
                      </td>
                      <td className="py-stack-loose pr-3 text-right tabular-nums">
                        {formatBRL(r.revenue_gross)}
                      </td>
                      <td className="py-stack-loose pr-3 text-right tabular-nums text-destructive">
                        {formatBRL(r.commission_to_pay)}
                      </td>
                      <td
                        className={`py-stack-loose text-right tabular-nums font-semibold ${
                          r.gross_profit >= 0 ? 'text-lucro' : 'text-destructive'
                        }`}
                      >
                        {formatBRL(r.gross_profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-semibold">
                    <td className="py-stack-loose pr-3" colSpan={4}>
                      Total
                    </td>
                    <td className="py-stack-loose pr-3 text-right tabular-nums">
                      {formatBRL(totals.revenue)}
                    </td>
                    <td className="py-stack-loose pr-3 text-right tabular-nums text-destructive">
                      {formatBRL(totals.commission)}
                    </td>
                    <td className="py-stack-loose text-right tabular-nums text-lucro">
                      {formatBRL(totals.profit)}
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
