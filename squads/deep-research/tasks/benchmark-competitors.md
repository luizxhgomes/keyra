---
task: Benchmark Competitors
responsavel: strategy-analyst
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: subject
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Product, company or project to benchmark

  - campo: competitors
    tipo: array
    origem: User Input
    obrigatorio: false
    validacao: List of competitors (min 2, auto-discover if empty)

  - campo: dimensions
    tipo: array
    origem: User Input
    obrigatorio: false
    validacao: "Benchmark dimensions (default: product, pricing, positioning, GTM, content)"

  - campo: depth
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "quick | standard | deep (default: standard)"

Saida:
  - campo: benchmark_report
    tipo: object
    destino: benchmarking/benchmarks/{YYYY-MM-DD}-{subject-slug}-benchmark.md
    persistido: true

  - campo: competitive_matrix
    tipo: object
    destino: benchmarking/benchmarks/{YYYY-MM-DD}-{subject-slug}-matrix.yaml
    persistido: true
---

# Benchmark Competitors

Executa analise competitiva estruturada e benchmarking multi-dimensional.

## Dimensoes de Benchmarking

### Core (sempre incluidas)
1. **Product** — Features, UX, tecnologia, diferenciais
2. **Pricing** — Modelos, tiers, ancoragem, free/paid ratio
3. **Positioning** — Mensagem, publico-alvo, categoria, narrativa

### Extended (incluidas em standard/deep)
4. **Go-to-Market** — Canais, aquisicao, partnerships, distribuicao
5. **Content** — Blog, social, SEO, thought leadership, formatos
6. **Sales** — Modelo (PLG, SLG, hybrid), equipe, ciclo
7. **Community** — Open source, forums, eventos, developer relations

### Deep (incluidas apenas em deep)
8. **Technology Stack** — Infra, linguagens, arquitetura (quando publico)
9. **Funding & Business Model** — Investidores, receita, unit economics
10. **Team & Culture** — Contratacoes, Glassdoor, LinkedIn growth

## Steps

1. **Identify Competitors** — Se nao fornecidos, descobrir top 5-7 via pesquisa
2. **Define Dimensions** — Confirmar dimensoes com usuario
3. **Collect Data** — Pesquisar cada competidor em cada dimensao
4. **Score Dimensions** — Pontuar 1-5 cada competidor por dimensao
5. **Build Matrix** — Gerar matriz comparativa completa
6. **Identify Patterns** — Detectar gaps, oportunidades e threats
7. **Map Positioning** — Criar mapa de posicionamento (2 eixos)
8. **Generate Insights** — Derivar insights acionaveis

## Scoring Criteria

| Score | Meaning | Evidence Required |
|-------|---------|-------------------|
| 5 | Best-in-class | Multiple strong data points |
| 4 | Strong | Clear evidence of strength |
| 3 | Average | Meets market expectations |
| 2 | Below average | Noticeable gaps |
| 1 | Weak/absent | Missing or very poor |

## Output: Competitive Matrix

```markdown
| Dimension | Subject | Competitor A | Competitor B | Competitor C |
|-----------|---------|-------------|-------------|-------------|
| Product | 4/5 | 5/5 | 3/5 | 4/5 |
| Pricing | 3/5 | 4/5 | 5/5 | 2/5 |
| Positioning | 4/5 | 3/5 | 4/5 | 5/5 |
| GTM | 3/5 | 5/5 | 3/5 | 4/5 |
| Content | 2/5 | 4/5 | 4/5 | 3/5 |
| **Total** | **16/25** | **21/25** | **19/25** | **18/25** |
```

## Output: Positioning Map

```
                    High Price
                        |
          Enterprise    |    Premium
          (Comp A)      |    (Comp C)
                        |
   Low Feature ---------+--------- High Feature
                        |
          Budget        |    Value
          (Comp B)      |    (Subject)
                        |
                    Low Price
```

## Handoff

next_agent: source-analyst
next_command: validate
condition: Benchmark data collected for all dimensions and competitors
