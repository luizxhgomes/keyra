# Deep Research Report: {{topic}}

**Date:** {{date}}
**Research Type:** {{research_type}}
**Depth:** {{depth}}
**Confidence:** {{overall_confidence}}

---

## Executive Summary

{{executive_summary}}

### Key Findings
{{#each key_findings}}
- {{this}}
{{/each}}

### Critical Implications
{{#each implications}}
- {{this}}
{{/each}}

### Top Recommendations
{{#each top_recommendations}}
1. {{this}}
{{/each}}

---

## Research Methodology

- **Objective:** {{objective}}
- **Scope:** {{scope}}
- **Sources Consulted:** {{sources_count}} ({{tier1_count}} primary, {{tier2_count}} secondary, {{tier3_count}} tertiary)
- **Validation:** Cross-referenced across {{min_triangulation}}+ independent sources

---

## Detailed Findings

{{#each findings}}
### {{this.title}}

**Confidence:** {{this.confidence}}
**Supporting Sources:** {{this.source_count}}

{{this.analysis}}

**Evidence:**
{{#each this.evidence}}
- {{this.summary}} _({{this.source}}, Tier {{this.tier}})_
{{/each}}

{{/each}}

---

## Comparison Matrix

| Criteria | {{#each options}}{{this.name}} | {{/each}}
|----------|{{#each options}}----------|{{/each}}
{{#each comparison_rows}}
| {{this.criteria}} | {{#each this.values}}{{this}} | {{/each}}
{{/each}}

---

## Patterns & Trends

{{#each patterns}}
- **{{this.name}}:** {{this.description}}
{{/each}}

---

## Gaps & Uncertainties

{{#each gaps}}
- {{this}}
{{/each}}

---

## Recommendations

### Immediate Actions
{{#each immediate_actions}}
1. **{{this.action}}** — {{this.rationale}} _(based on: {{this.supporting_findings}})_
{{/each}}

### Further Research Needed
{{#each further_research}}
1. {{this}}
{{/each}}

---

## Appendix

### Source Registry

| # | Source | Tier | Credibility | Recency |
|---|--------|------|-------------|---------|
{{#each sources}}
| {{@index}} | {{this.name}} | {{this.tier}} | {{this.credibility}}/20 | {{this.date}} |
{{/each}}
