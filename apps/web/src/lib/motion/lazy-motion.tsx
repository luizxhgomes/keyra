'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * `<MotionProvider>` (Story 6.2 P1) — wrapper LazyMotion + domAnimation.
 *
 * `LazyMotion` reduz a API surface do framer-motion de ~50KB para ~21KB
 * (`domAnimation` cobre fade/slide/scale/AnimatePresence — suficiente
 * para os 12 momentos canônicos da KEYRA). Sem `domMax`, sem layout
 * animations (não precisamos de FLIP nem reorder).
 *
 * Componentes filhos usam `<m.div>` ao invés de `<motion.div>` para
 * encaixar no LazyMotion. `strict` força erro de runtime se alguém
 * importar `motion` em vez de `m` — guarda contra regressão de bundle.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
