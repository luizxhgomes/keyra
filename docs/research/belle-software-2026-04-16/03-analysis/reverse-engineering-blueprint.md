# Belle Software — Reverse Engineering Blueprint

**Data:** 2026-04-16
**Objetivo:** Decompor COMO a Belle Software foi concebida, construída e evoluída — blueprint ponta-a-ponta (produto + arquitetura + negócio + decisões) como se fôssemos refazê-la em 2026.
**Fontes:** dossiês `02-data-collection/*` (5 frentes triangulares) + `company-intel.md` + `tech-stack.md`
**Marcações:** `[INFERÊNCIA]` onde não há evidência direta, `[EVID]` onde há citação rastreável

---

## 1. Hipótese Central

A Belle Software é o **caso-clássico brasileiro de software vertical bootstrap construído por um CEO-acadêmico do interior de Santa Catarina, sem venture capital, sem pressão de escala, que venceu pela combinação de (a) nicho bem escolhido, (b) consolidação via M&A barato de concorrente histórico, (c) evento-proprietário como motor de autoridade e (d) monetização em camadas (SaaS base + 8 add-ons + consultoria +Resultados + produto Belle Franquias)**.

[INFERÊNCIA] A aposta original de 2009 foi **desenvolvimento sob encomenda genérico** (a razão social "Geinffo Tecnologia de Informação" e origem na Incubadora FETEC/Uniarp sugerem isso — `company-intel.md §1-2`). O **pivô decisivo para estética em 2014** foi feito **inspirando-se no software "Gestão SPA"** (à época referência do nicho — `company-intel.md §2`) — a Belle surgiu mirando o espaço que essa marca ocupava. Em **2020, durante a pandemia, a Belle adquire os direitos da marca "Gestão SPA"** (press release Terra) e migra a base do concorrente para si — **o movimento de consolidação mais importante da história da empresa**. É um padrão de "bootstrap comprando incumbente cansado barato" que define a trajetória.

**Por que venceu:** (i) nicho profundo + Conference como ativo defensivo; (ii) ninguém no mercado tinha estômago para vertical pura de estética clínica profissional com esse nível de completude; (iii) bootstrap permitiu **ficar pequena e profunda** onde VC-backed teria sido empurrada a escalar horizontal.

**Por que agora é vulnerável:** 17 anos de dívida técnica visível, UX datada, bugs no core (pacotes/sessões), WhatsApp banindo contas, zero analytics, zero API pública, CEO sobrecarregado (academic + sócio de agência + palestrante + CEO). Janela de 18–24 meses para KEYRA greenfield (`company-intel.md §15`).

---

## 2. Timeline de Construção (cronologia inferida)

| Ano | Fato observado | Inferência de causa/motivação |
|---|---|---|
| **2009 (15/abr)** | Fundação Geinffo Tecnologia em Caçador/SC, origem na **Incubadora FETEC/Uniarp** | [EVID] `company-intel.md §1-2`. Start acadêmico típico; Rafael Thibes (Ciência da Computação + Uniarp professor) usa incubadora como rampa. Sócio em **Markkit AA (agência de marketing)** desde o início — ecossistema integrado. |
| **2009–2013** | "Dr. Análise" (software para clínicas médicas) já existe | [EVID] `tech-stack.md §1`. **Primeiro produto vertical** da Geinffo — mostra DNA de ir para verticais de saúde/estética desde cedo. |
| **2014** | Lançamento do **Belle Software**, inspirado em "Gestão SPA" | [INFERÊNCIA] Pivô estratégico: saem do genérico, escolhem **estética** (mercado crescente, fragmentado, feminino, alto ticket por procedimento). Razão: Gestão SPA já validava a categoria mas envelhecia. |
| **~2017** | App iOS profissional publicado (id **1300715755**) e cliente (id **1277892957**) | [EVID] `product-features.md §2.6` + `tech-stack.md §5`. **IDs desse range datam de 2017.** Decisão de dois apps nativos separados — padrão do mercado. |
| **~2019** | Empresa "dobra a receita de 2018" (declaração de Thibes à Terra) | [EVID] `company-intel.md §2`. Primeira viralização do modelo; Conference começa a alimentar pipeline. |
| **2020** | **Aquisição dos direitos da marca "Gestão SPA"** | [EVID] release Terra/Dino. **Consolidação via M&A barato durante pandemia.** Migra base de clientes da Gestão SPA para a Belle — salto de escala sem crescimento orgânico. |
| **2020** | 2ª edição do **Gestão de Estética Conference** | [EVID] `brand-and-positioning.md §6.5`. Evento-proprietário consolida autoridade. |
| **2023–2024** | Adiciona IA: **BelleChat IA** (atendimento WhatsApp) + **Gestor IA** (analytics conversacional) | [EVID] `product-features.md §2.5`. **Movimento defensivo** contra AI-native entrants; [INFERÊNCIA] bolt-on sobre core legado (chamadas LLM externas, OpenAI/Anthropic/Azure). |
| **2024+** | 2.700+ clínicas (IG) / 27k usuários ativos / 60 franquias | [EVID] `brand-and-positioning.md §7` + `pricing-and-funnel.md §9.3`. Crescimento 2020 (1.000) → 2024 (2.700) ≈ **CAGR ~28% a.a.** |
| **2025** | **Nova UX** anunciada (página `/belle-software-nova-ux`) | [EVID] `site-map.md` UX §1. Sinal de que a dívida técnica UX virou prioridade — **mas ainda sendo lançada**, não lançada. |
| **2025 (ago)** | App profissional versão 2.4.23 (APK 8.5 MB Kotlin/Java nativo) | [EVID] `tech-stack.md §5`. **Não migraram para cross-platform** (RN/Flutter) — aumenta custo mobile mas preserva performance. |
| **2025** | 4ª edição presencial da Conference (18–21 mar) + 7ª online | [EVID] `brand-and-positioning.md §6.5`. 23k+ inscritos acumulados. |
| **2026** | Janela aberta de ataque (sem vagas, sem news, sem M&A) | [EVID] `company-intel.md §12,15`. "Sem vagas abertas no momento" = empresa não está em hiring agressivo. |

