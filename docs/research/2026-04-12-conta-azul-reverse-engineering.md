# Engenharia Reversa: Conta Azul - ERP de Controle Financeiro Empresarial

**Data:** 2026-04-12
**Pipeline:** Deep Research > Reverse Engineering
**Objetivo:** Mapear completamente o Conta Azul — ERP referência no Brasil — para informar a arquitetura do KEYRA
**Status:** CONSOLIDADO

---

## 1. VISÃO GERAL DO CONTA AZUL

### Identidade
- **Nome:** Conta Azul
- **Razão Social:** Contaazul Instituição de Pagamento Ltda
- **CNPJ:** 47.381.104/0001-57
- **Segmento:** ERP SaaS para PMEs brasileiras
- **Fundação:** 2012
- **Sede:** Joinville, SC
- **Fundadores:** Vinicius Roveda, João Zaratine, José Carlos Sardagna
- **Contato:** 0800 600 0920 (não-clientes) | 0800 600 0919 (clientes)
- **Site:** https://contaazul.com/
- **Registro:** Correspondente bancário (Resolução CMN 4.935), parceiro BTG Pactual

### Métricas Públicas
| Métrica | Valor |
|---------|-------|
| Nota Reclame Aqui | 7.6/10 |
| Reclamações RA | 657 |
| Economia para usuário | Até 20h/mês em controle manual |
| Redução trabalho cobrança | De 3-4h/dia para minutos |
| Integração bancária | 10+ bancos principais |
| Integrações totais | 50+ plataformas |

### Proposta de Valor
"Juntos, a gente dá conta do seu financeiro." — ERP integrado que unifica financeiro, fiscal, vendas e estoque para PMEs, com foco em simplicidade e conexão com contador.

### Público-Alvo
- **Primário:** PMEs brasileiras (MEI até médio porte)
- **Faturamento:** R$ 81K a R$ 1.5M+/ano
- **Setores atendidos:** Agências marketing, clínicas saúde, consultorias, engenharia, advocacia, escolas, manutenção, seguros, software, ONGs, varejo, atacado, distribuidoras
- **Perfil usuário:** Empreendedor/gestor que precisa de ERP simples e integrado

### Posicionamento no Mercado
O Conta Azul é o **ERP mais conhecido do Brasil para PMEs**. Concorre diretamente com Omie, Bling, Tiny, Nibo. É o sistema mencionado na visão do KEYRA como exemplo de ferramenta que "atua pós-faturamento manual" — ou seja, exige que o usuário lance dados manualmente antes de gerar relatórios.

---

## 2. ARQUITETURA FUNCIONAL COMPLETA

### 2.1 Módulo: Emissão de Notas Fiscais

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| NF-e | Nota Fiscal Eletrônica de produto | BAIXA |
| NFS-e | Nota Fiscal de Serviço eletrônica | MÉDIA - futuro |
| NFC-e | Nota Fiscal do Consumidor eletrônica | BAIXA |
| Emissão automática | Gera NF a partir de venda/contrato | MÉDIA - conceito |
| Envio automático | NF enviada ao cliente + contador | MÉDIA - conceito |
| Impostos corretos | Cálculo automático de impostos | BAIXA |
| Integração fiscal | Dados direto para contabilidade | BAIXA |

**Insight para KEYRA:** NFS-e pode ser um módulo futuro (V3+). O conceito de **emissão automática a partir da venda** é relevante — no KEYRA, a comanda gera o registro financeiro; no futuro, poderia gerar NFS-e automaticamente.

### 2.2 Módulo: Gestão Financeira

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Contas a pagar | Controle de despesas com alertas diários | ALTA |
| Contas a receber | Gerado automaticamente após venda | CRÍTICA |
| Fluxo de caixa | Visualização por período, projeção | CRÍTICA |
| DRE gerencial | Demonstração de resultado personalizável | CRÍTICA |
| Conciliação bancária | Automática com 10+ bancos | ALTA |
| Centros de custo | Segmentação de receitas/despesas | MÉDIA |
| Categorias financeiras | Plano de contas customizável | ALTA |
| Juros/multas/descontos | Gestão de acréscimos e abatimentos | MÉDIA |
| Alertas de vencimento | Notificações de contas próximas | MÉDIA |
| Lançamentos categorizados | Importados do banco já categorizados | ALTA |
| Baixa automática | Contas pagas baixadas automaticamente | ALTA |

