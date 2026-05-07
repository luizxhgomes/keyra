# Template — Audiogram (Depoimento + Caption editorial)

> **Formatos:** 1080×1920 (9:16 Reels) ou 1080×1080 (1:1 feed)
> **Duração:** 30-60s
> **Aplicação:** depoimento da Camila falando sobre sua experiência com KEYRA, com waveform + caption progressiva.

---

## Quando usar

- Depoimento de cliente real (idealizadora ou outras donas de clínica)
- Voz da especialista falando dado de mercado
- Trechos de podcast/lives republicados em formato Reels

**Por que audiogram funciona pra KEYRA:**
- Voz humana > B-roll genérico para B2B confiança
- Caption permite consumo silenciado (Instagram default)
- Waveform editorial em ouro/cocoa = visual da marca
- Tipografia editorial em caption reforça brand layer

---

## Sequência de animação (45s = 1350 frames @ 30fps)

```
0-30 frames (0-1s)
  Background fade-in
  Foto editorial da Camila (à esquerda) entra com fade-up
  Logo KEYRA pequeno no rodapé (fade-quiet)

30-60 frames (1-2s)
  Caption setup entra ("Camila Aquino · Estética Aquino")
  Waveform editorial inicia rendering (gold-500 sobre cocoa-900)

60-1290 frames (2-43s)
  Audio toca
  Waveform animada (frame-by-frame conforme amplitude)
  Caption progressiva: palavra a palavra com fade-up rápido (~2-3 palavras por linha)
  Linhas de caption rotam (FIFO) - máximo 2 linhas visíveis simultaneamente

1290-1350 frames (43-45s)
  Final: caption fade-quiet
  Waveform fade-quiet
  CTA aparece: "@keyra.app · usekeyra.com" (Fraunces 200 italic + Inter 500)
```

---

## Variáveis injetadas

```ts
type AudiogramProps = {
  audioSrc: string;             // path do MP3/WAV
  durationSec: number;
  speakerName: string;          // ex: "Camila Aquino"
  speakerSubtitle?: string;     // ex: "Estética Aquino, SP"
  speakerPhoto: string;         // path foto
  captions: Array<{
    start: number;              // segundo de início
    end: number;
    text: string;
  }>;
  waveformData: number[];       // amplitude por frame (gerado prévio)
  format: "9:16" | "1:1";
};
```

---

## Composition Remotion — esqueleto

```tsx
// apps/web/remotion/compositions/Audiogram.tsx

import { AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

loadFraunces();
loadInter();

import { tokens } from "@/lib/brand-tokens";

export const Audiogram: React.FC<AudiogramProps> = ({
  audioSrc,
  speakerName,
  speakerSubtitle,
  speakerPhoto,
  captions,
  waveformData,
  format,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const currentSec = frame / fps;
  const activeCaption = captions.find(c => currentSec >= c.start && currentSec < c.end);
  const previousCaption = captions
    .filter(c => c.end <= currentSec)
    .sort((a, b) => b.end - a.end)[0];

  const fadeUp = (start: number, dur = 10) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [8, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  return (
    <AbsoluteFill style={{ background: tokens.color.cocoa[900] }}>
      <Audio src={audioSrc} />

      {/* Foto da speaker */}
      <Img
        src={speakerPhoto}
        style={{
          position: "absolute",
          left: format === "9:16" ? 60 : 80,
          top: format === "9:16" ? 200 : "10%",
          width: format === "9:16" ? 280 : 320,
          height: format === "9:16" ? 280 : 320,
          borderRadius: 16,
          objectFit: "cover",
          ...fadeUp(0, 30),
        }}
      />

      {/* Speaker info */}
      <div
        style={{
          position: "absolute",
          left: format === "9:16" ? 60 : 80,
          top: format === "9:16" ? 520 : "55%",
          ...fadeUp(30, 20),
        }}
      >
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 600,
            fontSize: 36,
            color: tokens.color.champagne[200],
          }}
        >
          {speakerName}
        </div>
        {speakerSubtitle && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 18,
              color: tokens.color.bronze[400],
              marginTop: 4,
            }}
          >
            {speakerSubtitle}
          </div>
        )}
      </div>

      {/* Waveform editorial */}
      <div
        style={{
          position: "absolute",
          bottom: format === "9:16" ? 380 : 200,
          left: 60,
          right: 60,
          height: 120,
          display: "flex",
          alignItems: "center",
          gap: 4,
          ...fadeUp(30, 20),
        }}
      >
        {waveformData.slice(Math.max(0, frame - 60), frame).map((amp, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${Math.max(8, amp * 100)}%`,
              background: tokens.color.gold[500],
              borderRadius: 2,
              opacity: 0.4 + (i / 60) * 0.6,
            }}
          />
        ))}
      </div>

      {/* Caption editorial */}
      <div
        style={{
          position: "absolute",
          bottom: format === "9:16" ? 200 : 80,
          left: 60,
          right: 60,
        }}
      >
        {activeCaption && (
          <div
            style={{
              fontFamily: "Fraunces, serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 32,
              lineHeight: 1.4,
              color: tokens.color.ivory[50],
              ...fadeUp(0, 6),
            }}
          >
            {activeCaption.text}
          </div>
        )}
        {previousCaption && !activeCaption && (
          <div
            style={{
              fontFamily: "Fraunces, serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 32,
              lineHeight: 1.4,
              color: tokens.color.bronze[400],
              opacity: 0.6,
            }}
          >
            {previousCaption.text}
          </div>
        )}
      </div>

      {/* Logo KEYRA discreto */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 60,
          fontFamily: "Fraunces, serif",
          fontWeight: 600,
          fontSize: 18,
          color: tokens.color.gold[500],
          letterSpacing: "0.04em",
        }}
      >
        KEYRA
      </div>
    </AbsoluteFill>
  );
};
```

---

## Pré-processamento de áudio

Antes de gerar audiogram:

1. **Edição de voz:**
   - Limpar respiração, ums, ahs
   - Equalizar (cortar abaixo de 80Hz, presence boost em 3kHz)
   - Compressor 4:1 com makeup gain
   - Normalize para -14 LUFS (padrão Instagram)

2. **Geração de captions:**
   - Use Whisper API ou serviço equivalente
   - Edite manualmente para pt-BR correto (acentuação)
   - Quebre em linhas de 6-8 palavras max

3. **Waveform extraction:**
   - Use script Node `wavefile` ou `ffmpeg` para extrair amplitude por frame
   - Salvar em JSON: `[0.12, 0.34, 0.56, ...]` por frame de 30fps
   - Suavizar (moving average de 3 frames) para visual mais editorial

---

## Anti-padrões para audiogram

| Anti-padrão | Por quê |
|-------------|---------|
| Waveform colorida arco-íris | KEYRA é monocromática warm; ouro sobre cocoa, ponto |
| Caption all caps | Cansativo em texto longo; KEYRA usa caps só em label |
| Animação que pisca a cada palavra | Cansa; só fade-up suave |
| Música de fundo competindo com voz | Voz tem prioridade; música -20dB max |
| Sem CTA no final | Audiogram deve sempre fechar com onde encontrar |
| Logo gigante centralizado durante audiogram | Distrai; logo discreto no canto |
