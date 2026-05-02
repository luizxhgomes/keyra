'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';

import { variants } from '@/lib/motion/tokens';

/**
 * `template.tsx` (Story 6.2 AC2.7) — re-renderizado a cada navegação dentro
 * do route group `(app)`. Diferente de `layout.tsx` (que persiste), `template`
 * cria um nó novo a cada rota → permite que `initial`/`animate` do framer-motion
 * disparem em cada troca.
 *
 * Anima o conteúdo da rota com `routeTransition` (fade + rise 8px, 400ms,
 * expo-out). Cap 400ms é exceção do princípio "300ms" porque rota é
 * transição estrutural (mais visível) — pesquisa Linear/Notion mostra
 * 300-450ms como zona de conforto pra rota.
 *
 * Reduced-motion é coberto pelo CSS global em `globals.css` (P4) +
 * framer-motion respeita `useReducedMotion` automaticamente nas variants.
 */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return (
    <m.div
      variants={variants.routeTransition}
      initial="hidden"
      animate="visible"
      className="contents"
    >
      {children}
    </m.div>
  );
}
