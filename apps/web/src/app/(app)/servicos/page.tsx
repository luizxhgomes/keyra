import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/money';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';

import { ServicoRowActions } from './servico-row-actions';

type PageProps = {
  searchParams: Promise<{ type?: string; q?: string }>;
};

export default async function ServicosPage({ searchParams }: PageProps) {
  const { orgId } = await requireAuth();
  const params = await searchParams;
  const type = params.type === 'product' ? 'product' : params.type === 'service' ? 'service' : null;
  const q = (params.q ?? '').trim();

  const supabase = await createServerClient();

  let query = supabase
    .from('services')
    .select('id, name, type, price, unit_cost, duration_minutes, active, category_id, service_categories:service_categories(id, name, color)')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (type) query = query.eq('type', type);
  if (q) query = query.ilike('name', `%${q}%`);

  const { data: services } = await query;

  type ServiceRow = NonNullable<typeof services>[number];
  type Group = { key: string; name: string; color: string | null; services: ServiceRow[] };

  const grouped = new Map<string, Group>();
  for (const s of services ?? []) {
    const cat = (s.service_categories ?? null) as { id: string; name: string; color: string | null } | null;
    const key = cat?.id ?? 'sem-categoria';
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        name: cat?.name ?? 'Sem categoria',
        color: cat?.color ?? null,
        services: [],
      });
    }
    grouped.get(key)!.services.push(s);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/servicos" method="get" className="flex flex-wrap items-center gap-2" role="search">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome..."
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <select
            name="type"
            defaultValue={type ?? ''}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="service">Serviço</option>
            <option value="product">Produto</option>
          </select>
          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
        </form>
        <Link href="/servicos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo serviço
          </Button>
        </Link>
      </div>

      {grouped.size === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhum serviço cadastrado. Use o botão acima.
          </CardContent>
        </Card>
      ) : (
        [...grouped.values()].map((group) => (
          <Card key={group.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {group.color ? (
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                ) : null}
                {group.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {group.services.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/servicos/${s.id}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {s.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {s.type === 'service'
                          ? `${s.duration_minutes ?? 0} min · custo ${formatBRL(s.unit_cost ?? 0)}`
                          : `Produto · custo ${formatBRL(s.unit_cost ?? 0)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.type === 'product' ? (
                        <Badge variant="outline">Produto</Badge>
                      ) : null}
                      {!s.active ? <Badge variant="secondary">Inativo</Badge> : null}
                      <span className="text-sm font-semibold">{formatBRL(s.price)}</span>
                      <ServicoRowActions id={s.id} active={s.active} />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
