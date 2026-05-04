'use server';

import { headers } from 'next/headers';
import { parsePhoneNumberWithError, isValidPhoneNumber } from 'libphonenumber-js';
import { z } from 'zod';

import { env } from '@/lib/env';
import { verifyTurnstileToken } from '@/lib/security/verify-turnstile';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';

export type SignUpResult =
  | { success: true; data: { orgId: string } }
  | { success: false; error: string };

/**
 * Server Action de cadastro novo do EPIC-AUTH-V2 — Story auth.3.
 *
 * Fluxo:
 *   1. Valida input (Zod + libphonenumber-js + CNPJ digits-only).
 *   2. Verifica token Turnstile via Cloudflare API server-to-server.
 *   3. supabase.auth.signUp() — cria auth.users (não confirma email ainda).
 *      Trigger on_auth_user_created cria row em profiles automaticamente.
 *   4. Busca IDs vigentes de Termos + Privacidade.
 *   5. Chama RPC signup_create_account_atomic — preenche profile + cria org +
 *      registra aceites imutáveis em transação única.
 *   6. Se RPC falhar → service_role deleta auth.users (compensating delete).
 *   7. Retorna sucesso → user precisa confirmar email pra logar.
 *
 * Mensagens de erro genéricas pro client (não revelam se email existe etc.).
 *
 * Traceability: ADR-022 §11.2; auditoria R3, R4, R5, R7, R10, R15, R20.
 */

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome muito curto').max(120, 'Nome muito longo'),
  phone: z.string().trim().min(8, 'Telefone obrigatório'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z
    .string()
    .min(10, 'Senha precisa ter pelo menos 10 caracteres')
    .regex(/[a-z]/, 'Senha precisa de letras minúsculas')
    .regex(/[A-Z]/, 'Senha precisa de letras maiúsculas')
    .regex(/[0-9]/, 'Senha precisa de números'),
  confirmPassword: z.string(),
  clinicName: z.string().trim().min(1, 'Nome da clínica obrigatório').max(120),
  cnpj: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, '') : ''))
    .refine((v) => v === '' || v.length === 14, 'CNPJ deve ter 14 dígitos (ou em branco)')
    .transform((v) => (v === '' ? null : v)),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os Termos e a Política de Privacidade' }),
  }),
  turnstileToken: z.string().min(10, 'Verificação de segurança necessária'),
});

export async function signUpAction(input: unknown): Promise<SignUpResult> {
  const parsed = signUpSchema
    .refine((d) => d.password === d.confirmPassword, {
      message: 'As senhas não conferem',
      path: ['confirmPassword'],
    })
    .safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? 'Dados inválidos' };
  }

  // Validação E.164 do telefone
  let phoneE164: string;
  try {
    if (!isValidPhoneNumber(parsed.data.phone, 'BR')) {
      return { success: false, error: 'Telefone inválido' };
    }
    phoneE164 = parsePhoneNumberWithError(parsed.data.phone, 'BR').number;
  } catch {
    return { success: false, error: 'Telefone inválido' };
  }

  // Headers — IP + UA pra registro de aceite + Turnstile remoteip
  const headerList = await headers();
  const xForwardedFor = headerList.get('x-forwarded-for') ?? '';
  const userIp = xForwardedFor.split(',')[0]?.trim() || undefined;
  const userAgent = headerList.get('user-agent') ?? null;

  // 1. CAPTCHA Turnstile
  const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, userIp);
  if (!captcha.success) {
    return { success: false, error: 'Verificação de segurança falhou. Tente novamente.' };
  }

  // 2. Sign up (cria auth.users + trigger insere row em profiles)
  const supabase = await createServerClient();
  const origin =
    headerList.get('origin') ??
    (headerList.get('host')
      ? `${headerList.get('x-forwarded-proto') ?? 'https'}://${headerList.get('host')}`
      : 'https://usekeyra.com');

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        signup_intent: 'self_serve',
      },
    },
  });

  if (signUpError || !signUpData.user) {
    return {
      success: false,
      error: 'Não foi possível criar a conta com esse e-mail. Tente novamente.',
    };
  }

  const newUserId = signUpData.user.id;

  // 3. Buscar IDs vigentes de Termos + Privacidade
  const { data: docs, error: docsError } = await supabase
    .from('legal_documents_current')
    .select('id, type')
    .in('type', ['terms', 'privacy']);

  if (docsError || !docs || docs.length < 2) {
    await rollbackUser(newUserId);
    return { success: false, error: 'Documentos legais indisponíveis. Tente em instantes.' };
  }

  const termsDoc = docs.find((d) => d.type === 'terms');
  const privacyDoc = docs.find((d) => d.type === 'privacy');
  if (!termsDoc || !privacyDoc) {
    await rollbackUser(newUserId);
    return { success: false, error: 'Documentos legais indisponíveis. Tente em instantes.' };
  }

  // 4. RPC unificada (encryption + profile + org + consents em transação)
  if (!env.COLUMN_ENCRYPTION_KEY) {
    await rollbackUser(newUserId);
    return { success: false, error: 'Configuração de segurança ausente. Contate o suporte.' };
  }

  const { data: orgId, error: rpcError } = await supabase.rpc(
    'signup_create_account_atomic' as never,
    {
      p_full_name: parsed.data.fullName,
      p_phone_e164: phoneE164,
      p_encryption_key: env.COLUMN_ENCRYPTION_KEY,
      p_clinic_name: parsed.data.clinicName,
      p_cnpj: parsed.data.cnpj,
      p_terms_doc_id: termsDoc.id,
      p_privacy_doc_id: privacyDoc.id,
      p_ip_address: userIp ?? null,
      p_user_agent: userAgent,
    } as never,
  );

  if (rpcError || !orgId) {
    await rollbackUser(newUserId);
    return {
      success: false,
      error: 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.',
    };
  }

  return { success: true, data: { orgId: orgId as unknown as string } };
}

/**
 * Compensating delete via service_role — remove o auth.users órfão se a RPC
 * falhar entre auth.signUp() e signup_create_account_atomic. Mitiga R4 da
 * auditoria (auth.users sem profile fica em limbo).
 */
async function rollbackUser(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);
  } catch {
    // Best effort. Mesmo se falhar aqui, o user fica órfão mas sem org/profile.
    // Próximo login vai pra onboarding que pode recuperar.
  }
}
