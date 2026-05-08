'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { KeyraLogo } from '@/components/brand/KeyraLogo';
import { z } from 'zod';

import { JourneyProgress } from '@/components/auth/JourneyProgress';
import { TurnstileWidget } from '@/components/auth/TurnstileWidget';
import { subscribeKeyraAuthEvents } from '@/lib/auth/broadcast';
import { requestPasswordResetAction } from '@/app/(auth)/esqueci-senha/actions';

const formSchema = z.object({
  email: z.string().trim().email({ message: 'E-mail inválido' }),
});
type FormValues = z.infer<typeof formSchema>;

/**
 * Tela de "Esqueci minha senha" — Story auth.5 do EPIC-AUTH-V2.
 *
 * Estrutura visual idêntica ao SignInCard / SignUpCard (cores light KEYRA:
 * cream/bege + primary marrom + cards brancos, animações idênticas).
 *
 * Após submit válido, exibe SEMPRE a mesma mensagem genérica — independente
 * de o email existir, estar em cooldown, ou não existir. Anti-enumeration
 * é responsabilidade conjunta UI + Server Action (requestPasswordResetAction).
 */
export function RequestResetCard() {
  const [pending, startTransition] = useTransition();
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [completedElsewhere, setCompletedElsewhere] = useState(false);

  // Story auth.8 — escuta outras abas (NewPasswordCard) sinalizando que o
  // reset foi concluído. Cleanup no return previne handlers stale em
  // hot-reload. Em SSR/browsers antigos, subscribe é no-op.
  useEffect(() => {
    const unsubscribe = subscribeKeyraAuthEvents((event) => {
      if (event.type === 'password_reset_completed') {
        setCompletedElsewhere(true);
      }
    });
    return unsubscribe;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(values: FormValues) {
    if (!turnstileToken) {
      toast.error('Aguarde a verificação de segurança carregar');
      return;
    }
    startTransition(async () => {
      const result = await requestPasswordResetAction({
        email: values.email,
        turnstileToken,
      });
      if (result.success) {
        setSubmitted(true);
      } else {
        toast.error('Não foi possível enviar', { description: result.error });
      }
    });
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% 0%, hsl(21 56% 50% / 0.08), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-border bg-card p-8 shadow-warm-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm-lg transition-transform duration-300 ease-out hover:scale-110">
          <span className="text-xl font-bold tracking-tight">K</span>
        </div>

        <KeyraLogo variant="primary" theme="light" height={32} className="mb-1" />
        <p className="mb-6 text-center text-xs text-muted-foreground">Recuperação de senha</p>

        {completedElsewhere ? (
          <div className="flex w-full flex-col items-center text-center">
            <JourneyProgress step={4} />
            <p className="mb-2 text-sm font-semibold text-foreground">
              Senha redefinida em outra aba
            </p>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Você acabou de definir sua nova senha em outra janela. Pode fechar esta tela e
              fazer login com a nova senha.
            </p>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-warm-md transition-all duration-200 hover:bg-primary-600 hover:shadow-warm-md"
            >
              Ir para o login
            </Link>
          </div>
        ) : submitted ? (
          <div className="flex w-full flex-col items-center text-center">
            <JourneyProgress step={2} />
            <p className="mb-2 text-sm font-semibold text-foreground">Pedido recebido</p>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Se este e-mail estiver cadastrado, enviamos um link de redefinição. Verifique sua
              caixa de entrada e a pasta de spam.
            </p>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-warm-md transition-all duration-200 hover:bg-primary-600 hover:shadow-warm-md"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3" noValidate>
            <JourneyProgress step={1} />
            <p className="mb-2 text-center text-sm leading-relaxed text-muted-foreground">
              Digite seu e-mail e enviaremos um link para você escolher uma senha nova.
            </p>

            <div>
              <input
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="E-mail"
                className="w-full rounded-xl border border-input bg-muted/40 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-ring"
                {...register('email')}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <TurnstileWidget onToken={setTurnstileToken} />

            <hr className="my-1 border-border" />

            <button
              type="submit"
              disabled={pending || !turnstileToken}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-warm-md transition-all duration-200 hover:bg-primary-600 hover:shadow-warm-md disabled:opacity-50 disabled:hover:bg-primary"
            >
              {pending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                </span>
              ) : (
                'Enviar link de redefinição'
              )}
            </button>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Lembrou da senha?{' '}
              <Link
                href="/login"
                className="font-semibold text-foreground transition-colors duration-150 hover:text-primary"
              >
                Voltar ao login
              </Link>
            </p>
          </form>
        )}
      </div>

      <p className="relative z-10 mt-6 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors duration-150 hover:text-foreground">
          ← Voltar para a página inicial
        </Link>
      </p>
    </div>
  );
}
