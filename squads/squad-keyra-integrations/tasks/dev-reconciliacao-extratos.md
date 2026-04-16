---
task: reconciliacaoExtratos()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 7
story_ref: "7.1.4"

Entrada:
  - campo: transações_extraídas
    tipo: array
    origem: Pipeline de parsing
    obrigatório: true

  - campo: transações_keyra
    tipo: array
    origem: Banco de dados (transactions)
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/documents/reconciliation/
    persistido: true

Checklist:
  - "[ ] Algoritmo de matching: transação extraída ↔ transação KEYRA"
  - "[ ] Critérios de match: data (±2 dias), valor (exato), descrição (fuzzy)"
  - "[ ] Classificar: conciliada | não encontrada | duplicata | divergência"
  - "[ ] Tela de reconciliação manual para itens não conciliados"
  - "[ ] Importar transações novas (não encontradas no KEYRA)"
  - "[ ] Destacar divergências de valor (taxa de maquininha)"
  - "[ ] Validação: @finance-domain-expert revisa lógica de matching"
  - "[ ] Valores em centavos inteiros na comparação"
  - "[ ] Testes com cenários: match perfeito, data ±1 dia, valor divergente"
---

# Reconciliação de Extratos

## Objetivo

Cruzar automaticamente as transações extraídas de documentos (extratos bancários e maquininhas) com as transações registradas no KEYRA.

## Algoritmo de Matching

```
Para cada transação extraída:
  1. Buscar no KEYRA por data exata + valor exato → MATCH PERFEITO
  2. Se não: buscar por data ±2 dias + valor exato → MATCH PROVÁVEL
  3. Se não: buscar por valor exato + descrição similar → MATCH POSSÍVEL
  4. Se não: → NÃO ENCONTRADA (importar ou ignorar)

Classificação:
  ✅ Conciliada — Match encontrado, valores batem
  ⚠️ Divergência — Match encontrado, valores diferem (taxa?)
  ❓ Não encontrada — Sem match (transação nova para importar)
  🔄 Duplicata — Já importada anteriormente
```

## Tela de Reconciliação

```
┌──────────────────────────────────────────────────────┐
│ Reconciliação — Extrato Itaú (Março 2026)            │
│                                                       │
│ ✅ Conciliadas: 45 transações                         │
│ ⚠️ Divergências: 3 (revisar)                          │
│ ❓ Não encontradas: 7 (importar?)                     │
│ 🔄 Duplicatas: 0                                     │
│                                                       │
│ [Aprovar Conciliadas] [Revisar Divergências]          │
└──────────────────────────────────────────────────────┘
```
