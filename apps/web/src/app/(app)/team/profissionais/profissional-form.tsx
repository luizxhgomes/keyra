'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { upsertProfessional } from '../actions';

const formSchema = z.object({
  displayName: z.string().min(1, 'Nome é obrigatório').max(120),
  email: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .refine((v) => v === undefined || /^\S+@\S+\.\S+$/.test(v), 'Email inválido'),
  specialty: z.string().max(120).optional(),
  color: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .refine((v) => v === undefined || /^#[0-9a-fA-F]{6}$/.test(v), 'Cor hex #RRGGBB'),
  defaultCommissionPercent: z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : Number(v)))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0 && v <= 100), 'Entre 0 e 100'),
  costCenter: z.string().max(80).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfissionalForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      specialty: '',
      color: '',
      defaultCommissionPercent: undefined,
      costCenter: '',
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await upsertProfessional({
        displayName: values.displayName,
        ...(values.email ? { email: values.email } : {}),
        ...(values.specialty ? { specialty: values.specialty } : {}),
        ...(values.color ? { color: values.color } : {}),
        ...(values.defaultCommissionPercent !== undefined
          ? { defaultCommissionPercent: values.defaultCommissionPercent }
          : {}),
        ...(values.costCenter ? { costCenter: values.costCenter } : {}),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Profissional cadastrado.');
      form.reset({
        displayName: '',
        email: '',
        specialty: '',
        color: '',
        defaultCommissionPercent: undefined,
        costCenter: '',
      });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prof-name">Nome *</Label>
        <Input id="prof-name" disabled={isPending} {...form.register('displayName')} />
        {form.formState.errors.displayName ? (
          <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prof-email">Email (opcional)</Label>
        <Input id="prof-email" type="email" disabled={isPending} {...form.register('email')} />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prof-specialty">Especialidade</Label>
        <Input
          id="prof-specialty"
          placeholder="Ex.: Podologia"
          disabled={isPending}
          {...form.register('specialty')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prof-color">Cor na agenda</Label>
          <Input
            id="prof-color"
            type="color"
            disabled={isPending}
            {...form.register('color')}
          />
          {form.formState.errors.color ? (
            <p className="text-xs text-destructive">{form.formState.errors.color.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prof-commission">Comissão padrão (%)</Label>
          <Input
            id="prof-commission"
            type="number"
            min={0}
            max={100}
            step={1}
            placeholder="0"
            disabled={isPending}
            {...form.register('defaultCommissionPercent')}
          />
          {form.formState.errors.defaultCommissionPercent ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.defaultCommissionPercent.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prof-cc">Centro de custo</Label>
        <Input
          id="prof-cc"
          placeholder="Ex.: Estética Facial, Corporal"
          disabled={isPending}
          {...form.register('costCenter')}
        />
        <p className="text-xs text-muted-foreground">
          Usado para agrupar receitas no relatório do financeiro.
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Cadastrar profissional'}
      </Button>
    </form>
  );
}
