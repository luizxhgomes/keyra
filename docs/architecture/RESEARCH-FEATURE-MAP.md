# KEYRA — Mapa de Pesquisa → Features (Research-to-Implementation Map)

> **Autor:** @architect (Aria) — arquitetando o futuro 🏗️
> **Data:** 2026-04-20
> **Versão:** v1.0 — consolidação inicial das 7 pesquisas competitivas
> **Propósito:** transformar 66+ plays extraídos de pesquisas em um plano de execução proporcional ao estado atual do KEYRA (Phase 0 ✅, Phase 1 em 40%), com jornada do usuário, modelo de dados e estrutura condicional de fases.
> **Single source of truth (complementar):** [IMPLEMENTATION-MAP.md](../IMPLEMENTATION-MAP.md), [EPIC-0-KEYRA-IMPLEMENTATION.md](../stories/EPIC-0-KEYRA-IMPLEMENTATION.md), [PRD-KEYRA.md](../prd/PRD-KEYRA.md), [SCHEMA.md](./SCHEMA.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 0. Sumário executivo

| Dimensão | Achado |
|----------|--------|
| Pesquisas analisadas | **7** (2 estruturadas em pipeline 4 fases + 5 reverse engineerings single-file) |
| Plays/features extraídos | **66+** plays priorizados (30 Trinks + 36 Belle) + reforços de 4 single-files |
| Estado KEYRA | Phase 0 **100%** · Phase 1 **40%** (Stories 1.1/1.2 entregues; 1.3/1.4/1.5 pendentes) · Phases 2-8 ⏸️ |
| Schema atual | 21 tabelas · 100% RLS · 6 views · 19 migrations aplicadas · triggers de automação financeira prontos |
| Features **já cobertas** pelo schema atual | **~70%** do MVP (pilar Catálogo+Agenda+Comanda+Transação+DRE) |
| Features **novas** extraídas das pesquisas | **47** candidatas, classificadas em 3 classes (Encaixe, Expansão, Posterior) |
| Fases existentes afetadas | Phase 1, 2, 3, 4 (MVP) · Phase 5, 6, 7 (pós-MVP) |
| Novas fases sugeridas | **0** (todas as features cabem nas 8 fases existentes) |
| Novas tabelas sugeridas | **6** (packages, pricing_simulations, whatsapp_templates, acquirer_reconciliations, consents, customer_documents) |
| Ajuste de escopo | Reforço de features-âncora (Precificação, DRE CFO, Pacote auditável, WhatsApp Cloud API, Pix) — não re-platform |

**Conclusão arquitetural:** nenhuma pesquisa invalida decisões de Phase 0. Elas **reforçam** a tese, **expandem** features em pilares já modelados, e **antecipam** 3 features críticas (Precificação, WhatsApp Cloud API oficial, Pacote auditável) que devem entrar no MVP — não pós-MVP.

---

## 1. Inventário das 7 pesquisas

### 1.1 Pipeline completo (research-lead, 4 fases)

| # | Pesquisa | Caminho | Fases entregues | Valor para arquitetura |
|---|----------|---------|-----------------|------------------------|
| 1 | **Trinks** (incumbente Stone) | `docs/research/trinks-analysis-2026-04-16/` | 01-scope → 02-data-collection → 03-analysis → **04-synthesis** (4 docs) | **30 plays priorizados.** Gap-mapping do líder: o que o líder não faz, como atacar. |
| 2 | **Belle Software** (Geinffo-SC) | `docs/research/belle-software-2026-04-16/` | 01-scope → 01-site-map → 02-data-collection → 03-analysis → **04-synthesis** (4 docs) | **36 plays priorizados.** Base com 17 anos, 2.700 clínicas, 4 arestas públicas atacáveis. |

**Entregáveis de síntese (comuns):** `EXECUTIVE-SUMMARY.md` + `FINDINGS-MATRIX.md` + `KEYRA-OPPORTUNITIES.md` + `INDEX.md`.

### 1.2 Reverse engineering single-file (strategic-research)

| # | Pesquisa | Caminho | Função |
|---|----------|---------|--------|
| 3 | **Clínica Experts DEZ** (concorrente-sombra estética + IA Anna) | `docs/research/2026-04-16-clinica-experts-dez-sistema-reverse-engineering.md` | LP + produto AI-first. **Concorrente mais próximo** por verticalização e padrão "all-in-one + IA". |
| 4 | **Conta Azul** (anti-padrão ERP genérico) | `docs/research/2026-04-12-conta-azul-reverse-engineering.md` | Referência "o que não fazer" — ERP genérico, pós-operação. |
| 5 | **Kamino** (vertical estética) | `docs/research/2026-04-12-kamino-reverse-engineering.md` | Concorrente vertical. |
| 6 | **Gestek** (vertical estética) | `docs/research/2026-04-12-gestek-reverse-engineering.md` | Concorrente vertical pequeno. |
| 7 | **(Belle complementar)** — o mesmo pipeline fase 1 inclui research de produto, stack, pricing, brand | embutido na #2 | — |

### 1.3 Diferença metodológica — quando cada uma foi usada

| Critério | Pipeline completo | Single-file |
|----------|-------------------|-------------|
| Objetivo | Decisões estratégicas amplas, mapear mercado | Desconstruir 1 ativo (LP, produto) |
| Rastreabilidade | Alta (fonte por finding) | Média (consolidada) |
| Reusabilidade | Alta (por fase) | Baixa (único arquivo) |
| Profundidade | Multi-agente (analysts + synthesis) | Unit-agent (strategic-research `full`) |
| Quando usar | Concorrente-âncora (Trinks, Belle) | Concorrente lateral ou LP específica |

---

## 2. Matriz consolidada de features extraídas

Cada linha abaixo é um play extraído de uma pesquisa, mapeado para a realidade do KEYRA (fase/story/tabela) e classificado em 3 classes:

- **🟢 Encaixe** — feature já prevista no PRD/Schema; pesquisa **reforça** e adiciona detalhe.
- **🟡 Expansão** — feature nova, mas encaixa em fase existente com ajuste mínimo (nova story ou nova coluna).
- **🔵 Posterior** — feature de maior porte; entra em Phase 5+ ou nova story dedicada.

### 2.1 Pilar 1 — Agenda & Pacientes (Phase 2)

| # | Feature | Origem | Classe | Destino | Delta schema |
|---|---------|--------|--------|---------|--------------|
| A1 | Pré-pagamento Pix no agendamento online (QR dinâmico) | Trinks P1.10 / Belle 2.13 | 🟡 Expansão | Phase 2 Story 2.8 (nova) | `appointments.prepayment_id` FK → `payments` |
| A2 | Lista de espera automática (WhatsApp quando vaga abre) | Trinks P1.11 | 🟡 Expansão | Phase 2 Story 2.9 (nova) | Nova `appointment_waitlist` |
| A3 | Anamnese + foto antes/depois com privacidade (URL pré-assinada + LGPD) | Trinks P1.14 / Belle 2.14 | 🔵 Posterior | Phase 5 Story 5.6 (nova) | Nova `customer_documents` (bucket S3/Supabase Storage + `consent_id` FK) |
| A4 | Importador Trinks/Belle → KEYRA (migração em 1 clique) | Trinks P1.13 / Belle 3.4 | 🔵 Posterior | Phase 5 Story 5.7 (nova) | View temporária `v_import_staging` |
| A5 | Prontuário financeiro por cliente (LTV, ticket médio, frequência) | Trinks / PRD FR-PA-03 | 🟢 Encaixe | Phase 6 Story 6.6 | View `v_customer_ltv` |
| A6 | Termo de consentimento LGPD assinado digital | Belle (F62) | 🟡 Expansão | Phase 1 Story 1.6 (nova) | Nova `consents` (usuário/cliente × documento × timestamp) |

### 2.2 Pilar 2 — Serviços, Pacotes & Precificação (Phase 2 + Phase 5)

| # | Feature | Origem | Classe | Destino | Delta schema |
|---|---------|--------|--------|---------|--------------|
| B1 | **BOM editável por procedimento** (insumos × quantidade → custo direto) | Trinks P1.5 / Belle 2.1 | 🟢 Encaixe | Phase 2 Story 2.3 (enriquecer) | Schema já tem `service_supplies` — enriquecer UI |
| B2 | **Motor de precificação: custo + markup + margem-alvo + simulador** | Trinks P1.1 / Belle 2.1 | 🔵 Posterior → antecipar p/ **Phase 4.5** | Nova Phase 4.5 Story 4.10 | Nova `pricing_simulations` (histórico de cenários) + view `v_service_profitability` |
| B3 | Pacotes com análise de margem por sessão | Trinks P1.8 / Belle Conference-bug | 🟡 Expansão | Phase 5 Story 5.2 (enriquecer) | Nova `service_packages` + `package_sessions_ledger` (append-only — defesa contra bug "12 em vez de 10") |
| B4 | **Controle auditável de pacote/sessão** (append-only log + hash encadeado) | Belle 2.4 (dor RA) | 🟡 Expansão | Phase 5 Story 5.2 (nova aresta) | Usar `package_sessions_ledger` com `prev_hash` + `current_hash` |
| B5 | Lote + validade em estoque (Anvisa-ready, FIFO) | Trinks P1.6 / Belle 2.12 | 🔵 Posterior | Phase 5 Story 5.8 (nova) | `supplies` + novas colunas `lot_number`, `expires_at`; `inventory_movements.lot_number` |
| B6 | Onboarding vertical pré-configurado (40 procedimentos estética já cadastrados) | Trinks P3.4 | 🟡 Expansão | Phase 1 Story 1.2 (enriquecer onboarding existente) | Nova função SQL `seed_default_services(org_id)` |

### 2.3 Pilar 3 — Comanda, Pagamentos & Financeiro (Phase 3)

| # | Feature | Origem | Classe | Destino | Delta schema |
|---|---------|--------|--------|---------|--------------|
| C1 | Split de pagamento Pix + cartão na mesma comanda | PRD gap #6 / idealizadora | 🟢 Encaixe | Phase 3 Story 3.2 (já previsto — decisão UX pendente) | Schema já suporta: `commands 1:N payments` |
| C2 | Pagamento a fornecedor via Pix dentro do app | Trinks P1.9 | 🔵 Posterior | Phase 7 Story 7.2b (nova) | Nova `vendor_payments` + extensão `transactions.origin=vendor_payment` |
| C3 | **Conciliação multi-adquirente automática** (Stone+Cielo+PagSeguro+SumUp+InfinitePay) | Trinks P1.4 | 🔵 Posterior | Phase 7 Story 7.7 (nova) | Nova `acquirer_reconciliations` + `acquirer_statement_imports` |
| C4 | Integração contábil (SPED/OFX/ContaAzul/Nibo export) | Belle 2.9 | 🔵 Posterior | Phase 7 Story 7.8 (nova) | Server Action de export; sem nova tabela |
| C5 | Open Finance + extratos em tempo real | Belle 2.10 | 🔵 Posterior | Phase 7 Story 7.9 (nova) | Nova `bank_connections` + reuse `transactions.origin=bank_import` |
| C6 | Pró-labore explícito no DRE + separação PF/PJ | Trinks P1.12 / Belle 2.11 | 🟡 Expansão | Phase 4 Story 4.1 (enriquecer DRE) | Nova categoria no seed `seed_default_chart_of_accounts` (kind=operating_expense, tag=pro_labore); linha própria na view `v_dre_monthly` |

### 2.4 Pilar 4 — DRE, Dashboard & Inteligência (Phase 4 + Phase 6)

| # | Feature | Origem | Classe | Destino | Delta schema |
|---|---------|--------|--------|---------|--------------|
| D1 | **Tela única "Meu Dia" com 5 números-hero** (mobile-first, zero gráfico) | Trinks P1.2 / Belle 2.6 / UX idealizadora | 🟢 Encaixe | Phase 4 Story 4.4 (já previsto) | View `v_dashboard_kpis` já existe |
| D2 | **DRE "CFO-grade" tela única** (Receita → CMV → Custo fixo → Lucro bruto → Pró-labore → Impostos → Lucro líquido) | Trinks P1.3 / Belle 2.2 | 🟢 Encaixe | Phase 4 Story 4.1 (enriquecer) | View `v_dre_monthly` já existe; adicionar linha pró-labore + impostos (SIMPLES estimado) |
| D3 | **Fluxo de caixa projetado (forward 30/60/90 dias)** | Belle 2.3 | 🟡 Expansão | Phase 4 Story 4.5 (nova) | View `v_cashflow_forecast` (contas a receber futuras + contas a pagar recorrentes) |
| D4 | Metas em tempo real com push em 50/80/100% + comissão escalonada (40/50/60%) | Trinks P1.7 | 🟢 Encaixe | Phase 4 Story 4.8 (enriquecer) | `goals` já existe; nova `goal_tiers` para escalonamento |
| D5 | Rentabilidade por horário (heatmap lucro/hora) — mas com números, não só cor | Trinks P6.3 | 🟢 Encaixe | Phase 6 Story 6.3 | View `v_profit_by_hour` |
| D6 | Rentabilidade por profissional com alertas | Trinks P6.4 | 🟢 Encaixe | Phase 6 Story 6.4 | View `v_dre_by_professional` já existe; adicionar thresholds |
| D7 | Cenários what-if (+10% upsell, +5 agendamentos) | Trinks P6.2 | 🟢 Encaixe | Phase 6 Story 6.2 | Server Action stateless; sem nova tabela |
| D8 | **AI copilot financeiro nativo** (sugere preço, aponta risco de caixa, prediz churn) | Belle 2.8 / Clínica Experts Anna | 🔵 Posterior | Phase 6 Story 6.8 (nova) | Novas `ai_insights` (pré-computadas) + `ai_copilot_sessions` |
| D9 | AI copilot de ativação no trial (detecta inatividade) | Belle play 14 | 🔵 Posterior | Phase 5 Story 5.9 (nova) | Server-side job Inngest; sem nova tabela |

### 2.5 Comunicação, Compliance & Segurança

| # | Feature | Origem | Classe | Destino | Delta schema |
|---|---------|--------|--------|---------|--------------|
| E1 | **WhatsApp Cloud API Meta oficial incluso no plano base** (template approved + opt-in) | Belle 2.5 / 3.3 (aresta pública) | 🔵 Posterior → antecipar p/ **Phase 3.5** | Nova Phase 3.5 Story 3.9 | Nova `whatsapp_templates`, `whatsapp_messages`, `whatsapp_opt_ins` |
| E2 | Exportação total de dados self-service (LGPD, ZIP em 60s) | Belle 2.14 / ADR-019 | 🟡 Expansão | Phase 4 Story 4.12 (nova) | Server Action + job Inngest; sem nova tabela |
| E3 | Status page + SLA público + DPO nomeado | Belle 3.10 / NFR | 🟡 Expansão | Phase 4 Story 4.13 (nova) | Extra-schema (BetterStack); sem nova tabela |
| E4 | Política de dados + portabilidade + delete self-service | ADR-019 / Belle 2.14 | 🟢 Encaixe | Phase 4 Story 4.14 (já previsto em ADR-019) | Usa `audit_log` existente |
| E5 | NFe/NFS-e com retry idempotente + lock transacional (evitar duplicata) | Trinks P4.4 | 🔵 Posterior | Phase 8 Story 8.x | Nova `nfse_attempts` (idempotency_key + status) |

### 2.6 Narrativa, GTM & Pricing (execução — não-schema)

| # | Feature/Play | Origem | Classe | Destino (narrativa, não código) |
|---|---|---|---|---|
| G1 | Categoria "Sócia financeira da esteticista" / "CFO para estética" | Belle 4.1 / Trinks P2.1 | — | Marketing site + LP |
| G2 | Pricing público em todas as faixas + calculadora interativa | Belle 3.1 / Trinks P3.1 | 🟡 Expansão | Phase 5 Story 5.10 — página `/pricing` pública |
| G3 | Zero fidelidade + cancelamento self-service 1-clique | Belle 3.2 / Trinks P3.2 | 🟡 Expansão | Phase 5 Story 5.11 — página "cancelar assinatura" |
| G4 | Trial 30 dias (vs Trinks 5d / Belle 14d com extensão silenciosa) | Belle 3.5 / Trinks P3.3 | 🟢 Encaixe | `organizations.trial_ends_at` já existe; decisão de duração = 30 dias |
| G5 | Plano único all-inclusive (WhatsApp + NFS-e + precificação sem add-ons) | Belle 3.3 | — | Decisão de produto (ajustar `organizations.plan` enum) |
| G6 | 5 LPs de trial segregadas por canal (/trial-organico, /trial-meta, etc) | Belle 3.6 | — | Marketing site (fora do app) |
| G7 | SEO sniper + founder-led content diário | Belle 3.7 / 4.4 | — | Marketing contínuo |
| G8 | Identidade visual nude/dourado/orgânico (vs azul corporativo Belle) | Belle 4.7 | 🟢 Encaixe | Já aplicado — paleta terracota/sálvia (Story 1.1) |
| G9 | Tom íntimo afetivo pt-BR + guia de voz (checklist de acentuação) | Belle 4.3 / memória | 🟢 Encaixe | Já em uso (CLAUDE.md regra primária) |

---

## 3. Extração por categoria (consolidação)

### 3.1 O que as pesquisas **confirmaram** do PRD atual

1. **"Lucro por serviço" como diferencial-âncora** — Trinks e Belle não têm. View `v_dre_by_service` já está pronta.
2. **Tela única com números absolutos** — alinhado com princípio UX da idealizadora. Trinks tem 130+ relatórios; Belle tem 24 módulos.
3. **RLS multi-tenant no banco** — Belle opera sem isso no legado (bugs reincidentes); nossa abordagem está correta (Supabase RLS + FORCE).
4. **Supabase como stack** — confirmado (Belle usa stack legada ASP.NET/PHP; Trinks usa .NET).
5. **Terracota/sálvia (não azul corporativo)** — confirmado como diferencial visual.
6. **Automação via triggers no banco** — confirmado como diferencial técnico (concorrentes têm bug por código manual).

### 3.2 O que as pesquisas **pedem para antecipar** ao MVP (ou quase-MVP)

| # | Feature | Motivo para antecipar |
|---|---------|----------------------|
| B2 | **Motor de precificação com margem-alvo** | Feature-âncora universal (zero concorrente tem). Se sai só em Phase 5, o pitch perde o core-arg "sobra mais". |
| E1 | **WhatsApp Cloud API oficial** | Trinks tem; Belle tem em zona cinza (bane números). Sem isso, KEYRA fica parado em "não avisa cliente". |
| B4 | **Pacote auditável** (append-only ledger) | Bug público reincidente da Belle — promessa de marca "zero discrepância" exige a feature no dia 1 se pacotes existirem. |
| D2 | **DRE CFO-grade com pró-labore** | Tabu narrativo dos concorrentes. Encaixa em Phase 4 com pequeno ajuste na view. |
| D3 | **Fluxo de caixa projetado forward** | Belle só tem realizado. Diferencial visível e encaixa em Phase 4. |

### 3.3 O que as pesquisas **adicionam como novo** (não estava no PRD)

| # | Feature | Comentário arquitetural |
|---|---------|-------------------------|
| A1 | Pré-pagamento Pix no agendamento online | Redução de no-show; ROI direto. Depende de Asaas (Phase 7) — **adiantar contratação Asaas para Phase 3** ou fazer via Pix Copia-e-Cola manual. |
| A2 | Lista de espera automática | UX simples; encaixa na agenda. |
| A3 | Anamnese + foto antes/depois com LGPD | Nova tabela `customer_documents` + bucket Supabase Storage + URL pré-assinada + termo LGPD. |
| A4 | Importador Trinks/Belle | GTM-lever forte; exige engenharia de parsing. |
| A6 | Termo de consentimento LGPD | `consents` table — registra TOS + Política de Privacidade + uso de imagem (anamnese). |
| B3/B4 | Pacotes com audit ledger | `service_packages` + `package_sessions_ledger` (append-only com hash). |
| B5 | Lote + validade em estoque | Colunas novas em `supplies` + `inventory_movements`. |
| C2 | Pagamento a fornecedor no app | `vendor_payments` table. |
| C3 | Conciliação multi-adquirente | `acquirer_reconciliations` + parsers de CSV/OFX. |
| D8/D9 | AI copilots | `ai_insights` + `ai_copilot_sessions` + orquestração LLM (Phase 6). |
| E1 | WhatsApp oficial | `whatsapp_*` tabelas + integração Cloud API Meta. |
| E5 | NFe/NFS-e com idempotência | `nfse_attempts`. |

---

## 4. Jornada do usuário end-to-end (completa)

> A jornada é escrita da perspectiva da **idealizadora-persona** — dona de clínica de estética solo ou com 1-3 profissionais. Cada etapa mostra: **evento do usuário → estado no sistema → tabelas tocadas → story que entrega**.

### 4.1 Fase A — Aquisição (marketing site, antes do app)

```
Usuário descobre KEYRA (SEO/conteúdo/indicação)
  ↓
Visita marketing-site (/pricing público + calculadora)
  ↓
Escolhe plano → clica "Começar trial 30 dias"
  ↓
Insere email → magic link → login
```

**Tabelas tocadas:** `auth.users` (Supabase).
**Stories:** G2 (pricing público) · 1.2 (magic link) ✅ entregue.

### 4.2 Fase B — Onboarding (primeiros 10 minutos)

```
1. Email + nome → criar conta                  → auth.users
2. Nome da clínica + slug                      → organizations
3. Trial 30 dias ativado                       → organizations.trial_ends_at = now + 30d
4. Auto: seed plano de contas para estética    → expense_categories (≈30 entradas)
5. Auto: seed 40 procedimentos pré-cadastrados → services + service_categories  [NOVO — B6]
6. Auto: adicionar owner como membership       → memberships (role=owner)
7. Aceitar TOS + LGPD                          → consents  [NOVO — A6]
8. Onboarding guiado:
   8a. Cadastrar 1º profissional (ou ela mesma) → professionals
   8b. Cadastrar 1 paciente de teste             → customers
   8c. Agendar 1 atendimento de teste            → appointments
   8d. Simular atendimento "realizado"           → commands + command_items (trigger)
   8e. Registrar pagamento Pix                    → payments + transactions (trigger)
   8f. Ver DRE com 1 linha                        → v_dre_monthly
9. Dashboard revelado com Meu Dia preenchido   → v_dashboard_kpis
```

**Stories:** 1.2 ✅ (criar org) · **NOVO** 1.2 enriquecer (seed services) · **NOVO** 1.6 (consents) · 2.1-2.7 · 3.1-3.3 · 4.4.

### 4.3 Fase C — Ciclo operacional diário

```
Manhã:
  Abre app → Meu Dia com 5 números                       → v_dashboard_kpis
  Ve agenda do dia                                        → appointments where starts_at::date = today
  Produtos acabando (alerta)                              → supplies where current_stock <= reorder_level

Durante o dia:
  Cliente chega → marca como "done" no app               → appointments.status = done
    → TRIGGER: cria commands + command_items              → commands, command_items
    → TRIGGER: recompute subtotal                         → commands.subtotal
  Cliente paga (Pix/cartão/split)                        → payments (1:N)
    → TRIGGER: cria transactions                          → transactions (credit, origin=command_payment)
    → TRIGGER: baixa insumos (rateio)                     → inventory_movements (negative)
    → TRIGGER: atualiza paid_amount e status              → commands.status = paid

  Se cliente não aparece → marca "no_show"               → appointments.status = no_show
    → NÃO gera comanda (trigger guarda)
    → Lista de espera aciona WhatsApp (se config)        → whatsapp_messages  [NOVO — A2 + E1]

Final do dia:
  Ver lucro do dia                                        → v_dre_monthly (filtered)
  Ver metas progress                                      → goals × v_dashboard_kpis
```

**Stories:** 2.5 · 2.6 · 3.1 · 3.2 · 3.3 · 3.4 · 4.4 · 4.5 · **NOVO** 2.9 (waitlist) · **NOVO** 3.9 (WhatsApp).

### 4.4 Fase D — Ciclo mensal (CFO-grade)

```
Final do mês:
  1. Ver DRE consolidado (tela única)                    → v_dre_monthly
      · Receita bruta
      · (-) CMV (custo de insumos consumidos)
      · (-) Comissões pagas
      · = Lucro bruto
      · (-) Custos fixos (aluguel, luz, folha)
      · (-) Pró-labore  [NOVO — C6]
      · (-) Impostos estimados (SIMPLES)  [NOVO — C6]
      · = Lucro líquido
  2. DRE por serviço (drill-down)                        → v_dre_by_service
  3. DRE por profissional (comissões + ranking)          → v_dre_by_professional
  4. Fluxo de caixa projetado 30/60/90d                  → v_cashflow_forecast  [NOVO — D3]
  5. Comparativo: mês atual vs anterior                  → derivado
  6. Atingiu meta? + push de conquista                   → goals
  7. Exportar DRE para contador (PDF/OFX/SPED)           → export action  [NOVO — C4]
```

**Stories:** 4.1 (enriq pró-labore + impostos) · 4.2 · 4.3 · **NOVO** 4.5 (forecast) · 4.7 · 4.8 · **NOVO** 7.8 (export contábil).

### 4.5 Fase E — Crescimento & decisão (pós-MVP)

```
Precificação:
  Cadastra novo serviço → preenche BOM (insumos × qtd)  → service_supplies
  Sistema calcula custo direto                           → derivado
  Sugere preço com markup + margem-alvo                  → pricing_simulations  [NOVO — B2]
  Simula "se baixar 10%, quanto cai o lucro?"            → pricing_simulations

Pacotes:
  Cria pacote "5 drenagens por R$ 450"                   → service_packages  [NOVO — B3]
  Vende pacote para cliente                              → commands + package_sessions_ledger [NOVO — B4]
    · append: session #1 consumed by cmd #X at timestamp T
    · hash encadeado — ninguém marca 6 se só vendeu 5

Anamnese + foto antes/depois:
  Agenda: cliente vai fazer limpeza                      → appointments
  Antes do procedimento: upload foto + assinar termo     → customer_documents + consents [NOVO — A3, A6]
  Depois: upload foto, compara                            → customer_documents

Conciliação de maquininhas:
  Final do mês: importa extrato Stone                    → acquirer_reconciliations  [NOVO — C3]
  Sistema matching com payments esperados                → parser engine
  Alerta divergência de taxa                             → alerts

AI Copilot:
  "Cliente Y não volta há 60 dias — enviar WhatsApp?"   → ai_insights  [NOVO — D8]
  "Seu caixa vai zerar em 12 dias — revisar gastos?"    → ai_insights
  "Pacote Z tem margem de 9% — revisar preço?"          → ai_insights
```

**Stories:** Phase 5 · Phase 6 · Phase 7.

---

## 5. Modelo de dados — delta sobre schema atual

### 5.1 Resumo do delta

| Tipo | Quantidade | Observação |
|------|-----------|------------|
| Tabelas novas | **11** | Distribuídas por fases 1, 2, 3.5, 4, 5, 6, 7 |
| Colunas novas em tabelas existentes | **8** | Em `supplies`, `appointments`, `inventory_movements`, `goals`, `organizations` |
| Views novas | **4** | `v_cashflow_forecast`, `v_service_profitability`, `v_profit_by_hour`, `v_customer_ltv` |
| Funções novas | **2** | `seed_default_services(org_id)`, `calculate_service_cost(service_id)` |
| Triggers novos | **2** | `trg_package_session_append`, `trg_whatsapp_message_audit` |

### 5.2 Tabelas novas (detalhe)

#### 5.2.1 Compliance & LGPD (Phase 1)

```sql
-- consents: termos aceitos por usuário e cliente (A6, E4)
CREATE TABLE consents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  subject_type text NOT NULL CHECK (subject_type IN ('user', 'customer')),
  subject_id uuid NOT NULL,           -- auth.users.id OU customers.id
  consent_type text NOT NULL CHECK (consent_type IN ('tos', 'privacy_policy', 'image_use', 'whatsapp_marketing', 'data_sharing')),
  document_version text NOT NULL,     -- versão do texto aceito (ex: "tos-v2.1")
  document_hash text NOT NULL,        -- hash SHA256 do conteúdo
  accepted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_consents_subject ON consents(org_id, subject_type, subject_id);
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents FORCE ROW LEVEL SECURITY;
```

#### 5.2.2 Anamnese & documentos do cliente (Phase 5)

```sql
-- customer_documents: fotos antes/depois, anamnese, laudos (A3)
CREATE TABLE customer_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  appointment_id uuid REFERENCES appointments(id),
  document_type text NOT NULL CHECK (document_type IN ('anamnesis', 'before_photo', 'after_photo', 'lab_result', 'prescription', 'other')),
  storage_path text NOT NULL,          -- ex: 'org-{uuid}/customer-{uuid}/2026-04-20-before.jpg'
  storage_bucket text NOT NULL DEFAULT 'customer-documents',
  file_size_bytes bigint,
  mime_type text,
  consent_id uuid REFERENCES consents(id),
  captured_at timestamptz,
  uploaded_by uuid REFERENCES auth.users(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_customer_documents_customer ON customer_documents(org_id, customer_id);
```

#### 5.2.3 Pacotes com audit ledger (Phase 5)

```sql
-- service_packages: pacote vendido (B3)
CREATE TABLE service_packages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  service_id uuid NOT NULL REFERENCES services(id),
  command_id uuid REFERENCES commands(id),  -- venda original
  total_sessions int NOT NULL CHECK (total_sessions > 0),
  price_paid numeric(14,2) NOT NULL,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  deleted_at timestamptz
);

-- package_sessions_ledger: cada sessão consumida (B4 — append-only, hash encadeado)
CREATE TABLE package_sessions_ledger (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  package_id uuid NOT NULL REFERENCES service_packages(id),
  session_number int NOT NULL,
  appointment_id uuid REFERENCES appointments(id),
  performed_by uuid REFERENCES professionals(id),
  performed_at timestamptz NOT NULL DEFAULT now(),
  prev_hash text,          -- hash da linha anterior (tamper-evident)
  current_hash text NOT NULL,  -- hash da linha atual
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Trigger: UPDATE e DELETE bloqueados (append-only)
CREATE UNIQUE INDEX uniq_package_session ON package_sessions_ledger(package_id, session_number);
```

#### 5.2.4 Precificação inteligente (Phase 4.5 — antecipado)

```sql
-- pricing_simulations: cenários de preço salvos (B2)
CREATE TABLE pricing_simulations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  service_id uuid NOT NULL REFERENCES services(id),
  scenario_name text NOT NULL,          -- "preço atual", "10% off", "mark-up 2.5×", etc
  direct_cost numeric(14,2) NOT NULL,
  overhead_allocation numeric(14,2),    -- rateio fixo
  markup_percent numeric(5,2),
  target_margin_percent numeric(5,2),
  suggested_price numeric(14,2) NOT NULL,
  commission_impact numeric(14,2),
  final_profit numeric(14,2),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 5.2.5 WhatsApp Cloud API (Phase 3.5 — antecipado)

```sql
-- whatsapp_templates: templates approved pela Meta (E1)
CREATE TABLE whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES organizations(id),  -- NULL = template global KEYRA
  template_name text NOT NULL,
  meta_template_id text,                 -- ID retornado pela Meta após approval
  category text NOT NULL CHECK (category IN ('marketing', 'utility', 'authentication')),
  language text NOT NULL DEFAULT 'pt_BR',
  body_text text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]',  -- [{"position": 1, "description": "nome cliente"}]
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- whatsapp_messages: histórico de mensagens (E1)
CREATE TABLE whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid REFERENCES customers(id),
  template_id uuid REFERENCES whatsapp_templates(id),
  direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  phone_number text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('template', 'text', 'media')),
  content jsonb NOT NULL,
  meta_message_id text,                  -- ID retornado pela Meta
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_code text,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- whatsapp_opt_ins: consentimento explícito por cliente (LGPD + compliance Meta)
CREATE TABLE whatsapp_opt_ins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  phone_number text NOT NULL,
  opted_in_at timestamptz NOT NULL DEFAULT now(),
  opted_out_at timestamptz,
  source text NOT NULL,  -- 'agendamento_online', 'cadastro', 'qr_code', 'import'
  consent_id uuid REFERENCES consents(id)
);
CREATE UNIQUE INDEX uniq_whatsapp_phone ON whatsapp_opt_ins(org_id, phone_number) WHERE opted_out_at IS NULL;
```

#### 5.2.6 Lista de espera (Phase 2)

```sql
-- appointment_waitlist: fila de clientes esperando vaga (A2)
CREATE TABLE appointment_waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  service_id uuid NOT NULL REFERENCES services(id),
  professional_id uuid REFERENCES professionals(id),
  preferred_dates jsonb,      -- {"from": "2026-04-20", "to": "2026-04-27", "hours": ["morning", "afternoon"]}
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'scheduled', 'cancelled', 'expired')),
  notified_at timestamptz,
  scheduled_appointment_id uuid REFERENCES appointments(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days')
);
```

#### 5.2.7 Conciliação multi-adquirente (Phase 7)

```sql
-- acquirer_reconciliations: import de extrato (C3)
CREATE TABLE acquirer_reconciliations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  acquirer text NOT NULL CHECK (acquirer IN ('stone', 'cielo', 'pagseguro', 'sumup', 'infinitepay', 'getnet', 'other')),
  statement_file_path text NOT NULL,
  statement_period_start date NOT NULL,
  statement_period_end date NOT NULL,
  expected_total numeric(14,2),  -- soma dos payments do período
  reported_total numeric(14,2),  -- soma do extrato
  variance numeric(14,2) GENERATED ALWAYS AS (reported_total - expected_total) STORED,
  matched_count int NOT NULL DEFAULT 0,
  unmatched_count int NOT NULL DEFAULT 0,
  imported_by uuid REFERENCES auth.users(id),
  imported_at timestamptz NOT NULL DEFAULT now()
);

