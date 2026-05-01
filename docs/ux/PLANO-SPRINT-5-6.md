# Plano Executivo — Sprint 5 + 6 (Refactor Visual KEYRA)

**Data:** 2026-05-01
**Decisão de escopo:** **Refactor cirúrgico** (Caminho A) — não rebuild. Justificativa em `docs/ux/audit-2026-05-01.md` §4.
**Insumos:**
1. Auditoria UX 8-dimensões (`docs/ux/audit-2026-05-01.md`) — score atual 5.2/10, score-alvo 7.8/10.
2. Pesquisa concorrencial Gestek (`docs/research/2026-05-01-gestek-design-system/DESIGN.md` + `DRIFT-vs-KEYRA.md`) — modelar densidade `roomy`, weights extremos, abandonar plano de par tipográfico.
3. Direção visual (`memory/feedback_keyra_visual_direction.md`) — sofisticação editorial, persona "mulheres empreendedoras", terracota + sálvia.

**Atualizações desta volta:**
- ❌ **Proibição de azul revogada** pela idealizadora — issue #1 da auditoria descartado. Adoção universal de `<StatusBadge>` permanece (consistência > proibição).
- ✅ **Pesquisa Gestek concluída** (skill `design-system-md`, score C/73, archetype marketing-gradient + material-elevation, DRIFT report cross-comparado).
- ✅ **Plano tipográfico revisado**: abandonar par Fraunces + Inter; adotar **Inter Variable + weights extremos (200/400/600/800)** + escala expandida + tokens de leading/tracking. Mais barato, mais coeso, segue Gestek/Apple Health/Stripe.
- ✅ **Stories 5.5 (tokens de spacing) e 5.6 (auditoria pt-BR)** acrescentadas à pedido da idealizadora.

---

## Sprint 5 — Higienização + Validação técnica

**Total estimado:** ~7 dias úteis · **6 stories** · ~25 pts.
**Score-alvo ao fim da Sprint 5:** 6.5/10.

### Story 5.1 — Adoção universal de `<StatusBadge>`

**T-shirt:** S (~2 pts · 0,3 dia)
**Origem:** auditoria §1.2 (consistência) — descartada parte de "caça aos azuis"; mantida adoção do componente.

**ACs:**
- AC1: As 7 ocorrências mapeadas no relatório (alertas-card, agenda-hoje-card, event-detail-sheet, comandas/page, comandas/[id]/page, financeiro/categorias, estoque/movimentacoes) passam a renderizar status via `<StatusBadge variant="...">`.
- AC2: `<StatusBadge>` ganha 2 variants novas se necessário (`info` para alertas info, `adjustment` para movimentação de estoque) — mantendo paleta semântica (azul liberado).
- AC3: Nenhuma `bg-blue-*`, `bg-emerald-*`, `bg-amber-*` inline em página — todos via componente.

**DoD:** typecheck + lint + build verdes; 7 arquivos refatorados; 0 classes de cor inline em status.

### Story 5.2 — Loading e error routes em todas as rotas

**T-shirt:** M (~5 pts · 1 dia)
**Origem:** auditoria §1.5 (3/10) e §1.6 (6/10).

**ACs:**
- AC1: Componente `<Skeleton>` reutilizável em `components/keyra/Skeleton.tsx` com 3 variants (`text`, `card`, `kpi`).
- AC2: `loading.tsx` em `app/(app)/dashboard/`, `agenda/`, `comandas/`, `pacientes/`, `servicos/`, `financeiro/`, `estoque/`, `team/` — usa skeleton apropriado (KPI grid no dashboard, tabela skeleton no DRE etc.).
- AC3: `error.tsx` no nível `app/(app)/error.tsx` (catch-all) com mensagem humanizada, ícone, botão "Tentar novamente" (`reset()`) e link "Voltar ao dashboard".
- AC4: KPICards consumidos passam `loading={true}` quando dados estão sendo buscados (resolve gap onde a prop existia mas nenhum consumidor passava).

**DoD:** transição cliente→servidor não exibe tela branca; usuária vê skeleton ou error real, nunca fallback Next genérico.

### Story 5.3 — Componente `<EmptyState>` + adoção em 8 listas

