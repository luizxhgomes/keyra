# Motion Tokens — KEYRA

> Tokens canônicos consumidos por CSS, Framer Motion, Remotion e qualquer outra ferramenta de animação. **Source of truth técnica:** `tokens.json` (chave `motion`). Este documento é a versão humana.

---

## 1. Durations

| Token | Valor | Quando usar |
|-------|-------|-------------|
| `instant` | **100ms** | Hover, focus, press de elementos clicáveis pequenos |
| `fast` | **200ms** | Toggle, micro-feedback, dismiss quiet |
| `base` | **320ms** | **Default** — reveal padrão, transição entre estados, page transition |
| `slow` | **480ms** | Reveal narrativo (KPI), modal entry, drawer |
| `cinematic` | **720ms** | Hero brand layer, intro de vídeo, drama editorial planejado |

**Regra de bolso:**
- ≤ 200ms → invisível ao consciente, percebido como "imediato"
- 320ms → fluido, editorial, default
- ≥ 480ms → percebido como "deliberado" — usar com intenção

---

## 2. Easings

### Curvas oficiais

| Token | cubic-bezier | Sensação | Uso |
|-------|--------------|----------|-----|
| `out-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | Editorial, fluido, calmo | **Default** — toda entrada |
| `in-out-editorial` | `cubic-bezier(0.65, 0, 0.35, 1)` | Simétrico, premium | Page transition, modal |
| `in-quiet` | `cubic-bezier(0.7, 0, 0.84, 0)` | Acelera no fim | Saída/dismiss |
| `out-bounce-subtle` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Pequeno overshoot | **Raríssimo** — só em sucesso premium (1-2 vezes por sessão) |

### Banidos
- `linear` — só para loading bar
- `ease` (CSS default) — sem caráter
- `ease-in` puro — entrada lenta + saída rápida = sensação errada
- Spring com tensão alta — bouncy demais

---

## 3. Distances

Translate Y/X usado em fades. Conservador.

| Token | Valor | Quando usar |
|-------|-------|-------------|
| `whisper` | **4px** | Toast dismiss, hover sutil |
| `small` | **8px** | Fade-up default, card aparecendo |
| `medium` | **16px** | Modal/drawer entry |
| `large` | **32px** | Page transition (slide subtle) |
| `dramatic` | **64px** | Hero brand layer reveal — só uso intencional |

---

## 4. Stagger

Atraso entre elementos sequenciais.

| Token | Valor | Quando usar |
|-------|-------|-------------|
| `tight` | **40ms** | Lista densa de itens (≥10) |
| `small` | **80ms** | Lista padrão (3-7 itens) |
| `medium` | **120ms** | Reveal narrativo de KPI (3 elementos: número/label/comparativo) |
| `large` | **160ms** | Drama editorial — só hero brand layer |

---

## 5. Scale ranges

Para `scale-in` / `scale-out`.

| Token | Valor inicial → final | Uso |
|-------|----------------------|-----|
| `quiet` | 0.98 → 1 | Hover sutil em card |
| `default` | 0.96 → 1 | Modal entry, card reveal |
| `pronounced` | 0.92 → 1 | Drama editorial (raro) |

**Banido:** scale > 1 em entrada (overshoot) exceto em `out-bounce-subtle` excepcional.

---

## 6. Opacity transitions

Sempre par com translate ou scale. **Nunca opacity sozinha** (vira fantasma).

| Padrão | Composição |
|--------|-----------|
| `fade-up` | opacity 0→1 + translateY(small)→0 |
| `fade-down` | opacity 0→1 + translateY(-small)→0 |
| `fade-scale` | opacity 0→1 + scale(default) |
| `fade-quiet` | opacity 0→1 + scale(quiet) |

---

## 7. Snippet de tokens em código

### CSS variables (a inserir em `apps/web/src/app/globals.css`)

```css
:root {
  /* Durations */
  --motion-duration-instant: 100ms;
  --motion-duration-fast: 200ms;
  --motion-duration-base: 320ms;
  --motion-duration-slow: 480ms;
  --motion-duration-cinematic: 720ms;

  /* Easings */
  --motion-easing-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-easing-in-out-editorial: cubic-bezier(0.65, 0, 0.35, 1);
  --motion-easing-in-quiet: cubic-bezier(0.7, 0, 0.84, 0);
  --motion-easing-out-bounce-subtle: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Distances */
  --motion-distance-whisper: 4px;
  --motion-distance-small: 8px;
  --motion-distance-medium: 16px;
  --motion-distance-large: 32px;

  /* Stagger */
  --motion-stagger-tight: 40ms;
  --motion-stagger-small: 80ms;
  --motion-stagger-medium: 120ms;
  --motion-stagger-large: 160ms;
}

/* Motion-reduced: respeitar prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-instant: 0ms;
    --motion-duration-fast: 0ms;
    --motion-duration-base: 0ms;
    --motion-duration-slow: 0ms;
    --motion-duration-cinematic: 0ms;
  }
}
```

### Framer Motion (a usar em `apps/web/src/components/`)

```tsx
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.32,
    ease: [0.22, 1, 0.36, 1], // out-soft
  },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 }, // small
  },
};
```

### Remotion (a usar em templates de vídeo)

```tsx
import { interpolate, useCurrentFrame, spring } from "remotion";

// Default fade-up para Remotion (30fps)
const FADE_UP = (frame: number, delay = 0) => ({
  opacity: interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: "clamp" }),
  transform: `translateY(${interpolate(frame, [delay, delay + 10], [8, 0], { extrapolateRight: "clamp" })}px)`,
});
```

(10 frames @ 30fps ≈ 333ms — equivalente a `base` 320ms)

---

## 8. Acessibilidade

`prefers-reduced-motion` é **obrigatório** em todo motion implementado. CSS já contempla via media query (snippet acima). Em Framer Motion, usar `useReducedMotion()`. Em Remotion (vídeo gerado), `prefers-reduced-motion` não se aplica — vídeo é mídia, não interação.

**Política KEYRA:** se a Camila prefere movimento reduzido, todo o app vira instantâneo (`duration: 0`). Sem fallback "menos animado" — ou tem motion completo, ou nada. Meio-termo confunde.

---

## 9. Validação

Toda implementação de motion no produto KEYRA passa por:

1. ✅ Usa duration de tokens (não número mágico)?
2. ✅ Usa easing de tokens?
3. ✅ Distance dentro dos tokens?
4. ✅ Respeita `prefers-reduced-motion`?
5. ✅ Não usa `spring` bouncy?
6. ✅ Hover aquece (cor mais quente, sombra warm), não esfria?
7. ✅ Stagger dentro dos tokens?

Se 1 falha → motion rejeitado.
