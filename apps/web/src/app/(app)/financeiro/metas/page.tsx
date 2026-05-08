import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorMessage } from '@/components/keyra';
import { Target } from 'lucide-react';
import { formatBRL } from '@/lib/money';

import { getVarianceMonthly, listGoals } from '../actions';
import { MetaForm } from './meta-form';
import { VarianceTable } from './variance-table';

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function MetasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const year = params.year ? Number(params.year) : new Date().getFullYear();
  const [result, varianceRes] = await Promise.all([
    listGoals({ year }),
    getVarianceMonthly({ year }),
  ]);

  if (!result.ok) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorMessage detail={result.error} />
        </CardContent>
      </Card>
    );
  }

  const goals = result.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-display text-foreground">Metas · {year}</h2>
        <p className="text-sm text-muted-foreground">
          Defina metas mensais de receita, lucro e atendimentos. Compare com o
          realizado mês a mês.
        </p>
      </div>

      {varianceRes.ok ? (
        <VarianceTable months={varianceRes.data} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Nova meta / atualizar mês existente</CardTitle>
          <CardDescription>
            Use o mesmo mês para atualizar uma meta. UPSERT por (org, mês).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetaForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title={`Sem metas cadastradas em ${year}`}
              description="Use o formulário acima para definir metas mensais de receita, lucro ou atendimentos. O dashboard mostra quanto falta a cada dia."
            />
          ) : (
            <ul className="divide-y divide-border">
              {goals.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">
                      {format(new Date(g.period_month), "MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        g.target_revenue !== null
                          ? `Receita: ${formatBRL(g.target_revenue)}`
                          : null,
                        g.target_profit !== null
                          ? `Lucro: ${formatBRL(g.target_profit)}`
                          : null,
                        g.target_appointments !== null
                          ? `${g.target_appointments} atendimentos`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Sem metas definidas'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