**T-shirt:** S (~3 pts · 0,5 dia)
**Origem:** auditoria §1.4 (5/10).

**ACs:**
- AC1: Componente `components/keyra/EmptyState.tsx` com props `icon` (lucide-react), `title`, `description` (com pt-BR), `action` (`{ label, href }` opcional).
- AC2: 8 listas adotam: `pacientes/page.tsx`, `team/page.tsx` (membros + convites), `servicos/page.tsx`, `comandas/page.tsx`, `financeiro/dre-por-profissional/page.tsx`, `estoque/insumos/page.tsx`, `dashboard/agenda-hoje-card.tsx`.
- AC3: Cada empty state tem **CTA acionável** (link/Button) — substitui "use o botão acima".
- AC4: Empty state das listas DRE/Indicadores reforça a tese: "Quando você concluir o primeiro atendimento, este DRE começa a se preencher sozinho."

**DoD:** todas as listas com empty state amigável + CTA real.

### Story 5.4 — Touch targets 44px + auditoria contraste WCAG AA

**T-shirt:** S (~3 pts · 0,5 dia)
**Origem:** auditoria §1.3 (6/10).

**ACs:**
- AC1: `Button` size `default` sobe para `h-11` (44px). `sm` permanece `h-9` (36px) para inline em row actions.
- AC2: `text-muted-foreground` em `text-xs` audiotado: ou subir para `text-sm`, ou ajustar `--muted-foreground` HSL para passar AA em texto pequeno (≥4.5:1).
- AC3: BottomNav FAB ganha `ring-offset` no foco (`focus-visible:ring-offset-2 focus-visible:ring-offset-primary`) para o ring ser visível sobre fundo terracota.
- AC4: AlertasCard inline (que reimplementa AlertCard) ganha `role="alert"` quando severity é `critical`.

**DoD:** auditoria de contraste limpa; touch targets ≥44px em mobile; foco visível em todos os estados.

### Story 5.5 — Sistema de tokens de spacing semânticos (NOVA)

**T-shirt:** M (~5 pts · 1 dia)
**Origem:** pedido da idealizadora 2026-05-01 + drift Gestek §1.3.

**ACs:**
- AC1: `tailwind.config.ts` ganha `extend.spacing` com tokens semânticos:
  ```ts
  spacing: {
    'card-x': '24px',     // padding lateral interno de Card (era p-6=24)
    'card-y': '24px',     // padding vertical interno de Card
    'card-x-hero': '32px',// padding em KPICard variant=hero (era p-8=32)
    'stack-tight': '8px',
    'stack': '16px',
    'stack-loose': '24px',
    'section': '32px',    // entre cards na mesma seção
    'page': '48px',       // entre seções de página
  }
  ```
  Ou via CSS vars `--space-card-padding`, `--space-section-gap` etc. em `globals.css`.
- AC2: `Card` (shadcn) refatorado para usar `p-card-x p-card-y` ao invés de `p-6` hardcoded.
- AC3: `KPICard` refatorado para usar `p-card-x-hero` (variant=hero) e `p-card-x` (secondary) ao invés de variant strings hardcoded.
- AC4: `dashboard/page.tsx` usa `gap-section` entre KPI grid e demais sections, `gap-page` entre KPI grid e Alertas/Agenda.
- AC5: `financeiro/dre/page.tsx` ganha respiro: `p-card-x-hero` no Card principal, `space-y-stack-loose` entre linhas DRE.
- AC6: **Validação concreta de números nos cards**:
  - KPI value (text-5xl ou text-display) tem `padding-x` mínimo equivalente a 1ch para não tocar borda mesmo em valores longos (R$ 9.999.999,99).
  - `tabular-nums` mantido em todos os valores monetários.
  - Weight do KPI value: `font-semibold` (600) — atual; valida se `font-bold` (700) é melhor com fonte variável.
  - line-height KPI: `leading-tight` (1.2) — não esmaga descenders dos `R$`.
- AC7: Documentação dos tokens em `docs/ux/spacing-tokens.md` com tabela e quando usar cada um.