**Insight CRÍTICO para KEYRA:** O Conta Azul gera contas a receber **automaticamente após a venda**, mas a VENDA precisa ser registrada manualmente. No KEYRA, a venda (comanda) é gerada automaticamente do atendimento na agenda. O Conta Azul também tem DRE gerencial — o KEYRA precisa superar isso com DRE **automático sem lançamento**.

### 2.3 Módulo: Conciliação Bancária

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Importação automática | Extratos importados diariamente | MÉDIA - futuro |
| Match automático | Transações casadas com lançamentos | ALTA - conceito |
| Baixa automática | Contas quitadas baixadas automaticamente | ALTA |
| Multi-banco | BB, Itaú, Bradesco, Santander, Inter, Sicoob, Sicredi, BS2, Cora | MÉDIA - futuro |
| Lançamentos categorizados | Chegam já categorizados do banco | ALTA |
| Atualização diária | Processamento todos os dias | MÉDIA |

**Bancos integrados:** Banco do Brasil, BS2, Cora, Inter, Itaú, Bradesco, Santander, Sicoob, Sicredi

**Insight para KEYRA:** No MVP, o KEYRA não precisa de integração bancária. Mas precisa do **conceito** de conciliação: quando o pagamento é registrado na comanda (PIX recebido, cartão passado, dinheiro recebido), o sistema automaticamente "concilia" — marca como pago e atualiza o financeiro.

### 2.4 Módulo: Controle de Vendas

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Registro automático de vendas | A partir de orçamento aprovado, NF ou cobrança | ALTA - conceito |
| Histórico de clientes | Compras, pagamentos, preferências | ALTA |
| Orçamentos/propostas | Criação e acompanhamento | BAIXA |
| Ticket médio | Por cliente e por período | ALTA |
| Produtos mais vendidos | Ranking de vendas | ALTA |
| Desempenho por vendedor | Performance individual | MÉDIA - por profissional |
| Integrações marketplace | Mercado Livre, Shopify, Nuvemshop, etc. | BAIXA |
| Contratos recorrentes | Cobrança automática mensal | MÉDIA - pacotes |
| Lucratividade | Margem por produto/serviço | CRÍTICA |

**Insight para KEYRA:** O Conta Azul tem **lucratividade por produto** nos relatórios de vendas. Isso confirma que o mercado espera essa funcionalidade. O KEYRA vai além: **lucro por SERVIÇO** considerando insumos + comissão + custos fixos rateados.

### 2.5 Módulo: Controle de Estoque

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Atualização automática | Baixa na venda e NF | ALTA |
| Alertas de mínimo | Notificação quando produto atinge mínimo | ALTA |
| Bloqueio sem estoque | Impede venda sem saldo | MÉDIA |
| Variações | Cor, tamanho, etc. | BAIXA |
| Kits | Composição de kits | MÉDIA - kits de insumos |
| Entrada por NF | Produtos entram via NF de compra | MÉDIA |
| Giro de estoque | Relatório de rotatividade | MÉDIA |
| Inventário | Ajustes com rastreamento | MÉDIA |

**Insight para KEYRA:** O Conta Azul faz controle de estoque de **produtos para venda**. O KEYRA precisa de controle de estoque de **insumos para serviços** (consumo por procedimento). Conceito similar, aplicação diferente.

### 2.6 Módulo: Cobranças Automáticas

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Boleto registrado | Emissão e envio automático | MÉDIA - futuro |
| PIX Cobrança | Geração de cobrança via PIX | ALTA |
| Link de cartão | Pagamento por cartão via link | ALTA |
| Lembretes automáticos | SMS, WhatsApp, email pré-vencimento | ALTA |
| Cobrança recorrente | Mensal automática para contratos | MÉDIA - pacotes |
| Régua de cobrança | Sequência de lembretes | ALTA |
| Penalidades automáticas | Juros e multas por atraso | MÉDIA |

**Insight para KEYRA:** A régua de cobrança do Conta Azul (SMS + WhatsApp + email) é mais sofisticada que a maioria dos sistemas de estética. O KEYRA deve implementar pelo menos **WhatsApp** como canal de cobrança/lembrete.

### 2.7 Módulo: Relatórios e Inteligência

