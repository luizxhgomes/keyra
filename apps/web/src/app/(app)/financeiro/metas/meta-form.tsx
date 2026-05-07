'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { goalSchema, type GoalInput } from '@/lib/validators/goal';

import { upsertGoal } from '../actions';

type Props = {
  initial?: Partial<GoalInput>;
};

export function MetaForm({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

  const form = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      periodMonth: initial?.periodMonth ?? defaultMonth,
      targetRevenue: initial?.targetRevenue,
      targetProfit: initial?.targetProfit,
      targetAppointments: initial?.targetAppointments,
      notes: initial?.notes ?? '',
    },
  });

  function onSubmit(values: GoalInput) {
    startTransition(async () => {
      const result = await upsertGoal(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Story brand.4 — toast cúmplice: meta confirmada + onde aparece
      toast.success('Meta salva. O dashboard mostra quanto falta a cada dia.');
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="meta-month">Mês de referência *</Label>
        <Input
          id="meta-month"
          type="date"
          disabled={isPending}
          {...form.register('periodMonth')}
        />
        <p className="text-xs text-muted-foreground">
          Use o primeiro dia do mês (YYYY-MM-01).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meta-rev">Meta de receita (R$)</Label>
          <Input
            id="meta-rev"
            type="number"
            step="0.01"
            min="0"
            placeholder="Opcional"
            disabled={isPending}
            {...form.register('targetRevenue')}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meta-pro">Meta de lucro (R$)</Label>
          <Input
            id="meta-pro"
            type="number"
            step="0.01"
            min="0"
            placeholder="Opcional"
            disabled={isPending}
            {...form.register('targetProfit')}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meta-app">Meta de atendimentos</Label>
          <Input
            id="meta-app"
            type="number"
            min="0"
            placeholder="Opcional"
            disabled={isPending}
            {...form.register('targetAppointments')}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="meta-notes">Notas (opcional)</Label>
        <Textarea
          id="meta-notes"
          rows={2}
          disabled={isPending}
          {...form.register('notes')}
        />
      </div>

      {form.formState.errors.root ? (
        <p className="text-xs text-destructive">{form.formState.errors.root.message}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando…' : 'Salvar meta'}
      </Button>
    </form>
  );
}
