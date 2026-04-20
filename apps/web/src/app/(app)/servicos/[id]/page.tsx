import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';
import type { ServiceType } from '@/lib/validators/service';

import { ServicoForm } from '../servico-form';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServicoEditarPage({ params }: PageProps) {
  const { orgId } = await requireAuth();
  const { id } = await params;

  const supabase = await createServerClient();
  const [serviceRes, categoriesRes] = await Promise.all([
    supabase
      .from('services')
      .select(
        'id, name, type, price, unit_cost, commission_rate, duration_minutes, description, active, category_id',
      )
      .eq('id', id)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('service_categories')
      .select('id, name')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
  ]);

  const svc = serviceRes.data;
  if (!svc) notFound();
  if (svc.type !== 'service' && svc.type !== 'product') notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/servicos"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para o catálogo
      </Link>

      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{svc.name}</h1>
          <p className="text-sm text-muted-foreground">Editar serviço.</p>
        </div>
        {!svc.active ? <Badge variant="outline">Inativo</Badge> : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
          <CardDescription>Alterações valem para novos agendamentos — histórico fica imutável.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServicoForm
            submitLabel="Salvar alterações"
            redirectTo="/servicos"
            categories={(categoriesRes.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
            initial={{
              id: svc.id,
              name: svc.name,
              type: svc.type as ServiceType,
              ...(svc.category_id ? { categoryId: svc.category_id } : {}),
              price: Number(svc.price ?? 0),
              unitCost: Number(svc.unit_cost ?? 0),
              ...(svc.commission_rate !== null && svc.commission_rate !== undefined
                ? { commissionPercent: Math.round(Number(svc.commission_rate) * 100) }
                : {}),
              ...(svc.duration_minutes !== null && svc.duration_minutes !== undefined
                ? { durationMinutes: svc.duration_minutes }
                : {}),
              ...(svc.description ? { description: svc.description } : {}),
              active: svc.active,
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/servicos">
          <Button variant="ghost">Voltar</Button>
        </Link>
      </div>
    </div>
  );
}
