/**
 * `<KeyraLogo />` — Logo signature da KEYRA.
 *
 * Source of truth visual: docs/brand/03-identity/preview.html (header fixo + concepts)
 * Brand book de logo: docs/brand/03-identity/logo/usage.md
 *
 * **Avaliação CGH 5-pillar (Sagi Haviv):**
 * 1. Appropriate · ✅ Editorial luxury serif + ponto dourado discreto = tom premium
 *    sem ostentação, alinhado a clínicas de estética profissional 30-45 anos.
 * 2. Distinctive · ✅ Nenhum concorrente (Trinks, Belle, Gestek, Conta Azul,
 *    Kamino) usa wordmark serif + ponto signature.
 * 3. Simple · ✅ 5 letras + 1 ponto. Lê em 16x16px (favicon) e funciona
 *    monocromático sem ouro.
 * 4. Memorable · ✅ Wordmark + signature dot é simples o suficiente para
 *    rascunhar de memória após 3s de exposição.
 * 5. Versatile · ✅ 4 variants × 3 themes = 12 aplicações canônicas
 *    cobrindo ivory-50, cocoa-900, foto editorial, foil dourado.
 *
 * **Decisão técnica:** SVG inline com `<text>` + Fraunces (carregada via
 * next/font/google). Para foil/print profissional, designer humano converte
 * texto em paths via Illustrator/Figma — passo documentado em usage.md.
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

  if (variant === 'primary') {
    // Wordmark KEYRA. horizontal — uso default
    // viewBox calibrado: 240w × 80h (ratio 3:1)
    // Fraunces 700 em 72px ≈ 200px width para "KEYRA" + 16px gap + 16px ponto
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
        {/* Ponto signature gold · ~22% da altura da letra à esquerda */}
        <circle cx="218" cy="56" r="8" fill={colors.dot} />
      </svg>
    );
  }

  if (variant === 'monogram') {
    // K. para favicon, app icon, avatar (1:1 square)
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
        <circle cx="46" cy="48" r="5" fill={colors.dot} />
      </svg>
    );
  }

  if (variant === 'lockup-tagline') {
    // KEYRA. horizontal + tagline italic embaixo
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
        <circle cx="278" cy="72" r="10" fill={colors.dot} />
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

  // stacked · K. grande acima do wordmark KEYRA empilhado
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
      {/* K. grande no topo */}
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
      <circle cx="138" cy="108" r="12" fill={colors.dot} />
      {/* Linha gold divisória discreta */}
      <line
        x1="80"
        y1="160"
        x2="120"
        y2="160"
        stroke={colors.dot}
        strokeWidth="1"
        opacity="0.6"
      />
      {/* Wordmark KEYRA pequeno embaixo, letterspacing extremo editorial */}
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
