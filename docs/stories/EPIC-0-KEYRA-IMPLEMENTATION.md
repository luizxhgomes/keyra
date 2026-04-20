# EPIC-0: KEYRA — Plano de Implementação Completo

> Epic geral que mapeia todas as fases de construção do KEYRA do zero.
> **Versão:** 1.2 (atualizada 2026-04-20 — Phase 0 fechada · Phase 1 em ~60%)
> **Data inicial:** 2026-04-12
> **Snapshot executivo (1 min):** [`../STATE.md`](../STATE.md) · **Mapa tático:** [`../IMPLEMENTATION-MAP.md`](../IMPLEMENTATION-MAP.md)

## Status atual (2026-04-20 — noite)

| Fase | Progresso | Observação |
|------|-----------|------------|
| **Phase 0** — Fundação e Planejamento | ✅ 100% (6/6 stories) | Concluída em 2026-04-16 |
| **Phase 1** — Fundação Técnica | 🟢 100% (pendente aceite) | 1.1 ✅ · 1.2 ✅ · 1.5 ✅ · 1.3 🟡 InReview · 1.4 🟡 InReview — migration aplicada no remoto + testes RLS verdes em Postgres local; falta smoke manual + Resend + push |
| **Phase 2** — Catálogo + Agenda | 🟡 ~30% | 2.1 🟡 InReview · 2.2 🟡 InReview · 2.3 Draft · 2.4 Draft · 2.5 Draft · 2.6 Draft · 2.7 Draft |
| **Phases 3–7** — Features MVP+ | ⏸️ 0% de UI | Schema 100% pronto |

**Próxima ação:** smoke test das 4 stories no dev server + commit + push. Em seguida, iniciar Story 2.3 (insumos) ou pular para Story 2.4 (agenda FullCalendar) conforme prioridade.

---

## Companion Documents

> Documentos relacionados — este epic e o "centro" do roadmap; outros artefatos derivam dele ou alimentam-no.

### Fontes (input para este epic)

| # | Documento | Conteudo |
|---|-----------|----------|
| 1 | [contexto-completo-keyra.md](../audios-idealizadora/contexto-completo-keyra.md) | Visao da idealizadora — fonte primaria das 8 fases |
| 2 | [visao-keyra-idealizadora.md](../audios-idealizadora/visao-keyra-idealizadora.md) | Visao narrativa estrategica |
| 3 | [Transcricoes WhatsApp (4 arquivos)](../audios-idealizadora/) | Audios brutos da idealizadora (12/abr/2026) |

### Pesquisa Competitiva (Story 0.6)

| # | Documento | Conteudo |
|---|-----------|----------|
| 4 | [Conta Azul reverse engineering](../research/2026-04-12-conta-azul-reverse-engineering.md) | ERP financeiro generico — referencia anti-padrao |
| 5 | [Gestek reverse engineering](../research/2026-04-12-gestek-reverse-engineering.md) | Concorrente vertical estetica |
| 6 | [Kamino reverse engineering](../research/2026-04-12-kamino-reverse-engineering.md) | Concorrente vertical estetica |

### Documentos Derivados (entregaveis das stories Phase 0)

| # | Documento | Story origem | Status |
|---|-----------|--------------|--------|
| 7 | [PRD-KEYRA.md](../prd/PRD-KEYRA.md) | Story 0.2 | ✅ entregue |
| 8 | [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) | Story 0.3 | ✅ entregue |
| 9 | [SCHEMA.md](../architecture/SCHEMA.md) + [migrations/](../../supabase/migrations/) | Story 0.4 | ✅ aplicado |
| 10 | [wireframes/](../ux/wireframes/) | Story 0.5 | ✅ entregue |
| 11 | [INFRA-STATUS.md](../INFRA-STATUS.md) | Story 0.1 | ✅ entregue |
| 12 | [CREDENTIALS.md](../setup/CREDENTIALS.md) | Story 0.1 (suporte) | ✅ entregue |
| 13 | [IMPLEMENTATION-MAP.md](../IMPLEMENTATION-MAP.md) | consolidador (pos Phase 0) | ✅ matriz viva |

### Squads AIOX

