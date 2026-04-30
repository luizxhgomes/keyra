'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { signInWithOtpAction } from './actions';

const formSchema = z.object({
  email: z.string().trim().email({ message: 'Digite um e-mail válido' }),
});
type FormValues = z.infer<typeof formSchema>;

type LoginFormProps = {
  /** Caminho relativo (ex.: `/invites/abc`) para o qual o usuário deve voltar
   * após autenticar via magic link. Já validado pelo Server Component pai
   * com `getSafeNext()`. */
  next: string | null;
};

/**
 * Client-side login form — magic link flow.
 *
 * States (mutually exclusive):
 *   1. idle        → show email input + submit button
 *   2. submitting  → disable inputs, show spinner in button
 *   3. sent        → replace form with success message + "usar outro e-mail"
 *
 * Error state is surfaced via `sonner` toast AND inline (aria-live) so it's
 * both noisy-enough and a11y-compliant.
 */
export function LoginForm({ next }: LoginFormProps) {
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await signInWithOtpAction({ ...values, next: next ?? undefined });
      if (result.success) {
        setEmailSent(values.email);
        toast.success('Link enviado!', {
          description: 'Verifique sua caixa de entrada (e o spam).',
        });
      } else {
        toast.error('Não foi possível enviar', { description: result.error });
      }
    });
  }

  if (emailSent) {
    return (
      <div
        className="flex flex-col items-center gap-4 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-10 w-10 text-secondary-500" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Confira seu e-mail</h2>
          <p className="text-sm text-muted-foreground">
            Enviamos um link mágico para{' '}
            <span className="font-medium text-foreground">{emailSent}</span>. Abra-o no
            mesmo dispositivo para entrar.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setEmailSent(null);
            reset({ email: '' });
          }}
        >
          Usar outro e-mail
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="voce@clinica.com.br"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          disabled={pending}
          {...register('email')}
        />
        {errors.email ? (
          <p id="email-error" className="text-xs text-destructive" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Enviando...
          </>
        ) : (
          'Enviar link mágico'
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Sem senha. Você recebe um link único no e-mail e entra com um clique.
      </p>
    </form>
  );
}
