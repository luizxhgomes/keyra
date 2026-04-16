# Checklist de Integração com API Externa — KEYRA

## Autenticação e Credenciais

- [ ] Credenciais armazenadas em variáveis de ambiente
- [ ] Nenhuma credencial no código-fonte ou em logs
- [ ] Ambiente de sandbox configurado para testes
- [ ] Rotação de credenciais documentada

## Comunicação

- [ ] TLS 1.2+ em todas as requisições
- [ ] Timeout configurado (não usar default infinito)
- [ ] Retry com exponential backoff implementado
- [ ] Circuit breaker implementado
- [ ] Rate limiting respeitado (não exceder limites da API)

## Webhooks (se aplicável)

- [ ] Endpoint de webhook protegido (validar assinatura/token)
- [ ] Processamento idempotente (mesma notificação 2x não duplica)
- [ ] Resposta rápida (< 5s) — processar async se necessário
- [ ] Logging de todos os webhooks recebidos (sem PII)
- [ ] Retry automático do provider considerado

## Tratamento de Erros

- [ ] Erros retryáveis vs não retryáveis separados
- [ ] Fallback definido (o que acontece se API estiver fora?)
- [ ] Alertas para falhas persistentes
- [ ] Erros não expõem detalhes internos ao usuário

## Dados e Privacidade

- [ ] Dados enviados são o mínimo necessário (minimização)
- [ ] PII mascarada em logs (CPF, telefone, conta)
- [ ] Resposta da API não armazenada com dados desnecessários
- [ ] Consentimento do usuário para envio de dados (se LGPD exigir)

## Testes

- [ ] Testes de integração com sandbox/mock
- [ ] Teste de timeout (API lenta)
- [ ] Teste de erro (API retorna 500)
- [ ] Teste de rate limit (API retorna 429)
- [ ] Teste de idempotência (mesma request 2x)
