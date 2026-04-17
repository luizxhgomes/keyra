import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';

import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Supabase browser client — for Client Components that need real-time
 * subscriptions or optimistic mutations. Anon key only; the active session
 * JWT is read from cookies set by the SSR client (ADR-008).
 *
 * Prefer Server Actions + `createServerClient()` whenever possible. Use this
 * sparingly: realtime subscriptions, file uploads with progress, drag/drop
 * agenda updates.
 */
export function createBrowserClient() {
  return createSSRBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
