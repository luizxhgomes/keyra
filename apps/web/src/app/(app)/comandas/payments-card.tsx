'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatBRL } from '@/lib/money';

import {
  type AccountPicker,
  type PaymentMethodPicker,
  type PaymentRow,
} from './actions';
import { PaymentForm } from './payment-form';

type Props = {
  commandId: string;
  status: 'open' | 'finalized' | 'paid' | 'cancelled';
  total: number;
  paidAmount: number;
  payments: PaymentRow[];
  methods: PaymentMethodPicker[];
  accounts: AccountPicker[];
};

/**
 * Card de pagamentos no detalhe da comanda (Story 3.2).
 *
 * Aceita pagamento apenas se status='finalized' e há saldo restante.
 * Após registrar, a comanda revalida — o trigger atualiza paid_amount
 * e potencialmente status='paid'.
 */
export function PaymentsCard({
  commandId,
  status,
  total,
  paidAmount,
  payments,
  methods,
  accounts,
}: Props) {
  const [open, setOpen] = useState(false);
  const remaining = Math.max(0, total - paidAmount);
  const canPay = status === 'finalized' && remaining > 0.001;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-semibold tabular-nums">{formatBRL(total)}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Pago: </span>
            <span className="font-semibold tabular-nums">{formatBRL(paidAmount)}</span>
            {' · '}
            <span className="text-muted-foreground">Restante: </span>
            <span className="font-semibold tabular-nums">{formatBRL(remaining)}</span>
          </p>
        </div>
        {canPay ? (
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Registrar pagamento
          </Button>
        ) : null}
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {status === 'open'
            ? 'Comanda aberta — finalize antes de registrar pagamento.'
            : status === 'paid'
              ? 'Comanda paga.'
              : 'Sem pagamentos registrados ainda.'}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {p.payment_method_name}
                  {p.installments > 1 ? ` · ${p.installments}x` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(p.paid_at), "d 'de' MMM, HH:mm", { locale: ptBR })}
                  {' · '}
                  {p.account_name}
                  {p.external_reference ? ` · ${p.external_reference}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums">
                  {formatBRL(p.gross_amount)}
                </p>
                {p.fee_amount > 0 ? (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Líq. {formatBRL(p.net_amount)} (taxa {formatBRL(p.fee_amount)})
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <PaymentForm
        commandId={commandId}
        remaining={remaining}
        open={open}
        onOpenChange={setOpen}
        methods={methods}
        accounts={accounts}
        onRegistered={() => {
          // Revalidate é feito server-side; o RSC reinicia.
        }}
      />
    </div>
  );
}
