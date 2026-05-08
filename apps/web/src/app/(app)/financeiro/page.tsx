import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { ErrorMessage } from '@/components/keyra';
import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';

import {
  getFinanceOverview,
  getOutstandingCommands,
  getTopExpensesByCategory,
} from './actions';
import { FinanceKpisSparkline } from './finance-kpis-sparkline';
import { FinanceMonthlyBars } from './finance-monthly-bars';
import { OutstandingCommandsTable } from './outstanding-commands-table';
import { TopExpensesProgress } from './top-expenses-progress';

/**
 * Hub Financeiro Editorial — landing page de /financeiro.
 *
 * Inspirado em referências (KlarityOS Img 15/18 + Kodo Img 22). Adaptado
 * ao schema KEYRA e Editorial Beauty Luxury:
 *
 * - 4 KPIs com sparkline 12 meses (Receita / Despesas / Lucro / Saldo ano)
 * - Stacked bars Jan-Dez (Receita vs Despesas)
 * - Comandas em aberto com priority flag (cliente recorrente)
 * - Top categorias de despesas com mini progress bars
 *
 * Substitui redirect anterior pra /transacoes — agora /transacoes fica
 * como sub-rota. Sub-nav existente preserva navegação.
 */
export default async function FinanceiroHubPage() {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');

  const [overviewRes, outstandingRes, topExpensesRes] = await Promise.all([
    getFinanceOverview(),
    getOutstandingCommands(8),
    getTopExpensesByCategory(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-display text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada do mês — receita, despesas, comandas em aberto e
          breakdown por categoria.
        </p>
      </header>

      {overviewRes.ok ? (
        <FinanceKpisSparkline {...overviewRes.data} />
      ) : (
        <Card>
          <CardContent className="py-6">
            <ErrorMessage detail={overviewRes.error} />
          </CardContent>
        </Card>
      )}

      {overviewRes.ok ? (
        <FinanceMonthlyBars
          revenueSparkline={overviewRes.data.revenueSparkline}
          expensesSparkline={overviewRes.data.expensesSparkline}
        />
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {outstandingRes.ok ? (
            <OutstandingCommandsTable rows={outstandingRes.data} />
          ) : (
            <Card>
              <CardContent className="py-6">
                <ErrorMessage detail={outstandingRes.error} />
              </CardContent>
            </Card>
          )}
        </div>
        {topExpensesRes.ok ? (
          <TopExpensesProgress
            rows={topExpensesRes.data.rows}
            totalCents={topExpensesRes.data.totalCents}
          />
        ) : (
          <Card>
            <CardContent className="py-6">
              <ErrorMessage detail={topExpensesRes.error} />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
