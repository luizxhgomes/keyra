# Belle Software — Benchmark Competitivo

**Data:** 2026-04-16
**Escopo:** Belle Software vs Trinks vs KEYRA (planejado)
**Fontes:** dossiês de coleta `02-data-collection/*` (Belle) + `trinks-analysis-2026-04-16/04-synthesis/*` (Trinks)
**Confiabilidade:** Alta para Belle (5 dossiês triangulados) · Alta para Trinks (pesquisa paralela 80+ URLs) · Declarativa para KEYRA (meta a construir)

---

## 1. Sumário Executivo do Benchmark

Belle e Trinks ocupam **faixas adjacentes mas não idênticas do mercado de gestão para beleza/estética brasileiro**. **Trinks lidera em escala absoluta** (44–50 mil estabelecimentos, 80M+ agendamentos/ano, adquirida pela Stone em 2023) com posicionamento **horizontal-informal** (salão + barbearia + clínica + studio + redes). **Belle lidera em profundidade vertical na "clínica de estética profissional"** (2.500–2.700 clínicas, 17 anos, bootstrap, sem VC) com tom corporativo-"Governante" e moat de switching-cost via full-suite + consultoria +Resultados + franquias. **Os dois são ERPs generalistas com financeiro raso, sem precificação estratégica e com UX saturada** — exatamente o vácuo onde **KEYRA nasce**: vertical-puro estética, financeiro profundo (DRE + fluxo projetado + margem por procedimento), UX radicalmente simples (tela única, números absolutos, zero gráfico) e anti-lock-in (mensal sem multa, preço público). A guerra não se ganha sendo "Belle mais barato" nem "Trinks mais bonito" — se ganha abrindo a **categoria nova "CFO para estética"**.

---

## 2. Posicionamento de Mercado

| Dimensão | Belle Software | Trinks | KEYRA (meta) |
|---|---|---|---|
| **ICP primário** | Proprietária de clínica de estética 3–15 profissionais; redes/franquias | Dono/a de salão/barbearia 1–10 profissionais (Renata, Rodrigo) | **Ana — dona de clínica de estética solo ou 1–3 profissionais que precisa saber "quanto sobra"** |
| **ICP secundário** | SPA, pilates, salão, micropigmentação (mas verticais são re-embalagem do mesmo core) | Clínica de estética (persona Jane), studios | Clínica 3–5 profissionais em fase de profissionalização financeira |
| **Promessa central** | "O melhor sistema para clínica de estética" (Governante — autoridade/completude) | "Da correria ao controle" (Parceira motivacional — "bora dar um up") | **"Menos gráfico. Mais lucro."** / CFO técnico vertical |
| **Arquétipo Jungian** | Governante + Sábio | Parceira/Amiga | Conselheiro pragmático |
| **Maturidade** | **17 anos** (Geinffo 2009, Belle Software 2014) | **13 anos** (Trinks 2012) | **Greenfield** (2026) |
| **Base de clientes** | 2.500–2.700 clínicas (IG declara 2.700+) | **44–50 mil estabelecimentos** | 0 → 100 piloto → 1.000 em 12m [meta] |
| **Usuários ativos / agendamentos** | 27 mil usuários ativos declarados | 80M+ agendamentos/ano (1M+/mês) | n/d |
| **Verticais atendidas** | 7 (estética, micropigmentação, pilates/yoga, salão, medicina estética, harmonização facial, laser) — mas só pilates e franquias têm features reais; resto é re-embalagem de marketing | 5 (salão, barbearia, clínica estética, studio, redes) | **1** (estética, ponto) |
| **Ownership** | Bootstrap puro, sem VC, CEO Rafael Thibes sócio majoritário | **Adquirida pelo Grupo Stone (2023)** — braço vertical beleza | Bootstrap inicial (Luiz Henrique) |
| **Moat principal** | Switching cost (full-suite) + consultoria +Resultados + produto Franquias | Ecossistema Stone (maquininha, crédito, Pagar.me) + marketplace 700k consumidores + escala | **Profundidade financeira vertical + UX tela única** |
| **Reputação pública** | RA baixo volume, não calcula nota (<10 reclamações); reclamações de bug em pacotes e WhatsApp | **RA 8.9/10 "ÓTIMO", Prêmio RA 2024**, 97% solucionadas | [a construir] |

