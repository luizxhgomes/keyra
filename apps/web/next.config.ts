import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 promoted `typedRoutes` out of `experimental`.
  typedRoutes: true,
  // EPIC-COMPROVANTES (comprovantes.2): libs nativas/WASM da normalização não
  // devem passar pelo bundler — carregadas via require em runtime, com seus
  // assets (.wasm do mupdf, binários do sharp) incluídos pelo file tracing.
  serverExternalPackages: ['sharp', 'mupdf', 'heic-convert', 'mammoth'],
  // Sentry / instrumentation hooks are auto-detected via instrumentation.ts.
  // Allow loading Lucide icons without bundle bloat.
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
  },
  // Rewrite estático: serve a sales page (apps/web/public/landing.html) sob /
  // sem expor a extensão .html. Não toca rotas autenticadas — `proxy.ts` segue
  // gating só os PROTECTED_PREFIXES.
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/landing.html',
      },
    ];
  },
  // /comecar foi a URL provisória da sales page; agora é a /. Mantemos um
  // 301 permanente para preservar links externos já compartilhados.
  async redirects() {
    return [
      {
        source: '/comecar',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

/**
 * Sentry build-time integration (Story 7.0.1).
 *
 * Wrappa o config Next para:
 *   1. Upload automático de source maps no build (resolve minified
 *      stacktraces em prod usando SENTRY_AUTH_TOKEN + ORG + PROJECT)
 *   2. Tunneling de requests Sentry via /monitoring (escapa adblockers)
 *   3. Tree-shaking de logger Sentry em prod (reduz bundle)
 *
 * Sem essas envs, o wrapper opera em modo NO-OP — não quebra build.
 */
export default withSentryConfig(nextConfig, {
  // Telemetria do plugin Sentry (silenciosa em CI)
  silent: !process.env.CI,

  // Org/project — lidos das envs em build-time. Spread condicional para
  // satisfazer `exactOptionalPropertyTypes` do TS quando a env var não
  // está setada localmente (build local sem Sentry env vars não quebra).
  ...(process.env.SENTRY_ORG ? { org: process.env.SENTRY_ORG } : {}),
  ...(process.env.SENTRY_PROJECT ? { project: process.env.SENTRY_PROJECT } : {}),
  ...(process.env.SENTRY_AUTH_TOKEN ? { authToken: process.env.SENTRY_AUTH_TOKEN } : {}),

  // Upload de source maps em production (inclui chunks do client)
  widenClientFileUpload: true,

  // Tunneling /monitoring para escapar adblockers do client
  tunnelRoute: '/monitoring',

  // Source maps: deleta após upload pra não vazar nos bundles públicos
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Tree-shake Sentry logger statements em prod
  disableLogger: true,

  // Auto-instrument Vercel Cron jobs (não usamos ainda mas barato manter)
  automaticVercelMonitors: true,
});
