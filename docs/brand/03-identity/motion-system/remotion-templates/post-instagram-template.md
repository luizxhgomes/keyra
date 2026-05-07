# Template — Post Instagram (Animado)

> **Formato:** 1080×1350 (4:5 vertical)
> **Duração:** 6-12s
> **Inspiração visual:** prints 4-7, 10 das referências da idealizadora ("Benefícios do Botox", "Depilação a Laser", "Importância do Colágeno")

---

## Quando usar

Post Instagram da KEYRA institucional **ou** template para clínicas-cliente usarem (white-label de marca KEYRA).

Os 7 prints de referência da idealizadora são literalmente o look-and-feel:
- Headline serif gigante condensada
- Foto editorial de mulher real à direita ou esquerda
- Background sólido cor quente saturada (terracota, cocoa, âmbar)
- Detalhe sutil dourado opcional
- Mínima copia: título 2-4 palavras + sub opcional

---

## Variações de composição

| Variação | Background | Foto | Foco |
|----------|-----------|------|-----|
| `terracota-glow` | terracotta-600 | mulher cacheada cabelo solto | Calor, dia |
| `cocoa-drama` | cocoa-900 ou ink-950 | mulher madura olhos fechados | Drama, premium |
| `amber-sunset` | gradient amber-400 → terracotta-700 | mulher dançando/livre | Energia, libertação |
| `ivory-clean` | ivory-100 | mulher relaxada | Pureza, skincare |
| `cocoa-text-only` | cocoa-900 | sem foto | Educacional, drama puro |

---

## Sequência de animação (6s default — 180 frames @ 30fps)

```
Frame 0    Background fade-in (fade-quiet, 6 frames = 200ms)
Frame 12   Foto editorial entra (fade-up, 10 frames = 333ms)
Frame 30   Headline palavra 1 entra (fade-up + scale 0.96→1, 10 frames)
Frame 42   Headline palavra 2 entra (com weight diferente)
Frame 60   Sub-detalhe entra (Inter, baixo)
Frame 90   Hold completo (1s)
Frame 150  Optional: detalhe gold pulse (gold-shimmer, raríssimo — só em peça premium)
Frame 180  Loop ou fim
```

Para post **estático com pequena animação** (carrossel de slides estáticos), reduzir para 3s e remover gold-shimmer.

---

## Variáveis injetadas

```ts
type PostInstagramProps = {
  variation: "terracota-glow" | "cocoa-drama" | "amber-sunset" | "ivory-clean" | "cocoa-text-only";
  headline: {
    line1: string;       // ex: "BENEFÍCIOS"
    line1Weight: 200 | 300 | 600 | 700;
    line2: string;       // ex: "DO BOTOX"
    line2Weight: 200 | 300 | 600 | 700;
  };
  subline?: string;       // ex: "@keyra · blog" ou "@suaclinica"
  photoSrc?: string;      // path de foto editorial (sem foto na variação cocoa-text-only)
  photoPosition?: "left" | "right";
  hashtag?: string;
  ctaInstagram?: string;  // ex: "@suaclinica"
};
```

---

## Composition Remotion — esqueleto

```tsx
// apps/web/remotion/compositions/PostInstagram.tsx

import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

loadFraunces();
loadInter();

import { tokens } from "@/lib/brand-tokens"; // a criar — gerador de TS a partir de tokens.json

export const PostInstagram: React.FC<PostInstagramProps> = ({
  variation,
  headline,
  subline,
  photoSrc,
  photoPosition = "right",
  ctaInstagram,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // 30

  // Backgrounds por variação
  const bg = {
    "terracota-glow": tokens.color.terracotta[600],
    "cocoa-drama": tokens.color.cocoa[900],
    "amber-sunset": `linear-gradient(135deg, ${tokens.color.amber[400]}, ${tokens.color.terracotta[700]})`,
    "ivory-clean": tokens.color.ivory[100],
    "cocoa-text-only": tokens.color.cocoa[900],
  }[variation];

  const headlineColor = variation === "ivory-clean" ? tokens.color.cocoa[900] : tokens.color.ivory[50];
  const sublineColor = variation === "ivory-clean" ? tokens.color.bronze[500] : tokens.color.champagne[200];

  // Animations
  const fadeIn = (start: number, dur = 10) =>
    interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fadeUp = (start: number, dur = 10) => ({
    opacity: fadeIn(start, dur),
    transform: `translateY(${interpolate(frame, [start, start + dur], [8, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  return (
    <AbsoluteFill style={{ background: bg }}>
      {photoSrc && (
        <Img
          src={photoSrc}
          style={{
            position: "absolute",
            [photoPosition]: 0,
            top: 0,
            height: "100%",
            objectFit: "cover",
            ...fadeUp(12, 10),
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          [photoPosition === "right" ? "left" : "right"]: 60,
          top: "55%",
          transform: "translateY(-50%)",
        }}
      >
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: headline.line1Weight,
            fontSize: 88,
            lineHeight: 0.95,
            color: headlineColor,
            letterSpacing: "-0.02em",
            ...fadeUp(30, 10),
          }}
        >
          {headline.line1}
        </div>

        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: headline.line2Weight,
            fontSize: 88,
            lineHeight: 0.95,
            color: headlineColor,
            letterSpacing: "-0.02em",
            ...fadeUp(42, 10),
          }}
        >
          {headline.line2}
        </div>

        {subline && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: sublineColor,
              marginTop: 24,
              ...fadeUp(60, 10),
            }}
          >
            {subline}
          </div>
        )}
      </div>

      {ctaInstagram && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 16,
            ...fadeUp(60, 10),
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: tokens.color.bronze[400],
            }}
          />
          <div>
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: headlineColor }}>
              {ctaInstagram}
            </div>
            <div style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 11, color: sublineColor }}>
              {ctaInstagram.replace("@", "")}
            </div>
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
// remotion/Root.tsx
import { Composition } from "remotion";
import { PostInstagram } from "./compositions/PostInstagram";

export const RemotionRoot = () => (
  <Composition
    id="post-instagram"
    component={PostInstagram}
    durationInFrames={180}     // 6s @ 30fps
    fps={30}
    width={1080}
    height={1350}
    defaultProps={{
      variation: "terracota-glow",
      headline: { line1: "BENEFÍCIOS", line1Weight: 300, line2: "DO BOTOX", line2Weight: 700 },
      subline: "@SUACLINICA",
      photoPosition: "right",
    }}
  />
);
```

---

## Anti-padrões específicos para post Instagram

| Anti-padrão | Por quê |
|-------------|---------|
| Texto fora do safe area Instagram (centro 1080×1080) | Cropping em feed quadrado pode cortar |
| Vídeo > 60s | Instagram não permite em feed |
| Headline > 30 caracteres em duas linhas | Fica ilegível no thumbnail |
| Foto sem mulher real | Anti-direção das refs originais |
| Music alta volume | Usuário Instagram navega muted — som é bonus |
| Logo KEYRA gigante no centro | Ostentação. Logo só discreto no rodapé ou ausente (modo white-label) |
| Animação que conflita com o ritmo do reel | Deixe o background calmo se a foto/voz têm protagonismo |

---

## Próximos passos para tornar funcional

Quando implementar, criar:
1. `apps/web/remotion/index.tsx` — Remotion Studio entry
2. `apps/web/lib/brand-tokens.ts` — geração de tokens TS a partir do `tokens.json`
3. `apps/web/public/brand-assets/photos/` — fotos editoriais aprovadas
4. Script `pnpm remotion:render post-instagram` em `package.json`
