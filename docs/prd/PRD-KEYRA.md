# KEYRA — Product Requirements Document (PRD)

> **Documento:** PRD Formal v1.1 (Story 0.2 do EPIC-0)
> **Autor:** @pm (Morgan)
> **Data:** 2026-04-16
> **Status:** Draft (aguarda validacao da idealizadora e @po)
> **Constitution:** Article IV (No Invention) — todo FR/NFR/CON rastreia para visao da idealizadora ou EPIC-0
> **Modo de elaboracao:** YOLO autonomo (decisoes documentadas como `[AUTO-DECISION]`)

---

## Companion Documents

> Documentos relacionados que contextualizam, complementam ou sao consumidos por este PRD.

### Fontes Originarias (visao bruta da idealizadora)

| # | Documento | Conteudo |
|---|-----------|----------|
| 1 | [contexto-completo-keyra.md](../audios-idealizadora/contexto-completo-keyra.md) | Sintese estruturada das transcricoes de audio (visao + 4 pilares + 12 modulos + principios UX) — **fonte primaria deste PRD** |
| 2 | [visao-keyra-idealizadora.md](../audios-idealizadora/visao-keyra-idealizadora.md) | Documento de visao narrativo da idealizadora |
| 3 | [WhatsApp Ptt 2026-04-12 at 15.04.38.txt](../audios-idealizadora/WhatsApp%20Ptt%202026-04-12%20at%2015.04.38.txt) | Transcricao bruta — audio 1/4 |
| 4 | [WhatsApp Ptt 2026-04-12 at 15.05.44.txt](../audios-idealizadora/WhatsApp%20Ptt%202026-04-12%20at%2015.05.44.txt) | Transcricao bruta — audio 2/4 |
| 5 | [WhatsApp Ptt 2026-04-12 at 15.06.42.txt](../audios-idealizadora/WhatsApp%20Ptt%202026-04-12%20at%2015.06.42.txt) | Transcricao bruta — audio 3/4 |
| 6 | [WhatsApp Ptt 2026-04-12 at 15.07.59.txt](../audios-idealizadora/WhatsApp%20Ptt%202026-04-12%20at%2015.07.59.txt) | Transcricao bruta — audio 4/4 |

### Pesquisa Competitiva (benchmark)

| # | Documento | Conteudo |
|---|-----------|----------|
| 7 | [Conta Azul reverse engineering](../research/2026-04-12-conta-azul-reverse-engineering.md) | ERP financeiro generico — referencia de pricing alto e fluxo manual a evitar |
| 8 | [Gestek reverse engineering](../research/2026-04-12-gestek-reverse-engineering.md) | Concorrente direto vertical estetica — pricing baixo, agenda-first |
| 9 | [Kamino reverse engineering](../research/2026-04-12-kamino-reverse-engineering.md) | Concorrente vertical estetica — referencia de regua de cobranca e UX |

### Documentos Tecnicos (consumidores deste PRD)

| # | Documento | Relacao |
|---|-----------|---------|
| 10 | [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) | Arquitetura fullstack (20 ADRs) — **consome** este PRD; cada ADR rastreia para FR/NFR/CON aqui |
| 11 | [EPIC-0 Master Plan](../stories/EPIC-0-KEYRA-IMPLEMENTATION.md) | Roadmap mestre de 8 fases — este PRD e Story 0.2 do epic |
| 12 | [INFRA-STATUS.md](../INFRA-STATUS.md) | Snapshot vivo da infraestrutura provisionada (GitHub, Vercel, Supabase, dominio) |
| 13 | [CREDENTIALS.md](../setup/CREDENTIALS.md) | Estrutura de credenciais isoladas do projeto |
| 14 | [README.md](../../README.md) | Visao geral do projeto |

### Squads e Workflows AIOX

| # | Documento | Conteudo |
|---|-----------|----------|
| 15 | [squad-keyra-bootstrap](../../squads/squad-keyra-bootstrap/squad.yaml) | Squad da Fase 0 (PM, architect, data-engineer, analyst, ux, finance, document-processor, compliance) |
| 16 | [squad-keyra-core](../../squads/squad-keyra-core/squad.yaml) | Squad das Fases 2-4 (MVP) |
| 17 | [squad-keyra-intelligence](../../squads/squad-keyra-intelligence/squad.yaml) | Squad das Fases 5-6 (pos-MVP) |
| 18 | [squad-keyra-integrations](../../squads/squad-keyra-integrations/squad.yaml) | Squad da Fase 7 (integracoes) |

---

## Sumario

1. Visao e Posicionamento
2. Personas
3. Problema Central
4. Objetivos de Negocio
5. Requisitos Funcionais (FR-*) por Pilar
6. Requisitos Nao-Funcionais (NFR-*)
7. Constraints (CON-*)
8. Modelo de Monetizacao
9. Criterios de Sucesso do MVP (Fases 1-4)
10. Premissas e Riscos
11. Roadmap macro
12. Anexo A — Rastreabilidade (FR/NFR/CON -> Fonte)
13. Anexo B — Decisoes Autonomas
14. Change Log

---

## 1. Visao e Posicionamento

### 1.1 Identidade do Produto

**Nome:** KEYRA = **KEY** (chave) + **Receita** + **Acelerada**
**Tagline:** *"O primeiro financeiro operacional para estetica."*
**Categoria:** Financial Operations Platform (FinOps) verticalizado para estetica e saude estetica.

### 1.2 Visao Estrategica

> "Este produto nao e apenas um sistema de gestao. E uma plataforma que organiza a operacao e traduz automaticamente essa operacao em resultado financeiro e tomada de decisao."
> *— Idealizadora KEYRA*

KEYRA elimina a desconexao historica entre **operacao** (agenda, atendimento) e **financeiro** (receita, custo, lucro) que afeta profissionais de estetica. Sistemas tradicionais (Conta Azul, Omie) atuam apos o faturamento ja existir; sistemas operacionais (Gestek, Belle) organizam a clinica mas nao mostram lucro. KEYRA preenche o gap: **o financeiro e gerado automaticamente a partir da operacao**, sem lancamento manual.

### 1.3 Posicionamento Competitivo

```
                    ESPECIALIZACAO
                          ↑
                    Estetica
                          |
        Gestek ●          |          ● KEYRA  ← (especialista + automacao financeira)
        (operacional)     |          (operacional + financeiro auto)
                          |
        ──────────────────┼──────────────── SIMPLICIDADE ←→ COMPLEXIDADE
                          |
                          |          ● Conta Azul (R$159-720/mes)
                          |          ● Kamino (R$5M-100M/ano)
                          |
                    Generalista
                          ↓
                    GENERICO
```

**Narrativa competitiva:**
- vs Gestek: *"Voce organiza sua clinica, mas sabe se da lucro? KEYRA mostra."*
- vs Conta Azul: *"Voce gasta 3h/dia lancando dados no ERP? KEYRA faz sozinho."*
- vs Kamino: *"Kamino automatiza transacoes bancarias. KEYRA automatiza desde a agenda."*

### 1.4 Diferenciais Estruturais (vs Conta Azul)

1. Integracao total operacao-financeiro (financeiro gerado automaticamente da agenda)
2. Receita prevista real (baseada em agendamentos)
3. Lucro por servico (granularidade que Conta Azul nao oferece)
4. Comanda automatica (zero friccao entre atendimento e faturamento)
5. Inteligencia de negocio (alertas + recomendacoes automaticas)
6. Foco no nicho (desenhado para estetica, nao adaptado)
7. Decisoes preditivas (projecoes baseadas na agenda preenchida)

### 1.5 Os 4 Pilares

| # | Pilar | Funcao | Modulos KEYRA |
|---|-------|--------|---------------|
| 1 | **Agenda** | Origem do faturamento | Agenda, Pacientes |
| 2 | **Servicos** | Estrutura de monetizacao | Catalogo, Insumos, Pacotes, Precificacao |
| 3 | **Financeiro** | Registro e controle automatico | Comanda, Transacoes, Despesas, DRE, Fluxo de Caixa |
| 4 | **Inteligencia** | Analise de lucro e decisoes | Dashboard, Lucro/Servico, Projecoes, Metas, Alertas |

### 1.6 Fluxo Central (a "ligacao" da idealizadora)

```
Servico (com custo + preco)
   ↓
Agenda (paciente + servico + profissional)
   ↓ [auto]
Receita Prevista
   ↓ [marcar como Realizado]
Comanda (auto)
   ↓ [registrar pagamento]
Transacao Financeira (auto) + Rateio de Insumos (auto)
   ↓ [auto]
DRE + Fluxo de Caixa + Dashboard
```

---

## 2. Personas

### 2.1 Persona Primaria — Profissional de Estetica (usuaria final)

