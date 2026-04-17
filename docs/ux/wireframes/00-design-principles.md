# 00 — Design Principles (KEYRA)

> **Stack alvo:** shadcn/ui + Tailwind v4 + Radix Primitives (ADR-002)
> **Rastreia:** CON-UX-01 a CON-UX-06, NFR-UX-01 a NFR-UX-04
> **Status:** DRAFT — aguardando validação da idealizadora

---

## 1. Princípios UX inegociáveis (CON-UX)

Estes princípios vêm diretamente da idealizadora. **NÃO devem ser renegociados
por dev ou designer** sem aprovação explícita dela.

### CON-UX-01 — Números absolutos, não gráficos
> "As pessoas não sabem ler gráficos."

**Actionable para devs:**
- Toda informação financeira principal é exibida como **número grande e absoluto**
- Componente canônico: `<KPICard>` (ver `06-componentes-criticos.md`)
- Proibido: donut charts, bar charts, pie charts, line charts EM DASHBOARD
- Permitido: números em fontes grandes (`text-4xl` ou `text-5xl`), com label pequeno
- Testa-se assim: *"Se eu printar esta tela em preto-e-branco num papel, a
  informação ainda é compreensível?"* Se depender de cor para leitura, reprovar.

### CON-UX-02 — Comparativos textuais em valor absoluto
> "R$ 2.300 a mais que mês passado" — não "+18%", não barras coloridas.

**Actionable para devs:**
- Componente canônico: `<ComparativoTexto>`
- Formato: `"R$ {valor} a {mais|menos} que {periodo}"`
- Formato secundário (permitido): `"↑ R$ 2.300"` com seta unicode e cor semântica
- Proibido: gráficos de barras comparativos, sparklines
- Percentual SÓ quando for inerente (ex: "taxa de comparecimento 87%")

### CON-UX-03 — Dashboard de tela única
> Tudo que importa visível sem scroll.

**Actionable para devs:**
- Breakpoint de referência: **1366×768** (notebook padrão) — dashboard não pode
  exigir scroll nesta viewport
- Em mobile (360px+), dashboard pode ter scroll mas **acima da dobra** (primeira
  viewport de 640px) deve mostrar os 4 KPIs financeiros principais + agenda do dia
- Uso de `grid grid-cols-12` em desktop / `grid-cols-4` em mobile
- Proibido: colapsar conteúdo em abas no dashboard (esconde informação)

### CON-UX-04 — Máximo 1 gráfico em todo o sistema
> A idealizadora autorizou UM gráfico de receita vs despesa, por excessão.

**Actionable para devs:**
- Gráfico único: **barra dupla** (receita/despesa por mês, últimos 6 meses)
  no dashboard (ver `01-dashboard.md`)
- Library: `Recharts` (ADR-002)
- Proibido usar Recharts em qualquer outra tela
- Se dev precisar justificar mais um gráfico → escalar para @pm + idealizadora

### CON-UX-05 — Linguagem livre de jargão financeiro
> A usuária NÃO é financista.

**Actionable para devs — Tradutor de termos:**

| JARGÃO (não usar) | COLOQUIAL (usar) |
|-------------------|------------------|
| Faturamento | Dinheiro que entrou |
| Receita prevista | Dinheiro a receber |
| DRE | Resultado do mês |
| Margem de contribuição | Quanto sobrou |
| Regime de competência | — (não expor) |
| Conciliação bancária | Conferência do banco |
| Ativo / Passivo | — (não expor) |
| Custo variável | Custo por atendimento |
| Custo fixo | Conta que paga todo mês |
| Inadimplência | Cliente devendo |
| Lucro líquido | O que realmente sobrou |
| Ticket médio | Valor médio por cliente |

**Exceção:** "Comanda" é termo do nicho (salões, clínicas) — mantém.

**Exceção 2:** "DRE" aparece como tela técnica — mas o card no dashboard chama
"Resultado do mês".