---

## 3. Arquitetura de Produto (inferida)

### 3.1 Camadas

```
┌──────────────────────────────────────────────────────────────────┐
│                    MARCAS DE ENTRADA                              │
│  www.bellesoftware.com.br (institucional — WP-limpo ou estático) │
│  gestaodeestetica.com (blog autoridade separado — SEO)            │
│  conference.gestaodeestetica.com (evento anual)                   │
│  materiais.bellesoftware.com.br (lead magnets)                    │
└────────────────────────┬─────────────────────────────────────────┘
                         │ trial 14/60 dias
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  CAMADA SaaS CORE — app.bellesoftware.com.br                      │
│  [INFERÊNCIA] Monolito web legado (ASP.NET ou PHP), SPA próprio    │
│  Multi-tenant, AWS, backup diário, sem CDN global detectada       │
│  Rota interna /suporte/ (suporte como feature nativa)              │
└───┬──────────────────┬──────────────────┬────────────────────────┘
    │                  │                  │
    ▼                  ▼                  ▼
┌────────────┐   ┌────────────┐    ┌─────────────────┐
│ Agenda HUB │   │ Financeiro │    │ CRM + Funil     │
│ (compromiso│   │ (contas,   │    │ + Automação     │
│  dispara   │──▶│  caixa,    │    │ Marketing 50+   │
│  notifs +  │   │  pacotes,  │    │ jornadas        │
│  ficha +   │   │  comissão) │    │                 │
│  caixa)    │   └─────┬──────┘    └────────┬────────┘
└─────┬──────┘         │                    │
      │                ▼                    │
      │         ┌────────────────┐          │
      │         │ BSC 4-perspec  │◀─────────┘
      │         │ Financeira /   │
      │         │ Cliente / Proc │
      │         │ Aprendizado    │
      │         └────────────────┘
      ▼
┌──────────────────────────────────────────────────────────────────┐
│  CAMADA DE CLIENTES (apps nativos 8.5 MB cada)                    │
│  App Profissional (iOS id 1300715755 / Android .profissional)     │
│  App Cliente      (iOS id 1277892957 / Android .cliente)           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  CAMADA DE ADD-ONS PAGOS (feature flags monetizáveis)              │
│  BelleMessage R$229 · BI R$150 · Marketing R$150 · NFS-e R$70     │
│  NFC-e R$90 · Biometria R$90 · Assinatura Eletrônica R$45         │
│  App Cliente Exclusivo R$150 · Treinamento individual R$250 1x    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  CAMADA DE IA (bolt-on recente, chamadas LLM externas)            │
│  BelleChat IA (chatbot WhatsApp — front de atendimento)            │
│  Gestor IA (NL → dados da clínica — backoffice)                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  CAMADA DE INTEGRAÇÃO (webhook-based via Pluga iPaaS pago)         │
│  Pagamentos: Stone, Pagar.me, Multiplus Card, PagoLivre            │
│  Fiscal: NFS-e municipal (por cidade) / NFC-e / SAT / ECF          │
│  WhatsApp: BelleMessage (próprio) + PlugMessage + ZapBot          │
│  CRM externo: RD Station Marketing (via Pluga webhook)             │
│  Captura: Facebook Lead Ads (via Pluga)                            │
│  Cloudia (secretária virtual com IA — parceria declarada)          │
│  **SEM API pública própria** — moat contra extração fácil de dados│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  CAMADA META — Belle Franquias (produto adjacente enterprise)      │
│  PRM + Royalties + Gestão multi-unidade consolidada + app rede    │
│  Clientes: 60 redes (Estética Hollywood Dr. Rey, Semblànt, etc.)  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  CAMADA DE SERVIÇO HUMANO (+Resultados)                           │
│  Consultoria contínua de marketing/CRM executada pela Belle       │
│  Preço sob consulta (estimativa R$1.000–3.000/mês)                │
│  Cases: +65% CAF, +60% ticket Revitalize, +40% BodyPrime          │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Estratégia de Modularização

A Belle é **monolito com feature flags monetizáveis** — não é modular no sentido "plug-and-play" do Stripe ou do Shopify. Cada funcionalidade "premium" vira **SKU separado** que aumenta o ARPU à medida que o cliente cresce (ver `product-features.md §1.3`).

**Design comercial da modularização (inferido):**

| Módulo core (incluso) | Agenda · Financeiro básico · CRM raso · Painel atendimento · Ficha avaliação · Pacotes · Comissão · Painel BSC básico · App profissional · App cliente · Site público · Notificações SMS/e-mail/push |
|---|---|
| **Feature flag PAGO 1 — fiscal** | NFS-e R$ 70 · NFC-e R$ 90 (obrigatório para quem emite nota) |
| **Feature flag PAGO 2 — relacionamento** | BelleMessage WhatsApp R$ 229 · Automação Marketing 50+ jornadas R$ 150 · Assinatura Eletrônica R$ 45 |
| **Feature flag PAGO 3 — analítico** | BI dashboards R$ 150 |
| **Feature flag PAGO 4 — infra** | Biometria R$ 90 · App Cliente Exclusivo (white-label) R$ 150 |
| **Feature flag PAGO 5 — serviço** | Treinamento individual R$ 250 (one-shot) |
| **Feature flag PAGO 6 — IA** | BelleChat IA (preço sob consulta) · Gestor IA (preço sob consulta) |
| **Produto adjacente enterprise** | Belle Franquias (cotação customizada — 60 clientes) |
| **Serviço anexo (margem alta)** | +Resultados consultoria (R$ 1.000–3.000/mês est.) |

**Implicação estratégica (design comercial):** uma clínica média que liga **base R$ 170 + WhatsApp R$ 229 + BI R$ 150 + NFS-e R$ 70 + Marketing R$ 150 = ~R$ 769/mês** antes de +Resultados. O preço nominal de R$ 72/mês (plano pequeno) é **ancoragem**; o ticket real **multiplica 4–10×** via add-ons. Padrão clássico **land-and-expand de ERP verticalizado brasileiro** (`pricing-and-funnel.md §2.3`).

### 3.3 Onde ficou dívida técnica (evidências de legacy)

1. **UX "anos 90"** reportada em RA (`company-intel.md §7`) — sinal de frontend legacy não refatorado. A "Nova UX" ainda está sendo lançada em 2025, não lançada.
2. **Bugs em controle de pacotes/sessões** ("12 sessões em vez de 10" — RA) — bug **crítico de negócio** num módulo core. Sugere **testes automatizados insuficientes** ou **modelo de dados mal versionado**.
3. **SAC padronizado, respostas frias** — sem observabilidade de conversas (inferência) ou playbook de suporte empático.
4. **WhatsApp banindo contas** (BelleMessage + Speedchat) — integração WhatsApp **em zona cinza da Meta**, não via Cloud API oficial. [INFERÊNCIA] Gateway não-oficial foi decisão pragmática de custo que virou risco de compliance.
5. **Zero analytics detectados** no site institucional (GA4/GTM/Pixel/Hotjar ausentes — `tech-stack.md §7`) — sugere marketing não data-driven, decisões por intuição.
6. **Zero API pública** — integrações só via Pluga (iPaaS pago). [INFERÊNCIA] **decisão deliberada** de moat contra extração de dados (cliente fica preso porque exportar é custoso).
7. **Dois apps mobile nativos separados** (profissional + cliente, Kotlin/Swift, 8.5 MB cada) — boa performance mas **aumenta custo de manutenção 2×** e roadmap mobile lento.
8. **Help center WordPress + Heroic KB plugin** — solução barata que funciona, mas UI datada reforça "sistema antigo".
9. **Help Center com ID range iOS 2017** (id 1277892957 cadastrado em ~2017) + APK versão 2.4.23 (ago/2025) — evolução **lenta** do mobile.
10. **Atraso em entrega de backup LGPD** (RA) — sugere **exportação manual**, não self-service.

---

## 4. Arquitetura de Negócio

### 4.1 Monetização em camadas (receita composta)

| Camada | Peso estimado | Mecânica |
|---|---|---|
| **1. Assinatura SaaS base (per seat)** | Core (40–50% ARR) | Preço escala com # profissionais/agendas (R$ 865 a R$ 3.800/ano) |
| **2. Add-ons recorrentes (expansion revenue)** | Alto (30–40% ARR) | 8+ SKUs que empilham; bundle típico +R$ 450/mês sobre base |
| **3. Consultoria +Resultados (serviço)** | Médio-alto (10–20% ARR) | R$ 1.000–3.000/mês est., alta margem, sem CAC (base instalada) |
| **4. Belle Franquias (enterprise)** | Médio (5–15% ARR) | 60 redes, ticket 5–10× plano base [INFERÊNCIA] |
| **5. Treinamento individual** | Baixo (<2% ARR) | R$ 250 one-shot, não recorrente |

### 4.2 Funil de aquisição

```
TOPO (inbound low-cost)
├── Blog gestaodeestetica.com (domínio separado para SEO de "gestão de estética")
├── YouTube bellesoftware (demos + cases institucionais, não entretenimento)
├── Instagram @bellesoftware (~11k — subdimensionado para 2.700 clientes)
├── PR editorial (Terra/GloboPlay/Mundo Marketing + coluna Thibes em Revista Negócio Estética)
├── Ebooks lead magnet (3: Automatização, Marketing, Máquina de Vendas)
├── Landing pages segmentadas por vertical (SEO cauda longa — /software-para-pilates-e-yoga/ etc.)
└── Parcerias (Markkit, Follow Me, Cloudia, Estetika, Beauty Summit)

