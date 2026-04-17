import { cookies } from 'next/headers';
import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';

import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Supabase server client — for React Server Components, Server Actions, and
 * Route Handlers. Uses Next's cookies() store so the user's session JWT
 * (with `org_id` custom claim from `custom_access_token_hook`) is applied to
 * every query, enabling RLS-based tenant isolation (ADR-008 + ADR-011/012).
 *
 * Always `await` this in async server contexts. Never import in client files.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set({ name, value, ...(options ?? {}) });
            }
          } catch {
            // setAll() called from a Server Component (read-only cookies).
            // The middleware refresh handles session rotation, so safe to ignore here.
          }
        },
      },
    },
  );
}
