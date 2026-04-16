# Benchmarking — Output Directory

Diretorio central de outputs do squad deep-research. Todo material pesquisado, validado e sintetizado e organizado aqui.

## Estrutura

```
benchmarking/
├── research-prompts/       # Prompts de pesquisa gerados (input do pipeline)
├── raw-findings/           # Findings brutos antes da validacao
├── validated-findings/     # Findings apos validacao de fontes
├── reports/                # Reports finais sintetizados
├── benchmarks/             # Analises competitivas e matrices de benchmarking
├── strategies/             # Catalogos de frameworks e estrategias
├── sales/                  # Analises de estrategia comercial e GTM
├── positioning/            # Analises de posicionamento e conteudo
├── reverse-engineering/    # Blueprints reconstruidos de projetos
└── sources/                # Source registries e evidencias consolidadas
```

## Convencao de Nomes

```
{YYYY-MM-DD}-{topic-slug}-{type}.{ext}
```

Exemplos:
- `2026-04-12-competitor-x-benchmark.md`
- `2026-04-12-saas-market-raw-findings.yaml`
- `2026-04-12-project-y-blueprint.yaml`
- `2026-04-12-competitor-x-sources.yaml`

## Fluxo de Dados

```
research-prompts/       ← create-research-prompt
       ↓
raw-findings/           ← execute-research, benchmark-competitors,
                          collect-strategies, analyze-sales-strategy,
                          analyze-positioning, reverse-engineer-project
       ↓
validated-findings/     ← validate-sources
       ↓
reports/                ← synthesize-findings (general)
benchmarks/             ← synthesize-findings (benchmark mode)
strategies/             ← synthesize-findings (strategy-collection mode)
sales/                  ← synthesize-findings (sales-analysis mode)
positioning/            ← synthesize-findings (positioning-analysis mode)
reverse-engineering/    ← synthesize-findings (reverse-engineering mode)
       ↓
sources/                ← source registry consolidado de cada pesquisa
```

## Retencao

- Prompts e reports sao permanentes
- Raw findings podem ser limpos apos validacao (opcional)
- Source registries devem ser mantidos para auditoria
