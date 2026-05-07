'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Info, type LucideIcon } from 'lucide-react';

import { variants } from '@/lib/motion/tokens';
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
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  /**
   * Botão secundário (Story 6.3 — ex.: "Silenciar 7 dias"). Renderizado ao
   * lado da action principal. Use para ações destrutivas/auxiliares que não
   * são o "próximo passo natural" do alerta.
   */
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

// HOTFIX 2026-05-02: prop `icon?: LucideIcon` removida (Regra 1 RSC).
// Ícone agora vem sempre do mapa SEVERITY interno. Se algum dia for
// necessário customizar, usar `iconNode?: ReactNode` (ReactElement
// pré-renderizado, serializável Server↔Client).

// Story brand.2 (Epic BRAND-INTEGRATION) — AlertCard segue padrão brandbook:
// border-left 4px na cor semântica + bg ivory-100 + ícone na cor.
// Substitui bg-amber-50/border-amber-200/bg-red-50/border-red-200 (Tailwind
// defaults frios e foras da palette KEYRA) por palette canônica warm.
// Reference: docs/brand/03-identity/preview.html §05 Componentes
const SEVERITY: Record<
  AlertCardProps['severity'],
  { icon: LucideIcon; bg: string; border: string; iconColor: string; role: 'status' | 'alert' }
> = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-ivory-100',
    border: 'border border-sand-200 border-l-4 border-l-amber-500',
    iconColor: 'text-amber-500',
    role: 'status',
  },
  info: {
    icon: Info,
    bg: 'bg-ivory-100',
    border: 'border border-sand-200 border-l-4 border-l-bronze-500',
    iconColor: 'text-bronze-500',
    role: 'status',
  },
  critical: {
    icon: AlertOctagon,
    bg: 'bg-ivory-100',
    border: 'border border-sand-200 border-l-4 border-l-rust-800',
    iconColor: 'text-rust-800',
    role: 'alert',
  },
};

export function AlertCard({
  severity,
  title,
  subtitle,
  action,
  secondaryAction,
  className,
}: AlertCardProps) {
  const cfg = SEVERITY[severity];
  const Icon = cfg.icon;

  // Story 6.2 (AC2.4 + AC2.11) — severity=critical usa `criticalEntrance`
  // (slideInDown 300ms seguido de pulseOnce 1500ms — atenção pontual sem
  // virar ruído). warning/info usam `fadeRise` base.
  const motionVariants =
    severity === 'critical' ? variants.criticalEntrance : variants.fadeRise;

  return (
    <m.div
      role={cfg.role}
      variants={motionVariants}
      initial="hidden"
      animate="visible"
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
        {(action || secondaryAction) && (
          // Story 6.0 (AC3) — touch target AA 44×44px no Link e button.
          // `min-h-[44px]` garante altura clicável; `-mx-2 px-2` no button
          // compensa o padding sem empurrar layout.
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {action && (
              <Link
                href={action.href}
                className="inline-flex min-h-[44px] w-fit items-center text-sm font-medium text-primary hover:underline"
              >
                {action.label} →
              </Link>
            )}
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="-mx-2 inline-flex min-h-[44px] w-fit items-center px-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </m.div>
  );
}
