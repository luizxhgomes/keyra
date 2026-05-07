import { redirect } from 'next/navigation';

import { requireAuth } from '@/lib/auth/require-auth';
import { canManageTeam, getCurrentRole } from '@/lib/auth/roles';

import { TeamSubNav } from './team-sub-nav';

/**
 * Layout do módulo /team.
 *
 * Guard adicional além do middleware: exige role `owner` ou `admin`. Usuários
 * sem permissão são redirecionados para o /dashboard (middleware já garantiu
 * autenticação).
 */
export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const { orgId } = await requireAuth();
  const role = await getCurrentRole(orgId);
  if (!role || !canManageTeam(role)) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-display">Time</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie membros, convites e profissionais da organização.
        </p>
      </header>

      <TeamSubNav />

      <section>{children}</section>
    </div>
  );
}
