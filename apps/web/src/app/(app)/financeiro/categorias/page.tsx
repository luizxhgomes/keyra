import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

const KIND_LABEL: Record<string, string> = {
  revenue: 'Receita',
  variable_cost: 'Custo variável',
  fixed_cost: 'Custo fixo',
  operating_expense: 'Despesa operacional',
  tax: 'Imposto',
  other: 'Outro',
};

const KIND_BADGE: Record<string, string> = {
  revenue: 'bg-emerald-100 text-emerald-900',
  variable_cost: 'bg-amber-100 text-amber-900',
  fixed_cost: 'bg-blue-100 text-blue-900',
  operating_expense: 'bg-stone-200 text-stone-700',
  tax: 'bg-rose-100 text-rose-900',
  other: 'bg-stone-100 text-stone-700',
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
          <p className="text-sm text-destructive">Erro: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const cats = data ?? [];
  const grouped = new Map<string, typeof cats>();
  for (const c of cats) {
    const k = c.kind;
    grouped.set(k, [...(grouped.get(k) ?? []), c]);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Plano de contas</h2>
        <p className="text-sm text-muted-foreground">
          Categorias para classificar receitas e despesas (FR-FI-05). Seed inicial vem
          do `seed_default_chart_of_accounts`. Edição/criação via UI fica para Phase 5.
        </p>
      </header>

      {Array.from(grouped.entries()).map(([kind, list]) => (
        <Card key={kind}>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <Badge variant="secondary" className={KIND_BADGE[kind] ?? ''}>
                  {KIND_LABEL[kind] ?? kind}
                </Badge>
                <span>({list.length})</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {list.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2">
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
      ))}
    </div>
  );
}