**Leitura cruzada:** Trinks é **20× maior em base** que Belle, mas Belle é **mais profunda em estética clínica**. KEYRA precisa abdicar da amplitude Trinks e recusar a generalização Belle — ficar **só na dona de clínica de estética** (ver `brand-and-positioning.md §12.6`).

---

## 3. Matriz Funcional (features × player)

Legenda: ✅ nativo incluso | ⚠️ limitado/raso | ❌ não possui | 💰 add-on pago | 🎯 diferencial KEYRA

| Feature | Belle | Trinks | KEYRA (meta) |
|---|---|---|---|
| **Agenda multi-profissional** | ✅ | ✅ | ✅ |
| **Agendamento online público** | ✅ | ✅ (+ Google Reserve pioneiro) | ✅ |
| **App cliente self-service** | ✅ nativo (id 1277892957) | ✅ (com.trinks.m, 100k+ downloads) | ✅ (PWA ou RN unificado) |
| **App profissional** | ✅ nativo (id 1300715755) | ✅ (com.trinks.pro) | ✅ (mesmo app, feature flag) |
| **Notificações WhatsApp** | 💰 BelleMessage R$ 229/mês | 💰 add-on pago | ✅ **incluso no plano base via Cloud API Meta** 🎯 |
| **Notificações SMS/e-mail/push** | ✅ | ✅ | ✅ |
| **CRM + funil de leads** | ✅ | ✅ | ✅ |
| **Automação de marketing (jornadas)** | 💰 R$ 150/mês (50+ jornadas) | ⚠️ básico | ⚠️ fase 2 |
| **NPS** | ✅ nativo | ⚠️ | ✅ |
| **Ficha de avaliação / anamnese** | ✅ (perimetria, antes/depois, laser) | ✅ (anamnese personalizada, mapa de calor) | ✅ |
| **Pacotes / planos de sessão** | ✅ **(com bugs recorrentes — RA)** | ✅ | ✅ **com trilha de auditoria imutável** 🎯 |
| **Estoque básico** | ✅ | ✅ | ✅ |
| **Estoque com lote/validade (Anvisa)** | ❌ não divulgado | ❌ (Trinks findings F3.9) | ✅ 🎯 |
| **BOM / ficha técnica editável (custo direto por procedimento)** | ❌ | ❌ (Trinks F3.8 — log de uso, não BOM) | ✅ 🎯 **gap universal** |
| **Precificação estratégica (markup + margem-alvo + simulador)** | ❌ | ❌ (Trinks F3.3 — gap universal 16 players) | ✅ 🎯 **feature-âncora** |
| **Contas a pagar / receber** | ✅ | ✅ | ✅ |
| **Caixa entrada/saída** | ✅ | ✅ | ✅ |
| **DRE gerencial** | ⚠️ não claro no material público | ⚠️ relatório clássico (F3.4) | ✅ **tela única CFO-grade** 🎯 |
| **Fluxo de caixa projetado (forward)** | ❌ | ❌ | ✅ 🎯 |
| **Margem por serviço / procedimento** | ❌ | ❌ | ✅ 🎯 |
| **Conciliação bancária / Open Finance** | ❌ | ❌ (F3.5) | ✅ 🎯 |
| **Conciliação de adquirente / maquininha** | ⚠️ TEF proprietária | ❌ (RA reclama de antecipação/split) | ✅ **multi-adquirente neutro** 🎯 |
| **Integração contábil (SPED/OFX/ContaAzul/Nibo)** | ❌ | ❌ | ✅ 🎯 |
| **Pix dinâmico / QR nativo** | ⚠️ não destacado | ⚠️ via Stone | ✅ |
| **Pró-labore / separação PF-PJ** | ❌ | ❌ (F6.7 tabu Trinks) | ✅ 🎯 |
| **NFS-e** | 💰 R$ 70/mês | 💰 add-on (com bugs de duplicação) | ✅ **incluso no plano médio+** |
| **NFC-e** | 💰 R$ 90/mês | 💰 add-on | ⚠️ fase 2 |
| **Biometria check-in** | 💰 R$ 90/mês | ❌ | ❌ (não é dor KEYRA) |
| **Assinatura eletrônica** | 💰 R$ 45/mês | ❌ | ⚠️ fase 2 |
| **BI / dashboards avançados** | 💰 R$ 150/mês | ✅ 130+ relatórios nativos | ⚠️ **deliberadamente ausente — tela única substitui** 🎯 |
| **Metas (BSC 4 perspectivas)** | ✅ (Belle usa Balanced Scorecard) | ⚠️ comissão batch mensal (F3.10) | ✅ **metas do dono + metas do profissional em tempo real** 🎯 |
| **Comissão profissional** | ✅ | ✅ (batch mensal, ranking estático) | ✅ **escalonada + push em tempo real** |
| **IA — chatbot atendimento** | 💰 BelleChat IA (próprio) | 🔜 vaga Tech Lead AI aberta 2026 | ⚠️ fase 2 |
| **IA — analytics conversacional (NL → dados)** | ✅ Gestor IA (próprio) | ❌ | ⚠️ fase 2 |
| **IA — preditiva financeira (risco caixa, margem, churn)** | ❌ | ❌ | ✅ 🎯 |
| **Franquias / multi-unidade real** | ✅ **Belle Franquias** (PRM + royalties + app) — 60 redes | ✅ multi-unidade | ❌ **(deliberado — "não somos para franquias")** |
| **Marketplace B2C** | ❌ | ✅ 700k consumidores | ❌ (deliberado) |
| **Clube de assinaturas** | ⚠️ via pacotes | ✅ (case Nine Barbearia 3× faturamento) | ⚠️ fase 2 |
| **API pública documentada** | ❌ (integrações só via Pluga/iPaaS) | ✅ `trinks.readme.io` REST /v1/ X-Api-Key | ✅ 🎯 (REST + docs Stripe-style) |
| **Webhooks nativos** | ❌ | ✅ via Amazon SNS | ✅ |
| **Exportação total de dados (portabilidade LGPD)** | ⚠️ (RA relata atraso em entrega de backup) | ⚠️ | ✅ **self-service 1 clique** 🎯 |
| **Status page pública** | ❌ | ❌ (SLA-issue abr/2025 na RA) | ✅ 🎯 (BetterStack/Instatus dia 1) |
| **Integração contador / exportação SPED** | ❌ | ❌ | ✅ 🎯 |
| **Treinamento** | 7 treinamentos coletivos 1h incluso + R$ 250 individual | ⚠️ | ✅ **onboarding in-app AI copilot, 10 min** 🎯 |

