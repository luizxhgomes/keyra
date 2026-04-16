---
task: revisaoHumanaOcr()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 7
story_ref: "7.1.5"

Entrada:
  - campo: transações_baixa_confiança
    tipo: array
    origem: Pipeline de parsing (confidence < 80)
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/documentos/revisao/
    persistido: true

Checklist:
  - "[ ] Tela de revisão para transações com confiança < 80%"
  - "[ ] Exibir imagem/trecho do documento original ao lado"
  - "[ ] Campos editáveis: data, descrição, valor, categoria"
  - "[ ] Highlight visual dos campos com baixa confiança"
  - "[ ] Botões: Confirmar | Corrigir | Descartar"
  - "[ ] Ao confirmar, marcar transação como revisada (confidence = 100)"
  - "[ ] Fila de revisão com contagem de itens pendentes"
  - "[ ] Testes: fluxo de correção, descarte, confirmação"
---

# Revisão Humana de OCR

## Objetivo

Implementar a tela de revisão humana para transações extraídas com baixa confiança. O OCR não é perfeito — a usuária corrige o que a máquina não conseguiu ler.

## Layout

```
┌─────────────────────────┬──────────────────────────┐
│  Documento Original     │  Dados Extraídos         │
│  [imagem do trecho]     │                          │
│                         │  Data: [15/03/2026]      │
│  ───────────────────    │  Descrição: [PIX Rec...] │
│  PIX Recebido           │  Valor: [R$ 150,00] ⚠️   │
│  15/03/2026             │  Categoria: [Receita]    │
│  R$ 150,00              │                          │
│                         │  Confiança: 62%          │
│                         │                          │
│                         │  [Confirmar] [Corrigir]  │
│                         │  [Descartar]             │
└─────────────────────────┴──────────────────────────┘
```
