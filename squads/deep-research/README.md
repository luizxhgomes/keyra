# deep-research

Squad especializado em deep research para o AIOX.

## Objetivo

Conduzir pesquisas profundas e estruturadas sobre qualquer tema — mercado, tecnologia, competidores, usuarios, tendencias — e entregar reports acionaveis com fontes validadas.

## Agentes

| Agente | Papel | Responsabilidade |
|--------|-------|------------------|
| Research Lead | Coordenador | Define escopo, distribui pesquisa, consolida resultados |
| Source Analyst | Investigador | Busca, valida e classifica fontes de informacao |
| Synthesis Writer | Redator | Sintetiza findings em reports estruturados e acionaveis |
| Strategy Analyst | Estrategista | Benchmarking, frameworks, posicionamento, sales e reverse-engineering |

## Tasks

### Core Research
| Task | Descricao |
|------|-----------|
| `create-research-prompt` | Gera prompt de pesquisa estruturado a partir de requisitos |
| `execute-research` | Executa pesquisa usando ferramentas de busca e analise |
| `synthesize-findings` | Consolida findings em report final |
| `validate-sources` | Valida credibilidade e relevancia das fontes |

### Strategic Research
| Task | Descricao |
|------|-----------|
| `collect-strategies` | Coleta e cataloga frameworks e estrategias de um dominio |
| `benchmark-competitors` | Analise competitiva e benchmarking multi-dimensional |
| `analyze-sales-strategy` | Pesquisa de estrategia comercial, funil e go-to-market |
| `analyze-positioning` | Analise de conteudo, posicionamento e narrativa de marca |
| `reverse-engineer-project` | Decompose como um projeto foi concebido e estruturado |

## Workflows

### 1. Deep Research Pipeline (geral)
```
create-research-prompt → execute-research → validate-sources → synthesize-findings
```

### 2. Strategic Research Pipeline (estrategico)
6 modos de execucao:
- `benchmark` — Analise competitiva
- `strategy-collection` — Coleta de frameworks
- `sales-analysis` — Estrategia de vendas
- `positioning-analysis` — Posicionamento e conteudo
- `reverse-engineering` — Reverse-engineering de projetos
- `full` — Todas as analises combinadas

## Uso

```
@squad-creator *integrate-squad deep-research
```

Ou ative diretamente com os workflows:

```
*deep-research-pipeline {topic}
*strategic-research-pipeline {target} --mode benchmark
*strategic-research-pipeline {target} --mode reverse-engineering
*strategic-research-pipeline {target} --mode full
```

## Tipos de Pesquisa Suportados

### General Research
1. Product Validation Research
2. Market Opportunity Research
3. User & Customer Research
4. Competitive Intelligence Research
5. Technology & Innovation Research
6. Industry & Ecosystem Research
7. Strategic Options Research
8. Risk & Feasibility Research
9. Custom Research Focus

### Strategic Research
10. Strategy Framework Collection
11. Competitive Benchmarking (multi-dimensional)
12. Sales Strategy & Go-to-Market Analysis
13. Content & Positioning Analysis
14. Project Reverse-Engineering (blueprint reconstruction)
