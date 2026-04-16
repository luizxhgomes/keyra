---
task: emissaoNfse()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 7
story_ref: "7.4.2"

Entrada:
  - campo: spec_nfse
    tipo: markdown
    origem: docs/compliance/spec-nfse-keyra.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/integrations/nfse/
    persistido: true

Checklist:
  - "[ ] Criar cliente para API do intermediador escolhido (eNotas/NFE.io)"
  - "[ ] Implementar emissão automática após pagamento confirmado"
  - "[ ] Configuração por tenant: emitir NFS-e sim/não, dados fiscais"
  - "[ ] Mapear serviços KEYRA → código de serviço municipal"
  - "[ ] Alíquota ISS configurável por município (nunca hardcodada)"
  - "[ ] Armazenar XML da NFS-e por 5 anos (retenção fiscal)"
  - "[ ] Gerar PDF da NFS-e para download pelo paciente"
  - "[ ] Tratar cancelamento de NFS-e"
  - "[ ] Tratar erros da API: rejeição, timeout, dados inválidos"
  - "[ ] Fila assíncrona para emissão (não bloquear fluxo de pagamento)"
  - "[ ] Testes com sandbox do intermediador"
---

# Emissão de NFS-e

## Objetivo

Implementar a emissão automática de NFS-e após confirmação de pagamento, usando intermediador para abstrair diferenças municipais.

## Fluxo

```
Pagamento confirmado (webhook Asaas ou registro manual)
  → Verificar se tenant emite NFS-e
  → Enviar para fila de emissão
  → Worker processa:
     ├── Montar dados da nota
     ├── Enviar para intermediador (eNotas/NFE.io)
     ├── Receber resposta (número, XML)
     ├── Armazenar XML em Supabase Storage
     └── Atualizar transação com número da NFS-e
  → Disponibilizar PDF
```

## Configuração por Tenant

```typescript
interface TenantFiscalConfig {
  emitirNfse: boolean
  cnpj: string
  razaoSocial: string
  municipio: string        // Código IBGE
  regimeFiscal: 'mei' | 'simples' | 'lucro_presumido'
  aliquotaIss: number      // Percentual (ex: 5.0)
  cnaeServico: string      // Ex: "9602-5/02"
  intermediadorApiKey: string  // Variável de ambiente
}
```
