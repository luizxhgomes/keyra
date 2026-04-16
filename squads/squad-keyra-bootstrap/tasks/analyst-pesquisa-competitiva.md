---
task: pesquisaCompetitiva()
responsavel: "@analyst"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: concorrentes
    tipo: array
    origem: data/dominio-keyra.yaml
    obrigatório: true
    validação: Lista de concorrentes a analisar

  - campo: prd
    tipo: markdown
    origem: docs/prd/keyra-prd.md
    obrigatório: false

Saída:
  - campo: relatório_competitivo
    tipo: markdown
    destino: docs/research/pesquisa-competitiva-keyra.md
    persistido: true

Checklist:
  - "[ ] Mapear concorrentes diretos (Conta Azul, Clinicorp, Trinks, Belle Software)"
  - "[ ] Mapear concorrentes indiretos (Nibo, Bling, planilhas manuais)"
  - "[ ] Analisar funcionalidades de cada concorrente"
  - "[ ] Identificar lacunas (o que ninguém faz)"
  - "[ ] Analisar modelos de precificação"
  - "[ ] Mapear pontos fortes e fracos"
  - "[ ] Identificar diferenciais do KEYRA"
  - "[ ] Gerar matriz comparativa"
  - "[ ] Documentar insights e recomendações"
---

# Pesquisa Competitiva do KEYRA

## Objetivo

Analisar o cenário competitivo de softwares financeiros/gestão para o nicho de estética no Brasil, identificando lacunas e oportunidades para o KEYRA.

## Concorrentes a Analisar

**Diretos:**
- **Conta Azul** — ERP financeiro genérico, não específico para estética
- **Clinicorp** — Gestão para clínicas de estética
- **Trinks** — Gestão para salões e estética
- **Belle Software** — Sistema para estética

**Indiretos:**
- **Nibo** — Contabilidade online
- **Bling** — ERP para pequenos negócios
- **Planilhas manuais** — Principal "concorrente"

## Dimensões de Análise

1. **Funcionalidades** — O que cada um oferece
2. **Precificação** — Planos e valores
3. **UX** — Facilidade de uso para não financistas
4. **Integração agenda-financeiro** — Nível de automação
5. **Lucro por serviço** — Alguém faz isso?
6. **DRE automática** — Alguém gera DRE a partir da operação?

## Template

Usar: `templates/pesquisa-competitiva-keyra-tmpl.md`
