'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { TurnstileWidget } from '@/components/auth/TurnstileWidget';
import { signInWithPasswordAction } from '@/app/(auth)/login/actions';

const formSchema = z.object({
  email: z.string().trim().email({ message: 'E-mail inválido' }),
  password: z.string().min(1, { message: 'Senha obrigatória' }),
});
type FormValues = z.infer<typeof formSchema>;

type Props = {
  next: string | null;
  passwordChanged?: boolean;
  errorCode?: string | null;
};

/**
 * Tela de login — estrutura HextaUI (card centralizado, animações hover)
 * com cores KEYRA (light, cream/bege + primary marrom). Story auth.4
 * visual revamp incrementado em 2026-05-04.
 *
 * Banners contextuais (Story auth.5):
 *   - `passwordChanged` exibe banner verde após reset bem-sucedido.
 *   - `errorCode` exibe banner vermelho com CTA pra recuperação se for um
 *     erro de fluxo de recovery (link_expired, no_recovery_session).
 */
export function SignInCard({ next, passwordChanged = false, errorCode = null }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await signInWithPasswordAction({
        ...values,
        next: next ?? undefined,
        turnstileToken: turnstileToken || undefined,
      });
      if (result.success) {
        toast.success('Bem-vinda de volta');
        router.push(next ?? '/dashboard');
        router.refresh();
      } else {
        toast.error('Não foi possível entrar', { description: result.error });
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

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-border bg-card p-8 shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 ease-out hover:scale-110">
          <span className="text-xl font-bold tracking-tight">K</span>
        </div>

        <h2 className="mb-1 text-center text-2xl font-bold tracking-tight text-primary">KEYRA</h2>
        <p className="mb-6 text-center text-xs text-muted-foreground">
          Entre no seu financeiro operacional
        </p>

        {passwordChanged && (
          <div
            className="mb-4 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900"
            role="status"
          >
            Senha redefinida com sucesso. Faça login com a nova senha.
          </div>
        )}

        {errorCode === 'link_expired' && (
          <div
            className="mb-4 w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900"
            role="alert"
          >
            Seu link de redefinição expirou.{' '}
            <Link
              href="/esqueci-senha"
              className="font-semibold underline underline-offset-2 transition-colors hover:text-amber-950"
            >
              Solicitar um novo
            </Link>
            .
          </div>
        )}

        {errorCode === 'no_recovery_session' && (
          <div
            className="mb-4 w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900"
            role="alert"
          >
            Sua sessão de recuperação expirou.{' '}
            <Link
              href="/esqueci-senha"
              className="font-semibold underline underline-offset-2 transition-colors hover:text-amber-950"
            >
              Solicitar um novo link
            </Link>
            .
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3" noValidate>
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

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Senha"
                className="w-full rounded-xl border border-input bg-muted/40 px-5 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-ring"
                {...register('password')}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-150 hover:scale-110 hover:text-foreground"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="-mt-1 flex justify-end">
            <Link
              href="/esqueci-senha"
              className="text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              Esqueci minha senha
            </Link>
          </div>

          <TurnstileWidget onToken={setTurnstileToken} />

          <hr className="my-1 border-border" />

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition-all duration-200 hover:bg-primary-600 hover:shadow-md disabled:opacity-50 disabled:hover:bg-primary"
          >
            {pending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>

          <button
            type="button"
            disabled
            title="Login com Google estará disponível em breve"
            className="mb-1 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted/60"
          >
            <GoogleIcon className="h-5 w-5" />
            Continuar com Google
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              em breve
            </span>
          </button>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{' '}
            <Link
              href="/cadastro"
              className="font-semibold text-foreground transition-colors duration-150 hover:text-primary"
            >
              Crie sua conta
            </Link>
          </p>
        </form>
      </div>

      <p className="relative z-10 mt-6 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors duration-150 hover:text-foreground">
          ← Voltar para a página inicial
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
