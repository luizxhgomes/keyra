import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';

import { getSupply } from '../../actions';
import { InsumoForm } from '../../insumo-form';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarInsumoPage({ params }: PageProps) {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'admin');
  const { id } = await params;

  const result = await getSupply(id);
  if (!result.ok) notFound();
  const sup = result.data;

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/estoque/insumos"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para a lista
      </Link>

      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-h2">{sup.name}</h2>
          <p className="text-sm text-muted-foreground">
            Estoque atual: {sup.current_stock} {sup.unit}
          </p>
        </div>
        {!sup.active ? <Badge variant="outline">Inativo</Badge> : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
          <CardDescription>
            Mudar o custo unitário recompõe o `unit_cost` de todos os serviços que usam
            este insumo no BOM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InsumoForm
            submitLabel="Salvar alterações"
            redirectTo="/estoque/insumos"
            initial={{
              id: sup.id,
              name: sup.name,
              unit: sup.unit,
              unitCost: sup.unit_cost,
              ...(sup.reorder_level !== null ? { reorderLevel: sup.reorder_level } : {}),
              ...(sup.supplier_name ? { supplierName: sup.supplier_name } : {}),
              active: sup.active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
