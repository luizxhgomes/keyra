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
  'w-full rounded-xl border-0 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/10 transition-all duration-200 focus:bg-white/[0.13] focus:ring-2 focus:ring-white/30';

/**
 * Tela de cadastro dark glassmorphism estilo HextaUI, adaptada à identidade
 * KEYRA. Mesmo motor visual de SignInGlassCard, com 8 campos do form.
 *
 * Story auth.3 visual revamp (Fase B do EPIC-AUTH-V2 incrementada 2026-05-04).
 */
export function SignUpGlassCard() {
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

  const cardWrapper =
    'relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#121212] px-4 py-12';

  if (emailSent) {
    return (
      <div className={cardWrapper}>
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(189,125,77,0.15), transparent 50%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 text-center shadow-2xl ring-1 ring-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-white">Confira seu e-mail</h2>
          <p className="mt-3 text-sm text-white/70">
            Enviamos um link de confirmação para <strong>{emailSent}</strong>. Após confirmar, você
            poderá fazer login com sua senha.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition-all duration-200 hover:bg-white/[0.18] hover:shadow-lg"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cardWrapper}>
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(189,125,77,0.15), transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 shadow-lg ring-1 ring-white/20 transition-transform duration-300 ease-out hover:scale-110">
          <span className="text-xl font-bold tracking-tight text-white">K</span>
        </div>

        <h2 className="mb-1 text-center text-2xl font-semibold tracking-tight text-white">
          KEYRA
        </h2>
        <p className="mb-6 text-center text-xs text-white/60">Criar sua conta</p>

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
              <p className="mt-1 text-xs text-red-400" role="alert">
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
              <p className="mt-1 text-xs text-red-400" role="alert">
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
              <p className="mt-1 text-xs text-red-400" role="alert">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-all duration-150 hover:scale-110 hover:text-white/90"
                aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <hr className="my-1 border-white/10" />

          <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
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
              <p className="mt-1 text-xs text-red-400" role="alert">
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

          <hr className="my-1 border-white/10" />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition-all duration-200 hover:bg-white/[0.07]">
            <input
              type="checkbox"
              {...register('acceptedTerms' as never)}
              onChange={(e) => setValue('acceptedTerms', e.target.checked as never)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/10 text-white accent-white"
            />
            <span className="text-xs leading-snug text-white/70">
              Li e aceito os{' '}
              <Link
                href="/termos"
                target="_blank"
                className="text-white underline underline-offset-2 transition-colors duration-150 hover:text-white/80"
              >
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link
                href="/privacidade"
                target="_blank"
                className="text-white underline underline-offset-2 transition-colors duration-150 hover:text-white/80"
              >
                Política de Privacidade
              </Link>{' '}
              da KEYRA.
            </span>
          </label>
          {errors.acceptedTerms && (
            <p className="text-xs text-red-400" role="alert">
              {(errors.acceptedTerms as { message?: string }).message}
            </p>
          )}

          <TurnstileWidget onToken={setTurnstileToken} />

          <button
            type="submit"
            disabled={pending}
            className="mt-1 w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition-all duration-200 hover:bg-white/[0.18] hover:shadow-lg disabled:opacity-50 disabled:hover:bg-white/10"
          >
            {pending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
              </span>
            ) : (
              'Criar minha conta'
            )}
          </button>

          <p className="mt-2 text-center text-xs text-white/50">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="text-white/85 underline underline-offset-2 transition-colors duration-150 hover:text-white"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