**Leitura:** os "+" de Trinks (API, marketplace, Stone) e os "+" de Belle (IA embutida, vertical profundo, franquias) **não se sobrepõem no financeiro profundo** — território 100% livre para KEYRA.

---

## 4. Matriz de Pricing & GTM

| Dimensão | Belle Software | Trinks | KEYRA (meta) |
|---|---|---|---|
| **Tabela pública** | ❌ opaca (cotação por demo) | ⚠️ só 1-2 profissionais visível (R$ 76), 3+ "sob consulta" | ✅ **100% pública, todas faixas** 🎯 |
| **Plano mínimo (1 profissional)** | R$ 865,30/ano ≈ R$ 72/mês (Cloudia 2025) | R$ 76/mês | ≤ R$ 99/mês (meta) |
| **Plano médio (3–4 profissionais)** | R$ 2.048/ano ≈ R$ 170/mês | "sob consulta" | transparente |
| **Plano grande (12–15 profissionais)** | R$ 3.809/ano ≈ R$ 317/mês | "sob consulta" | transparente |
| **Desconto anual** | 15% | mensal→anual R$ 76→R$ 65 (~14%) | TBD (max 10%) |
| **Desconto bienal** | 26% | ❌ | ❌ (não promover lock-in longo) |
| **Trial** | 14 dias + 7 extensão + 10 grace = **31 dias efetivos**, sem cartão; há programa 60 dias para parceiros | **5 dias** (curto vs mercado) | **30 dias sem cartão** |
| **Fidelidade / multa** | 1–2 anos, **multa 50%** saldo devedor | 50% das parcelas restantes (percebida como 80% na RA) | **Zero fidelidade, zero multa** 🎯 |
| **Add-ons pagos (caros)** | 8+ SKUs recorrentes; bundle comum chega a R$ 689/mês (WhatsApp R$ 229 + BI R$ 150 + Marketing R$ 150 + NFS-e R$ 70 + NFC-e R$ 90) | WhatsApp, NFe, fidelidade, app exclusivo, autoatendimento, Clube | **Plano único com WhatsApp + NFS-e + metas + precificação inclusos** 🎯 |
| **Consultoria premium** | +Resultados (preço sob consulta, estimativa R$ 1.000–3.000/mês) | ❌ (tem ecossistema Stone) | ❌ (playbook gratuito embutido) 🎯 |
| **Produto de franquia enterprise** | ✅ Belle Franquias (60 redes) | ⚠️ multi-unidade nativo | ❌ deliberado |
| **Canal de aquisição principal** | SEO blog `gestaodeestetica.com` + Conference (23k inscritos) + feiras + indicação | SEO 13 anos blog + cross-sell Stone + Beauty Fair + marketplace reverso | **SEO sniper ("belle alternativa", "trinks alternativa") + founder-led content (Luiz)** |
| **Modelo comercial** | Híbrido: self-service 14d + venda assistida (SDR WhatsApp/0800 + closer enterprise) | Self-service 1-2 pros + sales-assisted 3+ | Self-service radical até 5 profissionais |
| **Onboarding** | 7 treinamentos coletivos 1h via Zoom; R$ 250 individual | ⚠️ (RA reclama) | In-app guiado, AI copilot, 10 min 🎯 |
| **SLA suporte** | 2a–6a 8h–22h / sáb 9h–16h30 | ⚠️ reclamações "limpe o cache" | SLA público + status page 🎯 |
| **Formas de pagamento** | Pix, TED, cartão | 100% cartão | Pix + cartão + boleto |
| **Cobrança** | Mensal/anual/bienal via cartão ou boleto | 100% cartão | Flex |
| **Reajuste** | Anual (não especificado índice) | IGP-M/IPCA 30d aviso | IPCA 12m 🎯 (abaixo do mercado) |
| **Eventos próprios** | Gestão de Estética Conference (4ª edição 2025, 23k+ inscritos acum.) | Patrocínio Beauty Fair, Sebrae | ⚠️ Comunidade contínua (WhatsApp curado + masterclass mensal) 🎯 |

