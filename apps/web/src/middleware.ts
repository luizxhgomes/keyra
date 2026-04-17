import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/**
 * KEYRA Next.js middleware — keeps Supabase auth cookies fresh on every
 * navigation. Heavy-lifting lives in `lib/supabase/middleware.ts`.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip Next internals + most static assets. We still want middleware on
  // API routes so Server Actions / Route Handlers see refreshed cookies.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
