---
task: revisarDadosPessoais()
responsavel: "@compliance-br"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: "2-4"
story_ref: "transversal"

Entrada:
  - campo: código_fonte
    tipo: code
    origem: src/
    obrigatório: true

  - campo: migrações
    tipo: sql
    origem: supabase/migrations/
    obrigatório: true

Saída:
  - campo: relatório_compliance
    tipo: markdown
    destino: docs/compliance/revisao-dados-pessoais-mvp.md
    persistido: true

Checklist:
  - "[ ] Verificar que CPF nunca aparece em logs (mascarar)"
  - "[ ] Verificar que dados de saúde (procedimentos) têm consentimento específico"
  - "[ ] Verificar criptografia em repouso para campos sensíveis"
  - "[ ] Verificar RLS ativo em todas as tabelas (isolamento multi-tenant)"
  - "[ ] Verificar que alíquotas fiscais são configuráveis (não hardcodadas)"
  - "[ ] Verificar política de retenção de dados fiscais (5 anos)"
  - "[ ] Verificar que exclusão de paciente respeita retenção fiscal"
  - "[ ] Verificar trilha de auditoria para acesso a dados sensíveis"
  - "[ ] Verificar sanitização de inputs em formulários"
  - "[ ] Emitir parecer: CONFORME | NÃO CONFORME (com lista de correções)"
---

# Revisão de Dados Pessoais e Conformidade — MVP

## Objetivo

@compliance-br (Têmis) revisa o MVP inteiro para garantir conformidade com LGPD e regras fiscais brasileiras. Task transversal que cobre todos os Epics.

## Pontos Críticos

| Dado | Classificação | Proteção Necessária |
|------|--------------|-------------------|
| CPF | Pessoal | Mascarar em logs, criptografia |
| Telefone | Pessoal | Criptografia opcional |
| Procedimentos | Sensível (saúde) | Consentimento específico |
| Transações | Pessoal | RLS, retenção 5 anos |
| Fotos antes/depois | Sensível | Consentimento específico (futuro) |

## Regras Fiscais

- Alíquotas NUNCA hardcodadas — configuráveis por regime
- Dados fiscais retidos por 5 anos (CTN Art. 173)
- Exclusão de paciente: manter dados fiscais, anonimizar pessoais
