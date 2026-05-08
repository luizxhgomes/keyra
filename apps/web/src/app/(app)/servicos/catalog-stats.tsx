'use client';

import { m } from 'framer-motion';
import { Box, FolderOpen, Layers, Sparkles } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

interface Props {
  totalItems: number;
  activeItems: number;
  totalCategories: number;
  uncategorizedItems: number;
  totalItemsDelta: number | null;
  activeItemsDelta: number | null;
  totalCategoriesDelta: number | null;
  uncategorizedItemsDelta: number | null;
}

/**
 * 4 KPI cards do catálogo — inspirado em referência (Total Products / Active
 * Products / Total Vendors / Active Vendors com variação ▲/▼).
 *
 * Adaptação Editorial Beauty Luxury KEYRA:
 * - Cores paleta KEYRA (sem azul, sem verde Trinks)
 * - "Vendor" não existe em estética → vira "Categorias"
 * - Variação MoM em pill colorido (success-leaf cresceu / rust-800 caiu)
 * - Animação stagger 80ms via kpiRevealContainer
 */
export function CatalogStats({
  totalItems,
  activeItems,
  totalCategories,
  uncategorizedItems,
  totalItemsDelta,
  activeItemsDelta,
  totalCategoriesDelta,
  uncategorizedItemsDelta,
}: Props) {
  return (
    <m.section
      aria-label="Resumo do catálogo"
      variants={variants.kpiRevealContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <Cell
        icon={Box}
        label="Total de itens"
        value={totalItems}
        delta={totalItemsDelta}
        accent="cocoa"
      />
      <Cell
        icon={Sparkles}
        label="Itens ativos"
        value={activeItems}
        delta={activeItemsDelta}
        accent="terracota"
      />
      <Cell
        icon={Layers}
        label="Categorias"
        value={totalCategories}
        delta={totalCategoriesDelta}
        accent="amber"
      />
      <Cell
        icon={FolderOpen}
        label="Sem categoria"
        value={uncategorizedItems}
        delta={uncategorizedItemsDelta}
        accent="success"
      />
    </m.section>
  );
}

type Accent = 'cocoa' | 'terracota' | 'amber' | 'success';

const ACCENT_RING: Record<Accent, string> = {
  cocoa: 'bg-gradient-to-br from-cocoa-700/20 to-cocoa-900/10 text-cocoa-800',
  terracota:
    'bg-gradient-to-br from-terracotta-500/25 to-rust-800/10 text-terracotta-500',
  amber: 'bg-gradient-to-br from-amber-300/30 to-amber-500/10 text-amber-500',
  success:
    'bg-gradient-to-br from-success-leaf/30 to-success-deep/10 text-success-leaf',
};

function Cell({
  icon: Icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: typeof Box;
  label: string;
  value: number;
  delta: number | null;
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
            {label}
          </p>
          <p className="mt-1 font-serif text-3xl font-light leading-none tracking-tight text-foreground tabular-nums">
            {value.toLocaleString('pt-BR')}
          </p>
          <DeltaPill delta={delta} />
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
