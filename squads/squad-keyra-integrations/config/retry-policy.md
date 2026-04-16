# Retry Policy e Circuit Breakers — KEYRA Integrações

## Política de Retry (padrão)

```yaml
retry:
  maxAttempts: 3
  backoff: exponential
  initialDelay: 1000     # 1 segundo
  maxDelay: 8000          # 8 segundos
  multiplier: 2           # 1s → 2s → 4s
  retryableErrors:
    - ECONNRESET
    - ETIMEDOUT
    - 429   # Too Many Requests
    - 500   # Internal Server Error
    - 502   # Bad Gateway
    - 503   # Service Unavailable
  nonRetryableErrors:
    - 400   # Bad Request (nosso erro)
    - 401   # Unauthorized (credencial errada)
    - 403   # Forbidden
    - 404   # Not Found
    - 422   # Unprocessable Entity
```

## Circuit Breaker (por integração)

```yaml
circuitBreaker:
  failureThreshold: 5      # 5 falhas consecutivas → abrir
  successThreshold: 3       # 3 sucessos → fechar
  resetTimeout: 60000       # 60 segundos em estado aberto
  halfOpenMaxRequests: 1    # 1 request de teste no half-open

  states:
    closed: "Normal — todas as requests passam"
    open: "Bloqueado — todas as requests falham imediatamente"
    halfOpen: "Teste — 1 request de teste para verificar recuperação"
```

## Timeouts por Integração

| Integração | Timeout | Retry | Justificativa |
|-----------|---------|-------|---------------|
| Asaas (pagamentos) | 30s | 3x | API estável, mas pagamento é crítico |
| WhatsApp | 15s | 2x | Mensagem pode ser reenviada depois |
| NFS-e (intermediador) | 60s | 3x | Prefeituras são lentas |
| OCR (cloud) | 120s | 2x | Processamento pesado |
| Supabase Storage | 30s | 3x | Upload de documentos |

## Fila de Processamento

```yaml
queue:
  provider: pg_boss     # Fila baseada em PostgreSQL
  retryLimit: 3         # Máximo de retentativas na fila
  retryDelay: 300       # 5 minutos entre retentativas
  expireIn: "24 hours"  # Job expira após 24h
  retentionDays: 30     # Manter jobs completados por 30 dias

  queues:
    document-processing:
      concurrency: 3     # 3 documentos em paralelo
      priority: normal
    nfse-emission:
      concurrency: 2
      priority: normal
    whatsapp-messages:
      concurrency: 5     # Mensagens são rápidas
      priority: high
    asaas-webhooks:
      concurrency: 10    # Webhooks precisam ser rápidos
      priority: critical
```

## Idempotência

- **Webhooks Asaas:** Verificar `payment.id` — se já processado, ignorar (HTTP 200)
- **Upload de documentos:** Hash SHA-256 — se já existe, rejeitar
- **NFS-e:** Verificar se transação já tem NFS-e vinculada antes de emitir
- **WhatsApp:** Verificar se mensagem já foi enviada para este agendamento
