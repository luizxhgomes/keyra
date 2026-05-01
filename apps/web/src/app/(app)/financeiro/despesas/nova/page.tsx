import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

import { listExpenseCategoriesForPicker } from '../../actions';
import { DespesaForm } from '../despesa-form';

export default async function NovaDespesaPage() {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'admin');

  const supabase = await createServerClient();
  const [catRes, accRes] = await Promise.all([
    listExpenseCategoriesForPicker(),
    supabase
      .from('accounts')
      .select('id, name')
      .eq('org_id', orgId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('name', { ascending: true }),
  ]);

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
          <CardTitle>Nova despesa</CardTitle>
          <CardDescription>
            Lançamento manual de saída. Vai direto para a tabela de transações com
            direção `debit` e origem `manual_expense`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DespesaForm
            submitLabel="Lançar despesa"
            redirectTo="/financeiro/despesas"
            categories={categories}
            accounts={accounts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
