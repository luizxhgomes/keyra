import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  // Sentry / instrumentation hooks are auto-detected via instrumentation.ts.
  // Allow loading Lucide icons without bundle bloat.
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
  },
};

export default nextConfig;
