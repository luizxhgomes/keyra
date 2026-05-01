import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComparativoTexto, ErrorMessage } from '@/components/keyra';
import { formatBRL } from '@/lib/money';

import { getDreMonthly, type DreLine } from '../actions';

type PageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function DrePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getDreMonthly({
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

  const { lines, periodLabel } = result.data;
  const order: Array<{ key: keyof typeof lines; emphasis?: 'subtotal' | 'final' }> = [
    { key: 'revenueGross' },
    { key: 'acquirerFees' },
    { key: 'revenueNet', emphasis: 'subtotal' },
    { key: 'variableCosts' },
    { key: 'commissions' },
    { key: 'fixedCosts' },
    { key: 'operatingExpenses' },
    { key: 'taxes' },
    { key: 'netProfit', emphasis: 'final' },
  ];

  const period = periodLabel.split(' ')[0] ?? 'mês passado';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">DRE — {periodLabel}</h2>
        <p className="text-sm text-muted-foreground">
          Demonstrativo do Resultado do Exercício. Compare absoluto com o mês anterior
          para enxergar tendências.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultado do mês</CardTitle>
          <CardDescription>
            Receita Bruta − Taxas − Custos − Despesas = Lucro Líquido. Valores brutos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Conta</th>
                <th className="py-2 pr-3 text-right font-medium">Mês corrente</th>
                <th className="py-2 pr-3 text-right font-medium">% sobre receita</th>
                <th className="py-2 text-right font-medium">vs {period}</th>
              </tr>
            </thead>
            <tbody>
              {order.map(({ key, emphasis }) => {
                const line = lines[key] as DreLine;
                const delta = line.amount - line.amountLastMonth;
                const isFinal = emphasis === 'final';
                const isSubtotal = emphasis === 'subtotal';
                return (
                  <tr
                    key={key}
                    className={`border-b border-border ${
                      isFinal
                        ? 'bg-muted/50 font-bold'
                        : isSubtotal
                          ? 'bg-muted/30 font-semibold'
                          : ''
                    }`}
                  >
                    <td className="py-2 pr-3">{line.label}</td>
                    <td
                      className={`py-2 pr-3 text-right tabular-nums ${
                        isFinal && line.amount < 0 ? 'text-destructive' : ''
                      } ${isFinal && line.amount >= 0 ? 'text-emerald-700' : ''}`}
                    >
                      {formatBRL(line.amount)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                      {line.percentOfRevenue.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right">
                      {line.amountLastMonth === 0 && line.amount === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <ComparativoTexto
                          delta={Math.round(delta * 100)}
                          period={period}
                          sentiment="neutral"
                          format="full"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Impostos do MVP = R$ 0 (clínicas operam Simples Nacional/DAS único). Módulo
        fiscal completo entra na Phase 5.
      </p>
    </div>
  );
}
