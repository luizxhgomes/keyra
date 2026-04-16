---
task: reguaCobrancaInadimplencia()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 7
story_ref: "7.2.3"

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/integrations/billing/
    persistido: true

Checklist:
  - "[ ] Implementar régua de cobrança automática configurável"
  - "[ ] D+1 após vencimento: lembrete por WhatsApp/e-mail"
  - "[ ] D+3: reenvio de link PIX com novo vencimento"
  - "[ ] D+7: segunda notificação com alerta de atraso"
  - "[ ] D+15: notificação final antes de marcar como inadimplente"
  - "[ ] Configurável: dias e canais por tenant"
  - "[ ] Registrar todas as tentativas de cobrança (auditoria)"
  - "[ ] Job agendado (cron) para processar régua diariamente"
  - "[ ] Respeitar LGPD: opt-out de mensagens deve ser possível"
  - "[ ] Testes com cenários de régua completa"
---

# Régua de Cobrança para Inadimplência

## Objetivo

Implementar régua automática de cobrança para parcelas e pagamentos vencidos, com notificações progressivas por WhatsApp e/ou e-mail.

## Régua Padrão (configurável)

| Dia | Ação | Canal |
|-----|------|-------|
| D+1 | Lembrete gentil | WhatsApp |
| D+3 | Reenvio de link PIX | WhatsApp + E-mail |
| D+7 | Alerta de atraso | WhatsApp + E-mail |
| D+15 | Notificação final | WhatsApp + E-mail |
| D+30 | Marcar como inadimplente | Sistema (sem notificação) |

## Princípios

- Configurável por tenant (dias e canais)
- Opt-out respeitado (LGPD — consentimento para comunicação)
- Todas as tentativas logadas para auditoria
- Não enviar cobrança se pagamento foi registrado manualmente
