# KEYRA — Contexto Completo da Idealizadora

> Documento consolidado: audios + visao estrategica + especificacao funcional completa.
> Data: 2026-04-12

---

## 1. IDENTIDADE DO PRODUTO

### Significado do Nome
**KEYRA** = **KEY** (chave) + **Receita** + **Acelerada**

A chave para acelerar a receita de profissionais de estetica.

### Posicionamento
**"O primeiro financeiro operacional para estetica"** — superando limitacoes de sistemas genericos que exigem entradas manuais.

### Problema Central que Resolve
A **desconexao entre operacao e financeiro**. Sistemas tradicionais (Conta Azul) atuam apenas apos o dinheiro ja existir. Nao controlam a **origem do faturamento**, que neste nicho esta diretamente ligada a **agenda e aos atendimentos realizados**.

### Diferencial Estrutural
O financeiro **NAO e alimentado manualmente**. Ele e **gerado automaticamente** a partir da operacao.

**Diferente de ERPs tradicionais, o KEYRA:**
- NAO comeca pelo financeiro
- Comeca pela **agenda**
- Automatiza o financeiro a partir do atendimento
- Permite leitura de **lucro por servico**

---

## 2. CONCORRENTE REFERENCIADO

**Conta Azul** — Limitado porque:
- So faz entradas/saidas e DRE basica
- NAO faz precificacao
- NAO integra com agenda
- NAO gera panoramas de metas
- Exige lancamentos manuais pos-faturamento
- NAO controla a origem do faturamento

### 7 Diferenciais vs Conta Azul
1. **Integracao total operacao-financeiro** — financeiro gerado automaticamente da agenda
2. **Receita prevista real** — baseada diretamente nos agendamentos
3. **Lucro por servico** — identifica o que realmente gera resultado
4. **Comanda automatica** — conecta atendimento e faturamento sem friccao
5. **Inteligencia de negocio** — alertas e recomendacoes automaticas
6. **Foco no nicho** — desenhado especificamente para estetica e saude
7. **Decisoes preditivas** — projecoes baseadas na agenda preenchida

---

## 3. PUBLICO-ALVO

### Perfil da Usuaria Final
- Profissional de estetica (esteticista, dentista, dermatologista)
- Pode ter studio/consultorio com mais de um profissional
- Trabalha com produtos e servicos
- **NAO tem familiaridade** com termos financeiros complexos ou leitura de graficos
- Profissionais autonomas ou pequenas clinicas esteticas

### Papel da Idealizadora
Mentora financeira para profissionais de estetica. O KEYRA e a ferramenta que suporta o trabalho de mentoria — o sistema gera panoramas e metas, a mentora ajusta junto com a cliente.

---

## 4. QUATRO PILARES DO SISTEMA

| Pilar | Funcao |
|-------|--------|
| **Agenda** | Origem do faturamento |
| **Servicos** | Estrutura de monetizacao |
| **Financeiro** | Registro e controle |
| **Inteligencia** | Analise de lucro e decisoes |

---

## 5. FLUXO CENTRAL — "Toda uma ligacao"

```
Usuaria cadastra servicos (com custo e preco)
       ↓
Agenda paciente vinculando um servico
       ↓
Sistema registra RECEITA PREVISTA automaticamente
       ↓
Atendimento marcado como REALIZADO
       ↓
Sistema cria COMANDA automaticamente
       ↓
Pagamento registrado (Pix/cartao)
       ↓
Sistema cria TRANSACAO FINANCEIRA (entrada)
       ↓
Dados alimentam FLUXO DE CAIXA e DRE
       ↓
DASHBOARD com numeros absolutos + ANALISES para metas
```

**Relacao estrutural:**
`Servico → Agenda → Comanda → Transacao → DRE`

---

## 6. MODULOS FUNCIONAIS COMPLETOS

### 6.1 Agenda (Core Operacional)
**Funcao:** Gerenciar todos os atendimentos e ser a BASE de geracao de receita prevista.

**Funcionalidades:**
- Visualizacao diaria, semanal e mensal
- Criacao de agendamentos
- Associacao de paciente e servico
- Controle de status: Agendado | Realizado | Cancelado | Falta

**Logica interna:**
- Cada agendamento gera uma **receita prevista** automaticamente
- Receita convertida em **receita realizada** quando houver pagamento

**Integracoes futuras:**
- WhatsApp para confirmacao automatica e cobranca instantanea

### 6.2 Pacientes (CRM Basico)
**Funcao:** Armazenar e organizar dados dos clientes.

**Dados:** Nome, Telefone, Historico de atendimentos

**Evolucao — Prontuario Financeiro Integrado:**
- Historico de procedimentos + evolucao financeira por cliente
- Ticket medio, frequencia, LTV (Lifetime Value)
- Facilita upsell personalizado sem sair do fluxo

### 6.3 Servicos / Produtos (Catalogo)
**Funcao:** Estruturar tudo o que e vendido.

**Tipos:** Servicos, Produtos, Protocolos, Pacotes, Combos

