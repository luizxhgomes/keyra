---
task: uploadDocumentos()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 7
story_ref: "7.1.1"

Entrada:
  - campo: pipeline_spec
    tipo: markdown
    origem: docs/architecture/pipeline-ocr-keyra.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/documentos/
    persistido: true

Checklist:
  - "[ ] Criar tela de upload com drag-and-drop"
  - "[ ] Validar tipo MIME antes do upload (PDF, CSV, OFX, imagens)"
  - "[ ] Validar tamanho máximo (configurável, padrão 10MB)"
  - "[ ] Verificação de vírus/malware antes de processar"
  - "[ ] Armazenar documento original em Supabase Storage (criptografado)"
  - "[ ] Enviar para fila de processamento assíncrono"
  - "[ ] Exibir status de processamento (enviado → processando → concluído/erro)"
  - "[ ] Detectar duplicatas por hash SHA-256 do arquivo"
  - "[ ] Listar documentos enviados com status e data"
  - "[ ] PII: não logar conteúdo do documento nos logs"
  - "[ ] Testes: upload válido, MIME inválido, duplicata, tamanho excedido"
---

# Upload de Documentos

## Objetivo

Implementar a interface e o fluxo de upload de documentos financeiros (extratos bancários e de maquininhas) com validação, armazenamento seguro e envio para fila de processamento.

## Fluxo

```
Usuário arrasta arquivo
  → Validar (MIME, tamanho)
  → Verificar duplicata (hash SHA-256)
  → Armazenar em Supabase Storage (criptografado)
  → Enviar para fila de processamento
  → Exibir status: "Processando..."
  → Webhook/polling: "Concluído" ou "Erro"
```

## Formatos Aceitos

| Formato | MIME | Uso |
|---------|------|-----|
| PDF | application/pdf | Extratos bancários e maquininhas |
| CSV | text/csv | Extratos exportados |
| OFX | application/x-ofx | Extratos bancários (padrão) |
| JPEG/PNG | image/jpeg, image/png | Fotos de comprovantes (OCR) |

## Dependências

- Supabase Storage configurado
- Fila de processamento (@devops)
- Pipeline de parsing (@document-processor)