**DoD:** `Card` e `KPICard` consumindo tokens; `dashboard/page.tsx` validado em viewport mobile (375px) e desktop (1440px) sem overflow nem aperto; valores monetários longos não tocam bordas.

### Story 5.6 — Auditoria pt-BR completa (NOVA)

**T-shirt:** M (~5 pts · 1 dia)
**Origem:** pedido da idealizadora 2026-05-01.

**ACs:**
- AC1: Revisão de **todas as páginas e componentes** (~24 páginas + ~30 componentes) verificando:
  - Acentuação correta (`não`, `ação`, `está`, `só`, `é`, `também`, `informações` etc.) — caça por ASCII puro com `grep -nE "(nao|esta|so|e |tambem|informacao|porem|atras)"`.
  - "Você"/"você" em vez de "user"/"usuário" em copy.
  - Termos técnicos traduzidos: `paid` → "paga", `done` → "concluído", `cancelled` → "cancelado", `MTD` → "este mês", `YTD` → "este ano", `DRE` mantém (termo brasileiro).
  - Datas em pt-BR: `format(date, "d 'de' MMM yyyy", { locale: ptBR })` (já é regra; verificar adoção).
  - Moeda: `R$` (não `BRL`), separador decimal `,`, milhar `.` (já é via `formatBRL`).
- AC2: Empty states e mensagens de erro humanizadas:
  - "Erro: {result.error}" → "Não conseguimos carregar agora. Tente de novo em alguns segundos."
  - "Sem dados" → "Aqui ainda está vazio — comece criando seu primeiro {recurso}."
  - "Use o botão acima" → CTA real com texto orientado à ação.
- AC3: Tone of voice "mentora confiável" — copy de cards, alertas, toasts:
  - Toast de sucesso: "Comanda finalizada." (atual ok) → considerar "Comanda fechada — pronto para receber pagamento."
  - Alerta crítico: "Lucro do mês está 23% abaixo do mês passado." (técnico) → "Atenção: você ganhou R$ X a menos esse mês comparado a {mês passado}. Vale olhar os custos." (mais didático).
- AC4: Documentação em `docs/ux/copy-guidelines.md` com:
  - Lista de pares (termo técnico → termo humano).
  - Tone of voice (mentora vs fria vs maternal).
  - Padrões de mensagens (sucesso, erro, vazio, confirmação).

**DoD:** zero ocorrência de ASCII sem acento; todas as 24 páginas com copy revisada; mensagens de erro humanizadas em todas as Server Actions consumidas; tom de mentora aplicado.

---

## Sprint 6 — Camada editorial + Motion

**Total estimado:** ~7 dias úteis · **5 stories** · ~25 pts.
**Score-alvo ao fim da Sprint 6:** 7.8/10.

### Story 6.1 — Tipografia editorial (Inter Variable + escala expandida) — REVISTA

**T-shirt:** M (~5 pts · 1 dia)
**Origem:** auditoria §1.1 (6.5/10) + drift Gestek §1.2.

**ACs:**
- AC1: Trocar `Inter` por `Inter Variable` (npm `next/font/google` com `axes: ['opsz']` ou variable font self-hosted). Pesos disponíveis: 100-900 contínuos.
- AC2: Adicionar tokens em `tailwind.config.ts`:
  ```ts
  fontSize: {
    'display-hero': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '200' }],
    'display': ['40px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '200' }],
    'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
    'h2': ['24px', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '600' }],
    'h3': ['20px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
    'kpi-hero': ['56px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
    'kpi': ['40px', { lineHeight: '1', letterSpacing: '-0.015em', fontWeight: '600' }],
    'body': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
    'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
    'label': ['12px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600', textTransform: 'uppercase' }],
  }
  ```
- AC3: Aplicar `text-display-hero` em H1 do `/dashboard`, `text-display` em H1 das outras páginas, `text-h1`/`text-h2` em CardTitle (com variant?), `text-kpi-hero` em KPI value variant=hero, `text-kpi` em variant=secondary.
- AC4: Buttons sobem para `font-semibold` (600) padrão — modelando Gestek button weight 700 mas ajustado para sobriedade editorial.
- AC5: Validação concreta de **legibilidade**:
  - Body 16px com line-height 1.5 + letter-spacing 0 — passa contraste AA mínimo.
  - Display 40-56px com weight 200 — testar em viewport real para garantir que não fique fino demais em telas baixa-densidade.
  - KPI value com `tabular-nums` mantido + weight 600 — peso suficiente para destacar mesmo em escala grande.

