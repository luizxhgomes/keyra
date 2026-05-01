# Spacing Tokens KEYRA

**Status:** ativo a partir da Story 5.5 (2026-05-01).
**Origem:** modelagem do Gestek (densidade `roomy`) ajustada para dashboard editorial. Auditoria comparativa em `docs/research/2026-05-01-gestek-design-system/DRIFT-vs-KEYRA.md`.

---

## Tabela de tokens

| Token | Valor | Quando usar |
|-------|-------|-------------|
| `card-x` | 1.5rem (24px) | Padding lateral interno do `Card` (header + content + footer) |
| `card-y` | 1.5rem (24px) | Padding vertical interno do `Card` |
| `card-x-hero` | 2rem (32px) | Padding lateral em `KPICard variant="hero"` (KPIs principais do dashboard) |
| `card-y-hero` | 2rem (32px) | Padding vertical idem |
| `stack-tight` | 0.5rem (8px) | Gap entre label pequeno + valor (ex: dentro de KPICard) |
| `stack` | 1rem (16px) | Gap padrão entre items de uma lista |
| `stack-loose` | 1.5rem (24px) | Gap entre items em narrativa (linhas de DRE) |
| `section` | 2rem (32px) | Gap entre cards de uma mesma seção (ex: 4 KPI cards) |
| `page` | 3rem (48px) | Gap entre seções de página (ex: KPI grid → Alertas → Agenda do dia) |

## Como usar

Tailwind expõe os tokens automaticamente:

```tsx
<div className="space-y-page">
  <section className="grid grid-cols-4 gap-section">
    <KPICard ... />
  </section>
  <section className="space-y-stack">
    <Card>...</Card>
  </section>
</div>
```

`Card` e `KPICard` já consumem `card-x`, `card-y`, `card-x-hero` por dentro — quem usa o componente não precisa pensar nisso.

## Validação concreta de números nos cards

A regra inegociável da KEYRA é: **o número absoluto é o herói da tela**. Para isso, o tokens de spacing garantem:

1. **KPI hero** (`card-x-hero` 32px) — valores monetários longos (R$ 9.999.999,99) têm respiro suficiente em viewport mobile 360px sem tocar borda.
2. **KPI secondary** (`card-x` 24px) — valor 4xl com `tabular-nums` + `font-semibold` + `leading-tight` (1.0-1.2) não esmaga descenders do "R$".
3. **DRE** (`space-y-stack-loose` 24px entre linhas) — narrativa financeira respira; persona não-financista repousa a vista entre receita líquida e custos.

## Quando NÃO usar tokens semânticos

- Espaçamento ad-hoc dentro de um componente isolado (ex: gap entre ícone e label de um botão) — usar Tailwind default (`gap-2`, `gap-3`).
- Espaçamento que não é do "design system" mas do "layout específico daquela tela" — usar Tailwind default; tokens semânticos são para padrões repetidos.

## Tradeoff consciente vs Gestek

Gestek usa densidade `very-roomy` (md=20, lg=40, xl=80) — adequada para landing institucional. KEYRA adota `roomy` (24/32/48) — dashboard precisa caber mais informação por scroll, mas com respiro mais que `compact`. O salto está propositalmente abaixo do Gestek para preservar densidade-de-decisão sem virar landing.
