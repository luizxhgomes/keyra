---
task: Collect Strategies
responsavel: strategy-analyst
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: domain
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Domain or industry to research

  - campo: focus
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "growth | sales | product | content | operations | all (default: all)"

  - campo: targets
    tipo: array
    origem: User Input
    obrigatorio: false
    validacao: Specific companies or projects to analyze

Saida:
  - campo: strategy_catalog
    tipo: object
    destino: benchmarking/strategies/{YYYY-MM-DD}-{domain-slug}-catalog.yaml
    persistido: true

  - campo: framework_inventory
    tipo: array
    destino: benchmarking/strategies/{YYYY-MM-DD}-{domain-slug}-frameworks.yaml
    persistido: true
---

# Collect Strategies

Coleta, identifica e cataloga frameworks e estrategias usados por empresas, projetos e lideres de um dominio especifico.

## O Que Coletar

### 1. Frameworks Estrategicos
- Quais frameworks a empresa/projeto usa (declarados ou inferidos)
- Como foram adaptados ao contexto
- Resultados observaveis da aplicacao

### 2. Padroes de Decisao
- Decisoes estrategicas chave e sua logica
- Trade-offs feitos e justificativas
- Sequencia de movimentos estrategicos (timing)

### 3. Modelos Operacionais
- Como a estrategia se traduz em operacoes
- Metricas usadas para tracking
- Ciclos de revisao e adaptacao

## Steps

1. **Define Scope** — Delimitar dominio, periodo e alvos de pesquisa
2. **Scan Public Artifacts** — Buscar em sites, blogs, podcasts, entrevistas, cases, talks
3. **Identify Frameworks** — Mapear frameworks explicitamente mencionados ou implicitamente usados
4. **Catalog Strategies** — Organizar por categoria (growth, sales, product, content, operations)
5. **Assess Applicability** — Avaliar contexto de aplicacao e limitacoes
6. **Cross-Reference** — Cruzar com base de frameworks conhecidos (data/strategy-frameworks.yaml)

## Output Format

```yaml
strategy_catalog:
  domain: "{domain}"
  analyzed_targets:
    - name: "Company/Project X"
      frameworks_identified:
        - name: "Framework Name"
          category: growth | sales | product | content | operations
          evidence: "URL or artifact where identified"
          adaptation: "How they adapted it"
          results: "Observable outcomes"
          applicability:
            contexts: ["SaaS B2B", "Early-stage"]
            limitations: ["Requires X", "Not suitable for Y"]
      strategic_patterns:
        - pattern: "Description of the pattern"
          evidence: "Where observed"
          frequency: one-time | recurring
  framework_inventory:
    - name: "Framework"
      origin: "Creator/Company"
      category: "Category"
      usage_count: 3
      best_for: "Context where most effective"
```

## Handoff

next_agent: synthesis-writer
next_command: synthesize
condition: Strategy catalog complete with at least 3 targets analyzed
