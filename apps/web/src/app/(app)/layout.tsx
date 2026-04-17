import { AppShell } from '@/components/layout/AppShell';

/**
 * Authenticated route group layout.
 *
 * Auth guards are intentionally out of scope for Story 1.1 — the marketing
 * landing + login placeholders cover the public surface. Story 1.2 will add
 * a server-side check (Supabase session + active org membership) here, redirecting
 * unauthenticated visitors to /login.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
