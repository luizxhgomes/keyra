'use client';

import { m } from 'framer-motion';
import { CalendarDays, CalendarRange, Sun } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { formatBRL } from '@/lib/money';

interface Props {
  today: string;
  week: string;
  month: string;
  todayLabel: string;
  weekRangeLabel: string;
  monthLabel: string;
}

/**
 * Cards animados do fluxo de receita prevista — versão premium.
 *
 * Refinamento Fase 1 (2026-05-08):
 * - Stagger 80ms entre os 3 cards via kpiRevealContainer + kpiRevealItem
 * - Cada card com label temporal correlacionado à data do usuário
 * - Tipografia Fraunces para o valor (display editorial)
 * - Ícones discretos por contexto (Sun=Hoje, Range=Semana, Days=Mês)
 * - Warm shadow KEYRA + hover lift
 *
 * Substitui pattern sticky com negative margins que causava overlap visual
 * com o título "Agenda" em Fraunces grande.
 */
export function ReceitaCardAnimated({
  today,
  week,
  month,
  todayLabel,
  weekRangeLabel,
  monthLabel,
}: Props) {
  return (
    <m.section
      aria-label="Receita prevista"
      variants={variants.kpiRevealContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <ReceitaCell
        icon={Sun}
        bucket="Hoje"
        contextLabel={todayLabel}
        value={today}
        accent="amber"
      />
      <ReceitaCell
        icon={CalendarRange}
        bucket="Esta semana"
        contextLabel={weekRangeLabel}
        value={week}
        accent="terracota"
      />
      <ReceitaCell
        icon={CalendarDays}
        bucket="Este mês"
        contextLabel={monthLabel}
        value={month}
        accent="cocoa"
      />
    </m.section>
  );
}

type Accent = 'amber' | 'terracota' | 'cocoa';

const ACCENT_RING: Record<Accent, string> = {
  amber: 'bg-gradient-to-br from-amber-300/30 to-amber-500/10 text-amber-500',
  terracota:
    'bg-gradient-to-br from-terracotta-500/25 to-rust-800/10 text-terracotta-500',
  cocoa: 'bg-gradient-to-br from-cocoa-700/20 to-cocoa-900/10 text-cocoa-800',
};

function ReceitaCell({
  icon: Icon,
  bucket,
  contextLabel,
  value,
  accent,
}: {
  icon: typeof Sun;
  bucket: string;
  contextLabel: string;
  value: string;
  accent: Accent;
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
            {bucket}
          </p>
          <p className="truncate text-xs capitalize text-muted-foreground">
            {contextLabel}
          </p>
          <p className="mt-1 font-serif text-2xl font-light leading-none tracking-tight text-foreground tabular-nums">
            {formatBRL(value)}
          </p>
        </div>
      </Card>
    </m.div>
  );
}