---

## 5. Matriz Técnica

| Camada | Belle Software | Trinks | KEYRA (meta) |
|---|---|---|---|
| **Backend** | [INFERÊNCIA] ASP.NET / PHP legado (produto desde 2009, parceiro TOTVS, estilo enterprise) | ASP.NET C# (.NET Core + MVC + **Web Forms legado**) | **Next.js 16 + Node/Edge Functions** |
| **DB** | Relacional na AWS ([INFERÊNCIA] RDS) | SQL Server + EF | **Postgres (Supabase) com RLS nativo** 🎯 |
| **Frontend web** | [INFERÊNCIA] SPA próprio ou MPC server-rendered; site institucional estático/WP limpo | SPA Angular/React + SSR .NET + site institucional WordPress separado | **Next.js App Router + Server Components** |
| **Mobile** | **Nativo puro** Kotlin/Java + Swift (APK **8.5 MB**, IDs 2017) | Ionic/WebView híbrido (APK **80–87 MB**, lento) | **PWA first + RN/Expo único** (<10 MB) 🎯 |
| **Cloud** | AWS declarada; sem CDN terceira detectada no institucional | AWS CloudFront + SNS webhooks | **Vercel + Supabase + Cloudflare** (TTFB <100ms) 🎯 |
| **Help Center** | WordPress + **Heroic KB plugin** (URL `/knowledge-base/`) | Custom no domínio `ajuda.trinks.com` | Mintlify ou Docusaurus 🎯 |
| **API pública** | ❌ não divulgada — integrações via **Pluga (iPaaS pago)** | ✅ REST `/v1/` X-Api-Key, paginação 50, docs em `trinks.readme.io` | ✅ **REST + OpenAPI + docs públicas dia 1** 🎯 |
| **Webhooks** | ❌ | ✅ Amazon SNS | ✅ nativos |
| **Multi-tenancy** | [INFERÊNCIA] schema por clínica ou row-level | Row-level por `estabelecimento_id` | **RLS Postgres nativo** 🎯 |
| **Auth / SSO** | Login tradicional, sem SSO corporativo visível | — | Supabase Auth + Google/Apple SSO dia 1 |
| **Analytics** | ❌ nenhum tracking detectado (sem GA4, GTM, Pixel, Clarity) | — | GA4 + GTM + Clarity + Hotjar 🎯 |
| **Status page** | ❌ | ❌ | ✅ BetterStack/Instatus 🎯 |
| **IA nativa** | BelleChat IA + Gestor IA (chamadas LLM externas, [INFERÊNCIA] OpenAI/Anthropic/Azure) — feature bolt-on | Vaga "Tech Lead AI Engineer LLM" aberta em 2026 (não lançado) | **AI-native desenhada no core** (precificação, caixa, churn preditivo) 🎯 |
| **Integrações pagamento** | TEF (cartão via Stone, Pagar.me, Multiplus Card, PagoLivre), Boleto | Pagar.me/Stone nativo (ecossistema dono) | **Multi-adquirente neutro** (Stone, Cielo, PagSeguro, SumUp, InfinitePay) 🎯 |
| **LGPD / DPO** | Termos publicados, sem DPO identificado; atraso em entrega de backup (RA) | — | LGPD-first + DPO nomeado + portabilidade self-service 🎯 |

