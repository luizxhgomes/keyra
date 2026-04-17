# Trinks — Executive Summary

**Data:** 2026-04-16
**Coordenador:** Research Lead (Deep Research Squad)
**Cliente:** KEYRA (SaaS financeiro para clínicas de estética)
**Modo:** Strategic Research Full (benchmark + positioning + sales + reverse-engineering + strategies)

> **Para quem tem 10 minutos.** Este é o destilado de 6 frentes paralelas de investigação: site map completo, reverse engineering técnico, análise competitiva (16 players), deep-dive de pricing/GTM, positioning/narrativa e features por dor-KEYRA.

---

## 1. O que é o Trinks, em 1 parágrafo

Trinks é o **SaaS vertical de gestão para beleza/estética de maior escala no Brasil**: 44-50 mil estabelecimentos, 80M+ agendamentos/ano, 13 anos de mercado, Reclame Aqui 8.9/10, **adquirido pelo Grupo Stone em 2023** (parceria iniciada em 2017). Atende 5 verticais (salões, barbearias, clínicas de estética, studios, redes) com o mesmo core de produto, pricing a partir de R$ 76/mês (1-2 profissionais). Hoje opera como **braço vertical beleza da Stone**: o SaaS é quase-isca, a monetização real vem do ecossistema de pagamentos (Belezinha, Pagar.me, Conta Digital, Pix, crédito).

---

## 2. Stack técnico (reverse engineered)

- **Backend:** ASP.NET C# (Core + MVC + **Web Forms** em partes legadas)
- **DB:** SQL Server (inferência forte; EF/EF Core)
- **Frontend web:** Angular/React SPA no produto; marketplace SSR em .NET; institucional em **WordPress separado**
- **Mobile:** Apps híbridos (Ionic/WebView) — 80-87MB, 100K+ downloads
- **Cloud:** AWS (CloudFront + SNS para webhooks)
- **API pública:** REST `/v1/`, X-Api-Key, paginação 50 items/page, docs em trinks.readme.io
- **15 módulos funcionais** + **130+ relatórios**
- **Dívida técnica visível:** Web Forms coexistindo com .NET Core; NFe com bugs de duplicação; mobile pesado reportado como lento

---

## 3. O que o Trinks faz muito bem

1. **Amplitude funcional** — 15 módulos cobrindo todo o ciclo operacional
2. **Ecossistema Stone** — integração profunda com adquirência/conta digital/crédito
3. **Marketplace B2C reverso** — 700k consumidores geram leads para os salões
4. **Google Reserve** pioneiro no Brasil
5. **Reputação sólida** — RA 8.9, Prêmio RA 2024, GPTW
6. **Social proof em escala** — +44k negócios, +80M agendamentos em 2024
7. **Clube de Assinaturas** como diferencial monetizador (case Nine Barbearia triplicou faturamento)

---

## 4. Onde o Trinks é fraco — territórios abertos para KEYRA

### 🔴 Gap universal #1 — Precificação estratégica
**Trinks não tem módulo de precificação.** Campo `preco` é flat no cadastro do serviço. Nenhum concorrente entre os 16 mapeados tem calculadora de markup + custo direto + margem-alvo + simulador. **Gap universal do mercado.**

### 🔴 Gap universal #2 — Financeiro inteligente
DRE do Trinks é **relatório clássico** (não CFO insight). Falta:
- Conciliação de maquininha/adquirente
- Conciliação bancária via Open Finance
- Pagamento de fornecedor no app (bloqueado oficialmente)
- Pró-labore / separação PF-PJ
- Margem por procedimento / ABC costing

### 🔴 Gap universal #3 — Metas
Comissão é **batch mensal** com ranking estático e bonificação simples. Sem escalonamento progressivo, sem push em tempo real, sem gamificação moderna.

### 🔴 Gap universal #4 — BOM editável (ficha técnica real)
O que Trinks chama "ficha técnica" é **log de uso**, não receita configurável. Não há insumos por procedimento definidos, sem lote/validade (crítico para Anvisa), sem custo médio ponderado.

### 🔴 Gap universal #5 — UX "tela única, números absolutos"
Trinks tem 130+ relatórios com gráficos. **Conflita diretamente** com o princípio radical de UX da idealizadora do KEYRA: tela única, números absolutos, zero gráfico.

---

## 5. Pricing & lock-in do Trinks

| Faixa profissionais | Mensal | Anual (equiv) |
|---------------------|--------|---------------|
| 1-2 | R$ 76 | R$ 65 |
| 3+ | **Opaco — "sob consulta"** | Opaco |

**Add-ons pagos:** WhatsApp, NFe, fidelidade, app exclusivo, autoatendimento, Clube de Assinaturas.
**Trial:** 5 dias (curto — concorrentes dão 30-35).
**Multa de cancelamento:** 50% das parcelas restantes (percebida como 80% por clientes em Reclame Aqui).
**Contratos:** Mensal / semestral / anual com fidelidade.

---

## 6. Posicionamento percebido

> Trinks = **"Parceira motivacional"** para fazer a correria da rotina virar controle.
> Tom informal, amigável, acolhedor. Laranja. "Bora dar um up".

**Personas-alvo implícitas:**
1. Renata — dona de salão 5-15 anos, 3-10 profissionais (principal)
2. Rodrigo — dono de barbearia moderna com Clube de Assinaturas
3. Jane — dona de clínica de estética (secundária)

**Persona ausente:** **Ana — gestora financeira de clínica crescendo que quer saber quanto sobra.** Território 100% livre para KEYRA.

---

## 7. Os 16 concorrentes, em 1 tabela

