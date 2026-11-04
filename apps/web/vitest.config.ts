import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Story 4.10 — runner mínimo para testes de cálculo puros (sem DOM, sem rede).
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
