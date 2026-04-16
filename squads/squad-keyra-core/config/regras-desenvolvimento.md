# Regras de Desenvolvimento — KEYRA Core

## Fluxo Obrigatório

```
@sm (criar story) → @po (validar) → @dev (implementar)
  → @finance-domain-expert (validar lógica financeira) ← GATE EXTRA
  → @qa (QA gate) → @devops (push/PR)
```

## Regra do Gate Financeiro

**TODA story que envolva lógica financeira** deve passar pela validação de @finance-domain-expert (Valéria) ANTES do QA gate de @qa (Quinn).

Stories que ativam o gate financeiro:
- Qualquer cálculo de preço, custo ou margem
- Geração de comanda ou transação
- DRE ou relatório financeiro
- Dashboard com métricas financeiras
- Rateio de custos
- Reconhecimento de receita

## Regra de Compliance

@compliance-br (Têmis) faz revisão transversal ao final de cada Epic:
- Epic 2: Dados pessoais de pacientes (CPF, telefone)
- Epic 3: Transações financeiras (dados pessoais)
- Epic 4: Dashboard e DRE (agregações que não expõem PII)

## Ordem de Implementação

### Epic 2 (pré-requisito para tudo)
```
data-engineer-migrations-core → dev-crud-pacientes
                              → dev-crud-servicos
                              → dev-modulo-agenda
```

### Epic 3 (depende do Epic 2)
```
dev-comanda-automatica → dev-transacao-financeira
dev-custos-fixos-variaveis
dev-rateio-insumos
→ finance-validar-automacao-financeira (gate)
```

### Epic 4 (depende dos Epics 2 e 3)
```
dev-dre-basica → dev-dre-por-servico
dev-dashboard-numerico
dev-lucro-por-profissional
→ finance-validar-dre-dashboard (gate)
→ compliance-revisar-dados-pessoais (transversal)
```