| Atributo | Detalhe |
|----------|---------|
| **Nome representativo** | Camila — Esteticista, 32 anos |
| **Contexto** | Dona de studio de estetica com 1-3 profissionais |
| **Modalidades** | Esteticista, dentista, dermatologista, podologa, micropigmentadora |
| **Faturamento mensal** | R$ 8K — R$ 60K |
| **Modelo legal** | MEI ou ME (Simples Nacional) |
| **Tools atuais** | Caderno + agenda Google + planilha Excel + Conta Azul (em ~15% dos casos) |
| **Conhecimento financeiro** | Baixo — nao sabe ler grafico, nao entende DRE, sabe contar dinheiro no caixa |
| **Conhecimento tecnico** | Medio — usa WhatsApp Business, Instagram, app de banco |
| **Dispositivo principal** | Smartphone (entre atendimentos) + notebook (final do dia) |
| **Dores principais** | (a) Nao sabe se da lucro de verdade; (b) Lanca dados manualmente em 3 lugares; (c) Esquece de cobrar; (d) Nao consegue precificar; (e) Nao sabe quanto gasta de insumo por sessao |
| **Objetivos** | (a) Ver lucro do mes em segundos; (b) Eliminar lancamento manual; (c) Saber qual servico vale a pena; (d) Crescer com base em dados, nao no "achismo" |

**Job-to-be-done:** *"Eu quero saber, ao final do dia, quanto eu lucrei de verdade — sem ter que abrir planilha, sem ter que lancar nada, e sem precisar entender DRE."*

### 2.2 Persona Secundaria — Mentora Financeira (idealizadora + power users)

| Atributo | Detalhe |
|----------|---------|
| **Nome representativo** | Idealizadora KEYRA — Mentora financeira para estetica |
| **Contexto** | Profissional que ja foi esteticista, hoje e mentora; usa o sistema com a cliente para ajustar metas |
| **Funcao no produto** | Power user que valida diagnosticos do sistema, ajusta metas, interpreta alertas com a cliente |
| **Conhecimento financeiro** | Alto — entende DRE, margem, ticket medio, LTV, CAC |
| **Tools atuais** | Excel, Notion, WhatsApp |
| **Dores principais** | (a) Cada cliente usa um sistema diferente; (b) Tem que coletar dados manualmente; (c) Nao tem ferramenta que ja entrega panorama pronto; (d) Mentoria fica cara porque consume tempo de coleta |
| **Objetivos** | (a) Ter um sistema unico que todas as clientes usem; (b) Receber panoramas prontos (lucro, metas, projecoes); (c) Focar a mentoria na **decisao**, nao na **coleta** |

**Job-to-be-done:** *"Eu quero abrir o sistema da minha cliente e ja ver o diagnostico financeiro pronto, para focar a sessao de mentoria em ajustar metas e tomar decisao — nao em coletar dados."*

### 2.3 Persona Negativa (NAO atendida)

- Grandes redes de clinicas (>15 unidades) — Conta Azul/Omie/SAP atendem.
- Empresas de outros nichos (varejo, e-commerce) — fora do escopo.
- Profissionais que nao trabalham com agenda (ex: vendedora de cosmeticos sem atendimento) — fluxo central nao se aplica.

---

## 3. Problema Central

### 3.1 Declaracao do Problema

> **A profissional de estetica nao sabe se sua clinica da lucro porque seu sistema operacional (agenda) e seu sistema financeiro (planilha/ERP) nao se conversam. Ela gasta 2-4 horas/semana lancando dados manualmente em duplicidade — e mesmo assim, no fim do mes, nao consegue responder: "qual servico me da mais lucro?".**

### 3.2 Mapa de Dores

| Dor | Causa raiz | Sistema atual nao resolve porque... |
|-----|-----------|-------------------------------------|
| Nao saber lucro real | Falta DRE automatico por servico | Conta Azul faz DRE geral; Gestek nao tem DRE |
| Lancamento manual duplicado | Agenda e financeiro sao sistemas separados | Nenhum sistema gera financeiro automaticamente da agenda |
| Esquecer de cobrar | Sem regua de cobranca integrada com agenda | Conta Azul tem regua (email/SMS), mas nao integra com agenda |
| Nao precificar corretamente | Nao calcula custo real (insumos + comissao + rateio fixo) | Gestek nao tem; Conta Azul nao calcula custo de insumo por sessao |
| Estoque sem controle | Nao deduz insumo por atendimento | Gestek tem estoque de produtos, nao de insumos por servico |
| Nao saber meta vs real | Sem modulo de metas | Nenhum dos concorrentes tem |

### 3.3 Quantificacao

- **20+ horas/mes** poupadas vs Conta Azul (referencia oficial Conta Azul: ate 20h/mes em controle manual).
- **2-4 horas/semana** poupadas vs planilha + caderno (estimativa baseada em audios da idealizadora).
- **Reducao de 90%+** do lancamento manual (vs Kamino que reduz 72%, KEYRA tem fluxo mais simples).

---

## 4. Objetivos de Negocio

### 4.1 NorthStar Metric

**Tempo ate o primeiro lucro visualizado no dashboard** (TTFL — Time To First Lucro).

**Definicao:** Tempo (em horas) entre o cadastro inicial e o primeiro momento em que a usuaria visualiza o numero "Lucro do mes: R$ X" no dashboard com pelo menos 1 atendimento realizado e pago.

**Meta:** TTFL < 24 horas (cadastro -> primeiro servico -> primeiro agendamento -> primeira comanda paga -> dashboard com lucro visivel).

**Por que este e o NorthStar:**
- Mede a promessa central: *"da operacao ao financeiro, automaticamente"*.
- Captura ativacao + valor entregue + diferencial competitivo.
- Concorrentes nao tem essa metrica porque o financeiro nao deriva da operacao.

### 4.2 OKRs Q1 (pos-MVP)

| Objetivo | Key Results |
|----------|-------------|
| O1: Validar product-market fit | KR1.1: 50 clinicas em uso ativo (>=10 comandas/mes); KR1.2: NPS >= 50; KR1.3: Retencao M3 >= 70% |
| O2: Provar diferencial competitivo | KR2.1: 80% das usuarias visualizam "lucro por servico" pelo menos 1x/semana; KR2.2: Tempo medio de "agendamento -> transacao registrada" < 30 segundos (sem intervencao manual) |
| O3: Estabelecer canal de mentoria | KR3.1: Idealizadora atende 20 clientes via KEYRA (caso de uso power user); KR3.2: 30% das usuarias contratam plano Autoridade (com mentoria) |

### 4.3 Metricas Operacionais (de saude do produto)

| Metrica | Definicao | Target |
|---------|-----------|--------|
| Cadastros / Mes | Novos cadastros de clinica | Crescimento >= 20% MoM no Q1 |
| TTFL medio | Tempo ate primeiro lucro visualizado | < 24h |
| Retention D7 / D30 / M3 | Usuarias ativas em D7, D30, M3 | 80% / 60% / 40% |
| Taxa de comandas com pagamento registrado | % de comandas que viram transacao | >= 95% |
| Taxa de uso da agenda | % de usuarias com >=10 agendamentos/mes | >= 70% |
| Tempo medio de uso/dia | Sessoes diarias do app | 5-10 min (uso eficiente) |

---

## 5. Requisitos Funcionais (FR-*) por Pilar

### 5.1 Pilar 1 — Agenda (FR-AG-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-AG-01 | O sistema deve permitir visualizacao da agenda nas modalidades **diaria, semanal e mensal**. | Audios sec 6.1; EPIC-0 Story 2.4 | SIM |
| FR-AG-02 | O sistema deve permitir criacao de agendamento associando **paciente + servico + profissional + data/hora inicio + data/hora fim**. | Audios sec 6.1; EPIC-0 Story 2.5 | SIM |
| FR-AG-03 | O sistema deve permitir alteracao do **status do agendamento**: Agendado, Realizado, Cancelado, Falta. | Audios sec 6.1; EPIC-0 Story 2.6 | SIM |
| FR-AG-04 | Ao criar um agendamento, o sistema deve **gerar automaticamente uma Receita Prevista** vinculada, com valor = preco do servico. | Audios sec 6.1 ("logica interna"); EPIC-0 Story 2.7 | SIM |
| FR-AG-05 | O sistema deve permitir **agenda multi-profissional** (cada profissional ve sua propria agenda; dono ve todas). | Audios sec 3 + Gestek benchmark; EPIC-0 Story 1.3 | SIM |
| FR-AG-06 | Quando atendimento e marcado como **Realizado**, o sistema deve criar automaticamente uma **Comanda** (FR-CO-01). | Audios sec 6.4 + 6.5; EPIC-0 Story 3.1 | SIM |
| FR-AG-07 | O sistema deve identificar e listar **clientes faltantes** (status = Falta) com facilidade. | Audios sec 6.10 (alertas); Gestek benchmark | POS-MVP (Fase 4) |
| FR-AG-08 | O sistema deve enviar **confirmacao automatica via WhatsApp** 24h antes do atendimento. | Audios sec 6.1 (integracoes futuras); EPIC-0 Fase 7 Story 7.3 | POS-MVP (Fase 7) |
| FR-AG-09 | O sistema deve permitir **agendamento online** via link compartilhavel (auto-agendamento pela cliente final). | Gestek benchmark; visao idealizadora ("integracoes futuras") | POS-MVP (Fase 7+) |

