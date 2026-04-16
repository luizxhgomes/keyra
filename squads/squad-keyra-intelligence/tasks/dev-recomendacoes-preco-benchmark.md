---
task: recomendacoesPrecoBenchmark()
responsavel: "@dev"
responsavel_type: Agent
atomic_layer: Task
elicit: false
epic: 5
story_ref: "5.7"

Saída:
  - campo: componentes
    tipo: code
    destino: src/lib/finance/pricing-benchmark.ts
    persistido: true

Checklist:
  - "[ ] v1: Referência manual — tabela de preços médios por serviço e região"
  - "[ ] Permitir que a mentora/admin configure preços de referência"
  - "[ ] Exibir comparativo: 'Seu preço está 15% acima da média da região'"
  - "[ ] Exibir comparativo: 'Seu preço está 20% abaixo — oportunidade de aumento'"
  - "[ ] Formato textual (nunca gráfico)"
  - "[ ] Fonte dos dados claramente indicada (manual ou pesquisa)"
  - "[ ] v2 (futuro): agregar dados anônimos de tenants KEYRA para benchmark real"
  - "[ ] Testes: acima da média, abaixo, na média, sem referência disponível"
---

# Recomendações de Preço por Benchmark

## Objetivo

Implementar referência de preços de mercado para que a profissional saiba como seus preços se comparam com a região.

## Abordagem v1 (regras manuais)

```
Tabela de Referência (configurável pela mentora):

| Serviço | Preço Médio Região | Faixa |
|---------|-------------------|-------|
| Limpeza de Pele | R$ 120 - R$ 180 | SP Capital |
| Botox | R$ 800 - R$ 1.500 | SP Capital |
| Peeling | R$ 200 - R$ 400 | SP Capital |
```

## Exibição

```
Limpeza de Pele — R$ 150,00
Referência da região: R$ 120 - R$ 180
Seu preço está na faixa média ✅

Botox — R$ 600,00
Referência da região: R$ 800 - R$ 1.500
Seu preço está 25% abaixo da média — oportunidade de ajuste 💡
```

## Evolução v2

Agregar dados anônimos de todos os tenants KEYRA da mesma região para criar benchmarks reais. Requer:
- Consentimento explícito do tenant para compartilhar dados agregados
- Anonimização completa (nenhum dado identificável)
- Mínimo de 10 tenants na região para gerar benchmark
