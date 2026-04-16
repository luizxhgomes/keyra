---
task: definirPipelineOcr()
responsavel: "@document-processor"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: prd
    tipo: markdown
    origem: docs/prd/keyra-prd.md
    obrigatório: true

  - campo: arquitetura
    tipo: markdown
    origem: docs/architecture/keyra-architecture.md
    obrigatório: false

Saída:
  - campo: pipeline_spec
    tipo: markdown
    destino: docs/architecture/pipeline-ocr-keyra.md
    persistido: true

Checklist:
  - "[ ] Definir formatos suportados na v1 (OFX, CSV, PDF)"
  - "[ ] Listar bancos prioritários (Itaú, Bradesco, Nubank, Inter)"
  - "[ ] Listar maquininhas prioritárias (Stone, PagSeguro, Mercado Pago)"
  - "[ ] Projetar fluxo de upload (validação, fila, processamento)"
  - "[ ] Definir estratégia de OCR (Tesseract vs serviço cloud)"
  - "[ ] Projetar score de confiança e limites de revisão humana"
  - "[ ] Definir mapeamento de categorias (extrato → categorias KEYRA)"
  - "[ ] Projetar detecção de duplicatas"
  - "[ ] Definir requisitos de segurança (PII, LGPD)"
  - "[ ] Documentar arquitetura do pipeline com diagrama de fluxo"
---

# Definir Pipeline de OCR do KEYRA

## Objetivo

Projetar a arquitetura completa do pipeline de processamento de documentos financeiros: upload, extração, validação, categorização e reconciliação.

## Escopo da v1

**Bancos prioritários:** Itaú, Bradesco, Nubank, Inter, Santander
**Maquininhas prioritárias:** Stone, PagSeguro, Mercado Pago
**Formatos:** OFX (extrato bancário), CSV (maquininhas), PDF (ambos)

## Arquitetura do Pipeline

```
Upload → Validar (MIME, tamanho, vírus)
  → Classificar (bancário? maquininha? recibo?)
  → Pré-processar (se imagem: desinclinação, contraste)
  → Extrair (texto do PDF / OCR de imagem)
  → Parsear (parser específico por formato/banco)
  → Validar (score de confiança, tipos de dados)
  → Revisar (se confiança < 80% → revisão humana)
  → Armazenar (dados estruturados + documento original)
  → Reconciliar (cruzar com registros do KEYRA)
```

## Decisões a Tomar

1. Tesseract (self-hosted) vs AWS Textract vs Google Vision?
2. Processamento síncrono para arquivos pequenos ou sempre assíncrono?
3. Armazenar documentos originais em Supabase Storage ou S3?
4. Fila de processamento: pg_boss (PostgreSQL) ou serviço externo?