| # | Documento | Fases que executa |
|---|-----------|-------------------|
| 13 | [squad-keyra-bootstrap](../../squads/squad-keyra-bootstrap/squad.yaml) | Phase 0 |
| 14 | [squad-keyra-core](../../squads/squad-keyra-core/squad.yaml) | Phases 2–4 (MVP) |
| 15 | [squad-keyra-intelligence](../../squads/squad-keyra-intelligence/squad.yaml) | Phases 5–6 (pos-MVP) |
| 16 | [squad-keyra-integrations](../../squads/squad-keyra-integrations/squad.yaml) | Phase 7 (integracoes) |

### Visao geral

| Documento | Funcao |
|-----------|--------|
| [README.md](../../README.md) | Entrada do projeto |

---

## Identidade

**KEYRA** = KEY (chave) + Receita + Acelerada
**Posicionamento:** "O primeiro financeiro operacional para estetica"
**Idealizadora:** Mentora financeira para profissionais de estetica

## Problema Central

Desconexao entre operacao e financeiro. ERPs tradicionais (Conta Azul) atuam pos-faturamento manual.
KEYRA resolve: financeiro gerado automaticamente a partir da operacao.

## 4 Pilares

1. **Agenda** — Origem do faturamento
2. **Servicos** — Estrutura de monetizacao
3. **Financeiro** — Registro e controle (automatico)
4. **Inteligencia** — Analise de lucro e decisoes

## Fluxo Central

`Servico → Agenda → Comanda → Transacao → DRE`

---

## Roster de Agentes

### Agentes Base (12)

| # | Agente | Persona | Escopo |
|---|--------|---------|--------|
| 1 | `@aiox-master` | Orion | Orquestracao geral |
| 2 | `@pm` | Morgan | PRD, epics, requisitos |
| 3 | `@architect` | Aria | Arquitetura fullstack |
| 4 | `@data-engineer` | Dara | Schema, RLS, migrations |
| 5 | `@ux-design-expert` | Uma | Wireframes, design system |
| 6 | `@analyst` | Alex | Pesquisa competitiva |
| 7 | `@po` | Pax | Validacao de stories |
| 8 | `@sm` | River | Criacao de stories |
| 9 | `@dev` | Dex | Implementacao fullstack |
| 10 | `@qa` | Quinn | QA gates, testes |
| 11 | `@devops` | Gage | Git, CI/CD, deploy |
| 12 | `@squad-creator` | — | Criacao de squads |

### Agentes Especificos KEYRA (4)

| # | Agente | Persona | Escopo |
|---|--------|---------|--------|
| 13 | `@finance-domain-expert` | Valeria | DRE, precificacao, custos, margem, lucro por servico |
| 14 | `@document-processor` | Iris | OCR, parsing de extratos bancarios e maquininhas |
| 15 | `@compliance-br` | Temis | LGPD, regras fiscais BR, NFS-e, protecao de dados |
| 16 | `@growth-product` | Gaia | Monetizacao SaaS, tiers, onboarding, growth metrics |

### Interdependencia dos Agentes Especificos

```
@finance-domain-expert (Valeria)
  ├── fornece para: @dev, @architect, @data-engineer, @qa, @ux-design-expert
  ├── depende de: @compliance-br (regras fiscais), @document-processor (dados extraidos)
  └── valida: TODA logica financeira antes do QA gate

@document-processor (Iris)
  ├── fornece para: @finance-domain-expert (reconciliacao), @data-engineer (schema)
  ├── depende de: @compliance-br (LGPD), @architect (tech OCR), @devops (filas)
  └── processa: extratos bancarios (Itau, Bradesco, Nubank...) e maquininhas (Cielo, Stone, PagSeguro...)

@compliance-br (Temis)
  ├── fornece para: @dev, @architect, @data-engineer, @finance-domain-expert, @document-processor, @qa, @ux-design-expert
  ├── depende de: @architect (infra), @data-engineer (RLS/criptografia)
  └── garante: LGPD, fiscal (MEI/Simples/Lucro Presumido), NFS-e, dados sensiveis

@growth-product (Gaia)
  ├── fornece para: @dev (paywall/onboarding), @ux-design-expert (fluxos conversao), @pm (estrategia)
  ├── depende de: @finance-domain-expert (logica planos), @compliance-br (termos/cobranca)
  └── define: tiers Start/Crescimento/Autoridade, feature gating, trial, metricas
```

