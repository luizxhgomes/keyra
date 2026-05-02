# Auditoria UX/UI KEYRA — Pré-motion (Sprint 5+6, até 6.4)

**Auditor:** Baziotti (Human Experience Designer)
**Escopo:** Camada de design system consolidada — Story 5.7 (cobertura) + Stories 6.1 (tipografia), 6.3 (alert hierarchy 3+5+5), 6.4 (refactor visual DRE + sweep H2). Commits `cd114de`, `f0c3cec`, `42fe9f3`, `eff9f08`.
**Método:** Inspeção arquivo-a-arquivo, `grep` semântico de tokens (cores, tipografia, spacing) cruzando com `docs/ux/user-journeys.md` (J1-J6) e `docs/ux/audit-2026-05-01-sprint5-review.md`. Sem rodar app — leitura estática + rastreamento de regressões.
**Tempo de auditoria:** 40 min.
**Razão da auditoria:** próxima Sprint 6.2 (motion via framer-motion) entra sobre esta camada. Furo aqui vira retrabalho na camada de animação.

---

## Resumo executivo

A Sprint 5.7 fechou os 9 itens HIGH escapados — `<EmptyState>` cobre 24 telas, `<ErrorMessage>` cobre 18 ocorrências, FAB ganhou destino real, `KPICardSkeleton` tokenizou. A Sprint 6.1 pavimentou tipografia editorial coerente (10 tokens em `tailwind.config.ts`, 14 H1s `text-display`, 10 H2s `text-h2`, KPICard com `text-kpi`/`text-kpi-hero`, CardTitle migrou para `text-h3`). A Sprint 6.3 entregou exatamente o que prometeu — pre-implementação rigorosa, P1-P4 todos no commit, `useSyncExternalStore` é o pattern correto pra SSR-safety, cap 3+5+5 imutável, `secondaryAction` clean. A Sprint 6.4 acertou hierarquia visual do DRE principal e tokenizou ritmo das três tabelas DRE.

Mas a auditoria encontrou **4 issues HIGH novos das stories 6.x**, sendo 1 que **bate de frente com princípio inegociável da idealizadora** (uso de percentual em copy de alerta — `25% das faltas`, `lucro 30% abaixo` — depois de a Camila ter pedido absolutos), e **3 inconsistências de tema editorial** (uso de `text-emerald-700` em 11 ocorrências espalhadas pelas telas financeiras, enquanto o DRE principal — Story 6.4 — usa `text-secondary` sálvia; touch target de 18px no botão "Silenciar 7 dias"; `bg-amber-50/border-amber-300` cru no banner de truncamento da agenda).

Os princípios "tela única", "sem gráfico", "comparativo textual" e "pt-BR acentuado" continuam **sólidos e protegidos**. Sofisticação editorial avançou — `text-display-hero` 56px peso 200 dá o ar Glossier/Linear que a idealizadora pediu. Mas a paleta está **dividida**: o DRE principal lê em sálvia (token semântico), as outras telas financeiras leem em verde-bandeira-emerald (Tailwind cru). Camila vai sentir essa diferença no fechamento de mês.

**Score geral: 7.6/10** — base sólida para motion (a hidratação do `useSyncExternalStore` é tecnicamente correta e não vai dar flicker), mas inconsistência cromática entre DRE e demais telas financeiras quebra a sensação editorial. **Recomendação: corrigir 4 issues HIGH (~70 min) antes de abrir Sprint 6.2.** Sem isso, a camada de motion vai amplificar dissonância existente.

---

## 1. Tabela de issues priorizada

