import { BottomNav } from '@/components/layout/BottomNav';
import { OrgSwitcher } from '@/components/layout/OrgSwitcher';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserMenu } from '@/components/layout/UserMenu';

/**
 * Authenticated app shell — sidebar + top bar + content area.
 *
 * O Server Component pai `(app)/layout.tsx` resolve user + display name
 * via `requireAuth()` + `getCurrentUserDisplayName()` (Story auth.7) e
 * passa pra cá. Display name vem do JWT custom claim `full_name` (sem
 * query extra) com fallback no email.
 *
 * OrgSwitcher hydrates its own data client-side (Server Action). Keeping
 * it a Client Component lets the dropdown animate + update locally on
 * switch without re-rendering the full shell.
 */
export function AppShell({
  children,
  userEmail,
  displayName,
}: {
  children: React.ReactNode;
  userEmail: string;
  displayName: string;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Story auth.9 — gradient sutil (intensidade 0.04 vs 0.08 da tela auth)
            planta a textura KEYRA sem competir com conteúdo do dashboard. */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, hsl(21 56% 50% / 0.04), transparent 60%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex items-center gap-3">
            <OrgSwitcher />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <span className="hidden text-sm tracking-tight text-muted-foreground sm:inline">
              Olá, <span className="font-semibold text-foreground">{displayName}</span>
            </span>
            <UserMenu email={userEmail} displayName={displayName} />
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
