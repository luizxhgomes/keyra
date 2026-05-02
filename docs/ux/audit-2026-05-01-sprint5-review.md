# Auditoria UX/UI KEYRA — Revisão da Sprint 5 (2026-05-01)

**Auditor:** Baziotti (Human Experience Designer)
**Escopo:** Entregas das Stories 5.1 a 5.6 — commit `36e3516`
**Método:** Inspeção arquivo-a-arquivo, cruzamento com `docs/ux/user-journeys.md` (J1-J6) e com a auditoria-base de 2026-05-01.
**Tempo de auditoria:** 35 min, sem rodar app — leitura estática + typecheck.

---

## Resumo executivo

A Sprint 5 entregou **a coluna vertebral** que faltava: `<EmptyState>`, `<ErrorMessage>`, `<Skeleton>`, 8 `loading.tsx`, `error.tsx` global, tokens de spacing e expansão do `<StatusBadge>`. Camila agora tem fallback para tela branca, copy humana em erro e CTA real em listas vazias. Esses ganhos são reais e medíveis.

Mas a Sprint **não foi até o fim**: 5 páginas ainda usam `<p class="text-sm text-muted-foreground">Sem...</p>` cru, 4 páginas ainda têm `Erro: {result.error}` cru sem `<ErrorMessage>`, o `dashboard/alertas-card.tsx` mantém `border-blue-500` inline mesmo com `<StatusBadge>` adotado dentro do mesmo componente, e o FAB do BottomNav continua botão morto sem `onClick`. A regra "tudo ou nada" da consistência foi quebrada — usuária encontra duas linguagens visuais na mesma sessão.

**Score geral: 6.8/10** — funcional, mas inconsistente. **Recomendação: corrigir 8 itens HIGH (~3-4h) antes de abrir Sprint 6.** Nenhum bug funcional; problemas são de cobertura e adoção.

---

## 1. Tabela de issues priorizada

