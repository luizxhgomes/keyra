'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { TurnstileWidget } from '@/components/auth/TurnstileWidget';
import { signUpAction } from '@/app/(auth)/cadastro/actions';

const schema = z
  .object({
    fullName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
    phone: z.string().trim().min(8, 'Telefone obrigatório'),
    email: z.string().trim().email('E-mail inválido'),
    password: z
      .string()
      .min(10, 'Mínimo 10 caracteres')
      .regex(/[a-z]/, 'Adicione minúsculas')
      .regex(/[A-Z]/, 'Adicione maiúsculas')
      .regex(/[0-9]/, 'Adicione números'),
    confirmPassword: z.string(),
    clinicName: z.string().trim().min(1, 'Obrigatório').max(120),
    cnpj: z.string().trim().optional(),
    acceptedTerms: z.literal<boolean>(true, {
      errorMap: () => ({ message: 'Aceite necessário pra continuar' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length === 0 ? '' : `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const inputClass =
  'w-full rounded-xl border border-input bg-muted/40 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-ring';

/**
 * Tela de cadastro — estrutura HextaUI com cores KEYRA (light, cream + primary
 * marrom). Mesmo motor visual de SignInCard, com 8 campos do form.
 *
 * Story auth.3 visual revamp incrementado em 2026-05-04.
 */
export function SignUpCard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [cnpjMasked, setCnpjMasked] = useState('');
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      clinicName: '',
      cnpj: '',
      acceptedTerms: false as never,
    },
  });

  function onSubmit(values: FormValues) {
    if (!turnstileToken) {
      toast.error('Verificação de segurança ainda processando — aguarde 1 segundo');
      return;
    }
    startTransition(async () => {
      const result = await signUpAction({ ...values, turnstileToken });
      if (result.success) {
        setEmailSent(values.email);
        toast.success('Conta criada!', {
          description: 'Verifique seu e-mail para confirmar.',
        });
      } else {
        toast.error('Não foi possível criar a conta', { description: result.error });
      }
    });
  }

  const wrapper =
    'relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12';
  const radial = (
    <div
      className="pointer-events-none absolute inset-0 opacity-50"
      style={{
        background: 'radial-gradient(circle at 50% 0%, hsl(21 56% 50% / 0.08), transparent 60%)',
      }}
      aria-hidden="true"
    />
  );

  if (emailSent) {
    return (
      <div className={wrapper}>
        {radial}
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-xl animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Confira seu e-mail</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong className="text-foreground">{emailSent}</strong>.
            Após confirmar, você poderá fazer login com sua senha.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition-all duration-200 hover:bg-primary-600 hover:shadow-md"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      {radial}

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-border bg-card p-8 shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 ease-out hover:scale-110">
          <span className="text-xl font-bold tracking-tight">K</span>
        </div>

        <h2 className="mb-1 text-center text-2xl font-bold tracking-tight text-primary">KEYRA</h2>
        <p className="mb-6 text-center text-xs text-muted-foreground">Criar sua conta</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3" noValidate>
          <div>
            <input
              {...register('fullName')}
              autoComplete="name"
              placeholder="Seu nome"
              className={inputClass}
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <input
              inputMode="tel"
              autoComplete="tel"
              placeholder="Celular"
              value={phoneMasked}
              onChange={(e) => {
                const masked = maskPhone(e.target.value);
                setPhoneMasked(masked);
                setValue('phone', masked, { shouldValidate: true });
              }}
              className={inputClass}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              autoComplete="email"
              placeholder="E-mail"
              {...register('email')}
              className={inputClass}
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
                autoComplete="new-password"
                placeholder="Senha (mín. 10, com Aa1)"
                {...register('password')}
                className={`${inputClass} pr-12`}
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
                placeholder="Confirme a senha"
                {...register('confirmPassword')}
                className={`${inputClass} pr-12`}
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

          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sua clínica
          </p>

          <div>
            <input
              {...register('clinicName')}
              placeholder="Nome da clínica"
              className={inputClass}
              aria-invalid={Boolean(errors.clinicName)}
            />
            {errors.clinicName && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.clinicName.message}
              </p>
            )}
          </div>

          <div>
            <input
              inputMode="numeric"
              placeholder="CNPJ (opcional, MEI fica em branco)"
              value={cnpjMasked}
              onChange={(e) => {
                const masked = maskCnpj(e.target.value);
                setCnpjMasked(masked);
                setValue('cnpj', masked, { shouldValidate: true });
              }}
              className={inputClass}
            />
          </div>

          <hr className="my-1 border-border" />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50">
            <input
              type="checkbox"
              {...register('acceptedTerms' as never)}
              onChange={(e) => setValue('acceptedTerms', e.target.checked as never)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-input bg-background accent-primary"
            />
            <span className="text-xs leading-snug text-foreground">
              Li e aceito os{' '}
              <Link
                href="/termos"
                target="_blank"
                className="font-semibold text-primary underline underline-offset-2 transition-colors duration-150 hover:text-primary-700"
              >
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link
                href="/privacidade"
                target="_blank"
                className="font-semibold text-primary underline underline-offset-2 transition-colors duration-150 hover:text-primary-700"
              >
                Política de Privacidade
              </Link>{' '}
              da KEYRA.
            </span>
          </label>
          {errors.acceptedTerms && (
            <p className="text-xs text-destructive" role="alert">
              {(errors.acceptedTerms as { message?: string }).message}
            </p>
          )}

          <TurnstileWidget onToken={setTurnstileToken} />

          <button
            type="submit"
            disabled={pending}
            className="mt-1 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition-all duration-200 hover:bg-primary-600 hover:shadow-md disabled:opacity-50 disabled:hover:bg-primary"
          >
            {pending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
              </span>
            ) : (
              'Criar minha conta'
            )}
          </button>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="font-semibold text-foreground transition-colors duration-150 hover:text-primary"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