---

## 6. Matriz de Força Financeira e Velocidade

| Dimensão | Belle Software | Trinks | KEYRA |
|---|---|---|---|
| **ARR estimado** | **R$ 4,8M – R$ 11,3M** (2.700 × R$ 150–350) | [INFERÊNCIA] alta — braço Stone, 44–50k estab. R$ 65–300+ ≈ R$ 50–150M ARR SaaS (sem receita Stone) | 0 |
| **Funding** | **Zero VC**, capital social R$ 170k, bootstrap 17 anos, cash-flow positivo | **Adquirida pelo Grupo Stone (2023)** — capital ilimitado via parent | Bootstrap inicial |
| **Headcount** | 11–50 (estimado 30–50), sede Caçador/SC | 51–200 (estimado 150), sede RJ 100% remoto | 1 (Luiz) + squad AI-augmented |
| **Crescimento base 2020→2024** | 1.000 → 2.700 ≈ **CAGR ~28% a.a.** | n/d público | — |
| **Velocidade de release** | **Lenta** — "sem vagas abertas 2026", news de produto rara 2024–2026, Nova UX ainda em lançamento | Média — vaga AI aberta, produto estável | **Alta** (greenfield, Next.js + Supabase, squad AI) 🎯 |
| **Dívida técnica visível** | Alta: UX "anos 90" (RA), bugs pacotes, WhatsApp banindo contas, ausência de API, ausência analytics | Média-alta: Web Forms coexistindo com .NET Core, NFe duplicada, mobile 87MB lento | Zero (dia 1 greenfield) 🎯 |
| **Capacidade de contra-ataque** | **Baixa** — bootstrap, sem munição para scorched-earth, founder academic não hype-driven | **Alta** — Stone pode adquirir/matar concorrente | — |
| **Risco de consolidação (M&A)** | Alvo possível mas pouco atrativo (ARR baixo, interior SC) | — (já adquirida) | Alvo futuro para Stone se ameaçar Trinks |

**Leitura cruzada:** Belle **não tem como reagir rápido** a uma ameaça de produto — é a janela que KEYRA tem. Trinks, via Stone, **pode** reagir mas **escolhe não** (SaaS é isca; revenue real é Stone). **Nenhum dos dois tem incentivo econômico para entrar no financeiro profundo** — território livre.

---

## 7. Reputação Comparada

