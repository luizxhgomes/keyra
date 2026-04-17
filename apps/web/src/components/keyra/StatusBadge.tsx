import {
  Ban,
  CheckCircle2,
  Circle,
  Clock,
  Edit3,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * `<StatusBadge>` — badge universal para appointments + commands + transactions.
 *
 * Spec: docs/ux/wireframes/06-componentes-criticos.md §7.
 *
 * Crítico (CON-UX-01 + WCAG): ícone + texto, status nunca só por cor.
 */
export type AppointmentStatus = 'agendado' | 'realizado' | 'cancelado' | 'falta';
export type CommandStatus = 'aberta' | 'finalizada' | 'paga';
export type StatusKind = AppointmentStatus | CommandStatus;

const STATUS: Record<
  StatusKind,
  { label: string; icon: LucideIcon; className: string }
> = {
  agendado: {
    label: 'Agendado',
    icon: Clock,
    className: 'bg-primary-100 text-primary-700 border-transparent',
  },
  realizado: {
    label: 'Realizado',
    icon: CheckCircle2,
    className: 'bg-secondary-100 text-secondary-700 border-transparent',
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-transparent',
  },
  falta: {
    label: 'Falta',
    icon: Ban,
    className: 'bg-red-100 text-red-700 border-transparent',
  },
  aberta: {
    label: 'Aberta',
    icon: Edit3,
    className: 'bg-muted text-muted-foreground border-transparent',
  },
  finalizada: {
    label: 'Finalizada',
    icon: Circle,
    className: 'bg-amber-100 text-amber-700 border-transparent',
  },
  paga: {
    label: 'Paga',
    icon: CheckCircle2,
    className: 'bg-secondary-100 text-secondary-700 border-transparent',
  },
};

export interface StatusBadgeProps {
  status: StatusKind;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const cfg = STATUS[status];
  const Icon = cfg.icon;

  return (
    <Badge
      className={cn(
        cfg.className,
        size === 'sm' && 'px-2 py-0 text-[10px]',
        className,
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden="true" />}
      <span>{cfg.label}</span>
    </Badge>
  );
}
