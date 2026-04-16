---
task: pipelineExtratosBancarios()
responsavel: "@document-processor"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 7
story_ref: "7.1.2"

Entrada:
  - campo: formatos_bancos
    tipo: yaml
    origem: data/bancos-formatos.yaml
    obrigatório: true

Saída:
  - campo: parsers
    tipo: code
    destino: src/lib/documents/parsers/banks/
    persistido: true

Checklist:
  - "[ ] Implementar parser OFX genérico (padrão Open Financial Exchange)"
  - "[ ] Implementar parser CSV por banco (layout específico)"
  - "[ ] Implementar extração de texto de PDF por banco"
  - "[ ] Para cada banco: mapear colunas → schema de transação KEYRA"
  - "[ ] Tratar encoding (ISO-8859-1 vs UTF-8 nos OFX/CSV)"
  - "[ ] Tratar formatos de data brasileiros (DD/MM/AAAA)"
  - "[ ] Tratar valores monetários (1.234,56 → 123456 centavos)"
  - "[ ] Score de confiança por transação extraída"
  - "[ ] Se PDF sem texto → OCR (Tesseract/cloud) → parser"
  - "[ ] Categorização automática: descrição → categoria KEYRA"
  - "[ ] Testes com arquivos reais de cada banco (sanitizados)"
---

# Pipeline de Extratos Bancários

## Objetivo

Implementar parsers para extratos bancários brasileiros em múltiplos formatos (OFX, CSV, PDF) com categorização automática.

## Bancos Prioritários (v1)

| Banco | OFX | CSV | PDF |
|-------|-----|-----|-----|
| Itaú | ✅ | ✅ | ✅ |
| Bradesco | ✅ | ✅ | ✅ |
| Nubank | ❌ | ✅ | ✅ |
| Inter | ❌ | ✅ | ✅ |
| Santander | ✅ | ✅ | ✅ |

## Fluxo de Parsing

```
Documento recebido da fila
  → Detectar formato (OFX/CSV/PDF)
  → Se OFX: parser genérico (padrão)
  → Se CSV: identificar banco pelo header → parser específico
  → Se PDF: extrair texto → se falhar → OCR → parser específico
  → Para cada transação extraída:
     ├── Data, descrição, valor, saldo
     ├── Score de confiança (0-100)
     └── Categoria sugerida (mapeamento descrição → KEYRA)
  → Retornar lista de transações estruturadas
```

## Schema de Saída (por transação)

```typescript
interface ParsedTransaction {
  date: string           // YYYY-MM-DD
  description: string    // Descrição original
  amount: number         // Centavos (positivo=crédito, negativo=débito)
  balance?: number       // Saldo após transação (centavos)
  confidence: number     // 0-100
  suggestedCategory: string  // Categoria KEYRA sugerida
  rawLine?: string       // Linha original para debug
}
```
