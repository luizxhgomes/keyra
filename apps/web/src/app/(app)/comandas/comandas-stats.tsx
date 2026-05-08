'use client';

import { m } from 'framer-motion';
import { CheckCircle2, Clock, DollarSign, Receipt } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

interface Props {
  totalThisMonth: number;
  openCount: number;
  paidThisMonth: number;
  revenueThisMonthCents: number;
  totalLastMonth: number;
  openCountLastMonth: number;
  paidLastMonth: number;
  revenueLastMonthCents: number;
}

/**
 * 4 KPI cards das comandas — inspirado em padrão editorial KEYRA aplicado
 * ao fluxo financeiro core.
 *
 * KPIs:
 * - Total do mês     (count comandas opened_at no mês)
 * - Em aberto        (status=open, count atual — não comparável MoM)
 * - Pagas no mês     (count comandas paid_at no mês)
 * - Faturamento mês  (sum total de comandas paid no mês)
 *
 * Animação stagger 80ms via kpiRevealContainer.
 */
export function ComandasStats({
  totalThisMonth,
  openCount,
  paidThisMonth,
  revenueThisMonthCents,
  totalLastMonth,
  openCountLastMonth,
  paidLastMonth,
  revenueLastMonthCents,
}: Props) {
  return (
    <m.section
      aria-label="Resumo de comandas"
      variants={variants.kpiRevealContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <Cell
        icon={Receipt}
        label="Total do mês"
        value={totalThisMonth.toLocaleString('pt-BR')}
        delta={pctDelta(totalThisMonth, totalLastMonth)}
        accent="cocoa"
      />
      <Cell
        icon={Clock}
        label="Em aberto"
        value={openCount.toLocaleString('pt-BR')}
        delta={pctDelta(openCount, openCountLastMonth)}
        accent="amber"
        {...(openCount === 0 ? { helperOverride: 'Nada pendente' } : {})}
      />
      <Cell
        icon={CheckCircle2}
        label="Pagas no mês"
        value={paidThisMonth.toLocaleString('pt-BR')}
        delta={pctDelta(paidThisMonth, paidLastMonth)}
        accent="success"
      />
      <Cell
        icon={DollarSign}
        label="Faturamento"
        value={formatCentsBRL(revenueThisMonthCents)}
        delta={pctDelta(revenueThisMonthCents, revenueLastMonthCents)}
        accent="terracota"
      />
    </m.section>
  );
}

function pctDelta(curr: number, past: number): number | null {
  if (past === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - past) / past) * 100);
}

type Accent = 'cocoa' | 'amber' | 'success' | 'terracota';

const ACCENT_RING: Record<Accent, string> = {
  cocoa: 'bg-gradient-to-br from-cocoa-700/20 to-cocoa-900/10 text-cocoa-800',
  amber: 'bg-gradient-to-br from-amber-300/30 to-amber-500/10 text-amber-500',
  success:
    'bg-gradient-to-br from-success-leaf/30 to-success-deep/10 text-success-leaf',
  terracota:
    'bg-gradient-to-br from-terracotta-500/25 to-rust-800/10 text-terracotta-500',
};

function Cell({
  icon: Icon,
  label,
  value,
  delta,
  accent,
  helperOverride,
}: {
  icon: typeof Receipt;
  label: string;
  value: string;
  delta: number | null;
  accent: Accent;
  helperOverride?: string;
}) {
  return (
    <m.div variants={variants.kpiRevealItem}>
      <Card className="group flex h-full items-start gap-4 p-5 shadow-warm-sm transition-all duration-base ease-out-soft hover:-translate-y-0.5 hover:shadow-warm-md">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ACCENT_RING[accent]}`}
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
          {helperOverride ? (
            <p className="mt-1 text-xs text-muted-foreground">{helperOverride}</p>
          ) : (
            <DeltaPill delta={delta} />
          )}
        </div>
      </Card>
    </m.div>
  );
}

function DeltaPill({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <p className="mt-1 text-xs text-muted-foreground">vs mês passado</p>
    );
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
      <span className="text-[10px] text-muted-foreground">vs mês passado</span>
    </div>
  );
}