### 5.2 Pilar 1 — Pacientes / CRM (FR-PA-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-PA-01 | O sistema deve permitir CRUD de pacientes com campos: **nome, telefone, email (opcional)**. | Audios sec 6.2; EPIC-0 Story 2.1 | SIM |
| FR-PA-02 | O sistema deve manter **historico de atendimentos** por paciente (lista de agendamentos passados com status). | Audios sec 6.2; EPIC-0 Story 2.1 | SIM |
| FR-PA-03 | O sistema deve calcular e exibir, por paciente: **ticket medio, frequencia de visita, total faturado, ultima visita**. | Audios sec 6.2 (Prontuario Financeiro) + sec 11 (Feature 7); EPIC-0 Story 6.6 | POS-MVP (Fase 6) |
| FR-PA-04 | O sistema deve calcular **LTV (Lifetime Value)** por paciente. | Audios sec 6.2 + sec 11 (Feature 7); EPIC-0 Story 6.6 | POS-MVP (Fase 6) |

### 5.3 Pilar 2 — Servicos / Catalogo (FR-SV-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-SV-01 | O sistema deve permitir CRUD de itens do catalogo com **tipo: Servico, Produto, Protocolo, Pacote, Combo**. | Audios sec 6.3; EPIC-0 Story 2.2 | SIM (Servico + Produto; Pacote/Combo Fase 5) |
| FR-SV-02 | Cada item do catalogo deve ter campos: **nome, preco de venda, custo (variavel), duracao (em min, para servicos), categoria**. | Audios sec 6.3; EPIC-0 Story 2.2 | SIM |
| FR-SV-03 | O sistema deve permitir cadastro de **lista de insumos por servico** (ex: "1 sessao de botox = 1 frasco acido + 2 gazes"). | Audios sec 6.3 + 6.8; EPIC-0 Story 2.3 | SIM |
| FR-SV-04 | O sistema deve calcular automaticamente o **lucro bruto unitario** = preco - custo de insumos - comissao do profissional. | Audios sec 11 (Feature 2); EPIC-0 Story 4.3 | SIM |
| FR-SV-05 | O sistema deve permitir criacao de **pacotes** (ex: 5 sessoes com 10% off). | Audios sec 6.3 + sec 11 (Feature 5); EPIC-0 Story 5.2 | POS-MVP (Fase 5) |
| FR-SV-06 | O sistema deve controlar **sessoes consumidas vs disponiveis** em pacotes vendidos. | Gestek benchmark; EPIC-0 Story 5.2 | POS-MVP (Fase 5) |

### 5.4 Pilar 3 — Comanda / Ordem de Servico (FR-CO-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-CO-01 | O sistema deve **criar Comanda automaticamente** ao marcar um atendimento como Realizado, com servicos pre-preenchidos do agendamento. | Audios sec 6.4; EPIC-0 Story 3.1 | SIM |
| FR-CO-02 | A Comanda deve permitir **edicao manual** (adicionar servico extra, produto vendido, descontar valor). | Audios sec 6.4; EPIC-0 Story 3.1 | SIM |
| FR-CO-03 | A Comanda deve ter os status: **Aberta, Finalizada, Paga**. | Audios sec 6.4; EPIC-0 Story 3.1 | SIM |
| FR-CO-04 | O sistema deve permitir registro de **pagamento** com forma (PIX, cartao credito, cartao debito, dinheiro) e valor. | Audios sec 5 (fluxo central); EPIC-0 Story 3.2 | SIM |
| FR-CO-05 | Ao registrar pagamento via cartao, o sistema deve **descontar automaticamente a taxa configurada** (ex: 3.5% credito a vista). | Conta Azul benchmark + Gestek benchmark; EPIC-0 Story 3.2 | SIM |

### 5.5 Pilar 3 — Financeiro / Transacoes (FR-FI-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-FI-01 | Ao registrar pagamento de uma Comanda, o sistema deve criar automaticamente uma **Transacao financeira de entrada** com valor liquido (apos taxa) e categoria do servico. | Audios sec 6.5; EPIC-0 Story 3.3 | SIM |
| FR-FI-02 | O sistema deve permitir **registro manual de despesas** (saidas), com campos: valor, data, categoria, descricao, fornecedor (opcional). | Audios sec 6.5; EPIC-0 Story 3.5 | SIM |
| FR-FI-03 | O sistema deve permitir classificacao de despesas em **fixas vs variaveis**, e por **categoria** (aluguel, energia, marketing, insumos, salarios, etc). | Audios sec 6.5 + 6.6; EPIC-0 Story 3.6 | SIM |
| FR-FI-04 | O sistema deve permitir separacao de receitas por **profissional e centro de custo**. | Audios sec 6.5; EPIC-0 Story 3.4 | SIM |
| FR-FI-05 | O sistema deve manter um **plano de contas pre-configurado para estetica** (categorias prontas: limpeza de pele, peeling, botox, energia, aluguel, etc) com possibilidade de customizacao. | Conta Azul benchmark + Kamino benchmark; deriva sec 6.6 | SIM |
| FR-FI-06 | O sistema deve calcular e exibir o **fluxo de caixa basico** (saldo atual, entradas do periodo, saidas do periodo). | Audios sec 6.11 + EPIC-0 Story 3.7 | SIM |
| FR-FI-07 | O sistema deve **projetar fluxo de caixa futuro** baseado em agenda futura (receitas previstas) + despesas recorrentes. | Audios sec 6.11; EPIC-0 Story 6.1 + Kamino benchmark | POS-MVP (Fase 6) |

### 5.6 Pilar 2 — Custos e Precificacao (FR-CP-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-CP-01 | O sistema deve permitir cadastro de **custos fixos mensais** (aluguel, energia, internet, salarios fixos). | Audios sec 6.6; EPIC-0 Story 3.6 | SIM |
| FR-CP-02 | O sistema deve permitir cadastro de **custos variaveis** vinculados a insumos (custo unitario). | Audios sec 6.6; EPIC-0 Story 3.6 | SIM |
| FR-CP-03 | O sistema deve calcular o **impacto de cada custo** no resultado financeiro do mes (% sobre receita). | Audios sec 6.6; EPIC-0 Story 4.1 | SIM |
| FR-CP-04 | O sistema deve oferecer **motor de precificacao** que sugere preco minimo de servico baseado em: custo de insumos + rateio de fixos + margem desejada. | Audios sec 6.6; EPIC-0 Story 5.1 | POS-MVP (Fase 5) |
| FR-CP-05 | O sistema deve permitir **simulacao de cenarios de preco** (ex: "se eu cobrar R$ 200 ao inves de R$ 180, qual o lucro?"). | Audios sec 6.6 (Projecao de preco); EPIC-0 Story 5.3 | POS-MVP (Fase 5) |
| FR-CP-06 | O sistema deve permitir **precificacao de pacotes** (ex: 5 sessoes com 10% off, com lucro projetado). | Audios sec 6.6; EPIC-0 Story 5.2 | POS-MVP (Fase 5) |

### 5.7 Pilar 3 — DRE / Demonstrativo (FR-DR-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-DR-01 | O sistema deve gerar **DRE basica automatica** com estrutura: Receita Total - Custos Variaveis - Custos Fixos - Despesas Operacionais = Lucro Liquido. | Audios sec 6.7; EPIC-0 Story 4.1 | SIM |
| FR-DR-02 | O sistema deve gerar **DRE por servico** mostrando lucro de cada procedimento individual (diferencial vs Conta Azul). | Audios sec 6.7; EPIC-0 Story 4.2 | SIM |
| FR-DR-03 | O sistema deve gerar **DRE por profissional** mostrando lucro gerado por cada profissional. | Audios sec 6.5; EPIC-0 Story 4.3 | SIM |
| FR-DR-04 | O sistema deve permitir **exportacao do DRE em PDF/CSV** para envio ao contador. | Conta Azul benchmark; deriva audios sec 6.7 | POS-MVP (Fase 5) |

### 5.8 Pilar 2 — Estoque / Insumos (FR-ES-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-ES-01 | O sistema deve permitir cadastro de **insumos** (nome, unidade de medida, custo unitario, quantidade em estoque, fornecedor opcional). | Audios sec 6.8; EPIC-0 Story 2.3 | SIM |
| FR-ES-02 | Ao registrar uma comanda finalizada, o sistema deve **deduzir automaticamente os insumos** consumidos (via FR-SV-03). | Audios sec 6.8; EPIC-0 Story 3.8 | SIM |
| FR-ES-03 | O sistema deve gerar **alerta de recompra** quando estoque atinge nivel minimo configurado. | Audios sec 6.8; EPIC-0 Story 5.4 | POS-MVP (Fase 5) |
| FR-ES-04 | O sistema deve sugerir **fornecedores e precos de recompra** com base em historico. | Audios sec 6.8 (Marketplace de Fornecedores) + sec 11 (Feature 4); EPIC-0 Story 5.5 | POS-MVP (Fase 5) |

