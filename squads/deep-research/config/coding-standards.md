# Deep Research Squad — Coding Standards

## Research Output Standards

- All findings must include source attribution
- Confidence levels: `high` (3+ corroborating sources), `medium` (2 sources), `low` (1 source)
- Dates in ISO 8601 format (YYYY-MM-DD)
- Source credibility scores on 1-20 scale (4 dimensions x 1-5 each)

## Output Directory

All outputs go to `benchmarking/` with subdirectories by type.
See `benchmarking/README.md` for full structure.

## File Naming

Pattern: `{YYYY-MM-DD}-{topic-slug}-{type}.{ext}`

- Research prompts: `benchmarking/research-prompts/2026-04-12-topic-prompt.md`
- Raw findings: `benchmarking/raw-findings/2026-04-12-topic-raw-findings.yaml`
- Validated findings: `benchmarking/validated-findings/2026-04-12-topic-validated.yaml`
- General reports: `benchmarking/reports/2026-04-12-topic-report.md`
- Benchmarks: `benchmarking/benchmarks/2026-04-12-subject-benchmark.md`
- Strategy catalogs: `benchmarking/strategies/2026-04-12-domain-catalog.yaml`
- Sales analysis: `benchmarking/sales/2026-04-12-target-sales-strategy.yaml`
- Positioning: `benchmarking/positioning/2026-04-12-target-positioning.yaml`
- Blueprints: `benchmarking/reverse-engineering/2026-04-12-target-blueprint.yaml`
- Source registries: `benchmarking/sources/2026-04-12-topic-sources.yaml`

## Markdown Conventions

- Use tables for structured comparisons
- Use numbered lists for prioritized items
- Use bullet lists for non-ordered items
- Headers: H1 for title, H2 for sections, H3 for subsections
