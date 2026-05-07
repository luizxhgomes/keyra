'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createInvite } from '../actions';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'professional', 'viewer']),
});

type FormValues = z.infer<typeof formSchema>;

const ROLE_OPTIONS: Array<{ value: FormValues['role']; label: string; description: string }> = [
  { value: 'admin', label: 'Administrador', description: 'Gerencia time, catálogo e finanças' },
  { value: 'professional', label: 'Profissional', description: 'Acessa agenda e seus atendimentos' },
  { value: 'viewer', label: 'Espectador', description: 'Somente leitura em relatórios' },
];

export function ConviteForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', role: 'professional' },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createInvite(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Convite enviado para ${values.email}. Aguarde a aceitação.`);
      form.reset({ email: '', role: 'professional' });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-email">Email</Label>
        <Input
          id="invite-email"
          type="email"
          autoComplete="off"
          placeholder="pessoa@exemplo.com"
          disabled={isPending}
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Papel</Label>
        <div className="flex flex-col gap-2">
          {ROLE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3 text-sm hover:bg-muted"
            >
              <input
                type="radio"
                value={opt.value}
                className="mt-1"
                {...form.register('role')}
                disabled={isPending}
              />
              <div>
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Enviar convite'}
      </Button>
    </form>
  );
}
