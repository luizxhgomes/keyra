# Engenharia Reversa: Kamino - Software de Automação Financeira

**Data:** 2026-04-12
**Pipeline:** Deep Research > Reverse Engineering
**Objetivo:** Mapear completamente o sistema Kamino para informar a arquitetura financeira do KEYRA
**Status:** CONSOLIDADO

---

## 1. VISÃO GERAL DA KAMINO

### Identidade
- **Nome:** Kamino
- **Razão Social:** Kamino Instituição de Pagamento Ltda
- **CNPJ:** 44.270.765/0001-17
- **Segmento:** Fintech / Software de automação financeira com banco integrado
- **Sede:** São Paulo, SP
- **Contato:** (11) 93501-9635 | contato@kamino.com.br
- **Site:** https://kamino.com.br/
- **Reconhecimento:** PEGN "100 Startups to Watch 2024"

### Métricas Públicas
| Métrica | Valor |
|---------|-------|
| Gestores financeiros usando | 2.000+ |
| Empresas usando | 5.000+ |
| Volume transacionado | R$ 10 bilhões+ |
| Redução tempo manual | 72% |
| Horas poupadas/ano | 500+ |
| Cartões corporativos ativos | 1.000+ |
| AUM gerenciado por clientes | R$ 60 bilhões+ |

### Proposta de Valor
"O único sistema do mercado que reúne gestão de pagamentos, recebimentos, conciliação bancária automática, relatórios gerenciais (DRE e fluxo de caixa) e conta bancária própria com cartões corporativos em uma única plataforma."

### Público-Alvo
- **Primário:** Médias empresas (faturamento R$ 5M-100M/ano)
- **Secundário:** PMEs (plano gratuito Compass)
- **Vertical específica:** Assessorias de investimento, grupos econômicos multi-CNPJ
- **Perfil usuário:** Times financeiros enxutos, multi-banco, multi-CNPJ

### Missão
"Capacitar empresas para prosperar em cenários desafiadores, liberando o potencial máximo de suas operações financeiras."

---

## 2. ARQUITETURA FUNCIONAL COMPLETA

### 2.1 Módulo: Gestão de Pagamentos (Contas a Pagar)

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Pagamento em lote | Múltiplas ordens (fornecedores, prestadores, colab.) em uma única operação | BAIXA - KEYRA é micro |
| Fluxo de aprovação | Pagamentos revisados e autorizados por responsáveis antes da execução | BAIXA - clínica pequena |
| Pagamento automático | Via conta Kamino (PIX, TED) | MÉDIA - conceito de automação |
| Captura automática de cobranças | Boletos recebidos capturados automaticamente | MÉDIA |
| Extração automática de dados | Dados de boletos extraídos via OCR/IA | ALTA - conceito para upload PDFs |
| Integração DDA | Débito Direto em Conta | BAIXA |
| Agendamento de pagamentos | Boletos agendados para data futura | MÉDIA |
| Multi-CNPJ | Gestão de pagamentos por CNPJ | BAIXA |
| Controle de alçadas | Limites de aprovação por usuário/CNPJ | BAIXA |

**Insight para KEYRA:** O conceito de **captura automática** e **extração de dados** é muito relevante para o módulo de Upload de PDFs do KEYRA (capturar notas de fornecedores, comprovantes de pagamento, extrair valores automaticamente).

### 2.2 Módulo: Gestão de Recebimentos (Contas a Receber)

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Geração de cobranças | Boletos e cobranças com ou sem NF | MÉDIA |
| Cobranças recorrentes | Assinaturas e mensalidades automáticas | MÉDIA - pacotes recorrentes |
| Régua de cobrança | Lembretes automáticos antes e depois do vencimento | ALTA - conceito aplicável |
| Emissão automática de NF | Nota fiscal gerada junto com cobrança | MÉDIA |
| Controle de inadimplência | Relatórios de clientes inadimplentes | ALTA |
| Envio automático | Boletos/NFs enviados por email ao cliente | MÉDIA |

**Insight para KEYRA:** A **régua de cobrança** é um conceito poderoso. No KEYRA, quando um pacote é vendido parcelado ou uma sessão não é paga, o sistema pode enviar lembretes automáticos. O **controle de inadimplência** também é crítico — a esteticista precisa saber quem não pagou.

