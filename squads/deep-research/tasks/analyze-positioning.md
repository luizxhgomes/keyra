---
task: Analyze Positioning
responsavel: strategy-analyst
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: target
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Brand, company or product to analyze

  - campo: scope
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "brand | content | narrative | full (default: full)"

  - campo: competitors
    tipo: array
    origem: User Input
    obrigatorio: false
    validacao: Competitors for relative positioning analysis

Saida:
  - campo: positioning_report
    tipo: object
    destino: benchmarking/positioning/{YYYY-MM-DD}-{target-slug}-positioning.yaml
    persistido: true
---

# Analyze Positioning

Analisa estrategia de conteudo, posicionamento de marca e narrativa de um target.

## Dimensoes de Analise

### 1. Posicionamento de Marca
- **Category** — Em qual categoria se posiciona (existente ou criada)
- **Target Audience** — Para quem fala (declarado vs real)
- **Value Proposition** — Promessa central de valor
- **Differentiator** — O que os torna unicos (claimed vs perceived)
- **Reason to Believe** — Provas e credenciais apresentadas
- **Brand Personality** — Tom, voz, arquetipos

### 2. Estrategia de Conteudo
- **Pilares** — Temas centrais e topic clusters
- **Formatos** — Blog, video, podcast, newsletter, social, docs
- **Frequencia** — Cadencia de publicacao por canal
- **Funil** — Distribuicao awareness/consideration/decision
- **SEO** — Keywords alvo, domain authority, backlink profile
- **Thought Leadership** — Posicoes fortes, opinioes, manifestos

### 3. Narrativa e Messaging
- **Hero Narrative** — Historia principal (de onde vem, para onde vai)
- **Before/After** — Transformacao prometida
- **Enemy** — Contra o que se posiciona (status quo, concorrente, problema)
- **Social Proof** — Logos, testimonials, numeros, cases
- **Call-to-Action** — CTAs primarios e secundarios
- **Messaging Hierarchy** — Homepage → Features → Pricing flow

### 4. Presenca Digital
- **Website** — Estrutura, UX, conversion paths
- **Social Media** — Plataformas, frequencia, engagement rate
- **Communities** — Discord, Slack, forums, GitHub
- **PR/Media** — Mencoes, entrevistas, awards
- **Partnerships** — Co-marketing, integrações, ecosystem

## Steps

1. **Audit Brand Presence** — Levantar todos os touchpoints publicos
2. **Extract Positioning Statement** — Derivar positioning statement implicito
3. **Map Content Strategy** — Catalogar pilares, formatos e frequencia
4. **Decode Narrative** — Identificar hero narrative, enemy e transformation
5. **Analyze Messaging** — Mapear hierarquia de mensagens site → feature → CTA
6. **Compare Positioning** — Posicionar vs competidores (se fornecidos)
7. **Assess Consistency** — Avaliar alinhamento entre canais
8. **Extract Playbook** — Derivar playbook replicavel

## Positioning Statement Template

```
For [target audience]
who [need/opportunity]
[brand] is the [category]
that [key benefit]
unlike [competitors/alternatives]
because [reason to believe]
```

## Output Format

```yaml
positioning_report:
  target: "{brand/company}"
  positioning:
    category: "Category they compete in"
    subcategory: "Niche if applicable"
    target_audience:
      declared: "Who they say they serve"
      actual: "Who they actually serve (inferred)"
    value_proposition: "Core promise"
    differentiator: "What makes them unique"
    reason_to_believe: ["Proof point 1", "Proof point 2"]
    brand_personality:
      tone: "professional | playful | authoritative | friendly"
      archetype: "Hero | Sage | Creator | Explorer | etc."
  content_strategy:
    pillars: ["Topic 1", "Topic 2", "Topic 3"]
    formats:
      - format: "Blog"
        frequency: "2x/week"
        funnel_stage: "awareness"
      - format: "Case studies"
        frequency: "1x/month"
        funnel_stage: "consideration"
    seo:
      estimated_authority: "high | medium | low"
      primary_keywords: ["keyword 1", "keyword 2"]
  narrative:
    hero_story: "Their origin/mission narrative"
    enemy: "What they position against"
    transformation: "Before → After promise"
    social_proof:
      logos: true | false
      testimonials: true | false
      metrics: ["metric 1"]
  consistency_score:
    website_vs_social: "high | medium | low"
    messaging_vs_product: "high | medium | low"
    overall: "high | medium | low"
  playbook:
    replicable_tactics: ["tactic 1"]
    unique_advantages: ["advantage they have that you might not"]
    adaptable_patterns: ["pattern you could adapt"]
```

## Handoff

next_agent: source-analyst
next_command: validate
condition: Positioning analysis complete with all 4 dimensions covered