MEIO (consideração)
├── Cases nomeados com números (+65% CAF, +40% BodyPrime...)
├── Prova social (2.700+ clínicas, 60 franquias, 27k usuários)
├── Selo GPTW + Parceiro TOTVS (ilusão de moat — é só ATS cliente)
├── Help Center público ajuda.bellesoftware.com.br (SEO defensivo + profundidade visível)
└── Comparativos 3rd-party (Cloudia, Belasis, Celcoin)

FUNDO (conversão)
├── Trial 14d (+ 7 extensão + 10 grace = 31 dias efetivos, sem cartão)
├── Trial 60d (leads qualificados / parceiros / eventos)
├── WhatsApp (11) 3230-5180 + 0800 646 0099 — SDR humano
├── Demo agendada (venda consultiva para clínica grande/franqueadora)
├── Importação de dados (remove fricção de switch)
└── Onboarding 2 reuniões 30min + 7 treinamentos coletivos 1h
```

### 4.3 Upsell e expansão (growth account)

Sequência inferida do primeiro ano do cliente:

1. **Mês 0:** base SaaS (R$ 72–170/mês)
2. **Mês 1–2:** NFS-e (R$ 70) e BelleMessage (R$ 229) — após treinamento coletivo revelar necessidade
3. **Mês 3–4:** Automação Marketing (R$ 150) — vendida via "resultados dos cases CAF/BodyPrime"
4. **Mês 6–9:** BI (R$ 150) — vendida quando cliente pede "relatórios mais ricos"
5. **Mês 12+:** +Resultados (consultoria) — vendida como "agora que você tem dados, vamos executar"

**ARPU progride de ~R$ 170 → ~R$ 769 → R$ 1.500–3.500** ao longo de 12–18 meses. Movimento **clássico "software + services" brasileiro**.

### 4.4 Retenção (lock-in estruturado)

| Mecânica de lock-in | Intensidade | Evidência |
|---|---|---|
| **Fidelidade 1 ano (anual) / 2 anos (bienal)** | Alta | `pricing-and-funnel.md §1.2` |
| **Multa 50% do saldo devedor** em cancelamento antecipado | **Muito alta** | `pricing-and-funnel.md §1.2` |
| **Switching cost de dados** (sem API, exportação demorada) | Muito alta | RA reclama de atraso em backup |
| **Switching cost operacional** (7 treinamentos + 2 kickoffs — clínica se acomoda) | Alta | `pricing-and-funnel.md §8.3` |
| **+Resultados cria dependência** (equipe da Belle executa marketing do cliente) | Alta | `product-features.md §4` |
| **Conference anual** (switching cost emocional — não quer ficar de fora) | Média | `brand-and-positioning.md §6.5` |
| **Belle Franquias** (migrar uma rede inteira é catastrófico) | Muito alta | 60 redes presas |

**Leitura:** retenção da Belle é **mais por fricção contratual e operacional do que por valor percebido**. É exatamente isso que KEYRA ataca (`pricing-and-funnel.md §10.1 #4`).