| Fonte | Belle Software (Geinfo) | Trinks |
|---|---|---|
| **Reclame Aqui** | Não atinge 10 reclamações para calcular nota; temas recorrentes: bugs em pacote/sessão (12 sessões em vez de 10), perda de dados, SAC padronizado, **WhatsApp banido por envio indevido via BelleMessage/Speedchat**, atraso de backup | **8.9/10 "ÓTIMO"**, 97% solucionadas, **Prêmio RA 2024** — temas: agendamento travando, NFe duplicada, multa percebida 80%, app lento, SLA issue abr/2025 |
| **G2** | ❌ não indexado | ⚠️ limitado |
| **Capterra** | ❌ não indexado | ⚠️ limitado |
| **App Store (Apple)** | 2 apps (profissional + cliente), reviews não levantados em detalhe | com.trinks.pro + com.trinks.m, 4.9 App Store |
| **Google Play** | 2 apps, 8.5 MB, versão 2.4.23 (ago/2025) | 100k+ downloads, 4.8 |
| **Selos institucionais** | **GPTW** declarado no site (mas ZoomInfo não confirma); parceiros: TOTVS (ATS cliente, não M&A), Markkit, Agência Follow Me | **GPTW 2023**, **Endeavor Scale-Up**, Prêmio RA 2024 |
| **Mídia/PR** | Terra/Dino (aquisição Gestão SPA 2020), GloboPlay (4 menções), Mundo Marketing, coluna CEO na Revista Negócio Estética | Pequenas Empresas & Grandes Negócios, Estadão, Beauty Fair, ASN Sebrae |
| **Conference / eventos** | **Gestão de Estética Conference** (4ª edição presencial 2025, 23k+ inscritos acum.) | Patrocínio Beauty Fair recorrente |
| **Instagram** | @bellesoftware ~11k seguidores (baixo p/ 2.700 clientes) | @trinksoficial ativo (escala muito maior) |

**Implicação:** Belle tem **moat de autoridade setorial via Conference** mas **reputação pública frágil no RA** — KEYRA pode fazer ABM prospectando reclamantes públicos. Trinks tem **reputação sólida** e é difícil atacar por aí.

---

## 8. Overlap & Diferenciação

### 8.1 Onde Belle e Trinks competem de frente

- **Vertical "clínica de estética"** (persona Jane Trinks vs persona primária Belle) — sobreposição parcial mas não total
- **Agenda + CRM + NFS-e + WhatsApp** — ambos têm, ambos cobram add-on pesado
- **Multi-unidade/franquia** — Belle mais robusta (produto dedicado); Trinks tem multi-unidade nativo
- **Tom de autoridade** — Belle via Conference/PR Thibes; Trinks via Prêmio RA/Stone halo

### 8.2 Onde cada um ganha

**Belle ganha:**
- Clínica de estética **tradicional**, 3–15 profissionais, que valoriza "sistema completo"
- Redes e franquias (Belle Franquias — 60 redes, case Dr. Rey/Hollywood)
- SPAs (marca Gestão SPA adquirida 2020)
- ICP "executivo-setorial" que vai à Conference

**Trinks ganha:**
- Salões + barbearias + studios (amplitude de verticais que Belle ignora)
- Dono/a que já usa Stone (cross-sell natural)
- ICP que prioriza **marketplace** para captar cliente final
- Jovens donos com **Clube de Assinaturas** como motor de receita
- Cliente que quer **API pública** para integrar estoque/ERP próprio

### 8.3 Onde KEYRA pode nascer diferente

Cruzando os dois dossiês, emergem **7 vazios** não ocupados por nenhum:

1. **Financeiro CFO-grade** (DRE + fluxo projetado + margem por procedimento + pró-labore + conciliação Open Finance + SPED)
2. **Precificação estratégica** (BOM editável + markup + custo direto + simulador + margem-alvo) — **gap universal das 18+ players mapeados (16 Trinks + Belle + Clinicorp)**
3. **UX radical** (tela única, números absolutos, zero gráfico — principio UX da idealizadora)
4. **Anti-lock-in** (preço público todas faixas, zero multa, portabilidade 1 clique)
5. **Vertical puro estética** (não dispersar em salão/barbearia/pilates/franquias)
6. **AI-native por design** (não bolt-on como Belle Gestor IA)
7. **Multi-adquirente neutro** (Belle empurra Stone/Pagar.me/Multiplus; Trinks empurra Stone — KEYRA concilia todas sem lock-in)

---

## 9. Análise SWOT por Player

### 9.1 SWOT Belle Software

