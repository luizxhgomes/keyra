# Templates Remotion — Conteúdo Brand Layer

> Catálogo de templates **canônicos** que a skill `remotion-animator` consome para gerar vídeo respeitando a identidade KEYRA.

---

## Por que templates fixos

Sem template, cada vídeo é um improviso. Improviso quebra a marca.
Cada template aqui:
- Carrega **fontes** (Fraunces + Inter via `@remotion/google-fonts`)
- Carrega **cores** (importadas dos tokens — sem hex inline)
- Aplica **durations e easings** dos motion-tokens
- Aplica **voice-tone** correspondente ao formato

---

## Templates disponíveis

| Template | Formato | Duração típica | Uso |
|----------|---------|----------------|-----|
| [`post-instagram-template.md`](post-instagram-template.md) | 1080×1350 (4:5) | 6-12s | Post estático ou animado para feed Instagram (clínica usa) |
| [`kpi-reveal-template.md`](kpi-reveal-template.md) | 1080×1920 (9:16) | 8-15s | Reels institucional KEYRA mostrando KPI da clínica |
| [`audiogram-template.md`](audiogram-template.md) | 1080×1920 (9:16) ou 1080×1080 (1:1) | 30-60s | Depoimento da Camila com waveform editorial |
| [`brand-intro-template.md`](brand-intro-template.md) | 1920×1080 (16:9) ou 1080×1920 | 3-5s | Vinheta KEYRA logo reveal |

Todos esses templates seguem 6 regras:

1. **Fontes carregadas via @remotion/google-fonts** — Fraunces + Inter
2. **Cores apenas dos tokens** — `import { tokens } from '@/lib/brand-tokens'`
3. **Frame rate 30fps** — padrão Remotion
4. **Resolução conforme tabela** — não inventar
5. **Easings dos motion-tokens** — out-soft default
6. **Voice-tone aplicado** — copy passa por [voice-tone.md](../../voice-tone.md)

---

## Como invocar

```
1. Brand Chief identifica template apropriado
2. Skill remotion-animator é invocada com:
   - link para template específico (ex: post-instagram-template.md)
   - link para tokens.json
   - link para colors-manual.md
   - link para typography-system.md
   - link para voice-tone.md
   - copy/dados específicos do vídeo
3. Skill gera composition Remotion (.tsx)
4. Build → MP4 em diretório alvo
```

---

## Estrutura comum

Todo template documenta:

1. **Resolução e duração**
2. **Composition Remotion (TSX) — esqueleto**
3. **Variáveis injetadas** (copy, foto, KPI, etc.)
4. **Sequência de animação** (frame por frame ou por segundo)
5. **Cores e fontes específicas**
6. **Estados/variações permitidas**
7. **Anti-padrões para o template específico**

---

## Asset library

Imagens, fotos, vídeos de stock necessários ficam em:

```
apps/web/public/brand-assets/remotion/
├── photos/
│   └── (fotos editoriais aprovadas — diversidade etária e racial)
├── audio/
│   └── (depoimentos voz Camila, música stock aprovada)
└── compositions/
    └── (composições renderizadas exportadas)
```

(A criar quando o primeiro template for executado.)

---

## Validação de output

Todo MP4 gerado passa por:

1. ✅ Cores presentes batem tokens KEYRA (sem azul, sem verde neon, sem rosa)?
2. ✅ Fontes Fraunces + Inter renderizando corretamente?
3. ✅ Duração dentro da faixa do template?
4. ✅ Voice-tone respeitado (sem motivacional vazio, sem emoji animado)?
5. ✅ Resolução exata?
6. ✅ Logo KEYRA presente (rodapé, marca d'água ou frame final)?
7. ✅ Sound design (se houver) normalize -14 LUFS?

Se 1 falha → vídeo rejeitado, ajustar composition.
