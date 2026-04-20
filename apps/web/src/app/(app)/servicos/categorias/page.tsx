import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';

import { CategoriaActions } from './categoria-actions';
import { CategoriaForm } from './categoria-form';

export default async function CategoriasPage() {
  const { orgId } = await requireAuth();

  const supabase = await createServerClient();
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name, color, sort_order')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card>
        <CardHeader>
          <CardTitle>Categorias cadastradas</CardTitle>
          <CardDescription>
            Organizam o catálogo e alimentam o DRE por categoria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!categories || categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda sem categorias. Use o formulário ao lado para criar a primeira.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-block h-6 w-6 rounded-full border border-border"
                      style={{ backgroundColor: c.color ?? 'transparent' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Ordem {c.sort_order ?? 0}
                      </p>
                    </div>
                  </div>
                  <CategoriaActions id={c.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Nova categoria</CardTitle>
            <CardDescription>Cor é opcional — usada na agenda.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoriaForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
