# Story brand.8: Remotion setup + Brand Intro template (4s vinheta canônica)

## Status

Done · PR #19 squash mergeado em main (`f48325b`) em 2026-05-07. **Última do Epic BRAND-INTEGRATION (8/8 · 100%).**

## Implementação executada (resumo)

Estrutura `apps/web/remotion/` com:
- **lib/tokens.ts**: palette KEYRA tipada em TypeScript + helper `msToFrames(ms, fps=30)`
- **compositions/BrandIntro.tsx**: vinheta 4s (120 frames @ 30fps) — sequência canônica wordmark letra a letra (stagger 6f), gold sublinha animada, tagline italic Fraunces, fade-quiet out
- **Root.tsx**: 2 compositions registradas (`brand-intro-16-9` 1920×1080, `brand-intro-9-16` 1080×1920)
- **index.ts**: registerRoot entry
- **README.md**: setup completo + scripts pnpm + decisão arquitetural

**Decisão arquitetural:** deps Remotion são opt-in (não obrigatórias) para preservar velocidade do CI (Chromium ~300MB) e bundle do Next intocado. `tsconfig.json` exclui `remotion/`, `eslint.config.mjs` ignora `remotion/**`.

**Validação técnica:** typecheck verde · lint zero warnings · build verde (38 rotas, bundle Next intocado) · RSC PASS · Cross-tenant PASS · Vercel SUCCESS · 7 arquivos · +423 linhas.

---

## Story

**Como** Luiz (operador da marca KEYRA),
**Eu quero** que o `apps/web` tenha Remotion configurado e funcional, com o primeiro template (`Brand Intro` 3-5s) renderizando MP4 corretamente respeitando os tokens KEYRA,
**Para que** eu possa usar a skill `remotion-animator` para gerar vídeos brand layer (posts Instagram, Reels, audiograms, intros de proposta) sem improvisar identidade.

## Complexidade

**T-shirt:** M (~5 pontos)

## Contexto

A Brand Identity v1.0 (2026-05-07) inclui motion system completo e 4 templates Remotion canônicos em [`docs/brand/03-identity/motion-system/remotion-templates/`](../brand/03-identity/motion-system/remotion-templates/):
- `post-instagram-template.md`
- `kpi-reveal-template.md`
- `audiogram-template.md`
- `brand-intro-template.md`

Os templates são **especificações** — código TSX já está documentado nos arquivos. Esta story aterrissa a infraestrutura Remotion no monorepo + implementa **apenas o `brand-intro-template`** como prova de conceito (mais simples dos 4, sem fotos/áudio).

Templates restantes ficam para stories futuras à medida que houver demanda (ex.: campanha que precisa de post Instagram, depoimento que vira audiogram).

## Acceptance Criteria

### AC1 — Dependências Remotion instaladas

Em `apps/web/package.json`:

```json
{
  "dependencies": {
    "remotion": "^4.x",
    "@remotion/cli": "^4.x",
    "@remotion/google-fonts": "^4.x"
  },
  "scripts": {
    "remotion:studio": "remotion studio",
    "remotion:render:brand-intro:16-9": "remotion render brand-intro-16-9 out/brand-intro-16-9.mp4",
    "remotion:render:brand-intro:9-16": "remotion render brand-intro-9-16 out/brand-intro-9-16.mp4"
  }
}
```

### AC2 — Estrutura `apps/web/remotion/`

```
apps/web/remotion/
├── index.tsx                      ← entry Remotion
├── Root.tsx                       ← compositions registradas
├── compositions/
│   └── BrandIntro.tsx             ← implementa brand-intro-template.md
└── lib/
    └── tokens.ts                  ← exporta tokens KEYRA tipados
```

### AC3 — `apps/web/remotion/lib/tokens.ts`

Gerar TypeScript types a partir de `docs/brand/03-identity/tokens.json` (ou hardcode subset essencial). Estrutura:

```ts
export const tokens = {
  color: {
    ivory: { 50: "#FAF6EE", 100: "#F4EDE2" },
    cocoa: { 700: "#5A3E26", 800: "#3F2A1B", 900: "#2B1810" },
    bronze: { 400: "#946640", 500: "#7E5A40" },
    champagne: { 200: "#F0D8A8" },
    gold: { 400: "#D4A752", 500: "#B8923A", 600: "#9A7A2C" },
    // … ver tokens.json completo
  },
} as const;
```

