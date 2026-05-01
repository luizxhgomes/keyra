import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/money';

import { listInventoryMovements } from '../../estoque/actions';

type Props = {
  commandId: string;
  status: 'open' | 'finalized' | 'paid' | 'cancelled';
};

/**
 * Card "Consumo de insumos" no detalhe da comanda (Story 3.8).
 *
 * Visível apenas quando a comanda está paga. O trigger
 * `_consume_command_inventory` cria movements `service_consumption` ao
 * pagar a comanda — esta UI apenas lista o que foi consumido.
 */
export async function ConsumoCard({ commandId, status }: Props) {
  if (status !== 'paid') return null;

  const result = await listInventoryMovements({ commandId, page: 1 });
  if (!result.ok) return null;

  const rows = result.data.rows.filter((r) => r.movement_type === 'service_consumption');
  if (rows.length === 0) return null;

  const totalCost = rows.reduce(
    (a, r) => a + Math.abs(r.quantity) * (r.unit_cost_at_move ?? 0),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumo de insumos</CardTitle>
        <CardDescription>
          Insumos rateados automaticamente quando o pagamento foi confirmado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {rows.map((r) => {
            const consumedQty = Math.abs(r.quantity);
            const lineCost = consumedQty * (r.unit_cost_at_move ?? 0);
            return (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.supply_name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {consumedQty} × {formatBRL(r.unit_cost_at_move ?? 0)} ={' '}
                    {formatBRL(lineCost)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm font-semibold">
          Custo total dos insumos: {formatBRL(totalCost)}
        </p>
        <p className="mt-2">
          <Link
            href={`/estoque/movimentacoes?command=${commandId}`}
            className="text-xs text-primary hover:underline"
          >
            Ver no histórico de movimentações →
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
