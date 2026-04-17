import Link from 'next/link';
import { AlertOctagon, AlertTriangle, Info, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * `<AlertCard>` — alerta acionável no dashboard (CON-UX-01 + design-principles §4).
 *
 * Spec: docs/ux/wireframes/06-componentes-criticos.md §4.
 *
 * Regra: AlertCards SEMPRE têm ação. Se não tem próximo passo, não é alerta —
 * é estatística. Não usar `severity: 'critical'` casualmente.
 */
export interface AlertCardProps {
  severity: 'warning' | 'info' | 'critical';
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  className?: string;
}

const SEVERITY: Record<
  AlertCardProps['severity'],
  { icon: LucideIcon; bg: string; border: string; iconColor: string; role: 'status' | 'alert' }
> = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-alerta',
    role: 'status',
  },
  info: {
    icon: Info,
    bg: 'bg-muted',
    border: 'border-border',
    iconColor: 'text-info',
    role: 'status',
  },
  critical: {
    icon: AlertOctagon,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-prejuizo',
    role: 'alert',
  },
};

export function AlertCard({
  severity,
  icon,
  title,
  subtitle,
  action,
  className,
}: AlertCardProps) {
  const cfg = SEVERITY[severity];
  const Icon = icon ?? cfg.icon;

  return (
    <div
      role={cfg.role}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        cfg.bg,
        cfg.border,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', cfg.iconColor)} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {action && (
          <Link
            href={action.href}
            className="mt-1 inline-flex w-fit text-sm font-medium text-primary hover:underline"
          >
            {action.label} →
          </Link>
        )}
      </div>
    </div>
  );
}