| Quadrante | Itens |
|---|---|
| **Forças** | 17 anos de mercado · 2.700+ clínicas · vertical profunda estética · Belle Franquias defensável · Conference 23k+ · GPTW · consultoria +Resultados (LTV+) · BSC 4-perspectivas · apps nativos 8.5 MB · IA própria (BelleChat + Gestor IA) · cases heavy (Dr. Rey Hollywood) |
| **Fraquezas** | UX "anos 90" (RA) · bugs core em pacotes/sessões · **WhatsApp banindo clientes** · preço opaco · add-ons empilham (bundle ~R$ 689) · multa fidelidade 50% · SAC padronizado · 7 treinamentos Zoom obrigatórios · zero analytics · sem API pública · instagram subdimensionado (11k) · sem reviews G2/Capterra · CEO-dependência (Thibes) · stack legado [INFERIDO] |
| **Oportunidades** | Mercado de estética crescendo; IA generativa; consolidação (Gestão SPA 2020 pode repetir); exportar Conference para Portugal/LATAM |
| **Ameaças** | **KEYRA greenfield AI-native + simplicidade radical** · Stone pode comprar concorrente vertical · Clinicorp descendo preço · Trinks expandindo para clínica de estética |

### 9.2 SWOT Trinks

| Quadrante | Itens |
|---|---|
| **Forças** | 44–50k estab · Stone ownership (capital + distribuição) · RA 8.9 · marketplace B2C 700k · Google Reserve pioneiro · API pública docs · ecossistema pagamentos · 13 anos · Endeavor Scale-Up |
| **Fraquezas** | Multa 50% (percebida 80%) · app mobile 87MB lento · NFe duplicada · Web Forms legado · **financeiro raso** (sem OFX, sem BOM, sem margem, sem precificação) · preço opaco 3+ pros · trial 5 dias (curto) · SLA issue abr/2025 |
| **Oportunidades** | Vaga AI Tech Lead 2026 aberta · expansão internacional Stone · clube assinaturas · vertical estética pura (pode atacar Belle) |
| **Ameaças** | KEYRA · IA comoditizando features · dependência Stone (se pivotar a estratégia) |

### 9.3 SWOT KEYRA (meta)

| Quadrante | Itens |
|---|---|
| **Forças** | Greenfield zero-débito · AI-native dia 1 · UX tela única validada pela idealizadora · financeiro profundo como core · anti-lock-in por design · founder-led content (Luiz @luizhenriquexpro) · pt-BR afetivo · Next.js + Supabase · RLS nativo |
| **Fraquezas** | Zero base instalada · zero marca · zero Conference/evento · founder time pequeno · sem ecossistema pagamentos próprio · risco de spread (escopo grande) |
| **Oportunidades** | **7 vazios competitivos não ocupados** · reclamantes RA Belle/Trinks (ABM) · SEO sniper ("belle alternativa", "trinks alternativa") · migração facilitada via API Trinks · comunidade contínua vs Conference anual · brand visual estética (nude/dourado vs azul Belle/laranja Trinks) |
| **Ameaças** | Trinks/Stone atacar após tração · Belle copiar financeiro profundo (baixo — stack legado impede velocidade) · Clinicorp descer preço · Omie lançar vertical estética |

---

## 10. Ranking por Dimensão (1–10)

Notas comparativas nas 12 dimensões-foco KEYRA. Belle e Trinks com base em evidências; KEYRA meta a atingir em 12–18m.

