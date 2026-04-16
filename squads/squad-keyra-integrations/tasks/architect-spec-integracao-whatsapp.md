---
task: specIntegracaoWhatsapp()
responsavel: "@architect"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 7
story_ref: "7.3.1"

Saída:
  - campo: spec_whatsapp
    tipo: markdown
    destino: docs/architecture/spec-integracao-whatsapp.md
    persistido: true

Checklist:
  - "[ ] Pesquisar WhatsApp Business API (Cloud API vs On-Premise)"
  - "[ ] Avaliar intermediadores (Twilio, Z-API, Evolution API)"
  - "[ ] Definir templates de mensagem pré-aprovados pelo Meta"
  - "[ ] Projetar fluxo de confirmação de agendamento"
  - "[ ] Projetar fluxo de lembrete D-1"
  - "[ ] Projetar fluxo de envio de link de pagamento"
  - "[ ] Definir tratamento de respostas do paciente (sim/não/remarcar)"
  - "[ ] Definir rate limits e janelas de envio (LGPD + regras Meta)"
  - "[ ] Documentar custos por mensagem por provider"
  - "[ ] Definir fallback (se WhatsApp falhar → SMS ou e-mail)"
---

# Especificação da Integração WhatsApp Business

## Objetivo

Especificar a integração com WhatsApp Business API para comunicação automática com pacientes: confirmação de agendamento, lembretes e cobranças.

## Mensagens Planejadas

| Mensagem | Trigger | Template |
|----------|---------|----------|
| Confirmação de agendamento | Ao criar agendamento | "Olá {nome}, seu agendamento para {serviço} está confirmado para {data} às {hora}. Responda SIM para confirmar." |
| Lembrete D-1 | Cron diário (véspera) | "Olá {nome}, lembrete: amanhã às {hora} você tem {serviço}. Precisar remarcar? Responda REMARCAR." |
| Link de pagamento | Ao gerar cobrança PIX | "Olá {nome}, segue o link para pagamento de {serviço}: {link_pix}. Valor: R$ {valor}." |

## Decisões a Tomar

1. WhatsApp Cloud API (Meta direto) vs intermediador (Twilio, Z-API)?
2. Custo por mensagem aceitável?
3. Resposta automática (chatbot simples) ou apenas envio?
