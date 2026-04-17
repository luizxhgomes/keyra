import { cookies } from 'next/headers';
import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

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
 *
 * NOTE on generics: `@supabase/ssr@0.5.x` declares its return as
 * `SupabaseClient<Database, SchemaName, Schema>` using the OLD 3-arg
 * generic order, but `@supabase/supabase-js@2.103` has a NEW 5-arg order
 * where slot 2 is `SchemaNameOrClientOptions`. The mismatch collapses the
 * derived Schema to `never`, so `.from('table')` calls lose their Insert
 * types. We cast to the 2-arg SupabaseClient form, which lets the library
 * fill the remaining slots with their correct defaults (SchemaName='public',
 * Schema=Database['public']). Revisit once ssr ships a 2.103-compatible
 * major version.
 */
export async function createServerClient(): Promise<SupabaseClient<Database>> {
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
  ) as unknown as SupabaseClient<Database>;
}
