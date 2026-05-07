'use client';

import { cn } from '@/lib/utils';

type Strength = 'fraca' | 'regular' | 'boa' | 'forte';

const STRENGTH_CONFIG: Record<
  Strength,
  { label: string; bars: number; barColor: string; textColor: string }
> = {
  fraca: {
    label: 'Fraca',
    bars: 1,
    barColor: 'bg-red-500',
    textColor: 'text-red-600',
  },
  regular: {
    label: 'Regular',
    bars: 2,
    barColor: 'bg-amber-500',
    textColor: 'text-amber-700',
  },
  boa: {
    label: 'Boa',
    bars: 3,
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
  },
  forte: {
    label: 'Forte',
    bars: 4,
    barColor: 'bg-emerald-600',
    textColor: 'text-emerald-900',
  },
};

/**
 * Avalia força da senha — heurística simples alinhada com regras Supabase
 * de prod (auth.0): ≥10 chars + lower + upper + digit. Bonus pra ≥12 chars.
 *
 * Sem dependência externa (zxcvbn ~400KB é overhead pra MVP). Cobre 80% do
 * valor — pós-MVP avaliar se telemetria mostra users criando senhas fracas.
 */
export function evaluatePasswordStrength(password: string): Strength {
  if (!password) return 'fraca';

  const criteria = [
    password.length >= 10,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
  ];
  const score = criteria.filter(Boolean).length;

  if (score === 4 && password.length >= 12) return 'forte';
  if (score === 4) return 'boa';
  if (score === 3) return 'boa';
  if (score === 2) return 'regular';
  return 'fraca';
}

/**
 * PasswordStrengthMeter — Story auth.9.
 *
 * Indicador visual de força da senha em 4 níveis (Fraca/Regular/Boa/Forte).
 * Reutilizado em SignUpCard (cadastro) e NewPasswordCard (redefinir senha).
 *
 * Atualiza em tempo real (responde a cada keystroke). Oculto se senha vazia.
 * Acessível via aria-live="polite" para screen readers.
 *
 * Critérios alinhados com regras Supabase de prod (auth.0):
 *   - ≥10 chars
 *   - letra minúscula
 *   - letra maiúscula
 *   - número
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password || password.length === 0) {
    return null;
  }

  const strength = evaluatePasswordStrength(password);
  const config = STRENGTH_CONFIG[strength];

  return (
    <div
      className="mt-2 flex items-center gap-3"
      role="status"
      aria-live="polite"
      aria-label={`Força da senha: ${config.label}`}
    >
      <div className="flex flex-1 items-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              i < config.bars ? config.barColor : 'bg-muted',
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className={cn('w-14 text-right text-xs font-semibold', config.textColor)}>
        {config.label}
      </span>
    </div>
  );
}