---

## Squads

| Squad | Composicao | Fase | Missao |
|-------|-----------|------|--------|
| `squad-keyra-bootstrap` | @pm + @architect + @data-engineer + @analyst + @ux-design-expert | 0 | PRD, arquitetura, schema, pesquisa, wireframes |
| `squad-keyra-core` | @dev + @data-engineer + @qa + @finance-domain-expert | 2-4 | Catalogo, agenda, automacao financeira, dashboard (MVP) |
| `squad-keyra-intelligence` | @dev + @architect + @finance-domain-expert | 5-6 | Precificacao, projecoes, inteligencia, what-if |
| `squad-keyra-integrations` | @dev + @devops + @document-processor + @compliance-br | 7 | PDFs, Asaas, WhatsApp, NFS-e |

---

## Fases de Implementacao

### Fase 0 — Fundacao e Planejamento (Semanas 1-2)
**Squad:** `squad-keyra-bootstrap`
**Workflow:** `greenfield-fullstack.yaml`

| # | Entregavel | Agente | Status | Artefato |
|---|-----------|--------|--------|----------|
| 0.1 | Environment bootstrap (git, GitHub, Supabase, Vercel, dominio) | @devops/Orion | [x] ✅ 2026-04-16 | [INFRA-STATUS.md](../INFRA-STATUS.md) |
| 0.2 | PRD formal | @pm | [x] ✅ 2026-04-16 | [PRD-KEYRA.md](../prd/PRD-KEYRA.md) (66 FRs + 27 NFRs + 27 CONs) |
| 0.3 | Arquitetura fullstack | @architect | [x] ✅ 2026-04-16 | [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) (20 ADRs) |
| 0.4 | Schema de banco com RLS | @data-engineer | [x] ✅ 2026-04-16 (**aplicado no remoto**) | [SCHEMA.md](../architecture/SCHEMA.md) + [migrations/](../../supabase/migrations/) (19 arquivos: 18 + hotfix audit org, 21 tabelas, 100% RLS, 6 views) + [tests/](../../supabase/tests/) |
| 0.5 | Wireframes dashboard numerico | @ux-design-expert | [x] ✅ 2026-04-16 | [wireframes/](../ux/wireframes/) (8 arquivos, paleta terracota, 1 gráfico permitido) |
| 0.6 | Pesquisa competitiva | @analyst | [x] ✅ 2026-04-12 | [Conta Azul](../research/2026-04-12-conta-azul-reverse-engineering.md) · [Gestek](../research/2026-04-12-gestek-reverse-engineering.md) · [Kamino](../research/2026-04-12-kamino-reverse-engineering.md) |

**Status:** ✅ **6/6 entregues** — Phase 0 COMPLETA em 2026-04-16 (1 dia, contra 2 sem planejadas).

**Infraestrutura provisionada:**
- GitHub: https://github.com/luizxhgomes/keyra (private, branch main)
- Vercel project: `keyra` (Hobby plan, Next.js, auto-deploy linkado ao repo)
- Dominio: `keyra.app` (verified)
- Supabase: `keyra-br` em `sa-east-1` (Free plan, Postgres 17)

**Criterio de aceitacao:** PRD aprovado pela idealizadora, schema com RLS validado, wireframes alinhados com principios UX (numeros absolutos, tela unica).

---

### Fase 1 — Fundacao Tecnica (Sprint 1, ~5-7 dias)
**Workflow:** SDC (Story Development Cycle)
**Pre-condicoes:**
- ✅ Phase 0 completa
- ✅ Schema aplicado no `keyra-br` (sa-east-1)
- 🔴 **Auth Hook `custom_access_token_hook` ATIVADO no Supabase Dashboard** (sem isso JWT nao tem org_id e RLS bloqueia tudo)
- 🔴 `COLUMN_ENCRYPTION_KEY` provisionada no Vercel (encrypt CPF customers)

