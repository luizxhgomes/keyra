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
};

/**
 * Tela de login dark glassmorphism estilo HextaUI, adaptada à identidade KEYRA.
 *
 * Story auth.4 visual revamp (parte da Fase B do EPIC-AUTH-V2 incrementada
 * em 2026-05-04). Lógica reusa `signInWithPasswordAction` — só trocamos o
 * "casco visual" (sem magic link, mantém Turnstile, mantém validações Zod).
 *
 * Animações:
 * - Logo: hover scale 110%, transition 300ms ease-out
 * - Botões: hover bg lighter + shadow elevation, transition 200ms
 * - Eye toggle: hover scale 110%, transition 150ms
 * - Card: subtle entrance fade-in via Tailwind animate-in
 */
export function SignInGlassCard({ next }: Props) {
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#121212] px-4 py-12">
      {/* Subtle radial gradient pra dar profundidade */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(189,125,77,0.15), transparent 50%)',
        }}
        aria-hidden="true"
      />

      {/* Glass card */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
        {/* Logo K em círculo glass */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 shadow-lg ring-1 ring-white/20 transition-transform duration-300 ease-out hover:scale-110">
          <span className="text-xl font-bold tracking-tight text-white">K</span>
        </div>

        <h2 className="mb-1 text-center text-2xl font-semibold tracking-tight text-white">KEYRA</h2>
        <p className="mb-6 text-center text-xs text-white/60">
          Entre no seu financeiro operacional
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3" noValidate>
          <div>
            <input
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="E-mail"
              className="w-full rounded-xl border-0 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/10 transition-all duration-200 focus:bg-white/[0.13] focus:ring-2 focus:ring-white/30"
              {...register('email')}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400" role="alert">
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
                className="w-full rounded-xl border-0 bg-white/10 px-5 py-3 pr-12 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/10 transition-all duration-200 focus:bg-white/[0.13] focus:ring-2 focus:ring-white/30"
                {...register('password')}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-all duration-150 hover:scale-110 hover:text-white/90"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="-mt-1 flex justify-end">
            <Link
              href="/esqueci-senha"
              className="text-xs text-white/50 transition-colors duration-150 hover:text-white/90"
            >
              Esqueci minha senha
            </Link>
          </div>

          <TurnstileWidget onToken={setTurnstileToken} />

          <hr className="my-1 border-white/10" />

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition-all duration-200 hover:bg-white/[0.18] hover:shadow-lg disabled:opacity-50 disabled:hover:bg-white/10"
          >
            {pending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>

          {/* Google OAuth — desabilitado até auth.6 sair */}
          <button
            type="button"
            disabled
            title="Login com Google estará disponível em breve"
            className="mb-1 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#232526] to-[#2d2e30] px-5 py-3 text-sm font-medium text-white/70 shadow ring-1 ring-white/10 transition-all duration-200 hover:brightness-110"
          >
            <GoogleIcon className="h-5 w-5" />
            Continuar com Google
            <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
              em breve
            </span>
          </button>

          <p className="mt-2 text-center text-xs text-white/50">
            Ainda não tem conta?{' '}
            <Link
              href="/cadastro"
              className="text-white/85 underline underline-offset-2 transition-colors duration-150 hover:text-white"
            >
              Crie sua conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

/**
 * Google G logo inline SVG — evita dep de imagem externa e mantém ícone
 * coloreado mesmo no tema dark.
 */
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
