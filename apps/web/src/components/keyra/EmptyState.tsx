import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { EmptyStateAction } from './EmptyStateAction';

/**
 * `<EmptyState>` — placeholder para listas/seções vazias (Story 5.3 + HOTFIX 2026-05-02).
 *
 * Padrão consistente: ícone outline + título + descrição em pt-BR + CTA real
 * (não "use o botão acima"). Persona-iniciante (mês 1 de uso) cai em todas
 * as listas vazias e precisa saber o próximo passo.
 *
 * **HOTFIX 2026-05-02 (digest 3213099672):** componente migrado de Client
 * para Server. Versão anterior tinha `'use client'` + `<m.div>` (framer-motion)
 * e recebia `icon: LucideIcon` como prop. Em React 19 + Next 16 RSC, passar
 * um componente `forwardRef` (Lucide icons são forwardRef) de Server → Client
 * via prop é proibido — joga `Error: Functions cannot be passed directly to
 * Client Components`. Esse erro afetava TODAS as rotas autenticadas que
 * renderizavam EmptyState (org nova com listas vazias = todas exceto Agenda).
 *
 * Fix: EmptyState agora renderiza o ícone direto no server (Lucide é
 * Server-safe quando usado, não passado como prop). `action.onClick` (Client
 * handler) move para `<EmptyStateAction>` (Client Component dedicado).
 *
 * Spec UX: docs/ux/PLANO-SPRINT-5-6.md §Story 5.3.
 */
export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Texto secundário sob o CTA (link adicional, dica). */
  hint?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  hint,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-1 rounded-full bg-muted p-3">
          <Icon
            className="h-6 w-6 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      ) : null}
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? (
        action.href ? (
          <Link href={action.href}>
            <Button size="sm" className="mt-2">
              {action.label}
            </Button>
          </Link>
        ) : action.onClick ? (
          <EmptyStateAction label={action.label} onClick={action.onClick} />
        ) : null
      ) : null}
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
