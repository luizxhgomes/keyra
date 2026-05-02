import Link from 'next/link';
import { AlertTriangle, Package, Plus, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorMessage } from '@/components/keyra';
import { formatBRL } from '@/lib/money';

import { listSupplies } from '../actions';
import { InsumoRowActions } from './insumo-row-actions';

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; archived?: string }>;
};

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-h2">Insumos</h2>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'insumo' : 'insumos'}
            {showArchived ? ' (incluindo arquivados)' : ''}
          </p>
        </div>
        <Link href="/estoque/insumos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo insumo
          </Button>
        </Link>
      </div>

      <form
        action="/estoque/insumos"
        method="get"
        className="flex flex-wrap items-center gap-2"
        role="search"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
          <CardDescription>
            Estoque atual é mantido pelo trigger de movimentações. Custo unitário rola
            automaticamente para os serviços ligados ao insumo.
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
                action={{ label: 'Cadastrar insumo', href: '/estoque/insumos/novo' }}
              />
            )
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((s) => {
                const lowStock =
                  s.reorder_level !== null && s.current_stock <= s.reorder_level;
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/estoque/insumos/${s.id}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {s.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {[
                          `${s.current_stock} ${s.unit}`,
                          formatBRL(s.unit_cost) + ' / ' + s.unit,
                          s.supplier_name,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lowStock ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500 text-amber-700"
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" /> Recompra
                        </Badge>
                      ) : null}
                      {!s.active ? <Badge variant="outline">Inativo</Badge> : null}
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
