# Template — KPI Reveal (Reels institucional)

> **Formato:** 1080×1920 (9:16 vertical Reels)
> **Duração:** 10s default (300 frames @ 30fps)
> **Aplicação direta do princípio UX:** "número absoluto protagonista" em formato vídeo.

---

## Quando usar

Reels institucional KEYRA mostrando ao mercado **prova de impacto**:
- "Esta clínica fez R$ 47.000 a mais este mês"
- "Em 90 dias, esta clínica recuperou R$ 23.000 que estavam vazando"
- "1 hora por semana economizada com fechamento automático"

Storytelling em 4 atos:
1. **Antes** (problema)
2. **Número-protagonista** (a prova)
3. **Contexto** (em quanto tempo)
4. **CTA discreto** (logo + handle)

---

## Sequência de animação (10s = 300 frames @ 30fps)

```
0-30 frames (0-1s)
  Background ivory-50 fade-in
  Sub headline editorial entra (Fraunces 200, fade-up)
  Texto: "Sua clínica" ou contexto setup

60-150 frames (2-5s)
  KPI número entra (kpi-reveal pattern, contagem)
  R$ 0 → R$ 47.000 com counter
  duração: 90 frames (3s) com easing out-soft
  fonte: Inter 700, tamanho clamp(160px, 18vw, 280px)
  cor: cocoa-900

180-240 frames (6-8s)
  Label aparece sob número (fade-up, delay)
  "RECEITA EXTRA NESTE MÊS"
  Inter 500 uppercase tracking 0.12em, 32px, bronze-500

210-270 frames (7-9s)
  Comparativo entra (mais delay)
  "vs. mês anterior" ou "em apenas 30 dias"
  Fraunces 300 italic, 36px, cocoa-700

270-300 frames (9-10s)
  Logo KEYRA aparece em fade-quiet, embaixo
  "keyra.app" em Inter 500 12px
```

---

## Variáveis injetadas

```ts
type KPIRevealProps = {
  setup: string;             // ex: "Sua clínica"
  kpiPrefix?: string;        // ex: "R$" ou ""
  kpiValue: number;          // ex: 47000 (counter anima de 0 a esse valor)
  kpiSuffix?: string;        // ex: "%" ou "h" ou nada
  label: string;             // ex: "RECEITA EXTRA NESTE MÊS"
  comparativo: string;       // ex: "vs. mês anterior" — em italic
  trend: "positive" | "negative"; // colore o número
  showLogo?: boolean;        // default true
};
```

---

## Composition Remotion — esqueleto

```tsx
// apps/web/remotion/compositions/KPIReveal.tsx

import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

loadFraunces();
loadInter();

import { tokens } from "@/lib/brand-tokens";

const formatBRL = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const KPIReveal: React.FC<KPIRevealProps> = ({
  setup,
  kpiPrefix = "R$",
  kpiValue,
  kpiSuffix,
  label,
  comparativo,
  trend = "positive",
  showLogo = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counter animation: from 0 to kpiValue between frames 60-150
  const counterValue = interpolate(frame, [60, 150], [0, kpiValue], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: t => 1 - Math.pow(1 - t, 4), // out-quart, similar a out-soft
  });

  const fadeUp = (start: number, dur = 10) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [8, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const kpiColor = trend === "positive" ? tokens.color.cocoa[900] : tokens.color.rust[800];
  const formattedKPI = kpiPrefix === "R$" ? formatBRL(counterValue) : `${counterValue.toFixed(0)}${kpiSuffix || ""}`;

  return (
    <AbsoluteFill style={{ background: tokens.color.ivory[50], padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 48 }}>
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 200,
            fontSize: 56,
            color: tokens.color.cocoa[700],
            letterSpacing: "-0.01em",
            ...fadeUp(0, 30),
          }}
        >
          {setup}
        </div>

        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 220,
            lineHeight: 1.0,
            color: kpiColor,
            fontFeatureSettings: '"tnum"',
            opacity: interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [60, 90], [0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          }}
        >
          {formattedKPI}
        </div>

        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: tokens.color.bronze[500],
            ...fadeUp(180, 20),
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 36,
            color: tokens.color.cocoa[700],
            ...fadeUp(210, 20),
          }}
        >
          {comparativo}
        </div>
      </div>

      {showLogo && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 16,
            ...fadeUp(270, 20),
          }}
        >
          {/* TODO: substituir por <KeyraLogo /> SVG quando logo for desenhado */}
          <div
            style={{
              fontFamily: "Fraunces, serif",
              fontWeight: 700,
              fontSize: 32,
              color: tokens.color.cocoa[900],
              letterSpacing: "-0.01em",
            }}
          >
            KEYRA
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              color: tokens.color.bronze[500],
            }}
          >
            usekeyra.com
          </div>
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
  id="kpi-reveal"
  component={KPIReveal}
  durationInFrames={300}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{
    setup: "Sua clínica",
    kpiPrefix: "R$",
    kpiValue: 47000,
    label: "RECEITA EXTRA NESTE MÊS",
    comparativo: "vs. mês anterior",
    trend: "positive",
    showLogo: true,
  }}
/>
```

---

## Variações canônicas

| Variação | KPI Value | Label | Comparativo |
|----------|-----------|-------|-------------|
| Receita extra | R$ 47.000 | "RECEITA EXTRA NESTE MÊS" | "vs. mês anterior" |
| Recuperação de vazamento | R$ 23.000 | "RECUPERADOS EM 90 DIAS" | "que estavam vazando" |
| Tempo economizado | 12h | "ECONOMIZADAS POR SEMANA" | "no fechamento automático" |
| Margem ganha | 8% | "DE MARGEM RECUPERADA" | "em pacotes que vazavam" |

---

## Anti-padrões

| Anti-padrão | Por quê |
|-------------|---------|
| KPI com casas decimais arbitrárias (R$ 47.123,87) | Difícil de ler em motion; arredondar para milhar |
| Cor verde puro para positive | Verde neon não é da paleta; usar `cocoa-900` (neutro) ou `success-leaf` em badge |
| Música stock genérica | Use silêncio ou voz off/da Camila |
| Animação > 12s | Reels engajam até 8-10s; corte cedo |
| Counter spring-bouncy | Easing out-quart/out-soft, sem bounce |
