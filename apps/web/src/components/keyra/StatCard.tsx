'use client';

import { m } from 'framer-motion';
import {
  Box,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderOpen,
  Layers,
  Receipt,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

/**
 * `<StatCard>` — stat de módulo canônico (Story reorg.4).
 *
 * Unifica o padrão "ícone em anel + label + valor serif + pill de variação MoM"
 * que estava reimplementado em `comandas-stats.tsx` e `catalog-stats.tsx`
 * (estilos idênticos duplicados). Novos módulos usam este componente.
 *
 * RSC-safe: o ícone entra por CHAVE string (`icon="receipt"`), nunca como
 * componente Lucide via prop — regra 1 de `docs/dev/rsc-boundary-rules.md`
 * (bug do digest 3213099672). O mapper vive dentro deste client component.
 */
export type StatIconKey =
  | 'receipt'
  | 'clock'
  | 'check'
  | 'money'
  | 'box'
  | 'sparkles'
  | 'layers'
  | 'folder'
  | 'users'
  | 'wallet'
  | 'trending';

const ICONS: Record<StatIconKey, typeof Receipt> = {
  receipt: Receipt,
  clock: Clock,
  check: CheckCircle2,
  money: DollarSign,
  box: Box,
  sparkles: Sparkles,
  layers: Layers,
  folder: FolderOpen,
  users: Users,
  wallet: Wallet,
  trending: TrendingUp,
};

export type StatAccent = 'cocoa' | 'amber' | 'success' | 'terracota';

const ACCENT_RING: Record<StatAccent, string> = {
  cocoa: 'bg-gradient-to-br from-cocoa-700/20 to-cocoa-900/10 text-cocoa-800',
  amber: 'bg-gradient-to-br from-amber-300/30 to-amber-500/10 text-amber-500',
  success:
    'bg-gradient-to-br from-success-leaf/30 to-success-deep/10 text-success-leaf',
  terracota:
    'bg-gradient-to-br from-terracotta-500/25 to-rust-800/10 text-terracotta-500',
};

export interface StatCardProps {
  icon: StatIconKey;
  label: string;
  /** Valor já formatado (contagem ou BRL) — formatação é do chamador. */
  value: string;
  /** Variação percentual MoM; `null` exibe apenas o rótulo do período. */
  delta?: number | null;
  /** Substitui o pill de variação por um helper curto ("Nada pendente"). */
  helper?: string;
  accent: StatAccent;
  /** Rótulo do período do delta. Default: "vs mês passado". */
  deltaLabel?: string;
}

export function StatCard({
  icon,
  label,
  value,
  delta = null,
  helper,
  accent,
  deltaLabel = 'vs mês passado',
}: StatCardProps) {
  const Icon = ICONS[icon];
  return (
    <m.div variants={variants.kpiRevealItem}>
      <Card className="group flex h-full items-start gap-4 p-5 shadow-warm-sm transition-all duration-base ease-out-soft hover:-translate-y-0.5 hover:shadow-warm-md">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            ACCENT_RING[accent],
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-serif text-3xl font-light leading-none tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          {helper ? (
            <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
          ) : (
            <DeltaPill delta={delta} deltaLabel={deltaLabel} />
          )}
        </div>
      </Card>
    </m.div>
  );
}

/**
 * Wrapper de fileira: grid responsivo + stagger narrativo (80ms) compartilhado.
 * Os `<StatCard>` filhos herdam o container de motion.
 */
export function StatCardsSection({
  ariaLabel,
  children,
  className,
}: {
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <m.section
      aria-label={ariaLabel}
      variants={variants.kpiRevealContainer}
      initial="hidden"
      animate="visible"
      className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}
    >
      {children}
    </m.section>
  );
}

function DeltaPill({ delta, deltaLabel }: { delta: number | null; deltaLabel: string }) {
  if (delta === null) {
    return <p className="mt-1 text-xs text-muted-foreground">{deltaLabel}</p>;
  }
  const positive = delta >= 0;
  return (
    <div className="mt-1 flex items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
          positive
            ? 'bg-success-leaf/15 text-success-deep'
            : 'bg-rust-800/15 text-rust-800',
        )}
      >
        {positive ? '▲' : '▼'} {Math.abs(delta)}%
      </span>
      <span className="text-[10px] text-muted-foreground">{deltaLabel}</span>
    </div>
  );
}