**Dados:** Nome, Preco de venda, Custo, Duracao, Categoria

**Logica interna:**
- Custo permite calculo de lucro
- Servico vinculado diretamente a agenda
- Cadastro de insumos por servico (ex: 1 frasco acido hialuronico por botox)

### 6.4 Comanda (Ordem de Servico)
**Funcao:** Registrar o atendimento realizado.

**Logica:**
- Criada **automaticamente** a partir de um agendamento realizado
- Pode ser editada manualmente

**Dados:** Servicos executados, Valor total, Status (Aberto | Finalizado | Pago)

### 6.5 Financeiro
**Funcao:** Controlar entradas e saidas.

**Funcionalidades:**
- Registro **automatico** de entradas via comanda
- Registro manual de despesas
- Classificacao por categoria
- Separacao por produtos vs servicos
- Receitas separadas por profissional e por centro de custo
- Custos fixos vs variaveis com impacto de cada custo

**Dados:** Tipo (entrada/saida), Valor, Data, Categoria, Origem (Comanda | Manual | Importacao futura)

### 6.6 Custos e Precificacao
**Funcao:** Classificar custos e calcular precos com margem.

**Custos:**
- Custo fixo vs variavel
- Impacto de cada custo
- Custo variavel compoe a precificacao

**Precificacao:**
- A partir dos custos imputados, calcular preco de venda com margem de lucratividade
- Precificacao de pacotes de servicos
- Projecao de preco

**Evolucao — Recomendacoes IA de precos:**
- "Aumente preco de peeling em 15% — concorrencia permite"
- Benchmarks locais baseados em historico

### 6.7 DRE (Demonstracao de Resultado)
**Funcao:** Apresentar o resultado financeiro do negocio.

**Estrutura:** Receita total - Custos - Despesas = Lucro

**Diferencial:** Analise por servico (lucro por procedimento)

### 6.8 Controle de Estoque / Insumos
**Funcao:** Controlar insumos por sessao/atendimento.

**Logica:**
- Cadastro de servicos com **lista de insumos** (ex: 1 frasco acido por botox)
- Subtracao automatica do estoque no atendimento
- Alerta de recompra com precos de fornecedores integrados
- Rateio automatico de insumos conforme agendamentos

### 6.9 Upload de Documentos (Fase futura)
**Funcao:** Automatizar lancamentos financeiros.

**Entrada:** PDFs bancarios, PDFs de maquininhas
**Processamento:** Leitura dos dados, identificacao de entradas/saidas/taxas, classificacao automatica
**Saida:** Lancamentos no financeiro

### 6.10 Dashboard (Painel Inicial)
**Objetivo:** Exibir de forma rapida e clara a situacao do negocio.

**Principios UX da idealizadora:**
1. **Numeros absolutos, NAO graficos** — "as pessoas nao sabem ler graficos"
2. **Comparativos claros** — receita deste mes vs mes anterior
3. **Tela unica** — mostra tudo de uma vez
4. **Simplicidade** — profissional entende sem ser financista

**Componentes:**
1. **Resumo financeiro:** Faturamento, Despesas, Lucro do mes, Receita prevista
2. **Agenda do dia:** Qtd atendimentos, Valor previsto, Status
3. **Indicadores:** Ticket medio, Servico mais vendido, Servico mais lucrativo, Taxa de comparecimento
4. **Alertas:** Alta taxa de faltas, Queda de lucro, Baixa margem
5. **Visao de lucro:** Servicos mais lucrativos, Margem media
6. **Comparativos:** Mes atual vs anterior, Diferenca frente a meta

**Nota:** A idealizadora menciona que aceita UM grafico (receita vs despesas) mas prioriza numeros.

### 6.11 Camada de Inteligencia (Evolucao)
**Funcao:** Gerar insights automaticos.

**Funcionalidades:**
- Calculo de lucro liquido por servico/profissional em tempo real
  - Ex: Botox: receita R$500 - insumos R$100 - comissao 20% = R$300
  - Alertas de rentabilidade baixa
- Previsao de lucro semanal/mensal via agenda
  - Ex: "Com 15 agendamentos/semana, lucro estimado R$8k"
  - Cenarios "what-if" (+10% upsell)
- Analise de rentabilidade por horario/profissional
  - Heatmap da agenda (lucro/hora por faixa)
  - Recomendacoes para otimizar horarios ou precos dinamicos
- Upsell automatico
  - Sugestoes IA na agenda (ex: "Cliente de botox: oferecer manutencao?")
  - Pacotes recorrentes (5 sessoes 10% off)
  - Receita recorrente e financeiro projetado
- Panoramas para construcao de metas (suporte ao trabalho da mentora)
- Fluxo de caixa operacional: caixa projetado vs real
  - Integracao bancaria (ex: Asaas)
  - Alertas de inadimplencia (reenvio Pix automatico)

### 6.12 Marketplace de Fornecedores (Futuro)
**Funcao:** Integrar fornecedores de insumos esteticos.