### 2.3 Módulo: Conciliação Bancária Automatizada

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Conciliação automática | Movimentações bancárias categorizadas automaticamente | ALTA |
| Integração 50+ bancos | Importação automática de extratos | MÉDIA - futuro |
| Plano de contas personalizável | Categorias financeiras customizáveis | ALTA |
| Conciliação multi-banco | Vários bancos em uma única tela | BAIXA |
| Conciliação de cartões | Faturas de cartão corporativo | MÉDIA |
| Regras automáticas | Categorização por regras pré-definidas | ALTA |
| Precisão 100% | Elimina erros manuais de categorização | ALTA - princípio |

**Insight para KEYRA:** A **conciliação automática com regras** é fundamental. No KEYRA, quando o pagamento é registrado (PIX, cartão, dinheiro), o sistema deve automaticamente categorizar como receita do serviço X, deduzir taxa de cartão, calcular comissão. Zero lançamento manual.

### 2.4 Módulo: Relatórios Gerenciais e Dados

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| DRE automático | Demonstração de Resultado gerada automaticamente | CRÍTICA |
| Fluxo de caixa | Projetado e realizado | CRÍTICA |
| Ranking de gastos | Categorização e ranking de despesas | ALTA |
| Resultados operacionais | Performance operacional do negócio | ALTA |
| Análise de inadimplência | Métricas de atraso e não-pagamento | ALTA |
| Dashboards interativos | Indicadores em tempo real | ALTA |
| Relatórios D+1 | Atualização diária dos relatórios | MÉDIA |
| Exportação contábil | Relatórios exportáveis para contador | MÉDIA |
| Fluxo de caixa projetado | Projeção futura baseada em recorrências | ALTA |
| Multi-CNPJ consolidado | Visão consolidada de todas as empresas | BAIXA |

**Insight CRÍTICO para KEYRA:** A Kamino gera DRE e fluxo de caixa AUTOMATICAMENTE a partir das transações. Este é exatamente o princípio do KEYRA — o DRE não é preenchido manualmente, é GERADO da operação (agenda -> comanda -> financeiro -> DRE). A diferença é que o KEYRA gera a partir da AGENDA, não de transações bancárias.

### 2.5 Módulo: Conta Kamino (Banco Integrado)

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Conta PJ digital | Conta bancária própria dentro da plataforma | BAIXA - fora do escopo |
| Cartão corporativo | Cartão de crédito para despesas empresariais | BAIXA |
| PIX integrado | Envio e recebimento via PIX | MÉDIA - conceito de pagamento |
| TED integrado | Transferências bancárias | BAIXA |
| Boleto integrado | Emissão e pagamento de boletos | MÉDIA |
| Saldo em tempo real | Visualização de saldo atualizado | MÉDIA - conceito |
| CDI 100% | Rendimento sobre depósitos | BAIXA |

**Insight para KEYRA:** O KEYRA NÃO precisa ser um banco. Mas o conceito de **registrar o pagamento recebido direto no sistema** (PIX, cartão, dinheiro) é fundamental para eliminar lançamento manual.

### 2.6 Módulo: Crédito Integrado

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Capital de giro | Até R$ 300.000, 6 meses, sem garantia | BAIXA |
| Antecipação de recebíveis | Boletos emitidos via plataforma | BAIXA |
| Análise via dados operacionais | Risco calculado pelo comportamento financeiro | BAIXA |
| 100% digital | Contratação dentro da plataforma | BAIXA |

**Insight para KEYRA:** Este módulo é FORA do escopo do KEYRA, mas o conceito de **usar dados operacionais para gerar insights** é aplicável ao pilar de Inteligência/IA.

### 2.7 Integrações

| Tipo | Sistemas | Relevância KEYRA |
|------|----------|------------------|
| ERPs | TOTVS, SAP, Omie | BAIXA - KEYRA é standalone |
| Bancos | Itaú, Bradesco, Santander, BB, Caixa, Sicoob, Nubank, Inter, C6, Cora, BS2 | MÉDIA - futuro |
| API | API aberta para integrações custom | ALTA - extensibilidade |
| Open Banking | Integração de contas externas | BAIXA |

---

## 3. MODELO DE PLANOS DA KAMINO

### Estrutura de Planos

