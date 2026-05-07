# Remotion · KEYRA Brand Layer Video

Compositions Remotion da KEYRA para gerar vídeo brand layer programaticamente: vinhetas de logo, posts Instagram animados, KPI reveals em vídeo, audiograms editoriais.

> **Status:** Story brand.8 (Epic BRAND-INTEGRATION) entregou a estrutura mínima. Deps Remotion são **opt-in** (não fazem parte do build padrão do Next.js).

---

## Setup

### 1. Instalar dependências (uma vez por máquina)

```bash
cd apps/web
pnpm add remotion@^4 @remotion/cli@^4 @remotion/google-fonts@^4
```

> ⚠️ Remotion baixa um Chromium headless (~300MB) na primeira execução. Não rode em CI a não ser que necessário.

### 2. Adicionar scripts no `package.json` da `apps/web`

```json
{
  "scripts": {
    "remotion:studio": "remotion studio remotion/index.ts",
    "remotion:render:intro:16-9": "remotion render remotion/index.ts brand-intro-16-9 out/brand-intro-16-9.mp4",
    "remotion:render:intro:9-16": "remotion render remotion/index.ts brand-intro-9-16 out/brand-intro-9-16.mp4"
  }
}
```

### 3. Validar setup

```bash
pnpm remotion:studio
```

Abre `http://localhost:3000` (ou porta livre) com Remotion Studio. Você verá `brand-intro-16-9` e `brand-intro-9-16` listados.

---

## Compositions disponíveis

### `brand-intro-16-9` (1920×1080, 4s)
Vinheta horizontal para abertura de propostas comerciais, vídeos institucionais e bumpers de podcast.

### `brand-intro-9-16` (1080×1920, 4s)
Vinheta vertical para Reels, Stories e TikTok.

**Sequência canônica (120 frames @ 30fps):**

| Frames | Tempo | Evento |
|---|---|---|
| 0-15 | 0-0.5s | Background ivory-50 já presente |
| 15-45 | 0.5-1.5s | Wordmark "KEYRA" letra a letra (stagger 6f / 200ms) |
| 45-60 | 1.5-2s | Detalhe gold sublinha (width 0% → 100%) |
| 60-75 | 2-2.5s | Tagline italic aparece |
| 75-105 | 2.5-3.5s | Hold completo |
| 105-120 | 3.5-4s | Fade-quiet out (princípio brandbook dismiss-quiet) |

---

## Tokens KEYRA

`lib/tokens.ts` exporta a palette canônica + motion tokens tipados em TypeScript.

```ts
import { tokens, msToFrames } from './lib/tokens';

// Cores
tokens.color.cocoa[900];        // '#2B1810'
tokens.color.gold[500];         // '#B8923A' — signature
tokens.color.ivory[50];         // '#FAF6EE'

// Tipografia
tokens.fontFamily.serif;        // 'Fraunces, Times New Roman, serif'
tokens.fontWeight.semibold;     // 600

// Motion (ms → frames)
const fadeFrames = msToFrames(tokens.motion.duration.base); // 320ms → 10 frames @ 30fps
```

**Source of truth:** `docs/brand/03-identity/tokens.json` (DTCG).

---

## Templates futuros (planejados)

A próxima expansão da pasta `compositions/` vai entregar:

- `PostInstagram.tsx` — 1080×1350 (4:5) com headline serif gigante + foto editorial
- `KPIReveal.tsx` — 1080×1920 (9:16) Reel mostrando KPI com counter from 0
- `Audiogram.tsx` — depoimento da Camila com waveform editorial em ouro

Specs canônicas em `docs/brand/03-identity/motion-system/remotion-templates/`.

---

## Decisão arquitetural

**Por que `apps/web/remotion/` é excluído do tsconfig do Next?**

Para isolar Remotion do build do Next.js. Remotion é uma ferramenta separada (gera MP4, não JS para o navegador). Se Remotion fosse incluído no tsconfig do Next, o build tentaria bundle código que não roda no browser.

**Por que deps são opt-in (não obrigatórias)?**

Para preservar:
1. **Velocidade do CI:** evita download de Chromium headless (~300MB) em cada PR
2. **Bundle size do Next:** Remotion não é dependência do app, é uma ferramenta de build separada
3. **Onboarding:** novos devs não precisam baixar 300MB para rodar `pnpm dev`

Quem precisar gerar vídeo brand layer instala localmente e usa `remotion:studio` ou `remotion:render`.

---

## Reference

- `docs/brand/03-identity/preview.html` (brandbook executável)
- `docs/brand/03-identity/PREVIEW-REFERENCE.md` (mapa canônico)
- `docs/brand/03-identity/motion-system/` (6 docs + 4 templates Remotion)
- `docs/brand/03-identity/tokens.json` (DTCG single source of truth)
