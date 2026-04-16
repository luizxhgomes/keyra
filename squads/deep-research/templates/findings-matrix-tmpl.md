# Findings Matrix: {{topic}}

## Summary

| Metric | Value |
|--------|-------|
| Total Questions | {{total_questions}} |
| Answered | {{answered}} |
| High Confidence | {{high_confidence}} |
| Low Confidence | {{low_confidence}} |
| Gaps | {{gaps_count}} |

## Matrix

| Question | Status | Confidence | Sources | Key Finding | Gaps |
|----------|--------|------------|---------|-------------|------|
{{#each questions}}
| {{this.question}} | {{this.status}} | {{this.confidence}} | {{this.source_count}} | {{this.key_finding}} | {{this.gaps}} |
{{/each}}

## Contradictions

{{#each contradictions}}
### {{this.topic}}
- **View A:** {{this.view_a}} _({{this.source_a}})_
- **View B:** {{this.view_b}} _({{this.source_b}})_
- **Assessment:** {{this.assessment}}
{{/each}}

## Source Distribution

| Tier | Count | Percentage |
|------|-------|------------|
| Primary | {{tier1_count}} | {{tier1_pct}}% |
| Secondary | {{tier2_count}} | {{tier2_pct}}% |
| Tertiary | {{tier3_count}} | {{tier3_pct}}% |
