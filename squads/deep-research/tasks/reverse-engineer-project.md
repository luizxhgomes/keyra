---
task: Reverse Engineer Project
responsavel: strategy-analyst
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: target
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Project, product or company to reverse-engineer

  - campo: focus
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "concept | architecture | strategy | execution | full (default: full)"

  - campo: depth
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "quick | standard | deep (default: standard)"

Saida:
  - campo: reverse_engineering_report
    tipo: object
    destino: benchmarking/reverse-engineering/{YYYY-MM-DD}-{target-slug}-report.md
    persistido: true

  - campo: reconstructed_blueprint
    tipo: object
    destino: benchmarking/reverse-engineering/{YYYY-MM-DD}-{target-slug}-blueprint.yaml
    persistido: true
---

# Reverse Engineer Project

Decompose como um projeto, produto ou empresa foi concebido, estruturado e executado — reconstruindo o blueprint de decisoes.

## Filosofia

> "Se eu consigo reconstruir o 'porquê' de cada decisão, posso adaptar o 'como' ao meu contexto."

Nao copiamos — entendemos a logica e recriamos com inteligencia.

## Layers de Analise

### L1: Concepcao (Why)
- **Origem** — Como a ideia surgiu (problema pessoal, gap de mercado, pivot)
- **Thesis** — Hipotese central do projeto
- **Timing** — Por que agora? (market window, technology shift, regulation)
- **Founder-Market Fit** — Relacao do fundador/criador com o dominio

### L2: Design (What)
- **Scope** — O que esta IN e OUT do produto/projeto
- **Core Loop** — Loop central de valor (input → process → output → feedback)
- **User Journey** — Caminho critico do usuario
- **Business Model** — Como gera valor e captura receita
- **Key Metrics** — North Star Metric e metricas de suporte

### L3: Arquitetura (How — Structure)
- **Technology Choices** — Stack, ferramentas, plataformas
- **Information Architecture** — Estrutura de conteudo/dados
- **Team Structure** — Como o time e organizado
- **Process** — Metodologia de desenvolvimento/execucao

### L4: Execucao (How — Action)
- **Launch Strategy** — Como foi lancado (waitlist, beta, ProductHunt, etc.)
- **Growth Sequence** — Sequencia de movimentos de crescimento
- **Iteration Cadence** — Frequencia de releases/updates
- **Pivots** — Mudancas de direcao e motivacoes
- **Milestones** — Marcos chave e timeline

### L5: Resultados (So What)
- **Traction** — Metricas de crescimento observaveis
- **Market Response** — Recepcao do mercado (reviews, press, community)
- **Competitive Impact** — Como afetou o mercado e competidores
- **Lessons** — Licoes extraiveis (declaradas ou inferidas)

## Steps

1. **Identify Target** — Confirmar projeto e definir profundidade
2. **Scan Public History** — Buscar timeline: lancamento, updates, pivots, marcos
3. **Reconstruct Thesis** — Inferir hipotese original e motivacao
4. **Map Design Decisions** — Identificar decisoes de escopo, modelo e metricas
5. **Analyze Architecture** — Decompor stack, estrutura e processos
6. **Trace Execution** — Reconstruir sequencia de acoes e growth moves
7. **Assess Results** — Avaliar traction e market response
8. **Build Blueprint** — Compilar blueprint reconstruido

## Evidence Sources

| Source | Layer | What to Extract |
|--------|-------|-----------------|
| Founder interviews (podcasts, YouTube) | L1, L4 | Origin story, thesis, pivots, lessons |
| Blog/Changelog | L3, L4 | Architecture decisions, iteration cadence |
| ProductHunt/HackerNews launches | L4 | Launch strategy, market response |
| Wayback Machine (web.archive.org) | L2, L4 | Evolution of positioning, features, pricing |
| GitHub (if open source) | L3 | Technology choices, team structure, process |
| Crunchbase/LinkedIn | L1, L3 | Founder background, team growth, funding |
| Job postings | L3 | Tech stack, team structure, priorities |
| Reviews (G2, Capterra, App Store) | L5 | User perception, strengths, weaknesses |

## Output: Reconstructed Blueprint

```yaml
reconstructed_blueprint:
  target: "{project/product}"
  confidence: high | medium | low

  L1_conception:
    origin_type: "personal-problem | market-gap | pivot | academic | other"
    thesis: "Core hypothesis in one sentence"
    timing_factors: ["Factor 1", "Factor 2"]
    founder_market_fit: "strong | moderate | weak"
    evidence: ["Source 1"]

  L2_design:
    scope:
      in: ["Feature/capability 1", "Feature 2"]
      out: ["Explicitly excluded 1"]
    core_loop: "Input → Process → Output → Feedback"
    business_model: "Model description"
    north_star_metric: "Metric (estimated)"
    evidence: ["Source 1"]

  L3_architecture:
    tech_stack:
      frontend: "Technology"
      backend: "Technology"
      infrastructure: "Platform"
    team_model: "Description"
    methodology: "Agile | Lean | etc."
    evidence: ["Source 1"]

  L4_execution:
    launch:
      strategy: "Description"
      date: "YYYY-MM"
      channels: ["Channel 1"]
    growth_sequence:
      - move: "Growth move 1"
        period: "YYYY-MM"
        result: "Observed outcome"
    pivots:
      - from: "Original direction"
        to: "New direction"
        reason: "Why (inferred)"
    evidence: ["Source 1"]

  L5_results:
    traction:
      users: "Estimated"
      revenue: "Estimated"
      growth_rate: "Estimated"
    market_response: "Description"
    lessons:
      - lesson: "Key lesson"
        applicability: "When this applies to other projects"
    evidence: ["Source 1"]

  meta:
    total_sources: 12
    confidence_breakdown:
      L1: high
      L2: medium
      L3: low
      L4: high
      L5: medium
    research_gaps: ["What we couldn't determine"]
```

## Handoff

next_agent: source-analyst
next_command: validate
condition: Blueprint reconstructed with at least 3 layers covered
