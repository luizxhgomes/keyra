---
task: Create Research Prompt
responsavel: research-lead
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: topic
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Must be non-empty

  - campo: research_type
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: One of 9 research focus types

  - campo: context_docs
    tipo: array
    origem: User Input
    obrigatorio: false
    validacao: Paths to existing documents for context

Saida:
  - campo: research_prompt
    tipo: string
    destino: benchmarking/research-prompts/{YYYY-MM-DD}-{topic-slug}-prompt.md
    persistido: true

  - campo: research_questions
    tipo: array
    destino: Memory
    persistido: false
---

# Create Research Prompt

Gera um prompt de pesquisa estruturado e abrangente a partir de requisitos do usuario.

## Research Focus Options

1. **Product Validation** — Validar hipoteses de produto e market fit
2. **Market Opportunity** — Analisar tamanho de mercado e potencial de crescimento
3. **User & Customer** — Deep dive em personas, comportamentos e pain points
4. **Competitive Intelligence** — Analise detalhada de competidores
5. **Technology & Innovation** — Avaliar tendencias e abordagens tecnicas
6. **Industry & Ecosystem** — Mapear cadeias de valor e dinamicas do setor
7. **Strategic Options** — Avaliar direcoes estrategicas e modelos de negocio
8. **Risk & Feasibility** — Identificar e avaliar fatores de risco
9. **Custom Focus** — Objetivos de pesquisa definidos pelo usuario

## Steps

1. **Clarify Objectives** — Elicitar objetivo, decisoes que a pesquisa vai informar, e restricoes
2. **Select Research Type** — Classificar o tipo de pesquisa (1-9)
3. **Frame Questions** — Gerar perguntas primarias (must answer) e secundarias (nice to have)
4. **Define Methodology** — Especificar fontes, frameworks de analise, criterios de qualidade
5. **Set Deliverables** — Definir formato do output, secoes obrigatorias, nivel de detalhe
6. **Generate Prompt** — Compilar prompt final estruturado

## Output Format

```markdown
## Research Objective
[Statement claro do objetivo]

## Background Context
[Contexto relevante]

## Research Questions
### Primary (Must Answer)
1. [Pergunta especifica e acionavel]

### Secondary (Nice to Have)
1. [Pergunta de suporte]

## Methodology
### Sources
- [Tipos de fonte e prioridades]

### Analysis Frameworks
- [Frameworks a aplicar]

## Expected Deliverables
- Executive Summary
- Detailed Analysis
- Comparison Matrices
- Recommendations

## Success Criteria
[Como avaliar se a pesquisa atingiu seus objetivos]
```

## Handoff

next_agent: source-analyst
next_command: search
condition: Research prompt validated and approved
