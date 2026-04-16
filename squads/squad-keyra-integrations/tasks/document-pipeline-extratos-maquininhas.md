---
task: pipelineExtratosMaquininhas()
responsavel: "@document-processor"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: 7
story_ref: "7.1.3"

Entrada:
  - campo: formatos_maquininhas
    tipo: yaml
    origem: data/maquininhas-formatos.yaml
    obrigatório: true

Saída:
  - campo: parsers
    tipo: code
    destino: src/lib/documents/parsers/card-machines/
    persistido: true

Checklist:
  - "[ ] Implementar parser CSV por operadora (layout específico)"
  - "[ ] Implementar extração de PDF por operadora"
  - "[ ] Mapear campos: data venda, valor bruto, taxa, valor líquido, parcelas"
  - "[ ] Tratar antecipação de recebíveis (valor antecipado vs original)"
  - "[ ] Tratar cancelamentos e estornos"
  - "[ ] Score de confiança por venda extraída"
  - "[ ] Reconciliar: valor bruto da maquininha = valor da comanda KEYRA"
  - "[ ] Calcular taxa efetiva cobrada pela operadora"
  - "[ ] Testes com relatórios reais de cada operadora (sanitizados)"
---

# Pipeline de Extratos de Maquininhas

## Objetivo

Implementar parsers para relatórios de vendas de operadoras de cartão brasileiras, extraindo vendas, taxas e valores líquidos.

## Operadoras Prioritárias (v1)

| Operadora | CSV | PDF | Campos Chave |
|-----------|-----|-----|-------------|
| Stone | ✅ | ✅ | data, bruto, taxa, líquido, bandeira, parcelas |
| PagSeguro | ✅ | ✅ | data, bruto, taxa, líquido, tipo |
| Mercado Pago | ✅ | ✅ | data, bruto, taxa, líquido, método |
| Cielo | ✅ | ✅ | data, bruto, taxa, líquido, lote |
| Rede | ✅ | ⚠️ | data, bruto, taxa, líquido |

## Schema de Saída (por venda)

```typescript
interface ParsedCardSale {
  date: string             // YYYY-MM-DD
  grossAmount: number      // Valor bruto (centavos)
  fee: number              // Taxa da operadora (centavos)
  netAmount: number        // Valor líquido (centavos)
  installments: number     // Número de parcelas
  cardBrand?: string       // Visa, Master, Elo, etc.
  paymentMethod: string    // Crédito, débito, PIX
  settlementDate?: string  // Data de recebimento
  confidence: number       // 0-100
}
```

## Reconciliação

```
Venda na maquininha (valor bruto) = Comanda KEYRA (valor do serviço)
Diferença = taxa da operadora (despesa financeira)
```
