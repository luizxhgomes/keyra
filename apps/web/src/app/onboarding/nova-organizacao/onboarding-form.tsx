'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createFirstOrganizationAction } from './actions';

// Matches the server schema shape. Keep `cnpj` as string in the form (masked
// input), the Server Action strips non-digits and validates length.
const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Dê um nome à sua clínica')
    .max(120, 'Máximo 120 caracteres'),
  cnpj: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        const digits = value.replace(/\D/g, '');
        return digits.length === 14;
      },
      { message: 'CNPJ deve ter 14 dígitos (ou fique em branco)' },
    ),
});
type FormValues = z.infer<typeof formSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // CNPJ is mirrored in local state so we can render the masked display
  // without going through react-hook-form's `watch()` — React Compiler
  // (Next 16) flags `watch()` as unmemoizable and fails the lint gate.
  const [cnpjMasked, setCnpjMasked] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', cnpj: '' },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createFirstOrganizationAction({
        name: values.name,
        cnpj: values.cnpj,
      });

      if (result.success) {
        toast.success('Clínica criada!', {
          description: 'Bem-vinda ao KEYRA.',
        });
        // Hard navigation → forces middleware to re-read the refreshed
        // session cookies so the new JWT (with org_id claim) kicks in.
        router.replace('/dashboard');
        router.refresh();
      } else {
        toast.error('Não foi possível criar', { description: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="org-name">Nome da clínica</Label>
        <Input
          id="org-name"
          type="text"
          autoComplete="organization"
          autoFocus
          placeholder="Ex: Clínica Solvita"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'org-name-error' : undefined}
          disabled={pending}
          {...register('name')}
        />
        {errors.name ? (
          <p id="org-name-error" className="text-xs text-destructive" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="org-cnpj">
          CNPJ <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="org-cnpj"
          type="text"
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          aria-invalid={errors.cnpj ? 'true' : 'false'}
          aria-describedby={errors.cnpj ? 'org-cnpj-error' : 'org-cnpj-hint'}
          disabled={pending}
          value={cnpjMasked}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '').slice(0, 14);
            setCnpjMasked(maskCnpj(digits));
            setValue('cnpj', digits, { shouldValidate: false });
          }}
        />
        {errors.cnpj ? (
          <p id="org-cnpj-error" className="text-xs text-destructive" role="alert">
            {errors.cnpj.message}
          </p>
        ) : (
          <p id="org-cnpj-hint" className="text-xs text-muted-foreground">
            MEI ainda sem CNPJ? Pode deixar em branco — você completa depois.
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Criando...
          </>
        ) : (
          'Criar clínica'
        )}
      </Button>
    </form>
  );
}

/**
 * Applies a loose Brazilian CNPJ mask to the raw digits so the user sees
 * `00.000.000/0000-00` while typing. The Server Action strips the mask.
 */
function maskCnpj(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
