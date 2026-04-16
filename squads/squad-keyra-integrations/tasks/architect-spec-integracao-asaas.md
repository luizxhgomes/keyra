---
task: specIntegracaoAsaas()
responsavel: "@architect"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 7
story_ref: "7.2.1"

Saída:
  - campo: spec_asaas
    tipo: markdown
    destino: docs/architecture/spec-integracao-asaas.md
    persistido: true

Checklist:
  - "[ ] Pesquisar documentação da API Asaas (REST API v3)"
  - "[ ] Definir fluxo de autenticação (API Key, sandbox vs produção)"
  - "[ ] Mapear endpoints necessários: cobranças, PIX, boletos, webhooks"
  - "[ ] Projetar fluxo de criação de cobrança PIX automática"
  - "[ ] Projetar fluxo de webhooks (confirmação de pagamento)"
  - "[ ] Definir retry policy e circuit breaker para API Asaas"
  - "[ ] Definir armazenamento de credenciais (variáveis de ambiente)"
  - "[ ] Projetar tratamento de erros (timeout, rate limit, indisponibilidade)"
  - "[ ] Definir ambiente de sandbox para testes"
  - "[ ] Documentar payloads de request e response"
---

# Especificação da Integração Asaas

## Objetivo

Especificar a integração com a API Asaas para pagamentos automatizados: PIX, boleto e cobranças recorrentes.

## Funcionalidades

| Funcionalidade | Endpoint Asaas | Prioridade |
|---------------|---------------|-----------|
| Gerar cobrança PIX | POST /v3/payments | Alta |
| Gerar boleto | POST /v3/payments | Média |
| Webhook de pagamento | POST /webhook (nosso endpoint) | Alta |
| Consultar status | GET /v3/payments/{id} | Alta |
| Estornar cobrança | POST /v3/payments/{id}/refund | Baixa |

## Fluxo PIX Automático

```
Comanda confirmada (KEYRA)
  → Criar cobrança PIX (Asaas API)
  → Retornar QR Code + copia-e-cola
  → Exibir para paciente
  → Webhook: pagamento confirmado
  → Atualizar transação no KEYRA (status: confirmada)
```

## Decisões a Tomar

1. Asaas vs outras gateways (Mercado Pago, PagBank)?
2. Credenciais por tenant ou conta master com split?
3. Webhook com retry automático ou fila de processamento?
