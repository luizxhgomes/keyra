'use client';

import { m } from 'framer-motion';
import {
  CircleDollarSign,
  Coins,
  TrendingDown,
  Wallet,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

interface Props {
  revenueMonthCents: number;
  expensesMonthCents: number;
  profitMonthCents: number;
  balanceCents: number;
  revenueLastMonthCents: number;
  expensesLastMonthCents: number;
  profitLastMonthCents: number;
  revenueSparkline: number[];
  expensesSparkline: number[];
  profitSparkline: number[];
}

/**
 * 4 KPIs com sparkline + variação MoM — inspirado em refs (Img 15 rodapé,
 * Img 18 topo). Adaptado para Editorial Beauty Luxury KEYRA:
 *
 * - Sparkline em SVG inline com paleta KEYRA (terracota/cocoa/success-leaf/rust)
 * - Variação MoM colorida em pill (▲ success-leaf / ▼ rust-800)
 * - Stagger 80ms via kpiRevealContainer
 */
export function FinanceKpisSparkline({
  revenueMonthCents,
  expensesMonthCents,
  profitMonthCents,
  balanceCents,
  revenueLastMonthCents,
  expensesLastMonthCents,
  profitLastMonthCents,
  revenueSparkline,
  expensesSparkline,
  profitSparkline,
}: Props) {
  return (
    <m.section
      aria-label="Resumo financeiro"
      variants={variants.kpiRevealContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <Cell
        icon={CircleDollarSign}
        label="Receita do mês"
        valueCents={revenueMonthCents}
        delta={pct(revenueMonthCents, revenueLastMonthCents)}
        sparkline={revenueSparkline}
        sparkColor="#C26832"
        accent="terracota"
      />
      <Cell
        icon={TrendingDown}
        label="Despesas do mês"
        valueCents={expensesMonthCents}
        delta={pct(expensesMonthCents, expensesLastMonthCents)}
        sparkline={expensesSparkline}
        sparkColor="#843E1A"
        accent="rust"
        invertSentiment
      />
      <Cell
        icon={Coins}
        label="Lucro do mês"
        valueCents={profitMonthCents}
        delta={pct(profitMonthCents, profitLastMonthCents)}
        sparkline={profitSparkline}
        sparkColor="#6E8C5A"
        accent="success"
      />
      <Cell
        icon={Wallet}
        label="Saldo no ano"
        valueCents={balanceCents}
        delta={null}
        sparkline={profitSparkline}
        sparkColor="#5A3E26"
        accent="cocoa"
        helperOverride="Acumulado Jan-Dez"
      />
    </m.section>
  );
}

function pct(curr: number, past: number): number | null {
  if (past === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - past) / past) * 100);
}

type Accent = 'terracota' | 'rust' | 'success' | 'cocoa';

const ACCENT_RING: Record<Accent, string> = {
  terracota: 'bg-gradient-to-br from-terracotta-500/25 to-rust-800/10 text-terracotta-500',
  rust: 'bg-gradient-to-br from-rust-800/20 to-cocoa-900/10 text-rust-800',
  success: 'bg-gradient-to-br from-success-leaf/30 to-success-deep/10 text-success-leaf',
  cocoa: 'bg-gradient-to-br from-cocoa-700/20 to-cocoa-900/10 text-cocoa-800',
};

function Cell({
  icon: Icon,
  label,
  valueCents,
  delta,
  sparkline,
  sparkColor,
  accent,
  invertSentiment = false,
  helperOverride,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  valueCents: number;
  delta: number | null;
  sparkline: number[];
  sparkColor: string;
  accent: Accent;
  invertSentiment?: boolean;
  helperOverride?: string;
}) {
  return (
    <m.div variants={variants.kpiRevealItem}>
      <Card className="group flex h-full flex-col gap-3 p-5 shadow-warm-sm transition-all duration-base ease-out-soft hover:-translate-y-0.5 hover:shadow-warm-md">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ACCENT_RING[accent]}`}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="font-serif text-2xl font-light leading-none tracking-tight text-foreground tabular-nums">
              {formatCentsBRL(valueCents)}
            </p>
          </div>
        </div>

        <Sparkline data={sparkline} color={sparkColor} />

        {helperOverride ? (
          <p className="text-[10px] text-muted-foreground">{helperOverride}</p>
        ) : (
          <DeltaPill delta={delta} invert={invertSentiment} />
        )}
      </Card>
    </m.div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  // Renderiza mini SVG line chart 12 pontos (Jan-Dez) com fill suave.
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const step = w / Math.max(data.length - 1, 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');
  const path = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${w} ${h} L 0 ${h} Z`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function DeltaPill({ delta, invert }: { delta: number | null; invert?: boolean }) {
  if (delta === null) {
    return <p className="text-[10px] text-muted-foreground">vs mês passado</p>;
  }
  const positive = delta >= 0;
  // For "expenses", crescer = ruim; pra outros, crescer = bom
  const sentiment = invert ? !positive : positive;
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
          sentiment
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
