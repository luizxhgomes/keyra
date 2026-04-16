---
task: revisarIntegracoes()
responsavel: "@compliance-br"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 7
story_ref: "transversal"

Entrada:
  - campo: código_integrações
    tipo: code
    origem: src/lib/integrations/
    obrigatório: true

Saída:
  - campo: relatório_compliance
    tipo: markdown
    destino: docs/compliance/revisao-integracoes-epic7.md
    persistido: true

Checklist:
  - "[ ] Verificar que credenciais de APIs nunca estão no código (env vars)"
  - "[ ] Verificar que webhooks validam assinatura/autenticidade"
  - "[ ] Verificar que dados de extratos (CPF, conta) são mascarados nos logs"
  - "[ ] Verificar que documentos originais são criptografados em repouso"
  - "[ ] Verificar que WhatsApp respeita opt-out do paciente"
  - "[ ] Verificar que NFS-e armazena XML por 5 anos"
  - "[ ] Verificar que dados do Asaas (chave PIX) são protegidos"
  - "[ ] Verificar que retry/reenvio não gera cobranças duplicadas"
  - "[ ] Verificar TLS 1.2+ em todas as comunicações com APIs externas"
  - "[ ] Verificar que dados pessoais não são enviados para serviços desnecessários"
  - "[ ] Emitir parecer: CONFORME | NÃO CONFORME (com lista de correções)"
---

# Revisão de Compliance — Integrações Externas (Epic 7)

## Objetivo

@compliance-br (Têmis) revisa TODAS as integrações externas para conformidade com LGPD, segurança de dados e obrigações fiscais.

## Integrações a Revisar

| Integração | Dados Sensíveis | Risco |
|-----------|----------------|-------|
| Upload PDFs | Extratos bancários (conta, CPF, transações) | Alto |
| Asaas | Chave PIX, dados de cobrança | Alto |
| WhatsApp | Telefone, nome, mensagens | Médio |
| NFS-e | CNPJ, razão social, valores | Médio |

## Critérios de Conformidade

1. **Dados em trânsito:** TLS 1.2+ em todas as APIs
2. **Dados em repouso:** AES-256 para documentos e credenciais
3. **Logs:** Zero PII em logs (mascarar CPF, conta, telefone)
4. **Consentimento:** WhatsApp requer opt-in do paciente
5. **Retenção:** XMLs de NFS-e por 5 anos, documentos por período configurável
6. **Minimização:** Enviar apenas dados necessários para cada API
