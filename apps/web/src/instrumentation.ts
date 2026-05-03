import * as Sentry from '@sentry/nextjs';

import { env } from '@/lib/env';
import { scrubSensitiveFields } from '@/lib/observability/sentry-scrub';

/**
 * Next.js instrumentation hook — fires once per server runtime (Node + Edge).
 * Initializes Sentry per ADR-015.
 *
 * `instrumentation-client.ts` (alongside this file) initializes the browser
 * SDK so the bundle stays separate.
 *
 * Story auth.0 (R16): hook `beforeSend` aplica `scrubSensitiveFields` para
 * remover senhas, tokens, CPF e telefone de qualquer evento antes de sair pra
 * Sentry. Sem isto, Server Actions que falham com input no contexto vazariam
 * PII pro dashboard.
 */
export function register() {
  const dsn = env.SENTRY_DSN;
  if (!dsn) return;

  const sharedConfig = {
    dsn,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: env.NODE_ENV,
    beforeSend: scrubSensitiveFields,
  } as const;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init(sharedConfig);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(sharedConfig);
  }
}

export const onRequestError = Sentry.captureRequestError;
