import { Check, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4;

const LABELS: Record<Step, string> = {
  1: 'Solicitar',
  2: 'Verificar',
  3: 'Definir',
  4: 'Entrar',
};

/**
 * JourneyProgress — Story auth.9.
 *
 * Indicador visual da jornada de auth (recuperação de senha) em 4 passos.
 * Server-safe (sem hooks ou estado interno) — pode ser usado em RSC e em
 * Client Components.
 *
 * Fases:
 *   1. Solicitar — user pediu reset (RequestResetCard form)
 *   2. Verificar — user submeteu, aguarda email (RequestResetCard submitted)
 *   3. Definir   — user clicou no email, está em /redefinir-senha
 *   4. Entrar    — senha redefinida, agora loga (sucesso ou completedElsewhere)
 *
 * Estilo: 4 traços horizontais coloridos progressivamente (▰▰▱▱) + label
 * pequeno abaixo. Mobile-first. Acessível via aria-label por item.
 */
export function JourneyProgress({
  step,
  total = 4,
}: {
  step: Step;
  total?: number;
}) {
  const steps: Step[] = [1, 2, 3, 4];

  return (
    <div className="mb-6 w-full" role="list" aria-label={`Passo ${step} de ${total}`}>
      <div className="flex items-center justify-center gap-1.5">
        {steps.map((s) => {
          const isComplete = s < step;
          const isCurrent = s === step;
          return (
            <div
              key={s}
              role="listitem"
              aria-label={`Passo ${s}: ${LABELS[s]}, ${
                isComplete ? 'concluído' : isCurrent ? 'atual' : 'pendente'
              }`}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                isComplete && 'bg-primary',
                isCurrent && 'bg-primary/70',
                !isComplete && !isCurrent && 'bg-muted',
              )}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {steps.map((s) => {
          const isComplete = s < step;
          const isCurrent = s === step;
          return (
            <div
              key={s}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 text-[10px] font-medium leading-tight transition-colors duration-300',
                isComplete && 'text-primary',
                isCurrent && 'text-foreground',
                !isComplete && !isCurrent && 'text-muted-foreground/60',
              )}
            >
              {isComplete && <Check className="h-3 w-3" aria-hidden="true" />}
              {isCurrent && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
              <span className="truncate">{LABELS[s]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
