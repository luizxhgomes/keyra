---
task: precificacaoPacotes()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 5
story_ref: "5.4"

Entrada:
  - campo: fórmulas
    tipo: markdown
    origem: docs/architecture/formulas-precificacao-keyra.md
    obrigatório: true

Saída:
  - campo: componentes
    tipo: code
    destino: src/app/(auth)/servicos/pacotes/
    persistido: true

Checklist:
  - "[ ] Criar CRUD de pacotes (nome, serviço base, quantidade de sessões, desconto)"
  - "[ ] Calcular preço do pacote: preço unitário × sessões × (1 - desconto)"
  - "[ ] Calcular receita por sessão: preço pacote / total sessões"
  - "[ ] Verificar margem por sessão (alerta se margem < mínimo após desconto)"
  - "[ ] Receita diferida: reconhecer por sessão entregue, não na venda"
  - "[ ] Exibir no paciente: sessões realizadas / total, saldo restante"
  - "[ ] Permitir desconto progressivo (5 sessões -10%, 10 sessões -15%)"
  - "[ ] Valores em centavos inteiros"
  - "[ ] Validação: @finance-domain-expert revisa reconhecimento de receita"
  - "[ ] Testes: criação, consumo de sessão, margem pós-desconto, receita diferida"
---

# Precificação de Pacotes

## Objetivo

Implementar a precificação de pacotes multissessão com desconto progressivo e reconhecimento de receita diferida.

## Modelo

```
Pacote: "5 sessões de Limpeza de Pele"
  Preço unitário: R$ 150,00
  Desconto: 10%
  Preço do pacote: R$ 675,00
  Receita por sessão: R$ 135,00

Sessão 1 realizada → Receita reconhecida: R$ 135,00
Sessão 2 realizada → Receita reconhecida: R$ 135,00
...
Sessão 5 realizada → Receita reconhecida: R$ 135,00
Total reconhecido: R$ 675,00
```

## Alerta de Margem

```
Se receita_por_sessão (R$ 135) < custo_total_serviço (R$ 65):
  margem = (135 - 65) / 135 = 51,9% ✅
Se desconto fosse 60%:
  receita_por_sessão = R$ 60 < custo R$ 65 → margem NEGATIVA ⚠️
```
