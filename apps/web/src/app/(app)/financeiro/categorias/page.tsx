import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ErrorMessage,
  StatusBadge,
  categoryKindToBadge,
  type CategoryKind,
} from '@/components/keyra';
import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

type DbKind =
  | 'revenue'
  | 'variable_cost'
  | 'fixed_cost'
  | 'operating_expense'
  | 'tax'
  | 'other';

const KIND_HEADER: Record<DbKind, string> = {
  revenue: 'Receitas',
  variable_cost: 'Custos variáveis',
  fixed_cost: 'Custos fixos',
  operating_expense: 'Despesas operacionais',
  tax: 'Impostos',
  other: 'Outros',
};

export default async function CategoriasPage() {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('expense_categories')
    .select('id, name, kind, parent_id, sort_order, active, is_default')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={error.message} />
        </CardContent>
      </Card>
    );
  }

  const cats = data ?? [];
  const grouped = new Map<DbKind, typeof cats>();
  for (const c of cats) {
    const k = c.kind as DbKind;
    grouped.set(k, [...(grouped.get(k) ?? []), c]);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-serif text-h2">Plano de contas</h2>
        <p className="text-sm text-muted-foreground">
          Categorias para classificar receitas e despesas (FR-FI-05). O seed inicial
          vem do `seed_default_chart_of_accounts`; edição via UI entra na Phase 5.
        </p>
      </header>

      {Array.from(grouped.entries()).map(([kind, list]) => {
        const badgeKind: CategoryKind = categoryKindToBadge(kind);
        return (
          <Card key={kind}>
            <CardHeader>
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <StatusBadge status={badgeKind} size="sm" />
                  <span>
                    {KIND_HEADER[kind]} · {list.length}
                  </span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {list.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.parent_id ? 'subcategoria' : 'raiz'}
                        {c.is_default ? ' · seed' : ''}
                        {!c.active ? ' · inativo' : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
