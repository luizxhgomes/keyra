import type { Variants } from 'framer-motion';

/**
 * Motion tokens KEYRA (Story 6.2 P2) — durations, easings, springs e variants
 * pré-definidas para os 12 momentos canônicos.
 *
 * Princípio: "motion como informação, não decoração". Cap de duração `<= 300ms`
 * exceto `route` (`400ms`) e `pulseOnce` (`1500ms` — atenção pontual, não loop).
 *
 * **Pattern obrigatório (P5):** sempre que um valor numérico mudar (KPI,
 * contador), envolver em `<AnimatePresence mode="wait">` com `key={value}`
 * para forçar fade-out completo antes do fade-in. **Nunca** animar morphing
 * entre valores — princípio CON-UX-01 inegociável proíbe transições visuais
 * ambíguas em números (poderia parecer percentual ou intermediário).
 *
 * **Anti-pattern (G2/AC2.12):** nunca animar `margin`, `padding`, `width` ou
 * `height` — usa `transform` (`translate`, `scale`, `rotate`) para evitar
 * reflow. Tokens de spacing da Sprint 5.5 ficam intactos durante animação.
 */

export const durations = {
  fast: 0.15, // KPI muda, hover state, micro-feedback
  base: 0.2, // Default — entrada/saída de componentes pequenos
  slow: 0.3, // Alert crítico, EmptyState, modais
  route: 0.4, // Troca de rota — exceção do cap
  pulseOnce: 1.5, // Atenção pontual em alerta crítico (1 ciclo só)
} as const;

export const easings = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number], // expo-out — entrada
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number], // ease custom — transições
} as const;

export const springs = {
  subtle: { type: 'spring' as const, stiffness: 400, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 600, damping: 25 },
} as const;

/**
 * Variantes pré-definidas — encaixam nos 12 momentos canônicos da Story 6.2.
 * Usar via `<m.div variants={variants.fadeRise} initial="hidden" animate="visible" />`.
 *
 * `satisfies Record<string, Variants>` em vez de cast preserva o tipo literal
 * de cada chave (ex.: `variants.fadeRise` retorna `Variants`, não
 * `Variants | undefined` que o `exactOptionalPropertyTypes` rejeitaria).
 */
export const variants = {
  fadeRise: {
    hidden: { opacity: 0, y: 4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.base, ease: easings.out },
    },
  },
  fadeRiseSlow: {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.slow, ease: easings.out },
    },
  },
  fadeRiseExitUp: {
    hidden: { opacity: 0, y: 4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.base, ease: easings.out },
    },
    exit: {
      opacity: 0,
      y: -4,
      transition: { duration: durations.fast, ease: easings.out },
    },
  },
  subtleScale: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.04, 1],
      transition: { duration: durations.base, ease: easings.inOut },
    },
  },
  routeTransition: {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.route, ease: easings.out },
    },
  },
  slideInDown: {
    hidden: { opacity: 0, y: -12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.slow, ease: easings.out },
    },
  },
  /**
   * `pulseOnce` — atenção pontual em 1 ciclo (NÃO loop). Aplicar em
   * elementos isolados que precisam de atenção (ex.: DRE netProfit
   * negativo). Para AlertCard critical, prefira `criticalEntrance`
   * (combina slideInDown + pulse sequencial).
   */
  pulseOnce: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: { duration: durations.pulseOnce, ease: easings.inOut },
    },
  },
  /**
   * `criticalEntrance` (Story 6.2 AC2.4 + AC2.11) — slideInDown + pulseOnce
   * sequencial em uma única variant. Usado em AlertCard severity=critical.
   *
   * Sequência:
   * - 0-300ms: opacity 0→1, y -12→0 (slide-in-down)
   * - 300-1800ms: scale 1→1.02→1 (pulse uma vez, NÃO loop)
   *
   * Total: 1.8s de atenção pontual. Cap excepcional permitido em AC4 porque
   * `pulseOnce` é "atenção pontual, não loop".
   */
  criticalEntrance: {
    hidden: { opacity: 0, y: -12, scale: 1 },
    visible: {
      opacity: 1,
      y: 0,
      scale: [1, 1.02, 1],
      transition: {
        opacity: { duration: durations.slow, ease: easings.out },
        y: { duration: durations.slow, ease: easings.out },
        scale: {
          duration: durations.pulseOnce,
          ease: easings.inOut,
          delay: durations.slow,
        },
      },
    },
  },
  /**
   * `staggerContainer` — wrapper que cadencia entrada de filhos
   * (sheet de agendamento — AC2.3). `staggerChildren: 0.06`.
   */
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  },
} satisfies Record<string, Variants>;
