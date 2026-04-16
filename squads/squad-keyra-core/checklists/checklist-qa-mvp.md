# Checklist de QA do MVP — KEYRA

> Usado por @qa (Quinn) no QA gate final de cada Epic

## Epic 2 — Catálogo + Agenda

### Pacientes
- [ ] CRUD completo funciona (criar, ler, editar, excluir)
- [ ] Soft delete implementado (deleted_at)
- [ ] Busca por nome e CPF funciona
- [ ] Validações de CPF e telefone ativas
- [ ] RLS impede acesso cross-tenant

### Serviços
- [ ] CRUD de serviços com categorias
- [ ] Preço, custo e margem exibidos corretamente
- [ ] Margem calculada automaticamente ao salvar
- [ ] Valores em centavos (verificar que não são float)

### Agenda
- [ ] Visualização diária e semanal
- [ ] Agendamento com paciente + serviço + profissional
- [ ] Conflito de horários detectado e bloqueado
- [ ] Transições de status válidas (sem pular etapas)
- [ ] Receita prevista gerada ao criar agendamento
- [ ] Fuso horário America/Sao_Paulo em todas as datas

## Epic 3 — Automação Financeira

### Comanda
- [ ] Comanda gerada automaticamente ao finalizar atendimento
- [ ] Insumos deduzidos do estoque automaticamente
- [ ] Comanda permite ajustes antes de confirmar

### Transação
- [ ] Transação gerada ao registrar pagamento
- [ ] Formas de pagamento funcionam (dinheiro, PIX, cartão)
- [ ] Parcelamento gera contas a receber com datas corretas

### Custos
- [ ] Custos fixos e variáveis cadastrados separadamente
- [ ] Rateio de fixos por serviço calculado corretamente
- [ ] Estoque com baixa automática e alerta de mínimo

### Gate Financeiro
- [ ] @finance-domain-expert APROVOU todas as fórmulas

## Epic 4 — Dashboard + Lucro

### DRE
- [ ] DRE básica gerada corretamente por período
- [ ] DRE por serviço com rateio correto
- [ ] Regime de competência aplicado
- [ ] Totais consistentes (vertical e horizontal)

### Dashboard
- [ ] Tela única sem scroll excessivo
- [ ] ZERO gráficos — apenas números absolutos
- [ ] Comparativos textuais funcionando
- [ ] Alertas de margem negativa e faltas

### Gate Financeiro
- [ ] @finance-domain-expert APROVOU DRE e dashboard

## Transversal

- [ ] @compliance-br REVISOU dados pessoais e conformidade
- [ ] Nenhum CPF em logs
- [ ] RLS ativo em todas as tabelas
- [ ] Testes unitários passando (mínimo 80% coverage em lib/finance/)
- [ ] Testes e2e para fluxos críticos (agendamento → pagamento → DRE)
- [ ] Lint e typecheck passando
