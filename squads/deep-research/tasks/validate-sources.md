---
task: Validate Sources
responsavel: source-analyst
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: raw_findings
    tipo: object
    origem: execute-research output
    obrigatorio: true

Saida:
  - campo: validated_findings
    tipo: object
    destino: benchmarking/validated-findings/{YYYY-MM-DD}-{topic-slug}-validated.yaml
    persistido: true

  - campo: validation_report
    tipo: object
    destino: Memory
    persistido: false
---

# Validate Sources

Valida credibilidade e consistencia dos findings coletados.

## Steps

1. **Cross-Reference** — Verificar se findings sao corroborados por fontes independentes
2. **Check Recency** — Garantir que dados nao estao desatualizados
3. **Detect Contradictions** — Identificar dados conflitantes entre fontes
4. **Assess Confidence** — Atribuir nivel de confianca final a cada finding
5. **Document Gaps** — Listar questoes sem resposta satisfatoria

## Validation Rules

- Findings com apenas 1 fonte: marcar como `low confidence`
- Findings contraditorios: documentar ambos os lados com fontes
- Dados com mais de 12 meses: marcar como `potentially stale`
- Fonte com credibility_score < 12: excluir ou rebaixar

## Output

```yaml
validated_findings:
  - question: "Pergunta"
    validated: true
    confidence: high
    sources_count: 3
    contradictions: []
    staleness_risk: low
validation_summary:
  total_findings: 10
  validated: 8
  low_confidence: 2
  contradictions_found: 1
  gaps_identified: 2
```

## Handoff

next_agent: synthesis-writer
next_command: synthesize
condition: Validation complete, validated_findings generated