| # | Dimensão | Belle | Trinks | KEYRA (meta) |
|---|---|---|---|---|
| 1 | **Profundidade em estética clínica** | **9** | 6 | **9** |
| 2 | **Amplitude funcional (# módulos)** | 9 | **9** | 6 (deliberado) |
| 3 | **Qualidade UX / simplicidade** | 3 | 5 | **10** 🎯 |
| 4 | **Financeiro profundo (DRE + fluxo + margem)** | 3 | 3 | **10** 🎯 |
| 5 | **Precificação estratégica (BOM + markup)** | 1 | 1 | **10** 🎯 |
| 6 | **Metas / gamificação em tempo real** | 6 | 4 | **9** 🎯 |
| 7 | **IA nativa (não bolt-on)** | 5 | 3 | **9** 🎯 |
| 8 | **Mobile experience** | 7 (nativo leve) | 4 (híbrido pesado) | **9** |
| 9 | **API pública + integrações** | 2 | **8** | **9** 🎯 |
| 10 | **Transparência preço / anti-lock-in** | 2 | 3 | **10** 🎯 |
| 11 | **Reputação pública / social proof** | 5 | **9** (RA 8.9, Prêmio) | 2 (a construir) |
| 12 | **Capital / velocidade de release** | 3 (bootstrap lento) | **8** (Stone) | 6 (greenfield rápido mas capital limitado) |
| | **Soma ponderada (foco KEYRA)** | 55 | 63 | **99** |

**Leitura:** Trinks lidera hoje no agregado, mas **nos 7 eixos onde KEYRA mira (3,4,5,6,7,9,10) a liderança é de KEYRA** — por design, não por evolução incremental.

---

## 11. Implicações Estratégicas para KEYRA

1. **Criar categoria nova em vez de competir em feature-a-feature.** Belle é "completude/autoridade"; Trinks é "motivacional/escala". KEYRA = **"CFO técnico vertical estética"** — *"Menos gráfico. Mais lucro."* (síntese de `brand-and-positioning.md §Resumo` + Trinks Bet 1). Tagline evita ambos os arquétipos existentes.

2. **Wedge de entrada = financeiro profundo + precificação estratégica**, não agenda. Agenda é commodity paridade; financeiro é vazio universal dos 18+ players (ver `product-features.md §10.3` + Trinks F3.3). **Esta é a "feature-âncora natural da KEYRA"** (Trinks Bet 1).

3. **Atacar o ICP que nenhum dos dois atende: Ana, dona solo ou 1–3 profissionais, que quer saber "quanto sobra" no mês.** Belle mira 3–15 pros + redes; Trinks mira 1–10 salão/barbearia. Ana é **território 100% livre** (Trinks F6.5).

4. **Transparência radical como arma de marca.** Preço público todas faixas, zero fidelidade, zero multa, portabilidade 1 clique, status page, DPO nomeado. **Matar o maior medo da compradora simultaneamente em Belle (multa 50% + preço opaco) e Trinks (multa 80% percebida)** — `pricing-and-funnel.md §10.1` + Trinks F4.6.

5. **Unificar os 2 apps em 1 PWA + RN único** (<10 MB). Belle tem 2 apps nativos 8.5MB cada; Trinks tem 2 apps híbridos 87MB cada. KEYRA com 1 app unificado (feature flag profissional/cliente) reduz 50% do custo de manutenção e gera brand moment "gestão completa sem baixar 3 apps" (`brand-and-positioning.md §12.12`).

6. **WhatsApp Cloud API Meta incluso no plano base** — ataca simultaneamente o add-on caro Belle (R$ 229) e o add-on Trinks, e elimina risco de ban (caso grave Belle Speedchat). `company-intel.md §7` + `tech-stack.md §9`.

7. **Comunidade contínua vs Conference anual.** Belle concentra comunidade 1×/ano em Caçador/SC. KEYRA ganha com **WhatsApp curado + masterclass mensal + peer-learning contínuo** (`brand-and-positioning.md §12.7`). Custo baixo, defensibilidade alta, alinhado ao founder-led content do Luiz.

---

## Fontes

### Belle Software (dossiês internos)
- [`01-scope/SCOPE.md`](../01-scope/SCOPE.md)
- [`02-data-collection/site-map.md`](../02-data-collection/site-map.md)
- [`02-data-collection/product-features.md`](../02-data-collection/product-features.md)
- [`02-data-collection/pricing-and-funnel.md`](../02-data-collection/pricing-and-funnel.md)
- [`02-data-collection/brand-and-positioning.md`](../02-data-collection/brand-and-positioning.md)
- [`02-data-collection/tech-stack.md`](../02-data-collection/tech-stack.md)
- [`02-data-collection/company-intel.md`](../02-data-collection/company-intel.md)

### Trinks (pesquisa correlata)
- [`trinks-analysis-2026-04-16/04-synthesis/EXECUTIVE-SUMMARY.md`](../../trinks-analysis-2026-04-16/04-synthesis/EXECUTIVE-SUMMARY.md)
- [`trinks-analysis-2026-04-16/04-synthesis/FINDINGS-MATRIX.md`](../../trinks-analysis-2026-04-16/04-synthesis/FINDINGS-MATRIX.md)

### KEYRA (princípios)
- MEMORY.md: *Princípios UX da idealizadora* (números absolutos, sem gráficos, tela única, simplicidade)
- MEMORY.md: *Acentuação pt-BR inegociável*
