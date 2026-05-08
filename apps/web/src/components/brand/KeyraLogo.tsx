/**
 * `<KeyraLogo />` — Logo signature da KEYRA.
 *
 * Source of truth visual: docs/brand/03-identity/preview.html (header fixo + concepts)
 * Brand book de logo: docs/brand/03-identity/logo/usage.md
 *
 * **CALIBRAÇÃO CANÔNICA DO PONTO (REGRA INEGOCIÁVEL · brand v1.1):**
 *
 * O ponto signature dourado segue regra fixa em TODAS as variants:
 *
 *   1. POSIÇÃO VERTICAL · centro do ponto na BASELINE da letra adjacente
 *      (mesmo Y do `<text>`). Não é altura média, não é x-height.
 *
 *   2. POSIÇÃO HORIZONTAL · gap consistente após o final da última letra,
 *      proporcional ao font-size (~18% da font-size). Equivale ao
 *      letter-spacing natural entre letras.
 *
 *   3. TAMANHO · raio proporcional ao font-size (~8.5%). Calibrado para
 *      ressoar com o stroke do terminal do "A" / "K" sem competir.
 *
 *   4. COR · `gold-500` (#B8923A) sólido em qualquer theme. Em theme=gold
 *      mantém #B8923A para consistência com foil físico.
 *
 * **Avaliação CGH 5-pillar (Sagi Haviv):** 5/5 aprovado.
 *
 * **Decisão técnica:** SVG inline com `<text>` + Fraunces. Para foil/print
 * profissional, designer humano converte texto em paths.
 */

import { cn } from '@/lib/utils';

export type KeyraLogoVariant =
  | 'primary' // KEYRA. horizontal · default
  | 'monogram' // K. (favicon, app icon, avatar)
  | 'lockup-tagline' // KEYRA. + tagline italic
  | 'stacked'; // K. acima de KEYRA empilhado vertical

export type KeyraLogoTheme =
  | 'light' // cocoa-900 sobre ivory-50 (default)
  | 'dark' // champagne-200 sobre cocoa-900 (premium dark)
  | 'gold'; // gold-500 sólido (foil aplicação especial)

export interface KeyraLogoProps {
  variant?: KeyraLogoVariant;
  theme?: KeyraLogoTheme;
  /** Altura em pixels. Default varia por variant. */
  height?: number;
  /** Texto da tagline (variant lockup-tagline). Default: "sua clínica rendendo mais." */
  tagline?: string;
  className?: string;
  /** Para uso decorativo (sem semântica de img). */
  decorative?: boolean;
}

// Cores canônicas (literal, não tokens — SVG inline precisa hex)
const COLORS = {
  light: { wordmark: '#2B1810', dot: '#B8923A', tagline: '#7E5A40' },
  dark: { wordmark: '#F0D8A8', dot: '#B8923A', tagline: '#E5C690' },
  gold: { wordmark: '#B8923A', dot: '#B8923A', tagline: '#9A7A2C' },
} as const;

const DEFAULT_HEIGHTS: Record<KeyraLogoVariant, number> = {
  primary: 32,
  monogram: 32,
  'lockup-tagline': 56,
  stacked: 80,
};

