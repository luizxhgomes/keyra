import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 promoted `typedRoutes` out of `experimental`.
  typedRoutes: true,
  // Sentry / instrumentation hooks are auto-detected via instrumentation.ts.
  // Allow loading Lucide icons without bundle bloat.
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
  },
  // TODO(Story 1.3): Next 16 deprecated `middleware.ts` in favor of `proxy.ts`.
  // Rename when we next touch the middleware, and verify @supabase/ssr wiring still works.
};

export default nextConfig;
