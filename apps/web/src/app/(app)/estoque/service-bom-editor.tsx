'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
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
import { formatBRL } from '@/lib/money';

import {
  attachSupplyToService,
  detachSupplyFromService,
  type ServiceBomRow,
  type SupplyPicker,
} from './actions';

type Props = {
  serviceId: string;
  initialRows: ServiceBomRow[];
  pickerSupplies: SupplyPicker[];
};

/**
 * Editor inline de BOM (service_supplies) — Story 2.3 AC2.
 *
 * Renderiza a lista de insumos atualmente vinculados ao serviço + um form
 * pequeno (select de supply + input de quantidade) para adicionar.
 *
 * Cada attach/detach faz revalidate da rota `/servicos/[id]` no servidor; o
 * estado local serve só para feedback otimista enquanto a Server Action
 * roda. O custo total exibido é a soma das linhas atuais — quando o usuário
 * volta para a aba "Geral", o `unit_cost` do form principal já vem do banco
 * com o valor recalculado pela action.
 */
export function ServiceBomEditor({ serviceId, initialRows, pickerSupplies }: Props) {
  const [rows, setRows] = useState<ServiceBomRow[]>(initialRows);
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [isPending, startTransition] = useTransition();

  const totalCost = rows.reduce((acc, r) => acc + r.quantity * r.unit_cost, 0);

  const availableForPicker = pickerSupplies.filter(
    (s) => !rows.some((r) => r.supply_id === s.id),
  );

  function handleAdd() {
    if (!selectedSupplyId) {
      toast.error('Selecione um insumo.');
      return;
    }
    const qty = Number(quantity.replace(',', '.'));
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error('Quantidade deve ser maior que zero.');
      return;
    }
    const sup = pickerSupplies.find((s) => s.id === selectedSupplyId);
    if (!sup) return;

    startTransition(async () => {
      const result = await attachSupplyToService({
        serviceId,
        supplyId: selectedSupplyId,
        quantity: qty,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRows((prev) => [
        ...prev,
        {
          supply_id: sup.id,
          supply_name: sup.name,
          unit: sup.unit,
          unit_cost: sup.unit_cost,
          quantity: qty,
        },
      ]);
      setSelectedSupplyId('');
      setQuantity('1');
      toast.success('Insumo adicionado ao BOM.');
    });
  }

  function handleRemove(supplyId: string) {
    startTransition(async () => {
      const result = await detachSupplyFromService({ serviceId, supplyId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRows((prev) => prev.filter((r) => r.supply_id !== supplyId));
      toast.success('Insumo removido do BOM.');
    });
  }

  return (
    <div className="space-y-5">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sem insumos vinculados a este serviço. Adicione abaixo.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => {
            const lineCost = r.quantity * r.unit_cost;
            return (
              <li
                key={r.supply_id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.supply_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.quantity} {r.unit} × {formatBRL(r.unit_cost)} ={' '}
                    {formatBRL(lineCost)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleRemove(r.supply_id)}
                  aria-label={`Remover ${r.supply_name} do BOM`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > 0 ? (
        <p className="text-sm font-semibold">
          Custo total estimado: {formatBRL(totalCost)}
        </p>
      ) : null}

      <div className="space-y-3 border-t border-border pt-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,120px,auto]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bom-supply">Insumo</Label>
            <Select
              value={selectedSupplyId}
              onValueChange={setSelectedSupplyId}
              disabled={isPending || availableForPicker.length === 0}
            >
              <SelectTrigger id="bom-supply">
                <SelectValue
                  placeholder={
                    availableForPicker.length === 0
                      ? 'Todos os insumos já foram vinculados'
                      : 'Selecione um insumo'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableForPicker.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.unit} · {formatBRL(s.unit_cost)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bom-qty">Quantidade</Label>
            <Input
              id="bom-qty"
              type="number"
              step="0.001"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleAdd}
              disabled={isPending || !selectedSupplyId}
              className="w-full sm:w-auto"
            >
              Adicionar
            </Button>
          </div>
        </div>
        {pickerSupplies.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum insumo cadastrado. Vá em <strong>Estoque → Insumos</strong> para criar.
          </p>
        ) : null}
      </div>
    </div>
  );
}
