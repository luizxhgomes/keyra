'use client';

import { m } from 'framer-motion';
import { CalendarCheck, Clock, DollarSign, Repeat } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { variants } from '@/lib/motion/tokens';
import { formatCentsBRL } from '@/lib/money';

interface Props {
  totalSpentCents: number;
  pendingCents: number;
  encountersTotal: number;
  appointmentsPerMonth: number;
}

/**
 * Resumo financeiro do cliente (4 KPIs) — inspirado no "Billing summary" da
 * referência. Adaptação para clínica de estética:
 *
 * - Total due balance       → Total gasto histórico (todas comandas pagas)
 * - Outstanding insurance   → omitido (não há seguradora)
 * - Outstanding self-pay    → Pendente a receber (comandas open)
 * - Collected Payments      → Total de atendimentos realizados
 *
 * + 4º card adicionado: Frequência (atendimentos por mês)
 *
 * Animação stagger 80ms via kpiRevealContainer KEYRA.
 */
export function PatientBillingSummary({
  totalSpentCents,
  pendingCents,
  encountersTotal,
  appointmentsPerMonth,
}: Props) {
  return (
    <m.section
      aria-label="Resumo financeiro do cliente"
      variants={variants.kpiRevealContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <KpiCell
        icon={DollarSign}
        accent="success"
        label="Total gasto"
        value={formatCentsBRL(totalSpentCents)}
        helper={
          totalSpentCents === 0 ? 'Sem comandas pagas' : 'Histórico realizado'
        }
      />
      <KpiCell
        icon={Clock}
        accent="amber"
        label="Pendente"
        value={formatCentsBRL(pendingCents)}
        helper={pendingCents === 0 ? 'Tudo em dia' : 'Comandas em aberto'}
      />
      <KpiCell
        icon={CalendarCheck}
        accent="terracota"
        label="Atendimentos"
        value={String(encountersTotal)}
        helper={
          encountersTotal === 0
            ? 'Nenhum ainda'
            : encountersTotal === 1
              ? '1 realizado'
              : `${encountersTotal} realizados`
        }
        tabular
      />
      <KpiCell
        icon={Repeat}
        accent="cocoa"
        label="Frequência"
        value={
          appointmentsPerMonth === 0
            ? '—'
            : `${appointmentsPerMonth.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`
        }
        helper={
          appointmentsPerMonth === 0
            ? 'Aguardando histórico'
            : 'visitas por mês'
        }
        tabular
      />
    </m.section>
  );
}

type Accent = 'success' | 'amber' | 'terracota' | 'cocoa';

const ACCENT_RING: Record<Accent, string> = {
  success: 'bg-gradient-to-br from-success-leaf/30 to-success-deep/10 text-success-leaf',
  amber: 'bg-gradient-to-br from-amber-300/30 to-amber-500/10 text-amber-500',
  terracota:
    'bg-gradient-to-br from-terracotta-500/25 to-rust-800/10 text-terracotta-500',
  cocoa: 'bg-gradient-to-br from-cocoa-700/20 to-cocoa-900/10 text-cocoa-800',
};

function KpiCell({
  icon: Icon,
  accent,
  label,
  value,
  helper,
  tabular = false,
}: {
  icon: typeof DollarSign;
  accent: Accent;
  label: string;
  value: string;
  helper: string;
  tabular?: boolean;
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
          <p
            className={`mt-1 font-serif text-2xl font-light leading-none tracking-tight text-foreground ${tabular ? 'tabular-nums' : 'tabular-nums'}`}
          >
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </Card>
    </m.div>
  );
}
