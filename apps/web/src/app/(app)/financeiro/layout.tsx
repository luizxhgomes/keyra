import type { ReactNode } from 'react';

import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';

import { FinanceiroSubNav } from './financeiro-sub-nav';

export default async function FinanceiroLayout({ children }: { children: ReactNode }) {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');

  return (
    <div className="space-y-6">
      {/* O layout é o dono do h1 do módulo (Story reorg.3). A descrição
          contextual é responsabilidade de cada sub-página. */}
      <header>
        <h1 className="font-serif text-display">Financeiro</h1>
      </header>
      <FinanceiroSubNav />
      {children}
    </div>
  );
}
