---
task: validarFormulasInteligencia()
responsavel: "@finance-domain-expert"
responsavel_type: Agent
atomic_layer: Task
elicit: true
epic: "5-6"
story_ref: "transversal"

Entrada:
  - campo: código_pricing
    tipo: code
    origem: src/lib/finance/pricing.ts
    obrigatório: true

  - campo: código_projections
    tipo: code
    origem: src/lib/finance/projections.ts
    obrigatório: true

  - campo: código_upsell
    tipo: code
    origem: src/lib/finance/upsell.ts
    obrigatório: true

Saída:
  - campo: relatório_validação
    tipo: markdown
    destino: docs/qa/validacao-formulas-inteligencia.md
    persistido: true

Checklist:
  - "[ ] Validar fórmula de preço mínimo (custo / (1 - margem))"
  - "[ ] Validar fórmula de ponto de equilíbrio"
  - "[ ] Validar precificação de pacotes com desconto e receita diferida"
  - "[ ] Validar previsão de lucro baseada em agenda"
  - "[ ] Validar cenários what-if (variáveis e impacto calculado)"
  - "[ ] Validar rentabilidade por hora (agregação correta)"
  - "[ ] Validar LTV do cliente (ticket × frequência × vida)"
  - "[ ] Validar fórmula de meta (custos + lucro desejado)"
  - "[ ] Verificar centavos inteiros em todos os cálculos"
  - "[ ] Verificar proteção contra divisão por zero"
  - "[ ] Testar com cenários de data/cenarios-precificacao.yaml"
  - "[ ] Testar com cenários de data/cenarios-projecao.yaml"
  - "[ ] Emitir parecer: APROVADO | CORREÇÕES NECESSÁRIAS"
---

# Validação de Fórmulas — Inteligência (Epics 5-6)

## Objetivo

@finance-domain-expert (Valéria) valida TODAS as fórmulas de precificação e projeção antes do QA gate.

## Critérios

1. Fórmulas matematicamente corretas (verificar com exemplos numéricos)
2. Centavos inteiros em todos os cálculos
3. Proteção contra divisão por zero
4. Arredondamento ROUND_HALF_UP consistente
5. Cenários extremos tratados (margem 0%, 100%, volume 0)
6. Consistência com fórmulas do squad-keyra-core (DRE, custos)
