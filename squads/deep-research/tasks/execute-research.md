---
task: Execute Research
responsavel: source-analyst
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: research_prompt
    tipo: string
    origem: create-research-prompt output
    obrigatorio: true

  - campo: depth
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: quick | standard | deep (default standard)

Saida:
  - campo: raw_findings
    tipo: object
    destino: benchmarking/raw-findings/{YYYY-MM-DD}-{topic-slug}-raw-findings.yaml
    persistido: true

  - campo: source_registry
    tipo: array
    destino: benchmarking/sources/{YYYY-MM-DD}-{topic-slug}-sources.yaml
    persistido: true
---

# Execute Research

Executa pesquisa sistematica seguindo o prompt de pesquisa gerado.

## Depth Levels

| Level | Sources | Triangulation | Duration |
|-------|---------|---------------|----------|
| quick | 3-5 | Optional | 5-10 min |
| standard | 5-10 | Required (2+) | 15-30 min |
| deep | 10-20 | Required (3+) | 30-60 min |

## Steps

1. **Parse Research Prompt** — Extrair questoes, metodologia e criterios
2. **Plan Search Strategy** — Definir queries, fontes prioritarias, e sequencia
3. **Execute Searches** — Buscar informacoes usando EXA, web search, e docs
4. **Collect Raw Data** — Organizar findings por questao de pesquisa
5. **Classify Sources** — Tier 1 (Primary), Tier 2 (Secondary), Tier 3 (Tertiary)
6. **Flag Gaps** — Identificar questoes sem resposta ou com dados insuficientes

## Source Classification

| Tier | Criteria | Weight |
|------|----------|--------|
| Primary | Original data, official reports, peer-reviewed | High |
| Secondary | News, industry reports, expert opinions | Medium |
| Tertiary | Blog posts, forums, aggregators | Low |

## Credibility Assessment

Para cada fonte, avaliar:
- **Authority** — Expertise do autor/organizacao (1-5)
- **Recency** — Quao recente sao os dados (1-5)
- **Bias** — Nivel de imparcialidade (1-5)
- **Corroboration** — Confirmado por outras fontes (1-5)

Score minimo: 12/20 para incluir no report final.

## Output

```yaml
findings:
  - question: "Pergunta de pesquisa"
    answer_summary: "Resumo da resposta"
    evidence:
      - source: "URL ou referencia"
        tier: 1
        credibility_score: 16
        key_data: "Dado relevante"
    confidence: high | medium | low
    gaps: ["Informacao que falta"]
```

## Handoff

next_agent: source-analyst
next_command: validate
condition: All primary questions have at least one finding
