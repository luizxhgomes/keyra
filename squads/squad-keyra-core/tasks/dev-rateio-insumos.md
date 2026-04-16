---
task: rateioInsumos()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 3
story_ref: "3.4"

Entrada:
  - campo: schema
    tipo: markdown
    origem: docs/architecture/SCHEMA.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/estoque/
    persistido: true

Checklist:
  - "[ ] Criar tela de cadastro de insumos (nome, unidade, custo unitário, estoque atual)"
  - "[ ] Vincular insumos aos serviços (quantidade por serviço)"
  - "[ ] Baixa automática de estoque ao gerar comanda"
  - "[ ] Alerta de estoque baixo (threshold configurável)"
  - "[ ] Registro de movimentações (entrada, saída, ajuste)"
  - "[ ] Custo médio ponderado para insumos com preço variável"
  - "[ ] Valores em centavos inteiros"
  - "[ ] Testes: comanda → baixa estoque → atualização de custo variável"
---

# Rateio de Insumos e Gestão de Estoque

## Objetivo

Implementar a gestão de estoque de insumos com baixa automática ao gerar comanda e cálculo de custo variável por serviço.

## Fluxo

```
Cadastrar insumo (Produto X, R$ 15/unidade, 50 em estoque)
  → Vincular ao serviço (Limpeza de Pele usa 1 unidade)
  → Atendimento realizado → Comanda gerada
     → Baixa automática: estoque 50 → 49
     → Custo variável registrado: R$ 15
  → Se estoque < threshold → Alerta
```

## Movimentações

| Tipo | Origem | Efeito |
|------|--------|--------|
| Entrada | Compra de fornecedor | +estoque |
| Saída | Comanda automática | -estoque |
| Ajuste | Correção manual | ±estoque |
