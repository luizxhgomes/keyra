# 6 Princípios de Movimento — KEYRA

> Estes princípios calibram **toda** decisão de motion na KEYRA — produto e brand. Quando houver dúvida, consultar este documento antes de definir duration/easing/comportamento.

---

## 1. Calmaria, não jerk

Animações longas o suficiente para serem percebidas, curtas o suficiente para não atrasarem a Camila. **Sempre `ease-out` na entrada**, nunca spring-bouncy.

| Decisão | Motivo |
|---------|--------|
| Default duration: **320ms** | Tempo médio em que olho humano registra transição como "fluida" sem parecer atraso |
| Easing default: **`cubic-bezier(0.22, 1, 0.36, 1)`** (out-soft) | Aceleração rápida no início + desaceleração suave — sensação editorial, não tech |
| Banido: `spring`, `bounce`, easing com `1.56` ou similar | Spring-bouncy é gramática de app de criança, não de software de profissional 35-45 anos |

**Anti-padrão:** ícones que "tremem" ao aparecer. Botões que "saltam". Modal com overshoot. Tudo proibido.

---

## 2. Reveal narrativo

KPI não aparece de uma vez — aparece **como manchete editorial**: número primeiro (protagonista), label depois (contexto), comparativo por último (significado).

```
t=0ms     [vazio]
t=80ms    R$ 12.847   ← número entra (counter from 0)
t=320ms   ↑ "RECEITA DO MÊS"  (label aparece)
t=480ms   ↑ "R$ 2.300 a mais que abril"  (comparativo se firma)
```

Stagger entre elementos = **80ms** (small) ou **120ms** (medium). Acima de 200ms vira lentidão dramática (só em hero brand layer).

**Por que isso importa:** o princípio UX inegociável da KEYRA é "número absoluto protagonista + comparativo textual". O motion **executa** esse princípio em tempo.

---

## 3. Sensação têxtil

Inspirado nas referências (Kibana sobre tecido, sombra suave do Peppermint na parede): movimento na KEYRA tem **dimensão tátil sutil**.

| Técnica | Onde aplica |
|---------|-------------|
| Fade com `translateY(8px)` simultâneo | Default reveal — sensação de "subindo da página" |
| `scale(0.96 → 1)` + opacity | Card aparecendo, modal entrando — sensação de "ganhando dimensão" |
| Sombra warm crescendo (`shadow-sm → shadow-lg`) | Hover em card — peça "aproximando" da Camila |
| **Banido:** rotação 3D, perspective, parallax | Quebra editorial; KEYRA é plano com profundidade discreta, não 3D |

---

## 4. Drama sob demanda

90% das interações são **silenciosas** (hover sutil, fade simples). 10% são **dramáticas** — e essas precisam ser **ganhas**.

| Ação cotidiana → silenciosa | Ação rara → dramática |
|----------------------------|----------------------|
| Hover em card | Sucesso de pagamento (R$ entraram) |
| Focus em input | Conquista de meta mensal |
| Toggle em filtro | Onboarding completo |
| Toast de erro | Primeiro mês fechado com lucro positivo |
| Load de tabela | Upgrade para tier premium (raro) |

**Padrão dramático:** stagger maior (120-160ms), reveal com `gold-shimmer` (uso raro do gold), partícula sutil. Mas **nunca confete, nunca emoji animado, nunca som de notificação**. Drama editorial, não videogame.

---

## 5. Calor crescente

Hover/focus aquece a cor — terracota expande, cocoa adensa, ouro brilha discreto. **Nunca esfria**.

| Estado | Antes | Depois |
|--------|-------|--------|
| CTA primário hover | `terracotta-600` | `terracotta-700` (mais quente) |
| Card hover | shadow-md | shadow-lg + translateY(-1px) |
| Input focus | border `mocha-300` | border `bronze-500` + shadow-sm |
| Premium element hover (raro) | gold-500 sólido | gold-500 + glow `premium-glow` |

**Anti-padrão:** hover que clareia (vai de cocoa-900 para cocoa-700). Hover que muda para azul. Hover que adiciona cinza. Tudo proibido.

---

## 6. Zero parallax, zero scroll-jacking

KEYRA **não é portfolio criativo**. A Camila precisa rolar a página e encontrar o que procura. Scroll é navegação, não experiência.

**Banido:**
- Parallax em qualquer eixo
- Scroll-snap mandatório
- Animação que se ativa só em scroll (revealing on scroll exagerado)
- "Locked scroll" enquanto animação roda
- Vídeo full-bleed que pausa scroll

**Permitido:**
- `IntersectionObserver` com fade-up sutil ao entrar viewport (pela primeira vez, **uma única vez**) — útil em landing page institucional
- Scroll-driven animation **muito** sutil em hero de marketing (não em produto)

---

## Resumo executivo

| Princípio | Frase única |
|-----------|-------------|
| 1. Calmaria | "Out-soft, 320ms, sem bounce" |
| 2. Reveal narrativo | "Número primeiro, label depois, significado por último" |
| 3. Tátil | "Fade-up + scale subtle + warm shadow" |
| 4. Drama sob demanda | "90% silencioso, 10% dramático — drama é editorial, não infantil" |
| 5. Calor crescente | "Hover aquece, nunca esfria" |
| 6. Zero parallax | "KEYRA é software de gestão, não portfolio" |

Estes 6 princípios são **inegociáveis**. Qualquer motion que viole pelo menos 1 é rejeitado.