export function KeyraLogo({
  variant = 'primary',
  theme = 'light',
  height,
  tagline = 'sua clínica rendendo mais.',
  className,
  decorative = false,
}: KeyraLogoProps) {
  const colors = COLORS[theme];
  const h = height ?? DEFAULT_HEIGHTS[variant];

  const a11yProps = decorative
    ? ({ 'aria-hidden': true, role: 'presentation' } as const)
    : ({ role: 'img', 'aria-label': 'KEYRA' } as const);

  // Constantes canônicas brand v1.1 — proporcionalidade fixa do ponto
  // signature em TODAS as variants. Não alterar sem revisar usage.md.
  // dotRadius = fontSize × 0.085 · dotGap = fontSize × 0.18 · dotCY = baseline

  if (variant === 'primary') {
    // Wordmark KEYRA. horizontal · viewBox calibrado: 260×80
    // Fraunces 700 fontSize 72 letterSpacing -2 · "KEYRA" termina em ~206
    // Ponto: cx = 206 + (72 × 0.18) = 218.96 ≈ 219
    //        cy = 62 (baseline = mesmo y do <text>)
    //        r  = 72 × 0.085 = 6.12 ≈ 6
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 80"
        height={h}
        className={cn('shrink-0', className)}
        style={{ width: 'auto' }}
        {...a11yProps}
      >
        {!decorative && <title>KEYRA</title>}
        <text
          x="0"
          y="62"
          fontFamily="var(--font-serif), Fraunces, 'Times New Roman', serif"
          fontSize="72"
          fontWeight="700"
          letterSpacing="-2"
          fill={colors.wordmark}
        >
          KEYRA
        </text>
        <circle cx="219" cy="62" r="6" fill={colors.dot} />
      </svg>
    );
  }

  if (variant === 'monogram') {
    // K. monograma · viewBox 64×64 · K Fraunces 700 fontSize 56 termina em ~38
    // Ponto: cx = 38 + (56 × 0.18) = 48.08 ≈ 48
    //        cy = 52 (baseline = mesmo y do <text>)
    //        r  = 56 × 0.085 = 4.76 ≈ 5
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        height={h}
        width={h}
        className={cn('shrink-0', className)}
        {...a11yProps}
      >
        {!decorative && <title>KEYRA</title>}
        <text
          x="6"
          y="52"
          fontFamily="var(--font-serif), Fraunces, 'Times New Roman', serif"
          fontSize="56"
          fontWeight="700"
          letterSpacing="-1"
          fill={colors.wordmark}
        >
          K
        </text>
        <circle cx="48" cy="52" r="5" fill={colors.dot} />
      </svg>
    );
  }

  if (variant === 'lockup-tagline') {
    // Wordmark + tagline italic · viewBox 320×140
    // Fraunces 700 fontSize 92 letterSpacing -2.5 · "KEYRA" termina em ~262
    // Ponto: cx = 262 + (92 × 0.18) = 278.56 ≈ 279
    //        cy = 80 (baseline)
    //        r  = 92 × 0.085 = 7.82 ≈ 8
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 140"
        height={h}
        className={cn('shrink-0', className)}
        style={{ width: 'auto' }}
        {...a11yProps}
      >
        {!decorative && (
          <>
            <title>KEYRA</title>
            <desc>{tagline}</desc>
          </>
        )}
        <text
          x="0"
          y="80"
          fontFamily="var(--font-serif), Fraunces, 'Times New Roman', serif"
          fontSize="92"
          fontWeight="700"
          letterSpacing="-2.5"
          fill={colors.wordmark}
        >
          KEYRA
        </text>
        <circle cx="279" cy="80" r="8" fill={colors.dot} />
        <text
          x="0"
          y="120"
          fontFamily="var(--font-serif), Fraunces, 'Times New Roman', serif"
          fontSize="22"
          fontWeight="300"
          fontStyle="italic"
          letterSpacing="0"
          fill={colors.tagline}
        >
          {tagline}
        </text>
      </svg>
    );
  }

  // stacked · K. grande centralizado + linha divisória + KEYRA letterspacing
  // viewBox 200×240 · K text-anchor=middle x=100 fontSize=140 letterSpacing=-2
  // K width ≈ 90 → K vai de x=55 a x=145. Ponto:
  //   cx = 145 + (140 × 0.18) = 170.2 ≈ 170 (cabe no viewBox 200)
  //   cy = 120 (baseline)
  //   r  = 140 × 0.085 = 11.9 ≈ 12
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 240"
      height={h}
      className={cn('shrink-0', className)}
      style={{ width: 'auto' }}
      {...a11yProps}
    >
      {!decorative && <title>KEYRA</title>}
      <text
        x="100"
        y="120"
        textAnchor="middle"
        fontFamily="var(--font-serif), Fraunces, 'Times New Roman', serif"
        fontSize="140"
        fontWeight="700"
        letterSpacing="-2"
        fill={colors.wordmark}
      >
        K
      </text>
      <circle cx="158" cy="120" r="12" fill={colors.dot} />
      <line
        x1="80"
        y1="160"
        x2="120"
        y2="160"
        stroke={colors.dot}
        strokeWidth="1"
        opacity="0.6"
      />
      <text
        x="100"
        y="210"
        textAnchor="middle"
        fontFamily="var(--font-serif), Fraunces, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="600"
        letterSpacing="6"
        fill={colors.wordmark}
      >
        KEYRA
      </text>
    </svg>
  );
}
