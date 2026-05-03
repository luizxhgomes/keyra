import { NextResponse, type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { isSafeNextPath } from '@/lib/auth/safe-next';
import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Authenticated route prefixes. Anything matching these is blocked for
 * anonymous visitors and gets redirected to /login. Exact list mirrors the
 * Sidebar / BottomNav items (see `docs/ux/wireframes/05-navegacao.md`).
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/agenda',
  '/pacientes',
  '/servicos',
  '/financeiro',
  '/estoque',
  '/configuracoes',
  '/mais',
] as const;

/**
 * Public auth-gating rule: these paths are bounced AWAY from an already-logged
 * user. Visitors with an active session should land on /dashboard instead.
 */
const ANONYMOUS_ONLY_PATHS = ['/login'] as const;

/**
 * KEYRA Next.js proxy (renamed from `middleware` in Next 16) — session refresh
 * + auth guards.
 *
 * Inlined (rather than calling `lib/supabase/middleware.ts`) because we need
 * the refreshed `supabase` client in the same request to run `.getUser()`
 * and make the routing decision. Keeps a single cookie-rotation pass.
 *
 * Traceability: ADR-010 (Supabase Auth), ADR-011 (RLS tenant isolation).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
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
            request: { headers: request.headers },
          });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set({ name, value, ...(options ?? {}) });
          }
        },
      },
    },
  ) as unknown as SupabaseClient<Database>;

  // Touch the session — refresh cookies if near expiry.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---- Sentry breadcrumb pra detecção Tier 1 do Auth Hook (Story auth.1) --
  // Recomendação do DevOps review: logar primeiro 8 chars do org_id (não-PII)
  // pra detectar rapidamente se a custom_access_token_hook parou de injetar
  // o claim. Se este breadcrumb sumir em massa = hook quebrada.
  if (user) {
    type AppMeta = { org_id?: unknown };
    const orgIdClaim = (user.app_metadata as AppMeta | undefined)?.org_id;
    const orgIdSample = typeof orgIdClaim === 'string' ? orgIdClaim.slice(0, 8) : 'absent';
    Sentry.addBreadcrumb({
      category: 'auth',
      type: 'info',
      level: 'info',
      message: `proxy auth check (org_id=${orgIdSample})`,
      data: { pathname },
    });
  }

  // ---- Auth gating ----------------------------------------------------

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAnonymousOnly = ANONYMOUS_ONLY_PATHS.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !user) {
    // Preserve the intended destination so we can bounce back post-login
    // in a future iteration (not implemented this story).
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAnonymousOnly && user) {
    // Logged-in user accidentally navigating to /login → send them onward.
    // Se a URL tem `?next=` válido (ex.: alguém clicou num link de convite
    // já estando logado), respeitamos esse destino. Caso contrário rota
    // padrão é `/dashboard` — `requireAuth()` no layout corrige caminho
    // para onboarding se a membership ainda não existir.
    const rawNext = request.nextUrl.searchParams.get('next');
    const target = isSafeNextPath(rawNext) ? rawNext : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  // Skip Next internals and static assets. We DO want middleware on
  // /api/* and Server Action routes so cookies rotate during mutations.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