| Plano | Preço | Público | Funcionalidades Core |
|-------|-------|---------|---------------------|
| **Compass** | Gratuito | PMEs iniciantes | Cartão corporativo, conciliação de cartões, insights de gastos |
| **North** | Personalizado | PMEs crescendo | Compass + pagamentos automatizados (PIX, TED, boleto, DARF), open banking multi-banco, caixa de entrada de boletos |
| **Track** | Personalizado | Médias empresas | North + 100% contas a pagar/receber automatizadas, reembolsos, fluxo aprovação, cobranças, NFs, relatórios gerenciais |

### Modelo de Monetização
- **Freemium** (Compass gratuito) -> upsell para North/Track
- **Preços personalizados** baseados em porte, volume e integrações
- **Receita adicional:** Taxas de transação (PIX, TED, boleto), juros de crédito, float bancário
- **Argumento ROI:** "Economias de mais de 200h/mês, ROI na casa dos três dígitos"

### Análise de Pricing para KEYRA
A Kamino NÃO é concorrente direta do KEYRA (público diferente), mas seu modelo de **freemium + upsell baseado em automação** é relevante. A Kamino cobra pelo VOLUME de automação — quanto mais processos automatizados, maior o plano.

O KEYRA pode adaptar isso: plano Start (agenda + financeiro básico) -> Crescimento (+ DRE + precificação) -> Autoridade (+ IA + metas + multi-unidade).

---

## 4. MODELO DE DADOS INFERIDO DA KAMINO

```
Empresa (tenant - pode ter múltiplos CNPJs)
├── CNPJ (1:N)
│   ├── ContaBancária (1:N) — Kamino + bancos externos
│   │   ├── Extrato (1:N)
│   │   └── Saldo (1:1)
│   ├── ContaPagar (1:N)
│   │   ├── Fornecedor (N:1)
│   │   ├── Boleto (1:1)
│   │   ├── FluxoAprovação (1:N)
│   │   ├── Pagamento (1:1)
│   │   └── CategoriaPlanoContas (N:1)
│   ├── ContaReceber (1:N)
│   │   ├── Cliente (N:1)
│   │   ├── Cobrança (1:1) — boleto, PIX
│   │   ├── NotaFiscal (1:1)
│   │   ├── RéguaCobrança (N:1)
│   │   └── CategoriaPlanoContas (N:1)
│   ├── Conciliação (1:N)
│   │   ├── MovimentaçãoBancária (N:1)
│   │   ├── LançamentoFinanceiro (N:1)
│   │   └── RegraAutomática (N:1)
│   └── CartãoCorporativo (1:N)
│       ├── Transação (1:N)
│       └── Fatura (1:N)
├── PlanoContas (1:N) — categorias personalizáveis
├── RelatórioDRE (gerado automaticamente)
├── RelatórioFluxoCaixa (gerado automaticamente)
└── Dashboard (tempo real)
```

### Evolução para o KEYRA — Modelo Financeiro Adaptado

O KEYRA opera com um modelo mais simples mas com profundidade diferente:

```
Clínica (tenant)
├── ConfigFinanceira
│   ├── PlanoContas (1:N) — categorias de receita/despesa
│   ├── FormaPagamento (1:N) — PIX, cartão, dinheiro, etc
│   │   └── TaxaCartão (1:1) — % por bandeira/maquininha
│   └── Meta (1:N) — metas por período
│
├── Receita (gerada automaticamente da Comanda)
│   ├── Comanda (N:1) — origem automática
│   ├── Serviço (N:1)
│   ├── Profissional (N:1)
│   ├── FormaPagamento (N:1)
│   ├── ValorBruto
│   ├── TaxaCartão (calculada)
│   ├── ValorLíquido (calculado)
│   ├── Comissão (calculada)
│   └── CustoInsumos (calculado do estoque)
│
├── Despesa
│   ├── DespesaFixa (1:N) — aluguel, energia, etc
│   ├── DespesaVariável (1:N) — insumos, produtos
│   └── CategoriaPlanoContas (N:1)
│
├── Conciliação (simplificada)
│   ├── Pagamento recebido → match com Comanda
│   └── Status: pago / pendente / inadimplente
│
├── DRE (gerado automaticamente por período)
│   ├── ReceitaBruta (soma receitas)
│   ├── DeduçõesTaxas (soma taxas cartão)
│   ├── ReceitaLíquida
│   ├── CustosVariáveis (insumos consumidos)
│   ├── MargemContribuição
│   ├── CustosFixos (despesas fixas rateadas)
│   ├── DespesasOperacionais
│   └── LucroLíquido
│
├── FluxoCaixa
│   ├── Realizado (por dia/semana/mês)
│   └── Projetado (baseado em agenda futura + recorrências)
│
└── Dashboard (números absolutos, sem gráficos)
    ├── Faturamento do mês vs meta
    ├── Lucro líquido do mês
    ├── Ticket médio
    ├── Serviço mais lucrativo
    ├── Inadimplência
    └── Comparativo mês anterior
```

