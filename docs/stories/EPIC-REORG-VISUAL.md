# EPIC-REORG-VISUAL — Reorganização visual e estrutural completa (landing + app)

> **Status:** Implementado em 2026-07-08 (branch `feat/reorg-visual`, 8 commits — 1 por story).
> **Origem:** mapeamento completo código + produção (desktop 1440px e mobile 375px, anônimo e
> autenticado) executado em 2026-07-08. Plano aprovado pelo Luiz com 3 decisões explícitas.
> **Gates pendentes:** QA gate (@qa) + smoke duplo com a idealizadora + push via @devops.

---

## Contexto

O produto estava funcional e a fundação de marca sólida, mas o mapeamento encontrou:
**quebras reais em produção** (CTA "Lançar" do dashboard → 404), **incoerências estruturais**
(títulos duplicados em /financeiro e /servicos, nomenclatura colidente entre Sidebar e /mais,
escala de headings divergente, datas com preposição capitalizada) e a **landing violando a
regra canônica do design system** (títulos à esquerda com vazio à direita em telas largas,
headlines multi-sentença sem quebra por sentença).

### Decisões do Luiz (AskUserQuestion, 2026-07-08)

1. **Landing segue a regra canônica** — títulos centralizados + `.hl-s` + coluna equilibrada.
2. **Taxonomia de navegação: "Atendimentos · Clientes · Catálogo"** (URLs não mudam).
3. **CTA "Lançar" → página seletora `/financeiro/lancar`** (receita/despesa).

---

## Stories (todas implementadas, aguardando gates)

| Story | Escopo | Commit |
|-------|--------|--------|
| reorg.1 | 404 do CTA Lançar (seletora nova), href tipado como `Route`, toast "Abrir comanda", link Pagamentos→Transações, `(app)/loading.tsx` raiz, link "Ver planos" em /configuracoes, títulos de aba auth sem duplicação | `fix: corrige 404 do CTA Lançar...` |
| reorg.2 | Sidebar "/comandas"→"Atendimentos", /mais alinhado, h1/empty state de /comandas, proxy += /comandas e /team | `feat: taxonomia canônica...` |
| reorg.3 | Layout dono do h1 (financeiro/servicos), escala de headings canônica (h1 `text-display` · sub-rota `h2 text-h2` · `text-display-hero` reservado), heading próprio em /transacoes, `capitalizarPrimeira()` p/ datas pt-BR, "Proprietária" | `feat: layout dono do h1...` |
| reorg.4/5 | `<StatCard>`/`<StatCardsSection>` canônicos em components/keyra (ícone por chave string, RSC-safe); comandas-stats (piloto) e catalog-stats migrados | `feat: StatCard canônico...` |
| reorg.6 | Landing: títulos/eyebrows centralizados, `.hl-s` em 10 sentenças, blocos narrativos com `margin-inline:auto`, hierarquia h2/h3 corrigida | `feat(landing): títulos canônicos...` |
| reorg.7 | Landing: escala `--space-*` espelhando tokens.json (63 declarações, valores idênticos), breakpoints 768/1024, CSS morto removido | `refactor(landing): spacing tokenizado...` |
| reorg.8 | Landing: link "Entrar" na nav (visível no mobile), carimbo interno removido, "Para Mentora"→"Para o Executive" | `feat(landing): link Entrar...` |
| reorg.9 | amber-950→cocoa-900, check C1b no CI (shades de amber fora dos tokens), Turnstile theme light, docstring do login | `fix(auth): tokens corretos...` |

### Desvio consciente do plano (registrado)

- **reorg.5 parcial:** `SummaryCard`/`SummaryCell`/`MiniStat` (dre, transacoes, receitas,
  fluxo-caixa, team, custos-fixos) **não** foram migrados para `StatCard` — são um padrão
  visual distinto (célula de resumo sem ícone, acoplada a tabelas). Migrá-los muda a
  densidade visual dessas telas e exige decisão de design da idealizadora. Fica como
  follow-up (abaixo). Os dois duplicados exatos (comandas/catálogo) foram unificados.

---

## Verificação executada (2026-07-08)

- `pnpm typecheck` ✅ · `pnpm lint --max-warnings 0` ✅ (rodados a cada story)
- `./scripts/check-design-system.sh` ✅ (incl. novo C1b; fixture de regressão validada)
- Landing verificada por **geometria DOM** em servidor local: 6 títulos centralizados com
  desvio 0.0px, sentenças `.hl-s` em linhas próprias, blocos com folgas simétricas
  (268px/268px), spacing computado idêntico ao original após tokenização
- Produção (pré-mudança) navegada autenticada: 404 do CTA confirmado, headers duplicados
  confirmados, datas "8 De Jul" confirmadas

### Pendente para Done (critério não negociável)

1. `pnpm build` + `./scripts/check-rsc-boundaries.sh` verdes no CI
2. **Smoke duplo** com a idealizadora pós-deploy: mobile real 375px + desktop, aba anônima
   (landing + login) e autenticada (dashboard→agenda→atendimento→comanda→pagamento→
   transações→DRE), em dois momentos distintos
3. Pós-deploy da landing: `curl -s https://usekeyra.com/ | grep 'hl-s'` (marcador da versão
   nova — proteção contra edge cache servindo versão antiga) + hard reload anônimo
4. Validação da idealizadora nos pontos de decisão visual: degrau h2 `text-h2` (24px) nas
   sub-rotas do financeiro (fallback: `text-h1` 32px), exceções editoriais de spacing da
   landing (120/72/56/28/14px comentadas no código)

---

## Follow-ups (fora do escopo deste epic)

| Item | Detalhe | Dono da decisão |
|------|---------|-----------------|
| Migrar `SummaryCard`/`SummaryCell`/`MiniStat` para padrão canônico | Muda densidade visual de 6 telas; exige smoke de design | Idealizadora + @qa |
| Nomes de plano divergentes | App usa "Start/Crescimento/Autoridade" (configuracoes/page.tsx:30-36); landing usa "Essencial/Profissional/Executive" | Idealizadora + @growth-product |
| `robots index:false` | `layout.tsx:66-70` — remover apenas no go-live autorizado | Idealizadora |
| Placeholders declarados | "Editar (em breve)" (event-detail-sheet:167), patient-package-card "Em breve", gênero por heurística (patient-header-card) | @sm (stories futuras) |
| Token "positivo" unificado | `text-lucro`/`text-prejuizo` vs `success-leaf/deep` — padronizar quando migrar os Summary* | @dev + @finance-domain-expert |
| `Cache-Control` explícito para `/` e `/landing.html` | Mitigar edge cache da Vercel (houve incidente); avaliar `headers()` no next.config.ts | @devops |
| TOC da landing em 375px reais | Com "Entrar" + CTA, a nav pode quebrar em 2 linhas em telas muito estreitas (flex-wrap cobre); confirmar no device real | Smoke idealizadora |

## Gates de especialista aplicáveis

- **@qa \*qa-gate** — obrigatório antes do merge (toca Server Action, client boundary, CI).
- **Gate financeiro leve** (@finance-domain-expert) — reorg.4/5 tocou apresentação de
  telas financeiras (sem fórmula alterada); confirmar no gate.
- **@growth-product \*review-growth** — reorg.8 tocou copy de plano/CTA da landing.
- **@devops \*push** — push/PR exclusivos.