---

## 5. Decisões-chave Inferidas (10 decisões explícitas)

1. **Escolheram vertical estética em 2014 ao invés de continuar genéricos** — mirando "Gestão SPA" como benchmark; apostaram em profundidade setorial, não amplitude.
2. **Compraram a marca "Gestão SPA" em 2020 (pandemia, preço baixo) ao invés de competir cabeça-a-cabeça** — consolidação pragmática via M&A barato.
3. **Bootstrap 17 anos ao invés de captar VC** — protegeu autonomia de direção, custou velocidade de produto. Capital social R$ 170k até hoje.
4. **Monolito com feature flags pagas ao invés de modular plug-and-play** — maximiza ARPU e switching cost, prejudica velocidade de refatoração.
5. **2 apps mobile nativos (Kotlin + Swift) ao invés de cross-platform** — qualidade acima de custo; resultado: APK leve 8.5 MB mas time mobile 2×.
6. **Conference presencial anual ao invés de comunidade contínua** — autoridade de palco, custo de produção alto, defensível setorialmente.
7. **+Resultados (consultoria de marketing) ao invés de só software** — margem alta, LTV+, monetiza base instalada sem CAC.
8. **Belle Franquias como produto adjacente ao invés de feature do core** — enterprise pricing, ticket 5–10×, moat altíssimo (rede não troca).
9. **WhatsApp via BelleMessage/Speedchat ao invés de Cloud API Meta oficial** — custo menor mas **virou risco de compliance** (bans reportados em RA).
10. **CEO-acadêmico founder-led via Conference + coluna em Revista ao invés de founder-led em redes sociais** — cria autoridade setorial, perde tração com Gen Y/Z e perfis digitais.

