---
task: Synthesize Findings
responsavel: synthesis-writer
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: validated_findings
    tipo: object
    origem: validate-sources output
    obrigatorio: true

  - campo: research_prompt
    tipo: string
    origem: create-research-prompt output
    obrigatorio: true

  - campo: output_format
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: executive | detailed | matrix (default detailed)

Saida:
  - campo: research_report
    tipo: string
    destino: benchmarking/reports/{YYYY-MM-DD}-{topic-slug}-report.md
    persistido: true
    routing: |
      Output directory varies by research mode:
      - general research → benchmarking/reports/
      - benchmark mode → benchmarking/benchmarks/
      - strategy-collection → benchmarking/strategies/
      - sales-analysis → benchmarking/sales/
      - positioning-analysis → benchmarking/positioning/
      - reverse-engineering → benchmarking/reverse-engineering/
---

# Synthesize Findings

Transforma findings validados em um report estruturado e acionavel.

## Output Formats

| Format | Audience | Length | Focus |
|--------|----------|--------|-------|
| executive | C-level, stakeholders | 1-2 pages | Key insights + recommendations |
| detailed | Team leads, analysts | 5-10 pages | Full analysis with evidence |
| matrix | Comparison decisions | 2-3 pages | Structured comparison tables |

## Steps

1. **Map Findings to Questions** — Alinhar cada finding com a pergunta de pesquisa original
2. **Identify Patterns** — Detectar tendencias, temas recorrentes e outliers
3. **Build Narrative** — Construir narrativa coerente dos dados para insights
4. **Create Visuals** — Gerar tabelas comparativas, matrices e listas estruturadas
5. **Craft Recommendations** — Derivar recomendacoes acionaveis dos findings
6. **Write Report** — Compilar report final no formato solicitado

## Report Structure

```markdown
# Deep Research Report: {topic}

## Executive Summary
- Key findings (3-5 bullet points)
- Critical implications
- Top recommendations

## Research Methodology
- Scope and objectives
- Sources consulted ({count})
- Validation approach

## Key Findings

### Finding 1: {insight}
**Confidence:** {high|medium|low}
**Evidence:** {summary of supporting data}
**Sources:** {count} sources, Tier {1|2|3}

[Repeat for each finding]

## Analysis

### Patterns & Trends
- {pattern 1}
- {pattern 2}

### Comparison Matrix
| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|

### Gaps & Uncertainties
- {gap 1}
- {gap 2}

## Recommendations

### Immediate Actions
1. {action with rationale}

### Further Research Needed
1. {topic requiring deeper investigation}

## Appendix
- Source registry
- Methodology details
- Raw data references
```

## Quality Criteria

- Cada recomendacao deve ter pelo menos 2 findings de suporte
- Confidence levels devem ser consistentes com validation report
- Gaps e uncertainties devem ser explicitamente documentados
- Report deve responder todas as primary questions do prompt original
