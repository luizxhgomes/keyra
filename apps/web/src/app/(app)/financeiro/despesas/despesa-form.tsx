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
import { expenseSchema, type ExpenseInput } from '@/lib/validators/expense';

import { upsertExpense } from '../actions';

type Props = {
  initial?: Partial<ExpenseInput>;
  submitLabel: string;
  redirectTo?: string;
  categories: Array<{ id: string; name: string; kind: string }>;
  accounts: Array<{ id: string; name: string }>;
};

export function DespesaForm({
  initial,
  submitLabel,
  redirectTo,
  categories,
  accounts,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      ...(initial?.id ? { id: initial.id } : {}),
      grossAmount: initial?.grossAmount ?? 0,
      expenseCategoryId: initial?.expenseCategoryId ?? '',
      description: initial?.description ?? '',
      referenceDate: initial?.referenceDate ?? today,
      accountId: initial?.accountId ?? '',
      supplierName: initial?.supplierName ?? '',
      notes: initial?.notes ?? '',
      isFixed: initial?.isFixed ?? false,
    },
  });

  function onSubmit(values: ExpenseInput) {
    startTransition(async () => {
      const result = await upsertExpense(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Story brand.4 — toast cúmplice: ação + consequência financeira
      toast.success(
        initial?.id
          ? 'Despesa atualizada. O DRE deste mês foi recalculado.'
          : 'Despesa lançada. Já entrou no fluxo de caixa.',
      );
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {initial?.id ? <input type="hidden" {...form.register('id')} /> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exp-amount">Valor (R$) *</Label>
          <Input
            id="exp-amount"
            type="number"
            step="0.01"
            min="0"
            disabled={isPending}
            {...form.register('grossAmount')}
          />
          {form.formState.errors.grossAmount ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.grossAmount.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exp-date">Data *</Label>
          <Input
            id="exp-date"
            type="date"
            disabled={isPending}
            {...form.register('referenceDate')}
          />
          {form.formState.errors.referenceDate ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.referenceDate.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exp-cat">Categoria *</Label>
        <select
          id="exp-cat"
          disabled={isPending}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...form.register('expenseCategoryId')}
        >
          <option value="">Selecione…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.kind === 'fixed_cost' ? ' · fixo' : ''}
            </option>
          ))}
        </select>
        {form.formState.errors.expenseCategoryId ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.expenseCategoryId.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exp-account">Conta de saída *</Label>
        <select
          id="exp-account"
          disabled={isPending}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...form.register('accountId')}
        >
          <option value="">Selecione…</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {form.formState.errors.accountId ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.accountId.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exp-desc">Descrição *</Label>
        <Input id="exp-desc" disabled={isPending} {...form.register('description')} />
        {form.formState.errors.description ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exp-supplier">Fornecedor (opcional)</Label>
        <Input id="exp-supplier" disabled={isPending} {...form.register('supplierName')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exp-notes">Notas (opcional)</Label>
        <Textarea
          id="exp-notes"
          rows={3}
          disabled={isPending}
          {...form.register('notes')}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          disabled={isPending}
          className="h-4 w-4 rounded border-input"
          {...form.register('isFixed')}
        />
        <span>Custo fixo (recorrente mensal)</span>
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando…' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/financeiro/despesas')}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
