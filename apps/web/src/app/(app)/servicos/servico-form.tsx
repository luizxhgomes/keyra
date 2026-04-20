'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { serviceSchema, type ServiceInput } from '@/lib/validators/service';

import { upsertService } from './actions';

type Props = {
  initial?: Partial<ServiceInput>;
  categories: Array<{ id: string; name: string }>;
  submitLabel: string;
  redirectTo?: string;
};

export function ServicoForm({ initial, categories, submitLabel, redirectTo }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      ...(initial?.id ? { id: initial.id } : {}),
      name: initial?.name ?? '',
      type: initial?.type ?? 'service',
      categoryId: initial?.categoryId ?? '',
      price: initial?.price ?? 0,
      unitCost: initial?.unitCost ?? 0,
      commissionPercent: initial?.commissionPercent,
      durationMinutes: initial?.durationMinutes,
      description: initial?.description ?? '',
      active: initial?.active ?? true,
    },
  });

  const watchType = useWatch({ control: form.control, name: 'type' });

  function onSubmit(values: ServiceInput) {
    startTransition(async () => {
      const result = await upsertService(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(initial?.id ? 'Serviço atualizado.' : 'Serviço cadastrado.');
      if (redirectTo) router.push(redirectTo);
      else if (!initial?.id) router.push(`/servicos/${result.data.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">
      {initial?.id ? <input type="hidden" {...form.register('id')} /> : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="svc-name">Nome *</Label>
        <Input id="svc-name" disabled={isPending} {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="svc-type">Tipo</Label>
          <select
            id="svc-type"
            disabled={isPending}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('type')}
          >
            <option value="service">Serviço</option>
            <option value="product">Produto</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="svc-category">Categoria</Label>
          <select
            id="svc-category"
            disabled={isPending}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('categoryId')}
          >
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="svc-price">Preço (R$) *</Label>
          <Input
            id="svc-price"
            type="number"
            min={0}
            step="0.01"
            disabled={isPending}
            {...form.register('price', { valueAsNumber: true })}
          />
          {form.formState.errors.price ? (
            <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="svc-cost">Custo unitário (R$)</Label>
          <Input
            id="svc-cost"
            type="number"
            min={0}
            step="0.01"
            disabled={isPending}
            {...form.register('unitCost', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="svc-commission">Comissão padrão (%)</Label>
          <Input
            id="svc-commission"
            type="number"
            min={0}
            max={100}
            step={1}
            placeholder="0"
            disabled={isPending}
            {...form.register('commissionPercent', {
              setValueAs: (v: string | number) =>
                v === '' || v === null || v === undefined ? undefined : Number(v),
            })}
          />
        </div>
        {watchType === 'service' ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-duration">Duração (min)</Label>
            <Input
              id="svc-duration"
              type="number"
              min={1}
              step={5}
              disabled={isPending}
              {...form.register('durationMinutes', {
                setValueAs: (v: string | number) =>
                  v === '' || v === null || v === undefined ? undefined : Number(v),
              })}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="svc-desc">Descrição</Label>
        <textarea
          id="svc-desc"
          rows={3}
          disabled={isPending}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...form.register('description')}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="svc-active"
          type="checkbox"
          disabled={isPending}
          {...form.register('active')}
        />
        <Label htmlFor="svc-active" className="text-sm">
          Ativo (aparece na agenda)
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => router.push('/servicos')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