---

## 6. Decisões que NÃO tomaram (fragilidades)

1. **Nunca abriram API pública.** Integrações dependem de Pluga (iPaaS pago — cliente paga duplo). Moat contra extração, mas impede ecossistema de parceiros/integradores. KEYRA vence aqui.
2. **Nunca instalaram analytics/CRO no site institucional** (nenhum GA4, GTM, Pixel, Hotjar, Clarity detectado). Decisões de marketing por intuição, não por dados.
3. **Nunca construíram comunidade contínua** (Discord, fórum, WhatsApp curado). Comunidade só acontece 1×/ano na Conference.
4. **Nunca publicaram reviews em G2/Capterra/Trustpilot.** Zero presença em SEO de comparação internacional — território aberto para KEYRA ocupar com "Belle alternative".
5. **Nunca nomearam DPO na Política de Privacidade** — fragilidade LGPD explícita (`company-intel.md §14 #6`). KEYRA lança com DPO nomeado dia 1.
6. **Nunca criaram status page pública** (`tech-stack.md §14 #9`). Clientes descobrem indisponibilidade no grupo de WhatsApp.
7. **Nunca entraram em precificação estratégica** (BOM + markup + margem) — **gap universal do mercado**, Belle + Trinks + 14 outros players (Trinks F3.3).
8. **Nunca investiram em founder-led content digital do CEO** (Thibes só aparece em Conference e coluna setorial). Rafael tem autoridade mas não tração Gen Y/Z.
9. **Nunca uniram os 2 apps mobile** (deixaram fragmentação profissional/cliente). Custo 2×.
10. **Nunca entraram em Open Finance / conciliação bancária** — financeiro ficou raso, território KEYRA.

---

## 7. Motor de Crescimento (growth loop)

