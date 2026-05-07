'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { patientSchema, type PatientInput } from '@/lib/validators/patient';

import { upsertPatient } from './actions';

type Props = {
  initial?: Partial<PatientInput>;
  submitLabel: string;
  redirectTo?: string;
};

export function PacienteForm({ initial, submitLabel, redirectTo }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      ...(initial?.id ? { id: initial.id } : {}),
      fullName: initial?.fullName ?? '',
      phone: initial?.phone ?? '',
      email: initial?.email ?? '',
      birthDate: initial?.birthDate ?? '',
      notes: initial?.notes ?? '',
    },
  });

  function onSubmit(values: PatientInput) {
    startTransition(async () => {
      const result = await upsertPatient(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Story brand.4 — toast cúmplice: cadastro + próximo passo natural
      toast.success(
        initial?.id
          ? 'Paciente atualizado.'
          : 'Paciente cadastrado. Agora você pode agendar atendimentos.',
      );
      if (redirectTo) {
        router.push(redirectTo);
      } else if (!initial?.id) {
        router.push(`/pacientes/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-4">
      {initial?.id ? <input type="hidden" {...form.register('id')} /> : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pac-name">Nome *</Label>
        <Input id="pac-name" disabled={isPending} {...form.register('fullName')} />
        {form.formState.errors.fullName ? (
          <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pac-phone">Telefone</Label>
          <Input
            id="pac-phone"
            placeholder="(11) 9 9999-9999"
            disabled={isPending}
            {...form.register('phone')}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pac-birth">Data de nascimento</Label>
          <Input
            id="pac-birth"
            type="date"
            disabled={isPending}
            {...form.register('birthDate')}
          />
          {form.formState.errors.birthDate ? (
            <p className="text-xs text-destructive">{form.formState.errors.birthDate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pac-email">Email</Label>
        <Input
          id="pac-email"
          type="email"
          disabled={isPending}
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pac-notes">Notas</Label>
        <textarea
          id="pac-notes"
          rows={4}
          disabled={isPending}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Preferências, alergias relatadas, observações..."
          {...form.register('notes')}
        />
        <p className="text-xs text-muted-foreground">
          Notas de texto livre. Não registre dados clínicos aqui — MVP é financeiro.
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => router.push('/pacientes')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