### CON-UX-06 — Setup até primeiro lucro em 24h
> NorthStar metric.

**Actionable para devs:**
- Onboarding deve ter no máximo **5 etapas** até primeiro agendamento possível
- Wizard de 5 passos: organização → profissional → 3 serviços → 3 pacientes → primeiro agendamento
- Dashboard deve ter estado **empty state** útil (não apenas "sem dados")
  que oriente próximo passo
- Ver `05-navegacao.md` para onboarding flow

---

## 2. Paleta de cores

> **Decisão estética:** paleta primária em tons quentes/orgânicos (terracota +
> sálvia) alinhada com estética e bem-estar. Não há proibição de uso de outras
> cores — azul, por exemplo, pode ser usado como acento, link, ou em ilustrações
> sempre que servir à clareza ou à narrativa do produto.

### 2.1 Cor primária — Terracota quente
```
primary-50   #FDF6F1   /* fundo sutil de seções destacadas */
primary-100  #F9E5D6
primary-200  #F2C9AD
primary-300  #E8A77C
primary-400  #DB8450
primary-500  #C66A38   /* cor principal — botões primários, links ativos */
primary-600  #A8522A   /* hover */
primary-700  #884120   /* active / pressed */
primary-800  #5E2C15
primary-900  #3D1C0D
```