| Relatório | Descrição | Relevância KEYRA |
|-----------|-----------|------------------|
| DRE gerencial | Lucro/prejuízo por período, personalizável | CRÍTICA |
| Fluxo de caixa | Realizado e projetado | CRÍTICA |
| Categorias financeiras | Receitas/despesas por categoria | ALTA |
| Vendas por período | Faturamento diário/semanal/mensal | ALTA |
| Vendas por cliente | Faturamento por cliente | ALTA |
| Vendas por produto | Ranking de produtos/serviços | ALTA |
| Ticket médio | Média de valor por venda | ALTA |
| Lucratividade | Margem por produto/serviço | CRÍTICA |
| Desempenho vendedor | Performance por vendedor | ALTA - por profissional |
| Compras por fornecedor | Gastos por fornecedor | MÉDIA |
| Estoque (posição) | Saldo atual de estoque | ALTA |
| Estoque (giro) | Rotatividade de produtos | MÉDIA |
| Centros de custo | Receitas/despesas por centro | MÉDIA |
| Contas a pagar | Próximos vencimentos | ALTA |
| Contas a receber | Previsão de recebimentos | ALTA |
| Inadimplência | Clientes em atraso | ALTA |

**Filtros disponíveis:** Período, competência vs caixa, vencimento vs baixa, centro de custo, categoria, responsável. Exportação em diversos formatos.

### 2.8 Módulo: Conta PJ Integrada

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Conta PJ | Conta bancária dentro da plataforma | BAIXA |
| Extrato integrado | Extrato sincronizado com ERP | BAIXA |
| Pagamentos | PIX, TED, boleto via conta | BAIXA |
| Recebimentos | Cobranças creditadas na conta | BAIXA |

**Insight para KEYRA:** FORA do escopo. O KEYRA não é instituição de pagamento.

### 2.9 Módulo: Conexão com Contador

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Acesso em tempo real | Contador vê dados diretamente | MÉDIA - futuro |
| NFs automáticas | Notas disponibilizadas ao contador | MÉDIA - futuro |
| Exportação contábil | Dados exportáveis para contabilidade | MÉDIA - futuro |
| Eliminação email | Sem troca manual de arquivos | BAIXA |

### 2.10 Módulo: Mobile (CA de Bolso)

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Acesso a clientes | Consulta de cadastros | ALTA |
| Criação de propostas | Orçamentos pelo celular | BAIXA |
| Emissão NF | Nota fiscal pelo app | BAIXA |
| Cobrança | Receber pagamentos | ALTA |
| Monitoramento financeiro | Dashboard no celular | ALTA |

### 2.11 Módulo: IA (Conta AI Captura)

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Captura OCR | Leitura automática de documentos | ALTA - para upload PDFs |
| Extração de dados | Dados de notas/boletos extraídos | ALTA |

---

## 3. MODELO DE PREÇOS DO CONTA AZUL

### Planos Oficiais (2026)

| Plano | Público | Faturamento | Anual | Trimestral | Usuários |
|-------|---------|-------------|-------|------------|----------|
| **Essencial** | MEI | Até R$ 81K/ano | R$ 159,90/mês | R$ 239,90/mês | 1 |
| **Controle** | Microempresa | R$ 81K-360K/ano | R$ 309,90/mês | R$ 449,90/mês | 2 |
| **Avançado** | Pequeno porte | R$ 360K-1.5M/ano | R$ 399,90/mês | R$ 519,90/mês | 5 |
| **Performance** | Médio porte | Acima R$ 1.5M/ano | R$ 719,90/mês | R$ 839,90/mês | 15 |

### Análise Comparativa — Fonte Alternativa (ComparaSoftware)

| Plano | Preço | Perfil |
|-------|-------|--------|
| Simples | ~R$ 69/mês | MEI e autônomos |
| Plus | ~R$ 119/mês | Microempresas |
| Pro | ~R$ 189/mês | PMEs com equipe |
| Premium | ~R$ 299/mês | Empresas crescendo |

**Nota:** Há divergência entre fontes. O Conta Azul provavelmente atualiza preços frequentemente e segmenta por canal.

### Política Comercial
- Enquadramento por **porte do CNPJ** (novas assinaturas)
- Enquadramento por **faturamento** (assinaturas ativas)
- Reajuste trimestral possível (aviso 7 dias antes)
- Ciclos: mensal, trimestral, anual (anual mais barato)

### Análise de Pricing para KEYRA
O Conta Azul é **significativamente mais caro** que sistemas de estética:
- Essencial: R$ 159,90 vs Gestek: R$ 69,90
- Controle: R$ 309,90 vs Belle: ~R$ 72/mês