| # | Sev | Arquivo:linha | Problema | Jornada afetada | Fix high-level | Origem |
|---|-----|---------------|----------|-----------------|----------------|--------|
| 1 | HIGH | `dashboard/actions.ts:393, 403, 419, 433` | **Violação de princípio inegociável.** As 4 regras de alerta geram description usando percentual: `dropPct.toFixed(0)%`, `((profitCur/revenueCur)*100).toFixed(1)%`, `(rate*100).toFixed(0)%`. Camila pediu **absolutos** ("R$ 2.300 a menos que mês passado", "Margem caiu R$ 800") — não "30% abaixo". O AlertasCard que aparece no centro do dashboard fala uma língua que a persona explicitamente rejeitou. | J5 (alerta de estoque OK — usa `${lowStock.length}`), J3 (lucro/margem em %), J6 (faltas em %) | Reescrever as 4 descrições para usar valores absolutos: "Lucro deste mês está R$ 1.800 a menos que mês passado.", "Margem está R$ 800 abaixo do alvo de 15% (R$ 1.500).", "5 de 18 agendamentos foram falta ou cancelamento." Manter o threshold em % no código (gatilho), absoluto na copy (UX). | **REGRESSÃO de princípio** — não é dívida de Sprint 5.7, é regra original (CON-UX-01) violada desde a Story 4.9. Sprint 6.3 manteve sem corrigir. |
| 2 | HIGH | `dre-por-servico/page.tsx:129, 158`, `dre-por-profissional/page.tsx:99, 118`, `fluxo-caixa/page.tsx:157, 165, 184, 245`, `transacoes/page.tsx:225, 292`, `receitas/page.tsx:181`, `custos-fixos/page.tsx:215`, `meta-card.tsx:104`, `movimentacoes/page.tsx:100` | **Inconsistência cromática editorial.** 15 ocorrências de `text-emerald-700` (verde-bandeira) coexistem com **DRE principal em `text-secondary`** (sálvia #457A50, token semântico KEYRA). Camila abre DRE → vê sálvia. Abre DRE-por-serviço → vê emerald-700. Abre fluxo-caixa → emerald-700. **Mesmo conceito (lucro/positivo), duas cores.** A Story 6.4 corrigiu apenas a DRE principal — as 4 outras telas financeiras + meta-card escaparam. | J3 inteira (todas as telas financeiras de fechamento) | Substituir `text-emerald-700` → `text-secondary` ou criar token `text-lucro` (que já existe em `tailwind.config.ts:84` como `lucro: '#457A50'`) e usar `text-lucro` consistente. Sweep de 15 ocorrências em ~25 min. **Crítico:** o token `text-lucro` já existe e está sub-utilizado — decisão consciente da Story 6.4 deveria ter propagado. | **FURO NOVO da 6.4** — story trocou DRE principal mas não fez sweep das demais. |
| 3 | HIGH | `components/keyra/AlertCard.tsx:92-99` | **Touch target falha em mobile 375px.** `secondaryAction` renderiza `<button>` cru com `inline-flex w-fit text-sm`. Sem `min-h-[44px]`, sem `py-2`, altura efetiva ~18-20px (font-size 14 + line-height). Padrão Apple HIG exige 44×44 pt; padrão Material 48×48 dp. Em mobile 375px com dedo grande, errar o "Silenciar 7 dias" e cair no "Investigar" é provável. **Concern C1 da própria 6.3 documentou o issue mas não resolveu** — o agent da 6.3 entregou e marcou como "trade-off documentado". Em pre-motion, isso é refactor barato; em pós-motion, mexer no AlertCard quebra animação. | J5 passo 2 (silenciar alerta), J3 passos 2-7 (qualquer alerta no fechamento) | Adicionar `min-h-[44px] px-2 py-2 -mx-2` no `<button>`. O `-mx-2` compensa visualmente o ganho de padding pra não empurrar layout. Custo: 1 linha. Bônus: mesmo treatment para o `<Link>` da action principal — atualmente também `inline-flex w-fit text-sm`, ~22px de altura. | **REGRESSÃO de touch target** vs Story 5.4 (que subiu Button para `h-11`). 6.3 introduziu botão novo sem aplicar a regra. |
| 4 | HIGH | `agenda/calendar-client.tsx:199` | `<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">` é alerta inline cru — duplica linguagem visual do `<AlertCard severity="warning">` (`bg-amber-50 border-amber-200`). Camila vê alerta de truncamento na agenda **com cor levemente diferente** do alerta de margem baixa no dashboard (border-amber-200 vs border-amber-300). Olho não percebe a diferença, mas o sistema fica com 2 fontes de verdade pra "warning visual". | J2 passo 2 (Camila chega na agenda mobile, > 200 agendamentos) | Trocar pelo `<AlertCard severity="warning">` ou criar variant `inline` no AlertCard. Mais simples: usar AlertCard direto, sem icon (passar `icon={undefined}` se necessário um pequeno reset). Custo: 5 min. | **FURO NOVO** — 6.3 fez o AlertasCard usar AlertCard como fonte única, mas não rastreou outras ocorrências de "alerta inline" no app. |
| 5 | MEDIUM | `components/keyra/ErrorMessage.tsx:29` | Padding usa `p-card-y` (1.5rem em todos os lados — `card-y` é o token vertical = 24px). Funciona porque Tailwind aceita `p-{spacing-key}`, mas semanticamente errado: deveria ser `px-card-x py-card-y` (mesmo padrão de `Card`/`KPICard`/`KPICardSkeleton`). Causa: 1.5rem horizontal coincidiu com 1.5rem vertical, ninguém percebeu. | — | Trocar `p-card-y` por `px-card-x py-card-y`. 1 linha. | **DÍVIDA da 5.6** — não foi pega na 5.7. |
| 6 | MEDIUM | `dre-por-servico/page.tsx:95, 103`, `dre-por-servico/page.tsx:109` | Badges `border-emerald-500 text-emerald-700`, `border-amber-500 text-amber-700`, `border-destructive text-destructive` para "Top", "Margem baixa", "Prejuízo". A Story 5.1 consolidou `<StatusBadge>` universal (5 domínios, 21 status) — mas estes 3 estados de **avaliação de serviço** não foram migrados. Resultado: 3 paletas de badge no mesmo aplicativo. | J3 passo 3 (Camila identifica "Botox é mais lucrativo") | Criar 3 statuses novos no `StatusBadge`: `top` (ícone Award, cor verde-sálvia), `margem-baixa` (TriangleAlert âmbar), `prejuizo` (TrendingDown destructive). Migrar as 3 ocorrências. Custo: 15 min. | **DÍVIDA pré-existente** (Story 3.x) que escapou da consolidação 5.1. |
| 7 | MEDIUM | `agenda/page.tsx:43` | `<div className="flex h-full flex-col gap-4 p-4 sm:p-6">` — só rota com padding próprio fora do AppShell. AppShell já aplica `px-6 py-6 pb-24 lg:px-12 lg:pb-6`. Resultado: `/agenda` em desktop tem `48px (shell) + 24px (page) = 72px` de espaço lateral, enquanto `/dashboard` tem só 48px. Diferença visível à medida que Camila navega. | J2 (mobile e desktop) | Remover `p-4 sm:p-6` da page (já vem do shell). Manter apenas o `flex h-full flex-col gap-4`. | **FURO antigo** que não foi tocado em nenhuma sprint. |
| 8 | MEDIUM | `dre/page.tsx:65, 102` | Coluna "% sobre receita" continua mostrando percentual (`line.percentOfRevenue.toFixed(1)%`). Princípio é "absoluto, não percentual". DRE foi a tela mais polida da Sprint 6 — mas mantém percentual sub-utilizado (não é trend, não é variação). Decisão consciente? Não há comentário justificando. | J3 passo 2 | Remover a coluna "% sobre receita" OU adicionar nota inline ("% sobre receita bruta — auxiliar"). Validar com idealizadora antes. Risco: ela pode querer manter "% sobre receita" como ratio analítico (diferente de comparativo de variação). | **DÍVIDA pré-existente** — DRE original tinha coluna, 6.4 não removeu. |
| 9 | MEDIUM | `dashboard/indicadores-card.tsx:49, 52` | "Taxa de comparecimento" mostra `${i.attendanceRate.toFixed(1)}%` e comparativo "vs 87.3% no mês passado". Auditoria 5.7 documentou que taxa de comparecimento é exceção permitida pela PRD, mas a copy do comparativo **não usa o `<ComparativoTexto>`** — vai em string inline. Camila vê 2 padrões na mesma tela: um KPI `<KPICard>` com `<ComparativoTexto>` (linguagem A) e o IndicadoresCard com texto plano (linguagem B). | J2 passo 1 (dashboard mobile) | Não tem `<ComparativoTexto>` para %, então criar variant `format="percent"` ou trocar a copy do hint para frase plena: "no mês passado: 87.3%". A regra de comparação visual não bate aqui — taxa não tem trend visual de "subiu R$" — então aceitar string mas alinhar tom: "vs 87,3% em março" (nome do mês ao invés de "no mês passado"). | **DÍVIDA pré-existente** — Story 4.9 deixou assim. |
| 10 | MEDIUM | `team/page.tsx:62`, `comandas/[id]/page.tsx:53`, `pacientes/page.tsx:154` (auditoria anterior #15 — preservada) | Copy técnica: "(você)", "Cliente avulso", "Arquivado". Sprint 5.7 não tocou. Funcionam, mas perdem o tom mentora-confiável. | — | Tom-norte pede algo como "(é você!)" ou suprimir; "Sem cliente registrado"; "Arquivada (não conta no caixa)". Decisão da idealizadora — não fazer sem alinhamento. | Documentado, não bloqueia. |
| 11 | MEDIUM | `dre-por-servico/page.tsx:62-67`, `dre-por-profissional/page.tsx:58-63` | Empty states das duas DREs alternativas usam ícones `PieChart` e `Users`. **`PieChart` é ícone de gráfico** — princípio inegociável "sem gráficos no MVP" implica que o ícone também não deveria sugerir gráfico. É sutil, mas Camila olha o ícone e infere "tem gráfico aqui" (e depois descobre que não). | J3 passos 3-4 | Trocar `PieChart` por `Coins` ou `Receipt`; `Users` está ok. Custo: 30s. | **FURO antigo** que escapou da 5.3. |
| 12 | MEDIUM | `dashboard/page.tsx:90-122` | A ordem visual no dashboard é: KPIs grid → AlertasCard → grid 2 cols (AgendaHoje + Indicadores) → MetaCard. Mas a J2 passo 1 fala de "agenda do dia mostra 6 horários" como item de primeiro impacto. Hoje a AgendaHoje é o **5º elemento** (depois dos 4 KPIs e do alerta). Camila chegando de manhã quer **olhar a agenda primeiro**, não os KPIs do mês. | J2 passo 1 | Inverter MetaCard ↔ AgendaHoje ou repensar grid: Hero KPIs → AgendaHoje (full-width em mobile) → IndicadoresCard → AlertasCard (só se tem alerta) → MetaCard. Validar com idealizadora — possível tese de "começa com números do mês" intencional. | **DÍVIDA de UX research** — não é regressão, é decisão de hierarquia que merece revisão. |
| 13 | LOW | `components/keyra/Skeleton.tsx:34` | Em dark mode (placeholder atual), `bg-muted` HSL 36 6% 18% deixa o pulse quase invisível. Mesmo issue da auditoria-base 5.7 — preservado. Dark é placeholder, baixa prioridade. | — | Aceitar como tech debt. Quando dark mode for real (pós-MVP), revisar. | Preservado da auditoria 5.7. |
| 14 | LOW | `components/keyra/Skeleton.tsx:51-56`, `ErrorMessage.tsx:33-43` | A spec da Sprint 6.2 (motion) menciona `fade-in 300ms ease-out + translateY(4px)`. Hoje os skeletons só têm `animate-pulse` Tailwind. Ao chegar na 6.2, o handoff skeleton → conteúdo real **não terá transição** — vai trocar abrupto. Não é regressão (é gap planejado pra 6.2), mas vale antecipar a API: aceitar prop `transitionOut?: boolean` no Skeleton para handshake com o componente que substitui. | — | Documentar como input para 6.2; não mexer agora. | Antecipação de 6.2. |
| 15 | LOW | `BottomNav.tsx:35` | `pathname?.startsWith(item.href)` ainda — issue #17 da auditoria anterior preservado. `/pacientesfoo` casaria com `/pacientes`. Edge case improvável dada a estrutura, mas custa 1 linha consertar. | — | Trocar por `pathname === item.href \|\| pathname?.startsWith(item.href + '/')`. | Preservado da auditoria 5.7. |
| 16 | LOW | `pacientes/page.tsx:128` | "Cadastre quem atende você" → "Cadastre quem você atende" — issue de copy da auditoria 5.7 não corrigido. | J1 passo 10 | 1 caractere. | Preservado da auditoria 5.7. |

---

## 2. Princípios UX inegociáveis — checagem

| Princípio | Status | Observação |
|-----------|--------|------------|
| Números absolutos, sem percentual | ❌ FALHA | **AlertasCard descrições usam `dropPct%`, margem em `%`, taxa em `%`** (issue #1). Tela visível no centro do dashboard. Coluna "% sobre receita" no DRE também (#8). Taxa de comparecimento em IndicadoresCard (exceção permitida — #9). |
| Sem gráficos | ✅ OK | Nenhum `recharts`/`chart`/`canvas`. Mas ícone `PieChart` no empty state da DRE-por-serviço (#11) sugere visualmente que vai ter um. |
| Tela única (dashboard) | ⚠️ HIERARQUIA QUESTIONÁVEL | Dashboard ainda single-screen. Mas ordem KPIs → Alertas → Agenda+Indicadores → Meta pode estar invertida vs a J2 ("agenda primeiro de manhã" — #12). |
| Comparativo textual | ⚠️ PARCIAL | `<ComparativoTexto>` consistente em DRE, KPIs, custos-fixos. Quebra: IndicadoresCard usa string inline pra taxa de comparecimento (#9). Alertas usam descrição em % (#1). |
| Sofisticação editorial | ✅ AVANÇO REAL | `text-display-hero` 56px peso 200 + `text-h2` 24px peso 600 + Inter Variable + spacing tokens — direção visual clara, alinhada ao "Glossier/Linear/Notion" da idealizadora. |
| pt-BR acentuado | ✅ OK | Validado em todos os arquivos novos das stories 6.x. Nenhum "nao", "voce", "acao" cru. |
| Tema cromático coerente | ❌ FALHA | DRE principal em `text-secondary` (sálvia), 4 outras telas financeiras em `text-emerald-700` (verde-bandeira) — issue #2. **Não é gosto, é coerência editorial.** |

---

## 3. Validação por jornada (J1-J6)

| Jornada | Cobertura na DS pós-Sprint 5+6 | Status |
|---------|-------------------------------|--------|
| **J1 — Onboarding** | Empty states OK, EmptyState importado em 24 telas, copy mentora preservada. Onboarding agora passa por tipografia editorial (display-hero no `/dashboard`). | ✅ OK |
| **J2 — Dia típico (mobile)** | FAB `/agenda?novo=1` funcional, BottomNav consistente, StatusBadge no AgendaHoje. **Concern:** ordem do dashboard pode estar errada para o "manhã do dia" da Camila (#12). Truncamento da agenda usa banner cru ao invés de AlertCard (#4). | ⚠️ PARCIAL |
| **J3 — Fechamento de mês** | DRE principal lindo (Story 6.4), mas DRE-por-serviço/profissional/fluxo-caixa/transações/receitas/custos-fixos **usam emerald-700 cru** ao invés de sálvia (#2). Camila vai sentir essa fragmentação. Coluna "% sobre receita" no DRE (#8). Empty state DRE-por-serviço com ícone PieChart (#11). | ❌ FALHA cromática |
| **J4 — Convidando profissional** | Empty states de membros/convites OK. Tipografia consistente em /team/page e /team/convites. | ✅ OK |
| **J5 — Alerta de estoque** | AlertasCard agora usa AlertCard (Story 6.3 GO) + cap 3+5+5 + dismiss persistente. **Concerns:** (a) descrição usa string com `% dos agendamentos` em high-noshow (#1) — para low-stock está OK, é absoluto; (b) touch target do "Silenciar 7 dias" (#3); (c) banner truncamento da agenda usa visual paralelo (#4). | ⚠️ PARCIAL — funcional, regrediu touch target e linguagem |
| **J6 — Cancelamento/falta** | StatusBadge OK, ErrorMessage OK. Se Camila tem alta taxa de faltas, alerta "Alta taxa de faltas" mostra "X% dos agendamentos" (#1) — viola princípio. | ⚠️ PARCIAL |

---

## 4. Mobile-first 375px — checagem

Verificado:

- **AlertCard com secondaryAction:** `flex flex-wrap items-center gap-3` — em 375px com label "Investigar →" + "Silenciar 7 dias" cabe em uma linha (~280px somando) sem wrap. Em viewport 320px (iPhone SE 1ª gen), pode wrappar — aceitável.
- **AlertasList `space-y-stack-loose` (24px):** 3 críticos + 5 warning + 5 info = até 13 cards × (altura ~80px + 24px gap) = ~1300px de scroll. Aceitável em mobile (Camila scrolla naturalmente).
- **DRE table em mobile 375px:** `<table className="w-full text-sm">` sem `overflow-x-auto`. Em DRE principal são 4 colunas — vai apertar mas cabe. Em **DRE-por-servico (7 colunas)** e **DRE-por-profissional (7 colunas)**: `<div className="overflow-x-auto">` está aplicado. OK.
- **dashboard/page.tsx KPIs:** `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4` — em 375px os 4 KPIs viram coluna única. KPI hero `text-kpi-hero` 56px cabe. OK.
- **`<EmptyState>`:** `max-w-sm` na descrição limita a 384px → em 375px cabe. OK.
- **Tipografia Inter Variable:** wght-only sem opsz, mas em 56px peso 200 ainda lê bem em mobile (testado mentalmente). Sem crítica.

**Touch targets críticos em 375px:**

| Elemento | Altura efetiva | AA (44×44)? |
|----------|---------------|-------------|
| Button size=default | h-11 (44px) | ✅ |
| Button size=sm | h-9 (36px) | ⚠️ Falha técnica, mas usado em paginação não-crítica |
| Button size=icon | h-11 w-11 | ✅ |
| BottomNav slot | h-16 + padding | ✅ |
| FAB | h-14 w-14 (56px) | ✅ |
| **AlertCard secondaryAction "Silenciar 7 dias"** | **~18-20px** | **❌ FALHA crítica em mobile (#3)** |
| AlertCard primaryAction "Investigar →" | ~22px | ❌ Mesma falha (#3 derivado) |
| StatusBadge | sm: 16px / md: 22px | ✅ Display only, não interativo |

---

## 5. WCAG AA — checagem

`--muted-foreground: 30 8% 32%` (#5A5249) sobre `--background: 36 33% 97%` (#FAF8F5):

- Contraste ~7.4:1 — **PASSA AA inclusive AAA**

`text-secondary` (#457A50, sálvia) sobre `bg-card` (white): contraste ~5.6:1 — **PASSA AA**.

`text-emerald-700` (Tailwind, ~ #047857) sobre branco: contraste ~5.4:1 — **PASSA AA**. Mas o problema do #2 é coerência editorial, não contraste.

`text-info` (#8A7A6B) sobre `bg-muted` (#F3EFE9): contraste ~3.5:1 — **NÃO PASSA AA** para texto < 18pt. O `text-info` no AlertCard severity=info é usado **apenas no ícone** (linha 78 — `text-info` aplicado no `<Icon>`), não em texto — isso passa AA porque ícone não é texto. Mas se alguém usar `text-info` em texto futuramente, falha.

`focus-visible` rings: terracota sobre primary com offset bege — passa visualmente. Não testado com VoiceOver.

**Veredicto WCAG:** todos os tokens semânticos atuais passam AA. Risco futuro: `text-info` em texto. Recomendação: documentar em `tailwind.config.ts` que `text-info` é icon-only.

---

## 6. Tom-norte (mentora confiável) — análise de copy

Copy nova das Stories 6.x:

| Texto | Origem | Tom | Veredito |
|-------|--------|-----|----------|
| "Você silenciou todos os alertas ativos. Eles voltam automaticamente após 7 dias se a condição persistir." | 6.3 alertas-list:69 | Direta, informativa, calorosa "Você", técnica calibrada "se a condição persistir" | ✅ Excelente |
| "Sua operação está sob controle. Quando margem cair, falta subir ou estoque baixar, você vê aqui." | 6.3 alertas-list:78 (preservado da 5.7) | Tranquilizadora, antecipa o que vai acontecer | ✅ |
| "X alertas silenciados nesta semana" | 6.3 alertas-list:67 | Direto, neutro | ✅ |
| "Mais N alertas silenciados pelo limite (3 críticos · 5 avisos · 5 informativos)." | 6.3 alertas-list:106 | **Verboso para mobile.** Quando for "Mais 1 alerta silenciado pelo limite" + descrição de cap, ocupa 2 linhas em 375px. | ⚠️ Reduzir: "+ N silenciados (limite 3+5+5)" |
| "Lucro do mês está 30% abaixo do mês passado." | 6.3 (herdado de 4.9) | **Viola princípio.** Camila quer "R$ 1.800 a menos". | ❌ #1 |
| "Margem do mês está abaixo de 15% (12.3%)." | 6.3 (herdado de 4.9) | **Mesmo problema.** Quer absoluto. | ❌ #1 |
| "25% dos agendamentos do mês foram falta ou cancelamento." | 6.3 (herdado de 4.9) | **Mesmo problema.** Quer "5 de 18". | ❌ #1 |
| "3 insumos abaixo do nível de recompra." | 6.3 (herdado de 4.9) | Absoluto. ✅ | Esse é o gabarito a seguir nos outros 3 alertas. |
| DRE principal: "Compare absoluto com o mês anterior para enxergar tendências." | 6.4 dre/page:46 | Pedagógica, alinhada ao princípio | ✅ |
| DRE-por-servico: "Diferencial KEYRA: Conta Azul/Omie não entregam isso." | 6.4 (preservado) | Posicionamento competitivo dentro do app — **bandeira de produto, não copy de mentora.** Pode soar marketing forçado quando Camila chegar lá pela 5ª vez. | ⚠️ Sugiro: "Lucro de cada procedimento individualmente — para decidir o que escalar." (foca no benefício, não no concorrente). |

---

## 7. Aprovações da Sprint 5+6 (não mexer)

1. **Story 5.7 — sweep de cobertura.** 24 EmptyStates, 18 ErrorMessages, FAB com destino, KPICardSkeleton tokenizado. Cobertura 5.7 → 95%+ (issues #1-9 da auditoria-base 5.7 todos fechados ou explicitamente preservados como #4 do tipo "alerta inline na agenda").
2. **Story 6.1 — tipografia editorial.** Decisão de NÃO incluir `axes:['opsz']` é correta — economiza 124KB de bundle (348→224KB) por benefício marginal de legibilidade em hero. 10 tokens fontSize com sintaxe Tailwind 3.4+ (size + lineHeight + letterSpacing + fontWeight). Migração de 48 lugares sem regressão (verificado h1, h2, KPICard, CardTitle).
3. **Story 6.3 — alert hierarchy.** Pre-implementação P1-P4 todos no commit. `useSyncExternalStore` é o pattern canônico React 18+ para SSR-safety. Snapshot vazio no server → primeira renderização sem alertas silenciados → hidratação aplica filtro. **NÃO há flicker de empty state** porque a primeira renderização do empty mostra "Nenhum alerta esta semana" (CheckCircle2) que continua válido após hidratação se realmente não houver alertas. Caso haja alertas silenciados (estado raro de "todos silenciados"), pode haver flicker de 1 frame entre empty positivo (CheckCircle2) → empty silenciado (BellOff) — aceitável e raríssimo.
4. **Story 6.4 — refactor visual DRE principal.** Hierarquia editorial subtotal/final correta. `text-h3` no subtotal `revenueNet` + `text-h2` no `netProfit` + `text-secondary` (sálvia) no positivo + `text-destructive` no negativo. `border-t-2 border-border` separa narrativa. Spacing `py-stack-loose` (24px) dá ritmo de leitura. **Modelo a replicar nas DREs alternativas** (issue #2).
5. **Cap 3+5+5 imutável (reduce).** Estrutura defensiva para Phase 5 (quando regras passarem de 4 para 30+). Hoje, com 4 regras, cap nunca atingido. Bom.
6. **Dismiss "Silenciar 7 dias" não-disponível para `severity='critical'`.** Decisão correta — perda de risco proibida. UX-clean: o `secondaryAction` simplesmente não renderiza para crítico, sem mensagem "você não pode silenciar" (que seria ruído).
7. **`safeLocalStorage` SSR-safe.** Tratamento de QuotaExceededError, modo privado iOS, JSON corrompido. Falhas silenciosas com fallback `null/false/default`. Padrão de produção, não MVP-frágil.

---

## 8. Recomendação concreta antes da Sprint 6.2

Lista numerada por ordem de execução (do mais crítico ao mais cosmético), com tempo estimado realista:

| # | Ação | Tempo | Bloqueia 6.2? |
|---|------|-------|---------------|
| 1 | **Reescrever 4 descrições de alerta para usar valores absolutos** (issue #1). Buscar `${...toFixed(0)}%` em `dashboard/actions.ts` e substituir por R$ ou contagem. Inclui ajustar AC da story original 4.9 retroativamente em `docs/stories/4.9.story.md`. | 25 min | ⚠️ **SIM** — princípio inegociável violado em alerta visível no centro do dashboard. |
| 2 | **Sweep `text-emerald-700` → `text-secondary`** ou criar/usar token `text-lucro` (issue #2). 15 ocorrências em 7 arquivos. Validar visualmente que a sálvia funciona em tabelas com fundo branco. | 25 min | ⚠️ **SIM** — coerência cromática editorial é a tese da Sprint 6 inteira. Sem isso, motion vai amplificar dissonância. |
| 3 | **Touch target do AlertCard secondaryAction + primaryAction** (issue #3). Adicionar `min-h-[44px] px-2 py-2 -mx-2` ou similar. Testar em viewport 375px mentalmente. | 10 min | ⚠️ **SIM** — concern documentado da 6.3, ficou aberto. Em pre-motion é cirúrgico, em pós-motion vai mexer em transition. |
| 4 | **Banner truncamento da agenda → AlertCard** (issue #4). Remover `<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">` e usar `<AlertCard severity="warning">`. | 10 min | ⚠️ **SIM** — fonte única de "warning visual" ainda dividida. |
| 5 | `ErrorMessage` `p-card-y` → `px-card-x py-card-y` (issue #5). | 1 min | Não — semântica. |
| 6 | StatusBadge ganha `top`/`margem-baixa`/`prejuizo` + migrar 3 ocorrências (issue #6). | 15 min | Não — dívida de consolidação. |
| 7 | Remover `p-4 sm:p-6` de `agenda/page.tsx:43` (issue #7). | 1 min | Não — visual fica mais coeso. |
| 8 | Avaliar com idealizadora: coluna "% sobre receita" no DRE (issue #8) e ordem do dashboard (issue #12). | Pendente alinhamento | Não — decisões de produto, não de DS. |
| 9 | `IndicadoresCard` taxa de comparecimento — alinhar tom comparativo (issue #9). | 5 min | Não. |
| 10 | Trocar `PieChart` → `Coins` em `dre-por-servico/page.tsx:64` (issue #11). | 30s | Não. |
| 11 | Reduzir verbosidade da copy "Mais N alertas silenciados pelo limite (3+5+5)" (Seção 6). | 1 min | Não. |
| 12 | Trocar copy "Diferencial KEYRA: Conta Azul..." (Seção 6). | 1 min | Não — alinhamento de tom. |
| 13 | `BottomNav.startsWith` (issue #15). | 30s | Não. |
| 14 | Copy "atende você" → "você atende" (issue #16). | 30s | Não. |

**Total bloqueador (1-4): ~70 min.**
**Total cosmético (5-14): ~25 min.**

Sugiro abrir uma **Story 6.0 — Higienização pré-motion** (mesma ideia da 5.7) para agrupar 1-7 + 11. As decisões 8 e 12 ficam para alinhamento direto com a idealizadora. As 9, 10, 13, 14 entram como itens de baixa prioridade no backlog.

---

## 9. Veredicto final

**Score por dimensão:**

| Dimensão | Antes (5.7) | Agora (6.4) | Delta |
|----------|-------------|-------------|-------|
| Brandbook compliance | 7.5 | 7.5 | 0 (azul liberado, mas emerald-700 introduz fragmentação cromática que cancela o ganho da 6.4) |
| Loading states | 8.5 | 8.5 | 0 (estável; gap pra 6.2 é planejado) |
| Error handling | 7.5 | 8.0 | +0.5 (issue #5 detectado mas é semântico) |
| Empty states | 7.0 | 8.0 | +1.0 (5.7 fechou 9 itens, 6.3 trouxe variação BellOff/CheckCircle2) |
| Touch targets / WCAG | 8.5 | 7.5 | **−1.0** (regressão da 6.3 — secondaryAction 18px) |
| Hierarquia visual | 7.0 | 8.5 | +1.5 (6.1 tipografia + 6.4 ênfase no DRE = ganho real) |
| Layout condicional | 6.0 | 7.0 | +1.0 (FAB com destino na 5.7) |
| Alert hierarchy | 4.5 | 7.5 | +3.0 (3+5+5 + dismiss + AlertCard fonte única + empty 2 variações — mas perde pontos por copy em % e touch target) |
| **Geral** | **6.8** | **7.6** | **+0.8** |

**Recomendação:**

**SIM — abrir Story 6.0 (higienização pré-motion) antes da 6.2.** Os 4 issues HIGH são todos cirúrgicos, somam 70 min de execução real, e fecham furos que a camada de motion vai amplificar:

- Motion sobre cor inconsistente (emerald vs sálvia) faz a transição "saltar" entre paletas — pior que estado estático.
- Motion sobre touch target inadequado faz a animação "perder" o usuário (ele tenta clicar, anima errado, frustra).
- Motion sobre copy violando princípio só faz mais visível o erro.

A pre-implementação rigorosa que a Story 6.3 fez (P1-P4, decisões antes do código) é o **modelo a replicar na 6.0**. Identificar primeiro `text-emerald-700` em todas as telas, decidir token único (`text-lucro` ou `text-secondary`), depois aplicar.

A Sprint 6 entregou as 4 fundações certas (tipografia editorial, alert hierarchy, refactor DRE, cobertura). Falta apenas o sweep de coerência que a 5.7 fez para a Sprint 5. Mesmo padrão.

**Próxima ação concreta:** `@sm *draft 6.0` com escopo dos 4 itens HIGH (issues #1-4) + 3 itens cosméticos rápidos (#5, #7, #11) — total ~80 min de implementação. Não inflar.

---

**Apêndice: o que NÃO entrou nesta auditoria**

- Performance (bundle size, LCP, INP) — domínio do @architect, não do Baziotti.
- Acessibilidade screen-reader (aria-live, role, focus-trap) — fora do escopo "pré-motion DS"; reservar para auditoria pós-6.2.
- Análise de animação framer-motion — Story 6.2 ainda não escrita.
- Dark mode — placeholder, não é prioridade MVP.
- Tablets (768px) — Camila usa celular ou desktop, tablets <5% da persona; documentado como tech debt.
