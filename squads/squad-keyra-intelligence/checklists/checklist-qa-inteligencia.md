# Checklist de QA — KEYRA Intelligence (Epics 5-6)

## Epic 5 — Motor de Precificação

### Precificação
- [ ] Preço mínimo calculado corretamente
- [ ] Margem exibida em tempo real ao editar preço/custo
- [ ] Alerta quando preço < preço mínimo
- [ ] Ponto de equilíbrio calculado e exibido

### Pacotes
- [ ] Preço do pacote com desconto correto
- [ ] Receita diferida: reconhecida por sessão
- [ ] Alerta de margem negativa após desconto
- [ ] Desconto máximo respeitado

### Simulação
- [ ] Cenários pré-definidos funcionam
- [ ] Variáveis ajustáveis produzem resultado coerente
- [ ] Impacto exibido em R$ e %
- [ ] Cenários extremos não quebram

### Estoque
- [ ] Alerta de estoque baixo funciona
- [ ] Consumo médio calculado dos últimos 30 dias
- [ ] Sugestão de recompra coerente

### Benchmark (v1)
- [ ] Tabela de referência editável
- [ ] Comparativo "acima/abaixo da média" correto
- [ ] Sem referência disponível → não exibir (não erro)

### Gate Financeiro
- [ ] @finance-domain-expert APROVOU todas as fórmulas

## Epic 6 — Inteligência + Projeções

### Previsão de Lucro
- [ ] Baseada na agenda preenchida (serviços × preços - custos)
- [ ] Taxa de faltas aplicada
- [ ] Comparativo com meta (textual)
- [ ] Atualiza ao modificar agenda

### What-If
- [ ] Variáveis independentes e combinadas
- [ ] Resultado vs situação atual
- [ ] Cálculo client-side (resposta instantânea)

### Rentabilidade
- [ ] Lucro/hora por faixa horária
- [ ] Heatmap visual funcionando (EXCEÇÃO UX)
- [ ] Alerta por profissional com baixa margem
- [ ] Materialized view atualizada

### Prontuário Financeiro
- [ ] Ticket médio, frequência, LTV corretos
- [ ] Alerta de cliente inativo
- [ ] Serviços mais consumidos listados

### Upsell
- [ ] Sugestões exibidas no agendamento
- [ ] Regras aplicadas corretamente
- [ ] Paciente novo = sem sugestão
- [ ] Regras configuráveis

### Gate Financeiro
- [ ] @finance-domain-expert APROVOU todas as projeções

## Transversal

- [ ] ZERO gráficos (EXCEÇÃO: heatmap de rentabilidade)
- [ ] Números absolutos em todas as telas
- [ ] Comparativos textuais
- [ ] Centavos inteiros em todos os cálculos
- [ ] Testes unitários passando (mínimo 90% em lib/finance/)
- [ ] Lint e typecheck passando