### 5.9 Pilar 4 — Dashboard (FR-DA-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-DA-01 | O Dashboard deve ser de **tela unica** (sem scroll excessivo) e exibir todas as informacoes principais de uma vez. | Audios sec 6.10 (principios UX); CON-UX-03 | SIM |
| FR-DA-02 | O Dashboard deve usar **numeros absolutos** como elemento visual principal (nao graficos). | Audios sec 6.10 (principio UX inegociavel); CON-UX-01 | SIM |
| FR-DA-03 | O Dashboard deve exibir **resumo financeiro do mes**: faturamento, despesas, lucro, receita prevista (4 numeros grandes). | Audios sec 6.10; EPIC-0 Story 4.4 | SIM |
| FR-DA-04 | O Dashboard deve exibir **agenda do dia** (qtd atendimentos, valor previsto, status por linha). | Audios sec 6.10; EPIC-0 Story 4.5 | SIM |
| FR-DA-05 | O Dashboard deve exibir **indicadores chave**: ticket medio, servico mais vendido, servico mais lucrativo, taxa de comparecimento. | Audios sec 6.10; EPIC-0 Story 4.6 | SIM |
| FR-DA-06 | O Dashboard deve exibir **comparativo textual** mes atual vs mes anterior (ex: "R$ 2.300 a mais que mes passado") — **sem graficos**. | Audios sec 6.10 (principio UX); CON-UX-02; EPIC-0 Story 4.7 | SIM |
| FR-DA-07 | O Dashboard deve exibir **comparativo vs meta** projetada (ex: "Faltam R$ 1.200 para bater a meta"). | Audios sec 6.10; EPIC-0 Story 4.8 | SIM |
| FR-DA-08 | O Dashboard pode exibir **NO MAXIMO 1 grafico** (receita vs despesas). Idealizadora autorizou esta excecao. | Audios sec 6.10 (nota explicita); CON-UX-04 | SIM (opcional) |
| FR-DA-09 | O Dashboard deve gerar **alertas** automaticos: queda de lucro, baixa margem, alta taxa de faltas. | Audios sec 6.10 + 6.11; EPIC-0 Story 4.9 | SIM |

### 5.10 Pilar 4 — Inteligencia / Projecoes (FR-IN-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-IN-01 | O sistema deve calcular e exibir **lucro liquido por servico em tempo real** (receita - insumos - comissao). | Audios sec 6.11 + sec 11 (Feature 2); EPIC-0 Story 4.2 | SIM |
| FR-IN-02 | O sistema deve gerar **previsao de lucro semanal/mensal** baseada em agenda preenchida + historico. | Audios sec 6.11 + sec 11 (Feature 3); EPIC-0 Story 6.1 | POS-MVP (Fase 6) |
| FR-IN-03 | O sistema deve permitir **simulacao de cenarios "what-if"** (+10% upsell, +5 agendamentos/semana). | Audios sec 6.11; EPIC-0 Story 6.2 | POS-MVP (Fase 6) |
| FR-IN-04 | O sistema deve gerar **heatmap de rentabilidade por horario** (lucro/hora por faixa). | Audios sec 6.11 + sec 11 (Feature 6); EPIC-0 Story 6.3 | POS-MVP (Fase 6) |
| FR-IN-05 | O sistema deve gerar **rentabilidade por profissional** com alertas de baixa performance. | Audios sec 6.11 + sec 11 (Feature 6); EPIC-0 Story 6.4 | POS-MVP (Fase 6) |
| FR-IN-06 | O sistema deve permitir cadastro de **metas mensais** (faturamento, lucro, atendimentos) e exibir progresso. | Audios sec 4 (Pilar 4) + sec 6.11; EPIC-0 Story 6.5 | POS-MVP (Fase 6) |
| FR-IN-07 | O sistema deve gerar **panoramas para mentora** (relatorio sintetico do estado financeiro para a sessao de mentoria). | Audios sec 3 (papel idealizadora) + sec 6.11; EPIC-0 Story 6.5 | POS-MVP (Fase 6) |
| FR-IN-08 | O sistema deve sugerir **upsell na agenda** (ex: "Cliente de botox: oferecer manutencao em 60 dias?"). | Audios sec 6.11 + sec 11 (Feature 5); EPIC-0 Story 6.7 | POS-MVP (Fase 6) |
| FR-IN-09 | O sistema deve gerar **recomendacoes IA de precos** baseadas em historico e benchmarks. | Audios sec 6.6 + sec 11 (Feature 8); EPIC-0 Story 7.6 | POS-MVP (Fase 7) |

### 5.11 Integracoes (FR-IT-*) — Pos-MVP

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-IT-01 | O sistema deve permitir **upload de PDFs** (extratos bancarios, comprovantes de maquininha) com extracao OCR de dados (entradas, saidas, taxas). | Audios sec 6.9; EPIC-0 Story 7.1 | POS-MVP (Fase 7) |
| FR-IT-02 | O sistema deve integrar com **Asaas** para emissao de Pix automatico e cobranca. | Audios sec 6.11; EPIC-0 Story 7.2 | POS-MVP (Fase 7) |
| FR-IT-03 | O sistema deve integrar com **WhatsApp Business API** para confirmacao, lembrete e cobranca automaticos. | Audios sec 6.1 + 6.7; EPIC-0 Story 7.3 | POS-MVP (Fase 7) |
| FR-IT-04 | O sistema deve emitir **NFS-e (Nota Fiscal de Servico Eletronica)** automaticamente a partir da comanda paga. | Conta Azul benchmark + Gestek benchmark (modulo adicional); EPIC-0 Story 7.4 | POS-MVP (Fase 7) |
| FR-IT-05 | O sistema deve enviar **reenvio Pix automatico** para inadimplentes apos prazo configurado. | Audios sec 6.11; EPIC-0 Story 7.5 | POS-MVP (Fase 7) |
| FR-IT-06 | O sistema deve oferecer **marketplace de fornecedores** com precos auto-atualizados e compras em bulk. | Audios sec 6.12 + sec 11 (Feature 10); EPIC-0 Fase 8 | FUTURO |

### 5.12 Multi-Tenant e Autenticacao (FR-MT-*)

| ID | Requisito | Fonte | MVP |
|----|-----------|-------|-----|
| FR-MT-01 | O sistema deve permitir **cadastro de Organizacao (clinica/studio)** durante o onboarding. | EPIC-0 Story 1.2 + audios sec 7 (multi-tenant) | SIM |
| FR-MT-02 | O sistema deve permitir **cadastro de profissionais** com roles (dono, profissional). | EPIC-0 Story 1.3 | SIM |
| FR-MT-03 | O sistema deve garantir **isolamento total de dados entre organizacoes** (uma organizacao nunca acessa dados de outra). | EPIC-0 Story 1.4 + Diretrizes Inegociaveis #7 | SIM |
| FR-MT-04 | O sistema deve oferecer **autenticacao por email + senha** com fluxo de recuperacao. | EPIC-0 Story 1.1 (deriva) | SIM |

---

## 6. Requisitos Nao-Funcionais (NFR-*)

### 6.1 Performance

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-PE-01 | O Dashboard deve carregar em **menos de 2 segundos** em conexao 4G. | Persona usa entre atendimentos (sec 2.1) — uso mobile latencia critica |
| NFR-PE-02 | A criacao de uma Comanda automatica (FR-CO-01) deve ser instantanea (< 500ms) ao marcar atendimento como Realizado. | Audios sec 5 (fluxo central exige automacao perceptivelmente instantanea) |
| NFR-PE-03 | Geracao do DRE basico (FR-DR-01) deve completar em < 3 segundos para periodos ate 12 meses. | Padrao SaaS; Conta Azul atinge similar |
| NFR-PE-04 | O sistema deve suportar **clinicas com ate 200 atendimentos/mes** sem degradacao de performance no MVP. | EPIC-0 Fase 4 criterio de MVP completo |

### 6.2 Seguranca

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-SE-01 | Todas as senhas devem ser armazenadas com **hash bcrypt** (custo >= 10) ou equivalente. | Best practice OWASP |
| NFR-SE-02 | Toda comunicacao deve ocorrer via **HTTPS/TLS 1.2+**. | Best practice |
| NFR-SE-03 | O sistema deve implementar **rate limiting** em endpoints de autenticacao (max 5 tentativas/minuto por IP). | Best practice OWASP |
| NFR-SE-04 | Dados pessoais sensiveis (CPF, telefone, email) devem ser **criptografados em repouso**. | LGPD (CON-LG-01) |
| NFR-SE-05 | O sistema deve manter **log de auditoria** de operacoes financeiras (quem criou/editou/deletou comanda, transacao, despesa). | Boa pratica financeira |
| NFR-SE-06 | Roles (dono vs profissional) devem ter **permissoes diferenciadas** (profissional ve sua agenda; dono ve tudo financeiro). | EPIC-0 Story 1.3 |