**DoD:** Inter Variable carregada; escala tipográfica codificada; H1 dashboard usa display-hero; KPI values usam kpi-hero com weight 600; testado em mobile e desktop.

### Story 6.2 — Sistema de Motion (framer-motion + tokens)

**T-shirt:** M (~5 pts · 1 dia)
**Origem:** auditoria §3 (mapa de motion).

**ACs:**
- AC1: Instalar `framer-motion`. Criar `lib/motion/tokens.ts` com:
  ```ts
  durations = { fast: 0.15, base: 0.2, slow: 0.3, route: 0.4 };
  easings = {
    out: [0.16, 1, 0.3, 1],     // expo-out (entrada de elementos)
    inOut: [0.65, 0, 0.35, 1],  // ease custom (transições)
    spring: { type: 'spring', stiffness: 400, damping: 30 },
  };
  ```
- AC2: Implementar 8 momentos do mapa (auditoria §3):
  1. KPI muda valor: `<AnimatePresence>` + fade-out 150ms + slide-up 4px + fade-in 200ms.
  2. StatusBadge muda status: `subtle-scale` (1 → 1.04 → 1, 200ms).
  3. Sheet de criação de agendamento: stagger nos 3 fields principais (60ms cada).
  4. Alerta crítico entra: slide-in-down 300ms + pulse-once.
  5. Sidebar nav active: transition-all 150ms na border-l-4.
  6. Toast sucesso: re-tematizar para sálvia (não emerald default).
  7. Troca de rota: `app/template.tsx` com motion.div fade+rise 400ms.
  8. EmptyState: fade-in-up 400ms.
- AC3: `globals.css` com `@media (prefers-reduced-motion: reduce)` cortando todas as animações.
- AC4: Cap de duração: nada >300ms exceto rota (400ms). Princípio "motion como informação, não decoração".

**DoD:** 8 momentos implementados; reduced-motion respeitado; bundle size delta <30KB (framer-motion é tree-shakable).

### Story 6.3 — Alert hierarchy 3+5+5 + dismiss

**T-shirt:** M (~5 pts · 1 dia)
**Origem:** auditoria §1.7 (4/10).

**ACs:**
- AC1: `dashboard/alertas-card.tsx` refatorado para usar `<AlertCard>` (componente já existente em `components/keyra/`) — elimina duas fontes de verdade.
- AC2: Regra 3+5+5 implementada: cap 3 alertas críticos no topo + 5 warnings + 5 info. Excedentes vão para "Ver todos os alertas" (link).
- AC3: Dismiss inline em cada alerta: botão `Silenciar 7 dias` que persiste em `localStorage` (MVP) ou tabela `alert_dismissals` (Phase 5+). MVP: localStorage com chave `keyra:dismissed-alerts:{org_id}`.
- AC4: Empty state positivo quando 0 alertas: card calmo "Nada para se preocupar — sua semana está sob controle." com `icon=CheckCircle text-secondary` (sálvia).

**DoD:** AlertasCard usa `<AlertCard>`; dismiss funciona; cap 3+5+5 respeitado; empty state positivo presente.

### Story 6.4 — Refactor visual do DRE

**T-shirt:** S (~3 pts · 0,5 dia)
**Origem:** auditoria §1.1 (item DRE) + #9 do top-10.

**ACs:**
- AC1: `dre/page.tsx` linhas agrupadas com `border-t-2 border-border` antes de `revenueNet` (subtotal) e antes de `netProfit` (final).
- AC2: Linha de subtotal (`revenueNet`) com `bg-muted/30 font-semibold text-h3` (revisada da Story 6.1).
- AC3: Linha final (`netProfit`) com `bg-muted/50 font-bold text-h2 text-secondary` (sálvia se positivo, `text-destructive` se negativo).
- AC4: Comparativo textual usa componente `<ComparativoTexto>` ao invés de string inline.
- AC5: Espaço vertical: `py-stack-loose` entre linhas (24px) ao invés de `py-2` (8px).

