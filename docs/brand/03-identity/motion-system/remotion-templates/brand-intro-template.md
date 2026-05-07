# Template — Brand Intro (Logo Reveal)

> **Formatos:** 1920×1080 (16:9 horizontal) e 1080×1920 (9:16 vertical)
> **Duração:** 3-5s (90-150 frames @ 30fps)
> **Uso:** vinheta de abertura para vídeos institucionais, propostas comerciais em vídeo, segments de eventos.

---

## Quando usar

- Capa de vídeo de proposta comercial
- Abertura de webinar/aulao
- Bumper de podcast (3s)
- Stinger entre clipes em vídeo institucional
- Intro de Reels longo

**Quando NÃO usar:**
- Posts orgânicos curtos (gasta tempo precioso)
- UI do app (animação de splash deve ser instantânea)

---

## Sequência de animação (4s default — 120 frames @ 30fps)

```
0-15 frames (0-0.5s)
  Background ivory-50 já presente
  
15-45 frames (0.5-1.5s)
  Wordmark "KEYRA" entra letra a letra
  Stagger: 6 frames (200ms) entre letras
  K aparece — fade-up + scale 0.96→1
  E aparece (delay 6f)
  Y aparece (delay 12f)
  R aparece (delay 18f)
  A aparece (delay 24f)
  Cor: cocoa-900
  Fonte: Fraunces 600

45-60 frames (1.5-2s)
  Detalhe gold (linha sublinha o wordmark) entra
  fade-up + width 0%→100%
  duration: 15 frames (500ms)
  cor: gold-500

60-75 frames (2-2.5s)
  Tagline aparece sob o wordmark
  "sua clínica rendendo mais."
  fade-up
  Fraunces 200 italic, 24px
  cor: bronze-500

75-105 frames (2.5-3.5s)
  Hold completo
  Tudo respirando, sem movimento adicional

105-120 frames (3.5-4s)
  Tudo fade-quiet out (próxima cena entra)
```

---

## Variáveis injetadas

```ts
type BrandIntroProps = {
  format: "16:9" | "9:16";
  taglineOverride?: string;        // default "sua clínica rendendo mais."
  showTagline?: boolean;            // default true
  showGoldDetail?: boolean;         // default true
  duration?: number;                 // frames; default 120
};
```

---

## Composition Remotion — esqueleto

```tsx
// apps/web/remotion/compositions/BrandIntro.tsx

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
loadFraunces();

import { tokens } from "@/lib/brand-tokens";

export const BrandIntro: React.FC<BrandIntroProps> = ({
  format,
  taglineOverride = "sua clínica rendendo mais.",
  showTagline = true,
  showGoldDetail = true,
  duration = 120,
}) => {
  const frame = useCurrentFrame();
  const letters = "KEYRA".split("");

  const fadeUp = (start: number, dur = 10) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [8, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px) scale(${interpolate(frame, [start, start + dur], [0.96, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })})`,
  });

  // Outro fade
  const exitOpacity = interpolate(frame, [duration - 15, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: tokens.color.ivory[50],
        opacity: exitOpacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 0 }}>
        {letters.map((letter, i) => (
          <span
            key={i}
            style={{
              fontFamily: "Fraunces, serif",
              fontWeight: 600,
              fontSize: format === "16:9" ? 200 : 160,
              color: tokens.color.cocoa[900],
              letterSpacing: "-0.02em",
              ...fadeUp(15 + i * 6, 12),
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {showGoldDetail && (
        <div
          style={{
            height: 2,
            background: tokens.color.gold[500],
            marginTop: 16,
            width: `${interpolate(frame, [45, 60], [0, 200], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px`,
          }}
        />
      )}

      {showTagline && (
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontStyle: "italic",
            fontWeight: 200,
            fontSize: format === "16:9" ? 32 : 26,
            color: tokens.color.bronze[500],
            marginTop: 32,
            ...fadeUp(60, 15),
          }}
        >
          {taglineOverride}
        </div>
      )}
    </AbsoluteFill>
  );
};
```

---

## Composition config

```tsx
<Composition
  id="brand-intro-16-9"
  component={BrandIntro}
  durationInFrames={120}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    format: "16:9",
    taglineOverride: "sua clínica rendendo mais.",
    showTagline: true,
    showGoldDetail: true,
  }}
/>

<Composition
  id="brand-intro-9-16"
  component={BrandIntro}
  durationInFrames={120}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{
    format: "9:16",
    showTagline: true,
    showGoldDetail: true,
  }}
/>
```

---

## Variações canônicas

| Variação | Tagline | Cor base |
|----------|---------|----------|
| Default | "sua clínica rendendo mais." | ivory-50 + cocoa-900 |
| Apresentação comercial | "{Nome da clínica}" (personalizado) | ivory-50 + cocoa-900 |
| Premium dark | "" (sem tagline) | cocoa-900 + champagne-200 |
| Curto (3s) | sem tagline, sem detalhe gold | ivory-50 + cocoa-900 |

---

## Anti-padrões

| Anti-padrão | Por quê |
|-------------|---------|
| Logo aparecendo todo de uma vez | Sem drama; stagger letra a letra é o ponto |
| Wordmark girando 360° | Cliché anos 2000 |
| Faísca/spark animado ao redor do logo | Ostentação |
| Música stock épica | Bumper de 3s não comporta drama de filme |
| Logo + 5 elementos secundários | Em 4s não cabe; logo + tagline máximo |
| Cor diferente do cocoa-900 ou champagne-200 | Logo KEYRA tem 2 cores autorizadas (com gold como detalhe) |
