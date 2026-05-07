# Micro-interactions — Product UI

> Catálogo de micro-interactions do app KEYRA. Cada uma referencia padrão nomeado em [`motion-vocabulary.md`](motion-vocabulary.md) + tokens em [`motion-tokens.md`](motion-tokens.md).
> **Princípio:** silencioso por padrão. Drama só em momentos ganhos.

---

## 1. Botões

### Primary CTA (`bg-terracotta-600`)
| Estado | Comportamento |
|--------|--------------|
| Default | terracotta-600, foreground ivory-50 |
| Hover | `hover-cta` — bg vira terracotta-700 (aquece) |
| Focus | + ring `bronze-500` 2px com offset 2px |
| Press | `press-feedback` — scale 1→0.98→1 + bg vira terracotta-700 |
| Disabled | opacity 0.5, sem hover |
| Loading | spinner Inter caps small ao lado do label, sem mudança de tamanho do botão |

### Secondary (`bg-ivory-50` border `bronze-500`)
| Estado | Comportamento |
|--------|--------------|
| Default | ivory-50 + border bronze-500 |
| Hover | bg vira ivory-100, border vira cocoa-700 |
| Focus | + ring igual Primary |
| Press | scale 1→0.98 |

### Ghost (sem fundo, só texto bronze-500)
| Estado | Comportamento |
|--------|--------------|
| Default | text bronze-500 |
| Hover | text vira cocoa-900, bg vira ivory-100 |
| Focus | + ring sutil |

### Destructive (`bg-rust-800`)
| Estado | Comportamento |
|--------|--------------|
| Default | rust-800 + foreground ivory-50 |
| Hover | bg vira #6F3015 (rust-800 −6% lightness) |
| Press | scale 1→0.98 |

### Premium (raro — `bg-gold-500`)
| Estado | Comportamento |
|--------|--------------|
| Default | gold-500 + foreground cocoa-900 |
| Hover | bg vira gold-600 + shadow `premium-glow` aparece |
| Press | scale 1→0.98 |

**Uso restrito:** upgrade de tier, ação simbólica de elevação. **Máximo 1 botão Premium por tela.**

---

## 2. Cards

### Card de KPI (componente `KPICard`)
| Estado | Comportamento |
|--------|--------------|
| Default | bg surface (ivory-100 ou white), shadow-sm |
| Hover (se clicável) | `hover-card` — shadow-md, translateY(-1px) |
| Press | scale 1→0.99 |
| Loading | skeleton com `fade-quiet` em loop subtle |
| Reveal inicial | `kpi-reveal` (ver vocabulary) |

### Card de cliente / lista
| Estado | Comportamento |
|--------|--------------|
| Default | bg white, border sand-200 |
| Hover | border vira mocha-300, shadow-xs aparece |
| Press | scale 1→0.99 |

---

## 3. Inputs

### Input de texto (`<Input>` shadcn)
| Estado | Comportamento |
|--------|--------------|
| Default | border mocha-300, bg ivory-50 |
| Focus | `focus-input` — border bronze-500, shadow-xs warm aparece |
| Error | border rust-800, helper text rust-800 com fade-up |
| Disabled | opacity 0.5, bg ivory-100 |
| Filled (com valor) | border sand-200, bg white |

### Select / Combobox
| Estado | Comportamento |
|--------|--------------|
| Trigger | igual Input |
| Dropdown abre | `fade-scale` (200ms) |
| Item hover | bg ivory-100 |
| Item selected | bg amber-300, foreground cocoa-900 |
| Dropdown fecha | `dismiss-scale` |

### Date picker
| Estado | Comportamento |
|--------|--------------|
| Day hover | bg ivory-100 |
| Day selected | bg cocoa-900, foreground ivory-50 |
| Day today (não selected) | border bronze-500 |
| Range start/end | bg cocoa-900; entre = bg amber-300 |

### Toggle / Switch
| Estado | Comportamento |
|--------|--------------|
| Off | bg mocha-300, thumb ivory-50 |
| On | bg cocoa-900, thumb ivory-50 |
| Transition off↔on | thumb translateX 200ms out-soft, bg cross-fade |

### Checkbox
| Estado | Comportamento |
|--------|--------------|
| Off | border mocha-300, bg ivory-50 |
| On | bg cocoa-900, check ivory-50 com fade-quiet |
| Indeterminate | bg bronze-500 |

---

## 4. Toast / Notificação