Isso confirma que o **público de estética tem disposição de pagar MENOS** que PMEs genéricas. O KEYRA deve ficar na faixa R$ 79-199/mês para os planos principais, posicionando-se entre Gestek (operacional barato) e Conta Azul (ERP caro).

---

## 4. ANÁLISE: POR QUE O CONTA AZUL NÃO SERVE PARA ESTÉTICA

### Problemas do Conta Azul para o nicho de estética

| Problema | Explicação | Como KEYRA resolve |
|----------|-----------|-------------------|
| **Sem agenda** | Conta Azul não tem módulo de agendamento | Agenda como core/Pilar 1 |
| **Lançamento manual** | Vendas precisam ser registradas manualmente | Comanda automática da agenda |
| **Genérico demais** | Serve 13+ segmentos, não especializado | 100% focado em estética |
| **Complexo para esteticista** | Interface pensada para gestor/financeiro | UI para não-financistas |
| **Sem lucro por serviço** | DRE geral, não por procedimento | Lucro por cada serviço |
| **Sem insumos por serviço** | Estoque de produtos, não de insumos | Custo de insumo por procedimento |
| **Sem comissionamento** | Não calcula comissão de profissional | Comissão automática |
| **Sem precificação** | Não calcula preço mínimo baseado em custos | Precificação inteligente |
| **Caro para o nicho** | R$ 160-720/mês | R$ 79-199/mês |
| **Sem WhatsApp nativo** | Cobrança por SMS/email, WhatsApp limitado | WhatsApp como canal primário |
| **Gráficos vs números** | Dashboards com gráficos | Números absolutos (princípio UX) |
| **Sem metas** | Não tem acompanhamento de metas | Metas por período |
| **Jargão financeiro** | DRE, fluxo de caixa, competência, etc | Linguagem simples |

### A "Ponte" que o KEYRA constrói

```
CONTA AZUL (ERP genérico):
  Lançamento manual → Financeiro → Relatórios → Decisão
  (a esteticista NÃO faz isso)

GESTEK (sistema operacional estética):
  Agenda → Atendimento → [NADA financeiro real]
  (a esteticista NÃO sabe se dá lucro)

KEYRA (financeiro operacional estética):
  Agenda → Comanda automática → Financeiro automático → Lucro por serviço → Decisão
  (a esteticista sabe TUDO sem fazer NADA manualmente)
```

---

## 5. MODELO DE DADOS INFERIDO DO CONTA AZUL

```
Empresa (tenant)
├── Configurações
│   ├── PlanoContas (1:N) — categorias financeiras
│   ├── CentroCusto (1:N)
│   ├── ContaBancária (1:N)
│   └── ConfigFiscal
│
├── Contato (1:N) — clientes + fornecedores
│   ├── Histórico de compras/vendas
│   └── Dados fiscais
│
├── Produto (1:N) — catálogo
│   ├── Variações (1:N)
│   ├── EstoqueAtual (1:1)
│   └── MovimentaçãoEstoque (1:N)
│
├── Venda (1:N)
│   ├── Orçamento → Pedido → NF (fluxo)
│   ├── ItemVenda (1:N)
│   ├── Pagamento (1:N) — forma, valor, vencimento
│   ├── Cobrança (1:1) — boleto, PIX, cartão
│   └── NotaFiscal (1:1)
│
├── Compra (1:N)
│   ├── Fornecedor (N:1)
│   ├── ItemCompra (1:N)
│   └── NotaFiscalEntrada (1:1)
│
├── Financeiro
│   ├── ContaPagar (1:N)
│   │   ├── Fornecedor (N:1)
│   │   ├── Categoria (N:1)
│   │   ├── CentroCusto (N:1)
│   │   └── Status: aberto/pago/vencido
│   ├── ContaReceber (1:N)
│   │   ├── Cliente (N:1)
│   │   ├── Cobrança (1:1)
│   │   ├── Categoria (N:1)
│   │   └── Status: aberto/recebido/vencido
│   └── Conciliação (1:N)
│       ├── ExtratoBancário (N:1)
│       └── Lançamento (N:1)
│
├── Contrato (1:N) — recorrentes
│   ├── Periodicidade
│   ├── CobrançaAutomática
│   └── NFAutomática
│
├── Relatórios (gerados)
│   ├── DRE
│   ├── FluxoCaixa
│   ├── VendasPorPeríodo
│   └── EstoquePosição
│
└── Integração
    ├── Bancos (10+)
    ├── Marketplaces (6+)
    ├── Contabilidade
    └── API aberta
```

