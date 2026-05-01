import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * `<ErrorMessage>` — Story 5.6: humaniza mensagens de erro de Server Actions.
 *
 * Substitui o padrão "Erro: {result.error}" cru. Toma o `error.message` técnico
 * (que vem do Postgres ou de validação Zod) e enquadra em copy de mentora
 * confiável: "Não conseguimos carregar agora" + detalhe técnico em texto menor.
 */
export interface ErrorMessageProps {
  /** Mensagem técnica vinda da Server Action (`result.error`). */
  detail: string;
  /** Copy humana principal — default: "Não conseguimos carregar agora." */
  title?: string;
  className?: string;
}

export function ErrorMessage({
  detail,
  title = 'Não conseguimos carregar agora.',
  className,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-card-y',
        className,
      )}
    >
      <AlertCircle
        className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="text-xs text-muted-foreground">
          Tente abrir essa tela de novo em alguns segundos. Se persistir,{' '}
          <span className="font-mono text-[11px]">{detail}</span>.
        </p>
      </div>
    </div>
  );
}
