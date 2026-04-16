# Competitive Benchmark Report: {{subject}}

**Date:** {{date}}
**Depth:** {{depth}}
**Competitors Analyzed:** {{competitor_count}}

---

## Executive Summary

{{executive_summary}}

---

## Competitive Matrix

| Dimension | {{subject}} | {{#each competitors}}{{this.name}} | {{/each}}
|-----------|{{subject_separator}}|{{#each competitors}}{{this.separator}}|{{/each}}
{{#each dimensions}}
| **{{this.name}}** | {{this.subject_score}}/5 | {{#each this.competitor_scores}}{{this}}/5 | {{/each}}
{{/each}}
| **Total** | **{{subject_total}}/{{max_score}}** | {{#each competitor_totals}}**{{this}}/{{../max_score}}** | {{/each}}

---

## Positioning Map

```
                    {{axis_y_high}}
                        |
          {{quadrant_tl}}    |    {{quadrant_tr}}
                        |
   {{axis_x_low}} ------+------ {{axis_x_high}}
                        |
          {{quadrant_bl}}    |    {{quadrant_br}}
                        |
                    {{axis_y_low}}
```

---

## Detailed Analysis by Dimension

{{#each dimensions}}
### {{this.name}}

{{this.analysis}}

| Competitor | Score | Key Strengths | Key Weaknesses |
|------------|-------|---------------|----------------|
{{#each this.competitors}}
| {{this.name}} | {{this.score}}/5 | {{this.strengths}} | {{this.weaknesses}} |
{{/each}}

{{/each}}

---

## Opportunities & Threats

### Opportunities (Gaps to Exploit)
{{#each opportunities}}
- **{{this.area}}:** {{this.description}} _({{this.competitors_weak}})_
{{/each}}

### Threats (Strengths to Defend Against)
{{#each threats}}
- **{{this.area}}:** {{this.description}} _({{this.competitors_strong}})_
{{/each}}

---

## Actionable Recommendations

{{#each recommendations}}
1. **{{this.action}}** — {{this.rationale}}
   - Priority: {{this.priority}}
   - Based on: {{this.evidence}}
{{/each}}

---

## Source Registry

| # | Source | Competitor | Dimension | Credibility |
|---|--------|-----------|-----------|-------------|
{{#each sources}}
| {{@index}} | {{this.url}} | {{this.competitor}} | {{this.dimension}} | {{this.credibility}}/20 |
{{/each}}
