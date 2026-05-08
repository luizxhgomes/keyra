import Link from 'next/link';
import { Box, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import { ServicoRowActions } from './servico-row-actions';

export type ServiceTableRow = {
  id: string;
  name: string;
  type: 'service' | 'product';
  price: number | string;
  unitCost: number | string | null;
  commissionRate: number | string | null;
  durationMinutes: number | null;
  active: boolean;
  category: { id: string; name: string; color: string | null } | null;
};

interface Props {
  rows: ServiceTableRow[];
  totalCount: number;
}

/**
 * Tabela unificada do catálogo — substitui o agrupamento por categoria
 * com cards separados. Inspirado em referência (Products list com colunas
 * Product / Vendor / Unit price / Texes / Total amount / Quantity / Add).
 *
 * Adaptação KEYRA:
 * - Item (ícone Sparkles para service, Box para product)
 * - Categoria como pill colorido (cor da categoria ou cocoa default)
 * - Preço (price) — Fraunces tabular
 * - Custo unitário
 * - Comissão (% — convertido de fração)
 * - Duração (minutos para service, "Item" para product)
 * - Ações (edit + arquivar via ServicoRowActions)
 */
export function ServicesTable({ rows, totalCount }: Props) {
  const isEmpty = rows.length === 0;

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3 flex-row items-baseline justify-between space-y-0">
        <CardTitle className="font-serif text-xl">Catálogo de itens</CardTitle>
        <span className="text-xs text-muted-foreground tabular-nums">
          {totalCount} {totalCount === 1 ? 'item' : 'itens'}
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mocha-300/30 text-left">
                <Th>Item</Th>
                <Th>Categoria</Th>
                <Th align="right">Preço</Th>
                <Th align="right">Custo</Th>
                <Th align="right">Comissão</Th>
                <Th align="right">Duração</Th>
                <Th align="right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-ivory-100 p-3">
                        <Sparkles
                          className="h-5 w-5 text-mocha-300"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Nenhum item encontrado
                      </p>
                      <p className="max-w-sm text-xs text-muted-foreground">
                        Ajuste os filtros ou cadastre um novo item para o
                        catálogo aparecer aqui.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr
                    key={s.id}
                    className={cn(
                      'border-b border-mocha-300/20 transition-colors hover:bg-ivory-100',
                      !s.active && 'opacity-60',
                    )}
                  >
                    <Td>
                      <Link
                        href={`/servicos/${s.id}`}
                        className="flex items-center gap-2.5 hover:text-cocoa-900"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            s.type === 'service'
                              ? 'bg-gradient-to-br from-amber-300/30 to-terracotta-500/20 text-terracotta-500'
                              : 'bg-gradient-to-br from-mocha-300/30 to-bronze-400/20 text-bronze-500',
                          )}
                        >
                          {s.type === 'service' ? (
                            <Sparkles
                              className="h-4 w-4"
                              strokeWidth={1.5}
                            />
                          ) : (
                            <Box className="h-4 w-4" strokeWidth={1.5} />
                          )}
                        </span>
                        <span className="font-medium">{s.name}</span>
                        {!s.active && (
                          <span className="rounded-full border border-mocha-300/40 bg-ivory-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-mocha-300">
                            Inativo
                          </span>
                        )}
                      </Link>
                    </Td>
                    <Td>
                      <CategoryPill category={s.category} />
                    </Td>
                    <Td align="right" mono>
                      {formatBRL(s.price)}
                    </Td>
                    <Td align="right" mono>
                      {s.unitCost !== null && s.unitCost !== undefined
                        ? formatBRL(s.unitCost)
                        : '—'}
                    </Td>
                    <Td align="right" mono>
                      {s.commissionRate !== null
                        ? `${Math.round(Number(s.commissionRate) * 100)}%`
                        : '—'}
                    </Td>
                    <Td align="right" mono>
                      {s.type === 'service' && s.durationMinutes
                        ? `${s.durationMinutes} min`
                        : s.type === 'product'
                          ? 'Produto'
                          : '—'}
                    </Td>
                    <Td align="right">
                      <ServicoRowActions id={s.id} active={s.active} />
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryPill({
  category,
}: {
  category: ServiceTableRow['category'];
}) {
  if (!category) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-mocha-300/30 bg-ivory-50 px-2 py-0.5 text-xs text-mocha-300">
        <span
          className="h-1.5 w-1.5 rounded-full bg-mocha-300"
          aria-hidden="true"
        />
        Sem categoria
      </span>
    );
  }
  const dotColor = category.color ?? '#7E5A40'; // bronze-500 fallback
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-mocha-300/40 bg-ivory-50 px-2 py-0.5 text-xs text-cocoa-800">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      {category.name}
    </span>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={cn(
        'pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground',
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  mono = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        'py-3 text-foreground',
        align === 'right' ? 'text-right' : 'text-left',
        mono ? 'tabular-nums' : '',
      )}
    >
      {children}
    </td>
  );
}