-- acquirer_statement_items: linhas do extrato
CREATE TABLE acquirer_statement_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  reconciliation_id uuid NOT NULL REFERENCES acquirer_reconciliations(id),
  transaction_date date NOT NULL,
  gross_amount numeric(14,2) NOT NULL,
  fee_amount numeric(14,2) NOT NULL,
  net_amount numeric(14,2) NOT NULL,
  installment int,
  nsu text,
  authorization_code text,
  matched_payment_id uuid REFERENCES payments(id),
  match_status text NOT NULL DEFAULT 'unmatched' CHECK (match_status IN ('matched', 'unmatched', 'divergent_fee', 'duplicate'))
);
```

#### 5.2.8 AI Insights (Phase 6)

```sql
-- ai_insights: sugestões pré-computadas do copilot (D8)
CREATE TABLE ai_insights (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  insight_type text NOT NULL CHECK (insight_type IN ('pricing_alert', 'cashflow_risk', 'churn_risk', 'upsell_suggestion', 'goal_projection', 'supply_forecast')),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  subject_type text,       -- 'service', 'customer', 'account', etc
  subject_id uuid,
  title text NOT NULL,
  body text NOT NULL,
  suggested_action jsonb,  -- {"type": "whatsapp_message", "template_id": "...", "customer_id": "..."}
  dismissed_at timestamptz,
  dismissed_by uuid REFERENCES auth.users(id),
  computed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
```

#### 5.2.9 Outros (vendor_payments, bank_connections, nfse_attempts)

Detalhados em Phase 7/8 — mesma estrutura: `org_id` + RLS + soft delete + audit.

### 5.3 Colunas novas em tabelas existentes

| Tabela | Nova coluna | Propósito | Feature origem |
|--------|-------------|-----------|----------------|
| `supplies` | `lot_number text`, `expires_at date` | Controle Anvisa | B5 |
| `inventory_movements` | `lot_number text` | Rastreabilidade FIFO | B5 |
| `appointments` | `prepayment_id uuid REFERENCES payments(id)` | Pré-pagamento Pix | A1 |
| `appointments` | `waitlist_id uuid REFERENCES appointment_waitlist(id)` | Se veio da waitlist | A2 |
| `goals` | `tiers jsonb` | Comissão escalonada (40/50/60%) | D4 |
| `organizations` | `pro_labore_target numeric(14,2)` | Meta de pró-labore mensal | C6 |
| `organizations` | `tax_regime text CHECK (tax_regime IN ('mei', 'simples', 'lucro_presumido', 'lucro_real'))` | Estimativa de impostos | D2 |

### 5.4 Views novas

```sql
-- v_cashflow_forecast: caixa projetado 30/60/90 dias (D3)
CREATE VIEW v_cashflow_forecast AS
WITH recurring_expenses AS (
  -- transações fixas recorrentes projetadas
  SELECT org_id, amount_projected, date_projected FROM ...
),
receivables AS (
  -- command payments pendentes + pacotes com sessões futuras
  SELECT ...
)
SELECT
  org_id,
  date_projected,
  SUM(CASE WHEN direction = 'credit' THEN amount ELSE 0 END) AS inflow,
  SUM(CASE WHEN direction = 'debit'  THEN amount ELSE 0 END) AS outflow,
  SUM(CASE WHEN direction = 'credit' THEN amount ELSE -amount END)
    OVER (PARTITION BY org_id ORDER BY date_projected) AS running_balance
FROM (
  SELECT * FROM recurring_expenses
  UNION ALL
  SELECT * FROM receivables
) combined
GROUP BY org_id, date_projected;

-- v_service_profitability: custo real + margem efetiva por serviço (B2)
CREATE VIEW v_service_profitability AS
SELECT
  s.id AS service_id,
  s.org_id,
  s.name,
  s.price,
  SUM(ss.quantity * sup.avg_cost) AS direct_cost,
  (s.price - SUM(ss.quantity * sup.avg_cost)) AS gross_profit,
  ((s.price - SUM(ss.quantity * sup.avg_cost)) / NULLIF(s.price, 0)) * 100 AS margin_percent
FROM services s
LEFT JOIN service_supplies ss ON ss.service_id = s.id
LEFT JOIN supplies sup ON sup.id = ss.supply_id
GROUP BY s.id, s.org_id, s.name, s.price;

-- v_profit_by_hour: rentabilidade por horário do dia (D5)
CREATE VIEW v_profit_by_hour AS
SELECT
  c.org_id,
  EXTRACT(hour FROM c.created_at) AS hour_of_day,
  EXTRACT(dow FROM c.created_at) AS day_of_week,
  COUNT(*) AS commands_count,
  SUM(ci.total) AS revenue,
  SUM(ci.unit_cost * ci.quantity) AS cost,
  SUM(ci.total - (ci.unit_cost * ci.quantity)) AS profit
FROM commands c
JOIN command_items ci ON ci.command_id = c.id
WHERE c.status = 'paid'
GROUP BY c.org_id, hour_of_day, day_of_week;

-- v_customer_ltv: ticket médio, frequência, LTV (A5)
CREATE VIEW v_customer_ltv AS
SELECT
  c.id AS customer_id,
  c.org_id,
  c.name,
  COUNT(DISTINCT cmd.id) AS total_commands,
  SUM(cmd.total) AS lifetime_revenue,
  AVG(cmd.total) AS avg_ticket,
  MAX(cmd.created_at) AS last_visit_at,
  MIN(cmd.created_at) AS first_visit_at
FROM customers c
LEFT JOIN commands cmd ON cmd.customer_id = c.id AND cmd.status = 'paid'
GROUP BY c.id, c.org_id, c.name;
```

---

## 6. Estrutura lógica condicional de fases

### 6.1 Princípio de proporcionalidade

> **Regra:** uma feature só avança de fase se a anterior estiver `Done` com QA gate PASS. Gates condicionais são explícitos.

### 6.2 Diagrama de decisão

```
 ┌─────────────────────────────────────────────┐
 │ Phase 0 (100%) — Fundação                   │
 │   ✅ PRD, Arch, Schema, Wireframes, Infra   │
 └────────────────────┬────────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────────┐
 │ Phase 1 (40%) — Fundação Técnica            │
 │   ✅ 1.1 Scaffold  ✅ 1.2 Auth+Onboarding   │
 │   ⏸️ 1.3 Profissionais+Convite              │
 │   ⏸️ 1.4 RLS tests                          │
 │   ⏸️ 1.5 Layout base                        │
 │   🆕 1.6 Consents (LGPD TOS + policies)     │
 │   🆕 1.7 Seed services (onboarding vertical)│
 └────────────────────┬────────────────────────┘
                      │ GATE: auth funcional + RLS testado
                      ▼
 ┌─────────────────────────────────────────────┐
 │ Phase 2 — Catálogo + Agenda                 │
 │   2.1-2.7 (PRD) +                           │
 │   🆕 2.8 Pré-pagamento Pix no agendamento   │
 │   🆕 2.9 Lista de espera                    │
 └────────────────────┬────────────────────────┘
                      │ GATE: agendamento → receita prevista funcional
                      ▼
 ┌─────────────────────────────────────────────┐
 │ Phase 3 — Automação Financeira              │
 │   3.1-3.8 (PRD) +                           │
 │   🆕 Pró-labore já previsto em 3.5 (seed)   │
 └────────────────────┬────────────────────────┘
                      │ GATE: done → command → payment → transaction auto
                      ▼
 ┌─────────────────────────────────────────────┐
 │ 🆕 Phase 3.5 — Comunicação Cliente          │
 │   3.9 WhatsApp Cloud API Meta oficial       │
 │       (templates + opt-ins + messages)      │
 │   3.10 Confirmação automática de agenda    │
 │   3.11 Cobrança automática inadimplência   │
 └────────────────────┬────────────────────────┘
                      │ GATE: Meta template approved + opt-in funcional
                      ▼
 ┌─────────────────────────────────────────────┐
 │ Phase 4 — DRE + Dashboard                   │
 │   4.1 DRE (enriq. com pró-labore+impostos)  │
 │   4.2 DRE por serviço                       │
 │   4.3 DRE por profissional                  │
 │   4.4 Dashboard tela única                  │
 │   4.5 🆕 Fluxo de caixa projetado 30/60/90  │
 │   4.6-4.9 (PRD)                             │
 │   4.10 🆕 LGPD export ZIP self-service      │
 │   4.11 🆕 Status page + SLA público         │
 │   >>> MVP COMPLETO <<<                      │
 └────────────────────┬────────────────────────┘
                      │ GATE: idealizadora usa com 1 cliente real
                      ▼
 ┌─────────────────────────────────────────────┐
 │ 🆕 Phase 4.5 — Precificação Inteligente     │
 │   4.12 Motor precificação (custo+markup)    │
 │   4.13 Simulador "se baixar 10%"            │
 │   4.14 Pricing público + calculadora        │
 │         (marketing site)                    │
 │   4.15 Cancelamento self-service 1-clique   │
 └────────────────────┬────────────────────────┘
                      │ GATE: cases-alpha com 5 cenários salvos
                      ▼
 ┌─────────────────────────────────────────────┐
 │ Phase 5 — Estoque Inteligente + Pacotes     │
 │   5.1-5.5 (PRD) +                           │
 │   🆕 5.6 Anamnese + foto antes/depois       │
 │   🆕 5.7 Importador Trinks/Belle            │
 │   🆕 5.8 Lote + validade (Anvisa)           │
 │   🆕 5.9 AI copilot de ativação no trial    │
 │   5.10 Pacotes + audit ledger (B3+B4)       │
 └────────────────────┬────────────────────────┘
                      │ GATE: 1 pacote auditado sem discrepância
                      ▼
 ┌─────────────────────────────────────────────┐
 │ Phase 6 — Inteligência + Projeções          │
 │   6.1-6.7 (PRD) +                           │
 │   🆕 6.8 AI copilot financeiro nativo       │
 │        (ai_insights + ai_copilot_sessions)  │
 └────────────────────┬────────────────────────┘
                      │ GATE: 3 insights acionáveis por org/mês
                      ▼
 ┌─────────────────────────────────────────────┐
 │ Phase 7 — Integrações                       │
 │   7.1-7.6 (PRD) +                           │
 │   🆕 7.7 Conciliação multi-adquirente       │
 │   🆕 7.8 Export contábil (SPED/OFX/Nibo)    │
 │   🆕 7.9 Open Finance (extratos real-time)  │
 └────────────────────┬────────────────────────┘
                      │ GATE: 1 clínica rodando pipe financeiro completo
                      ▼
 ┌─────────────────────────────────────────────┐
 │ Phase 8 — NFS-e + Marketplace               │
 │   8.1-8.3 (PRD) + NFS-e com idempotência    │
 └─────────────────────────────────────────────┘
```

### 6.3 Gates condicionais (critérios de passagem)

| Gate | Fase de entrada | Critério PASS | Dependência externa |
|------|----------------|---------------|---------------------|
| G1.1 | Phase 1 → 2 | `auth + RLS + onboarding` funcionando · rls_isolation.test.sql PASS · COLUMN_ENCRYPTION_KEY provisionada | — |
| G2 | Phase 2 → 3 | Agendamento gera `v_receitas_previstas` · EXCLUDE constraint testada | — |
| G3 | Phase 3 → 3.5 | `trg_appointment_done_creates_command` + `trg_payment_creates_transaction` funcionando end-to-end com insumo rateio | — |
| G3.5 | Phase 3.5 → 4 | Pelo menos 1 template WhatsApp `approved` pela Meta · opt-in flow funcional | Conta WhatsApp Business API Meta |
| G4 | Phase 4 → MVP | Idealizadora usa app com 1 cliente real · DRE fecha corretamente no fim do mês | — |
| G4.5 | Phase 4.5 → 5 | 5 cases-alpha com cenários de precificação salvos · pricing público no ar | Design/copy do marketing site |
| G5 | Phase 5 → 6 | 1 pacote auditado sem discrepância · 1 anamnese + foto antes/depois capturada com LGPD | Supabase Storage bucket criado |
| G6 | Phase 6 → 7 | 3 insights acionáveis por org/mês · cliente dismissing/applying insights | Orçamento LLM provisionado |
| G7 | Phase 7 → 8 | 1 clínica real rodando conciliação + WhatsApp + pipe financeiro completo | Contratos com acquirers (CSV/OFX formats) |

### 6.4 Escape hatches (quando pular uma fase é aceitável)

- **Phase 3.5 (WhatsApp)** pode ser adiada se o Meta approval demorar >30 dias — neste caso MVP segue sem WhatsApp e a feature vira Phase 5.
- **Phase 4.5 (Precificação)** pode virar Phase 5 se idealizadora decidir focar DRE antes. Nunca pular completamente — é feature-âncora.
- **Phase 5.7 (Importador)** só faz sentido quando houver ≥10 prospects vindos de Trinks/Belle.
- **Phase 7.9 (Open Finance)** só após regulamentação estável + 1 integrador contratado (Belvo/Pluggy).

---

## 7. Backlog enriquecido — stories novas por fase

Tabela canônica para o @sm criar os story files. Use esta como fonte de verdade para expandir o `EPIC-0-KEYRA-IMPLEMENTATION.md`.

| Fase | Story ID | Título | Pesquisa origem | Esforço | Tabelas afetadas |
|------|----------|--------|-----------------|---------|-------------------|
| 1 | **1.6** | Consents (LGPD TOS + Privacy + Image Use) | A6 · E4 | S | `consents` |
| 1 | **1.7** | Seed vertical de 40 procedimentos de estética | B6 | S | função `seed_default_services()` |
| 2 | **2.8** | Pré-pagamento Pix no agendamento online | A1 | M | `appointments.prepayment_id` |
| 2 | **2.9** | Lista de espera automática | A2 | M | `appointment_waitlist` |
| 3.5 | **3.9** | WhatsApp Cloud API Meta oficial (templates + opt-in + send) | E1 | L | `whatsapp_templates`, `whatsapp_messages`, `whatsapp_opt_ins` |
| 3.5 | **3.10** | Confirmação automática de agenda (24h antes) | E1 | S | usa `whatsapp_messages` |
| 3.5 | **3.11** | Cobrança automática inadimplência | E1 | M | usa `whatsapp_messages` + webhook Asaas |
| 4 | **4.1-enriq** | DRE com linha de pró-labore + impostos estimados | C6 · D2 | S | `v_dre_monthly` + `organizations.tax_regime` |
| 4 | **4.5** | Fluxo de caixa projetado 30/60/90d | D3 | M | `v_cashflow_forecast` |
| 4 | **4.10** | LGPD export ZIP self-service | E2 | M | job Inngest |
| 4 | **4.11** | Status page público (BetterStack) + SLA + DPO | E3 | S | extra-schema |
| 4.5 | **4.12** | Motor de precificação (custo + markup + margem) | B2 | L | `pricing_simulations` + `v_service_profitability` |
| 4.5 | **4.13** | Simulador "se eu baixar 10%, quanto cai o lucro?" | B2 | M | mesmo |
| 4.5 | **4.14** | Marketing site: pricing público + calculadora | G2 | M | extra-schema (Next.js marketing) |
| 4.5 | **4.15** | Cancelamento self-service 1-clique | G3 | S | Stripe Customer Portal |
| 5 | **5.2-enriq** | Pacotes com audit ledger (append-only + hash) | B3 · B4 | L | `service_packages`, `package_sessions_ledger` |
| 5 | **5.6** | Anamnese + foto antes/depois com LGPD | A3 | L | `customer_documents` + Supabase Storage |
| 5 | **5.7** | Importador Trinks → KEYRA (CSV + API pública Trinks) | A4 | L | staging + scripts |
| 5 | **5.8** | Lote + validade em estoque (FIFO + Anvisa) | B5 | M | `supplies.lot_number`, `expires_at` |
| 5 | **5.9** | AI copilot de ativação no trial | D9 | M | Inngest job |
| 6 | **6.8** | AI copilot financeiro nativo | D8 | XL | `ai_insights`, `ai_copilot_sessions` |
| 7 | **7.7** | Conciliação multi-adquirente automática | C3 | XL | `acquirer_reconciliations` + `acquirer_statement_items` |
| 7 | **7.8** | Export contábil (SPED, OFX, ContaAzul, Nibo) | C4 | M | Server Actions |
| 7 | **7.9** | Open Finance + extratos real-time | C5 | XL | `bank_connections` + provider (Belvo/Pluggy) |
| 7 | **7.2b** | Pagamento a fornecedor via Pix no app | C2 | M | `vendor_payments` |
| 8 | **8.4** | NFS-e com retry idempotente + lock transacional | E5 | L | `nfse_attempts` |

**Legenda de esforço:** S (1-2 dias) · M (3-5 dias) · L (1-2 semanas) · XL (2-4 semanas).

---

## 8. Próximos passos imediatos (1-2 sprints)

Para manter proporcionalidade com o que está validado hoje:

### Sprint 1.5 (próxima — antes da Phase 2)

1. **Story 1.3** — Gestão de profissionais + convite de membro (PRD já tem; sem mudança)
2. **Story 1.4** — Rodar `rls_isolation.test.sql` + Vitest RLS suite (sem mudança)
3. **Story 1.5** — Layout base + sidebar + bottom nav + 10 componentes canônicos (sem mudança)
4. 🆕 **Story 1.6** — Consents (TOS + Privacy + Image Use) — desbloqueia A3/A6
5. 🆕 **Story 1.7** — Seed vertical de 40 procedimentos — desbloqueia onboarding premium

**Critério de saída da Sprint 1.5:** auth + onboarding + layout + consents + seed vertical prontos. `keyra.app` mostra dashboard skeleton com dados seed.

### Sprint 2 (Phase 2 — Catálogo + Agenda enriquecido)

Stories 2.1-2.7 + 2.8 (pré-pagamento Pix) + 2.9 (waitlist).
Entregar como bloco único para não fragmentar UX de agenda.

### Decisões que o PM precisa tomar antes da Sprint 1.5

| # | Decisão | Prazo |
|---|---------|-------|
| D1 | Antecipar Phase 3.5 (WhatsApp) para MVP ou deixar pós-MVP? | 1 semana |
| D2 | Antecipar Phase 4.5 (Precificação) para MVP ou manter pós? | 1 semana |
| D3 | Contratar Meta Business API agora (lead time 2-4 semanas) ou esperar? | 2 semanas |
| D4 | Usar Supabase Storage para fotos (A3) ou S3/R2 externo? | ao começar Story 5.6 |
| D5 | Definir texto final TOS + Política de Privacidade (jurídico) | antes da Story 1.6 |
| D6 | Contratar BetterStack/Instatus para status page | antes da Story 4.11 |

---

## 9. Risco arquitetural: não-sobrescrever a proporcionalidade

### 9.1 Anti-padrões que este mapa evita

| Anti-padrão | O que causaria | Como este mapa evita |
|-------------|----------------|----------------------|
| Empilhar todas as 47 features em "Phase MVP" | MVP nunca acaba | Gates condicionais · classificação em 3 classes · proporção 70% reuso / 30% novo |
| Criar tabelas novas sem RLS | Data leak cross-tenant | Todas as 11 tabelas novas herdam template `org_id NOT NULL + RLS + FORCE` |
| Antecipar AI copilot para MVP | Complexidade sem receita validada | AI copilot fica Phase 6 · copilot de ativação (D9) é Phase 5 |
| Abandonar seed/onboarding pensando "faço depois" | Primeiro uso vazio · churn alto | Stories 1.6 e 1.7 desbloqueiam "app preenchido no primeiro login" |
| WhatsApp em zona cinza (tipo Belle) | Ban de número + dor de cliente viralizada | Phase 3.5 exige Cloud API Meta oficial + opt-in explícito + templates approved |
| Pacote sem audit ledger | Bug "12 em vez de 10" como Belle | `package_sessions_ledger` append-only com hash encadeado desde o dia 1 |

### 9.2 Quando re-avaliar este mapa

- Após cada story `Done` que afete schema.
- Se uma pesquisa nova for adicionada a `docs/research/`.
- Se decisões do PM mudarem (ex: antecipar Phase 3.5 ou 4.5).
- A cada término de fase (Phase 2 Done → revisar Phase 3 backlog).

---

## 10. Apêndice — Rastreabilidade

### 10.1 Mapa: feature → pesquisa-fonte

Tabela exportável para auditoria (Article IV — No Invention).

| Feature ID | Pesquisa | Documento exato | Seção |
|-----------|----------|-----------------|-------|
| A1 | Trinks/Belle | `trinks-analysis-2026-04-16/04-synthesis/KEYRA-OPPORTUNITIES.md` | P1.10 |
| A2 | Trinks | idem | P1.11 |
| A3 | Trinks/Belle | idem + Belle `04-synthesis/KEYRA-OPPORTUNITIES.md` | P1.14 / 2.14 |
| A4 | Trinks/Belle | idem | P1.13 / 3.4 |
| A6 | Belle | Belle `04-synthesis/KEYRA-OPPORTUNITIES.md` | 2.14 F62 |
| B1 | Trinks/Belle | idem | P1.5 / 2.1 |
| B2 | Trinks/Belle | idem | P1.1 / 2.1 |
| B3 | Trinks/Belle | idem | P1.8 / Conference-bug |
| B4 | Belle | idem | 2.4 (dor RA) |
| B5 | Trinks/Belle | idem | P1.6 / 2.12 |
| B6 | Trinks | idem | P3.4 |
| C1 | PRD gap | `PRD-KEYRA.md` | gap #6 |
| C2 | Trinks | idem | P1.9 |
| C3 | Trinks | idem | P1.4 |
| C4 | Belle | idem | 2.9 |
| C5 | Belle | idem | 2.10 |
| C6 | Trinks/Belle | idem | P1.12 / 2.11 |
| D1 | Trinks/Belle | idem | P1.2 / 2.6 |
| D2 | Trinks/Belle | idem | P1.3 / 2.2 |
| D3 | Belle | idem | 2.3 |
| D4 | Trinks | idem | P1.7 |
| D5 | Trinks | idem | P6.3 |
| D6 | Trinks | idem | P6.4 |
| D7 | Trinks | idem | P6.2 |
| D8 | Belle/ClínicaExperts | idem + `2026-04-16-clinica-experts-dez-sistema-reverse-engineering.md` | 2.8 / seção IA Anna |
| D9 | Belle | idem | play 14 |
| E1 | Belle | idem | 2.5 / 3.3 |
| E2 | Belle | idem | 2.14 |
| E3 | Belle | idem | 3.10 |
| E4 | Belle/ADR | idem + `ARCHITECTURE.md` ADR-019 | 2.14 |
| E5 | Trinks | idem | P4.4 |
| G1-G9 | múltiplas | idem | seções 4 Belle / Parte 2 Trinks |

### 10.2 Referências vivas

- [Trinks KEYRA-OPPORTUNITIES](../research/trinks-analysis-2026-04-16/04-synthesis/KEYRA-OPPORTUNITIES.md)
- [Belle KEYRA-OPPORTUNITIES](../research/belle-software-2026-04-16/04-synthesis/KEYRA-OPPORTUNITIES.md)
- [Clínica Experts DEZ (reverse engineering)](../research/2026-04-16-clinica-experts-dez-sistema-reverse-engineering.md)
- [Conta Azul (anti-padrão)](../research/2026-04-12-conta-azul-reverse-engineering.md)
- [Kamino](../research/2026-04-12-kamino-reverse-engineering.md)
- [Gestek](../research/2026-04-12-gestek-reverse-engineering.md)
- [PRD-KEYRA.md](../prd/PRD-KEYRA.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SCHEMA.md](./SCHEMA.md)
- [IMPLEMENTATION-MAP.md](../IMPLEMENTATION-MAP.md)
- [EPIC-0-KEYRA-IMPLEMENTATION.md](../stories/EPIC-0-KEYRA-IMPLEMENTATION.md)

---

*KEYRA Research-to-Implementation Map v1.0 — arquitetado pela @architect Aria em 2026-04-20.*
*"Construir só o que a pesquisa validou. Na ordem que o schema permite. No ritmo que a idealizadora absorve."*
