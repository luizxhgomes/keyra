# 06 — Componentes Críticos (Inventário Compartilhado)

> **Rastreia:** transversal (alimenta 01 a 05)
> **Stack:** shadcn/ui + Tailwind v4 + Radix (ADR-002)

---

## 1. Como ler este documento

Cada componente listado é:
- **Composição de 1+ componentes shadcn** (ver `00-design-principles.md` §5 para inventário base)
- **Nomeado em português** para facilitar comunicação com idealizadora
- **Reutilizável em N telas** (se for usado em 1 tela só, não está aqui)
- **Responsável por 1 responsabilidade visual clara** (evita god-components)

Os componentes canônicos são:

| # | Componente | Usado em |
|---|-----------|----------|
| 1 | `<KPICard>` | Dashboard |
| 2 | `<ComparativoTexto>` | Dashboard, Comanda, Serviços |
| 3 | `<AlertCard>` | Dashboard |
| 4 | `<AgendamentoCard>` | Agenda |
| 5 | `<ComandaItem>` | Comanda |
| 6 | `<StatusBadge>` | Agenda, Comanda, Financeiro |
| 7 | `<DataTable>` | Cadastros (todas as listagens) |
| 8 | `<PageLayout>` | Todas as páginas (detalhado em `05-navegacao.md`) |
| 9 | `<FormaPagamentoCard>` | Comanda |
| 10 | `<EmptyState>` | Transversal |

---

## 2. `<KPICard>` — cartão de número absoluto

### Variantes

```tsx
<KPICard variant="hero" />        // card principal, text-5xl
<KPICard variant="secondary" />   // cards laterais, text-4xl
<KPICard variant="compact" />     // em listagens densas, text-2xl
```

### Props

```tsx
interface KPICardProps {
  label: string;                    // "Dinheiro que entrou este mês"
  value: number;                    // em centavos (integer)
  currency?: boolean;               // default true → formata R$
  comparison?: {
    delta: number;                  // em centavos (pode ser negativo)
    period: string;                 // "março", "mês passado"
    direction?: 'up' | 'down';      // auto-calculado se omitido
    sentiment: 'positive' | 'negative' | 'neutral';  // cor do ícone
    // "menos despesa" = positive mesmo com delta negativo
  };
  helper?: string;                  // "em 47 horários marcados"
  action?: { label: string; href: string };
  variant?: 'hero' | 'secondary' | 'compact';
  loading?: boolean;
}
```

### Wireframe
```
┌────────────────────────────────────────┐
│ DINHEIRO QUE ENTROU ESTE MÊS           │  label (text-xs uppercase)
│                                        │
│ R$ 24.750,00                           │  value (text-5xl bold tabular-nums)
│                                        │
│ ↑ R$ 2.300 a mais que março            │  comparison (text-sm)
│                                        │
│                        [Ver detalhes →]│  action
└────────────────────────────────────────┘
```

### Regras de implementação

- Usa `<Card>` do shadcn como base
- `value` formatado via `formatBRL(cents)` utility
- `comparison` renderiza `<ComparativoTexto>` internamente
- `variant="hero"` → `p-8`, `text-5xl`
- `variant="secondary"` → `p-6`, `text-4xl`
- `variant="compact"` → `p-4`, `text-2xl`
- **Skeleton state** ao `loading: true` — shape preservado

### WCAG
- `role="group"` + `aria-label` com o label textual
- Valor em `<span aria-live="polite">` (atualizações com streaming SSR)

---

## 3. `<ComparativoTexto>` — comparação textual em valor absoluto

### Props

```tsx
interface ComparativoTextoProps {
  delta: number;                    // em centavos (pode ser negativo)
  period: string;                   // "março"
  sentiment: 'positive' | 'negative' | 'neutral';
  format?: 'full' | 'compact';      // full = "R$ 2.300 a mais que março"
                                    // compact = "↑ R$ 2.300"
  currency?: boolean;               // default true
}
```

### Renderização

**Full:**
```
↑ R$ 2.300,00 a mais que março     (sentiment: positive)
↓ R$ 430,00 a menos que março      (sentiment: negative — contexto: lucro baixou)
↓ R$ 430,00 a menos que março      (sentiment: positive — contexto: despesa baixou)
```

Cor:
- `sentiment: positive` → `text-lucro` (verde sálvia)
- `sentiment: negative` → `text-prejuizo` (vermelho terra)
- `sentiment: neutral` → `text-neutral-500`

**Crítico:** o sentiment é **independente do sinal do delta**. Ex: despesa caiu
R$ 430 → delta = -43000 (cents), mas sentiment = 'positive' (queda de despesa é
bom). Quem chama o componente decide o sentimento (não inferido automaticamente).

**Compact:**
```
↑ R$ 2.300,00
↓ R$ 430,00
```

Usado em KPICards secundários (espaço menor).

### WCAG
- Seta (`↑`/`↓`) + texto = não depende só de cor
- `sr-only` para "acima" / "abaixo" — leitores de tela entendem seta

---

## 4. `<AlertCard>` — alerta acionável no dashboard

### Props

