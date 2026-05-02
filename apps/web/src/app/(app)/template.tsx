import type { ReactNode } from 'react';

/**
 * `template.tsx` — passthrough estável (Story 7.0.2 HOTFIX).
 *
 * Versão anterior (Story 6.2 AC2.7) usava `<m.div className="contents">`
 * com `routeTransition` (fade + rise 8px). Combinação produzia undefined
 * behavior: `display: contents` remove o elemento da árvore de
 * layout/paint, mas framer-motion ainda tenta aplicar `transform` /
 * `opacity` no nó. Em Safari iOS (e às vezes em Chromium pós-hidratação
 * Next 16/React 19), isso disparava o erro digest `3213099672` em TODAS
 * as rotas autenticadas — bloqueava a Camila no mobile.
 *
 * Hotfix: template vira passthrough puro, sem wrapper. Mantém o ciclo
 * de re-render por rota (intenção do template Next), zera animação.
 *
 * A animação de rota será reintroduzida em Story 7.x dedicada com
 * abordagem segura (AnimatePresence em wrapper de bloco real, sem
 * `display: contents`, validada com Sentry em prod).
 */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
