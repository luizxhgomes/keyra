# Motion Vocabulary — Padrões nomeados

> Padrões de motion **nomeados e canônicos** da KEYRA. Sempre referenciar pelo nome, não reinventar.
> Tokens em [`motion-tokens.md`](motion-tokens.md). Princípios em [`motion-principles.md`](motion-principles.md).

---

## 1. Padrões de entrada (reveal)

### `fade-up` — DEFAULT
Padrão para qualquer elemento aparecendo. **80% dos casos.**

```
opacity:    0 → 1
translateY: small (8px) → 0
duration:   base (320ms)
easing:     out-soft
```

**Onde usa:** card no dashboard, item de lista, conteúdo que aparece após load, seção que entra no viewport pela primeira vez.

### `fade-scale`
Para elementos que precisam ganhar **dimensão**, não só posição.

```
opacity: 0 → 1
scale:   0.96 → 1
duration: base (320ms)
easing:   out-soft
```

**Onde usa:** modal entry, dialog, popover, toast.

### `fade-quiet`
Versão sutilíssima — para elementos que aparecem em sequência sem chamar atenção.

```
opacity: 0 → 1
scale:   0.98 → 1
duration: fast (200ms)
easing:   out-soft
```

**Onde usa:** itens de skeleton substituídos por dados reais, transição entre estados de mesmo elemento.

### `fade-down`
Inverso do `fade-up`. **Uso raro** — só quando o conteúdo "vem de cima" semanticamente (notification banner, header dropdown).

```
opacity:    0 → 1
translateY: -small (-8px) → 0
duration:   base
easing:     out-soft
```

---

## 2. Padrões de saída (dismiss)

### `dismiss-quiet` — DEFAULT
**80% dos casos de saída.** Sempre mais rápido que entrada.

```
opacity:    1 → 0
translateY: 0 → -whisper (-4px)
duration:   fast (200ms)
easing:     in-quiet
```

**Onde usa:** toast some, popover fecha, item removido da lista.

### `dismiss-scale`
Para fechamento de containers.

```
opacity: 1 → 0
scale:   1 → 0.98
duration: fast (200ms)
easing:   in-quiet
```

**Onde usa:** modal fecha, dialog dismiss.

---

## 3. Reveals narrativos (KPI / dado financeiro)

### `kpi-reveal`
**Específico para KEYRA.** Executa o princípio UX "número absoluto protagonista".

```
Sequência:
  t=0ms        Container fade-quiet (200ms)
  t=80ms       KPI valor: counter from 0 + scale 0.96→1 + opacity 0→1
                duration: slow (480ms)
                easing: out-soft
                + tnum (numerals tabulares ativos)
  t=320ms      KPI label: fade-up
                duration: base (320ms)
  t=480ms      Comparativo textual (ComparativoTexto component): fade-up
                duration: base (320ms)
```

**Onde usa:** todo `KPICard` no dashboard, hero de KPI da sales page.

**Rationale:** o número é o protagonista (chega primeiro, ganha o palco), o label dá contexto (segundo), o comparativo dá significado (terceiro). Em 800ms a Camila lê a hierarquia inteira sem esforço.

### `delta-pulse` (raríssimo)
Quando KPI atualiza em tempo real (raro em KEYRA — só dashboard live).

```
Background do KPI: ivory-50 → success-leaf 18% opacity → ivory-50
duration: 480ms
easing:   out-soft
```

---

## 4. Hover & focus (estados interativos)

### `hover-card`
Card recebe hover.

```
shadow:     shadow-md → shadow-lg
translateY: 0 → -1px
duration:   instant (100ms)
easing:     out-soft
```

### `hover-cta`
Button primário recebe hover.

```
background: terracotta-600 → terracotta-700 (aquece)
duration:   instant (100ms)
easing:     out-soft
```

### `focus-input`
Input recebe focus.

```
border:     mocha-300 → bronze-500
shadow:     none → shadow-xs (warm)
duration:   fast (200ms)
easing:     out-soft
```

### `press-feedback`
Click/tap em elemento clicável.