- Precos auto-atualizados
- Compras em bulk com desconto por volume projetado da agenda
- Otimizacao de custos variaveis

---

## 7. ESTRUTURA DE DADOS (BASE)

### Tabelas Principais

| Tabela | Campos-chave |
|--------|-------------|
| `users` | id, nome, email |
| `patients` | id, nome, telefone |
| `services` | id, nome, tipo, preco, custo, duracao, categoria |
| `appointments` | id, patient_id, service_id, data_hora_inicio, data_hora_fim, status |
| `orders` (comandas) | id, appointment_id, valor_total, status |
| `transactions` | id, tipo, valor, data, categoria, origem |

**Tabelas adicionais identificadas nos audios:**
- `organizations` — studios/clinicas (multi-tenant)
- `professionals` — profissionais por organizacao
- `cost_items` — custos fixos e variaveis
- `inventory_items` — insumos e estoque
- `inventory_movements` — movimentacoes (rateio por atendimento)
- `goals` — metas projetadas
- `documents` — uploads de PDFs
- `service_supplies` — lista de insumos por servico

---

## 8. MVP (ESCOPO INICIAL)

### Objetivo
Validar se a usuaria consegue: **se organizar, entender seu financeiro, enxergar lucro**.

### Inclui no MVP
- Agenda
- Servicos (com custo e preco)
- Pacientes
- Comanda automatica
- Financeiro basico (entradas automaticas + saidas manuais)
- Dashboard simples (numeros absolutos)
- DRE basica (por servico)

### NAO inclui no MVP (fase futura)
- Importacao de extratos PDF
- Integracao bancaria (Asaas, Pix automatico)
- Relatorios avancados
- Multiusuarios (equipe completa)
- Inteligencia preditiva (IA)
- Marketplace de fornecedores
- WhatsApp integration
- Upsell automatico

---

## 9. MODELO DE MONETIZACAO

### Assinatura Recorrente

| Plano | Escopo |
|-------|--------|
| **Start** | Funcionalidades basicas, organizacao inicial |
| **Crescimento** | DRE, Relatorios, Visao de lucro |
| **Autoridade** | Analises estrategicas mensais, Recomendacoes de negocio |

### Formatos de Pagamento
- Mensal
- Trimestral
- Anual (desconto progressivo para maior duracao)

---

## 10. DIRETRIZES PARA DESENVOLVIMENTO

O sistema deve priorizar:
1. **Simplicidade de uso**
2. **Automacao do financeiro** (a partir da operacao)
3. **Integracao entre modulos** (agenda → comanda → financeiro → lucro)
4. **Clareza visual no dashboard** (numeros absolutos)
5. **Foco em geracao de lucro** (lucro por servico, decisoes preditivas)

> "Este produto nao e apenas um sistema de gestao. E uma plataforma que organiza a operacao e traduz automaticamente essa operacao em resultado financeiro e tomada de decisao."

---

## 11. 10 FUNCIONALIDADES ESTRATEGICAS

| # | Feature | Descricao |
|---|---------|-----------|
| 1 | **Automacao Total de Receita da Agenda** | Ao concluir atendimento: gera fatura Pix/NF, deduz custos variaveis, registra no financeiro. WhatsApp para confirmacao e cobranca. |
| 2 | **Lucro Liquido por Servico/Profissional** | Dashboard tempo real: Botox R$500 - insumos R$100 - comissao 20% = R$300. Alertas rentabilidade baixa. |
| 3 | **Previsao de Lucro via Agenda** | Projeta faturamento/lucro futuro. Cenarios what-if (+10% upsell). |
| 4 | **Controle Inteligente de Insumos** | Insumos por sessao, subtracao automatica, alerta de recompra com precos de fornecedores. |
| 5 | **Upsell Automatico e Pacotes** | Sugestoes IA na agenda, pacotes recorrentes, receita projetada. |
| 6 | **Rentabilidade por Horario/Profissional** | Heatmap lucro/hora, recomendacoes de otimizacao de horarios e precos. |
| 7 | **Prontuario Financeiro** | Historico procedimentos + financeiro por cliente: ticket medio, frequencia, LTV. |
| 8 | **Recomendacoes IA de Precos** | "Aumente peeling em 15%". Benchmarks locais. |
| 9 | **Fluxo de Caixa Operacional** | Caixa projetado vs real, integracao Asaas, alertas inadimplencia. |
| 10 | **Marketplace Fornecedores** | Precos auto-atualizados, compras em bulk, otimizacao de custos. |

---

## 12. FLUXO DA USUARIA (JORNADA)

1. Cadastro inicial
2. Cadastro de servicos (com custos e precos)
3. Cadastro de pacientes
4. Agendamento (paciente + servico)
5. Atendimento (marcar como realizado → comanda automatica)
6. Registro de pagamento
7. Visualizacao do dashboard

**Resultado:** O sistema constroi automaticamente o financeiro sem necessidade de lancamentos manuais complexos.
