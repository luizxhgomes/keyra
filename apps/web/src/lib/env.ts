import { z } from 'zod';

/**
 * Environment variable schema for KEYRA.
 *
 * SOURCE OF TRUTH: `.keyra-secrets/` (never committed). Synced into Vercel + local
 * `.env.local` via `scripts/sync-env.sh`.
 *
 * Validation runs at module load — failing fast at boot is preferable to silently
 * misconfigured production. Server-only secrets are optional in the schema so client
 * bundles can import this module safely (Next.js tree-shakes server-only references).
 */
const serverSchema = z.object({
  // Required everywhere (client + server) — see ADR-008.
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),

  // Server-only (RLS bypass, used by jobs and webhooks). Optional at type-level
  // because client bundles do not import it.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

  // 256-bit hex (64 chars) — used by pgcrypto column encryption (ADR-017).
  COLUMN_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'COLUMN_ENCRYPTION_KEY must be 64 hex chars (256 bits)')
    .optional(),

  // Observability (ADR-015) — optional in dev, required in prod (enforced via Vercel).
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Email transacional (ADR-021) — optional. Quando ausente, o helper
  // `sendEmail` cai em dry-run (loga payload). Em produção, Vercel deve
  // provisionar o secret.
  RESEND_API_KEY: z.string().min(10).optional(),
  EMAIL_FROM: z
    .string()
    .min(3)
    .default('KEYRA <no-reply@usekeyra.com>'),

  // CAPTCHA (ADR-022 / Story auth.0 — R3 da auditoria de segurança).
  // Cloudflare Turnstile. Site key vai pro bundle do cliente (público); secret
  // key fica server-only e é usada pelo helper `verify-turnstile.ts`.
  // Opcionais até o widget ser provisionado pela idealizadora; quando o epic
  // EPIC-AUTH-V2 fechar, ambas viram obrigatórias em produção (enforced via
  // Vercel env presence).
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(10).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(10).optional(),

  // URL canônica da aplicação. Usada em redirectTo de fluxos de auth (recovery,
  // Story auth.5) e construção de links absolutos em emails. Provisionada nos
  // 3 targets do Vercel desde a sessão pós-EPIC-AUTH-V2 Fase A; fallback p/
  // usekeyra.com em dev local.
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://usekeyra.com'),

  // EPIC-COMPROVANTES (comprovantes.3) — leitura de comprovantes por IA.
  // Provider OpenAI direto (chave de projeto da OpenAI). O ADR-023 previa Vercel AI Gateway
  // (`AI_GATEWAY_API_KEY`); a chave direta foi autorizada pelo idealizador como
  // caminho mais curto — o Gateway agrega observability/fallback numa evolução
  // futura. Server-only (igual ao service role); nunca vai pro bundle do cliente.
  OPENAI_API_KEY: z.string().min(20).optional(),

  // EPIC-COMPROVANTES (comprovantes.2) — limites de ingestão de comprovantes.
  // Env é string → exige z.coerce. Ambas têm default (boot não aborta sem elas).
  RECEIPT_MAX_BYTES: z.coerce.number().int().positive().default(10485760), // 10 MB
  RECEIPT_MAX_PAGES: z.coerce.number().int().positive().default(5),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

type Env = z.infer<typeof serverSchema>;

const parsed = serverSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  COLUMN_ENCRYPTION_KEY: process.env.COLUMN_ENCRYPTION_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  RECEIPT_MAX_BYTES: process.env.RECEIPT_MAX_BYTES,
  RECEIPT_MAX_PAGES: process.env.RECEIPT_MAX_PAGES,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  // Logging via console because pino isn't loaded at boot.
  console.error(
    'Invalid environment variables:',
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  throw new Error('Invalid environment variables — boot aborted.');
}

export const env: Env = parsed.data;