```
          ┌──────────────────────────────────┐
          │  GESTÃO DE ESTÉTICA CONFERENCE    │
          │  (1×/ano presencial + 1×/ano on)   │
          │  23k+ inscritos acumulados         │
          └──────┬────────────────────┬───────┘
                 │                    │
         conteúdo│                    │leads B2B
         editado │                    │qualificados
                 ▼                    ▼
    ┌────────────────────┐    ┌─────────────────────┐
    │ BLOG              │    │ TRIAL 14d / 60d      │
    │ gestaodeestetica  │◀───│ (sem cartão)          │
    │ .com (SEO forte)  │    │                        │
    │ + Ebooks (3)      │    └──────────┬────────────┘
    │ + YouTube demos   │               │
    │ + IG @belle       │               │assistência SDR
    └──────────┬────────┘               │via WhatsApp/0800
               │                        ▼
               │ content-hijack          ┌──────────────────────┐
               │ ("belle vs X",         │ ONBOARDING            │
               │  "gestão clínica")     │ 7 treinamentos coletivos│
               ▼                        │ + 2 kickoffs 30min     │
    ┌──────────────────────┐           └──────────┬───────────┘
    │ CASES COM NÚMEROS    │                      │
    │ +65% CAF             │                      ▼
    │ +40% BodyPrime       │           ┌──────────────────────┐
    │ +60% ticket Revital  │           │ ATIVAÇÃO + ADD-ONS    │
    │ Dr. Rey Hollywood    │◀──────────│ NFS-e → WhatsApp →    │
    │ (30 unidades)        │           │ Marketing → BI        │
    └──────────┬───────────┘           └──────────┬───────────┘
               │                                   │
               │ alimenta                          │
               │                                   ▼
               │                        ┌──────────────────────┐
               │                        │ +RESULTADOS           │
               │                        │ (consultoria          │
               │                        │ marketing 6–12 meses) │
               │                        └──────────┬───────────┘
               │                                   │
               │                    case com número│
               └───────────────────────────────────┘
```

**Loop fechado:** Conference e conteúdo alimentam trial → onboarding padronizado → upsell incremental (add-ons) → consultoria +Resultados gera cases com números → **cases voltam para o conteúdo e a Conference como prova social**. Defensibilidade do loop: **média** (qualquer concorrente bem-financiado replica em 18–24m, mas não em 6).

---

## 8. Modelo Mental dos Fundadores

Perfil de **Rafael Francisco Thibes** (`company-intel.md §3`):

- **Formação:** Ciência da Computação + MBA FGV + 5 pós-graduações + mestrado em andamento em "Desenvolvimento e Sociedade"
- **Carreira paralela:** professor universitário (Uniarp), colunista (Revista Negócio Estética, Beleza Sem Fronteiras), palestrante circuito estética
- **Sócio em:** Markkit AA (agência de marketing para estética) — **ecossistema integrado**
- **Criou:** Gestão de Estética Conference (evento anual)
- **NÃO tem:** LinkedIn forte, podcast, YouTube pessoal, Twitter/X, presença founder-led digital

**Modelo mental inferido:**

1. **"Autoridade por credencial + palco", não por viralização digital** — acadêmico constrói legitimidade via títulos e Conference, não via construir-em-público.
2. **"Ecossistema vertical em camadas"** — software (Belle) + agência (Markkit) + evento (Conference) + mídia (coluna em revista) = **quatro frentes que se realimentam**. Dificilmente um concorrente só-software supera.
3. **"Consolidar barato ao invés de competir"** — compra Gestão SPA em 2020; pragmatismo interiorano de SC, não mentalidade blitz-scale.
4. **"Bootstrap conservador"** — cash-flow positivo 17 anos, capital social R$ 170k, zero dívida, zero VC. Prefere crescer devagar e sustentável.
5. **"Profundidade vertical > amplitude horizontal"** — escolhe estética clínica e vai fundo, não pulveriza em 20 verticais.
6. **"Produto como commodity, serviço como margem"** — +Resultados é onde está a verdadeira margem; software base é rampa.
7. **"Autoridade + completude > inovação"** — "O MELHOR sistema" (repetido ad nauseam) é messaging de Governante estabelecido, não de desafiante.
8. **"Cliente grande (franquia) financia cliente pequeno"** — Belle Franquias é enterprise; ticket 5–10× subsidia infra que atende a clínica pequena.

**Implicação para KEYRA:** Rafael não vai reagir à KEYRA com **guerra de preço** (não tem munição) nem com **founder-voice digital** (não é seu canal). A defesa dele será via **Conference 2027, cases novos, Belle Franquias e, no limite, um novo add-on "financeiro profundo"** — mas stack legado atrasa essa resposta 18–24 meses.

---

## 9. Se fôssemos refazer a Belle em 2026

### 9.1 O que manteríamos

1. **Vertical profundo estética clínica** — nicho bem escolhido, LTV alto, fragmentação razoável, receptivo a software.
2. **Evento-proprietário como motor de autoridade** (mas reformatado — trimestral online + anual presencial, não 1×/ano só).
3. **Apps nativos leves (<10 MB)** — boa para 4G BR.
4. **Monetização em camadas** (base + add-ons + serviço) — modelo financeiramente saudável.
5. **Help center público robusto** — SEO defensivo + profundidade percebida.
6. **BSC 4-perspectivas como framework de metas** — sólido, não-triviais de replicar.
7. **Consultoria como camada de receita de alta margem** — mas **opcional e modular**, não empurrada.
8. **Trial generoso sem cartão** (14 → 31 dias efetivos via extensão + grace).
9. **Cases com números** (não só depoimentos vazios).
10. **Domínios separados por função** (`www`, `app`, `ajuda`, `materiais`, `conference`).