```tsx
interface AlertCardProps {
  severity: 'warning' | 'info' | 'critical';
  icon?: LucideIcon;               // default por severity
  title: string;                   // "3 clientes faltaram esta semana"
  subtitle?: string;               // "R$ 540 perdidos"
  action?: { label: string; href: string };
  dismissible?: boolean;           // fase 5+
}
```

### Wireframe
```
┌────────────────────────────────────────────────┐
│ ⚠  3 clientes faltaram esta semana              │  ← title (font-medium)
│    R$ 540 perdidos                              │  ← subtitle (text-sm muted)
│                                                 │
│                                    [ Ver → ]    │
└────────────────────────────────────────────────┘
```

### Cores por severity

| Severity | Icon | BG | Border | Uso |
|----------|------|----|----|-----|
| `warning` | `AlertTriangle` | `bg-amber-50` | `border-amber-200` | Problemas médios (estoque baixo, faltas) |
| `info` | `Info` | `bg-neutral-100` | `border-neutral-200` | Neutro informativo (margem baixa) |
| `critical` | `AlertOctagon` | `bg-red-50` | `border-red-200` | Urgente (estoque zero, lucro negativo) |

### Regras
- Não usar severity `critical` no MVP com frequência (reserva para alertas sérios)
- AlertCards **sempre** têm ação — se não tem próximo passo, não é alerta, é estatística

### WCAG
- `role="status"` (severity warning/info) ou `role="alert"` (critical)
- Ícone + texto (não só ícone)

---

## 5. `<AgendamentoCard>` — card de agendamento na agenda

Detalhado em `02-agenda.md` seção 6.

### Props

```tsx
interface AgendamentoCardProps {
  appointment: {
    id: string;
    start: Date;
    end: Date;
    patient: { name: string };
    service: { name: string; duration: number };
    professional: { name: string };
    value: number;                 // centavos
    status: 'agendado' | 'realizado' | 'cancelado' | 'falta';
  };
  variant: 'grid' | 'list';        // grid = semanal/mensal; list = diária
  onClick?: (id: string) => void;
}
```

### Mapeamento status → visual
Ver `02-agenda.md` seção 6 — cor da borda esquerda + badge + ícone.

---

## 6. `<ComandaItem>` — linha de item na comanda

Detalhado em `03-comanda.md`.

### Props

```tsx
interface ComandaItemProps {
  item: {
    id: string;
    type: 'servico' | 'produto' | 'desconto';
    name: string;
    quantity: number;
    unitPrice: number;             // centavos
    professional?: { name: string };
    supplies?: Array<{
      name: string;
      quantity: string;            // "1 frasco", "2 unidades"
      cost: number;
    }>;
  };
  editable?: boolean;
  onRemove?: (id: string) => void;
}
```

### Wireframe
```
┌───────────────────────────────────────────────────────────┐
│ Botox (testa)                              R$ 450,00  [×] │
│ Profissional: Camila Souza                                │
│ ▾ Insumos consumidos (rateio automático):                 │
│   • 1 frasco ácido hialurônico   (−R$ 35,00 custo)        │
│   • 2 seringas descartáveis      (−R$ 8,00 custo)         │
└───────────────────────────────────────────────────────────┘
```

- `<Collapsible>` do Radix para insumos
- Valor com `tabular-nums`
- `[×]` só visível se `editable={true}`

---

## 7. `<StatusBadge>` — badge universal para estados

### Uso transversal

```tsx
<StatusBadge status="agendado" />
<StatusBadge status="realizado" />
<StatusBadge status="cancelado" />
<StatusBadge status="falta" />
<StatusBadge status="paga" />          // comanda
<StatusBadge status="finalizada" />    // comanda
<StatusBadge status="aberta" />        // comanda
```

### Props

```tsx
interface StatusBadgeProps {
  status: AppointmentStatus | OrderStatus | TransactionStatus;
  size?: 'sm' | 'md';                  // default md
  showIcon?: boolean;                  // default true
}
```

### Mapa de estilos

| Status | Ícone | Classes |
|--------|-------|---------|
| `agendado` | Clock | `bg-primary-100 text-primary-700` |
| `realizado` | CheckCircle2 | `bg-secondary-100 text-secondary-700` |
| `cancelado` | XCircle | `bg-neutral-200 text-neutral-600` |
| `falta` | Ban | `bg-red-100 text-red-700` |
| `aberta` | Edit3 | `bg-neutral-100 text-neutral-600` |
| `finalizada` | Circle | `bg-amber-100 text-amber-700` |
| `paga` | CheckCircle2 | `bg-secondary-100 text-secondary-700` |

**Crítico:** ícone + texto — status nunca só por cor (WCAG + CON-UX-01).

---

## 8. `<DataTable>` — tabela padrão para listagens

Encapsula TanStack Table + shadcn `<Table>`.

### Props (genérico)

```tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];         // TanStack ColumnDef
  onRowClick?: (row: T) => void;   // abre sheet lateral
  emptyState?: ReactNode;          // EmptyState customizado
  loading?: boolean;
  pagination?: {
    pageSize: number;
    totalCount: number;
    currentPage: number;
    onPageChange: (p: number) => void;
  };
  search?: {
    placeholder: string;
    onSearch: (term: string) => void;  // debounced 300ms
  };
  filters?: FilterDef[];            // avançado, fase 5
}
```

