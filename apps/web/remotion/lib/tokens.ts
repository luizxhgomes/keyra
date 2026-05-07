/**
 * KEYRA Brand Tokens · TypeScript export para Remotion compositions.
 *
 * Source of truth: docs/brand/03-identity/tokens.json (DTCG)
 * Mapa canônico:   docs/brand/03-identity/PREVIEW-REFERENCE.md §4.2 + §4.5
 *
 * Use estes tokens em compositions Remotion para garantir coerência
 * com a marca KEYRA. Importar via `import { tokens } from '@/remotion/lib/tokens'`
 * (ou path relativo conforme tsconfig do Remotion).
 *
 * Story brand.8 do Epic BRAND-INTEGRATION.
 */

export const tokens = {
  color: {
    // Ivory & Sand — backgrounds warm
    ivory: { 50: '#FAF6EE', 100: '#F4EDE2' },
    sand: { 200: '#EAE0CF' },
    mocha: { 300: '#C8B49A' },

    // Bronze & Cocoa — texto e fundo dramático
    bronze: { 400: '#946640', 500: '#7E5A40' },
    cocoa: { 700: '#5A3E26', 800: '#3F2A1B', 900: '#2B1810' },
    ink: { 950: '#181210' },

    // Terracota & Âmbar — calor expressivo
    amber: { 300: '#E5B473', 400: '#D89A4D', 500: '#C8843A' },
    terracotta: { 500: '#C26832', 600: '#B8612B', 700: '#A05525' },
    rust: { 800: '#843E1A' },

    // Gold & Champagne — acento precioso
    champagne: { 200: '#F0D8A8' },
    gold: { 300: '#E5C690', 400: '#D4A752', 500: '#B8923A', 600: '#9A7A2C' },

    // Status (product layer)
    success: { leaf: '#6E8C5A', deep: '#4F6840' },
  },

  fontFamily: {
    serif: 'Fraunces, Times New Roman, serif',
    sans: 'Inter, -apple-system, Segoe UI, sans-serif',
  },

  fontWeight: {
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  motion: {
    // Durations em ms (Remotion converte para frames via fps)
    duration: {
      instant: 100,
      fast: 200,
      base: 320,
      slow: 480,
      cinematic: 720,
    },
    // Easings canônicos KEYRA (cubic-bezier)
    easing: {
      outSoft: [0.22, 1, 0.36, 1] as [number, number, number, number],
      inOutEditorial: [0.65, 0, 0.35, 1] as [number, number, number, number],
      inQuiet: [0.7, 0, 0.84, 0] as [number, number, number, number],
    },
  },
} as const;

/**
 * Helper: converte ms para frames @ fps.
 * Útil para usar tokens.motion.duration em props Remotion.
 */
export function msToFrames(ms: number, fps = 30): number {
  return Math.round((ms / 1000) * fps);
}