### 9.2 O que faríamos diferente

| Decisão Belle | KEYRA refazendo |
|---|---|
| Monolito ASP.NET/PHP [INFERÊNCIA] | **Next.js 16 + Supabase + Postgres RLS nativo + Edge Functions** |
| 2 apps nativos separados (Kotlin + Swift) | **1 PWA + 1 RN/Expo unificado com feature flag persona** |
| Sem API pública (lock-in por Pluga) | **REST + OpenAPI + docs públicas Stripe-style dia 1** |
| Zero analytics/CRO | **GA4 + GTM + Clarity + PostHog + Mixpanel** |
| WhatsApp via Speedchat/BelleMessage (zona cinza) | **WhatsApp Cloud API Meta oficial, incluso no plano base** |
| Add-ons empilhando até R$ 769/mês | **Plano único transparente com WhatsApp + NFS-e + precificação + metas inclusos** |
| Fidelidade 1–2 anos + multa 50% | **Mensal sem fidelidade, sem multa, portabilidade 1-clique** |
| Preço opaco (demo obrigatória) | **Preço público todas faixas + calculadora** |
| 7 treinamentos Zoom + R$ 250 individual | **Onboarding in-app AI copilot, 10 minutos, zero Zoom obrigatório** |
| BI como add-on R$ 150/mês | **Tela única "Hoje" com 5 números absolutos — BI deliberadamente ausente** |
| Gestor IA bolt-on (chamadas LLM) | **AI-native no core: precificação sugerida, risco de caixa, churn preditivo, follow-up automático** |
| Financeiro raso (caixa + contas) | **CFO-grade: DRE + fluxo projetado + margem por procedimento + conciliação Open Finance + SPED + pró-labore** |
| Help Center WordPress + Heroic KB | **Mintlify ou Docusaurus — moderno, search-first, AI-enabled** |
| Conference presencial anual | **Comunidade contínua (WhatsApp curado + masterclass mensal) + 1 encontro anual** |
| CEO acadêmico não-digital | **Founder-led content do Luiz (LinkedIn/Instagram diário, construindo em público)** |
| Sem status page, sem DPO nomeado | **Status page BetterStack + DPO nomeado dia 1** |
| Sem reviews G2/Capterra | **Ocupar G2/Capterra desde o mês 3 — SEO de comparação** |
| Múltiplos gateways (Stone/Pagar.me/Multiplus/PagoLivre) com lock-in por TEF | **Multi-adquirente neutro com conciliação automática** |
| Vertical "estética + 6 pétalas de marketing" | **Só estética. Nem pilates, nem salão, nem franquia. "Melhor clínica da rua"** |

### 9.3 O que a Belle NÃO conseguirá imitar do KEYRA e por quê

1. **UX radical tela única.** Exigiria **refatoração completa** do frontend legado. 17 anos de UI condicionou time e usuários. A "Nova UX" ainda está sendo lançada em 2025 — estimativa de 2–3 anos para reescrever + re-treinar base.
2. **Financeiro CFO-grade (DRE + fluxo projetado + margem por procedimento).** Exige **re-modelagem de dados** do core (introduzir BOM editável, custo direto, margem por transação). 12–18 meses de engenharia + risco de quebrar pacotes (já buggy).
3. **Preço público + zero fidelidade.** **Matar a fidelidade de 1–2 anos com multa 50%** quebra 40–60% do LTV atual. Difícil decisão política que bootstrap sem VC não vai tomar.
4. **AI-native por design.** Exige re-arquitetar pipelines de dados para que IA opere no core (não bolt-on). Inviável em monolito legado sem stop-and-rewrite.
5. **Founder-led content digital diário.** Rafael Thibes tem 17 anos de marca "acadêmico institucional". Pivotar para founder digital diário seria inorgânico e demoraria 2 anos para construir tração.
6. **Comunidade contínua via WhatsApp curado.** Conference é 1×/ano, operação pesada. Comunidade contínua exige Community Manager dedicado, playbook, tempo de founders — cultura diferente da Belle.
7. **Multi-adquirente neutro.** Belle tem relacionamentos contratuais com TEF próprio e gateways que geram kickback/comissão. Ficar neutro corta receita de intermediação.
8. **Migração assistida via API Trinks+Belle.** KEYRA pode **construir importador automático** via API pública Trinks; Belle não pode fazer o mesmo via KEYRA (KEYRA não terá API interna para ela consumir no início).