---

## 5. PADRÕES DE DESIGN DA KAMINO APLICÁVEIS AO KEYRA

### 5.1 Automação como Princípio Central

A Kamino elimina 72% do trabalho manual. O KEYRA deve almejar **90%+** porque o fluxo é mais simples (clínica estética vs empresa média).

| Processo Kamino | Automação | Equivalente KEYRA | Automação |
|-----------------|-----------|-------------------|-----------|
| Importar extrato bancário | Automático | Registrar pagamento | Automático (comanda) |
| Categorizar lançamento | Regras automáticas | Categorizar receita | Automático (serviço → categoria) |
| Gerar DRE | Automático das transações | Gerar DRE | Automático da agenda/comanda |
| Conciliar pagamentos | Match automático | Conciliar comanda | Match pagamento x comanda |
| Enviar cobrança | Régua automática | Lembrar inadimplente | WhatsApp automático |
| Emitir NF | Automático | N/A (futuro) | — |

### 5.2 Conceito de "Dados Operacionais Geram Inteligência"

A Kamino usa dados operacionais (pagamentos, recebíveis) para:
- Calcular risco de crédito
- Gerar relatórios automáticos
- Projetar fluxo de caixa

O KEYRA deve usar dados operacionais (agenda, atendimentos) para:
- Calcular lucro por serviço
- Gerar DRE automático
- Projetar faturamento baseado em agenda futura
- Sugerir ajustes de preço
- Identificar serviços não-rentáveis

### 5.3 Conceito de "Régua de Cobrança" Adaptado

```
KAMINO:                          KEYRA (adaptado):
Fatura emitida                   Sessão agendada
  ↓ 3 dias antes: lembrete        ↓ 24h antes: confirmação WhatsApp
  ↓ No vencimento: aviso           ↓ No atendimento: comanda gerada
  ↓ 1 dia após: cobrança           ↓ Pagamento registrado
  ↓ 7 dias após: 2a cobrança       ↓ Se não pago: lembrete 24h
  ↓ 30 dias: inadimplente          ↓ Se não pago 7d: alerta inadimplência
```

### 5.4 Conceito de "Plano de Contas" Simplificado

A Kamino permite plano de contas personalizável para categorização flexível. O KEYRA deve ter um **plano de contas pré-configurado para estética** com possibilidade de customização:

```
RECEITAS
├── Serviços (auto - da comanda)
│   ├── Limpeza de Pele
│   ├── Peeling
│   ├── Massagem
│   └── [customizável]
├── Produtos (vendas avulsas)
└── Pacotes

CUSTOS VARIÁVEIS
├── Insumos consumidos (auto - do estoque)
├── Comissões (auto - do profissional)
└── Taxas de cartão (auto - da forma pagamento)

CUSTOS FIXOS
├── Aluguel
├── Energia
├── Internet
├── Salários fixos
├── Software/sistemas
└── [customizável]

DESPESAS OPERACIONAIS
├── Marketing
├── Manutenção
├── Material escritório
└── [customizável]
```

---

## 6. DIFERENCIAIS DA KAMINO vs KEYRA — ANÁLISE COMPARATIVA

### O que a Kamino faz que o KEYRA NÃO precisa fazer

