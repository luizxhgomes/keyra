---
task: wireframesDashboard()
responsavel: "@ux-design-expert"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: prd
    tipo: markdown
    origem: docs/prd/keyra-prd.md
    obrigatório: true

  - campo: princípios_ux
    tipo: object
    origem: Memória do projeto (feedback_ux_principles)
    obrigatório: true

Saída:
  - campo: wireframes
    tipo: markdown
    destino: docs/ux/wireframes-keyra.md
    persistido: true

  - campo: design_system_base
    tipo: markdown
    destino: docs/ux/design-system-keyra.md
    persistido: true

Checklist:
  - "[ ] Ler PRD e extrair fluxos principais"
  - "[ ] Aplicar princípios UX da idealizadora"
  - "[ ] Projetar dashboard numérico (tela única)"
  - "[ ] Projetar fluxo de agendamento"
  - "[ ] Projetar fluxo de atendimento → comanda → pagamento"
  - "[ ] Projetar tela de precificação de serviços"
  - "[ ] Projetar tela de DRE simplificada"
  - "[ ] Projetar fluxo de upload de documentos"
  - "[ ] Definir paleta de cores e tipografia base"
  - "[ ] Definir componentes reutilizáveis (cards numéricos, listas, formulários)"
---

# Wireframes do Dashboard e Fluxos do KEYRA

## Objetivo

Projetar os wireframes de baixa/média fidelidade do KEYRA, respeitando rigorosamente os princípios UX definidos pela idealizadora.

## Princípios UX Inegociáveis

1. **Números absolutos, NÃO gráficos** — "as pessoas não sabem ler gráficos"
2. **Comparativos textuais** — "R$ 2.300 a mais que o mês passado"
3. **Tela única** — Dashboard que mostra tudo de uma vez
4. **Simplicidade** — A profissional de estética precisa entender sem ser financista

## Telas a Projetar

1. **Dashboard principal** — Números absolutos: faturamento, despesas, lucro, metas
2. **Agenda** — Visualização diária/semanal, slots disponíveis
3. **Atendimento** — Comanda automática, serviços realizados
4. **Pagamento** — Registro de pagamento, formas, parcelamento
5. **Serviços** — Catálogo com preço, custo e margem
6. **DRE** — Demonstrativo simplificado em formato tabular
7. **Upload de documentos** — Arrastar e soltar, status de processamento
8. **Configurações** — Regime fiscal, dados da clínica

## Padrão de Cards Numéricos

```
┌─────────────────────────┐
│  Faturamento do Mês     │
│  R$ 28.450,00           │  ← número absoluto, grande
│  R$ 2.300 a mais que    │  ← comparativo textual
│  o mês anterior         │
└─────────────────────────┘
```
