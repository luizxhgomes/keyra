import nextConfig from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * KEYRA ESLint flat config.
 *
 * Next 16 ships `eslint-config-next` as native flat-config arrays — no
 * FlatCompat shim needed (and in fact FlatCompat chokes on the v16 configs
 * due to a circular-refs issue when serializing plugins).
 *
 * Article VI (Absolute Imports) — we ban deep relative imports so contributors
 * always reach for `@/...`.
 */
const eslintConfig = [
  ...nextConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../*'],
              message:
                'Use absolute imports via @/* (Constitution Article VI). Deep relative imports are forbidden.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '*.tsbuildinfo'],
  },
];

export default eslintConfig;