### Adaptação do Modelo para KEYRA

O que o KEYRA **herda** do modelo Conta Azul (conceitual):

```
Clínica (tenant)
├── PlanoContas (pré-configurado estética, customizável)
├── Receita (= ContaReceber, mas gerada automaticamente)
│   ├── Origem: Comanda (automática da agenda)
│   ├── Categoria: auto (tipo de serviço)
│   ├── Status: pendente/pago/inadimplente
│   └── Detalhamento: valor bruto, taxa cartão, líquido
├── Despesa (= ContaPagar)
│   ├── DespesaFixa (recorrentes mensais)
│   ├── DespesaVariável (insumos, compras)
│   └── Categoria: auto ou manual
├── DRE (= DRE gerencial, mas automático)
│   └── Diferencial: por SERVIÇO, não só por período
├── FluxoCaixa (= FluxoCaixa)
│   ├── Realizado (das comandas pagas)
│   └── Projetado (da agenda futura)
└── Inadimplência (= Contas a Receber vencidas)
    └── Ação: WhatsApp automático
```

O que o KEYRA **NÃO herda**:
- NF-e/NFS-e/NFC-e (futuro)
- Módulo de compras/fornecedores complexo
- Integração marketplace
- Conta PJ bancária
- Centros de custo complexos
- Fluxo orçamento → pedido → NF
- Integração contábil direta

---

## 6. PADRÕES DE DESIGN DO CONTA AZUL APLICÁVEIS AO KEYRA

### 6.1 Automação Progressiva

O Conta Azul automatiza em camadas:
1. **Camada 1:** Registro automático (venda → financeiro)
2. **Camada 2:** Conciliação automática (banco → lançamento)
3. **Camada 3:** Cobrança automática (régua de lembretes)
4. **Camada 4:** Relatórios automáticos (DRE, fluxo de caixa)

O KEYRA deve espelhar com camadas PRÓPRIAS:
1. **Camada 1:** Comanda automática (agenda → financeiro)
2. **Camada 2:** Categorização automática (serviço → plano de contas)
3. **Camada 3:** Cálculo automático (receita - custos = lucro)
4. **Camada 4:** DRE + fluxo de caixa automáticos

### 6.2 Contas a Receber Automático

No Conta Azul: "cria automaticamente registros de contas a receber após vendas"
No KEYRA: cria automaticamente receita após atendimento na agenda (comanda)

### 6.3 Régua de Cobrança Multi-Canal

```
CONTA AZUL:                      KEYRA (adaptado):
Cobrança emitida                 Atendimento realizado
  ↓ Pré-vencimento: email          ↓ Pagamento na hora (ideal)
  ↓ No vencimento: SMS             ↓ Se não pagou: WhatsApp 24h
  ↓ Pós-vencimento: WhatsApp       ↓ Se não pagou 3d: 2o WhatsApp
  ↓ Atraso: email + SMS            ↓ Se não pagou 7d: alerta dashboard
  ↓ Inadimplência: relatório       ↓ Inadimplente: lista + bloqueio
```

### 6.4 DRE como Feature Central de Valor

O Conta Azul posiciona o DRE como resposta para "descubra se o negócio dá lucro". O KEYRA deve posicionar como: "descubra se CADA SERVIÇO dá lucro" — granularidade muito maior.

### 6.5 Fluxo de Caixa Projetado

O Conta Azul projeta fluxo de caixa baseado em contas a receber futuras. O KEYRA pode projetar baseado em **agenda futura** — atendimentos já agendados que vão gerar receita.

```
CONTA AZUL: Projeção = contas a receber futuras + recorrências
KEYRA:      Projeção = agenda futura × preço médio + pacotes vendidos
```

### 6.6 Captura via IA (OCR)

O Conta AI Captura extrai dados de documentos automaticamente. O KEYRA pode aplicar isso no módulo de Upload de PDFs — extrair valores de notas de fornecedores, comprovantes de pagamento.

---

## 7. COMPARATIVO: CONTA AZUL vs CONCORRENTES vs KEYRA

### ERPs Genéricos (concorrentes do Conta Azul)