| Funcionalidade Kamino | Por que NÃO se aplica ao KEYRA |
|-----------------------|-------------------------------|
| Multi-CNPJ | Clínica estética = 1 CNPJ (geralmente MEI/ME) |
| Integração 50+ bancos | Complexidade desnecessária para o público |
| Fluxo aprovação multi-nível | Clínica pequena, decisão é do dono |
| Pagamento em lote | Volume baixo de fornecedores |
| Cartão corporativo | Fora do escopo de SaaS financeiro |
| Conta bancária própria | KEYRA não é banco/IP |
| Crédito/antecipação | KEYRA não é fintech de crédito |
| Integração ERP (SAP, TOTVS) | Público não usa ERP corporativo |
| DDA | Complexidade bancária desnecessária |
| API aberta extensiva | Pode ser futuro, não MVP |

### O que a Kamino faz que o KEYRA DEVE inspirar

| Conceito Kamino | Adaptação KEYRA | Prioridade |
|-----------------|-----------------|------------|
| DRE automático | DRE gerado da agenda/comanda (não de transações) | P0 |
| Fluxo de caixa projetado | Projeção baseada em agenda futura + recorrências | P1 |
| Conciliação automática | Match pagamento x comanda automático | P0 |
| Régua de cobrança | Lembretes WhatsApp para inadimplentes | P1 |
| Ranking de gastos | Ranking de custos por serviço/categoria | P1 |
| Categorização automática | Plano de contas pré-configurado para estética | P0 |
| Relatórios D+1 | Dashboard atualizado em tempo real | P0 |
| 72% redução manual | Meta: 90%+ redução (fluxo mais simples) | P0 |
| Dados operacionais → insights | Agenda → lucro por serviço → sugestões IA | P2 |

### O que o KEYRA faz que a Kamino NÃO faz

| Exclusivo KEYRA | Descrição |
|-----------------|-----------|
| Agenda como origem do faturamento | O financeiro NASCE da agenda, não de lançamento |
| Comanda automática | Agendamento → atendimento → comanda → financeiro |
| Lucro por serviço | Receita - insumos - comissão - custos fixos rateados |
| Precificação automática | Preço mínimo calculado dos custos reais |
| Custo de insumo por procedimento | Quanto cada serviço consome de estoque |
| Dashboard sem gráficos | Números absolutos, comparativos textuais |
| Metas para esteticistas | Real vs meta em linguagem simples |
| Foco no nicho estética | Plano de contas, serviços, termos do setor |

---

## 7. LIÇÕES DE PRODUTO DA KAMINO PARA O KEYRA

### 7.1 Onboarding Rápido
A Kamino promete setup em **7 dias** sem integração. O KEYRA deve almejar **setup em 1 dia** — cadastrar serviços, preços, profissionais e começar a usar a agenda.

### 7.2 ROI Mensurável
A Kamino comunica "72% redução de tempo manual" e "ROI três dígitos". O KEYRA deve ter métricas claras:
- "Descubra em 30 segundos se seu serviço mais vendido dá lucro ou prejuízo"
- "Zero lançamento manual — seu financeiro se preenche sozinho"
- "Saiba seu lucro real sem precisar de contador"

### 7.3 Freemium como Porta de Entrada
O plano Compass gratuito da Kamino atrai PMEs. O KEYRA pode considerar:
- **Trial 14 dias** (como Belle Software)
- **Ou plano gratuito limitado** (1 profissional, sem DRE, sem IA)

### 7.4 Upsell por Automação
A Kamino vende automação progressiva (Compass → North → Track). O KEYRA pode espelhar:
- **Start:** Agenda + financeiro básico (registra mas não analisa)
- **Crescimento:** + DRE automático + precificação + metas (analisa)
- **Autoridade:** + IA + insights proativos + multi-unidade (decide)

---

## 8. ARQUITETURA TÉCNICA — PADRÕES OBSERVADOS

| Aspecto | Kamino | Recomendação KEYRA |
|---------|--------|-------------------|
| Tipo | SaaS web + mobile | SaaS web + mobile (PWA) |
| Multi-tenant | Sim (por empresa/CNPJ) | Sim (por clínica) |
| Tempo real | D+1 para relatórios | Tempo real (volume menor) |
| Integração bancária | 50+ bancos via API/Open Banking | Futuro — começar manual |
| Mobile | Apps nativos (iOS/Android) | PWA ou React Native |
| Segurança | IP regulada pelo Banco Central | SaaS padrão (LGPD) |
| API | API aberta | API REST para futuras integrações |

---

