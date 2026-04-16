---
task: whatsappAgendamentoLembrete()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 7
story_ref: "7.3.2"

Entrada:
  - campo: spec_whatsapp
    tipo: markdown
    origem: docs/architecture/spec-integracao-whatsapp.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/integrations/whatsapp/
    persistido: true

Checklist:
  - "[ ] Criar cliente para API WhatsApp (provider escolhido na spec)"
  - "[ ] Implementar envio de confirmação ao criar agendamento"
  - "[ ] Implementar cron de lembrete D-1 (véspera do agendamento)"
  - "[ ] Tratar respostas: SIM (confirmar), NÃO/REMARCAR (flag no agendamento)"
  - "[ ] Implementar envio de link de pagamento PIX"
  - "[ ] Rate limiting (respeitar limites do WhatsApp Business)"
  - "[ ] Janela de 24h para mensagens de sessão (regra Meta)"
  - "[ ] Fallback se envio falhar (registrar para reenvio)"
  - "[ ] Opt-out: paciente pode desativar notificações WhatsApp"
  - "[ ] Logs sem número de telefone completo (mascarar)"
  - "[ ] Testes com sandbox do provider"
---

# WhatsApp — Confirmação de Agendamento e Lembretes

## Objetivo

Implementar envio automático de mensagens WhatsApp para confirmação de agendamento, lembrete D-1 e link de pagamento.

## Fluxos

### Confirmação (ao agendar)
```
Agendamento criado → Enviar WhatsApp
  "Olá Ana, seu agendamento para Limpeza de Pele está
   confirmado para 15/03 às 14h. Responda SIM para confirmar."
  → Paciente responde SIM → status: confirmado
  → Paciente responde REMARCAR → flag para reagendar
```

### Lembrete D-1 (cron)
```
Cron diário às 18h → Buscar agendamentos de amanhã
  → Para cada: enviar lembrete WhatsApp
  → Registrar envio
```

### Link de Pagamento
```
Cobrança PIX gerada (Asaas) → Enviar WhatsApp
  "Olá Ana, segue o link para pagamento: {link}. Valor: R$ 150,00."
```
