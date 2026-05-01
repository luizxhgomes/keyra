import type { ReactNode } from 'react';

import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';

import { EstoqueSubNav } from './estoque-sub-nav';

/**
 * Layout do módulo Estoque. Exige `viewer` no mínimo (todo authenticated da
 * org consegue olhar). Mutações são gateadas por `requireRole('admin')`
 * dentro das Server Actions.
 */
export default async function EstoqueLayout({ children }: { children: ReactNode }) {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Estoque</h1>
        <p className="text-sm text-muted-foreground">
          Insumos cadastrados e histórico de movimentações.
        </p>
      </header>
      <EstoqueSubNav />
      {children}
    </div>
  );
}
