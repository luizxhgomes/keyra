---
task: specNfse()
responsavel: "@compliance-br"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 7
story_ref: "7.4.1"

Saída:
  - campo: spec_nfse
    tipo: markdown
    destino: docs/compliance/spec-nfse-keyra.md
    persistido: true

Checklist:
  - "[ ] Pesquisar padrão ABRASF de NFS-e (versão 2.04)"
  - "[ ] Mapear diferenças por município (SP, RJ, BH, Curitiba, ...)"
  - "[ ] Avaliar intermediadores (eNotas, NFE.io, Focus NFe)"
  - "[ ] Definir campos obrigatórios da NFS-e para serviços de estética"
  - "[ ] Mapear CNAE de estética para códigos de serviço"
  - "[ ] Definir fluxo: quando emitir (após pagamento confirmado)"
  - "[ ] Definir tratamento de cancelamento de NFS-e"
  - "[ ] Requisitos de armazenamento (XML por 5 anos — CTN)"
  - "[ ] Definir estratégia: integração direta ou via intermediador"
  - "[ ] Documentar alíquotas de ISS por município (configuráveis)"
---

# Especificação de NFS-e — Nota Fiscal de Serviço Eletrônica

## Objetivo

Especificar os requisitos de emissão de NFS-e para serviços de estética, considerando as variações por município e as obrigações fiscais.

## Contexto

- NFS-e é municipal — cada prefeitura tem sua API/formato
- Padrão ABRASF unifica parte do layout, mas há variações
- Intermediadores (eNotas, NFE.io) abstraem as diferenças
- CNAE de estética: 9602-5/01 (Cabeleireiros) e 9602-5/02 (Atividades de estética)

## Fluxo de Emissão

```
Pagamento confirmado (transação status: confirmada)
  → Verificar se tenant emite NFS-e (configurável)
  → Montar XML/JSON da NFS-e
     ├── Prestador: dados do tenant (CNPJ, razão social, endereço)
     ├── Tomador: dados do paciente (CPF/CNPJ, nome)
     ├── Serviço: descrição, valor, CNAE, alíquota ISS
     └── Competência: data do atendimento
  → Enviar para API da prefeitura ou intermediador
  → Receber número da NFS-e
  → Armazenar XML por 5 anos
  → Disponibilizar PDF para paciente
```

## Decisão: Intermediador vs Direto

| Critério | Direto | Intermediador |
|----------|--------|--------------|
| Complexidade | Alta (N prefeituras) | Baixa (1 API) |
| Custo | Zero (só infra) | R$ 0,10-0,50 por nota |
| Cobertura | Limitada | Nacional |
| Manutenção | Alta (cada prefeitura muda) | Baixa (terceiro mantém) |

**Recomendação:** Intermediador na v1 (eNotas ou NFE.io).
