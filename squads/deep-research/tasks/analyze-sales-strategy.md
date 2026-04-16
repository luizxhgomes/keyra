---
task: Analyze Sales Strategy
responsavel: strategy-analyst
responsavel_type: agent
atomic_layer: task

Entrada:
  - campo: target
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Company, product or project to analyze

  - campo: focus_areas
    tipo: array
    origem: User Input
    obrigatorio: false
    validacao: "funnel | pricing | channels | team | metrics | all (default: all)"

Saida:
  - campo: sales_strategy_report
    tipo: object
    destino: benchmarking/sales/{YYYY-MM-DD}-{target-slug}-sales-strategy.yaml
    persistido: true
---

# Analyze Sales Strategy

Pesquisa e decompose a estrategia comercial, funil de vendas e go-to-market de um target.

## Areas de Analise

### 1. Modelo de Vendas
- **PLG (Product-Led Growth)** — Free trial, freemium, self-serve
- **SLG (Sales-Led Growth)** — Inside sales, field sales, enterprise
- **CLG (Community-Led Growth)** — Open source, community, developer advocacy
- **Hybrid** — Combinacao de modelos

### 2. Funil de Vendas
- **Awareness** — Como geram atencao (SEO, ads, content, partnerships)
- **Acquisition** — Como capturam leads (landing pages, forms, demos)
- **Activation** — Como ativam usuarios (onboarding, aha moment)
- **Revenue** — Como convertem (pricing, upsell, expansion)
- **Retention** — Como retem (engagement, NPS, success)
- **Referral** — Como geram indicacoes (programs, NPS, advocacy)

### 3. Pricing Strategy
- Modelo (subscription, usage, per-seat, hybrid)
- Tiers e feature gating
- Ancoragem e decoy pricing
- Free vs paid boundary
- Enterprise custom pricing

### 4. Canais de Aquisicao
- Organico (SEO, content, social, community)
- Pago (Google Ads, Meta, LinkedIn, programmatic)
- Partnerships (integrações, co-marketing, affiliates)
- Outbound (SDR, cold outreach, ABM)
- Events (conferences, webinars, meetups)

### 5. Sales Team Structure
- Modelo organizacional (pods, regions, segments)
- Ratios SDR:AE:CS
- Ferramentas e tech stack de vendas
- Ciclo de vendas medio

## Steps

1. **Profile Target** — Identificar modelo de negocio, mercado e estagio
2. **Map Sales Model** — Classificar PLG/SLG/CLG/Hybrid com evidencia
3. **Decompose Funnel** — Mapear cada estagio AARRR com taticas observaveis
4. **Analyze Pricing** — Pesquisar modelos, tiers e estrategia de precificacao
5. **Identify Channels** — Mapear canais de aquisicao ativos e seu peso relativo
6. **Assess Effectiveness** — Avaliar sinais de sucesso/fracasso em cada area
7. **Extract Patterns** — Identificar padroes replicaveis e anti-patterns

## Evidence Sources

| Source | What to Look For |
|--------|-----------------|
| Website/Pricing page | Tiers, features, CTAs, messaging |
| Job postings | SDR/AE ratios, tools mentioned, team structure |
| LinkedIn company page | Employee growth, department distribution |
| G2/Capterra reviews | Sales process comments, pricing mentions |
| Crunchbase/PitchBook | Funding, revenue estimates, investor thesis |
| Blog/Content | Funnel content mapping, topic clusters |
| Social media | Ad library, content frequency, engagement |
| YouTube/Podcasts | Founder interviews revealing strategy |

## Output Format

```yaml
sales_strategy_report:
  target: "{company/product}"
  sales_model:
    primary: PLG | SLG | CLG | Hybrid
    evidence: ["URL or artifact"]
    maturity: early | growing | mature
  funnel:
    awareness:
      tactics: ["tactic 1", "tactic 2"]
      primary_channel: "channel"
      evidence: ["URL"]
    acquisition:
      tactics: ["tactic 1"]
      conversion_points: ["form", "demo", "trial"]
    activation:
      onboarding_model: "self-serve | guided | white-glove"
      time_to_value: "estimated"
    revenue:
      pricing_model: "subscription | usage | hybrid"
      tiers: ["free", "pro", "enterprise"]
      evidence: ["pricing page URL"]
    retention:
      signals: ["NPS score", "community activity"]
    referral:
      program: true | false
      mechanics: "description"
  channels:
    - channel: "SEO"
      estimated_weight: "high | medium | low"
      evidence: "observable artifacts"
  insights:
    strengths: ["strength 1"]
    weaknesses: ["weakness 1"]
    replicable_patterns: ["pattern 1"]
    anti_patterns: ["anti-pattern 1"]
```

## Handoff

next_agent: source-analyst
next_command: validate
condition: Sales strategy mapped across at least 4 funnel stages
