# Strategy Catalog: {{domain}}

**Date:** {{date}}
**Targets Analyzed:** {{target_count}}
**Frameworks Identified:** {{framework_count}}

---

## Executive Summary

{{executive_summary}}

---

## Framework Inventory

| # | Framework | Category | Used By | Applicability | Effectiveness |
|---|-----------|----------|---------|---------------|---------------|
{{#each frameworks}}
| {{@index}} | {{this.name}} | {{this.category}} | {{this.used_by_count}} targets | {{this.applicability}} | {{this.effectiveness}} |
{{/each}}

---

## Frameworks by Category

{{#each categories}}
### {{this.name}}

{{#each this.frameworks}}
#### {{this.name}}

- **Origin:** {{this.origin}}
- **Used By:** {{this.used_by}}
- **How Applied:** {{this.application}}
- **Results Observed:** {{this.results}}
- **Applicability:** {{this.contexts}}
- **Limitations:** {{this.limitations}}
- **Evidence:** {{this.evidence}}

{{/each}}
{{/each}}

---

## Strategic Patterns Across Targets

{{#each patterns}}
### Pattern: {{this.name}}

- **Frequency:** Observed in {{this.frequency}} targets
- **Description:** {{this.description}}
- **Examples:** {{this.examples}}
- **Replicability:** {{this.replicability}}

{{/each}}

---

## Adaptation Guide

### Frameworks Most Applicable to Your Context

{{#each recommended_frameworks}}
1. **{{this.name}}** — {{this.reason}}
   - Adapt by: {{this.adaptation_notes}}
   - Watch out for: {{this.caveats}}
{{/each}}

### Anti-Patterns to Avoid

{{#each anti_patterns}}
- **{{this.name}}:** {{this.description}} _(observed in: {{this.observed_in}})_
{{/each}}

---

## Source Registry

| # | Source | Target | Type | Credibility |
|---|--------|--------|------|-------------|
{{#each sources}}
| {{@index}} | {{this.url}} | {{this.target}} | {{this.type}} | {{this.credibility}}/20 |
{{/each}}