[AUTO-DECISION] Terracota queimada — remete a argila, pele, cuidado. Alternativa
considerada: rosé gold (#B76E79); descartada por associação excessiva com
cosméticos femininos (idealizadora quer incluir dentistas e dermatologistas, não
apenas esteticistas femininas).

### 2.2 Cor secundária — Verde sálvia (calma, saúde)
```
secondary-50   #F1F6F2
secondary-100  #DDE9DF
secondary-200  #B8D3BD
secondary-300  #8BB693
secondary-400  #5F996A
secondary-500  #457A50   /* badges secundários, estados "realizado" */
secondary-600  #365F3F
secondary-700  #274530
```

### 2.3 Cores semânticas (estados financeiros)

| Token | Hex | Uso |
|-------|-----|-----|
| `lucro` | `#457A50` (verde sálvia-500) | Números positivos (lucro, receita acima da meta) |
| `prejuizo` | `#B23A3A` (vermelho terra) | Números negativos (prejuízo, despesa acima do previsto) |
| `neutro` | `#6B6560` (cinza-quente-500) | Números descritivos sem carga (agendamentos) |
| `alerta` | `#D4A341` (amarelo-mostarda) | Warnings (baixa margem, estoque baixo) |
| `info` | `#8A7A6B` (bege escuro) | Tooltips, helper text |

**CRÍTICO:** evitamos **vermelho puro** e **verde lime** — cores clínicas de
"semáforo" que remetem a erro/alerta hospitalar. Tons terra são mais orgânicos.

### 2.4 Neutros (cinzas quentes)
```
neutral-50   #FAF8F5   /* background padrão — NÃO branco puro */
neutral-100  #F3EFE9
neutral-200  #E6DFD6
neutral-300  #D0C6B8
neutral-400  #A89C8C
neutral-500  #6B6560   /* texto secundário */
neutral-600  #4A453F
neutral-700  #2E2A25   /* texto principal — NÃO preto puro */
neutral-800  #1C1A17
neutral-900  #0F0E0C
```

### 2.5 Contraste WCAG AA (NFR-UX-02)

| Combinação | Ratio | Status |
|------------|-------|--------|
| `neutral-700` em `neutral-50` | 11.3:1 | AAA |
| `primary-500` em `neutral-50` | 4.8:1 | AA |
| `secondary-500` em `neutral-50` | 5.2:1 | AA |
| `neutral-500` em `neutral-50` | 4.6:1 | AA |
| `alerta` em `neutral-50` | 3.1:1 | AA Large (uso só em bold/grande) |

Todos os textos de números absolutos (KPI) devem usar `neutral-700` para
garantir legibilidade — nunca `primary-500` em textos longos.

---

## 3. Tipografia

### 3.1 Family stack
```css
--font-sans: 'Inter', 'SF Pro Text', system-ui, sans-serif;
--font-numeric: 'Inter', system-ui, sans-serif;
  /* mesma família, com feature settings 'tnum' (tabular nums) */
--font-display: 'Inter', system-ui, sans-serif;
  /* usamos Inter também para números grandes — consistência e legibilidade */
```

**Por que Inter:**
- Altíssima legibilidade em números (crítico para KPIs)
- Feature `tnum` alinha dígitos em colunas (KPIs lado a lado ficam simétricos)
- Open source, peso normal de ~400KB com weights 400/500/600/700
- Já é padrão em muitos projetos shadcn

**NÃO USAR:**
- Fontes serifadas (remetem a contador/jurídico — não é o posicionamento)
- Fontes display "fofas" (Comic Sans, Poppins rounded) — infantiliza o produto
- Roboto (muito corporativo/Android)

### 3.2 Escala tipográfica

| Token | rem | px | Uso |
|-------|-----|----|----|
| `text-xs` | 0.75 | 12 | Labels de KPI, legendas |
| `text-sm` | 0.875 | 14 | Texto secundário, forms |
| `text-base` | 1 | 16 | Texto corrido (padrão) |
| `text-lg` | 1.125 | 18 | Subtítulos de card |
| `text-xl` | 1.25 | 20 | Títulos de seção |
| `text-2xl` | 1.5 | 24 | Números pequenos de KPI (cards secundários) |
| `text-3xl` | 1.875 | 30 | Títulos de página |
| `text-4xl` | 2.25 | 36 | KPIs secundários (Despesas, Lucro) |
| `text-5xl` | 3 | 48 | **KPI hero** (Faturamento do mês) |
| `text-6xl` | 3.75 | 60 | Reservado — não usar no MVP |

### 3.3 Pesos

- `font-normal` (400) — texto corrido
- `font-medium` (500) — labels, inputs
- `font-semibold` (600) — subtítulos, emphasizing
- `font-bold` (700) — **KPIs numéricos, títulos de página**

### 3.4 Regras de uso para números

- Todo valor monetário usa `tabular-nums` (ou `font-feature-settings: 'tnum'`)
- Formato brasileiro obrigatório: `R$ 24.750,00` (ponto milhar, vírgula decimal)
- Utility: `formatBRL(cents: number): string` — fonte canônica em `lib/currency.ts`
- **NÃO truncar** números em "R$ 24,7K" — a idealizadora explicitamente pediu
  número absoluto, não abreviado

---

## 4. Espaçamento (sistema 4/8px)

Tailwind v4 default scale (múltiplos de 4px):

| Token | px | Uso típico |
|-------|----|-----------|
| `p-1` | 4 | Ícones internos, chips |
| `p-2` | 8 | Botões pequenos, badges |
| `p-3` | 12 | Inputs, chips maiores |
| `p-4` | 16 | **Padding padrão de card** |
| `p-6` | 24 | Cards com KPI grande |
| `p-8` | 32 | Padding de página (mobile) |
| `p-12` | 48 | Padding de página (desktop) |

### Gaps em grids

- `gap-2` (8px) — entre items de lista densa
- `gap-4` (16px) — **padrão** entre cards no dashboard
- `gap-6` (24px) — entre seções de dashboard
- `gap-8` (32px) — entre blocos maiores de página

### Border radius (organicidade)

- `rounded-sm` (2px) — chips, badges
- `rounded-md` (6px) — inputs, botões
- `rounded-lg` (8px) — **padrão de cards**
- `rounded-xl` (12px) — cards hero (KPI principal)
- `rounded-2xl` (16px) — modais

Escolhemos cantos **arredondados** consistentemente para reforçar a organicidade
(anti Conta Azul, que é muito quadrado/corporativo).

---

## 5. Componentes-base shadcn/ui (inventário do MVP)

Lista nominal dos componentes shadcn que serão instalados no repo. Estes são a
base — qualquer componente KEYRA-específico é composição de 1+ destes.

### 5.1 Obrigatórios no MVP

| Componente shadcn | CLI | Uso primário |
|-------------------|-----|--------------|
| `button` | `npx shadcn@latest add button` | Ações em todas as telas |
| `input` | `add input` | Forms de cadastro |
| `label` | `add label` | Par obrigatório de input (WCAG) |
| `textarea` | `add textarea` | Observações em pacientes, descrição despesas |
| `select` | `add select` | Dropdowns (categoria, profissional, status) |
| `checkbox` | `add checkbox` | Lista de insumos, filtros |
| `radio-group` | `add radio-group` | Forma de pagamento (alternativa) |
| `switch` | `add switch` | Toggle (fixo/variável, ativo/inativo) |
| `dialog` | `add dialog` | Modal de criação rápida de agendamento |
| `sheet` | `add sheet` | Drawer lateral (detalhes de agendamento) |
| `card` | `add card` | KPICards, AgendamentoCards, AlertCards |
| `badge` | `add badge` | StatusBadge (agendado/realizado/cancelado) |
| `tabs` | `add tabs` | Visão diária/semanal/mensal da agenda |
| `table` | `add table` | Listagens (pacientes, comandas, transações) |
| `dropdown-menu` | `add dropdown-menu` | User menu, actions por linha |
| `popover` | `add popover` | Date picker, filtros inline |
| `tooltip` | `add tooltip` | Helper text em KPIs |
| `separator` | `add separator` | Divisores de seção |
| `skeleton` | `add skeleton` | Loading states |
| `sonner` | `add sonner` | Toasts de feedback |
| `alert` | `add alert` | AlertCards no dashboard |
| `form` | `add form` | Integração react-hook-form + Zod |
| `calendar` | `add calendar` | Date picker (shadcn — não FullCalendar) |
| `avatar` | `add avatar` | Paciente, profissional em cards |
| `command` | `add command` | Busca global (cmd+k) |

### 5.2 NÃO instalar no MVP (deferir)

- `accordion` — contradiz CON-UX-03 (esconde informação)
- `carousel` — sem caso de uso
- `hover-card` — nice-to-have, não essencial
- `navigation-menu` — sidebar é nossa nav primária
- `menubar` — overkill para um SaaS focado

### 5.3 Compostos não-shadcn (próprios)

Ver `06-componentes-criticos.md` — cada um deles traça a 1+ componente shadcn
listado acima.

---

## 6. Iconografia

- Library: **Lucide Icons** (ADR-002)
- Stroke: 1.5px (padrão Lucide)
- Tamanhos: `h-4 w-4` (inline), `h-5 w-5` (default em botões), `h-6 w-6` (cards)
- Cor: `currentColor` (herda do pai) — **nunca hardcoded em ícones**

### Ícones canônicos do KEYRA (inventário mínimo)

| Ícone Lucide | Uso |
|--------------|-----|
| `Calendar` | Agenda |
| `Users` | Pacientes |
| `Sparkles` | Serviços (estética — evita Briefcase que é corporativo) |
| `Wallet` | Financeiro |
| `Package` | Estoque / insumos |
| `TrendingUp` | Lucro / comparativos positivos |
| `TrendingDown` | Prejuízo / comparativos negativos |
| `AlertTriangle` | Alertas do dashboard |
| `CheckCircle2` | Realizado |
| `XCircle` | Cancelado |
| `Clock` | Agendado |
| `Ban` | Falta |
| `Plus` | Adicionar |
| `Settings` | Configurações |
| `LogOut` | Sair |
| `Building2` | Organização |
| `CreditCard` | Cartão |
| `Banknote` | Dinheiro |
| `QrCode` | Pix |

**Regra:** antes de usar um ícone NOVO, ver se já tem equivalente aqui.
(Projeto ainda não tem `icon-map.ts`, será criado em Story 1.1.)

---

## 7. Micro-interações (guideline de movimento)

- Transições: **150-200ms** (padrão shadcn) — nunca > 300ms
- Easing: `ease-out` para entradas, `ease-in` para saídas
- **Proibido**: animações de entrada tipo "bounce", "elastic" — infantiliza
- Loading states: skeleton (não spinner giratório) — sensação de progresso
- Toast confirmations: 4 segundos, canto inferior-direito (mobile: centro-topo)
- Hover em cards do dashboard: `hover:shadow-sm` — feedback sutil, não dramático

---

## 8. Acessibilidade (NFR-UX-02 — WCAG 2.1 AA)

Checklist obrigatório de toda tela:

- [ ] Contraste texto/fundo >= 4.5:1 (body) ou 3:1 (large text)
- [ ] Todo input tem `<label>` associado (ID match)
- [ ] Todo botão de ícone-only tem `aria-label`
- [ ] Foco visível (`focus-visible:ring-2 ring-primary-500`)
- [ ] Navegação por teclado completa (Tab order lógico)
- [ ] Modais: focus trap + ESC fecha + foco retorna ao trigger
- [ ] Status semânticos (realizado/cancelado) não dependem SÓ de cor — sempre
      com ícone + texto
- [ ] Gráfico único (dashboard) tem `<table>` alternativa oculta (screen reader)
- [ ] Formulários: erros inline com `aria-describedby` + `aria-invalid`
- [ ] Touch targets >= 44×44px em mobile

---

## 9. Estados obrigatórios por tela (Article V — Quality First)

Toda tela de listagem ou que depende de dados remotos DEVE cobrir:

1. **Loading** — skeleton com o shape esperado (não spinner)
2. **Empty** — ilustração leve + CTA para ação relevante
3. **Error** — mensagem clara + botão "tentar de novo"
4. **Success** — o estado feliz (o wireframe principal)

QA irá rejeitar stories que não cobrirem os 4.

---

## 10. Decisões registradas (AUTO-DECISION)

| ID | Decisão | Razão |
|----|---------|-------|
| AD-01 | Terracota-500 como primária | Tons quentes/orgânicos remetem a estética/bem-estar; inclui nicho além de só esteticistas. Outras cores (azul incluso) podem ser usadas como acento sempre que servirem à clareza. |
| AD-02 | Inter para display/numérico | Tabular nums + legibilidade + tree-shakeable |
| AD-03 | Cards com `rounded-lg` (8px) | Arredondamento consistente = organicidade sem infantilizar |
| AD-04 | Background base = `neutral-50` (#FAF8F5), não branco puro | Reduz fadiga visual; combina com paleta quente |
| AD-05 | Não usar accordion no MVP | Contradiz CON-UX-03 (tela única, sem esconder info) |
| AD-06 | "Comanda" mantém, mesmo sendo termo técnico | Termo de nicho (salões/clínicas) — usuária conhece |
| AD-07 | Recharts SÓ para receita-vs-despesa do dashboard | Enforça CON-UX-04 (máx 1 gráfico); outras telas = números |
| AD-08 | Ícone `Sparkles` em vez de `Briefcase` para Serviços | Remete a cuidado/estética, não corporativismo |

---

## 11. Validação com a idealizadora — pontos críticos

Perguntas abertas para validar antes da implementação começar:

1. **Paleta terracota** funciona para o público (dentistas/dermatologistas
   incluídos)? Ou precisa ser mais neutro?
2. Em mobile, aceita scroll no dashboard desde que os **4 KPIs financeiros**
   estejam acima da dobra?
3. Formato de comparativo preferido: `"R$ 2.300 a mais que março"` ou
   `"↑ R$ 2.300 vs março"`? (ambos não-gráficos)
