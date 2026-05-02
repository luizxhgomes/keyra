import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComparativoTexto, ErrorMessage } from '@/components/keyra';
import { formatBRL } from '@/lib/money';

import { getDreMonthly, type DreLine } from '../actions';

/**
 * DRE — Demonstrativo do Resultado do Exercício.
 *
 * **Coluna "% sobre receita" (Story 6.0 / decisão da idealizadora):**
 * mantida como **ratio analítico** (peso de cada conta sobre receita bruta),
 * não como **comparativo de variação**. Princípio inegociável KEYRA "sem
 * percentual" aplica-se a comparativos (variação vs período anterior),
 * não a ratios (composição estrutural). Por isso a coluna `vs {period}`
 * usa `<ComparativoTexto>` com valores absolutos enquanto `% sobre receita`
 * permanece percentual — duas dimensões diferentes de análise.
 */

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
        <h2 className="text-h2">DRE — {periodLabel}</h2>
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
                <th className="py-stack-loose pr-3 font-medium">Conta</th>
                <th className="py-stack-loose pr-3 text-right font-medium">Mês corrente</th>
                <th className="py-stack-loose pr-3 text-right font-medium">% sobre receita</th>
                <th className="py-stack-loose text-right font-medium">vs {period}</th>
              </tr>
            </thead>
            <tbody>
              {order.map(({ key, emphasis }) => {
                const line = lines[key] as DreLine;
                const delta = line.amount - line.amountLastMonth;
                const isFinal = emphasis === 'final';
                const isSubtotal = emphasis === 'subtotal';
                // Story 6.4 — hierarquia visual:
                // - subtotal (`revenueNet`): bg-muted/30 + text-h3 (20px / 600) + border-t-2
                // - final (`netProfit`): bg-muted/50 + text-h2 (24px / 600) + cor por sinal + border-t-2
                // - linhas regulares: ritmo `py-stack-loose` (24px) — DRE é tela de leitura
                const rowEmphasisClass = isFinal
                  ? 'bg-muted/50 text-h2 border-t-2 border-border'
                  : isSubtotal
                    ? 'bg-muted/30 text-h3 border-t-2 border-border'
                    : '';
                const finalAmountColorClass = isFinal
                  ? line.amount >= 0
                    ? 'text-secondary'
                    : 'text-destructive'
                  : '';
                return (
                  <tr
                    key={key}
                    className={`border-b border-border ${rowEmphasisClass}`}
                  >
                    <td className={`py-stack-loose pr-3 ${finalAmountColorClass}`}>
                      {line.label}
                    </td>
                    <td
                      className={`py-stack-loose pr-3 text-right tabular-nums ${finalAmountColorClass}`}
                    >
                      {formatBRL(line.amount)}
                    </td>
                    <td className="py-stack-loose pr-3 text-right tabular-nums text-muted-foreground">
                      {line.percentOfRevenue.toFixed(1)}%
                    </td>
                    <td className="py-stack-loose text-right">
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
