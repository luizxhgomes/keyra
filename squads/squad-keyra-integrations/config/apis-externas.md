# APIs Externas — KEYRA Integrações

## Asaas (Pagamentos)

| Item | Valor |
|------|-------|
| **API** | REST API v3 |
| **Base URL** | `https://api.asaas.com/v3` (produção) |
| **Sandbox** | `https://sandbox.asaas.com/api/v3` |
| **Autenticação** | API Key no header `access_token` |
| **Documentação** | https://docs.asaas.com |
| **Rate Limit** | 100 req/min |
| **Webhooks** | POST para endpoint configurado, com assinatura HMAC |

## WhatsApp Business

| Item | Valor |
|------|-------|
| **Opções** | Cloud API (Meta) ou intermediador (Twilio, Z-API, Evolution) |
| **Templates** | Pré-aprovados pelo Meta (HSM) |
| **Janela** | 24h para mensagens de sessão |
| **Custo** | ~R$ 0,05-0,25 por mensagem (varia por provider) |
| **Rate Limit** | Depende do tier de qualidade do número |

## NFS-e (Intermediadores)

| Intermediador | Cobertura | Custo/nota | API |
|--------------|----------|-----------|-----|
| **eNotas** | ~5.000 municípios | ~R$ 0,15 | REST |
| **NFE.io** | ~4.000 municípios | ~R$ 0,10 | REST |
| **Focus NFe** | ~4.500 municípios | ~R$ 0,12 | REST |

## OCR (Processamento de Documentos)

| Serviço | Tipo | Custo | Precisão |
|---------|------|-------|----------|
| **Tesseract.js** | Self-hosted | Grátis | Média (70-85%) |
| **AWS Textract** | Cloud | ~$1.50/1000 pág | Alta (90-95%) |
| **Google Vision** | Cloud | ~$1.50/1000 pág | Alta (90-95%) |

**Recomendação v1:** Tesseract.js para OCR básico + AWS Textract como fallback para documentos complexos.

## Regras Gerais

- Todas as credenciais em variáveis de ambiente (`ASAAS_API_KEY`, `WHATSAPP_TOKEN`, etc.)
- TLS 1.2+ em todas as comunicações
- Circuit breaker: 5 falhas consecutivas → abrir circuito por 60s
- Retry: exponential backoff (1s, 2s, 4s, 8s, máx 3 tentativas)
- Timeout: 30s padrão para todas as APIs
