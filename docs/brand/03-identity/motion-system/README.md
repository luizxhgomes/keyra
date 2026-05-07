# Motion System — KEYRA

> **Status:** v1.0 — destilado em 2026-05-07.
> **Princípio macro:** **calmaria com gravitas, drama sob demanda, zero jerk.** Movimento é parte da identidade — extensão da elegância editorial em tempo, não enfeite.

---

## 1. Por que existe

A KEYRA opera em duas camadas (brand + product). Movimento une as duas:

- **Product layer:** transições entre rotas, micro-interactions de hover/focus/press, reveals de KPI, feedback de ação. Todas calmas, todas calculadas — **a Camila precisa de previsibilidade**, não de espetáculo.
- **Brand layer:** posts animados (Instagram/TikTok/Reels), audiograms, intros de proposta comercial, vídeos de venda. Aqui o drama é permitido — gerados via skill [`remotion-animator`](../../../../.claude/skills/) que respeita os tokens deste sistema.

Sem motion system, animações viram improviso, quebram a marca, aceleram o cansaço da Camila e estouram orçamento de produção de vídeo.

---

## 2. Estrutura

```
motion-system/
├── README.md                       ← você está aqui
├── motion-principles.md            ← 6 princípios de movimento
├── motion-tokens.md                ← Durations, easings, distances (humano-legível)
├── motion-vocabulary.md            ← Padrões nomeados (fade-up, kpi-reveal, slide-page…)
├── micro-interactions.md           ← Hovers, focus, press, toast, modal
├── page-transitions.md             ← Transições entre rotas no app
└── remotion-templates/
    ├── README.md                   ← Como invocar a skill remotion respeitando o sistema
    ├── post-instagram-template.md  ← Template "Benefícios do Botox" / "Depilação a Laser"
    ├── kpi-reveal-template.md      ← Vídeo curto revelando KPI (Reels institucional)
    ├── audiogram-template.md       ← Áudio + caption editorial (depoimento Camila)
    └── brand-intro-template.md     ← Logo reveal 3-5s
```

> **Tokens canônicos** vivem em [`../tokens.json`](../tokens.json) sob a chave `motion`. Qualquer implementação (CSS, Framer Motion, Remotion) consome desses tokens — nunca números mágicos.

---

## 3. Conexão com a skill `remotion-animator`

A skill `remotion-animator` (Claude Code) gera vídeos programáticos via Remotion (React video framework). Ela é o **gerador de conteúdo motion brand layer**.

### Workflow canônico

```
Solicitação de vídeo
  ↓
Brand Chief identifica template (Post Instagram? KPI Reveal? Audiogram?)
  ↓
Skill remotion-animator é invocada
  ↓
Skill consome:
  - tokens.json → cores, fontes, durations, easings
  - remotion-templates/{template}.md → estrutura, composição, copy
  - voice-tone.md → tom da copy
  - colors-manual.md → combinações aprovadas
  ↓
Skill gera composition Remotion (.tsx)
  ↓
Build → MP4/MOV em apps/web/public/brand-assets/ ou destino especificado
```

### Regras inegociáveis para Remotion

1. **Carregar Fraunces e Inter via `@remotion/google-fonts`** — sem font-fallback que quebre a identidade
2. **Cores sempre dos tokens** — nunca hex inline; importar de `tokens.json` ou de `apps/web/lib/brand-tokens.ts` (a criar)
3. **Durations e easings de `motion-tokens.md`** — sem `easeInOut` mágico do Remotion
4. **Resolução padrão Instagram:** 1080×1350 (4:5) ou 1080×1920 (9:16 Reels) — definida no template
5. **Frame rate:** 30fps (default Remotion) — KEYRA não precisa de 60fps cinematográfico
6. **Sound design:** se houver, sample-rate 48kHz, normalize -14 LUFS, sem música stock barata. Audiograms com voz da Camila têm prioridade sobre música

### Quando NÃO usar Remotion
- Animação de **product UI** (hover, focus, page transition) — usa CSS / Framer Motion direto no app
- Spinner / loading — CSS animation pura, leve
- Skeleton state — CSS animation pura
- Toast appear — Framer Motion no `apps/web`

Remotion é para **conteúdo brand** (vídeo gerado para distribuição), não para interação no produto.

---

## 4. Como ativar

### Para implementar motion no produto KEYRA (apps/web)
1. Ler [`motion-principles.md`](motion-principles.md), [`motion-tokens.md`](motion-tokens.md), [`micro-interactions.md`](micro-interactions.md)
2. Story de implementação criada por `@sm` consumindo este sistema
3. Implementação por `@dev` usando Framer Motion + CSS variables dos tokens

### Para gerar vídeo brand (Remotion)
1. Identificar template em `remotion-templates/`
2. Invocar skill: `Skill('remotion-animator')`
3. Passar como contexto: link para o template + voice-tone + tokens.json
4. Validar output contra os princípios

---

## 5. Documentação relacionada

- [`../colors-manual.md`](../colors-manual.md) — cores que motion usa
- [`../typography-system.md`](../typography-system.md) — fontes que motion anima
- [`../voice-tone.md`](../voice-tone.md) — tom da copy em vídeo
- [`../tokens.json`](../tokens.json) — chave `motion` (a ser populada após este doc)
- Skill `remotion-animator` — gerador de vídeo

---

_Próxima atualização: ao implementar primeira story de motion no produto + ao gerar primeiro vídeo via Remotion._
