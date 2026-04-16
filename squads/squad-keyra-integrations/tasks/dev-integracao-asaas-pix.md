---
task: integracaoAsaasPix()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 7
story_ref: "7.2.2"

Entrada:
  - campo: spec_asaas
    tipo: markdown
    origem: docs/architecture/spec-integracao-asaas.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/integrations/asaas/
    persistido: true

Checklist:
  - "[ ] Criar cliente HTTP para API Asaas (com retry e circuit breaker)"
  - "[ ] Implementar criação de cobrança PIX (QR Code + copia-e-cola)"
  - "[ ] Implementar endpoint de webhook para confirmação de pagamento"
  - "[ ] Validar assinatura do webhook (segurança)"
  - "[ ] Ao receber confirmação: atualizar transação KEYRA para 'confirmada'"
  - "[ ] Implementar consulta de status de cobrança"
  - "[ ] Tratar erros: timeout, rate limit, API indisponível"
  - "[ ] Credenciais em variáveis de ambiente (nunca no código)"
  - "[ ] Ambiente de sandbox para testes"
  - "[ ] Logs sem dados sensíveis (mascarar chave PIX)"
  - "[ ] Testes de integração com sandbox Asaas"
---

# Integração Asaas — PIX Automático

## Objetivo

Implementar a integração com Asaas para geração automática de cobranças PIX ao confirmar comanda no KEYRA.

## Fluxo

```
Comanda confirmada → Forma: PIX
  → POST /v3/payments (Asaas)
     { billingType: "PIX", value: 150.00, customer: "cus_xxx" }
  → Resposta: QR Code (base64) + copia-e-cola (string)
  → Exibir para paciente (tela ou WhatsApp)
  → Webhook: POST /api/webhooks/asaas
     { event: "PAYMENT_CONFIRMED", payment: { id, value, ... } }
  → Atualizar transação KEYRA: status → confirmada
```

## Segurança

- API Key armazenada em variável de ambiente
- Webhook validado por assinatura HMAC
- Credenciais nunca logadas
- Chave PIX do paciente mascarada nos logs
