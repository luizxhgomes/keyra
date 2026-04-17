'use server';

import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabase/server';

/**
 * Sign the current user out and redirect to /login.
 *
 * Called from `UserMenu` in the app shell. `redirect()` throws a Next.js
 * navigation signal, so the caller must not wrap this in a try/catch that
 * swallows it.
 */
export async function signOutAction(): Promise<never> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
