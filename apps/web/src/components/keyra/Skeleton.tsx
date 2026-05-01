import { cn } from '@/lib/utils';

/**
 * `<Skeleton>` — placeholder de carregamento (Story 5.2).
 *
 * 3 variants pensados pra compor as telas mais comuns da KEYRA:
 * - `text` — uma linha de texto (para títulos, descrições, valores)
 * - `card` — bloco de card genérico
 * - `kpi` — KPI card (header pequeno + valor grande)
 *
 * Animação: `animate-pulse` do Tailwind. `prefers-reduced-motion` é
 * respeitado pelo próprio Tailwind via `@media`.
 */
type Variant = 'text' | 'card' | 'kpi' | 'circle';

const VARIANT_CLASS: Record<Variant, string> = {
  text: 'h-4 w-full rounded',
  card: 'h-32 w-full rounded-lg',
  kpi: 'h-24 w-full rounded-lg',
  circle: 'h-10 w-10 rounded-full',
};

export interface SkeletonProps {
  variant?: Variant;
  className?: string;
}

export function Skeleton({ variant = 'text', className }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={cn(
        'animate-pulse bg-muted',
        VARIANT_CLASS[variant],
        className,
      )}
    />
  );
}

/**
 * Skeleton específico para KPICard — espelha layout (label pequeno +
 * valor grande + comparativo opcional). Usar quando ainda não há dados
 * mas a estrutura já é conhecida (dashboard, DRE).
 */
export function KPICardSkeleton({ variant = 'secondary' }: { variant?: 'hero' | 'secondary' }) {
  const valueHeight = variant === 'hero' ? 'h-12' : 'h-9';
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Skeleton className="mb-3 h-3 w-24" />
      <div className={cn('mb-2 w-2/3 animate-pulse rounded bg-muted', valueHeight)} />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/**
 * Skeleton para tabela — N linhas com altura uniforme.
 */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
  );
}
