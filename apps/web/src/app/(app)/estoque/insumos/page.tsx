import Link from 'next/link';
import { AlertTriangle, Package, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorMessage } from '@/components/keyra';
import { formatBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import { listSupplies } from '../actions';
import { InsumoRowActions } from './insumo-row-actions';

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; archived?: string }>;
};

/**
 * Insumos — refinado conforme padrão Editorial Beauty Luxury KEYRA (2026-05-08).
 * Mini-stats + avatar Package gradient + pills com paleta KEYRA.
 */
export default async function InsumosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const showArchived = params.archived === '1';

  const result = await listSupplies({
    ...(q ? { query: q } : {}),
    showArchived,
    page,
  });

  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={result.error} />
        </CardContent>
      </Card>
    );
  }

  const { rows, total, pageSize } = result.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const lowStockCount = rows.filter(
    (s) => s.reorder_level !== null && s.current_stock <= s.reorder_level,
  ).length;

  function qs(next: Record<string, string | number | undefined>): string {
    const merged = new URLSearchParams();
    if (q) merged.set('q', q);
    if (showArchived) merged.set('archived', '1');
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined) merged.delete(k);
      else merged.set(k, String(v));
    }
    const s = merged.toString();
    return s ? `?${s}` : '';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-display text-foreground">Insumos</h2>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'insumo' : 'insumos'}
            {showArchived ? ' (incluindo arquivados)' : ''}
          </p>
        </div>
        <Link
          href="/estoque/insumos/novo"
          className="inline-flex items-center gap-1.5 rounded-full bg-cocoa-900 px-4 py-2 text-sm font-medium text-ivory-50 transition-colors hover:bg-cocoa-800"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Novo insumo
        </Link>
      </div>

      {/* Mini-stats */}
      <section
        aria-label="Resumo de insumos"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <MiniStat
          icon={Package}
          label="Total cadastrados"
          value={String(total)}
          accent="cocoa"
        />
        <MiniStat
          icon={AlertTriangle}
          label="Em recompra"
          value={String(lowStockCount)}
          accent={lowStockCount > 0 ? 'amber' : 'success'}
          helper={
            lowStockCount === 0
              ? 'Estoque saudável'
              : lowStockCount === 1
                ? 'Insumo abaixo do nível'
                : 'Insumos abaixo do nível'
          }
        />
        <MiniStat
          icon={Package}
          label="Custo médio (visíveis)"
          value={
            rows.length === 0
              ? 'R$ —,—'
              : formatBRL(
                  rows.reduce((acc, s) => acc + Number(s.unit_cost), 0) /
                    rows.length,
                )
          }
          accent="terracota"
          helper="Por unidade"
        />
      </section>

      <form
        action="/estoque/insumos"
        method="get"
        className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-warm-sm"
        role="search"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome..."
            className="pl-9"
          />
        </div>
        {showArchived ? <input type="hidden" name="archived" value="1" /> : null}
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
        <Link
          href={showArchived ? '/estoque/insumos' : '/estoque/insumos?archived=1'}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {showArchived ? 'Ocultar arquivados' : 'Mostrar arquivados'}
        </Link>
      </form>

      <Card className="shadow-warm-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Lista</CardTitle>
          <CardDescription>
            Estoque atual é mantido pelo trigger de movimentações. Custo
            unitário rola automaticamente para os serviços ligados ao insumo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            q ? (
              <EmptyState
                icon={Search}
                title="Nada por aqui"
                description={`Nenhum insumo encontrado para "${q}".`}
              />
            ) : (
              <EmptyState
                icon={Package}
                title="Você ainda não cadastrou insumos"
                description="Insumos viram custo automático nos serviços. Cadastre o primeiro pra acompanhar margem e estoque."
                action={{
                  label: 'Cadastrar insumo',
                  href: '/estoque/insumos/novo',
                }}
              />
            )
          ) : (
            <ul className="divide-y divide-mocha-300/20">
              {rows.map((s) => {
                const lowStock =
                  s.reorder_level !== null &&
                  s.current_stock <= s.reorder_level;
                return (
                  <li
                    key={s.id}
                    className={cn(
                      'flex items-center justify-between gap-3 py-3 transition-colors',
                      !s.active && 'opacity-60',
                    )}
                  >
                    <Link
                      href={`/estoque/insumos/${s.id}`}
                      className="flex min-w-0 flex-1 items-center gap-3 hover:text-cocoa-900"
                    >
                      <div
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mocha-300/30 to-bronze-400/20 text-bronze-500"
                      >
                        <Package className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {s.name}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {[
                            `${s.current_stock} ${s.unit}`,
                            formatBRL(s.unit_cost) + ' / ' + s.unit,
                            s.supplier_name,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {lowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-300/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-500">
                          <AlertTriangle
                            className="h-3 w-3"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          Recompra
                        </span>
                      ) : null}
                      {!s.active ? (
                        <span className="inline-flex rounded-full border border-mocha-300/40 bg-ivory-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-mocha-300">
                          Inativo
                        </span>
                      ) : null}
                      <InsumoRowActions id={s.id} archived={!s.active} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-between text-sm text-muted-foreground"
        >
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {hasPrev ? (
              <Link href={`/estoque/insumos${qs({ page: page - 1 })}`}>
                <Button variant="ghost" size="sm">
                  Anterior
                </Button>
              </Link>
            ) : null}
            {hasNext ? (
              <Link href={`/estoque/insumos${qs({ page: page + 1 })}`}>
                <Button variant="ghost" size="sm">
                  Próxima
                </Button>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
  helper,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  accent: 'cocoa' | 'amber' | 'success' | 'terracota';
  helper?: string;
}) {
  const accentClass = {
    cocoa: 'bg-gradient-to-br from-cocoa-700/20 to-cocoa-900/10 text-cocoa-800',
    amber: 'bg-gradient-to-br from-amber-300/30 to-amber-500/10 text-amber-500',
    success:
      'bg-gradient-to-br from-success-leaf/30 to-success-deep/10 text-success-leaf',
    terracota:
      'bg-gradient-to-br from-terracotta-500/25 to-rust-800/10 text-terracotta-500',
  }[accent];

  return (
    <Card className="flex items-start gap-3 p-4 shadow-warm-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accentClass}`}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 font-serif text-xl font-light leading-none tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        {helper && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{helper}</p>
        )}
      </div>
    </Card>
  );
}
