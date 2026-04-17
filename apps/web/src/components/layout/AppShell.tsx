import { ChevronDown } from 'lucide-react';

import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';

/**
 * Authenticated app shell — sidebar + top bar + content area.
 *
 * Story 1.2 will inject:
 *  - Real org switcher (multi-tenant)
 *  - User menu with sign-out
 *  - Notifications
 * Until then, header shows static placeholders so the layout is visible.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* TODO (Story 1.5 multi-org): trocar por <OrgSwitcher /> real */}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
              disabled
            >
              <span>Sua clínica</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* TODO (Story 1.2): notificações + perfil */}
            <span className="text-xs text-muted-foreground">
              KEYRA · pré-MVP (scaffold Story 1.1)
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden px-6 py-6 pb-24 lg:px-12 lg:pb-6">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
