'use client';

import { useReducedMotion } from 'framer-motion';

/**
 * `useMotionPreference` (Story 6.2 P3) — wrapper sobre `useReducedMotion` do
 * framer-motion para uso semântico em componentes.
 *
 * SSR-safe: retorna `false` no server (motion habilitado no fallback) e o
 * valor real do system preference no client após mount.
 *
 * Componentes podem fazer:
 *
 * ```tsx
 * const reduceMotion = useMotionPreference();
 * const transition = reduceMotion ? { duration: 0 } : { duration: 0.2 };
 * ```
 *
 * **Não substitui** o `globals.css` (P4) que cobre animations Tailwind e
 * outras libs externas (sonner). É defesa em camadas.
 */
export function useMotionPreference(): boolean {
  return useReducedMotion() ?? false;
}
