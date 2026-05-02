import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';

import { ServicoForm } from '../servico-form';

export default async function NovoServicoPage() {
  const { orgId } = await requireAuth();

  const supabase = await createServerClient();
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-display">Novo serviço</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados. Apenas nome e preço são obrigatórios.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
          <CardDescription>
            Categorias organizam o catálogo e alimentam o DRE.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServicoForm
            submitLabel="Cadastrar serviço"
            categories={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