| # | Sev | Arquivo:linha | Problema | Jornada afetada | Fix high-level |
|---|-----|---------------|----------|-----------------|----------------|
| 1 | HIGH | `dashboard/alertas-card.tsx:9-13, 49-55` | Mapa `SEVERITY_BORDER` mantém `border-blue-500` e ramo `text-blue-700` inline. `<StatusBadge>` foi adotado para o pill (linha 61) mas a cor da borda lateral e do ícone duplicam o sistema. **Duas fontes de verdade no mesmo componente.** | J5 passo 1 (alerta de estoque baixo) | Trocar por tokens semânticos: `border-amber-500` já existe, criar `border-info` apontando para `text-info` (token `#8A7A6B` já existe em `tailwind.config.ts:87`). Ou usar `<AlertCard>` (já existe e está sendo ignorado — mesmo issue da auditoria-base #4). |
| 2 | HIGH | `estoque/movimentacoes/page.tsx:68-72` | Empty state ainda é `<p class="text-sm text-muted-foreground">Sem movimentações ainda...</p>`. Apesar da Story 5.3 listar essa página como adotada, o componente `<EmptyState>` não foi importado nem usado. | J2 passo 8 (consumo após pagamento) e J5 passo 5 | Importar `EmptyState`, adotar com `icon={ArrowDownCircle}`, copy igual ao texto atual, sem `action` (estado é informativo). |
| 3 | HIGH | `dashboard/alertas-card.tsx:28` | Quando `result.data.length === 0`, retorna `null` — alertas somem do dashboard. Já era issue #6 da auditoria-base e **não foi resolvido na Sprint 5**. | J2 passo 1 (Camila chega de manhã, sem alertas) | Renderizar empty state positivo: card calmo "Nenhum alerta — sua semana está sob controle" usando `<EmptyState>` com `icon={CheckCircle2}` sem `action`. Reforço positivo (Status Quo a favor). |
| 4 | HIGH | `dashboard/page.tsx:77-87` | Empty state geral do dashboard (`noData`) ainda é `<p>` plano dentro de Card. Story 5.3 não migrou esse caso. | J1 passo 4 (primeira semana) | Trocar por `<EmptyState>` com `icon={Sparkles}`, `title="Conclua atendimentos para ver os números"`, `description=` o texto atual, sem `action` (atualização passiva). |
| 5 | HIGH | `team/page.tsx:94-97` | Empty state de "Convites pendentes" ainda é `<p>` plano + `<strong>Convites</strong>` que não é link. | J4 passo 2 (criar convite) | `<EmptyState icon={Mail} title="Nenhum convite aguardando resposta" description="..." action={{ label: 'Enviar convite', href: '/team/convites' }} />`. |
| 6 | HIGH | `financeiro/despesas/page.tsx:51`, `transacoes/page.tsx:66`, `categorias/page.tsx:44`, `custos-fixos/page.tsx:44-46`, `fluxo-caixa/page.tsx:30` | 5 páginas ainda renderizam `<p className="text-sm text-destructive">Erro: {error}</p>` cru. Story 5.6 lista 14 ocorrências patcheadas mas estas 5 escaparam. | J3 (fechamento de mês — DRE/transações), J6 (cancelamento → fluxo de caixa) | Substituir por `<ErrorMessage detail={error} />` envolto em `<Card><CardContent>`. Mesmo padrão das outras 14 que foram migradas. |
| 7 | HIGH | `financeiro/despesas/page.tsx:150`, `receitas/page.tsx:129`, `metas/page.tsx:60`, `fluxo-caixa/page.tsx:131`, `team/convites/page.tsx:39`, `dashboard/indicadores-card.tsx:30-32`, `comandas/comanda-edit-form.tsx:173`, `financeiro/dre-por-servico/page.tsx:64-66`, `financeiro/custos-fixos/page.tsx:144-145` | 9 empty states que ainda são `<p>` plano não migrados — Story 5.3 lista 8 adoções mas o catálogo da auditoria-base era maior. Persona-norte cai nessas listas vazias e vê "Sem despesas no período." sem ícone, sem CTA, sem norte. | J1 passo 11 (criar meta), J3 todas as views, J5 (estoque) | Migrar caso a caso para `<EmptyState>`. Em listas filtradas (por mês/período) o action pode ser link "Ver mês anterior". Para forms vazios (`comanda-edit-form` sem itens) `<EmptyState>` compact dentro do card. |
| 8 | HIGH | `BottomNav.tsx:34-40` | FAB ainda é `<button type="button">` sem `onClick`, sem `<Link>`. Camila toca no botão `+` no mobile e nada acontece. Problema documentado na auditoria-base e **não foi tocado na Sprint 5**. | J2 passo 2 (criar agendamento mobile), J6 (registrar cancelamento rápido) | Mínimo viável: envolver em `<Link href="/agenda?novo=1">` ou abrir `Sheet` contextual. Spec FAB contextual é Sprint 6, mas o link "criar agendamento" cobre 80% da intenção. |
| 9 | MEDIUM | `components/keyra/Skeleton.tsx:50` | `KPICardSkeleton` usa `p-6` hardcoded ao invés de `px-card-x py-card-y`. Inconsistência interna do próprio componente que fala de "tokens da Story 5.5". | — (visual) | Trocar `p-6` por `px-card-x py-card-y`. Alinhar `variant="hero"` com `px-card-x-hero py-card-y-hero` se quiser espelhar o `KPICard`. |
| 10 | MEDIUM | `KPICard.tsx:35` | Variant `compact` tem `p-4` hardcoded. Decisão consciente registrada no prompt da Sprint 5 ("não migrado") — mas a string mágica vai contra a tese de tokens. | — | Adicionar token `card-compact: 1rem` em `tailwind.config.ts` e referenciar como `p-card-compact`. Custo zero, ganho de coerência. |
| 11 | MEDIUM | `AppShell.tsx:39` | `<main className="...px-6 py-6 pb-24 lg:px-12 lg:pb-6">` segue hardcoded. Story 5.5 introduziu `page: 3rem` mas não foi aplicado aqui — provavelmente porque "page" foi pensado como gap, não padding do shell. Ainda assim, o padding do container deveria virar token (`shell-x`, `shell-y`, `shell-x-lg`). | Toda jornada (mobile crítico) | Definir tokens `shell-x: 1.5rem`, `shell-y: 1.5rem`, `shell-x-lg: 3rem` e aplicar. Ou aceitar e documentar que AppShell fica fora do sistema de tokens (atualizar `docs/ux/spacing-tokens.md`). |
| 12 | MEDIUM | `ErrorMessage.tsx:39-42` | Detalhe técnico aparece no meio da frase: `"Tente abrir essa tela de novo em alguns segundos. Se persistir, <code>{detail}</code>."` Frase trunca no meio. Em mobile com `detail` longo (mensagem Postgres) gera scroll horizontal dentro do card. | J3 passo 2 (DRE com erro) | Quebrar em duas linhas: parágrafo da copy + `<details>` ou um `<p class="text-[11px] mt-1 break-all">{detail}</p>` em bloco separado. Permite copiar com 1 toque. |
| 13 | MEDIUM | `dashboard/indicadores-card.tsx:30-32` | Texto "Sem dados ainda. Conclua atendimentos e registre pagamentos." duplica o que `dashboard/page.tsx:77-87` já mostra. Camila vê **duas** mensagens dizendo a mesma coisa quando o sistema está vazio. | J1 passos 4-10 (semana 1, ainda zerado) | No render, suprimir `IndicadoresCard` quando `noData=true` no `page.tsx`. Ou trocar a copy do `IndicadoresCard` para algo mais específico ("Top serviço aparece após 3+ atendimentos pagos"). |
| 14 | MEDIUM | `MetaCard.tsx:36-42` | Empty state ainda é `<p class="text-sm text-muted-foreground">` com link inline. Funciona, mas quebra padrão estabelecido pela Story 5.3 — um lugar usa `<EmptyState>` outro usa `<p>` para mesma intenção. | J1 passo 11 (criar meta), J3 passo 6 | Migrar para `<EmptyState icon={Target} title="Você ainda não definiu meta para o mês" description="..." action={{ label: 'Criar meta', href: '/financeiro/metas' }} />`. |
| 15 | LOW | `team/page.tsx:62`, `comandas/[id]/page.tsx:53`, `pacientes/page.tsx:154` | "(você)", "Cliente avulso", "Arquivado" são copy correta mas em pt-BR técnico. Tom-norte (mentora confiável) aceita — só registrar. | — | Sem ação. |
| 16 | LOW | `Skeleton.tsx:34` | `bg-muted` no `animate-pulse` — em dark mode (`muted` HSL `36 6% 18%`) o pulse fica quase invisível. Dark não é Sprint 5 mas existe placeholder. | — | Aceitar (dark é placeholder). Documentar como tech debt. |
| 17 | LOW | `BottomNav.tsx:30-31, 42-43` | `pathname?.startsWith(item.href)` — `/pacientes/123` casa com `/pacientes` (correto), mas `/pacientesfoo` também casaria. Edge case improvável dada a estrutura de rotas. | — | Trocar por `pathname === item.href || pathname?.startsWith(item.href + '/')`. |

---

## 2. Princípios UX inegociáveis — checagem

| Princípio | Status | Observação |
|-----------|--------|------------|
| Números absolutos, sem percentual | ✅ OK | `MetaCard.tsx:97-100` mostra "R$ 240 / R$ 15.000" — absoluto. `IndicadoresCard.tsx:46` ainda mostra `${i.attendanceRate.toFixed(1)}%` — **ressalva**: taxa de comparecimento é uma das exceções permitidas pela própria PRD (NFR), não é regressão. |
| Sem gráficos | ✅ OK | Nenhum `<canvas>`, nenhum `recharts`, nenhum `chart` na Sprint 5. |
| Tela única (dashboard) | ✅ OK | `dashboard/page.tsx` continua single-screen, scroll vertical natural. |
| Comparativo textual | ✅ OK | `<ComparativoTexto>` continua sendo a fonte. KPICard consome corretamente. |
| Sofisticação editorial | ⚠️ PARCIAL | Tipografia ainda é 100% Inter (issue #3 da auditoria-base, **planejado para Sprint 6**). Spacing tokens são um avanço editorial real. |
| pt-BR acentuado | ✅ OK | `EmptyState`, `ErrorMessage`, `error.tsx` global — todos com acentos corretos. Não encontrei "nao", "voce", "acao" sem acento em nenhum arquivo da Sprint 5. |

---

## 3. Validação por jornada (J1-J6)

| Jornada | Passos críticos da Sprint 5 | Status |
|---------|------------------------------|--------|
| **J1 — Onboarding** | Empty states em pacientes/servicos/team. Empty state inicial do dashboard. Empty state de meta. | ⚠️ PARCIAL — pacientes/servicos/team OK; **dashboard noData (#4) e MetaCard (#14) ainda em `<p>` plano**. |
| **J2 — Dia típico (mobile)** | Loading.tsx em agenda + comandas. FAB para criar agendamento rápido. Status badge consistente. | ⚠️ PARCIAL — loading + StatusBadge OK; **FAB ainda é botão morto (#8)**, bloqueia "criar agendamento" rápido em mobile. |
| **J3 — Fechamento de mês** | ErrorMessage em DRE + DRE por serviço + DRE por profissional. Empty state em dre-por-profissional. | ⚠️ PARCIAL — ErrorMessage adotado em DRE/DRE-servico/DRE-profissional; **despesas/receitas/transações/fluxo-caixa/categorias ainda com `Erro: ` cru (#6)**. Empty states de receitas/despesas/metas/fluxo-caixa ainda em `<p>` plano (#7). |
| **J4 — Convidando profissional** | Empty state em team/page (membros) e convites pendentes. | ⚠️ PARCIAL — Membros OK; **convites pendentes (#5) ainda `<p>` plano**. |
| **J5 — Alerta de estoque** | StatusBadge em movimentações. EmptyState em insumos. | ⚠️ PARCIAL — Insumos OK; **movimentações empty state em `<p>` plano (#2)**. AlertasCard ainda mistura linguagens (#1) e some quando vazio (#3). |
| **J6 — Cancelamento/falta** | StatusBadge em comandas. ErrorMessage em fluxo-caixa. | ⚠️ PARCIAL — comandas OK; **fluxo-caixa erro cru (#6)**. |

**Conclusão por jornada:** nenhuma quebrou funcionalmente, mas todas as 6 têm pelo menos uma tela onde a usuária encontra a linguagem velha. O risco é **percepção de inconsistência** ("aqui é uma coisa, ali é outra") — exatamente o que a Sprint 5 prometeu eliminar.

---

## 4. Mobile-first (375px)

Verificado: nenhum componente novo da Sprint 5 introduz scroll horizontal em viewport 375px.

- `EmptyState.tsx`: `max-w-sm` na descrição (linha 57) limita texto a ~384px — em 375px não vaza.
- `ErrorMessage.tsx`: `flex items-start gap-3` + `flex-1` no texto — funciona.
- `error.tsx` global: `max-w-lg w-full` + `flex-col gap-3 sm:flex-row` — botões empilham em mobile.
- `Skeleton.tsx`: `w-full` em todos os variants.
- `Card`: `px-card-x` (24px) cada lado = 48px de padding horizontal em mobile. Em 375px sobram **327px úteis** — confortável para conteúdo.

**Não encontrei regressões mobile.** Touch targets do `Button size="default"` agora `h-11` (44px) — atende AA.

---

## 5. WCAG AA — checagem de contraste

`--muted-foreground: 30 8% 32%` (#5A5249) sobre `--background: 36 33% 97%` (#FAF8F5):
- Contraste calculado: ~7.4:1
- WCAG AA texto normal: ≥4.5:1 → **PASSA**
- WCAG AA texto pequeno (`text-xs` 12px): ≥4.5:1 → **PASSA**
- WCAG AAA texto normal: ≥7:1 → **PASSA**

Mudança de 40% para 32% de luminância foi suficiente. **Issue de contraste resolvido.**

FAB: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` — `ring-ring` é terracota (`#C66A38`) sobre primary (`#C66A38`) com offset background bege (`#FAF8F5`). O `ring-offset-2` cria um halo bege de 2px **entre** o botão primary e o ring terracota, garantindo contraste do anel focado contra o próprio botão. Funciona — mas o teste real é em campo. Recomendo validar em mobile com VoiceOver.

---

## 6. Tom-norte (mentora confiável) — análise de copy

| Texto | Tom | Veredito |
|-------|-----|----------|
| `error.tsx`: "Não foi possível carregar essa tela." | Direta, sem culpa | ✅ |
| `error.tsx`: "Pode ser uma queda momentânea da nossa infraestrutura..." | Honesta, técnica calibrada | ✅ |
| `ErrorMessage.tsx`: "Não conseguimos carregar agora." | Plural inclusivo, sem desculpa | ✅ |
| `ErrorMessage.tsx`: "Tente abrir essa tela de novo em alguns segundos." | Acionável | ✅ |
| `agenda-hoje-card.tsx`: "Aproveita pra rever o que vem essa semana ou agenda alguém novo." | Familiar, "pra" coloquial — mentora próxima, não chefe | ✅ |
| `team/page.tsx`: "Você ainda é a única pessoa no time" | Calorosa sem ser maternal | ✅ |
| `pacientes/page.tsx`: "Você ainda não tem pacientes" / "Cadastre quem atende você..." | "atende você" é **ambíguo** — quem é sujeito? Camila atende clientes, não o contrário | ⚠️ — sugiro "Cadastre quem você atende" |
| `servicos/page.tsx`: "Você ainda não tem serviços" / "...A partir daí o KEYRA calcula sua margem por serviço." | Promessa concreta, motivacional | ✅ |
| `comandas/page.tsx`: "A comanda nasce automaticamente quando você marca um atendimento como concluído." | Educativa sem condescendência | ✅ |
| `dre-por-profissional/page.tsx`: "...o lucro de cada profissional aparece aqui automaticamente." | Reforça tese do produto | ✅ |

**Único reparo:** `pacientes/page.tsx:128` — trocar "Cadastre quem atende você" por "Cadastre quem você atende".

---

## 7. Aprovações da Sprint 5 (não mexer)

1. **`<StatusBadge>` universal** — 5 domínios cobertos com helpers de tradução pt-BR. Excelente decisão de manter cores azul/âmbar/etc (idealizadora liberou em 2026-05-01) ao invés de forçar tudo para terracota/sálvia. A semântica diferenciada (`agendado` ≠ `realizado` ≠ `cancelado`) ficou legível.
2. **`<EmptyState>`** com prop `action: {label, href|onClick}` — API certa. Migração para `next/link` + `<Button>` resolve o "use o botão acima" da auditoria-base.
3. **`<Skeleton>` + `KPICardSkeleton` + `TableSkeleton`** — três variants resolvem 90% dos casos. `loading.tsx` em 8 rotas é cobertura sólida.
4. **`error.tsx` global** — copy excelente, `reset()` integrado, link de fallback para dashboard. Captura `digest` para suporte. Não inventou Sentry mas deixou TODO honesto.
5. **`Button size="default"` h-11** — ponto técnico cirúrgico. Toda interação ganha 4px. Mobile 375px agradece.
6. **`--muted-foreground` 32%** — passa AA inclusive AAA. Decisão correta.
7. **Tokens semânticos de spacing** — `card-x`, `card-y`, `stack`, `section`, `page`. Aplicação no `Card` (shadcn) e `KPICard` é consistente. Não forçou refactor de páginas.
8. **`<ErrorMessage>`** — copy + componente. O detalhe técnico em `font-mono` text-[11px] resolve o "Erro: PG_FOREIGN_KEY..." que era ruído visual.
9. **`docs/ux/copy-guidelines.md`** — documento que estava faltando. Tradução técnico→humano ancora futuras stories.

---

## 8. Recomendação concreta antes da Sprint 6

Lista numerada, ordem de execução, tempo estimado realista:

| # | Ação | Tempo | Bloqueia Sprint 6? |
|---|------|-------|---------------------|
| 1 | Migrar 5 erros crus para `<ErrorMessage>` (issue #6: despesas, transacoes, categorias, custos-fixos, fluxo-caixa) | 20 min | Sim — quebra promessa da Story 5.6 |
| 2 | Migrar 9 empty states `<p>` plano para `<EmptyState>` (issue #7: receitas, despesas, metas, fluxo-caixa, convites, comanda-edit-form sem-itens, dre-por-servico, custos-fixos, indicadores-card) | 60 min | Sim — quebra promessa da Story 5.3 |
| 3 | Migrar empty state movimentações (issue #2) | 5 min | Sim |
| 4 | Migrar empty state dashboard noData (issue #4) | 10 min | Sim |
| 5 | Migrar empty state convites pendentes em team/page (issue #5) | 5 min | Sim |
| 6 | Migrar `MetaCard` empty state (issue #14) | 10 min | Sim |
| 7 | Empty state positivo do `AlertasCard` (issue #3) — não retornar `null`, mostrar reforço calmo | 15 min | Sim — citado na auditoria-base e ainda em aberto |
| 8 | Refactor `dashboard/alertas-card.tsx` para usar tokens semânticos ao invés de `border-blue-500` (issue #1). **Alternativa:** adotar `<AlertCard>` direto. | 30 min | Sim — duas fontes de verdade no mesmo componente é confuso |
| 9 | FAB com `<Link href="/agenda?novo=1">` (issue #8) — placeholder até FAB contextual da Sprint 6 | 10 min | Sim — Camila não consegue criar agendamento rápido em mobile |
| 10 | Trocar `p-6` por `px-card-x py-card-y` em `KPICardSkeleton` (issue #9) | 2 min | Não — cosmético |
| 11 | Corrigir copy "Cadastre quem atende você" → "Cadastre quem você atende" (Seção 6) | 1 min | Não |
| 12 | `ErrorMessage`: quebrar detalhe técnico em parágrafo separado para evitar overflow horizontal em mobile (issue #12) | 5 min | Não — UX edge case |

**Total bloqueador (1-9): ~3h de execução real** (com testes manuais e typecheck).
**Total cosmético (10-12): ~10 min.**

Sugiro abrir uma **Story 5.7 — Higienização de cobertura** para fechar os pontos 1-9. Sprint 5 fica realmente "completa" e a Sprint 6 (camada editorial: serif, motion, alert hierarchy avançada) parte de uma base sem furos.

---

## 9. Veredicto final

**Score por dimensão:**

| Dimensão | Antes (auditoria-base) | Agora | Delta |
|----------|------------------------|-------|-------|
| Brandbook compliance | 7.0 | 7.5 | +0.5 (StatusBadge consolidado) |
| Loading states | 3.0 | 8.5 | +5.5 (8 loading.tsx + Skeleton) |
| Error handling | 6.0 | 7.5 | +1.5 (error.tsx + ErrorMessage, mas 5 escaparam) |
| Empty states | 5.0 | 7.0 | +2.0 (EmptyState bem feito, mas 10 escaparam) |
| Touch targets / WCAG | 6.0 | 8.5 | +2.5 (h-11 + 32% muted) |
| Hierarquia visual | 6.5 | 7.0 | +0.5 (tokens de spacing) |
| Layout condicional | 6.0 | 6.0 | 0 (FAB ainda morto) |
| Alert hierarchy | 4.0 | 4.5 | +0.5 (StatusBadge no pill, mas borda azul, sem 3+5+5, sem dismiss, sem empty positivo) |
| **Geral** | **5.4** | **6.8** | **+1.4** |

**Recomendação:** **NÃO abrir Sprint 6 sem Story 5.7.** A diferença entre 6.8 e 8.0+ é cobertura, não invenção — 3h de trabalho fecham o que a Sprint 5 prometeu. Abrir a Sprint 6 com base inconsistente força o trabalho da camada editorial a "remendar" também os furos da camada de higienização. Mais barato fechar a 5 antes.

**Próxima ação:** `@sm *draft 5.7` com escopo das 9 ações bloqueantes.
