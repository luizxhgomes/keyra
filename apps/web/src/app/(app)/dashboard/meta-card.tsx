import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/money';

import { getCurrentMonthGoalProgress } from '../financeiro/actions';
import { ErrorMessage } from '@/components/keyra';

export async function MetaCard() {
  const result = await getCurrentMonthGoalProgress();

  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={result.error} />
        </CardContent>
      </Card>
    );
  }

  const p = result.data;
  const hasGoal = p.goal !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta do mês</CardTitle>
        {hasGoal ? (
          <CardDescription>
            {p.daysRemainingInMonth} {p.daysRemainingInMonth === 1 ? 'dia' : 'dias'} restantes
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {!hasGoal ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não definiu meta para o mês.{' '}
            <Link href="/financeiro/metas" className="text-primary hover:underline">
              Criar meta →
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {p.revenue.target !== null ? (
              <ProgressRow
                label="Receita"
                current={p.revenue.current}
                target={p.revenue.target}
                delta={p.revenue.delta}
                formatter={formatBRL}
              />
            ) : null}
            {p.profit.target !== null ? (
              <ProgressRow
                label="Lucro"
                current={p.profit.current}
                target={p.profit.target}
                delta={p.profit.delta}
                formatter={formatBRL}
              />
            ) : null}
            {p.appointments.target !== null ? (
              <ProgressRow
                label="Atendimentos"
                current={p.appointments.current}
                target={p.appointments.target}
                delta={p.appointments.delta}
                formatter={(n) => String(n)}
              />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProgressRow({
  label,
  current,
  target,
  delta,
  formatter,
}: {
  label: string;
  current: number;
  target: number;
  delta: number | null;
  formatter: (n: number) => string;
}) {
  const reached = delta !== null && delta >= 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm tabular-nums">
          <span className="font-semibold">{formatter(current)}</span>
          <span className="text-muted-foreground"> / {formatter(target)}</span>
        </span>
      </div>
      {delta !== null ? (
        <p
          className={`text-xs tabular-nums ${
            reached ? 'text-emerald-700' : 'text-muted-foreground'
          }`}
        >
          {reached
            ? `${formatter(Math.abs(delta))} acima da meta`
            : `${formatter(Math.abs(delta))} faltam para a meta`}
        </p>
      ) : null}
    </div>
  );
}
