# Strategic Research — Trinks (Clínicas de Estética)

**Data:** 2026-04-16
**Coordenador:** Research Lead (Deep Research Squad)
**Modo:** Full Strategic (benchmark + strategies + sales + positioning + reverse-engineering)
**URL-alvo:** https://negocios.trinks.com/negocios/clinicas-de-estetica/
**Contexto:** Mapeamento competitivo para o projeto KEYRA (SaaS financeiro para estética)

---

## 1. Objetivo Primário

Extrair **toda a estrutura** do sistema Trinks — produto, arquitetura, modelo de negócio, narrativa e go-to-market — com profundidade suficiente para:

1. Identificar **gaps estratégicos** que o KEYRA pode ocupar
2. Mapear **padrões vencedores** que devem ser replicados
3. Reconstruir o **blueprint funcional e técnico** como se fôssemos refazê-lo
4. Gerar **matriz de oportunidades** direta para roadmap KEYRA

---

## 2. Dimensões de Análise

| # | Dimensão | Pergunta-chave |
|---|----------|----------------|
| 1 | **Produto & Features** | O que o Trinks faz, como faz, quais módulos tem? |
| 2 | **Modelo de Negócio** | Como monetiza, qual pricing, quais tiers? |
| 3 | **Arquitetura Técnica** | Stack presumida, app mobile, integrações, APIs |
| 4 | **UX & Design System** | Fluxos, telas, padrões, identidade visual |
| 5 | **Positioning & Narrativa** | Como se vende, tom de voz, promessa central |
| 6 | **Content Strategy & SEO** | Blog, keywords, autoridade, conteúdo |
| 7 | **Sales & GTM** | Funil, canais de aquisição, parceiros, cases |
| 8 | **Concorrência** | Quem mais brinca no mesmo playground |
| 9 | **Financeiro/Estoque/Metas** | Como tratam o domínio financeiro (core KEYRA) |
| 10 | **Operações & Suporte** | Onboarding, treinamento, suporte, comunidade |

---

## 3. Questões de Pesquisa

### Primárias (MUST answer)

- **P1:** Qual é a estrutura completa de módulos e features do Trinks para clínicas de estética?
- **P2:** Como o Trinks trata as 5 dores centrais do KEYRA (agenda, financeiro, precificação, estoque, metas)?
- **P3:** Qual o modelo de pricing, tiers e proposta de valor por segmento?
- **P4:** Qual stack técnica presumida, e como a arquitetura suporta multi-tenant + mobile?
- **P5:** Como o Trinks se posiciona vs concorrentes (Belezze, Beleza.app, Agendor, Feegow, etc)?
- **P6:** Qual o funil de aquisição e conversão (SEO, ads, parcerias, indicações)?

### Secundárias (SHOULD answer)

- **S1:** Qual a história/evolução do Trinks (quando fundou, captação, volume)?
- **S2:** Como é o app mobile (iOS/Android) — features, avaliações, UX?
- **S3:** Quais integrações oficiais existem (WhatsApp, pagamentos, marketplaces)?
- **S4:** Qual a taxonomia de features premium vs básicas?
- **S5:** Como tratam compliance (LGPD, dados de saúde, prontuário)?
- **S6:** Qual o NPS/reputação (Reclame Aqui, G2, B2B Stack)?

### Terciárias (NICE to have)

- **T1:** Padrões de UI/UX replicáveis
- **T2:** Estratégia de conteúdo do blog e YouTube
- **T3:** Comunidades e eventos
- **T4:** Parcerias estratégicas

---

## 4. Output Esperado

```
docs/research/trinks-analysis-2026-04-16/
├── 01-scope/SCOPE.md                          (este arquivo)
├── 02-data-collection/
│   ├── site-map.md                            (todas URLs + conteúdo)
│   ├── features-catalog.md                    (catálogo de features)
│   ├── pricing-snapshot.md                    (planos e preços)
│   ├── competitors-matrix.md                  (concorrentes)
│   ├── reviews-reputation.md                  (NPS, reviews)
│   └── technical-footprint.md                 (stack presumida)
├── 03-analysis/
│   ├── benchmark-report.md                    (*benchmark)
│   ├── positioning-analysis.md                (*positioning)
│   ├── sales-strategy-analysis.md             (*sales-strategy)
│   ├── reverse-engineering-blueprint.md       (*reverse-engineer)
│   └── strategy-catalog.md                    (*strategies)
└── 04-synthesis/
    ├── EXECUTIVE-SUMMARY.md                   (report final 1-page)
    ├── FINDINGS-MATRIX.md                     (findings + sources)
    ├── KEYRA-OPPORTUNITIES.md                 (gaps + plays para KEYRA)
    └── INDEX.md                               (entrypoint navegável)
```

---

## 5. Metodologia

1. **Coleta paralela** — 6 frentes de investigação simultâneas via subagents
2. **Source triangulation** — toda afirmação deve ter ≥2 fontes
3. **No invention** — onde inferência for feita, marcar explicitamente como `[INFERÊNCIA]`
4. **Evidence-based** — screenshots, citações diretas, URLs
5. **KEYRA-centric synthesis** — todo finding deve ter coluna "implicação para KEYRA"

---

## 6. Critérios de Qualidade (QA Gate)

- [ ] ≥50 URLs/fontes consultadas
- [ ] Todas 10 dimensões cobertas
- [ ] Todas 6 questões primárias respondidas
- [ ] Blueprint técnico com ≥7 camadas mapeadas
- [ ] Matriz competitiva com ≥5 players
- [ ] ≥15 oportunidades-ação para KEYRA
- [ ] Executive summary em ≤2 páginas
- [ ] Index navegável com hyperlinks
