/**
 * KEYRA · Brand Intro Composition (Remotion)
 *
 * Vinheta canônica de 4 segundos para abertura de vídeos institucionais,
 * propostas comerciais, intros de podcast e bumpers.
 *
 * Spec completa: docs/brand/03-identity/motion-system/remotion-templates/brand-intro-template.md
 *
 * Sequência (120 frames @ 30fps):
 *   0-15f  (0-0.5s):    Background ivory-50 já presente
 *   15-45f (0.5-1.5s):  Wordmark "KEYRA" entra letra a letra (stagger 6f)
 *                        K → fade-up + scale 0.96→1
 *                        E → idem (delay 6f)
 *                        Y, R, A → idem
 *   45-60f (1.5-2s):    Detalhe gold (sublinha) entra (width 0% → 100%)
 *   60-75f (2-2.5s):    Tagline italic aparece sob o wordmark
 *   75-105f (2.5-3.5s): Hold completo
 *   105-120f (3.5-4s):  Tudo fade-quiet out
 *
 * Cores:
 *   Background:  ivory-50 (#FAF6EE)
 *   Wordmark:    cocoa-900 (#2B1810)
 *   Gold detail: gold-500 (#B8923A)
 *   Tagline:     bronze-500 (#7E5A40)
 *
 * Story brand.8 do Epic BRAND-INTEGRATION.
 */

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces';

import { tokens } from '../lib/tokens';

// Carrega Fraunces do Google Fonts (Remotion gerencia ciclo de vida)
loadFraunces();

export type BrandIntroProps = {
  /** '16:9' (1920×1080) horizontal · '9:16' (1080×1920) vertical */
  format: '16:9' | '9:16';
  /** Tagline opcional sob o wordmark. Default: "sua clínica rendendo mais." */
  taglineOverride?: string;
  /** Mostrar tagline italic. Default: true */
  showTagline?: boolean;
  /** Mostrar sublinha gold. Default: true */
  showGoldDetail?: boolean;
  /** Frames totais. Default: 120 (4s @ 30fps) */
  duration?: number;
};

export const BrandIntro: React.FC<BrandIntroProps> = ({
  format,
  taglineOverride = 'sua clínica rendendo mais.',
  showTagline = true,
  showGoldDetail = true,
  duration = 120,
}) => {
  const frame = useCurrentFrame();
  const letters = 'KEYRA'.split('');

  // Helper: fade-up + scale entrada (motion-tokens canônicos KEYRA)
  const fadeUpScale = (start: number, dur = 12) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [8, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })}px) scale(${interpolate(frame, [start, start + dur], [0.96, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })})`,
  });

  // Outro: fade-quiet nos últimos 15 frames (princípio brandbook: dismiss-quiet)
  const exitOpacity = interpolate(frame, [duration - 15, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: tokens.color.ivory[50],
        opacity: exitOpacity,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Wordmark KEYRA — letra a letra com stagger 6f (200ms) */}
      <div style={{ display: 'flex', gap: 0 }}>
        {letters.map((letter, i) => (
          <span
            key={i}
            style={{
              fontFamily: tokens.fontFamily.serif,
              fontWeight: tokens.fontWeight.semibold,
              fontSize: format === '16:9' ? 200 : 160,
              color: tokens.color.cocoa[900],
              letterSpacing: '-0.02em',
              ...fadeUpScale(15 + i * 6, 12),
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Detalhe gold (sublinha) com width animado */}
      {showGoldDetail && (
        <div
          style={{
            height: 2,
            background: tokens.color.gold[500],
            marginTop: 16,
            width: `${interpolate(frame, [45, 60], [0, 200], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px`,
          }}
        />
      )}

      {/* Tagline italic Fraunces */}
      {showTagline && (
        <div
          style={{
            fontFamily: tokens.fontFamily.serif,
            fontStyle: 'italic',
            fontWeight: tokens.fontWeight.thin,
            fontSize: format === '16:9' ? 32 : 26,
            color: tokens.color.bronze[500],
            marginTop: 32,
            ...fadeUpScale(60, 15),
          }}
        >
          {taglineOverride}
        </div>
      )}
    </AbsoluteFill>
  );
};
