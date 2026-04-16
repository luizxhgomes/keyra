---
task: mapearRequisitosLgpd()
responsavel: "@compliance-br"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: prd
    tipo: markdown
    origem: docs/prd/keyra-prd.md
    obrigatório: true

  - campo: schema
    tipo: markdown
    origem: docs/architecture/SCHEMA.md
    obrigatório: false

  - campo: dados_domínio
    tipo: yaml
    origem: data/dominio-keyra.yaml
    obrigatório: true

Saída:
  - campo: mapa_conformidade
    tipo: markdown
    destino: docs/compliance/conformidade-keyra.md
    persistido: true

Checklist:
  - "[ ] Mapear todos os dados pessoais coletados pelo KEYRA"
  - "[ ] Classificar dados: pessoais, sensíveis (saúde), financeiros"
  - "[ ] Definir base legal para cada tipo de tratamento (LGPD Art. 7°)"
  - "[ ] Projetar fluxo de consentimento (coleta, armazenamento, revogação)"
  - "[ ] Definir política de retenção (fiscal: 5 anos, operacional, pessoal)"
  - "[ ] Projetar direito ao esquecimento (o que pode e o que não pode deletar)"
  - "[ ] Mapear regimes fiscais suportados (MEI, Simples, Lucro Presumido)"
  - "[ ] Definir regras tributárias configuráveis (ISS, PIS, COFINS)"
  - "[ ] Definir requisitos de NFS-e (estratégia de integração)"
  - "[ ] Documentar requisitos de criptografia (em trânsito e em repouso)"
  - "[ ] Definir isolamento de dados multi-tenant"
---

# Mapear Requisitos de LGPD e Conformidade Fiscal

## Objetivo

Mapear todos os requisitos de conformidade legal do KEYRA: LGPD para proteção de dados e regras fiscais brasileiras para o nicho de estética.

## Dados Pessoais no KEYRA

| Categoria | Exemplos | Classificação LGPD |
|-----------|----------|-------------------|
| Identificação | Nome, CPF, telefone, e-mail | Dados pessoais |
| Saúde | Procedimentos estéticos, histórico | Dados sensíveis (Art. 11) |
| Financeiro | Transações, extratos, faturamento | Dados pessoais |
| Imagens | Fotos antes/depois | Dados sensíveis |
| Fiscal | CNPJ, regime, NFS-e | Dados pessoais |

## Regimes Fiscais a Suportar

| Regime | Faturamento | Impostos |
|--------|------------|----------|
| MEI | Até R$ 81 mil/ano | DAS fixo (~R$ 70/mês) |
| Simples Nacional | Até R$ 4,8 MM/ano | DAS variável (Anexo III ou V) |
| Lucro Presumido | Sem limite | IRPJ + CSLL + PIS + COFINS + ISS |

## Princípios Obrigatórios

- Privacidade por design — embutida na arquitetura
- Coleta mínima — apenas o necessário
- Alíquotas configuráveis — nunca hardcodadas
- Retenção fiscal de 5 anos — Código Tributário Nacional
- Criptografia AES-256 em repouso, TLS 1.2+ em trânsito
