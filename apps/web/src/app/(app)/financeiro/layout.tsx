import type { ReactNode } from 'react';

import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';

import { FinanceiroSubNav } from './financeiro-sub-nav';

export default async function FinanceiroLayout({ children }: { children: ReactNode }) {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Transações, receitas, despesas e fluxo de caixa.
        </p>
      </header>
      <FinanceiroSubNav />
      {children}
    </div>
  );
}