| Sistema | Preço base | Foco | Diferencial |
|---------|-----------|------|-------------|
| **Conta Azul** | R$ 159-720/mês | PME geral | Simplicidade, NF, contador |
| **Omie** | R$ 99/mês | PME geral | ERP completo, CRM |
| **Bling** | R$ 25/mês | E-commerce | Integrações marketplace |
| **Tiny** | R$ 50/mês | E-commerce | Custo-benefício |
| **Nibo** | Não divulgado | BPO financeiro | Foco em contadores |

### Posicionamento do KEYRA no Mercado

```
                    COMPLEXIDADE
                         ↑
        Conta Azul ●     |     ● Omie
        (R$160-720)      |     (R$99+)
                         |
                    ● Kamino
                    (custom)
                         |
        ─────────────────┼─────────────── GENERALISTA ←→ ESPECIALISTA
                         |
                    ● KEYRA
                    (R$79-199)
                         |
        Gestek ●         |     ● Belle
        (R$70-100)       |     (~R$72)
                         |
                    SIMPLICIDADE
```

O KEYRA ocupa o quadrante **ESPECIALISTA + MÉDIO** — mais sofisticado financeiramente que Gestek/Belle, mais simples e barato que Conta Azul/Omie, 100% focado em estética.

---

## 8. LIÇÕES DE PRODUTO DO CONTA AZUL PARA O KEYRA

### 8.1 Segmentação por Porte Funciona
O Conta Azul segmenta planos por **faturamento da empresa**. O KEYRA deve segmentar por **número de profissionais + funcionalidades**:
- Start: 1 profissional, básico
- Crescimento: 2-5 profissionais, DRE + precificação
- Autoridade: 5+, IA + multi-unidade

### 8.2 Integração com Contador como Diferencial
O Conta Azul destaca a conexão com contador. O KEYRA pode oferecer **exportação de relatórios para contador** — a esteticista gera o DRE e envia PDF/CSV pro contador, sem precisar de outro software.

### 8.3 Cobrança Automática Gera Receita
O Conta Azul reduz inadimplência com régua de cobrança. O KEYRA deve implementar lembretes de pagamento via WhatsApp — cada cliente inadimplente recuperado é receita real.

### 8.4 DRE e Fluxo de Caixa são Features de Retenção
No Conta Azul, DRE e fluxo de caixa são features que fazem o usuário **depender** do sistema. No KEYRA, DRE automático + lucro por serviço serão o **lock-in** — uma vez que a esteticista vê o lucro real de cada procedimento, não consegue mais trabalhar sem.

### 8.5 Mobile é Essencial
O app CA de Bolso mostra que o público PME usa mobile ativamente. O KEYRA precisa ser mobile-first — a esteticista consulta o dashboard entre atendimentos.

### 8.6 Simplicidade Vende
A maior qualidade citada do Conta Azul é "facilidade de uso" e "interface intuitiva". O KEYRA deve ser ainda MAIS simples — sem jargão financeiro, sem gráficos, números absolutos.

### 8.7 Relatórios Personalizáveis (Ponto Fraco CA)
"Faltam opções para customizar relatórios" é uma reclamação frequente. O KEYRA pode evitar isso com **relatórios pré-configurados que respondem as perguntas certas** em vez de relatórios genéricos customizáveis.

---

## 9. RECOMENDAÇÕES ESTRATÉGICAS CONSOLIDADAS

### 9.1 Conceitos a IMPORTAR do Conta Azul

| Conceito | Adaptação KEYRA | Prioridade |
|----------|-----------------|------------|
| Contas a receber automático | Receita gerada da comanda (não da venda manual) | P0 - MVP |
| DRE gerencial | DRE automático + por serviço | P0 - MVP |
| Fluxo de caixa realizado | Baseado em comandas pagas | P0 - MVP |
| Fluxo de caixa projetado | Baseado em agenda futura | P1 |
| Régua de cobrança | WhatsApp automático para inadimplentes | P1 |
| Categorização financeira | Plano de contas pré-configurado estética | P0 - MVP |
| Baixa automática | Pagamento registrado → financeiro atualizado | P0 - MVP |
| Captura IA (OCR) | Upload PDFs com extração automática | P2 |
| Exportação contábil | PDF/CSV do DRE para o contador | P1 |
| Mobile | Dashboard numérico no celular | P0 - MVP |

### 9.2 Conceitos a NÃO IMPORTAR

