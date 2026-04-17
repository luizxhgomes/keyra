import * as Sentry from '@sentry/nextjs';

import { env } from '@/lib/env';

/**
 * Next.js instrumentation hook — fires once per server runtime (Node + Edge).
 * Initializes Sentry per ADR-015.
 *
 * `instrumentation-client.ts` (alongside this file) initializes the browser
 * SDK so the bundle stays separate.
 */
export function register() {
  const dsn = env.SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      environment: env.NODE_ENV,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
      environment: env.NODE_ENV,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
