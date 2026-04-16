# Checklist de Compliance para Integrações — KEYRA

## LGPD — Dados em Trânsito

- [ ] TLS 1.2+ em todas as comunicações com APIs externas
- [ ] Dados pessoais minimizados (enviar apenas o necessário)
- [ ] Consentimento obtido antes de enviar dados para terceiros
- [ ] Contrato de processamento de dados com cada provider (DPA)

## LGPD — Dados em Repouso

- [ ] Documentos criptografados (AES-256) em Supabase Storage
- [ ] Credenciais de APIs criptografadas (variáveis de ambiente)
- [ ] XMLs de NFS-e armazenados por 5 anos (CTN Art. 173)
- [ ] Documentos de extratos com política de retenção definida

## LGPD — Direitos do Titular

- [ ] Exclusão de dados: documentos podem ser deletados (exceto fiscais)
- [ ] Portabilidade: transações importadas são exportáveis
- [ ] Acesso: paciente pode ver NFS-e emitidas em seu nome

## WhatsApp — Regras Específicas

- [ ] Opt-in explícito do paciente para receber mensagens
- [ ] Opt-out funcional (paciente pode desativar)
- [ ] Templates de mensagem pré-aprovados pelo Meta
- [ ] Janela de 24h respeitada para mensagens de sessão
- [ ] Número de telefone mascarado nos logs

## Asaas — Regras Específicas

- [ ] Chave PIX do paciente nunca logada
- [ ] Webhooks validados por assinatura HMAC
- [ ] Cobranças duplicadas impossíveis (idempotência)
- [ ] Estornos tratados corretamente no KEYRA

## NFS-e — Regras Fiscais

- [ ] Alíquota de ISS configurável (nunca hardcodada)
- [ ] CNAE correto para serviços de estética
- [ ] XML armazenado por 5 anos mínimo
- [ ] Cancelamento de NFS-e implementado
- [ ] Dados fiscais do tenant validados antes de emitir

## Auditoria

- [ ] Todos os webhooks recebidos logados (sem PII)
- [ ] Todas as emissões de NFS-e logadas
- [ ] Todas as mensagens WhatsApp enviadas logadas
- [ ] Todas as cobranças Asaas logadas
- [ ] Logs retidos por mínimo 6 meses