### Sucesso
```
Aparece: fade-up (320ms) — vindo de bottom-right (bottom-3, right-3)
Some:    dismiss-quiet (200ms) — após 4s default ou click

Visual:
  bg: ivory-100
  border-left: success-leaf 4px
  ícone: success-leaf
  título: cocoa-900 medium 15px
  body: bronze-500 14px
```

### Erro
```
Mesmo comportamento, mas:
  border-left: rust-800
  ícone: rust-800
  duração: 6s default (mais tempo para Camila ler)
```

### Cúmplice (acerto)
```
Mesmo padrão, mas mensagem em estado "cúmplice" (ver voice-tone.md):
  "Comanda fechada. R$ 850 entraram agora."

Sem celebração visual extra — discrição é o ponto.
```

---

## 5. Modal / Dialog

### Open
```
Backdrop:  fade 0→0.4 opacity (cocoa-900 alpha) — duration: fast (200ms)
Container: fade-scale + translateY 16→0 — duration: base (320ms), easing: out-soft
```

### Close
```
Backdrop:  fade 0.4→0 — duration: fast (200ms)
Container: dismiss-scale + translateY 0→16 — duration: fast (200ms), easing: in-quiet
```

### Drawer (lateral)
```
Open:  translateX(100%)→0 + backdrop fade — duration: base (320ms), easing: out-soft
Close: translateX(0)→100% + backdrop fade — duration: fast (200ms), easing: in-quiet
```

---

## 6. Tabs

```
Click em tab inativa:
  Tab indicator (linha bronze-500 abaixo): translateX para nova posição
    duration: base (320ms), easing: in-out-editorial
  Conteúdo:
    Old fade-out (fast 200ms in-quiet)
    New fade-up (base 320ms out-soft) com delay 100ms
```

---

## 7. Skeleton (loading state)

```
bg: ivory-100
animation: shimmer subtle — gradient sand-200 → ivory-100 → sand-200
duration: 1.4s
loop: infinite
easing: linear

Quando dados chegam:
  Skeleton fade-quiet out
  Conteúdo real fade-up in
  Crossfade de 200ms
```

**Banido:** skeleton com cor cinza padrão. KEYRA é warm.

---

## 8. Empty state

```
Container: fade-up
Ícone:     fade-quiet com delay 100ms
Título:    fade-up com delay 200ms
Body:      fade-up com delay 280ms
CTA:       fade-up com delay 360ms

Sem motion no ícone (sem rotation, sem pulse) — estado é calmo.
```

---

## 9. Tooltip

```
Open  (após delay de hover de 600ms): fade-scale + translateY 4→0 — fast (200ms)
Close (sem delay):                     fade-quiet — fast (200ms)
```

**Delay de 600ms é proposital:** evita tooltip aparecendo no scan da Camila.

---

## 10. Form submit

```
Botão click:
  press-feedback (100ms)
Botão entra em loading:
  Label permanece, spinner aparece à direita do label
  Spinner: rotate linear 1s infinite (única exceção a "no rotation")
Sucesso:
  Botão volta ao estado normal
  Toast cúmplice aparece
Erro:
  Botão volta ao estado normal
  Toast erro aparece
  Campo com erro: shake horizontal 4px → -4px → 0 (uma vez, 240ms)
```

**Único shake permitido em KEYRA.** É feedback funcional crítico para erro de form, não decoração.

---

## 11. Sidebar / Navigation

### Item de menu
| Estado | Comportamento |
|--------|--------------|
| Default | text bronze-500, ícone bronze-500 |
| Hover | text cocoa-900, ícone cocoa-900, bg ivory-100 |
| Active (rota atual) | text cocoa-900, ícone bronze-500, bg ivory-100, border-left bronze-500 4px |
| Transition | base (320ms) out-soft |

### Bottom nav (mobile)
| Estado | Comportamento |
|--------|--------------|
| Default | ícone bronze-500 |
| Active | ícone cocoa-900 + dot bronze-500 abaixo (fade-quiet ao virar active) |
| Press | press-feedback |

---

## 12. Validação por componente

Toda implementação de micro-interaction passa por:

1. ✅ Usa padrão nomeado de [`motion-vocabulary.md`](motion-vocabulary.md)?
2. ✅ Hover aquece a cor (`bronze` mais intenso, `terracotta` mais quente)?
3. ✅ Press feedback é scale 0.98 (não bounce)?
4. ✅ Focus tem ring + shadow warm?
5. ✅ Respeita `prefers-reduced-motion`?
6. ✅ Tooltip tem delay ≥600ms?
7. ✅ Toast de sucesso é cúmplice (sem entusiasmo vazio)?

Se 1 falha → micro-interaction rejeitada.
