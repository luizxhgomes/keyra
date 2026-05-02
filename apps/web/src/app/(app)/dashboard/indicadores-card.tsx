import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorMessage } from '@/components/keyra';
import { BarChart3 } from 'lucide-react';
import { formatCentsBRL } from '@/lib/money';

import { getIndicators } from './actions';

export async function IndicadoresCard() {
  const result = await getIndicators();

  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={result.error} />
        </CardContent>
      </Card>
    );
  }

  const i = result.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores</CardTitle>
        <CardDescription>Ticket médio · top serviço · taxa de comparecimento.</CardDescription>
      </CardHeader>
      <CardContent>
        {!i.hasData ? (
          <EmptyState
            icon={BarChart3}
            title="Indicadores aparecem após o primeiro atendimento pago"
            description="Ticket médio, top serviço e taxa de comparecimento ganham vida assim que você concluir atendimentos e registrar pagamentos."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Cell
              label="Ticket médio"
              value={formatCentsBRL(i.ticketMedioCents)}
              hint={
                i.ticketMedioLastMonthCents > 0
                  ? `vs ${formatCentsBRL(i.ticketMedioLastMonthCents)} no mês passado`
                  : '—'
              }
            />
            <Cell
              label="Taxa de comparecimento"
              value={`${i.attendanceRate.toFixed(1)}%`}
              hint={
                i.attendanceRateLastMonth > 0
                  ? `vs ${i.attendanceRateLastMonth.toFixed(1)}% no mês passado`
                  : '—'
              }
            />
            <Cell
              label="Top serviço (vendas)"
              value={i.topServiceByQuantity?.name ?? '—'}
              hint={
                i.topServiceByQuantity
                  ? `${i.topServiceByQuantity.quantity} unidades`
                  : 'Sem dados'
              }
            />
            <Cell
              label="Top serviço (lucro)"
              value={i.topServiceByProfit?.name ?? '—'}
              hint={
                i.topServiceByProfit
                  ? formatCentsBRL(i.topServiceByProfit.profitCents)
                  : 'Sem dados'
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Cell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums truncate">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground truncate">{hint}</p> : null}
    </div>
  );
}
