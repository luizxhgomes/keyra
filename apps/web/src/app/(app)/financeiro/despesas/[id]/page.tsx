import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

import {
  getExpense,
  listExpenseCategoriesForPicker,
} from '../../actions';
import { DespesaForm } from '../despesa-form';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarDespesaPage({ params }: PageProps) {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'admin');
  const { id } = await params;

  const supabase = await createServerClient();
  const [expRes, catRes, accRes] = await Promise.all([
    getExpense(id),
    listExpenseCategoriesForPicker(),
    supabase
      .from('accounts')
      .select('id, name')
      .eq('org_id', orgId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('name', { ascending: true }),
  ]);

  if (!expRes.ok) notFound();
  const exp = expRes.data;
  const categories = catRes.ok ? catRes.data : [];
  const accounts = (accRes.data ?? []).map((a) => ({ id: a.id, name: a.name }));

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/financeiro/despesas"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para despesas
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Editar despesa</CardTitle>
        </CardHeader>
        <CardContent>
          <DespesaForm
            initial={exp}
            submitLabel="Salvar alterações"
            redirectTo="/financeiro/despesas"
            categories={categories}
            accounts={accounts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
