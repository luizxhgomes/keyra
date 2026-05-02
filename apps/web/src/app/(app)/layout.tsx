import { AppShell } from '@/components/layout/AppShell';
import { requireAuth } from '@/lib/auth/require-auth';
import { MotionProvider } from '@/lib/motion/lazy-motion';

/**
 * Authenticated route group layout.
 *
 * `requireAuth()` handles the auth gate:
 *   - No session → redirect('/login')
 *   - Session but no org → redirect('/onboarding/nova-organizacao')
 *
 * Middleware (`middleware.ts`) catches most cases earlier, but we still
 * enforce at the layout level because Next caches route segments and the
 * middleware could miss edge cases (e.g. membership deleted mid-session).
 *
 * Story 6.2 (AC1) — `<MotionProvider>` envolvendo `AppShell` habilita
 * `<m.div>` em qualquer componente filho via LazyMotion + domAnimation
 * (~21KB vs 50KB do `<motion>` cheio).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth();

  return (
    <MotionProvider>
      <AppShell userEmail={user.email ?? 'você'}>{children}</AppShell>
    </MotionProvider>
  );
}