---

## 10. Playbook para KEYRA Extrair da Belle (10–15 plays concretas)

### Plays de produto (5)
1. **Replicar BSC 4-perspectivas** como base do módulo Metas do KEYRA — framework sólido, mas simplificar para "3 números absolutos por perspectiva" (alinhado ao princípio UX da idealizadora).
2. **Replicar estrutura 2 apps (profissional + cliente)** mas unificar em 1 PWA + 1 RN — mesmo benefício, custo metade.
3. **Replicar notificações multi-canal** (WhatsApp + SMS + e-mail + push) mas via **Cloud API Meta oficial** (matar risco de ban).
4. **Replicar pacotes de sessão** mas com **trilha de auditoria imutável** por sessão (quem agendou, quem executou, quando consumiu) — feature-headline contra bug RA "12 em vez de 10".
5. **Replicar ficha de avaliação com antes/depois** — paridade obrigatória em estética clínica.

### Plays de negócio (5)
6. **Replicar trial longo sem cartão** — fazer 30 dias + extensão de 15 (equivalente Belle) com gatilhos de ativação mensuráveis.
7. **Não replicar fidelidade e multa** — **usar isso como arma de marca**: "mensal sem compromisso, cancele quando quiser, exportação em 1 clique". Landing page "liberte-se da Belle".
8. **Replicar modelo cases com números** — mas com métricas **financeiras** ("Clínica X sobrou +R$ 4.200/mês após 90 dias"), não de faturamento.
9. **Não replicar +Resultados consultoria empurrada** — fazer o oposto: **playbook de marketing gratuito embutido** (50 jornadas WhatsApp open source dentro do KEYRA).
10. **Replicar Help Center público robusto** — mas com **Mintlify + AI search + vídeo curto por artigo**, não WordPress + Heroic KB.

### Plays de GTM (5)
11. **SEO sniper** ocupando "belle software alternativa", "migrar do belle software", "belle software problemas", "belle software whatsapp banido" — Belle tem zero analytics/CRO, reage lento.
12. **ABM nos reclamantes públicos de RA/Geinfo** — lista curada de clínicas que reclamaram de bug em pacote, WhatsApp banido ou SAC padronizado. Abordagem com case de migração assistida + exportação.
13. **Content jiu-jitsu:** não atacar Rafael Thibes (é autoridade legítima), **atacar o produto** (UX datada, bugs no core, add-ons empilhados). Tom respeitoso, ataque aos modelos mentais, não às pessoas.
14. **Criar KEYRA Summit digital trimestral** — comunidade contínua de 4 encontros/ano vs Conference 1×/ano. Tema: "o que seu DRE está te escondendo". Convidar donas de clínica reais (não acadêmicos) como case-speakers.
15. **Migração assistida Belle→KEYRA** — documentar processo, fornecer template de exportação Belle (mesmo sem API, via planilhas + scripts) + onboarding 1-on-1 dos primeiros 100 migrantes. Zero CAC, alta conversão.

---

## Fontes principais

- [`02-data-collection/site-map.md`](../02-data-collection/site-map.md) — 60 URLs categorizadas
- [`02-data-collection/product-features.md`](../02-data-collection/product-features.md) — catálogo funcional completo + topologia
- [`02-data-collection/pricing-and-funnel.md`](../02-data-collection/pricing-and-funnel.md) — planos, trial, add-ons, fidelidade, funil
- [`02-data-collection/brand-and-positioning.md`](../02-data-collection/brand-and-positioning.md) — narrativa, arquétipo, Conference, brechas
- [`02-data-collection/tech-stack.md`](../02-data-collection/tech-stack.md) — subdomínios, mobile, hosting, API, analytics
- [`02-data-collection/company-intel.md`](../02-data-collection/company-intel.md) — CNPJ, founders, TOTVS, RA, equipe, ARR
- [Reclame Aqui — Geinfo](https://www.reclameaqui.com.br/geinfo/)
- [Terra/Dino — Aquisição Gestão SPA](https://www.terra.com.br/noticias/dino/belle-software-adquire-os-direitos-de-uso-da-marca-gestao-spa,023f9abb4baa204300bee0d204c88ebfso9urpu0.html)
- [Gestão de Estética Conference](https://conference.gestaodeestetica.com/)
- [Belle Software — Preços](https://www.bellesoftware.com.br/precos/)
