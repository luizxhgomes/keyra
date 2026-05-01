import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';

import { InsumoForm } from '../../insumo-form';

export default async function NovoInsumoPage() {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'admin');

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/estoque/insumos"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para a lista
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Novo insumo</CardTitle>
          <CardDescription>
            Cadastre o insumo com nome, unidade e custo unitário. O estoque é zerado
            inicialmente; movimentações entram automaticamente quando o insumo é
            consumido por uma comanda paga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InsumoForm submitLabel="Cadastrar" redirectTo="/estoque/insumos" />
        </CardContent>
      </Card>
    </div>
  );
}
