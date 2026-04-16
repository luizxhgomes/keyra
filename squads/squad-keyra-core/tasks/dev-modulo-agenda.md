---
task: moduloAgenda()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 2
story_ref: "2.3"

Entrada:
  - campo: schema
    tipo: markdown
    origem: docs/architecture/SCHEMA.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/agenda/
    persistido: true

Checklist:
  - "[ ] Criar migration para tabelas appointments, appointment_slots, schedules"
  - "[ ] appointments: id, tenant_id, patient_id, service_id, professional_id, date, start_time, end_time, status, notes"
  - "[ ] status: agendado | confirmado | em_atendimento | realizado | cancelado | falta"
  - "[ ] Implementar RLS por tenant_id"
  - "[ ] Criar visualização diária (padrão) com slots de horário"
  - "[ ] Criar visualização semanal"
  - "[ ] Formulário de agendamento: paciente + serviço + profissional + horário"
  - "[ ] Validar conflito de horários (mesmo profissional, mesmo horário)"
  - "[ ] Ao criar agendamento, gerar receita prevista automaticamente (preço do serviço)"
  - "[ ] Transições de status com validação (agendado → confirmado → em_atendimento → realizado)"
  - "[ ] Fuso horário: America/Sao_Paulo em todas as operações de data/hora"
  - "[ ] Testes para conflito de horários e transições de status"
---

# Módulo de Agenda

## Objetivo

Implementar o módulo de agenda — coração operacional do KEYRA. A agenda é a ORIGEM de todo faturamento. Cada agendamento gera receita prevista automaticamente.

## Fluxo Principal

```
Criar Agendamento
  → Selecionar paciente
  → Selecionar serviço (preço já definido)
  → Selecionar profissional
  → Escolher data/horário
  → Validar conflitos
  → Salvar agendamento (status: agendado)
  → Gerar receita prevista (preço do serviço) ← AUTOMÁTICO
```

## Máquina de Estados

```
agendado → confirmado → em_atendimento → realizado
    ↓           ↓                             ↓
 cancelado    cancelado                  (gera comanda)
    ↓
  falta
```

## Receita Prevista

Ao criar agendamento, registrar automaticamente:
- Valor: preço do serviço
- Status: prevista
- Data: data do agendamento
- Vinculação: appointment_id

Isso alimenta o dashboard com "receita prevista do mês".

## Princípio UX

- Visualização diária como padrão (a profissional olha o dia)
- Slots de horário claros e clicáveis
- Cores por status (agendado=azul, confirmado=verde, falta=vermelho)
