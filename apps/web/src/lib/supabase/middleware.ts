import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';

import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Supabase middleware helper — refreshes the user's auth session cookies on
 * each request. Without this, JWTs silently expire and Server Components
 * start rendering as anonymous, which breaks RLS-protected queries.
 *
 * Mounted from `apps/web/src/middleware.ts`. Returns the NextResponse the
 * caller should pass through.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createSSRClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          for (const { name, value, options } of cookiesToSet) {
            // Cast: @supabase/ssr CookieOptions is structurally compatible with
            // Next's ResponseCookie minus the `undefined` allowance on partials.
            response.cookies.set({ name, value, ...(options ?? {}) });
          }
        },
      },
    },
  );

  // Touch the session — triggers refresh if access token is near expiry.
  // We intentionally ignore the user payload here; auth gating lives in
  // protected route layouts (`apps/web/src/app/(app)/layout.tsx`).
  await supabase.auth.getUser();

  return response;
}
