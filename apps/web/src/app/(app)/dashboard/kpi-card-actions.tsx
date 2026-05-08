import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { KPICard, type KPICardProps } from '@/components/keyra';
import { cn } from '@/lib/utils';

type Action = {
  label: string;
  href: string;
  /** 'primary' = filled cocoa, 'secondary' = outline */
  variant?: 'primary' | 'secondary';
};

interface Props
  extends Omit<KPICardProps, 'action' | 'variant'> {
  actions?: [Action] | [Action, Action];
  variant?: KPICardProps['variant'];
}

/**
 * Wrapper do KPICard que adiciona até 2 pill buttons inline no rodapé.
 * Inspirado em: dashboard reference (KPI cards com Transfer/Withdraw, Success/Pending, etc).
 *
 * Mantém o motion narrativo do KPICard intacto — só adiciona ações no rodapé.
 */
export function KPICardActions({ actions, variant, ...kpiProps }: Props) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex-1">
        <KPICard
          {...kpiProps}
          {...(variant ? { variant } : {})}
          className="h-full"
        />
      </div>
      {actions && actions.length > 0 && (
        <div className="flex gap-2 px-1">
          {actions.map((a, idx) => {
            const isPrimary = (a.variant ?? (idx === 0 ? 'primary' : 'secondary')) === 'primary';
            return (
              <Link
                key={a.href}
                href={a.href}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:gap-1.5',
                  isPrimary
                    ? 'border-cocoa-900 bg-cocoa-900 text-ivory-50 hover:bg-cocoa-800'
                    : 'border-mocha-300/40 bg-ivory-50 text-cocoa-800 hover:border-cocoa-700/50',
                )}
              >
                {a.label}
                <ArrowUpRight
                  className="h-3 w-3"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