| Categoria | Players |
|-----------|---------|
| **Direto beleza** | Trinks, AgendaPro, Belasis, AppBeleza/Barber, BestBarbers, Booksy, Prit, Beleza Marcada, Simples Agenda |
| **Clínicos adaptados** | Clinicorp, Feegow, iClinic, Amplimed, Doctoralia Pro |
| **ERPs genéricos** | Omie, ContaAzul, Bling |

**Pricing range:** R$ 29 (AgendaPro) → R$ 299+ (BestBarbers App Exclusivo).
**Líder em escala:** Trinks (44-50k).
**Líder premium estética:** Clinicorp (Face DS + IA + R$ 149+).
**Líder horizontal ERP:** Omie (85k clientes).

---

## 8. Big Bets Estratégicas para KEYRA

### 🎯 Bet 1 — "CFO para estética" (categoria vaga)
Ocupar narrativa de **CFO técnico vs. parceira motivacional** do Trinks.
**Tagline candidata:** *"Menos gráfico. Mais lucro."* ou *"Você trabalha. A KEYRA mostra o que sobra."*

### 🎯 Bet 2 — "Sobrar mais, não faturar mais"
Frame psicológico oposto: Trinks vende mais clientes; KEYRA vende mais margem.

### 🎯 Bet 3 — Vertical pura estética (profundidade > amplitude)
Abdicar dos 4 outros segmentos do Trinks → ir fundo em anamnese + pacotes com margem + ficha técnica BOM + lote/validade Anvisa.

### 🎯 Bet 4 — Tela única com 5 números
Dashboard "Hoje" com apenas: Caixa do dia · Faturamento vs Meta · Produtos acabando · Próximos compromissos · Margem do mês.

### 🎯 Bet 5 — Multi-adquirente, sem lock-in
Neutro sobre maquininha. Conciliação automática de Stone/Cielo/PagSeguro/SumUp/InfinitePay como feature-âncora.

### 🎯 Bet 6 — Anti-lock-in radical
Sem multa de fidelidade. Pricing público em todas as faixas. Exportação de dados em 1 clique. Contrato em linguagem clara. Virar anti-Trinks como argumento de marca.

### 🎯 Bet 7 — Stack moderna greenfield
Next.js 16 + Supabase (RLS nativo) + Mobile PWA <10MB. Zero dívida técnica de dia 1.

### 🎯 Bet 8 — Integração com Trinks via API (coopetição)
Usar `trinks.readme.io` (`GET /v1/clientes`, `GET /v1/servicos`) para construir **importador automático Trinks→KEYRA** — caça aos insatisfeitos via reviews de RA e App Store.

---

## 9. Riscos principais

| # | Risco | Probabilidade | Mitigação |
|---|-------|---------------|-----------|
| 1 | Trinks lançar módulo de precificação em 6-12 meses | Média | Ocupar narrativa + conteúdo SEO antes de eles fazerem |
| 2 | Clinicorp descer de preço e atacar mid-market | Média | Manter profundidade vertical em estoque BOM + financeiro CFO |
| 3 | Stone adquirir concorrente (ou KEYRA) | Baixa-média | Construir comunidade + afiliação (reduz risco de churn pós-hipótese) |
| 4 | IA generativa comoditizar features | Alta | KEYRA adotar IA no diferencial: *"insights financeiros"* (*"você perde R$ 800 em limpeza de pele"*) |
| 5 | Omie lançar vertical estética completa | Média | Marca + comunidade + onboarding vertical impossível de replicar rápido |

---

## 10. Checklist de qualidade desta pesquisa

| Critério | Meta | Real |
|----------|------|------|
| URLs/fontes consultadas | ≥50 | ~80+ |
| Dimensões cobertas (das 10) | 10 | 10 ✅ |
| Questões primárias respondidas | 6 | 6 ✅ |
| Concorrentes mapeados | ≥12 | **16** ✅ |
| Camadas do blueprint técnico | ≥7 | **14** ✅ |
| Oportunidades KEYRA | ≥15 | **30+** (ver KEYRA-OPPORTUNITIES.md) |
| Páginas do site Trinks mapeadas | ≥15 | **18** ✅ |

---

## 11. O que ler a seguir

- **[KEYRA-OPPORTUNITIES.md](./KEYRA-OPPORTUNITIES.md)** — 30+ plays acionáveis priorizadas
- **[FINDINGS-MATRIX.md](./FINDINGS-MATRIX.md)** — todos os findings com fontes
- **[../03-analysis/reverse-engineering-blueprint.md](../03-analysis/reverse-engineering-blueprint.md)** — blueprint técnico completo
- **[../03-analysis/benchmark-report.md](../03-analysis/benchmark-report.md)** — análise competitiva detalhada
- **[../03-analysis/positioning-analysis.md](../03-analysis/positioning-analysis.md)** — narrativa e brand
- **[../03-analysis/sales-strategy-analysis.md](../03-analysis/sales-strategy-analysis.md)** — funil, pricing, lock-in
- **[../03-analysis/strategy-catalog.md](../03-analysis/strategy-catalog.md)** — REPLICAR/ADAPTAR/EVITAR catalogado

---

## 12. Síntese em 3 frases

1. **Trinks é um incumbente sólido e amplo**, mas raso em inteligência financeira — que é exatamente o core que a KEYRA se propõe a dominar.
2. **O maior gap universal do mercado é precificação estratégica** (nenhum dos 16 concorrentes tem) — e é a feature-âncora natural da KEYRA.
3. **A defesa da KEYRA é profundidade vertical**, não amplitude horizontal: foco radical em clínica de estética, UX de tela única e narrativa "CFO técnico, não parceira motivacional".
