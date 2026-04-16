---
task: criarPrdKeyra()
responsavel: "@pm"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: contexto_idealizadora
    tipo: string
    origem: docs/audios-idealizadora/contexto-completo-keyra.md
    obrigatório: true
    validação: Arquivo deve existir e conter a visão completa do produto

  - campo: princípios_ux
    tipo: object
    origem: Memória do projeto
    obrigatório: true
    validação: Números absolutos, sem gráficos, tela única, simplicidade

Saída:
  - campo: prd_documento
    tipo: markdown
    destino: docs/prd/keyra-prd.md
    persistido: true

  - campo: requisitos_funcionais
    tipo: array
    destino: docs/prd/keyra-prd.md (seção FR)
    persistido: true

  - campo: requisitos_não_funcionais
    tipo: array
    destino: docs/prd/keyra-prd.md (seção NFR)
    persistido: true

Checklist:
  - "[ ] Ler contexto completo da idealizadora"
  - "[ ] Identificar os 12 módulos do KEYRA"
  - "[ ] Definir requisitos funcionais (FR-XXX)"
  - "[ ] Definir requisitos não funcionais (NFR-XXX)"
  - "[ ] Definir restrições (CON-XXX)"
  - "[ ] Mapear personas (profissional de estética, gestora, mentora)"
  - "[ ] Definir planos de monetização (Start, Crescimento, Autoridade)"
  - "[ ] Validar princípios UX inegociáveis"
  - "[ ] Gerar PRD usando template prd-keyra-tmpl.md"
---

# Criar PRD do KEYRA

## Objetivo

Criar o PRD (Product Requirements Document) formal do KEYRA a partir do contexto completo fornecido pela idealizadora (mentora financeira para estética).

## Contexto

O KEYRA é "o primeiro financeiro operacional para estética". A agenda é a origem do faturamento — o financeiro é gerado automaticamente da operação. O documento da idealizadora contém a visão completa em `docs/audios-idealizadora/contexto-completo-keyra.md`.

## Passos de Execução

1. **Ler contexto completo** — Processar o documento da idealizadora
2. **Extrair os 4 pilares** — Agenda, Serviços, Financeiro, Inteligência
3. **Mapear os 12 módulos** — Agenda, Pacientes, Serviços/Catálogo, Comanda, Financeiro, Custos/Precificação, DRE, Estoque/Insumos, Upload PDFs, Dashboard, Inteligência IA, Marketplace
4. **Definir FRs** — Requisitos funcionais numerados (FR-001 a FR-XXX)
5. **Definir NFRs** — Performance, segurança, usabilidade, escalabilidade
6. **Definir restrições** — CON-001: números absolutos, CON-002: sem gráficos, etc.
7. **Mapear personas** — Quem usa, quais dores, quais ganhos
8. **Definir monetização** — 3 planos SaaS
9. **Gerar documento** — Usar template `prd-keyra-tmpl.md`
10. **Validar** — Checklist de revisão de PRD

## Template

Usar: `templates/prd-keyra-tmpl.md`

## Validação

Usar: `checklists/checklist-revisao-prd.md`
