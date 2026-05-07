#!/usr/bin/env node
/**
 * KEYRA — e2e-auth-recovery-real.mjs
 * =============================================================================
 * E2E REAL do fluxo de recovery (Story auth.5) sem precisar de email entregue
 * nem browser. Exerce o backend ponta-a-ponta usando Supabase Admin API +
 * REST direto.
 *
 * Cobre os Nível 1 da fiscalização 2026-05-06: garante que o caminho
 * Supabase → callback handler → updateUser → signOut(global) → invalidação de
 * sessões → login com nova senha funciona DE FATO para o user final.
 *
 * Equivalência ao fluxo real do usuário:
 *   - Admin generateLink('recovery') gera token IDÊNTICO ao que iria por email
 *   - GET no action_link exerce o /auth/callback?type=recovery REAL
 *   - Cookies de sessão recovery são capturados (mesma sessão que o NewPasswordCard
 *     usa via getUser() server-side)
 *   - PUT /auth/v1/user com a sessão exerce o updateUser igual à Server Action
 *   - Admin signOut(scope=global) exerce o signOut da Server Action (R11)
 *
 * Único gap: não exerce a Server Action setNewPasswordAction via Next runtime
 * (impossível via curl porque exige Next-Action header com hash de build).
 * Esse gap é coberto pelo Nível 2 (Playwright).
 *
 * CLEANUP garantido em try/finally — restaura senha original em qualquer caminho.
 *
 * Uso:
 *   node scripts/e2e-auth-recovery-real.mjs
 *   TEST_EMAIL=luizxhenriquepro@gmail.com node scripts/e2e-auth-recovery-real.mjs
 *
 * Exit codes:
 *   0 — todos os asserts PASS
 *   1 — pelo menos 1 assert FAIL
 *   2 — pré-requisitos faltando (user inexistente, secrets ausentes)
 * =============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function readSecret(name) {
  try {
    return readFileSync(`${ROOT}/.keyra-secrets/${name}`, 'utf8').trim();
  } catch {
    console.error(`❌ Secret ausente: .keyra-secrets/${name}`);
    process.exit(2);
  }
}

const ref = readSecret('supabase-project-ref.txt');
const serviceKey = readSecret('supabase-service-role.key');
const anonKey = readSecret('supabase-anon.key');
const dbPass = readSecret('supabase-db-password.txt');
const supabaseUrl = `https://${ref}.supabase.co`;

const TEST_EMAIL = process.env.TEST_EMAIL || 'luizxhenriquepro@gmail.com';
const ORIGINAL_PASSWORD = process.env.ORIGINAL_PASSWORD || 'Keyra2026Test!';
const NEW_PASSWORD = `KeyraE2E${Date.now()}!Aa`;
const SITE_URL = process.env.SITE_URL || 'https://usekeyra.com';

let asserts = { pass: 0, fail: 0, failed: [] };

function assert(name, cond, detail = '') {
  if (cond) {
    console.log(`  ✅ ${name}`);
    asserts.pass++;
  } else {
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
    asserts.fail++;
    asserts.failed.push(name);
  }
}

function psqlQuery(sql) {
  const env = { ...process.env, PGPASSWORD: dbPass };
  if (process.platform === 'darwin' && !process.env.PATH.includes('libpq')) {
    env.PATH = `/opt/homebrew/opt/libpq/bin:${process.env.PATH}`;
  }
  return execSync(
    `psql "host=db.${ref}.supabase.co port=5432 user=postgres dbname=postgres sslmode=require" -t -A -c "${sql.replace(/"/g, '\\"')}"`,
    { env, encoding: 'utf8' },
  ).trim();
}

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`🧪 E2E Recovery Real — ${TEST_EMAIL}`);
console.log(`   senha original: ${ORIGINAL_PASSWORD.replace(/./g, '*')}`);
console.log(`   senha nova:     ${NEW_PASSWORD.replace(/./g, '*')}`);
console.log('');

let userId = null;
let cookieJar = null;

try {
  // 0) Resolve user ID
  const { data: list } = await adminClient.auth.admin.listUsers({ perPage: 200 });
  const user = list.users.find((u) => u.email === TEST_EMAIL);
  if (!user) {
    console.error(`❌ User ${TEST_EMAIL} não existe em auth.users`);
    process.exit(2);
  }
  userId = user.id;
  console.log(`👤 User id: ${userId}`);
  console.log('');

  // 1) Setup: garantir senha conhecida via Admin
  console.log('🔧 SETUP — setando senha original via Admin (idempotente)');
  const { error: setupError } = await adminClient.auth.admin.updateUserById(userId, {
    password: ORIGINAL_PASSWORD,
  });
  if (setupError) throw new Error(`Setup updateUser: ${setupError.message}`);

  // Login com senha original pra criar refresh_token (pra signOut global ter o que revogar depois)
  const { data: setupLogin, error: setupLoginError } = await anonClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: ORIGINAL_PASSWORD,
  });
  if (setupLoginError) throw new Error(`Setup login: ${setupLoginError.message}`);
  console.log(`   login com senha original OK (refresh_token criado)`);

  // Pequeno delay pra Supabase persistir refresh_token
  await new Promise((r) => setTimeout(r, 500));

  const countBefore = parseInt(
    psqlQuery(
      `SELECT count(*) FROM auth.refresh_tokens WHERE user_id = '${userId}' AND revoked = false`,
    ),
  );
  console.log(`📊 refresh_tokens ativos ANTES: ${countBefore}`);
  assert('setup criou refresh_token (count > 0)', countBefore > 0);
  console.log('');

  // 2) Admin generateLink({type: 'recovery'}) — extrai hashed_token (não usa action_link)
  console.log('📧 ETAPA 1: Admin generateLink({type: recovery}) — usa hashed_token p/ token_hash flow');

  // Importante: passamos redirect_to TOP-LEVEL (api do Supabase respeita aqui;
  // dentro de options ele ignora silenciosamente — bug conhecido do supabase-js).
  // Mas o redirect_to é só pra fluxo legacy implicit; nós usamos hashed_token
  // direto pra montar URL custom apontando pro nosso /auth/callback?token_hash=...
  const linkResp = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'recovery',
      email: TEST_EMAIL,
      redirect_to: `${SITE_URL}/auth/callback?type=recovery`,
    }),
  });

  const linkData = await linkResp.json();
  assert('generateLink HTTP 200', linkResp.status === 200, `got ${linkResp.status}: ${JSON.stringify(linkData).substring(0, 200)}`);
  assert('hashed_token presente no response', !!linkData.hashed_token);

  const hashedToken = linkData.hashed_token;
  const tokenHashUrl = `${SITE_URL}/auth/callback?token_hash=${hashedToken}&type=recovery`;
  console.log(`   hashed_token: ${hashedToken.substring(0, 30)}...`);
  console.log(`   URL custom (token_hash flow): ${tokenHashUrl.substring(0, 100)}...`);
  console.log('');

  // 3) GET URL custom — exerce o callback handler v2 com verifyOtp server-side
  console.log('🔗 ETAPA 2: GET /auth/callback?token_hash=...&type=recovery (verifyOtp SSR)');

  cookieJar = `/tmp/keyra-e2e-${Date.now()}.cookies`;
  writeFileSync(cookieJar, '');

  const finalUrl = execSync(
    `curl -sS -L -c "${cookieJar}" -b "${cookieJar}" -o /dev/null -w '%{url_effective}' "${tokenHashUrl}"`,
    { encoding: 'utf8' },
  ).trim();

  console.log(`   URL final: ${finalUrl}`);
  assert('callback redirecionou para /redefinir-senha', finalUrl.endsWith('/redefinir-senha'));

  // 4) Validar cookies de sessão recovery
  const cookieContent = readFileSync(cookieJar, 'utf8');
  const hasSessionCookie = /sb-[a-z0-9]+-auth-token/.test(cookieContent);
  assert('cookie de sessão recovery setado pelo callback', hasSessionCookie);

  if (!hasSessionCookie) {
    console.log(`   Cookie jar conteúdo:\n${cookieContent}`);
    throw new Error('Cookie de sessão não foi setado — callback handler quebrou');
  }

  // 5) Extrair access_token (cookies podem estar fragmentados em sb-XXX-auth-token.0, .1)
  console.log('');
  console.log('🔍 ETAPA 3: extrair access_token dos cookies');

  const cookieLines = cookieContent
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && /sb-[a-z0-9]+-auth-token/.test(l));

  // Cookies podem vir como `name <TAB> value` — concatenar fragmentos .0 .1 etc
  const cookieMap = {};
  for (const line of cookieLines) {
    const parts = line.split(/\t/);
    const name = parts[parts.length - 2];
    const value = parts[parts.length - 1];
    if (name && value) cookieMap[name] = value;
  }

  // Reconstrói o cookie completo (Supabase fragmenta em .0, .1 quando > 4KB)
  const baseName = Object.keys(cookieMap).find((k) => k.endsWith('-auth-token'));
  let rawCookie = '';
  if (cookieMap[baseName]) {
    rawCookie = cookieMap[baseName];
  } else {
    // Fragmentado: concatenar ordenado por sufixo .N
    const fragments = Object.keys(cookieMap)
      .filter((k) => /-auth-token\.\d+$/.test(k))
      .sort();
    rawCookie = fragments.map((k) => cookieMap[k]).join('');
  }

  // Cookie pode estar URI-encoded (base64-{json}) ou JSON puro
  let sessionData;
  try {
    let decoded = decodeURIComponent(rawCookie);
    if (decoded.startsWith('base64-')) {
      decoded = Buffer.from(decoded.slice(7), 'base64').toString('utf8');
    }
    sessionData = JSON.parse(decoded);
  } catch (e) {
    throw new Error(`Cookie parse falhou: ${e.message}\nRaw: ${rawCookie.substring(0, 200)}`);
  }

  const accessToken =
    sessionData.access_token || (Array.isArray(sessionData) ? sessionData[0] : null);
  assert('access_token extraído da sessão recovery', !!accessToken);

  if (!accessToken) {
    console.log('   Estrutura do cookie:', JSON.stringify(sessionData, null, 2).substring(0, 500));
    throw new Error('access_token não encontrado no cookie');
  }

  // 6) PUT /auth/v1/user — exercer updateUser igual ao setNewPasswordAction
  console.log('');
  console.log('🔑 ETAPA 4: PUT /auth/v1/user (updateUser nova senha — equivalente à action)');

  const updateRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: NEW_PASSWORD }),
  });

  const updateBody = await updateRes.json();
  assert('updateUser HTTP 200', updateRes.status === 200, `got ${updateRes.status}`);
  assert(
    'updateUser retornou user.id correto',
    updateBody.id === userId,
    `expected ${userId}, got ${updateBody.id}`,
  );

  // 7) signOut(scope=global) — equivalente ao que setNewPasswordAction faz em prod.
  // Em prod a action chama `supabase.auth.signOut({scope:'global'})` no cliente que
  // tem a sessão recovery atual — não usa Admin signOut.
  console.log('');
  console.log('🚪 ETAPA 5: signOut(scope=global) no cliente com sessão recovery — R11');

  // Cria cliente com a sessão recovery que extraímos do callback
  const sessionClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  // Seta a sessão manualmente (equivalente ao que createServerClient faz via cookies)
  const refreshToken = sessionData.refresh_token || '';
  await sessionClient.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

  const { error: signOutError } = await sessionClient.auth.signOut({ scope: 'global' });
  assert('signOut(scope=global) sem erro', !signOutError, signOutError?.message);

  // Aguarda propagação interna
  await new Promise((r) => setTimeout(r, 1500));

  const countAfter = parseInt(
    psqlQuery(
      `SELECT count(*) FROM auth.refresh_tokens WHERE user_id = '${userId}' AND revoked = false`,
    ),
  );
  console.log(`📊 refresh_tokens ativos DEPOIS: ${countAfter}`);
  assert(
    'R11: TODOS os refresh_tokens revogados',
    countAfter === 0,
    `era ${countBefore}, ficou ${countAfter}`,
  );

  // 8) Login com senha ANTIGA deve FALHAR
  console.log('');
  console.log('🔒 ETAPA 6: Login com senha ANTIGA deve falhar');

  const { data: oldLoginData, error: oldLoginError } = await anonClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: ORIGINAL_PASSWORD,
  });
  assert(
    'login com senha antiga rejeita',
    !!oldLoginError && !oldLoginData?.session,
    oldLoginError ? '' : 'aceito (BUG CRÍTICO)',
  );

  // 9) Login com senha NOVA deve FUNCIONAR
  console.log('');
  console.log('🔓 ETAPA 7: Login com senha NOVA deve funcionar');

  const { data: newLoginData, error: newLoginError } = await anonClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: NEW_PASSWORD,
  });
  assert(
    'login com senha nova aceita',
    !newLoginError && !!newLoginData?.session?.access_token,
    newLoginError?.message,
  );

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Fluxo backend completo exercido sem dependência de email/browser');
  console.log('═══════════════════════════════════════════════════════════════');
} catch (err) {
  console.error('');
  console.error(`❌ ERRO FATAL: ${err.message}`);
  if (err.stack) console.error(err.stack);
  asserts.fail++;
  asserts.failed.push(`fatal: ${err.message}`);
} finally {
  // CLEANUP — restaurar senha original sempre, mesmo em erro
  console.log('');
  console.log('🧹 CLEANUP — restaurando senha original');
  if (userId) {
    try {
      await adminClient.auth.admin.updateUserById(userId, { password: ORIGINAL_PASSWORD });
      await adminClient.auth.admin.signOut(userId, 'global');
      console.log(`   ✅ senha de ${TEST_EMAIL} restaurada para ${ORIGINAL_PASSWORD}`);
    } catch (cleanupErr) {
      console.error(`   ⚠️ CLEANUP FALHOU: ${cleanupErr.message}`);
      console.error(
        `   ⚠️ ATENÇÃO: Senha de ${TEST_EMAIL} pode estar em '${NEW_PASSWORD}' — RESETAR MANUALMENTE!`,
      );
    }
  }

  if (cookieJar) {
    try {
      unlinkSync(cookieJar);
    } catch {
      /* ignore */
    }
  }
}

console.log('');
console.log(`📊 Resultado: ${asserts.pass} PASS · ${asserts.fail} FAIL`);
if (asserts.fail > 0) {
  console.log(`   Falhas: ${asserts.failed.join(', ')}`);
  process.exit(1);
}
console.log('');
console.log('✅ E2E Recovery Real: backend funcionalmente íntegro pra usuário final');
process.exit(0);
