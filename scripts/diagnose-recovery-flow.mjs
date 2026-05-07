#!/usr/bin/env node
/**
 * Diagnóstico — qual flow o supabase-js usa quando a Server Action chama
 * resetPasswordForEmail? Implicit grant (hash) ou PKCE (?code=)?
 *
 * Estratégia: instrumenta fetch global pra interceptar o POST /auth/v1/recover
 * que o supabase-js faz, e mostra os headers/query/body REAIS.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ref = readFileSync(`${ROOT}/.keyra-secrets/supabase-project-ref.txt`, 'utf8').trim();
const anonKey = readFileSync(`${ROOT}/.keyra-secrets/supabase-anon.key`, 'utf8').trim();
const supabaseUrl = `https://${ref}.supabase.co`;

// Instrumenta fetch global pra capturar
const originalFetch = global.fetch;
let capturedRequest = null;
global.fetch = async (...args) => {
  const [url, init] = args;
  if (typeof url === 'string' && url.includes('/auth/v1/recover')) {
    capturedRequest = {
      url,
      method: init?.method,
      headers: init?.headers,
      body: init?.body,
    };
  }
  return originalFetch(...args);
};

console.log('=== TEST 1: createClient default (vanilla supabase-js) ===');
const defaultClient = createClient(supabaseUrl, anonKey);
await defaultClient.auth.resetPasswordForEmail('diagnose-test-1@example.com', {
  redirectTo: 'https://usekeyra.com/auth/callback?type=recovery',
});
console.log('Captured request:');
console.log(JSON.stringify(capturedRequest, null, 2));

console.log('');
console.log('=== TEST 2: createClient com flowType: pkce explícito ===');
capturedRequest = null;
const pkceClient = createClient(supabaseUrl, anonKey, {
  auth: { flowType: 'pkce', persistSession: false, autoRefreshToken: false },
});
await pkceClient.auth.resetPasswordForEmail('diagnose-test-2@example.com', {
  redirectTo: 'https://usekeyra.com/auth/callback?type=recovery',
});
console.log('Captured request:');
console.log(JSON.stringify(capturedRequest, null, 2));

console.log('');
console.log('=== TEST 3: createClient com flowType: implicit explícito ===');
capturedRequest = null;
const implicitClient = createClient(supabaseUrl, anonKey, {
  auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false },
});
await implicitClient.auth.resetPasswordForEmail('diagnose-test-3@example.com', {
  redirectTo: 'https://usekeyra.com/auth/callback?type=recovery',
});
console.log('Captured request:');
console.log(JSON.stringify(capturedRequest, null, 2));
