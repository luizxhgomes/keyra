import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage } from '@/components/keyra';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';

import { getCatalogStats } from './actions';
import { CatalogStats } from './catalog-stats';
import { ServicesTable, type ServiceTableRow } from './services-table';
import { ServicesToolbar } from './services-toolbar';

type PageProps = {
  searchParams: Promise<{
    type?: string;
    status?: string;
    q?: string;
    category?: string;
  }>;
};

/**
 * Catálogo de itens — refatorado conforme referência (Product Catalogs).
 *
 * Adaptação Editorial Beauty Luxury KEYRA:
 * - 4 KPIs no topo (Total / Ativos / Categorias / Categorias ativas) com
 *   variação MoM colorida (success-leaf cresceu / rust-800 caiu)
 * - Toolbar com search + filtros segmentados (tipo, status, categoria)
 * - Tabela unificada com colunas: Item, Categoria, Preço, Custo, Comissão,
 *   Duração, Ações (substitui agrupamento por categoria via cards)
 *
 * "Vendor" da referência → "Categoria" (não há fornecedor em estética).
 */
export default async function ServicosPage({ searchParams }: PageProps) {
  const { orgId } = await requireAuth();
  const params = await searchParams;
  const type =
    params.type === 'product'
      ? 'product'
      : params.type === 'service'
        ? 'service'
        : null;
  const q = (params.q ?? '').trim();
  const status =
    params.status === 'active'
      ? 'active'
      : params.status === 'inactive'
        ? 'inactive'
        : 'all';
  const categoryId = params.category ?? null;

  const supabase = await createServerClient();

  let svcQuery = supabase
    .from('services')
    .select(
      'id, name, type, price, unit_cost, commission_rate, duration_minutes, active, category_id, service_categories:service_categories(id, name, color)',
    )
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (type) svcQuery = svcQuery.eq('type', type);
  if (q) svcQuery = svcQuery.ilike('name', `%${q}%`);
  if (status === 'active') svcQuery = svcQuery.eq('active', true);
  if (status === 'inactive') svcQuery = svcQuery.eq('active', false);
  if (categoryId) svcQuery = svcQuery.eq('category_id', categoryId);

  const [servicesRes, categoriesRes, statsRes] = await Promise.all([
    svcQuery,
    supabase
      .from('service_categories')
      .select('id, name')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
    getCatalogStats(),
  ]);

  const categories = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const rows: ServiceTableRow[] = (servicesRes.data ?? []).map((s) => {
    const cat = (s.service_categories ?? null) as
      | { id: string; name: string; color: string | null }
      | null;
    return {
      id: s.id,
      name: s.name,
      type: s.type as 'service' | 'product',
      price: s.price,
      unitCost: s.unit_cost,
      commissionRate: s.commission_rate,
      durationMinutes: s.duration_minutes,
      active: s.active,
      category: cat,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-display text-foreground">Catálogo</h1>
        <p className="text-sm text-muted-foreground">
          Serviços e produtos que você oferece. Acompanhe ativos, categorias e
          variações desde o mês passado.
        </p>
      </header>

      {statsRes.ok ? (
        <CatalogStats
          totalItems={statsRes.data.totalItems}
          activeItems={statsRes.data.activeItems}
          totalCategories={statsRes.data.totalCategories}
          uncategorizedItems={statsRes.data.uncategorizedItems}
          totalItemsDelta={statsRes.data.totalItemsDelta}
          activeItemsDelta={statsRes.data.activeItemsDelta}
          totalCategoriesDelta={statsRes.data.totalCategoriesDelta}
          uncategorizedItemsDelta={statsRes.data.uncategorizedItemsDelta}
        />
      ) : (
        <Card>
          <CardContent className="py-6">
            <ErrorMessage detail={statsRes.error} />
          </CardContent>
        </Card>
      )}

      <ServicesToolbar
        q={q}
        type={type}
        status={status}
        categoryId={categoryId}
        categories={categories}
      />

      <ServicesTable rows={rows} totalCount={rows.length} />
    </div>
  );
}
