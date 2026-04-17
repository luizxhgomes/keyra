import { BottomNav } from '@/components/layout/BottomNav';
import { OrgSwitcher } from '@/components/layout/OrgSwitcher';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserMenu } from '@/components/layout/UserMenu';

/**
 * Authenticated app shell — sidebar + top bar + content area.
 *
 * The parent `(app)/layout.tsx` (a Server Component) resolves the current
 * user via `requireAuth()` and passes the email down so we can render the
 * user menu without a client-side Supabase fetch.
 *
 * OrgSwitcher hydrates its own data client-side (Server Action). Keeping
 * it a Client Component lets the dropdown animate + update locally on
 * switch without re-rendering the full shell.
 */
export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <OrgSwitcher />
          </div>

          <div className="flex items-center gap-3">
            <UserMenu email={userEmail} />
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