| Conceito | Motivo |
|----------|--------|
| Emissão NF-e/NFS-e/NFC-e | Complexidade fiscal, futuro V3+ |
| Integração marketplace | Público não vende online |
| Conta PJ bancária | KEYRA não é banco |
| Multi-centro de custo | Complexidade desnecessária |
| Integração contábil direta | Exportação PDF é suficiente |
| Fluxo orçamento → pedido → NF | Fluxo é agenda → comanda |
| Módulo de compras complexo | Despesas simples são suficientes |
| Gráficos e dashboards visuais | Princípio UX: números absolutos |

### 9.3 Narrativa Competitiva

> **Para a esteticista que usa Gestek:** "Você organiza sua clínica, mas sabe se dá lucro? O KEYRA mostra."
> 
> **Para a esteticista que usa Conta Azul:** "Você gasta 3h/dia lançando dados no ERP? O KEYRA faz sozinho."
> 
> **Para a esteticista que não usa nada:** "Sua agenda vira seu financeiro automaticamente. Zero lançamento manual."

---

## 10. MATRIZ FINAL: FEATURES DO CONTA AZUL → KEYRA

| Feature Conta Azul | Existe no KEYRA? | Adaptação | Sprint |
|-------------------|-----------------|-----------|--------|
| DRE gerencial | SIM | Automático + por serviço | MVP |
| Fluxo de caixa | SIM | Realizado + projetado (agenda) | MVP |
| Contas a receber | SIM | Gerado da comanda automática | MVP |
| Contas a pagar | SIM | Despesas fixas + variáveis | MVP |
| Categorização | SIM | Plano de contas estética | MVP |
| Baixa automática | SIM | Pagamento → atualiza financeiro | MVP |
| Mobile | SIM | PWA / React Native | MVP |
| Conciliação bancária | SIMPLIFICADO | Match pagamento x comanda | MVP |
| Régua cobrança | SIM | WhatsApp automático | V1 |
| Controle estoque | SIM | Insumos por serviço | V1 |
| Contratos recorrentes | PARCIAL | Pacotes com sessões | V1 |
| Relatório vendas | SIM | Por serviço + profissional | V1 |
| Ticket médio | SIM | Por serviço + cliente | V1 |
| Inadimplência | SIM | Lista + WhatsApp + bloqueio | V1 |
| Exportação contábil | SIM | PDF/CSV do DRE | V1 |
| Captura IA | FUTURO | Upload PDFs com OCR | V2 |
| NFS-e | FUTURO | Emissão automática | V3 |
| Integração bancária | FUTURO | Open Banking | V3 |
| Integração marketplace | NÃO | Fora do escopo | — |
| Conta PJ | NÃO | Fora do escopo | — |

---

## FONTES

- [Conta Azul - Site Oficial](https://contaazul.com/)
- [Conta Azul - Sistema ERP](https://contaazul.com/funcionalidades/sistema-erp/)
- [Conta Azul - Controle de Vendas](https://contaazul.com/funcionalidades/controle-de-vendas/)
- [Conta Azul - Controle de Estoque](https://contaazul.com/funcionalidades/controle-de-estoque/)
- [Conta Azul - Gestão Financeira](https://contaazul.com/funcionalidades/gestao-financeira/)
- [Conta Azul - Conciliação Bancária](https://contaazul.com/funcionalidades/conciliacao-bancaria/)
- [Conta Azul - Relatórios](https://contaazul.com/funcionalidades/relatorios/)
- [Conta Azul - Planos](https://contaazul.com/planos/)
- [Conta Azul - Como Funciona (Blog)](https://contaazul.com/blog/software-conta-azul-como-funciona/)
- [Conta Azul - B2B Stack](https://www.b2bstack.com.br/product/conta-azul/avaliacoes)
- [Conta Azul - Reclame Aqui](https://www.reclameaqui.com.br/empresa/contaazul/)
- [Conta Azul - Preços e Planos (ComparaSoftware)](https://www.compararsoftware.com.br/contabilidade/articulos/conta-azul-precos-planos)
- [Conta Azul - GetApp](https://www.getapp.com/operations-management-software/a/contaazul/)
- [Comparativo ERPs PME (Multise)](https://multise.com.br/conta-azul-omie-nibo-ou-bling-comparativo-entre-os-erps-mais-usados-por-pmes/)
- [Conta Azul vale a pena? (Roama)](https://roamagestao.com.br/conta-azul-vale-a-pena/)