### Comportamento

- Loading: skeleton com mesmo número de linhas (default 10)
- Empty: renderiza `emptyState` prop ou `<EmptyState>` genérico
- Sort: headers clicáveis com seta (TanStack nativo)
- Row click: abre `<Sheet>` ou navega (conforme prop)
- Paginação: footer com controles + contador "Mostrando X de Y"

### Mobile

- Em viewport < 1024px, transforma automaticamente em lista de cards
  - Coluna principal vira `<h3>` do card
  - Colunas secundárias viram linhas abaixo
  - Ações do `[...]` seguem no canto direito

---

## 9. `<FormaPagamentoCard>` — card selecionável para método

### Props

```tsx
interface FormaPagamentoCardProps {
  method: 'pix' | 'credito' | 'debito' | 'dinheiro';
  selected: boolean;
  fee: number;                      // percentual (0 para sem taxa)
  onSelect: (method: string) => void;
}
```

### Wireframe individual
```
┌───────────┐
│    🔷     │
│           │  ← ícone grande (h-8 w-8)
│   Pix     │  ← label font-medium
│           │
│ sem taxa  │  ← fee text-xs muted
└───────────┘
```

Selected state:
- `border-2 border-primary-500`
- `bg-primary-50`
- `ring-2 ring-primary-200`

### WCAG
- `role="radio"` dentro de `<fieldset role="radiogroup">`
- `aria-label` descritivo: "Pagar com Pix, sem taxa"
- `aria-checked={selected}`
- Navegação por Tab + seta (Radix RadioGroup nativo)

---

## 10. `<EmptyState>` — placeholder para listas vazias

### Props

```tsx
interface EmptyStateProps {
  icon?: LucideIcon;                // default: FolderOpen
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; href: string };
}
```

### Wireframe
```
┌────────────────────────────────────┐
│                                    │
│               📅                    │
│                                    │
│    Nenhum paciente cadastrado      │
│                                    │
│  Cadastre seus pacientes para      │
│  começar a agendar atendimentos.   │
│                                    │
│    [+ Cadastrar primeiro]          │
│                                    │
└────────────────────────────────────┘
```

Estilo:
- `py-16 flex flex-col items-center text-center`
- Ícone: `h-12 w-12 text-neutral-400`
- Título: `text-lg font-semibold text-neutral-700`
- Descrição: `text-sm text-neutral-500 max-w-sm`
- CTA primary + CTA secondary (opcional) abaixo

### Variantes de contexto

- **Sem dados** (padrão) — CTA de criação
- **Sem resultados de busca/filtro** — CTA "Limpar filtros"
- **Erro ao carregar** — CTA "Tentar de novo"

---

## 11. Inventário complementar (componentes shadcn sem wrapper próprio)

Alguns usados direto do shadcn, sem wrapper:

- `<Button>` — tudo
- `<Input>` — forms
- `<Textarea>` — forms
- `<Select>` — dropdowns de campo
- `<Dialog>` — modal de criação de agendamento
- `<Sheet>` — drawer lateral de detalhes
- `<AlertDialog>` — confirmações destrutivas
- `<Command>` — busca cmd+k + combobox de paciente
- `<Toaster>` (sonner) — toasts de feedback
- `<Popover>` — date pickers, filtros inline
- `<Tooltip>` — helper text em KPIs
- `<Tabs>` — agenda dia/semana/mês

---

## 12. Regras para novos componentes

Antes de criar um componente novo, o @dev (Dex) deve:

1. Checar se já existe aqui em `06-componentes-criticos.md`
2. Checar se pode ser composição direta de 1+ shadcn
3. Se for caso novo, documentar aqui **antes** de implementar
4. Nomear em português (facilita comunicação com idealizadora)
5. Garantir reuso (se for usado em 1 lugar só, é inline — não componente)

**@qa bloqueia PR que cria componente fora deste inventário sem atualizar este doc.**

---

## 13. Decisões registradas

| ID | Decisão | Razão |
|----|---------|-------|
| CP-01 | Componentes nomeados em português | Idealizadora participa da revisão; ponte linguística |
| CP-02 | `<KPICard>` com 3 variants (hero/secondary/compact) | Reuso em dashboard + cards compactos em outras telas |
| CP-03 | `<ComparativoTexto>` tem sentiment independente do sinal | Despesa menor = bom (sentiment positive), apesar de delta negativo |
| CP-04 | `<StatusBadge>` unificado para todos os estados do sistema | 1 componente cobre appointments + orders + transactions |
| CP-05 | `<DataTable>` transforma em cards no mobile | Evita scroll horizontal impossível em 360px |
| CP-06 | `<FormaPagamentoCard>` mostra taxa inline | Transparência operacional (CON-UX-05) |
| CP-07 | Sem componente `<Chart>` genérico | CON-UX-04 — só 1 gráfico existe no sistema, não precisa abstração |
| CP-08 | `<EmptyState>` sempre com CTA | Reforça NorthStar (próximo passo claro) |
