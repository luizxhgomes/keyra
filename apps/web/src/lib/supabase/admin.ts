import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Supabase admin client — uses the service-role key and BYPASSES Row Level
 * Security. Per ADR-008, this is restricted to server-side jobs and webhooks
 * (Stripe, Asaas, Inngest). NEVER import from a route segment that can be
 * reached by user code.
 *
 * The `server-only` import above will cause Next.js to throw a build error
 * if a Client Component (or its dependency tree) imports this module.
 */
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY missing. Admin client cannot be created in this environment.',
    );
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
