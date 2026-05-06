'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { postKeyraAuthEvent } from '@/lib/auth/broadcast';
import { setNewPasswordAction } from '@/app/(auth)/redefinir-senha/actions';

const formSchema = z
  .object({
    password: z
      .string()
      .min(10, 'Mínimo 10 caracteres')
      .regex(/[a-z]/, 'Inclua pelo menos uma letra minúscula')
      .regex(/[A-Z]/, 'Inclua pelo menos uma letra maiúscula')
      .regex(/\d/, 'Inclua pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof formSchema>;

/**
 * Tela de definição de nova senha — Story auth.5 do EPIC-AUTH-V2.
 *
 * Pré-requisito: usuário chegou aqui após callback handler validar
 * `?type=recovery` e estabelecer sessão temporária. Se acessar a URL direto
 * sem sessão, server component pai redireciona pra /login.
 *
 * Estilo visual idêntico ao SignInCard / SignUpCard.
 */
export function NewPasswordCard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await setNewPasswordAction(values);
      if (result.success) {
        // Story auth.8 — sinaliza para outras abas em /esqueci-senha que
        // o reset acabou de ser concluído ANTES de navegar. Fire-and-forget;
        // se BroadcastChannel não existir (browser muito antigo), no-op.
        postKeyraAuthEvent({ type: 'password_reset_completed' });
        router.push('/login?password_changed=1');
      } else {
        toast.error('Não foi possível atualizar', { description: result.error });
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
          Definir nova senha
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3" noValidate>
          <p className="mb-2 text-center text-sm leading-relaxed text-muted-foreground">
            Use no mínimo 10 caracteres com letras maiúsculas, minúsculas e números.
          </p>

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                autoFocus
                placeholder="Nova senha"
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

          <div>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirme a nova senha"
                className="w-full rounded-xl border border-input bg-muted/40 px-5 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-ring"
                {...register('confirmPassword')}
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-150 hover:scale-110 hover:text-foreground"
                aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <hr className="my-1 border-border" />

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition-all duration-200 hover:bg-primary-600 hover:shadow-md disabled:opacity-50 disabled:hover:bg-primary"
          >
            {pending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </span>
            ) : (
              'Definir nova senha'
            )}
          </button>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Mudou de ideia?{' '}
            <Link
              href="/login"
              className="font-semibold text-foreground transition-colors duration-150 hover:text-primary"
            >
              Voltar ao login
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
