'use client';

import { useMemo, useState, useTransition } from 'react';
import Decimal from 'decimal.js';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatBRL } from '@/lib/money';

import {
  registerPayment,
  type AccountPicker,
  type PaymentMethodPicker,
} from './actions';

type Props = {
  commandId: string;
  remaining: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  methods: PaymentMethodPicker[];
  accounts: AccountPicker[];
  onRegistered: () => void;
};

/**
 * Sheet de registro de pagamento (Story 3.2).
 *
 * Cálculo de fee em tempo real espelhando o que a Server Action faz:
 *   fee_amount = round(gross × fee_rate, 2) + fee_fixed
 *   net_amount = gross - fee_amount
 *   settle_at  = paid_at + settlement_days × 1 day
 *
 * Com Decimal.js + ROUND_HALF_EVEN para coincidir com NFR-FI-01.
 */
export function PaymentForm({
  commandId,
  remaining,
  open,
  onOpenChange,
  methods,
  accounts,
  onRegistered,
}: Props) {
  const [methodId, setMethodId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [grossInput, setGrossInput] = useState<string>(remaining.toFixed(2));
  const [installments, setInstallments] = useState<string>('1');
  const [externalRef, setExternalRef] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Reset quando reabre.
  const [prevOpen, setPrevOpen] = useState<boolean>(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMethodId('');
      setAccountId('');
      setGrossInput(remaining.toFixed(2));
      setInstallments('1');
      setExternalRef('');
    }
  }

  const method = methods.find((m) => m.id === methodId);
  const grossDecimal = useMemo(() => {
    const n = Number(grossInput.replace(',', '.'));
    if (Number.isNaN(n) || n <= 0) return null;
    return new Decimal(n);
  }, [grossInput]);

  const preview = useMemo(() => {
    if (!grossDecimal || !method) return null;
    const feeRate = new Decimal(method.fee_rate);
    const feeFixed = new Decimal(method.fee_fixed);
    const feeAmount = grossDecimal.times(feeRate).toDecimalPlaces(2).plus(feeFixed);
    const net = grossDecimal.minus(feeAmount);
    const settleAt = new Date();
    settleAt.setDate(settleAt.getDate() + method.settlement_days);
    return {
      gross: grossDecimal.toNumber(),
      fee: feeAmount.toNumber(),
      net: net.toNumber(),
      settleAt,
    };
  }, [grossDecimal, method]);

  // Auto-seleciona a conta default quando muda o método.
  function pickMethod(id: string) {
    setMethodId(id);
    const m = methods.find((x) => x.id === id);
    if (m?.default_account_id) {
      setAccountId(m.default_account_id);
    }
  }

  const exceedsRemaining = grossDecimal
    ? grossDecimal.toNumber() > remaining + 0.001
    : false;

  const canSubmit =
    !!methodId && !!accountId && !!grossDecimal && !exceedsRemaining && !isPending;

  function handleSubmit() {
    if (!canSubmit || !grossDecimal) return;
    const inst = Math.max(1, Number(installments) || 1);
    startTransition(async () => {
      const result = await registerPayment({
        commandId,
        paymentMethodId: methodId,
        accountId,
        grossAmount: grossDecimal.toNumber(),
        installments: inst,
        ...(externalRef.trim() ? { externalReference: externalRef.trim() } : {}),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        preview
          ? `Pagamento de ${formatBRL(preview.gross)} registrado.`
          : 'Pagamento registrado.',
      );
      onRegistered();
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Registrar pagamento</SheetTitle>
          <SheetDescription>
            Restante a pagar: <strong>{formatBRL(remaining)}</strong>. A taxa é
            calculada automaticamente conforme a forma de pagamento.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pay-method">Forma de pagamento *</Label>
            <Select value={methodId} onValueChange={pickMethod} disabled={isPending}>
              <SelectTrigger id="pay-method">
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {methods.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                    {m.fee_rate > 0
                      ? ` · ${(m.fee_rate * 100).toFixed(2)}%`
                      : ''}
                    {m.settlement_days > 0 ? ` · D+${m.settlement_days}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pay-account">Conta de destino *</Label>
            <Select value={accountId} onValueChange={setAccountId} disabled={isPending}>
              <SelectTrigger id="pay-account">
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-gross">Valor (R$) *</Label>
              <Input
                id="pay-gross"
                type="number"
                step="0.01"
                min="0"
                value={grossInput}
                onChange={(e) => setGrossInput(e.target.value)}
                disabled={isPending}
              />
              {exceedsRemaining ? (
                <p className="text-xs text-destructive">
                  Maior que o restante ({formatBRL(remaining)}).
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-inst">Parcelas</Label>
              <Input
                id="pay-inst"
                type="number"
                min="1"
                max="48"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pay-extref">Referência externa (NSU/Pix txid)</Label>
            <Input
              id="pay-extref"
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              placeholder="Opcional"
              disabled={isPending}
            />
          </div>

          {preview ? (
            <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Bruto: </span>
                <span className="font-semibold tabular-nums">
                  {formatBRL(preview.gross)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Taxa: </span>
                <span className="font-semibold tabular-nums text-destructive">
                  -{formatBRL(preview.fee)}
                </span>
              </p>
              <p className="text-base">
                <span className="text-muted-foreground">Líquido (entra na conta): </span>
                <span className="font-bold tabular-nums">{formatBRL(preview.net)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {method && method.settlement_days > 0
                  ? `Liquidação em D+${method.settlement_days}: ${preview.settleAt.toLocaleDateString('pt-BR')}`
                  : 'Liquidação imediata.'}
              </p>
            </div>
          ) : null}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full"
          >
            {isPending ? 'Registrando…' : 'Registrar pagamento'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="w-full"
          >
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
