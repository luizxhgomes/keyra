# Checklist de Projeções — KEYRA

## Previsão de Lucro

- [ ] Receita prevista = SUM(preço dos serviços agendados)
- [ ] Custos previstos = SUM(custo total dos serviços agendados)
- [ ] Taxa de faltas aplicada (histórico dos últimos 90 dias)
- [ ] Custos fixos rateados proporcionalmente ao período
- [ ] Lucro previsto = receita ajustada - custos - fixos
- [ ] Atualiza quando agenda muda (não cache estático)
- [ ] Sem agendamentos → lucro previsto = -custos fixos (não zero)

## Cenários What-If

- [ ] Variáveis independentes (preço, volume, custo)
- [ ] Combinação de variáveis funciona corretamente
- [ ] Resultado em R$ absoluto e % de variação
- [ ] Cenário pré-definidos funcionam
- [ ] Cálculo client-side (sem round-trip)
- [ ] Centavos inteiros nos cálculos intermediários

## Rentabilidade por Hora

- [ ] Agregação por faixa horária correta (2h por faixa)
- [ ] Lucro/hora = lucro total na faixa / horas na faixa
- [ ] Horas sem atendimento = R$ 0/hora (não nulo)
- [ ] Materialized view atualizada diariamente
- [ ] Agrupamento por dia da semana funciona

## LTV do Cliente

- [ ] Ticket médio = total gasto / total visitas
- [ ] Frequência = visitas / meses como cliente
- [ ] Meses como cliente >= 1 (proteção divisão por zero)
- [ ] LTV = ticket × frequência × vida média
- [ ] Cliente novo (1 visita): LTV baseado na média geral
- [ ] Valores em centavos inteiros

## Metas

- [ ] Meta = custos totais + lucro desejado
- [ ] Atendimentos necessários = meta / ticket médio
- [ ] Ticket médio = 0 → mensagem "Sem histórico"
- [ ] Progresso atualizado em tempo real
- [ ] Faltante em R$ (absoluto, textual)

## Sugestões de Upsell

- [ ] Regras aplicadas corretamente (histórico do paciente)
- [ ] Paciente novo → sem sugestão (não erro)
- [ ] Sugestão exibida no agendamento
- [ ] Regras configuráveis por tenant
- [ ] Não sugerir serviço que paciente já agendou nesta visita