| Story | Descrição | Agente | Status | Artefato esperado |
|-------|-----------|--------|--------|------------------|
| 1.1 | Setup Next.js 16 + Supabase clients (server/browser) + Sentry + ESLint + Prettier + Tailwind + shadcn/ui base + scripts pnpm | @dev | ✅ **Done** 2026-04-16 | `apps/web/`, `lib/supabase/{server,browser,middleware,admin}.ts`, deploy em `usekeyra.vercel.app` |
| 1.2 | Login (email + magic link) + middleware de auth + onboarding criar 1ª organização + org switcher + user menu | @dev | ✅ **Done** 2026-04-16 (endurecida 2026-04-17/20 com commits `99fa5bd`, `2db6c19`) | `app/(auth)/login`, `app/auth/callback`, `app/onboarding/nova-organizacao`, Server Actions em `app/actions/*` |
| 1.3 | Gestão de profissionais (CRUD + roles) + convidar membro por email | @dev | 🟡 **InReview** 2026-04-20 | `app/(app)/team/{page,layout,actions,…}`, `/invites/[token]`, migration `20260420000100_invite_accept_rpc.sql`, ADR-021 Resend, `lib/email/send.ts`, `emails/invite-email.tsx` |
| 1.4 | Suíte de testes RLS + CI (plain SQL, não pgTAP — decidido na story) | @dev | 🟡 **InReview** 2026-04-20 | `supabase/tests/rls_isolation.test.sql` expandido (21 tabelas + smoke inverso), `.github/workflows/rls-tests.yml`, badge no README, `docs/testing/rls-tests.md`, `scripts/run-rls-tests.sh` |
| 1.5 | Layout base + sidebar + bottom nav mobile + 10 componentes canônicos do wireframe + tema terracota | @dev + @ux | ✅ **Done** 2026-04-16 | `components/ui/*`, `components/layout/*`, design tokens em `tailwind.config.ts` |

**Criterio:** Login funcional, 1ª org criada, RLS testado (org A nao ve org B), `keyra.app` mostra dashboard skeleton autenticado.

---

### Fase 2 — Catalogo + Agenda (Semanas 5-7) [MVP]
**Squad:** `squad-keyra-core`

| Story | Descricao |
|-------|-----------|
| 2.1 | CRUD de pacientes (CRM basico) |
| 2.2 | CRUD de servicos/produtos (nome, tipo, preco, custo, duracao, categoria) |
| 2.3 | Cadastro de insumos por servico |
| 2.4 | Modulo de agenda: visualizacao diaria/semanal/mensal |
| 2.5 | Agendamento: paciente + servico + profissional |
| 2.6 | Status: Agendado → Realizado → Cancelado → Falta |
| 2.7 | Receita prevista automatica ao criar agendamento |

**Criterio:** Agendamento gera receita prevista automaticamente.

---

### Fase 3 — Automacao Financeira (Semanas 8-10) [MVP]
**Squad:** `squad-keyra-core`

| Story | Descricao |
|-------|-----------|
| 3.1 | Comanda automatica ao marcar atendimento como realizado |
| 3.2 | Registro de pagamento (Pix, cartao, dinheiro) |
| 3.3 | Transacao financeira automatica ao registrar pagamento |
| 3.4 | Receitas separadas por profissional e centro de custo |
| 3.5 | Registro manual de despesas com classificacao |
| 3.6 | Custos fixos vs variaveis |
| 3.7 | Fluxo de caixa basico |
| 3.8 | Rateio automatico de insumos no atendimento |

**Criterio:** Atendimento realizado → comanda → pagamento → transacao → estoque rateado — TUDO automatico.

---

### Fase 4 — Lucro + Dashboard (Semanas 11-13) [MVP]
**Squad:** `squad-keyra-core`

| Story | Descricao |
|-------|-----------|
| 4.1 | DRE basica: Receita - Custos - Despesas = Lucro |
| 4.2 | DRE por servico (diferencial vs Conta Azul) |
| 4.3 | Lucro por profissional |
| 4.4 | Dashboard tela unica: faturamento, despesas, lucro, receita prevista |
| 4.5 | Agenda do dia no dashboard |
| 4.6 | Indicadores: ticket medio, servico mais vendido/lucrativo, taxa comparecimento |
| 4.7 | Comparativo: mes atual vs anterior (diferenca absoluta) |
| 4.8 | Comparativo: resultado vs meta projetada |
| 4.9 | Alertas: queda de lucro, baixa margem, alta taxa de faltas |

