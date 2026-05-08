'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';
import { Plus, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface CategoryOption {
  id: string;
  name: string;
}

interface Props {
  q: string;
  type: 'service' | 'product' | null;
  status: 'all' | 'active' | 'inactive';
  categoryId: string | null;
  categories: CategoryOption[];
}

const TYPE_TABS: { id: 'all' | 'service' | 'product'; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'service', label: 'Serviços' },
  { id: 'product', label: 'Produtos' },
];

const STATUS_TABS: { id: 'all' | 'active' | 'inactive'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'inactive', label: 'Inativos' },
];

/**
 * Toolbar do catálogo — search + filtros segmentados + CTA novo serviço.
 *
 * Inspirado em referência (Filter button + Search bar). Adaptação Editorial
 * Beauty Luxury: tabs em pills cocoa, paleta KEYRA, sem azul/preto puro.
 */
export function ServicesToolbar({ q, type, status, categoryId, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    startTransition(() => {
      const qs = params.toString();
      router.push(`/servicos${qs ? `?${qs}` : ''}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-warm-sm">
      {/* Linha 1: search + CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            type="text"
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                updateParam('q', e.currentTarget.value.trim() || null);
              }
            }}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim();
              if (v !== q) updateParam('q', v || null);
            }}
            placeholder="Buscar por nome…"
            className="h-9 w-full rounded-full border border-mocha-300/40 bg-ivory-50 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-cocoa-700/50 focus:outline-none focus:ring-2 focus:ring-cocoa-700/20"
            aria-label="Buscar itens do catálogo"
          />
          {q && (
            <button
              type="button"
              onClick={() => updateParam('q', null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>

        <Link
          href="/servicos/novo"
          className="inline-flex items-center gap-1.5 rounded-full bg-cocoa-900 px-4 py-2 text-sm font-medium text-ivory-50 transition-colors hover:bg-cocoa-800"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Novo item
        </Link>
      </div>

      {/* Linha 2: tabs tipo */}
      <Segmented
        ariaLabel="Filtrar por tipo"
        items={TYPE_TABS}
        active={type ?? 'all'}
        onSelect={(id) => updateParam('type', id === 'all' ? null : id)}
        disabled={pending}
      />

      {/* Linha 3: tabs status + select categoria */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          ariaLabel="Filtrar por status"
          items={STATUS_TABS}
          active={status}
          onSelect={(id) => updateParam('status', id === 'all' ? null : id)}
          disabled={pending}
        />

        {categories.length > 0 && (
          <select
            value={categoryId ?? 'all'}
            onChange={(e) =>
              updateParam('category', e.target.value === 'all' ? null : e.target.value)
            }
            disabled={pending}
            className="h-9 rounded-full border border-mocha-300/40 bg-ivory-50 px-3 text-sm text-foreground focus:border-cocoa-700/50 focus:outline-none focus:ring-2 focus:ring-cocoa-700/20 disabled:opacity-60"
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  ariaLabel,
  items,
  active,
  onSelect,
  disabled,
}: {
  ariaLabel: string;
  items: { id: T; label: string }[];
  active: T;
  onSelect: (id: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex w-full overflow-x-auto rounded-full border border-mocha-300/40 bg-ivory-50 p-0.5 sm:w-fit"
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(item.id)}
            disabled={disabled}
            className={cn(
              'flex-1 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all sm:flex-none',
              isActive
                ? 'bg-cocoa-900 text-ivory-50 shadow-sm'
                : 'text-cocoa-800 hover:bg-ivory-100',
              disabled && 'opacity-60',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
