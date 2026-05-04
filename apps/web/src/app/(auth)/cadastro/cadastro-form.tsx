'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { signUpAction } from './actions';
import { TurnstileWidget } from '@/components/auth/TurnstileWidget';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export function CadastroForm() {
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

  if (emailSent) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Confira seu e-mail</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong>{emailSent}</strong>. Após confirmar, você
            poderá fazer login com sua senha.
          </p>
          <Button onClick={() => router.push('/login')} className="mt-6 w-full">
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="fullName">Seu nome</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Camila Souza"
          {...register('fullName')}
          aria-invalid={Boolean(errors.fullName)}
        />
        {errors.fullName && (
          <p role="alert" className="text-xs text-destructive">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="phone">Celular</Label>
        <Input
          id="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 99999-9999"
          value={phoneMasked}
          onChange={(e) => {
            const masked = maskPhone(e.target.value);
            setPhoneMasked(masked);
            setValue('phone', masked, { shouldValidate: true });
          }}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone && (
          <p role="alert" className="text-xs text-destructive">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@clinica.com.br"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && (
          <p role="alert" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mín. 10 chars, com Aa1"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p role="alert" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword">Confirme a senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirmPassword')}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p role="alert" className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="border-t border-border pt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Sua clínica
        </p>

        <div className="grid gap-1.5">
          <Label htmlFor="clinicName">Nome da clínica</Label>
          <Input
            id="clinicName"
            placeholder="Ex.: Espaço Camila Estética"
            {...register('clinicName')}
            aria-invalid={Boolean(errors.clinicName)}
          />
          {errors.clinicName && (
            <p role="alert" className="text-xs text-destructive">
              {errors.clinicName.message}
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-1.5">
          <Label htmlFor="cnpj">CNPJ (opcional, MEI fica em branco)</Label>
          <Input
            id="cnpj"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            value={cnpjMasked}
            onChange={(e) => {
              const masked = maskCnpj(e.target.value);
              setCnpjMasked(masked);
              setValue('cnpj', masked, { shouldValidate: true });
            }}
          />
          {errors.cnpj && (
            <p role="alert" className="text-xs text-destructive">
              {errors.cnpj.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3">
        <Checkbox
          id="acceptedTerms"
          {...register('acceptedTerms' as never)}
          onCheckedChange={(checked) => setValue('acceptedTerms', checked as never)}
        />
        <Label htmlFor="acceptedTerms" className="text-sm leading-snug">
          Li e aceito os{' '}
          <Link href="/termos" target="_blank" className="text-primary underline">
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link href="/privacidade" target="_blank" className="text-primary underline">
            Política de Privacidade
          </Link>{' '}
          da KEYRA.
        </Label>
      </div>
      {errors.acceptedTerms && (
        <p role="alert" className="text-xs text-destructive">
          {errors.acceptedTerms.message as string}
        </p>
      )}

      <TurnstileWidget onToken={setTurnstileToken} />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...
          </>
        ) : (
          'Criar minha conta'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
