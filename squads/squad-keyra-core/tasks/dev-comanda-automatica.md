---
task: comandaAutomatica()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 3
story_ref: "3.1"

Entrada:
  - campo: modelo_financeiro
    tipo: markdown
    origem: docs/architecture/modelo-financeiro-keyra.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/finance/comanda.ts
    persistido: true

Checklist:
  - "[ ] Ao marcar atendimento como 'realizado', gerar comanda automática"
  - "[ ] Comanda = registro de serviço prestado com: serviço, paciente, profissional, valor, data"
  - "[ ] Vincular comanda ao agendamento (appointment_id)"
  - "[ ] Registrar insumos consumidos automaticamente (se configurados no serviço)"
  - "[ ] Dar baixa no estoque dos insumos consumidos"
  - "[ ] Valores em centavos inteiros"
  - "[ ] Tela de confirmação: mostrar serviço, valor e insumos antes de finalizar"
  - "[ ] Permitir ajustes manuais na comanda antes de confirmar"
  - "[ ] Validação: @finance-domain-expert revisa lógica de geração"
  - "[ ] Testes unitários para geração automática"
  - "[ ] Testes de integração: atendimento → comanda → baixa estoque"
---

# Comanda Automática

## Objetivo

Implementar a geração automática de comanda ao finalizar um atendimento. A comanda é o registro que conecta a operação (agenda) ao financeiro.

## Fluxo

```
Atendimento marcado como "realizado"
  → Gerar comanda automática
     ├── Serviço prestado (nome, preço)
     ├── Insumos consumidos (do cadastro do serviço)
     ├── Profissional responsável
     └── Paciente atendido
  → Dar baixa no estoque (insumos)
  → Tela de confirmação
  → Comanda confirmada → aguardando pagamento
```

## Regra de Negócio

- Comanda é gerada AUTOMATICAMENTE — zero lançamento manual
- Insumos são deduzidos do estoque automaticamente
- A comanda fica "aberta" até o pagamento ser registrado
- Uma comanda pode ter múltiplos serviços (se o atendimento incluiu mais de um)