Esse arquivo é **a única fonte de cores em código Remotion** — proibido hex inline.

### AC4 — `BrandIntro.tsx` implementado

Implementar conforme [`brand-intro-template.md`](../brand/03-identity/motion-system/remotion-templates/brand-intro-template.md):
- Carrega Fraunces via `@remotion/google-fonts/Fraunces`
- 4s default (120 frames @ 30fps)
- Stagger letra a letra (K-E-Y-R-A) com `fade-up + scale 0.96→1`
- Detalhe gold sublinha aparece em t=1.5s
- Tagline italic entra em t=2s
- Fade-out em t=3.5s
- 2 composition variants registradas: `brand-intro-16-9` (1920×1080) e `brand-intro-9-16` (1080×1920)

### AC5 — Render funciona

```bash
pnpm remotion:render:brand-intro:16-9
pnpm remotion:render:brand-intro:9-16
```

Geram MP4 em `apps/web/remotion/out/`. Output é commitado em `apps/web/public/brand-assets/intros/` (somente os MP4 finais — não os intermediários).

### AC6 — Validação visual

- MP4 horizontal (16:9) renderiza KEYRA letra a letra com stagger correto
- Cores batem com tokens (cocoa-900, gold-500, bronze-500, ivory-50)
- Fonte Fraunces renderiza corretamente (não fallback Times New Roman)
- Duração total ~4s
- Sem freeze, sem glitch
- Idealizadora aprova o look-and-feel

### AC7 — Documentação de uso

Adicionar em `apps/web/remotion/README.md`:
- Como abrir Remotion Studio (`pnpm remotion:studio`)
- Como renderizar cada composition
- Como adicionar nova composition (link para `motion-system/remotion-templates/`)
- Como integrar com a skill `remotion-animator` (link para template doc)

## Out of scope

- ❌ Implementação dos outros 3 templates (post Instagram, KPI reveal, audiogram) — stories futuras sob demanda
- ❌ Asset library (fotos editoriais) — produzir só quando necessário
- ❌ Audio processing pipeline (para audiogram) — story dedicada
- ❌ Whisper/caption generation — story dedicada
- ❌ Pipeline CI/CD para renderizar e publicar vídeos automaticamente — story dedicada
- ❌ Logo SVG inline em vídeos (ainda não temos logo final) — usar wordmark "KEYRA" Fraunces 700 como placeholder

## Dependencies

- Story `brand.1` (tokens implementados em `apps/web`) — **bloqueante** porque tokens.ts depende dos CSS variables estarem ativos
- pnpm workspace funcional
- Node 20+ (Remotion exige)

## Risks

| Risco | Mitigação |
|-------|-----------|
| Remotion CLI exige Chromium (~300MB download) | Aceitar — é uma vez por máquina; CI separa |
| Build do Remotion não combina bem com Next.js no mesmo workspace | Isolar em `apps/web/remotion/` com tsconfig próprio se necessário |
| Render lento em máquina dev | OK para v1 — otimização de pipeline é story futura |
| Gold em vídeo aparece dessaturado vs print | Ajustar cor ou aceitar — vídeo digital tem perfil diferente |

## Definition of Done

- [ ] AC1 — Deps instaladas, scripts em package.json
- [ ] AC2 — Estrutura `apps/web/remotion/` criada
- [ ] AC3 — `tokens.ts` gerado e tipado
- [ ] AC4 — `BrandIntro.tsx` implementado
- [ ] AC5 — Render gera MP4 funcional
- [ ] AC6 — Validação visual ✅ idealizadora aprova
- [ ] AC7 — README.md documentado
- [ ] Lint zero warnings, typecheck zero errors
- [ ] PR aberto, revisado, mergeado por @devops

## Specialist Gates

- ❌ Financial / Compliance / Growth — não aplicáveis
- ✅ G2 (inventário tokens) — `tokens.ts` é fonte única em Remotion
- ✅ G4 (fonte única) — `tokens.ts` consome `tokens.json`

## Change Log

| Data | Ação | Agente |
|------|------|--------|
| 2026-05-07 | Story criada por brand-chief | brand-chief |

## QA Results

(a preencher)

## File List

(a preencher)

## Dev Notes

(a preencher)
