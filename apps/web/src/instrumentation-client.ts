import * as Sentry from '@sentry/nextjs';

import { scrubSensitiveFields } from '@/lib/observability/sentry-scrub';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  // Story auth.0 (R16): mesmo scrubbing aplicado no servidor, replicado no
  // cliente para erros que originam no browser (form input, fetch fail, etc.).
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend: scrubSensitiveFields,
  });
}

// Router transition tracing for App Router (added in Sentry SDK >= 9).
// Guarded by typeof check so v8 builds don't break.
type SentryWithTransitions = typeof Sentry & {
  captureRouterTransitionStart?: (...args: unknown[]) => void;
};
const sentryWithTransitions = Sentry as SentryWithTransitions;
export const onRouterTransitionStart =
  sentryWithTransitions.captureRouterTransitionStart ?? (() => {});