```
scale: 1 → 0.98 → 1
duration: instant (100ms)
easing: out-soft
```

(Sem translateY no press — é um "afundamento" sutil, não bounce.)

---

## 5. Page transitions

### `page-fade`
Transição padrão entre rotas top-level (ex: `/dashboard` → `/agenda`).

```
Saída da página atual:  fade + scale 1→0.99
                        duration: fast (200ms)
                        easing: in-quiet
Entrada da nova página: fade-up
                        duration: base (320ms)
                        easing: out-soft
                        delay: 100ms (após saída completar parcialmente)
```

### `page-slide-sub`
Transição entre sub-rotas do mesmo parent (ex: `/clientes` → `/clientes/novo`).

```
Saída:    translateX 0 → -16px + opacity 1→0
          duration: fast (200ms)
Entrada:  translateX 16px → 0 + opacity 0→1
          duration: base (320ms)
          easing: out-soft
```

### `route-instant`
Sem transição. Para rotas críticas (login → home).

```
duration: 0
```

---

## 6. Padrões de lista

### `stagger-list-default`
Lista entrando.

```
Container: fade-quiet
Children:  fade-up cada
Stagger:   small (80ms)
```

### `stagger-list-dense`
Lista com 10+ itens.

```
Stagger: tight (40ms)
```

### `stagger-list-dramatic`
Hero brand layer com 3 elementos máximo.

```
Stagger: medium (120ms)
```

---

## 7. Padrões dramáticos (uso raro)

### `gold-shimmer` — Premium element
**Uso:** badge "modelo destaque", KPI excepcional, conquista rara.

```
gold-500 sólido → gold-500 + premium-glow shadow → gold-500 sólido
duration: cinematic (720ms)
easing:   in-out-editorial
loop:     uma única vez ao aparecer
```

### `success-celebration` — Sucesso premium
**Uso:** primeiro mês fechado positivo, meta batida pela primeira vez. **Máximo 2x por sessão da Camila.**

```
1. KPI valor pulse: scale 1 → 1.04 → 1
   duration: slow (480ms)
   easing: out-bounce-subtle
2. Background do card: ivory-50 → champagne-200 18% opacity → ivory-50
   duration: cinematic (720ms)
   easing: out-soft
   delay: 200ms
3. Detalhe gold sutil aparece e some
   duration: cinematic (720ms)
```

**Sem confete, sem som de fanfarra, sem emoji animado.**

---

## 8. Anti-padrões (banidos)

| Padrão | Por que banido |
|--------|---------------|
| `bounce` em entrada de qualquer elemento | Infantil, quebra editorial |
| `rotate` em elemento estático | Não há rotação em KEYRA — é editorial, não decorativo |
| `flip 3D` | Visual datado, anti-quiet luxury |
| `pulse infinite` | Distrai a Camila |
| `glow neon` | Estética errada (cyberpunk vs editorial) |
| `confetti` | Infantil |
| `particle effect` | Ostentação |
| `parallax` em scroll | KEYRA não é portfolio |
| `scroll-jacking` | Tira controle da Camila |
| `auto-play vídeo` em product UI | Distrai do dado |
| `marquee` (texto rolando horizontal) | Anos 90 |

---

## 9. Tabela mestre — quando usar o quê

| Cena | Padrão |
|------|--------|
| Card aparecendo no dashboard | `fade-up` |
| Modal abrindo | `fade-scale` |
| Toast aparecendo | `fade-up` |
| Toast sumindo | `dismiss-quiet` |
| KPI revelando | `kpi-reveal` |
| Lista de clientes carregando | `stagger-list-default` |
| Hover em card | `hover-card` |
| Hover em botão CTA | `hover-cta` |
| Focus em input | `focus-input` |
| Click em botão | `press-feedback` |
| Mudar de `/dashboard` para `/agenda` | `page-fade` |
| Mudar de `/clientes` para `/clientes/novo` | `page-slide-sub` |
| Login → home | `route-instant` |
| Badge "premium" aparecendo | `gold-shimmer` |
| Primeiro mês positivo (1x na vida) | `success-celebration` |
