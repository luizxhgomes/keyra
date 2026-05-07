'use client';

import { useState, useTransition } from 'react';
import { ListPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/keyra';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatBRL } from '@/lib/money';

import {
  addCommandItem,
  applyCommandDiscount,
  finalizeCommand,
  removeCommandItem,
  type CommandItem,
  type ServicePicker,
} from './actions';

type Props = {
  commandId: string;
  status: 'open' | 'finalized' | 'paid' | 'cancelled';
  initialItems: CommandItem[];
  initialDiscount: number;
  servicesPicker: ServicePicker[];
};

/**
 * Editor inline da comanda (Story 3.1).
 *
 * Apenas comandas `status='open'` podem ser editadas — as actions já
 * validam, mas a UI também desabilita os controles para evitar erros.
 *
 * O subtotal/total NÃO é calculado aqui — vem do banco (commands.subtotal
 * é mantido pelo trigger `trg_command_items_recompute`; commands.total é
 * GENERATED). O componente exibe um total local para feedback otimista
 * enquanto a Server Action roda; após revalidate, o servidor reenvia o
 * valor canônico.
 */
export function ComandaEditForm({
  commandId,
  status,
  initialItems,
  initialDiscount,
  servicesPicker,
}: Props) {
  const [items, setItems] = useState<CommandItem[]>(initialItems);
  const [discount, setDiscount] = useState<string>(initialDiscount.toFixed(2));
  const [serviceId, setServiceId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const editable = status === 'open';
  const subtotal = items.reduce((acc, i) => acc + i.total, 0);
  const discountNum = Number(discount.replace(',', '.')) || 0;
  const total = Math.max(0, subtotal - discountNum);

  function pickService(id: string) {
    setServiceId(id);
    const svc = servicesPicker.find((s) => s.id === id);
    if (svc) setUnitPrice(svc.price.toFixed(2));
  }

  function handleAdd() {
    const svc = servicesPicker.find((s) => s.id === serviceId);
    if (!svc) {
      toast.error('Selecione um serviço.');
      return;
    }
    const qty = Number(quantity.replace(',', '.'));
    const price = Number(unitPrice.replace(',', '.'));
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error('Quantidade inválida.');
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast.error('Preço inválido.');
      return;
    }

    startTransition(async () => {
      const result = await addCommandItem({
        commandId,
        serviceId: svc.id,
        description: svc.name,
        quantity: qty,
        unitPrice: price,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setItems((prev) => [
        ...prev,
        {
          id: result.data.id,
          service_id: svc.id,
          description: svc.name,
          quantity: qty,
          unit_price: price,
          unit_cost: 0,
          commission_rate: 0,
          discount_amount: 0,
          total: qty * price,
        },
      ]);
      setServiceId('');
      setQuantity('1');
      setUnitPrice('');
      toast.success('Item adicionado.');
    });
  }

  function handleRemove(itemId: string) {
    startTransition(async () => {
      const result = await removeCommandItem({ commandId, itemId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success('Item removido.');
    });
  }

  function handleApplyDiscount() {
    startTransition(async () => {
      const result = await applyCommandDiscount({
        commandId,
        discountAmount: discountNum,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Desconto aplicado.');
    });
  }

  function handleFinalize() {
    if (items.length === 0) {
      toast.error('Adicione ao menos um item antes de finalizar.');
      return;
    }
    const ok = confirm(
      `Finalizar comanda no valor de ${formatBRL(total)}? Após finalizar, ela aceita pagamento (Story 3.2) mas não pode mais ser editada.`,
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await finalizeCommand({ id: commandId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Comanda finalizada. Pronta para receber pagamento.');
    });
  }

  return (
    <div className="space-y-5">
      {items.length === 0 ? (
        <EmptyState
          icon={ListPlus}
          title="Comanda sem itens"
          description="Adicione um serviço abaixo para registrar este atendimento."
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{it.description}</p>
                <p className="text-xs text-muted-foreground">
                  {it.quantity} × {formatBRL(it.unit_price)} = {formatBRL(it.total)}
                </p>
              </div>
              {editable ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleRemove(it.id)}
                  aria-label={`Remover ${it.description}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Subtotal: </span>
          <span className="font-semibold tabular-nums">{formatBRL(subtotal)}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Desconto: </span>
          <span className="font-semibold tabular-nums">{formatBRL(discountNum)}</span>
        </p>
        <p className="text-base">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-bold tabular-nums">{formatBRL(total)}</span>
        </p>
      </div>

      {editable ? (
        <>
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Adicionar item</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,100px,140px,auto]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cmd-svc">Serviço</Label>
                <Select value={serviceId} onValueChange={pickService} disabled={isPending}>
                  <SelectTrigger id="cmd-svc">
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesPicker.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({formatBRL(s.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cmd-qty">Qtd</Label>
                <Input
                  id="cmd-qty"
                  type="number"
                  step="0.001"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cmd-price">Preço un. (R$)</Label>
                <Input
                  id="cmd-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAdd}
                  disabled={isPending || !serviceId}
                  className="w-full sm:w-auto"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Desconto</p>
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1.5 max-w-[180px]">
                <Label htmlFor="cmd-discount">Valor (R$)</Label>
                <Input
                  id="cmd-discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleApplyDiscount}
                disabled={isPending}
              >
                Aplicar desconto
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <Button
              type="button"
              onClick={handleFinalize}
              disabled={isPending || items.length === 0}
              className="w-full sm:w-auto"
            >
              Finalizar comanda
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Após finalizar, a comanda aceita pagamento (Story 3.2) e fica imutável.
            </p>
          </div>
        </>
      ) : (
        <p className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          Comanda {status === 'finalized' ? 'finalizada' : status === 'paid' ? 'paga' : 'cancelada'}
          — somente leitura.
        </p>
      )}
    </div>
  );
}