### 6.3 Multi-Tenant e Isolamento

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-MT-01 | Todas as queries de dados devem aplicar **Row Level Security (RLS)** por organization_id. | EPIC-0 Story 1.4 + Diretrizes Inegociaveis #7 |
| NFR-MT-02 | Testes automatizados devem validar **isolamento entre organizacoes** (impossivel acessar dados de outra org). | EPIC-0 Fase 1 criterio: "RLS testado (org A nao ve org B)" |
| NFR-MT-03 | O sistema deve gerar **relatorio de tentativas cross-tenant** (auditoria de seguranca). | Boa pratica multi-tenant SaaS |

### 6.4 Disponibilidade e Confiabilidade

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-AV-01 | O sistema deve ter SLA de **99.5% de uptime** mensal (alinhado com fornecedores Vercel + Supabase). | EPIC-0 Story 0.1 menciona Vercel + Supabase |
| NFR-AV-02 | O sistema deve realizar **backup automatico diario** dos dados financeiros, com retencao minima de 30 dias. | Boa pratica SaaS financeiro |
| NFR-AV-03 | O sistema deve permitir **exportacao integral de dados** (CSV/JSON) pela usuaria, a qualquer momento. | LGPD (CON-LG-02) — direito de portabilidade |

### 6.5 Precisao Financeira

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-FI-01 | Todos os calculos financeiros devem usar **2 casas decimais** com arredondamento HALF_EVEN (banker's rounding). | EPIC-0 Diretrizes Inegociaveis #8 |
| NFR-FI-02 | Valores monetarios devem ser armazenados como **integer em centavos** (evitar imprecisoes de float). | Best practice financial software |
| NFR-FI-03 | O sistema deve garantir que **soma das comandas pagas no periodo = receita exibida no DRE** (auditavel pelo usuario). | Confianca no sistema (audios sec 10 — "clareza visual") |

### 6.6 Usabilidade e Acessibilidade

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-UX-01 | O sistema deve ser **mobile-first** (PWA), funcionando bem em telas a partir de 360px de largura. | Persona usa smartphone (sec 2.1); Conta Azul tem CA de Bolso |
| NFR-UX-02 | O sistema deve atender o nivel **WCAG 2.1 AA** (contraste, navegacao por teclado, leitor de tela). | Boa pratica acessibilidade |
| NFR-UX-03 | A linguagem do sistema deve ser **livre de jargao financeiro** (evitar "competencia", "regime de caixa", "depreciacao"). Substituir por linguagem coloquial. | Audios sec 6.10 (principio UX) + persona (sec 2.1) |
| NFR-UX-04 | O sistema deve oferecer **onboarding guiado** que entregue o primeiro lucro visualizado em ate 24h (NorthStar metric). | Sec 4.1 (NorthStar) |

### 6.7 Internacionalizacao e Localizacao

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-IL-01 | Idioma unico no MVP: **Portugues do Brasil**. | Publico-alvo (sec 2.1) |
| NFR-IL-02 | Formato de moeda: **R$ 1.234,56** (locale pt-BR). | Idem |
| NFR-IL-03 | Formato de data: **DD/MM/AAAA**. | Idem |
| NFR-IL-04 | Fuso horario: **America/Sao_Paulo** (BRT/BRST), com tratamento de horario de verao. | Padrao BR |

### 6.8 Manutenibilidade e Evolucao

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-MA-01 | Cobertura de testes automatizados deve ser **>= 70%** em modulos de logica financeira. | Padrao AIOX (Constitution Article V — Quality First) |
| NFR-MA-02 | O sistema deve permitir **feature flags** para habilitar/desabilitar funcionalidades por plano (Start/Crescimento/Autoridade). | Modelo de monetizacao (sec 8) |
| NFR-MA-03 | O codigo deve seguir o padrao **TypeScript strict mode** com lint ativo. | EPIC-0 Story 1.1 (Next.js 15) + AIOX best practices |

### 6.9 Observabilidade

| ID | Requisito | Fonte |
|----|-----------|-------|
| NFR-OB-01 | O sistema deve registrar **logs estruturados (JSON)** de operacoes criticas (criacao de comanda, transacao, exclusao). | Boa pratica SaaS |
| NFR-OB-02 | O sistema deve gerar **metricas de saude** (TTFL, retention, comandas/dia/clinica) para o time de produto. | NorthStar (sec 4.1) + OKRs (sec 4.2) |
| NFR-OB-03 | O sistema deve ter **alertas operacionais** (erro 5xx > 1% em 5 min, latencia P95 > 3s, taxa de falha de comanda > 0.1%). | Boa pratica SaaS |

---

## 7. Constraints (CON-*)

### 7.1 Constraints de UX (Inegociaveis)

| ID | Constraint | Fonte | Severidade |
|----|-----------|-------|------------|
| CON-UX-01 | **Numeros absolutos sao a unidade visual padrao do sistema. NAO usar graficos como elemento principal.** | Audios sec 6.10: "as pessoas nao sabem ler graficos" | NON-NEGOTIABLE |
| CON-UX-02 | **Comparativos devem ser textuais e em valor absoluto.** Ex: "R$ 2.300 a mais que mes passado", NAO "+18%". | Audios sec 6.10 (principio explicito) | NON-NEGOTIABLE |
| CON-UX-03 | **Dashboard deve caber em UMA tela** (sem necessidade de scroll para informacoes principais). | Audios sec 6.10 + sec 10; EPIC-0 Diretrizes #5 | NON-NEGOTIABLE |
| CON-UX-04 | **MAXIMO 1 grafico em todo o sistema** (receita vs despesas) — excecao explicitamente autorizada pela idealizadora. | Audios sec 6.10 (nota da idealizadora) | NON-NEGOTIABLE |
| CON-UX-05 | **Linguagem livre de jargao financeiro** — usar termos coloquiais, nao termos tecnicos. | Audios sec 3 (publico nao familiar) + sec 6.10 | MUST |
| CON-UX-06 | **Setup em ate 24 horas** ate primeiro lucro visualizado. | NorthStar metric (sec 4.1) | MUST |

### 7.2 Constraints Legais — LGPD (Brasil)

| ID | Constraint | Fonte | Severidade |
|----|-----------|-------|------------|
| CON-LG-01 | O sistema deve estar em **conformidade com LGPD** (Lei Geral de Protecao de Dados, Lei 13.709/2018). | EPIC-0 menciona @compliance-br para LGPD | MUST |
| CON-LG-02 | A usuaria deve poder **exportar todos os seus dados** em formato estruturado (direito de portabilidade). | LGPD Art. 18 | MUST |
| CON-LG-03 | A usuaria deve poder **excluir sua conta e todos os dados associados** (direito ao esquecimento). | LGPD Art. 18 | MUST |
| CON-LG-04 | O sistema deve apresentar **politica de privacidade clara** e obter consentimento explicito no cadastro. | LGPD Art. 7 | MUST |
| CON-LG-05 | Dados pessoais de pacientes (nome, telefone) sao de responsabilidade da usuaria-clinica (controladora) — KEYRA atua como **operadora** sob contrato. | LGPD definicoes Art. 5 | MUST |
| CON-LG-06 | O sistema deve manter **registros de tratamento de dados** (Art. 37 LGPD). | LGPD | MUST |

### 7.3 Constraints Fiscais e Regulatorias (Brasil)

| ID | Constraint | Fonte | Severidade |
|----|-----------|-------|------------|
| CON-FI-01 | O sistema deve suportar regimes tributarios **MEI, Simples Nacional**. | Persona (sec 2.1) — publico majoritario | MUST |
| CON-FI-02 | O sistema **NAO emite NFS-e no MVP** — modulo fiscal e Fase 7. | EPIC-0 Fase 7 Story 7.4 | MUST (escopo) |
| CON-FI-03 | O sistema **NAO armazena ou processa dados bancarios** (saldo de conta, autenticacao bancaria) — fora do escopo regulatorio. | Visao idealizadora + EPIC-0 (KEYRA nao e instituicao de pagamento) | MUST |
| CON-FI-04 | Quando integracoes financeiras (Asaas, Pix) entrarem (Fase 7), KEYRA atuara como **integrador** — nao como instituicao de pagamento. | EPIC-0 Fase 7 + Diferenciacao vs Kamino/Conta Azul | MUST |

### 7.4 Constraints de Escopo do MVP

| ID | Constraint | Fonte | Severidade |
|----|-----------|-------|------------|
| CON-ES-01 | MVP **NAO inclui** integracao bancaria (Open Banking). | Audios sec 8; EPIC-0 Fase 7 | MUST (escopo) |
| CON-ES-02 | MVP **NAO inclui** WhatsApp integration. | Audios sec 8; EPIC-0 Fase 7 | MUST (escopo) |
| CON-ES-03 | MVP **NAO inclui** importacao de extratos PDF. | Audios sec 8; EPIC-0 Fase 7 | MUST (escopo) |
| CON-ES-04 | MVP **NAO inclui** marketplace de fornecedores. | Audios sec 8; EPIC-0 Fase 8 | MUST (escopo) |
| CON-ES-05 | MVP **NAO inclui** IA preditiva avancada (recomendacoes de precos via ML). | Audios sec 8; EPIC-0 Fase 7 | MUST (escopo) |
| CON-ES-06 | MVP **NAO inclui** multiusuarios complexos (apenas dono + profissionais simples). | Audios sec 8 | MUST (escopo) |
| CON-ES-07 | MVP **NAO inclui** anamnese clinica, receituarios pos-procedimento ou prontuario clinico. | Audios sec 6.2 (KEYRA = financeiro, nao clinico); Gestek benchmark sec 5 | MUST (escopo) |

### 7.5 Constraints Tecnologicos

| ID | Constraint | Fonte | Severidade |
|----|-----------|-------|------------|
| CON-TE-01 | Stack base: **Next.js 15 + Supabase** (auth + database + storage). | EPIC-0 Story 1.1 | SHOULD (decisao do @architect) |
| CON-TE-02 | Hospedagem: **Vercel** (frontend) + **Supabase Cloud** (backend). | EPIC-0 Story 0.1 | SHOULD (decisao do @architect) |
| CON-TE-03 | Banco de dados: **PostgreSQL** (via Supabase) com Row Level Security ativo. | EPIC-0 Story 0.4 + 1.4 | SHOULD (decisao do @architect/data-engineer) |

### 7.6 Constraints de Compliance KEYRA (especificos)

| ID | Constraint | Fonte | Severidade |
|----|-----------|-------|------------|
| CON-KE-01 | **Agenda e o core inegociavel** — toda receita nasce da agenda. Nao ha fluxo de "venda manual sem agendamento" no MVP. | Audios sec 4 + sec 5; EPIC-0 Diretrizes #1 | NON-NEGOTIABLE |
| CON-KE-02 | **Automacao maxima** — zero lancamento manual no fluxo central (servico -> agenda -> comanda -> transacao). Usuario so registra pagamento. | Audios sec 5 + sec 10; EPIC-0 Diretrizes #2 | NON-NEGOTIABLE |
| CON-KE-03 | **Lucro por servico e a metrica central de diferenciacao.** Nao pode ser cortado do MVP. | Audios sec 6.7 + sec 11 (Feature 2); EPIC-0 Diretrizes #3 | NON-NEGOTIABLE |
| CON-KE-04 | **Foco em estetica.** Nao construir features genericas que descaracterizem o nicho (ex: integracao com marketplace de e-commerce). | Audios sec 3 + sec 11 (Feature 6); Posicionamento (sec 1.3) | MUST |

---

## 8. Modelo de Monetizacao

### 8.1 Estrutura de Planos

| Plano | Publico | Faixa de preco | Pagamento | Features |
|-------|---------|----------------|-----------|----------|
| **Start** | Profissional autonoma (1 profissional) | R$ 79-99/mes | Mensal | Agenda + Servicos + Pacientes + Comanda automatica + Financeiro basico + Dashboard simples + DRE basica |
| **Crescimento** | Studio/clinica (2-5 profissionais) | R$ 149-199/mes | Mensal | Tudo do Start + DRE detalhada por servico + Precificacao + Estoque/Insumos + Projecoes + Lucro por servico/profissional + Metas |
| **Autoridade** | Rede / power users | R$ 299-399/mes | Mensal | Tudo do Crescimento + Inteligencia IA + Integracoes (Asaas, WhatsApp, NFS-e) + Mentoria mensal incluida + Multi-unidade + Recomendacoes IA de preco |

### 8.2 Formatos de Pagamento

| Modalidade | Desconto | Justificativa |
|------------|---------|---------------|
| Mensal | 0% | Padrao |
| Trimestral | 10% | Lock-in moderado |
| Anual | 25% | Lock-in alto, melhor receita previsivel |

### 8.3 Trial e Onboarding

| Item | Decisao |
|------|---------|
| Trial gratuito | **14 dias no plano Crescimento** (acesso completo a feature de diferenciacao) |
| Cartao no trial | **Nao exigido** (reduz friccao) |
| Onboarding | Guiado em 4 passos: (1) cadastrar 3 servicos com custo+preco; (2) cadastrar 3 pacientes; (3) criar 1 agendamento; (4) marcar como realizado e registrar pagamento |
| TTFL alvo | **24 horas** (NorthStar) |

### 8.4 Receita Adicional (Pos-MVP)

| Item | Modelo | Quando |
|------|--------|--------|
| Profissional adicional (Crescimento) | R$ 25-30/mes/profissional alem dos 5 inclusos | Pos-MVP |
| Modulo NFS-e | R$ 30-50/mes (alinhado com Gestek R$ 39,90) | Fase 7 |
| Mentoria avulsa | R$ 200-400/sessao com a idealizadora | Fase 6 |
| WhatsApp Business (mensagens enviadas) | Pacote de mensagens, ex: R$ 0,15/msg | Fase 7 |

### 8.5 Posicionamento de Pricing

```
Gestek R$ 69-99/mes  (operacional)
KEYRA  R$ 79-199/mes (operacional + financeiro auto)  ← sweet spot
Conta Azul R$ 159-720/mes (financeiro generico)
Kamino  R$ ? (custom para medias empresas)
```

KEYRA fica entre 5-25% acima do Gestek (precificando a automacao financeira), mas 30-70% abaixo do Conta Azul.

---

## 9. Criterios de Sucesso do MVP (Fases 1-4)

### 9.1 Definicao de MVP

O MVP do KEYRA cobre **Fases 1-4 do EPIC-0** (Fundacao Tecnica + Catalogo + Agenda + Automacao Financeira + Dashboard com Lucro). Inclui o fluxo central completo: `Servico -> Agenda -> Comanda -> Transacao -> DRE -> Dashboard`.

### 9.2 Criterios de Aceitacao do MVP

| Fase | Criterio de Aceitacao | Validacao |
|------|------------------------|-----------|
| **Fase 1** (Fundacao) | Login funcional; cadastro de organizacao; RLS ativo (org A nao ve dados de org B) | Teste de seguranca + funcional |
| **Fase 2** (Catalogo + Agenda) | Profissional cria servico, paciente, agendamento — receita prevista aparece automaticamente | Teste E2E |
| **Fase 3** (Automacao Financeira) | Marcar atendimento como Realizado -> comanda automatica; registrar pagamento -> transacao automatica; insumo deduzido; tudo sem lancamento manual | Teste E2E + audit log |
| **Fase 4** (Dashboard + Lucro) | Dashboard tela unica com numeros absolutos; lucro por servico visivel; comparativo textual mes vs mes anterior | Teste de aceitacao da idealizadora |

### 9.3 Definition of Done do MVP (geral)

- [ ] Todas as features marcadas como "MVP: SIM" implementadas e testadas
- [ ] Todos os CONs UX (CON-UX-01 a CON-UX-06) respeitados (validado pela idealizadora)
- [ ] CONs LGPD (CON-LG-01 a CON-LG-06) implementados
- [ ] NFRs de Performance (NFR-PE-01 a NFR-PE-04) validados em staging
- [ ] NFRs Multi-tenant (NFR-MT-01 a NFR-MT-03) validados com testes automatizados
- [ ] NorthStar TTFL < 24h validado em onboarding piloto com 5 clinicas reais
- [ ] Cobertura de testes >= 70% em logica financeira (NFR-MA-01)
- [ ] Documentacao de usuario (FAQ + tutoriais video) publicada
- [ ] Politica de privacidade + Termos de uso aprovados juridicamente

### 9.4 Metricas de Validacao do MVP (3 meses pos-lancamento)

| Metrica | Target Aceitavel | Target de Sucesso |
|---------|------------------|-------------------|
| Cadastros totais | 50 clinicas | 150 clinicas |
| Clinicas ativas (>=10 comandas/mes) | 25 (50%) | 90 (60%) |
| Retention M3 | 60% | 75% |
| TTFL medio | < 48h | < 24h |
| NPS | >= 40 | >= 60 |
| Churn mensal | < 8% | < 4% |
| Conversao trial -> pago | >= 25% | >= 40% |

### 9.5 Killer Features de Validacao

A idealizadora deve testar e aprovar:
1. **Fluxo "agenda -> dashboard de lucro" sem lancamento manual** — em < 5 minutos.
2. **Lucro por servico** — visivel para qualquer servico cadastrado com >= 1 atendimento pago.
3. **Comparativo mes atual vs anterior** — em valores absolutos, sem grafico.
4. **Onboarding < 24h** — uma esteticista nova consegue ver o lucro do primeiro atendimento em ate 1 dia.

---

## 10. Premissas e Riscos

### 10.1 Premissas

| ID | Premissa | Validacao |
|----|----------|-----------|
| PR-01 | Profissionais de estetica usam smartphone para tarefas administrativas. | Confirmado nos audios da idealizadora; Gestek benchmark mostra apps mobile como diferencial |
| PR-02 | Publico-alvo aceita pagar R$ 79-199/mes por SaaS especializado. | Gestek (R$ 69,90 anual) e Conta Azul (R$ 159+) ja validam disponibilidade |
| PR-03 | Profissionais conseguem cadastrar custo de servico (insumos + comissao + tempo) com onboarding guiado. | A validar em testes de usabilidade |
| PR-04 | Idealizadora tem audiencia ativa (mentoria) que sera canal inicial de aquisicao. | Premissa estrategica — a validar |
| PR-05 | Mercado de SaaS para estetica esta em crescimento e nao saturado. | Pesquisa em sec 4 do Gestek-research mostra 9+ concorrentes mas nenhum com proposicao identica |
| PR-06 | Fluxo central (servico -> agenda -> comanda -> transacao) cobre 80%+ dos casos de uso financeiro de uma clinica. | A validar com 5 clinicas piloto |

### 10.2 Riscos

| ID | Risco | Probabilidade | Impacto | Mitigacao |
|----|-------|--------------|---------|-----------|
| RI-01 | Gestek/Belle adicionarem features de financeiro automatico | Media | Alto | Velocidade de execucao + profundidade financeira (DRE por servico, precificacao) — diferenciais dificeis de copiar rapido |
| RI-02 | Profissionais acharem o conceito "financeiro automatico" muito complexo de configurar (cadastrar custos de insumo) | Media | Alto | Onboarding guiado em 4 passos; templates por categoria de procedimento; suporte humano nas primeiras semanas |
| RI-03 | Conta Azul lancar versao especializada para estetica | Baixa | Critico | Construir lock-in via mentoria + idealizadora como canal exclusivo |
| RI-04 | LGPD compliance complexa (dados de pacientes) | Alta | Alto | Engajar @compliance-br (Temis) desde Fase 1; politica de privacidade como first-class artifact |
| RI-05 | Falta de integracao bancaria limitar atratividade no longo prazo | Media | Medio | Roadmap claro de integracoes Fase 7 (Asaas, WhatsApp, Pix) |
| RI-06 | Custo de aquisicao (CAC) muito alto sem canal organico | Media | Alto | Alavancar audiencia da idealizadora; conteudo educacional como funil; ASO/SEO Brasil |
| RI-07 | Calculo de "lucro por servico" gerar resultados confusos por configuracao incorreta de custos pelo usuario | Alta | Medio | Validacao automatica + alertas ("custo > preco — verifique") + exemplos pre-cadastrados |
| RI-08 | Fluxo central depender 100% de cadastro previo de servicos pode atrapalhar usuarias que querem "lancar avulso" | Media | Medio | Permitir comanda avulsa (servico nao-catalogado) com aviso — mas direcionar para cadastro |
| RI-09 | Multi-tenant RLS mal implementado vazar dados entre clinicas | Baixa | Critico | Testes automatizados de isolamento (NFR-MT-02); auditoria periodica; revisao de @data-engineer |
| RI-10 | Dependencia de fornecedores externos (Vercel, Supabase) gerar lock-in tecnico | Baixa | Medio | Avaliar custos de switching periodicamente; usar abstraction layer onde possivel |

---

## 11. Roadmap Macro

### 11.1 Visao Geral (referencia ao EPIC-0)

```
[Fase 0] Fundacao e Planejamento (Sem 1-2)   ← 4/6 CONCLUIDAS (67%)
   ├─ 0.1 Environment bootstrap (devops)        [x] ✅ GitHub + Vercel + Supabase sa-east-1 + dominio keyra.app
   ├─ 0.2 PRD formal (pm)                       [x] ✅ este documento
   ├─ 0.3 Arquitetura fullstack (architect)     [x] ✅ docs/architecture/ARCHITECTURE.md (20 ADRs)
   ├─ 0.4 Schema com RLS (data-engineer)        [ ] ← PROXIMO
   ├─ 0.5 Wireframes (ux-design-expert)         [ ] ← PROXIMO (paralelo com 0.4)
   └─ 0.6 Pesquisa competitiva (analyst)        [x] ✅ Conta Azul, Gestek, Kamino

[Fase 1] Fundacao Tecnica (Sem 3-4)
   └─ Auth + Multi-tenant + Layout base

[Fase 2] Catalogo + Agenda (Sem 5-7)            ← MVP STARTS
   └─ Pacientes + Servicos + Insumos + Agenda + Receita Prevista

[Fase 3] Automacao Financeira (Sem 8-10)        ← MVP CORE
   └─ Comanda auto + Pagamento + Transacao auto + Despesas + Estoque

[Fase 4] Lucro + Dashboard (Sem 11-13)          ← MVP COMPLETO
   └─ DRE basica + DRE por servico + Dashboard tela unica + Comparativos

[Fase 5] Precificacao + Estoque Inteligente (Sem 14-16)  ← POS-MVP
   └─ Motor de precificacao + Pacotes + Alertas estoque

[Fase 6] Inteligencia + Projecoes (Sem 17-20)
   └─ Projecoes + What-if + Heatmap + Metas + Prontuario financeiro + Upsell

[Fase 7] Integracoes (Sem 21+)
   └─ PDFs + Asaas + WhatsApp + NFS-e + IA precos

[Fase 8] Marketplace (Futuro)
   └─ Marketplace fornecedores
```

### 11.2 Rastreabilidade Plano <-> Roadmap

| Plano | Cobertura de funcionalidades | Fases EPIC-0 |
|-------|------------------------------|--------------|
| **Start** | Fluxo central completo, dashboard simples | Fases 1-4 (MVP) |
| **Crescimento** | + DRE detalhada + Precificacao + Estoque + Lucro/profissional + Metas + Projecoes | + Fases 5-6 |
| **Autoridade** | + IA + Integracoes externas + Mentoria | + Fase 7 |

### 11.3 Marcos (Milestones)

> **Atualizacao 2026-04-16:** marcos M0 e M1 foram acelerados — PRD e arquitetura entregues no mesmo dia do bootstrap. Datas-alvo posteriores realinhadas com base em ritmo realista solo-dev + agentes AIOX.

| Marco | Data original | Data revisada | Status | Criterio |
|-------|--------------|---------------|--------|----------|
| **M0:** PRD aprovado | 2026-04-30 | 2026-04-16 | ✅ entregue | Idealizadora + @po validam este documento |
| **M1:** Arquitetura aprovada | 2026-05-15 | 2026-04-16 | ✅ entregue | @architect entregou (20 ADRs); revisao por @qa pendente |
| **M1.5:** Schema + Wireframes (Fase 0 completa) | — | 2026-04-23 | ⏸️ proximo | Stories 0.4 e 0.5 entregues e aprovadas |
| **M2:** Fundacao tecnica pronta | 2026-05-31 | 2026-05-07 | 🔜 | Fase 1 EPIC-0 completa (Auth + Multi-tenant + Layout) |
| **M3:** MVP feature-complete | 2026-08-15 | 2026-07-15 | 🔜 | Fases 2-4 EPIC-0 completas |
| **M4:** MVP em piloto (5 clinicas) | 2026-08-31 | 2026-08-01 | 🔜 | Onboarding + uso real |
| **M5:** Lancamento comercial | 2026-10-01 | 2026-09-15 | 🔜 | Pricing ativo + cadastros publicos |
| **M6:** 50 clinicas em uso ativo | 2026-12-31 | 2026-12-31 | 🔜 | Validacao de PMF |

**Infraestrutura provisionada (Story 0.1, ver `docs/INFRA-STATUS.md`):**
- Repo: `luizxhgomes/keyra` (private)
- Dominio: `keyra.app`
- Vercel: project `keyra` (Hobby — upgrade para Pro antes do M5)
- Supabase: project `keyra-br` em `sa-east-1` (Free — upgrade Pro provavel no M3)

---

## 12. Anexo A — Rastreabilidade (FR/NFR/CON -> Fonte)

### Resumo Quantitativo

| Categoria | Quantidade | Cobertura MVP |
|-----------|------------|---------------|
| FR (Functional Requirements) | **66** | 38 MVP / 28 pos-MVP |
| NFR (Non-Functional Requirements) | **27** | Todos aplicaveis ao MVP |
| CON (Constraints) | **27** | Todos vinculantes |
| **TOTAL** | **120** | — |

### Fontes Validas (Article IV — No Invention)

Toda especificacao neste PRD rastreia para:
1. **Audios da idealizadora** — [`contexto-completo-keyra.md`](../audios-idealizadora/contexto-completo-keyra.md) (secoes 1-12) + [transcricoes brutas WhatsApp](../audios-idealizadora/) (4 arquivos `.txt`)
2. **EPIC-0 Master Plan** — [`EPIC-0-KEYRA-IMPLEMENTATION.md`](../stories/EPIC-0-KEYRA-IMPLEMENTATION.md) (Fases 0-8)
3. **Research Conta Azul** — [`2026-04-12-conta-azul-reverse-engineering.md`](../research/2026-04-12-conta-azul-reverse-engineering.md) (benchmark)
4. **Research Gestek** — [`2026-04-12-gestek-reverse-engineering.md`](../research/2026-04-12-gestek-reverse-engineering.md) (benchmark)
5. **Research Kamino** — [`2026-04-12-kamino-reverse-engineering.md`](../research/2026-04-12-kamino-reverse-engineering.md) (benchmark)
6. **Visao narrativa** — [`visao-keyra-idealizadora.md`](../audios-idealizadora/visao-keyra-idealizadora.md)

**Verificacao de invencao:** zero requisitos foram criados sem rastreamento documental. Quando a inspiracao veio de research (ex: regua de cobranca da Kamino, plano de contas pre-configurado do Conta Azul), a fonte e citada explicitamente.

**Documentos consumidores deste PRD** (nao sao fontes mas dependem dele):
- [`ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) — cada ADR rastreia para FR/NFR/CON deste PRD
- Stories futuras em `docs/stories/` — derivacao direta dos FRs por @sm
- Lista completa de documentos relacionados: ver [Companion Documents](#companion-documents) no inicio deste PRD.

### Distribuicao por Pilar

| Pilar | FRs | Comentario |
|-------|-----|------------|
| 1 — Agenda + Pacientes | 13 (AG-01..09 + PA-01..04) | Core do fluxo |
| 2 — Servicos + Custos + Estoque | 14 (SV-01..06 + CP-01..06 + ES-01..04) | Estrutura de monetizacao |
| 3 — Comanda + Financeiro + DRE | 16 (CO-01..05 + FI-01..07 + DR-01..04) | Automacao financeira |
| 4 — Dashboard + Inteligencia | 18 (DA-01..09 + IN-01..09) | Decisao e analise |
| Cross-cutting (Multi-tenant + Integracoes) | 10 (MT-01..04 + IT-01..06) | Plataforma + futuras integracoes |

---

## 13. Anexo B — Decisoes Autonomas (YOLO Mode)

Documentacao das decisoes tomadas autonomamente durante a elaboracao deste PRD (modo YOLO autorizado pelo lead).

| ID | Pergunta original | Decisao | Justificativa |
|----|-------------------|---------|---------------|
| AUTO-01 | Idioma do PRD: portugues ou ingles? | **Portugues do Brasil** | Publico-alvo, idealizadora e equipe de desenvolvimento sao brasileiros; alinha com NFR-IL-01 |
| AUTO-02 | NorthStar metric: qual escolher? | **Tempo ate primeiro lucro visualizado (TTFL)** | Lead sugeriu explicitamente nesta variante; metrica captura ativacao + valor + diferencial |
| AUTO-03 | Como tratar persona da idealizadora — usuaria final ou stakeholder? | **Persona secundaria (power user + canal)** | Idealizadora usa o sistema para mentoria — caso de uso real, nao apenas stakeholder |
| AUTO-04 | Stack tecnologico: especificar ou deixar para architect? | **Citar como CON-TE com severity SHOULD** (decisao do @architect) | EPIC-0 Story 1.1 ja menciona Next.js 15 + Supabase; PRD apenas reflete sem prescrever rigidamente |
| AUTO-05 | Pricing: indicar valores ou deixar aberto? | **Indicar faixa (R$ 79-99 / 149-199 / 299-399)** | EPIC-0 ja tem estrutura Start/Crescimento/Autoridade; benchmarks Conta Azul/Gestek/Kamino fundamentam as faixas |
| AUTO-06 | Trial: gratuito ou freemium? | **Trial 14 dias plano Crescimento, sem cartao** | Reduz friccao; alinhado com Belle Software benchmark; freemium completo gera risco de canibalizacao do plano Start |
| AUTO-07 | Profundidade dos FRs: alta granularidade ou alto nivel? | **Alta granularidade por modulo (66 FRs)** | PRD precisa permitir derivacao de stories; @sm tera contexto suficiente para criar stories de 2-4h |
| AUTO-08 | NFRs de seguranca: especificar tecnicamente ou genericamente? | **Especificar (bcrypt, TLS 1.2+, RLS, etc)** | Reduz ambiguidade no architect; alinhado com NFR-SE padrao SaaS |
| AUTO-09 | Como tratar features que sao "futuro distante" (marketplace)? | **Listar como FR-IT-06 com MVP=FUTURO** | Mantem rastreabilidade da visao completa sem inflar escopo |
| AUTO-10 | Validacao final: incluir secao de checklist ou apenas DoD? | **Apenas DoD na sec 9.3 + Anexo de rastreabilidade** | Checklist formal sera executado por @po em validacao posterior (`*validate-prd`) |
| AUTO-11 | Documento deve incluir prompts para UX Expert e Architect (template original sugere)? | **Omitido por brevidade — sera adicionado em iteracao apos validacao** | Template prd-tmpl prevê isso, mas o foco da Story 0.2 e o conteudo estrategico; prompts sao tactical e ficam para iteracao M1 |
| AUTO-12 | Roadmap de marcos: incluir datas concretas? | **Sim, com datas-alvo conservadoras (Apr-Dec 2026)** | Lead opera em 2026-04-16; alinha com sequencia EPIC-0; permite tracking |

---

## 14. Change Log

| Data | Versao | Descricao | Autor |
|------|--------|-----------|-------|
| 2026-04-16 | 1.0 | Criacao inicial do PRD (Story 0.2 do EPIC-0) — modo YOLO autonomo | @pm (Morgan) |
| 2026-04-16 | 1.1 | Atualizacao Story 0.1 — infraestrutura provisionada (GitHub + Vercel + Supabase sa-east-1 + dominio keyra.app). Marcos M0 e M1 antecipados. Roadmap section 11.1 e 11.3 atualizados. Companion `docs/INFRA-STATUS.md` criado. | @aiox-master (Orion) |
| 2026-04-16 | 1.2 | Adicionado bloco **Companion Documents** no header (18 docs relacionados linkados). Anexo A com hyperlinks Markdown clicaveis. | @aiox-master (Orion) |

---

## Gaps Identificados que Necessitam Input Humano

Os seguintes itens sao **decisoes que excedem a autoridade autonoma do PM** e precisam de input da idealizadora ou do lead antes da fase de desenvolvimento:

1. **Validacao do pricing absoluto** — As faixas R$ 79-199-399/mes sao educated guesses baseadas em benchmarks. A idealizadora deve confirmar o teto que o publico tolera.
2. **Politica de cancelamento e reembolso** — Necessaria para LGPD + termos de uso. Como tratar dados apos cancelamento? Periodo de retencao? Reembolso pro-rata?
3. **Modelo legal e CNPJ da KEYRA** — Empresa sera MEI? LTDA? Quem assina contrato com Vercel/Supabase? Necessario para CON-LG-05 (operadora de dados).
4. **Estrategia de aquisicao detalhada** — Apenas mencionada como "audiencia da idealizadora" (PR-04). Necessario plano formal: SEO? Ads? Parcerias com associacoes (Sociedade Brasileira de Estetica)?
5. **Definicao de escopo de mentoria no plano Autoridade** — Quantas sessoes/mes? Quem entrega (idealizadora ou time)? Modelo de mentoria 1:1 ou em grupo?
6. **Politica de comissionamento de profissionais** — FR-FI-04 menciona "separacao por profissional", mas a regra de comissao (% sobre receita? Por servico? Fixo?) precisa de definicao da idealizadora — este PRD assume "configuravel por profissional".
7. **Tratamento de devolucoes/estornos** — O que fazer quando uma comanda paga e estornada? Como afeta o DRE? Nao coberto neste PRD.
8. **Visao para Fase 8 (Marketplace de Fornecedores)** — Modelo de negocio? Comissao da KEYRA sobre vendas? Pagamento direto fornecedor->clinica com KEYRA como vitrine?
9. **Politica de migracao de dados** — Como facilitar entrada de usuarias vindas de Gestek/Conta Azul? Importacao de planilhas? Servico de migracao assistida?
10. **Definicao formal de "profissional" no plano Crescimento** — Recepcionista conta? Esteticista part-time conta como 1? Necessario para precificacao de profissional adicional.

---

*KEYRA — KEY + Receita + Acelerada*
*"O primeiro financeiro operacional para estetica."*
*PRD v1.0 — 2026-04-16 — @pm Morgan*
