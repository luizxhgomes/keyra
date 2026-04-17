# Strategic Research — Belle Software (Clínicas de Estética)

**Data:** 2026-04-16
**Coordenador:** Research Lead (Deep Research Squad)
**Modo:** Full Strategic 360° (benchmark + strategies + sales + positioning + reverse-engineering + tech-stack + company-intel)
**URL-alvo:** https://www.bellesoftware.com.br/
**Contexto:** Mapeamento competitivo para o projeto KEYRA (SaaS financeiro para estética)
**Pesquisa correlata:** [Trinks Analysis 2026-04-16](../../trinks-analysis-2026-04-16/) — concorrente incumbente Stone

---

## 1. Por que Belle Software

Belle Software é o **segundo player** identificado na análise competitiva de KEYRA (primeiro: Trinks). Dados observados na pré-inspeção:

- **2.500+ clientes ativos** (auto-declarado no site)
- **Stack full-suite**: agenda, financeiro, CRM, BI, Metas/BSC, IA, Apps mobile (cliente + clínica), WhatsApp (BelleMessage), automação de marketing, assinatura eletrônica
- **Fortes cases** (Buddha Spa, Dr. Rey/Hollywood, Dom Vitale, Vitaclin)
- **Presença em mídia** (Terra, GloboPlay, Mundo do Marketing)
- **GPTW certificada**
- **Possível relação com TOTVS / Geinffo** (vagas hospedadas em `atracaodetalentos.totvs.app/vagasgeinffo`)
- **7 verticais** atendidas (estética, micropigmentação, pilates/yoga, salão, medicina estética, harmonização facial, laser)
- **Modelo de franquias** (Belle Software para franquias)
- **Programa "+Resultados"** (consultoria/upsell)

Hipótese inicial: **Belle é um concorrente mais maduro, mais robusto e mais enraizado no segmento "clínica de estética profissional"** do que o Trinks (que é mais transversal / beleza + estética + salão). Entender profundamente como foi construído é essencial para posicionar o KEYRA.

---

## 2. Objetivo Primário

Extrair **toda a estrutura** do sistema Belle Software — produto, arquitetura, modelo de negócio, narrativa, GTM, empresa, reputação — com profundidade suficiente para:

1. Identificar **gaps estratégicos** que o KEYRA pode ocupar
2. Mapear **padrões vencedores** que devem ser replicados
3. Reconstruir o **blueprint funcional e técnico** como se fôssemos refazê-lo
4. Decifrar a **relação com TOTVS/Geinffo** (M&A? parceria? sinergia comercial?)
5. Gerar **matriz de oportunidades** direta para roadmap KEYRA
6. Comparar **Belle vs Trinks** — entender as duas forças do mercado

---

## 3. Dimensões de Análise (360°)

| # | Dimensão | Pergunta-chave |
|---|----------|----------------|
| 1 | **Produto & Features** | Quais módulos existem, como se integram, o que é core vs periférico? |
| 2 | **Modelo de Negócio** | Como monetiza (SaaS puro, franquias, consultoria +Resultados)? |
| 3 | **Arquitetura Técnica** | WordPress no site, mas qual stack no app SaaS? Mobile nativo ou híbrido? |
| 4 | **UX & Design System** | "Nova UX" lançada — que padrões emergem? |
| 5 | **Positioning & Narrativa** | Como se vende? Qual a promessa? Qual ICP? |
| 6 | **Content Strategy & SEO** | Blog `gestaodeestetica.com` + blog interno + ebooks + YouTube |
| 7 | **Sales & GTM** | Funil, trials, LPs múltiplas, Meta Ads (há LP específica), eventos, feiras |
| 8 | **Empresa & Liderança** | CNPJ, founders, equipe, sede, história, **relação com TOTVS/Geinffo** |
| 9 | **Reputação** | Reclame Aqui, reviews, NPS, mídia |
| 10 | **Integrações & Ecossistema** | Stone, Pagar.me, PagoLivre, Multiplus, NFS-e, WhatsApp |
| 11 | **Verticais & Segmentação** | 7 verticais → como diferenciam, mesma base ou produtos distintos? |
| 12 | **Financeiro/Estoque/Metas** (core KEYRA) | Como tratam os módulos que são o core do KEYRA? |

---

## 4. Questões de Pesquisa

### Primárias (MUST answer)

- **P1:** Qual é o catálogo completo de módulos e features do Belle Software?
- **P2:** Como o Belle trata as 5 dores centrais do KEYRA (agenda, financeiro, precificação, estoque, metas)?
- **P3:** Qual o modelo de pricing, tiers e proposta de valor por vertical?
- **P4:** Qual a stack técnica presumida do SaaS `app.bellesoftware.com.br`?
- **P5:** Qual a relação real entre Belle Software, Geinffo e TOTVS?
- **P6:** Qual o funil de aquisição e conversão (SEO, Meta Ads, feiras, parcerias)?
- **P7:** Como o programa +Resultados funciona como upsell / consultoria?
- **P8:** Como o modelo de franquias funciona (franqueado vende Belle Software)?

