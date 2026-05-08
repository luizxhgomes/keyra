import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import type { VarianceMonth } from '../actions';

interface Props {
  months: VarianceMonth[];
}

/**
 * Tabela Variance (Realizado vs Meta) — inspirada em Img 21 (Analyze Variance:
 * Actual and Budgeted). Adaptada para schema KEYRA: metas mensais opcionais
 * de receita / lucro / atendimentos.
 *
 * Mostra:
 * - Realizado (azul-cinza) e Meta (verde) por linha mensal
 * - Status pill: ▲ atingiu (success) / ▼ abaixo (rust) / — sem meta (mocha)
 * - Apenas meses passados/atual (futuros sem dado realizado)
 */
export function VarianceTable({ months }: Props) {
  const today = new Date();
  const currentMonth = today.getMonth();
  // Mostrar só até o mês corrente (futuros não têm dados realizados)
  const visible = months.slice(0, currentMonth + 1);

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-xl">
          Realizado vs Meta · {today.getFullYear()}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Comparativo mês a mês entre meta cadastrada e número realizado
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mocha-300/30 text-left">
                <Th>Mês</Th>
                <Th align="right">Receita realizada</Th>
                <Th align="right">Meta</Th>
                <Th align="right">Lucro realizado</Th>
                <Th align="right">Meta</Th>
                <Th align="right">Atend.</Th>
                <Th align="right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    Sem dados realizados ainda — aguarde transações registradas.
                  </td>
                </tr>
              ) : (
                visible.map((m) => {
                  const revStatus = computeStatus(
                    m.actualRevenueCents,
                    m.targetRevenueCents,
                  );
                  return (
                    <tr
                      key={m.periodMonth}
                      className="border-b border-mocha-300/20"
                    >
                      <Td>
                        <span className="font-medium capitalize text-foreground">
                          {m.monthLabel}
                        </span>
                      </Td>
                      <Td align="right" mono>
                        {formatCentsBRL(m.actualRevenueCents)}
                      </Td>
                      <Td align="right" mono>
                        {m.targetRevenueCents !== null
                          ? formatCentsBRL(m.targetRevenueCents)
                          : '—'}
                      </Td>
                      <Td align="right" mono>
                        <span
                          className={cn(
                            m.actualProfitCents < 0 && 'text-rust-800',
                          )}
                        >
                          {formatCentsBRL(m.actualProfitCents)}
                        </span>
                      </Td>
                      <Td align="right" mono>
                        {m.targetProfitCents !== null
                          ? formatCentsBRL(m.targetProfitCents)
                          : '—'}
                      </Td>
                      <Td align="right" mono>
                        {m.actualAppointments}
                        {m.targetAppointments !== null
                          ? ` / ${m.targetAppointments}`
                          : ''}
                      </Td>
                      <Td align="right">
                        <StatusPill status={revStatus} />
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function computeStatus(
  actual: number,
  target: number | null,
): 'no-goal' | 'achieved' | 'partial' | 'below' {
  if (target === null || target === 0) return 'no-goal';
  const ratio = actual / target;
  if (ratio >= 1) return 'achieved';
  if (ratio >= 0.7) return 'partial';
  return 'below';
}

function StatusPill({
  status,
}: {
  status: 'no-goal' | 'achieved' | 'partial' | 'below';
}) {
  const styles = {
    'no-goal': 'border-mocha-300/40 bg-ivory-50 text-mocha-300',
    achieved: 'border-success-leaf/40 bg-success-leaf/10 text-success-deep',
    partial: 'border-amber-500/30 bg-amber-300/15 text-amber-500',
    below: 'border-rust-800/30 bg-rust-800/10 text-rust-800',
  }[status];
  const label = {
    'no-goal': 'Sem meta',
    achieved: '▲ Atingiu',
    partial: '◐ Parcial',
    below: '▼ Abaixo',
  }[status];
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        styles,
      )}
    >
      {label}
    </span>
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

function Td({
  children,
  align = 'left',
  mono = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        'py-3 pr-3 text-foreground',
        align === 'right' ? 'text-right' : 'text-left',
        mono ? 'tabular-nums' : '',
      )}
    >
      {children}
    </td>
  );
}
