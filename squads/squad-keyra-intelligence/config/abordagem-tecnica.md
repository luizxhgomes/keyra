# Abordagem Técnica — KEYRA Intelligence

## ADR-005: Regras Determinísticas vs Machine Learning

### Decisão

**v1: 100% regras determinísticas (SQL + TypeScript)** — sem ML.

### Contexto

O KEYRA está na fase de construção. Não há dados históricos suficientes para treinar modelos de ML com qualidade. Além disso, a maioria das funcionalidades de "inteligência" são, na verdade, cálculos determinísticos bem definidos.

### Mapeamento Funcionalidade × Abordagem

| Funcionalidade | v1 (Regras) | v2 (ML) | Justificativa |
|---------------|-------------|---------|---------------|
| Preço mínimo | ✅ Fórmula | — | Determinístico puro |
| Simulação de cenários | ✅ Fórmula | — | Variáveis conhecidas |
| Previsão de lucro | ✅ Agenda × preços | 🔮 Séries temporais | Dados insuficientes na v1 |
| Rentabilidade/hora | ✅ Agregação SQL | — | Determinístico puro |
| LTV do cliente | ✅ Fórmula | 🔮 Propensão | Dados insuficientes |
| Sugestão de upsell | ✅ Regras simples | 🔮 Recomendação | Precisa de volume |
| Benchmark de preços | ✅ Tabela manual | 🔮 Agregação multi-tenant | Precisa de N tenants |
| Alerta de estoque | ✅ Consumo médio | 🔮 Demanda sazonal | Simples é suficiente |

### Critérios para Migrar para ML (v2)

1. **Dados:** Mínimo 6 meses de histórico em 50+ tenants ativos
2. **Volume:** 10.000+ transações no dataset
3. **Valor:** Melhoria mensurável vs regras (A/B test)
4. **Custo:** Infraestrutura de ML justificável pelo ROI

### Stack Técnico

**v1 (atual):**
- TypeScript para cálculos em `src/lib/finance/`
- SQL com CTEs e window functions para agregações
- Materialized views para projeções pesadas
- Cache em memória para dados de referência

**v2 (futuro, se justificado):**
- TensorFlow.js para modelos leves client-side
- Supabase Edge Functions para inferência server-side
- Ou API externa (OpenAI, Vertex AI) para modelos complexos

### Consequências

**Positivas:**
- Implementação mais rápida (semanas vs meses)
- Resultados previsíveis e debugáveis
- Sem custo de infraestrutura de ML
- Funciona com 1 tenant (dia 1)

**Negativas:**
- Sugestões de upsell menos personalizadas
- Benchmarks dependem de input manual
- Previsões sem sazonalidade automática

### Referências

- Decisão tomada em: Fase 0 (squad-keyra-bootstrap)
- Revisão prevista: Quando atingir 50 tenants ativos
