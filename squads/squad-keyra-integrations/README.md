# KEYRA Integrations Squad

Squad responsável pela **Fase 7** do KEYRA — integrações externas (pós-MVP).

## Composição

| Agente | Persona | Papel |
|--------|---------|-------|
| `@sm` | River | Criação de stories do Epic 7 |
| `@po` | Pax | Validação de stories |
| `@dev` | Dex | Implementação de integrações |
| `@qa` | Quinn | QA de integrações externas |
| `@devops` | Gage | Infra de filas, webhooks, deploy |
| `@architect` | Aria | Spec de APIs, circuit breakers, retry |
| `@document-processor` | Íris | Pipeline OCR, parsing de extratos |
| `@finance-domain-expert` | Valéria | Reconciliação de extratos financeiros |
| `@compliance-br` | Têmis | LGPD, NFS-e, dados em trânsito |

## Workflow

`workflows/keyra-integracoes-spec-sdc.yaml` — Spec Pipeline + SDC com 3 gates:

```
@architect + @document-processor + @compliance-br (spec em paralelo)
  → @sm → @po → @dev
  → @document-processor (gate OCR) + @finance-domain-expert (gate financeiro)
  → @qa → @compliance-br (gate compliance) → @devops
```

## Escopo — Epic 7

### 7.1 Upload e Parsing de PDFs
- Upload seguro com validação e detecção de duplicatas
- Parsing de extratos bancários (OFX, CSV, PDF) — 7 bancos
- Parsing de extratos de maquininhas (CSV, PDF) — 7 operadoras
- Reconciliação automática com transações KEYRA
- Tela de revisão humana para OCR com baixa confiança

### 7.2 Integração Asaas (Pagamentos)
- PIX automático (QR Code + copia-e-cola)
- Webhooks de confirmação de pagamento
- Régua de cobrança para inadimplência

### 7.3 WhatsApp Business API
- Confirmação automática de agendamento
- Lembrete D-1 (véspera)
- Envio de link de pagamento PIX

### 7.4 NFS-e (Nota Fiscal Eletrônica)
- Especificação de requisitos por município
- Emissão automática após pagamento confirmado
- Armazenamento de XML por 5 anos

## Princípios

- **OCR é falível** — sempre score de confiança + revisão humana
- **Dados sensíveis** — NUNCA logar CPF, conta bancária, chave PIX
- **Processamento assíncrono** — uploads e emissões vão para fila
- **Idempotência** — reenvio não cria duplicatas
- **Circuit breakers** — APIs externas falham; tratar graciosamente

## Dependências

- `squad-keyra-core` — Transações, pacientes, serviços (necessários para reconciliação)

## Estrutura do Squad

```
squad-keyra-integrations/
├── squad.yaml
├── README.md
├── config/
│   ├── apis-externas.md                          # Specs de APIs (Asaas, WhatsApp, NFS-e, OCR)
│   ├── formatos-documentos.md                    # Formatos OFX, CSV, PDF por banco/operadora
│   └── retry-policy.md                           # Circuit breakers, backoff, filas
├── tasks/
│   ├── dev-upload-documentos.md                  # 7.1: Upload seguro
│   ├── document-pipeline-extratos-bancarios.md   # 7.1: Parsers bancários
│   ├── document-pipeline-extratos-maquininhas.md # 7.1: Parsers de maquininhas
│   ├── dev-reconciliacao-extratos.md             # 7.1: Reconciliação
│   ├── dev-revisao-humana-ocr.md                 # 7.1: Revisão humana
│   ├── architect-spec-integracao-asaas.md        # 7.2: Spec Asaas
│   ├── dev-integracao-asaas-pix.md               # 7.2: PIX automático
│   ├── dev-regua-cobranca-inadimplencia.md       # 7.2: Régua de cobrança
│   ├── architect-spec-integracao-whatsapp.md     # 7.3: Spec WhatsApp
│   ├── dev-whatsapp-agendamento-lembrete.md      # 7.3: Confirmação e lembretes
│   ├── compliance-spec-nfse.md                   # 7.4: Spec NFS-e
│   ├── dev-emissao-nfse.md                       # 7.4: Emissão automática
│   ├── finance-validar-reconciliacao.md          # Gate financeiro
│   └── compliance-revisar-integracoes.md         # Gate compliance
├── workflows/
│   └── keyra-integracoes-spec-sdc.yaml           # Spec Pipeline + SDC
├── checklists/
│   ├── checklist-integracao-api.md               # Validação de integração API
│   ├── checklist-parsing-documento.md            # Validação de parsing/OCR
│   └── checklist-compliance-integracao.md        # Compliance LGPD/fiscal
└── data/
    ├── bancos-formatos.yaml                      # 7 bancos × formatos × colunas
    ├── maquininhas-formatos.yaml                 # 7 operadoras × formatos × campos
    └── asaas-webhooks.yaml                       # Eventos e payloads Asaas
```

## Como Executar

```bash
# Workflow completo (spec + implementação)
@aiox-master *workflow keyra-integracoes

# Ou por sub-integração
@architect *task architect-spec-integracao-asaas   # Especificar Asaas
@document-processor *task document-pipeline-extratos-bancarios  # Projetar parsers
```