**Criterio:** Usuaria ve lucro por servico e dashboard numerico (sem graficos, exceto 1 permitido).

**>>> MVP COMPLETO <<<**

---

### Fase 5 — Precificacao + Estoque Inteligente (Semanas 14-16) [Pos-MVP]
**Squad:** `squad-keyra-intelligence`

| Story | Descricao |
|-------|-----------|
| 5.1 | Motor de precificacao: custos variaveis + rateio fixo + margem |
| 5.2 | Precificacao de pacotes (5 sessoes com 10% off) |
| 5.3 | Simulacao de cenarios de preco |
| 5.4 | Alertas de estoque baixo |
| 5.5 | Alerta de recompra com sugestao de fornecedores |

---

### Fase 6 — Inteligencia + Projecoes (Semanas 17-20) [Pos-MVP]
**Squad:** `squad-keyra-intelligence`

| Story | Descricao |
|-------|-----------|
| 6.1 | Previsao de lucro semanal/mensal via agenda |
| 6.2 | Cenarios what-if (+10% upsell, +5 agendamentos) |
| 6.3 | Rentabilidade por horario (heatmap lucro/hora) |
| 6.4 | Rentabilidade por profissional com alertas |
| 6.5 | Panoramas para metas (suporte a mentora) |
| 6.6 | Prontuario financeiro por cliente (ticket medio, frequencia, LTV) |
| 6.7 | Sugestoes de upsell na agenda |

---

### Fase 7 — Integracoes (Semanas 21+) [Pos-MVP]
**Squad:** `squad-keyra-integrations`

| Story | Descricao |
|-------|-----------|
| 7.1 | Upload e parsing de PDFs (extratos bancarios, maquininha) |
| 7.2 | Integracao Asaas (Pix automatico, cobranca) |
| 7.3 | WhatsApp Business API (confirmacao, cobranca) |
| 7.4 | NFS-e (nota fiscal de servico eletronica) |
| 7.5 | Reenvio Pix automatico para inadimplencia |
| 7.6 | Recomendacoes IA de precos (benchmarks locais) |

---

### Fase 8 — Marketplace (Futuro)

| Story | Descricao |
|-------|-----------|
| 8.1 | Integracao com fornecedores de insumos esteticos |
| 8.2 | Precos auto-atualizados |
| 8.3 | Compras em bulk com desconto por volume projetado |

---

## Modelo de Monetizacao

| Plano | Escopo | Epics |
|-------|--------|-------|
| **Start** | Agenda + Servicos + Financeiro basico + Dashboard simples | E1-E4 |
| **Crescimento** | + DRE detalhada + Precificacao + Estoque + Projecoes + Lucro por servico | + E5-E6 |
| **Autoridade** | + Inteligencia IA + Integracoes + Analises estrategicas + Recomendacoes | + E7 |

**Pagamento:** Mensal, Trimestral (-10%), Anual (-25%)
**Trial:** 14 dias no plano Crescimento
**Metrica norte:** Tempo ate primeiro lucro visualizado no dashboard

---

## Dependencias entre Epics

```
E1 (Fundacao) ──► E2 (Catalogo + Agenda) ──► E3 (Automacao Financeira) ──► E4 (Dashboard + Lucro)
                                                      │                            │
                                                      ▼                            ▼
                                               E5 (Precificacao)            E6 (Inteligencia)
                                                      │
                                                      ▼
                                               E7 (Integracoes)
                                                      │
                                                      ▼
                                               E8 (Marketplace)
```

---

## Diretrizes Inegociaveis

1. **Agenda e o core** — toda receita nasce dela
2. **Automacao maxima** — zero lancamento manual
3. **Lucro por servico** — metrica central
4. **Numeros absolutos** — NAO graficos (exceto 1)
5. **Dashboard de tela unica** — sem scroll excessivo
6. **Simplicidade** — usuaria nao e financista
7. **Isolamento multi-tenant** — dados NUNCA vazam entre organizacoes
8. **Precisao financeira** — 2 casas decimais, arredondamento consistente

---

*KEYRA — KEY + Receita + Acelerada*
*O primeiro financeiro operacional para estetica*