## 9. RECOMENDAÇÕES ESTRATÉGICAS CONSOLIDADAS

### 9.1 O que levar da Kamino para o KEYRA

1. **DRE automático** — adaptar de "transações bancárias" para "comanda/agenda"
2. **Fluxo de caixa projetado** — baseado em agenda futura + pacotes vendidos
3. **Conciliação simplificada** — match pagamento x comanda
4. **Régua de cobrança** — WhatsApp para inadimplentes
5. **Plano de contas pré-configurado** — categorias prontas para estética
6. **Categorização automática** — regras baseadas no tipo de serviço
7. **Modelo freemium → upsell** — automação progressiva como upgrade

### 9.2 O que NÃO copiar da Kamino

1. Multi-CNPJ como feature central (público diferente)
2. Conta bancária/IP (regulação pesada, fora do escopo)
3. Crédito/antecipação (fora do escopo)
4. Complexidade de integrações bancárias no MVP
5. Fluxos de aprovação multi-nível
6. Dashboards com gráficos complexos

### 9.3 Posicionamento Competitivo

```
KAMINO = "Automação financeira para médias empresas"
         (transações bancárias → relatórios)

KEYRA  = "O primeiro financeiro operacional para estética"
         (agenda → comanda → lucro por serviço → DRE)
```

A Kamino INSPIRA o lado financeiro do KEYRA, mas o KEYRA é fundamentalmente diferente porque:
- A **origem dos dados** é a agenda/operação, não transações bancárias
- O **público** é micro (esteticista autônoma/clínica pequena), não médio
- O **output** é "quanto lucro cada serviço dá", não "como estão minhas contas"
- A **linguagem** é simples (sem jargão financeiro), não corporativa

---

## 10. MATRIZ DE PRIORIDADE — FEATURES INSPIRADAS NA KAMINO

| Feature | Inspiração Kamino | Adaptação KEYRA | Sprint |
|---------|-------------------|-----------------|--------|
| DRE automático | DRE de transações | DRE de comandas/agenda | MVP |
| Plano de contas | Personalizável | Pré-configurado estética | MVP |
| Conciliação | Match banco x lançamento | Match pagamento x comanda | MVP |
| Fluxo caixa realizado | Por período | Por dia/semana/mês | V1 |
| Fluxo caixa projetado | Baseado em recorrências | Baseado em agenda futura | V1 |
| Ranking gastos | Por categoria | Por serviço (custo) | V1 |
| Régua cobrança | Email automático | WhatsApp automático | V1 |
| Inadimplência | Relatório clientes | Alerta + lista devedores | V1 |
| Exportação contábil | CSV para contador | PDF/CSV para contador | V2 |
| IA insights | Análise de risco | Sugestões de preço/lucro | V3 |

---

## FONTES

- [Kamino - Site Oficial](https://kamino.com.br/)
- [Kamino - Solução ERP](https://kamino.com.br/solucao-erp/)
- [Kamino - Pagamentos](https://kamino.com.br/pagamentos/)
- [Kamino - Recebimentos](https://kamino.com.br/recebimentos/)
- [Kamino - Conciliação Automatizada](https://kamino.com.br/conciliacao-automatizada/)
- [Kamino - Relatórios e Dados](https://kamino.com.br/relatorios-e-dados-financeiros/)
- [Kamino - ERP Financeiro Integrado](https://kamino.com.br/erp-financeiro-integrado/)
- [Kamino - Conta Kamino](https://kamino.com.br/conta-kamino/)
- [Kamino - Institucional](https://kamino.com.br/institucional/)
- [Kamino - B2B Stack (4.7/5)](https://www.b2bstack.com.br/product/kamino)
- [Kamino lança plano gratuito - Finsiders](https://finsidersbrasil.com.br/tecnologia-para-fintechs/kamino-lanca-plano-gratuito-para-crescer-com-pmes/)
- [Kamino lança plano gratuito - Startups.com.br](https://startups.com.br/negocios/fintech/kamino-lanca-plano-gratuito-para-crescer-com-pmes/)
- [Kamino lança crédito integrado - Let's Money](https://www.letsmoney.com.br/fintech/kamino-credito-capital-giro-antecipacao-recebiveis-medias-empresas)
- [Kamino - Portal ERP](https://portalerp.com/kamino)
