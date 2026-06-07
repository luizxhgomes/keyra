'use client';

import { m } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Ban,
  CheckCircle2,
  Circle,
  Clock,
  Coins,
  Edit3,
  Info,
  Layers,
  PackageMinus,
  Receipt,
  RefreshCw,
  TrendingDown,
  Wallet,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { variants } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

import type { StatusKind } from './status-badge-mappers';

/**
 * `<StatusBadge>` — tag semântica universal da KEYRA.
 *
 * Spec: docs/ux/wireframes/06-componentes-criticos.md §7.
 * Story 5.1 (2026-05-01): consolidação. Antes existiam 8 mapas inline em
 * páginas diferentes — agora UM componente cobre status de agendamento,
 * comanda, tipo de movimentação de estoque, kind de categoria financeira,
 * severidade de alerta. Princípio: ícone + texto sempre (CON-UX-01 + WCAG).
 */
const STATUS: Record<
  StatusKind,
  { label: string; icon: LucideIcon; className: string }
> = {
  // Agendamento (Story 2.6)
  agendado: {
    label: 'Agendado',
    icon: Clock,
    className: 'bg-amber-300/30 text-cocoa-800 border-transparent',
  },
  realizado: {
    label: 'Realizado',
    icon: CheckCircle2,
    className: 'bg-success-leaf/20 text-success-deep border-transparent',
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-transparent',
  },
  falta: {
    label: 'Falta',
    icon: Ban,
    className: 'bg-amber-300/40 text-cocoa-900 border-transparent',
  },
  // Comanda (Story 3.1)
  aberta: {
    label: 'Aberta',
    icon: Edit3,
    className: 'bg-amber-300/40 text-cocoa-900 border-transparent',
  },
  finalizada: {
    label: 'Finalizada',
    icon: Circle,
    className: 'bg-amber-300/30 text-cocoa-800 border-transparent',
  },
  paga: {
    label: 'Paga',
    icon: CheckCircle2,
    className: 'bg-success-leaf/20 text-success-deep border-transparent',
  },
  // Movimento de estoque (Story 2.3 + 3.8)
  entrada: {
    label: 'Entrada',
    icon: ArrowUpCircle,
    className: 'bg-success-leaf/20 text-success-deep border-transparent',
  },
  saida: {
    label: 'Saída',
    icon: ArrowDownCircle,
    className: 'bg-sand-200 text-bronze-500 border-transparent',
  },
  ajuste: {
    label: 'Ajuste',
    icon: RefreshCw,
    className: 'bg-amber-300/30 text-cocoa-800 border-transparent',
  },
  consumo: {
    label: 'Consumo',
    icon: PackageMinus,
    className: 'bg-amber-300/40 text-cocoa-900 border-transparent',
  },
  perda: {
    label: 'Perda',
    icon: TrendingDown,
    className: 'bg-rust-800/15 text-rust-800 border-transparent',
  },
  // Plano de contas (Story 3.6)
  receita: {
    label: 'Receita',
    icon: Coins,
    className: 'bg-success-leaf/20 text-success-deep border-transparent',
  },
  'custo-variavel': {
    label: 'Custo variável',
    icon: Layers,
    className: 'bg-amber-300/40 text-cocoa-900 border-transparent',
  },
  'custo-fixo': {
    label: 'Custo fixo',
    icon: Wallet,
    className: 'bg-amber-300/30 text-cocoa-800 border-transparent',
  },
  despesa: {
    label: 'Despesa operacional',
    icon: Receipt,
    className: 'bg-sand-200 text-bronze-500 border-transparent',
  },
  imposto: {
    label: 'Imposto',
    icon: Receipt,
    className: 'bg-amber-300/25 text-cocoa-800 border-transparent',
  },
  outros: {
    label: 'Outros',
    icon: Layers,
    className: 'bg-ivory-100 text-bronze-400 border-transparent',
  },
  // Severidade de alerta (Story 4.9)
  info: {
    label: 'Informação',
    icon: Info,
    className: 'bg-amber-300/30 text-cocoa-800 border-transparent',
  },
  aviso: {
    label: 'Atenção',
    icon: AlertTriangle,
    className: 'bg-amber-300/40 text-cocoa-900 border-transparent',
  },
  critico: {
    label: 'Crítico',
    icon: AlertTriangle,
    className: 'bg-rust-800/15 text-rust-800 border-transparent',
  },
};

export interface StatusBadgeProps {
  status: StatusKind;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  /** Override do label padrão da tabela (ex: "Aviso" vs "Atenção"). */
  label?: string;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  label,
  className,
}: StatusBadgeProps) {
  const cfg = STATUS[status];
  const Icon = cfg.icon;

  return (
    // Story 6.2 (AC2.2) — `subtleScale` (1 → 1.04 → 1, 200ms) dispara quando
    // status muda. `key={status}` força remount do `<m.span>` a cada novo
    // valor, ativando a variant `animate` sem morphing.
    <m.span
      key={status}
      variants={variants.subtleScale}
      initial="initial"
      animate="animate"
      className="inline-flex"
    >
      <Badge
        className={cn(
          cfg.className,
          size === 'sm' && 'px-2 py-0 text-[10px]',
          className,
        )}
      >
        {showIcon && (
          <Icon
            className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
            aria-hidden="true"
          />
        )}
        <span>{label ?? cfg.label}</span>
      </Badge>
    </m.span>
  );
}