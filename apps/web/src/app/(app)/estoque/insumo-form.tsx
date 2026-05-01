'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supplySchema, type SupplyInput } from '@/lib/validators/supply';

import { upsertSupply } from './actions';

type Props = {
  initial?: Partial<SupplyInput>;
  submitLabel: string;
  redirectTo?: string;
};

export function InsumoForm({ initial, submitLabel, redirectTo }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SupplyInput>({
    resolver: zodResolver(supplySchema),
    defaultValues: {
      ...(initial?.id ? { id: initial.id } : {}),
      name: initial?.name ?? '',
      unit: initial?.unit ?? 'un',
      unitCost: initial?.unitCost ?? 0,
      ...(initial?.reorderLevel !== undefined ? { reorderLevel: initial.reorderLevel } : {}),
      supplierName: initial?.supplierName ?? '',
      active: initial?.active ?? true,
    },
  });

  function onSubmit(values: SupplyInput) {
    startTransition(async () => {
      const result = await upsertSupply(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(initial?.id ? 'Insumo atualizado.' : 'Insumo cadastrado.');
      if (redirectTo) {
        router.push(redirectTo);
      } else if (!initial?.id) {
        router.push(`/estoque/insumos/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-4">
      {initial?.id ? <input type="hidden" {...form.register('id')} /> : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ins-name">Nome *</Label>
        <Input id="ins-name" disabled={isPending} {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ins-unit">Unidade</Label>
          <Input
            id="ins-unit"
            placeholder="un, ml, g, kg..."
            disabled={isPending}
            {...form.register('unit')}
          />
          {form.formState.errors.unit ? (
            <p className="text-xs text-destructive">{form.formState.errors.unit.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ins-cost">Custo unitário (R$) *</Label>
          <Input
            id="ins-cost"
            type="number"
            step="0.01"
            min="0"
            disabled={isPending}
            {...form.register('unitCost')}
          />
          {form.formState.errors.unitCost ? (
            <p className="text-xs text-destructive">{form.formState.errors.unitCost.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ins-reorder">Nível de recompra</Label>
          <Input
            id="ins-reorder"
            type="number"
            step="0.001"
            min="0"
            placeholder="Opcional"
            disabled={isPending}
            {...form.register('reorderLevel')}
          />
          {form.formState.errors.reorderLevel ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.reorderLevel.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ins-supplier">Fornecedor</Label>
          <Input
            id="ins-supplier"
            placeholder="Opcional"
            disabled={isPending}
            {...form.register('supplierName')}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          disabled={isPending}
          className="h-4 w-4 rounded border-input"
          {...form.register('active')}
        />
        <span>Ativo (aparece nos pickers de serviço)</span>
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => router.push('/estoque/insumos')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
