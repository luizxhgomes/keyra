import { requireAuth } from '@/lib/auth/require-auth';

import { ServicosSubNav } from './servicos-sub-nav';

export default async function ServicosLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-display">Catálogo</h1>
        <p className="text-sm text-muted-foreground">
          Procedimentos e categorias que alimentam a agenda, os atendimentos e o DRE.
        </p>
      </header>

      <ServicosSubNav />

      <section>{children}</section>
    </div>
  );
}
