import { AppShell } from '@/components/layout/AppShell';
import { getCurrentUserDisplayName } from '@/lib/auth/get-current-user';
import { requireAuth } from '@/lib/auth/require-auth';
import { MotionProvider } from '@/lib/motion/lazy-motion';

/**
 * Authenticated route group layout.
 *
 * `requireAuth()` handles the auth gate:
 *   - No session → redirect('/login')
 *   - Session but no org → redirect('/onboarding/nova-organizacao')
 *
 * Story auth.7: `getCurrentUserDisplayName()` decoda o JWT custom claim
 * `full_name` (emitido pelo `custom_access_token_hook` da Story auth.1) com
 * fallback no email. Resultado vai pro AppShell sem query extra.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth();
  const displayName = await getCurrentUserDisplayName();

  return (
    <MotionProvider>
      <AppShell userEmail={user.email ?? 'você'} displayName={displayName}>
        {children}
      </AppShell>
    </MotionProvider>
  );
}
