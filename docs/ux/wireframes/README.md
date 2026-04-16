# KEYRA — Wireframes (Story 0.5)

> **Owner:** @ux-design-expert (Uma)
> **Status:** DRAFT — aguardando validação da idealizadora
> **Stack alvo:** Next.js 16 + shadcn/ui + Tailwind v4 + Radix Primitives (ADR-002)
> **Última atualização:** 2026-04-16

---

## Propósito

Este diretório contém a especificação visual completa do MVP do KEYRA em formato
**ASCII art + anotações**. É a ponte entre o PRD (`docs/prd/PRD-KEYRA.md`) e a
implementação em React/Tailwind.

**Por que ASCII e não Figma?**
- Rastreabilidade 1:1 com FRs do PRD (Constitution Article IV — No Invention)
- Facilita revisão textual em pull requests
- Zero dependência de ferramenta externa no repositório
- Suficiente para um MVP onde o layout é linear e a complexidade está na lógica,
  não em micro-interações visuais
- Figma pode ser gerado depois, a partir destes documentos, se a idealizadora
  quiser apresentar em reuniões

---

## Índice

| # | Arquivo | Escopo | FRs cobertos |
|---|---------|--------|--------------|
| 00 | [`00-design-principles.md`](./00-design-principles.md) | Princípios UX, paleta, tipografia, tokens | CON-UX-01..06, NFR-UX-01..04 |
| 01 | [`01-dashboard.md`](./01-dashboard.md) | Dashboard de tela única (A TELA MAIS IMPORTANTE) | FR-DA-01..09 |
| 02 | [`02-agenda.md`](./02-agenda.md) | Agenda diária/semanal/mensal + modal de criação | FR-AG-01..06 |
| 03 | [`03-comanda.md`](./03-comanda.md) | Comanda automática + pagamento | FR-CO-01..05, FR-FI-01 |
| 04 | [`04-cadastros.md`](./04-cadastros.md) | Padrão CRUD (pacientes, serviços, insumos, despesas) | FR-PA-01, FR-SV-01..04, FR-ES-01, FR-FI-02..03 |
| 05 | [`05-navegacao.md`](./05-navegacao.md) | Sidebar desktop + bottom nav mobile | NFR-UX-01 |
| 06 | [`06-componentes-criticos.md`](./06-componentes-criticos.md) | Inventário de componentes compartilhados | transversal |

---

## Convenções de notação

```
┌─────┐
│ ... │   → contorno visual da tela ou componente
└─────┘

[Texto]   → botão (action)
<Texto>   → link
«Texto»   → label de input
{estado}  → estado dinâmico (loading, empty, error)
◉ ◯       → radio / checkbox (cheio / vazio)
▾         → dropdown
↑ ↓       → comparativo (acima/abaixo)
•         → bullet marker
»         → breadcrumb separator
```

### Mapeamento para código

- **h-16 / p-4 / gap-2** → classes Tailwind literais (NÃO inventar, seguir tokens)
- **text-5xl**, **text-sm** → escala tipográfica padrão shadcn
- Cores referenciadas por **nome semântico** (ex: `text-lucro`, `bg-alert-warn`)
  — a definição canônica está em `00-design-principles.md`

---

## Como consumir este diretório

### Para @dev (Dex) ao implementar uma story

1. Ler primeiro `00-design-principles.md` (tokens + componentes-base)
2. Abrir o wireframe correspondente à tela sendo implementada
3. Checar componentes em `06-componentes-criticos.md` antes de criar novos
4. Validar estados (loading/empty/error/success) — são obrigatórios
5. Rodar WCAG AA checklist após implementação

### Para @qa (Quinn) ao revisar

- Cada tela entregue precisa bater com ASCII do wireframe
- Cada estado listado (loading/empty/error) precisa estar cobertos por teste
- Cada FR listado no wireframe precisa estar rastreado no commit/story

### Para idealizadora (validação)

Perguntas abertas estão marcadas como `[VALIDAR]` ao longo dos documentos.
Concentrar revisão em:
- `01-dashboard.md` (tela mais crítica para o posicionamento do produto)
- `03-comanda.md` (fluxo de fechamento — conversão operação → financeiro)

---

## Rastreabilidade (Constitution Article IV)

Toda decisão visual neste diretório rastreia para um FR, NFR ou CON do PRD.
Se uma decisão não tiver ancoragem, está marcada como `[AUTO-DECISION]` com
justificativa — a serem validadas pela idealizadora antes de implementação.

---

## Próximos passos após validação

1. Idealizadora valida wireframes (especialmente dashboard e comanda)
2. @data-engineer confirma que schema suporta todos os cálculos exibidos
3. @architect valida aderência a ADR-002 (shadcn/ui + Tailwind v4)
4. @sm cria stories de implementação por tela
5. @dev implementa em ordem: navegação → cadastros → agenda → comanda → dashboard
   (dashboard por último porque depende de dados reais fluindo)
