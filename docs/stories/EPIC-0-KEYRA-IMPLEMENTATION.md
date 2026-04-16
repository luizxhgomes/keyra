# EPIC-0: KEYRA — Plano de Implementacao Completo

> Epic geral que mapeia todas as fases de construcao do KEYRA do zero.
> Contexto completo: `docs/audios-idealizadora/contexto-completo-keyra.md`
> Data: 2026-04-12

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

| # | Entregavel | Agente | Status |
|---|-----------|--------|--------|
| 0.1 | Environment bootstrap (git, GitHub, Supabase, Vercel) | @devops | [ ] |
| 0.2 | PRD formal | @pm | [ ] |
| 0.3 | Arquitetura fullstack | @architect | [ ] |
| 0.4 | Schema de banco com RLS | @data-engineer | [ ] |
| 0.5 | Wireframes dashboard numerico | @ux-design-expert | [ ] |
| 0.6 | Pesquisa competitiva | @analyst | [ ] |

**Criterio de aceitacao:** PRD aprovado pela idealizadora, schema com RLS validado, wireframes alinhados com principios UX (numeros absolutos, tela unica).

---

### Fase 1 — Fundacao Tecnica (Semanas 3-4)
**Workflow:** SDC (Story Development Cycle)

| Story | Descricao | Agente |
|-------|-----------|--------|
| 1.1 | Setup Next.js 15 + Supabase + Auth | @dev |
| 1.2 | CRUD organizacoes (studio/clinica) | @dev |
| 1.3 | Gestao de profissionais (roles: dono, profissional) | @dev |
| 1.4 | RLS policies para isolamento multi-tenant | @data-engineer |
| 1.5 | Layout base + navegacao + design system | @dev + @ux-design-expert |

**Criterio:** Login funcional, org criada, RLS testado (org A nao ve org B).

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