**DoD:** DRE com hierarquia visual clara; subtotal e total destacados; ritmo vertical respira.

### Story 6.5 — Sidebar 7 itens + FAB contextual

**T-shirt:** S (~3 pts · 0,5 dia)
**Origem:** auditoria §1.8 (6/10) + #8 do top-10.

**ACs:**
- AC1: Sidebar reduzida para 7 itens primários: Dashboard, Agenda, Comandas, Pacientes, Serviços, Financeiro, Estoque. Time + Configurações descem para uma seção secundária no rodapé (separados por `border-t border-border`).
- AC2: BottomNav FAB ganha `onClick` contextual baseado em `usePathname()`:
  - `/agenda` → abre Sheet de novo agendamento (reusa Story 2.5)
  - `/comandas` → link para finalizar última comanda aberta (ou criar via `/agenda` se não houver)
  - `/pacientes` → link para `/pacientes/novo`
  - `/servicos` → link para `/servicos/novo`
  - default → link para `/agenda` (criar agendamento é ação mais frequente)
- AC3: Tooltip no hover do FAB explicando ação contextual.

**DoD:** Sidebar com 7 + 2 itens; FAB com ação contextual nos 5 contextos principais.

---

## Cronograma estimado

| Sprint | Stories | Pts | Dias úteis | Score-alvo |
|--------|---------|-----|------------|------------|
| **5 — Higienização** | 5.1 + 5.2 + 5.3 + 5.4 + 5.5 + 5.6 | ~25 | 7 | 6.5/10 |
| **6 — Editorial + Motion** | 6.1 + 6.2 + 6.3 + 6.4 + 6.5 | ~25 | 7 | 7.8/10 |
| **Total** | **11 stories** | **~50 pts** | **~14 dias** | — |

---

## Princípios inegociáveis (ESTES NÃO MUDAM)

1. ✅ **Números absolutos**: nunca trocar valor monetário por percentual de variação. Comparativo é texto, não percentual.
2. ✅ **Sem gráficos** (exceto 1 permitido pelo PRD, ainda não usado).
3. ✅ **Tela única no dashboard** — sem scroll excessivo; informação respira.
4. ✅ **Comparativo textual** — "R$ X a mais que mês passado" via `<ComparativoTexto>`.
5. ✅ **Persona "mulheres empreendedoras de clínicas de estética"** — sofisticação editorial, nunca rosa-bebê / floral.
6. ✅ **Acentuação pt-BR sempre correta** — zero ASCII puro em copy.

---

## Validações concretas (checklist final ao fechar Sprint 5/6)

### Espaçamento e legibilidade dos números
- [ ] KPI value (R$ 9.999.999,99) não toca borda do Card em viewport 360px (mobile B+/C+)
- [ ] tabular-nums aplicado em 100% dos valores monetários
- [ ] Weight 600 em KPI values (não 400, não 700)
- [ ] line-height tight (1.0-1.2) em valores grandes; line-height normal (1.5) em descrições
- [ ] Padding interno do Card respira: `p-card-x` (24px) padrão, `p-card-x-hero` (32px) em KPI variant=hero

### Tipografia legível
- [ ] Body 16px com leading 1.5 + tracking 0 — passa AA contraste ≥4.5:1
- [ ] Display 40-56px com weight 200 — testado em mobile (não fica fino demais)
- [ ] Buttons font-semibold (600) com altura mínima 44px

### pt-BR
- [ ] Zero ocorrência de "nao", "acao", "esta", "voce", "tambem" sem acento
- [ ] Todas as datas em formato BR (`d 'de' MMM yyyy`)
- [ ] Moeda sempre `R$` (nunca `BRL`)
- [ ] Empty states com CTA real (não "use o botão acima")
- [ ] Mensagens de erro humanizadas (não "Erro: {message}" cru)

### WCAG AA
- [ ] Touch targets ≥44px em mobile
- [ ] Foco visível em todos os elementos interativos
- [ ] Contraste ≥4.5:1 em texto pequeno (text-xs)
- [ ] Status nunca só por cor (sempre ícone + texto)