### Secundárias (SHOULD answer)

- **S1:** Qual a história/evolução do Belle (fundação, marcos, pivôs)?
- **S2:** Como são os apps mobile (iOS/Android) — features, avaliações, UX?
- **S3:** Quais integrações oficiais existem (pagamentos, WhatsApp, marketplaces)?
- **S4:** Como se comparam a Trinks (concorrência direta)?
- **S5:** Como tratam compliance (LGPD, dados de saúde, prontuário)?
- **S6:** Qual a reputação real (Reclame Aqui, reviews)?
- **S7:** Qual a estratégia de IA (BelleChat + Gestor IA)?

### Terciárias (NICE to have)

- **T1:** Padrões de UI/UX replicáveis (via "Nova UX")
- **T2:** Estratégia de conteúdo do blog gestaodeestetica.com
- **T3:** Eventos e feiras (Estetika, Estética in SP/Sul, Beauty Summit, Confidefe)
- **T4:** Parcerias estratégicas (Markkit, Agência FollowMe)

---

## 5. Output Esperado

```
docs/research/belle-software-2026-04-16/
├── 01-scope/SCOPE.md                              (este arquivo)
├── 01-site-map/sitemap.json                       (firecrawl-map — 60 URLs)
├── 02-data-collection/
│   ├── site-map.md                                (todas URLs categorizadas)
│   ├── product-features.md                        (catálogo de features)
│   ├── pricing-and-funnel.md                      (planos, preços, funil)
│   ├── brand-and-positioning.md                   (narrativa, copy, conteúdo)
│   ├── tech-stack.md                              (stack presumida, hosting)
│   └── company-intel.md                           (empresa, founders, TOTVS)
├── 03-analysis/
│   ├── benchmark-report.md                        (Belle vs Trinks vs KEYRA)
│   ├── positioning-analysis.md                    (posicionamento)
│   ├── sales-strategy-analysis.md                 (funil + GTM)
│   ├── reverse-engineering-blueprint.md           (como foi construído)
│   └── strategy-catalog.md                        (frameworks observados)
└── 04-synthesis/
    ├── EXECUTIVE-SUMMARY.md                       (report final executivo)
    ├── FINDINGS-MATRIX.md                         (findings + fontes)
    ├── KEYRA-OPPORTUNITIES.md                     (gaps + plays)
    └── INDEX.md                                   (entrypoint navegável)
```

---

## 6. Metodologia

1. **Coleta paralela** — 5 frentes de investigação simultâneas via subagents em background
2. **Source triangulation** — toda afirmação relevante deve ter ≥2 fontes
3. **No invention** — onde inferência for feita, marcar como `[INFERÊNCIA]`
4. **Evidence-based** — citações diretas, URLs, observações técnicas
5. **KEYRA-centric synthesis** — todo finding deve ter coluna "implicação para KEYRA"
6. **Comparative lens** — onde possível, comparar com Trinks (pesquisa correlata)

---

## 7. Critérios de Qualidade (QA Gate)

- [ ] ≥50 URLs/fontes consultadas (sitemap já trouxe 60)
- [ ] Todas 12 dimensões cobertas
- [ ] Todas 8 questões primárias respondidas
- [ ] Blueprint técnico com ≥7 camadas mapeadas
- [ ] Relação TOTVS/Geinffo esclarecida
- [ ] Programa +Resultados + Franquias detalhados
- [ ] ≥15 oportunidades-ação para KEYRA
- [ ] Comparação direta Belle vs Trinks
- [ ] Executive summary em ≤3 páginas
- [ ] Index navegável com hyperlinks

---

## 8. Agentes Disparados (paralelo)

| # | Agente | Foco | Output |
|---|--------|------|--------|
| A | Product & Features | Catálogo completo, módulos, IA, apps | `02-data-collection/product-features.md` |
| B | Pricing & Sales Funnel | Planos, preços, trial, LPs, funil | `02-data-collection/pricing-and-funnel.md` |
| C | Brand & Positioning | Narrativa, blog, YouTube, tom | `02-data-collection/brand-and-positioning.md` |
| D | Tech Stack & Infra | WordPress, app SaaS, mobile, CDN, analytics | `02-data-collection/tech-stack.md` |
| E | Company Intel & Reputation | Empresa, founders, TOTVS, RA, reviews | `02-data-collection/company-intel.md` |
| F (síntese) | Reverse Engineering + Benchmark + Synthesis | Consolidação final | `03-analysis/*` + `04-synthesis/*` |

---

*Research Lead — Deep Research Squad v1.0.0*
