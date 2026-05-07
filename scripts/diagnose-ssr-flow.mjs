#!/usr/bin/env node
/**
 * Diagnóstico — o `@supabase/ssr` createServerClient usa PKCE quando chamado
 * pela Server Action requestPasswordResetAction?
 */

import { createServerClient } from '@supabase/ssr';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ref = readFileSync(`${ROOT}/.keyra-secrets/supabase-project-ref.txt`, 'utf8').trim();
const anonKey = readFileSync(`${ROOT}/.keyra-secrets/supabase-anon.key`, 'utf8').trim();
const supabaseUrl = `https://${ref}.supabase.co`;

const cookieStore = new Map();
const captured = { recover: null, cookieSets: [] };

const originalFetch = global.fetch;
global.fetch = async (...args) => {
  const [url, init] = args;
  if (typeof url === 'string' && url.includes('/auth/v1/recover')) {
    captured.recover = { url, body: init?.body };
  }
  return originalFetch(...args);
};

const ssrClient = createServerClient(supabaseUrl, anonKey, {
  cookies: {
    getAll() {
      return Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value);
        captured.cookieSets.push({ name, value: value.substring(0, 60) + '...', options });
      }
    },
  },
});

await ssrClient.auth.resetPasswordForEmail('diagnose-ssr@example.com', {
  redirectTo: 'https://usekeyra.com/auth/callback?type=recovery',
});

console.log('=== POST /auth/v1/recover body ===');
console.log(captured.recover?.body);

console.log('');
console.log('=== Cookies setados pelo @supabase/ssr ===');
console.log(JSON.stringify(captured.cookieSets, null, 2));

console.log('');
const body = JSON.parse(captured.recover?.body || '{}');
if (body.code_challenge) {
  console.log('✅ PKCE: code_challenge presente — fluxo retornaria ?code=');
} else {
  console.log('❌ NO PKCE: code_challenge null — fluxo retornaria #access_token (HASH)');
}
