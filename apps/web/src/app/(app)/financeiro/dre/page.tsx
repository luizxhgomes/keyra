import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ComparativoTexto, ErrorMessage } from '@/components/keyra';
import { formatBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import { getDreMonthly, type DreLine } from '../actions';

/**
 * DRE — Demonstrativo do Resultado do Exercício.
 *
 * **Coluna "% sobre receita" (Story 6.0 / decisão da idealizadora):**
 * mantida como **ratio analítico** (peso de cada conta sobre receita bruta),
 * não como **comparativo de variação**. Princípio inegociável KEYRA "sem
 * percentual" aplica-se a comparativos (variação vs período anterior),
 * não a ratios (composição estrutural).
 *
 * Refinamento Editorial (2026-05-08): tipografia Fraunces no título,
 * paleta KEYRA na hierarquia de linhas (cocoa-900/ivory-100 nos subtotais
 * e finais). Lógica financeira inalterada.
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
  const order: Array<{
    key: keyof typeof lines;
    emphasis?: 'subtotal' | 'final';
  }> = [
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
  const margin =
    lines.revenueGross.amount > 0
      ? (lines.netProfit.amount / lines.revenueGross.amount) * 100
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-display text-foreground capitalize">
          DRE · {periodLabel}
        </h2>
        <p className="text-sm text-muted-foreground">
          Demonstrativo do Resultado do Exercício. Compare absoluto com o mês
          anterior para enxergar tendências.
        </p>
      </header>

      {/* Resumo do mês — 3 KPIs editoriais */}
      <section
        aria-label="Resumo do mês"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <SummaryCard
          label="Receita líquida"
          value={formatBRL(lines.revenueNet.amount)}
          accent="terracota"
          helper={`${lines.revenueNet.percentOfRevenue.toFixed(1)}% da bruta`}
        />
        <SummaryCard
          label="Lucro líquido"
          value={formatBRL(lines.netProfit.amount)}
          accent={lines.netProfit.amount >= 0 ? 'success' : 'destructive'}
          helper={`Margem ${margin.toFixed(1)}%`}
        />
        <SummaryCard
          label="Custos + despesas"
          value={formatBRL(
            lines.variableCosts.amount +
              lines.commissions.amount +
              lines.fixedCosts.amount +
              lines.operatingExpenses.amount,
          )}
          accent="cocoa"
          helper="Variáveis + comissões + fixos + operacionais"
        />
      </section>

      <Card className="shadow-warm-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Resultado do mês</CardTitle>
          <CardDescription>
            Receita Bruta − Taxas − Custos − Despesas = Lucro Líquido. Valores
            absolutos em reais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mocha-300/30 text-left">
                  <Th>Conta</Th>
                  <Th align="right">Mês corrente</Th>
                  <Th align="right">% sobre receita</Th>
                  <Th align="right">vs {period}</Th>
                </tr>
              </thead>
              <tbody>
                {order.map(({ key, emphasis }) => {
                  const line = lines[key] as DreLine;
                  const delta = line.amount - line.amountLastMonth;
                  const isFinal = emphasis === 'final';
                  const isSubtotal = emphasis === 'subtotal';

                  const rowClass = isFinal
                    ? 'bg-cocoa-900/[.04] border-t-2 border-cocoa-900/30'
                    : isSubtotal
                      ? 'bg-ivory-100/60 border-t border-mocha-300/40'
                      : '';

                  const labelClass = isFinal
                    ? 'font-serif text-lg font-semibold text-foreground'
                    : isSubtotal
                      ? 'font-medium text-foreground'
                      : 'text-foreground';

                  const amountClass = isFinal
                    ? `font-serif text-2xl font-light tabular-nums ${
                        line.amount >= 0 ? 'text-success-deep' : 'text-rust-800'
                      }`
                    : isSubtotal
                      ? 'font-medium tabular-nums text-cocoa-900'
                      : 'tabular-nums text-foreground';

                  return (
                    <tr
                      key={key}
                      className={cn(
                        'border-b border-mocha-300/20',
                        rowClass,
                      )}
                    >
                      <td className={cn('py-3 pr-3', labelClass)}>
                        {line.label}
                      </td>
                      <td className={cn('py-3 pr-3 text-right', amountClass)}>
                        {formatBRL(line.amount)}
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums text-muted-foreground">
                        {line.percentOfRevenue.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right">
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
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Impostos do MVP = R$ 0 (clínicas operam Simples Nacional/DAS único).
        Módulo fiscal completo entra na Phase 5.
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  accent: 'terracota' | 'success' | 'destructive' | 'cocoa';
}) {
  const accentClass = {
    terracota:
      'border-l-terracotta-500/40 bg-gradient-to-br from-amber-300/10 to-transparent',
    success:
      'border-l-success-leaf/50 bg-gradient-to-br from-success-leaf/10 to-transparent',
    destructive:
      'border-l-rust-800/50 bg-gradient-to-br from-rust-800/10 to-transparent',
    cocoa:
      'border-l-cocoa-900/40 bg-gradient-to-br from-cocoa-700/10 to-transparent',
  }[accent];

  return (
    <Card
      className={cn(
        'border-l-4 p-5 shadow-warm-sm transition-all duration-base ease-out-soft hover:shadow-warm-md',
        accentClass,
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-3xl font-light leading-none tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </Card>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={cn(
        'pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground',
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}
