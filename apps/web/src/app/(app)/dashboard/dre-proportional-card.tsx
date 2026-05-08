import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

interface Props {
  revenueCents: number;
  expensesCents: number;
  profitCents: number;
}

/**
 * DRE proporcional do mês — barra horizontal segmentada.
 * Inspirado em: dashboard reference (Asset Valuation).
 *
 * Adaptação:
 * - Barra horizontal segmentada mostra proporção Receita / Despesas / Lucro
 * - 3 cards High/Medium/Low → 3 cards Receita/Despesas/Lucro com radio decorativo
 * - Cores KEYRA: terracota (receita), mocha (despesas), success-leaf (lucro)
 *
 * Princípio UX atualizado: gráficos proporcionais permitidos como reforço.
 */
export function DREProportionalCard({
  revenueCents,
  expensesCents,
  profitCents,
}: Props) {
  const hasData = revenueCents > 0 || expensesCents > 0;
  const total = Math.max(revenueCents, expensesCents + Math.max(profitCents, 0));
  // Mock visual quando vazio — proporção 60/40 ilustrativa
  const expensesShare = hasData
    ? total > 0
      ? (expensesCents / total) * 100
      : 0
    : 60;
  const profitShare = hasData
    ? total > 0
      ? (Math.max(profitCents, 0) / total) * 100
      : 0
    : 40;
  const profitMargin =
    revenueCents > 0 ? (profitCents / revenueCents) * 100 : 0;

  const segments = [
    {
      label: 'Despesas',
      value: expensesCents,
      width: expensesShare,
      bg: 'bg-cocoa-900',
      pct: revenueCents > 0 ? (expensesCents / revenueCents) * 100 : 0,
    },
    {
      label: 'Lucro',
      value: profitCents,
      width: profitShare,
      bg: 'bg-success-leaf',
      pct: profitMargin,
    },
  ];

  return (
    <Card className="flex h-full flex-col shadow-warm-sm">
      <CardHeader className="pb-3 flex-row items-baseline justify-between space-y-0">
        <CardTitle className="font-serif text-xl">DRE proporcional</CardTitle>
        <span className="text-xs text-muted-foreground">Mês corrente</span>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5">
        {/* Barra segmentada — mostra mock 60/40 quando vazio */}
        <div
          className={cn(
            'flex h-12 w-full overflow-hidden rounded-full bg-mocha-300/20',
            !hasData && 'opacity-30',
          )}
          aria-hidden={!hasData}
        >
          {(hasData ? segments : [
            { label: 'Despesas', value: 0, width: 60, bg: 'bg-cocoa-900', pct: 0 },
            { label: 'Lucro', value: 0, width: 40, bg: 'bg-success-leaf', pct: 0 },
          ]).map((seg) =>
            seg.width > 0 ? (
              <div
                key={seg.label}
                className={cn(
                  'flex h-full items-center justify-center text-xs font-medium text-ivory-50',
                  seg.bg,
                )}
                style={{ width: `${seg.width}%`, minWidth: seg.width > 0 ? '2rem' : 0 }}
                title={`${seg.label}: ${formatCentsBRL(seg.value)}`}
              >
                {hasData && seg.width > 8 ? `${seg.pct.toFixed(0)}%` : ''}
              </div>
            ) : null,
          )}
        </div>
        {!hasData && (
          <p className="-mt-3 text-center text-xs text-muted-foreground">
            Lance receita e despesas pra ver a proporção real
          </p>
        )}

        {/* 3 cards: Receita / Despesas / Lucro */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ProportionalRow
            label="Receita"
            value={revenueCents}
            dotClass="bg-terracotta-500"
            footnote="Total realizado"
          />
          <ProportionalRow
            label="Despesas"
            value={expensesCents}
            dotClass="bg-cocoa-900"
            footnote={
              revenueCents > 0
                ? `${((expensesCents / revenueCents) * 100).toFixed(0)}% da receita`
                : '—'
            }
          />
          <ProportionalRow
            label="Lucro"
            value={profitCents}
            dotClass="bg-success-leaf"
            footnote={
              revenueCents > 0
                ? `Margem ${profitMargin.toFixed(0)}%`
                : '—'
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ProportionalRow({
  label,
  value,
  dotClass,
  footnote,
}: {
  label: string;
  value: number;
  dotClass: string;
  footnote: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-mocha-300/30 p-3">
      <div className="flex items-center gap-2">
        <span
          className={cn('h-2.5 w-2.5 rounded-full', dotClass)}
          aria-hidden="true"
        />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="font-serif text-2xl font-light tracking-tight text-foreground tabular-nums">
        {formatCentsBRL(value)}
      </p>
      <p className="text-xs text-muted-foreground">{footnote}</p>
    </div>
  );
}
