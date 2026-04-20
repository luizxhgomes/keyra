'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categorySchema, type CategoryInput } from '@/lib/validators/service';

import { upsertCategory } from '../actions';

export function CategoriaForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', color: '', sortOrder: 0 },
  });

  function onSubmit(values: CategoryInput) {
    startTransition(async () => {
      const result = await upsertCategory(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Categoria cadastrada.');
      form.reset({ name: '', color: '', sortOrder: 0 });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-name">Nome *</Label>
        <Input id="cat-name" disabled={isPending} {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-color">Cor</Label>
          <Input id="cat-color" type="color" disabled={isPending} {...form.register('color')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-order">Ordem</Label>
          <Input
            id="cat-order"
            type="number"
            min={0}
            step={1}
            disabled={isPending}
            {...form.register('sortOrder', { valueAsNumber: true })}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Cadastrar categoria'}
      </Button>
    </form>
  );
}
