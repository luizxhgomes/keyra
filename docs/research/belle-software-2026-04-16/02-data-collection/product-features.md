# Belle Software — Análise Completa de Produto

> **Pesquisa**: engenharia reversa do produto Belle Software, SaaS brasileiro de gestão para clínicas de estética (2.500+ clientes, presente há mais de uma década no mercado).
> **Data**: 2026-04-16
> **Analista**: Alex (@analyst) — para projeto KEYRA
> **Fontes primárias**: site oficial `bellesoftware.com.br`, central de ajuda `ajuda.bellesoftware.com.br`, Reclame Aqui, Apple App Store, Google Play.

---

## 0. TL;DR Executivo

Belle Software é um **ERP-monolito full-suite** para clínicas de estética, construído no modelo "tudo em um" (agenda + financeiro + fiscal + CRM + marketing + BI + IA). É **cloud-first** (hospedado na AWS), tem **dois apps nativos** (cliente e profissional), e monetiza via **assinatura base + add-ons** (NFS-e, NFC-e, BI, Automação de Marketing, WhatsApp, Biometria, Assinatura Eletrônica). A narrativa de vendas é **"aumente faturamento e lote a agenda"**, com forte ênfase em programa de consultoria (+Resultados) como upsell. A vertical líder é **estética clínica**, mas oferece edições para **micropigmentação, pilates/yoga, salão de beleza, spa e estética integrativa**. Fraquezas públicas: central de ajuda datada, reclamações recorrentes sobre confiabilidade de controle de pacotes/sessões, SAC padronizado e problemas de integração WhatsApp. **Lacunas exploráveis pela KEYRA**: financeiro profundo (DRE, fluxo de caixa projetado, precificação baseada em custo), simplicidade radical (tela única, números absolutos sem gráficos — conforme princípios da idealizadora), e preço transparente.

---

## 1. Arquitetura de Produto (visão macro)

### 1.1 Topologia declarada
```
┌─────────────────────────────────────────────────────────────┐
│                   BELLE SOFTWARE (Core Web)                  │
│  Cloud: AWS · Backup diário · Atualização inclusa · PWA-ish  │
└────────────────┬────────────────────────────┬───────────────┘
                 │                            │
    ┌────────────▼──────────┐     ┌───────────▼──────────────┐
    │  App Clínica (iOS/And)│     │   App Cliente (iOS/And)  │
    │  Financeiro, Agenda,  │     │   Agendamento, Compras,  │
    │  Cadastros, Painel,   │     │   Planos, Promoções,     │
    │  Indicadores (BSC)    │     │   Notificações           │
    └───────────────────────┘     └──────────────────────────┘

    Add-ons opcionais (faturados à parte):
    ├─ BelleMessage (WhatsApp)     R$ 229/mês
    ├─ BelleChat IA (atendimento)  preço sob consulta
    ├─ Gestor IA (NL→dados)        preço sob consulta
    ├─ NFS-e                       R$ 70/mês
    ├─ NFC-e                       R$ 90/mês
    ├─ BI                          R$ 150/mês
    ├─ Automação de Marketing      R$ 150/mês
    ├─ Assinatura Eletrônica       R$ 45/mês
    └─ Biometria                   R$ 90/mês
```

### 1.2 Como os módulos se relacionam
- **Agenda é o hub**: cria compromissos que disparam notificações (WhatsApp/SMS/email), alimentam o Painel de Atendimentos, geram ficha de avaliação, e abrem caixa/comissão.
- **Financeiro é downstream**: recebe vendas de serviços, planos, produtos, comissões, TEF, boletos, NFS-e/NFC-e.
- **CRM + Funil + Automação de Marketing** alimentam o +Resultados (consultoria premium): base de clientes → listas segmentadas → campanhas WhatsApp/SMS/email/push → reagendamento.
- **BSC (Balanced Scorecard)** é a "camada executiva": lê agenda + financeiro + CRM + NPS e devolve dashboards em 4 perspectivas (Financeira, Cliente, Processos, Aprendizado).
- **BelleChat IA e Gestor IA** são camadas de IA sobre o core: BelleChat é o frontal (atendimento WhatsApp) e Gestor IA é o backoffice (analytics conversacional).
- **Franquias** são um meta-módulo que empilha múltiplas unidades sob gestão consolidada (royalties, PRM, app da rede).

### 1.3 Decisão arquitetural central
Sistema **web multi-tenant cloud-first** (AWS) com **dois apps nativos** e estratégia de **add-ons monetizáveis** (cada funcionalidade "premium" é faturada separadamente). Não é modular no sentido "plug-and-play"; é um **monolito com feature flags pagas**.

> Fonte: [bellesoftware.com.br](https://www.bellesoftware.com.br/) · [bellesoftware.com.br/precos](https://www.bellesoftware.com.br/precos/)

---

## 2. Catálogo Completo de Features

### 2.1 Agenda e Operacional

| Feature | Detalhe | Copy oficial |
|---|---|---|
| Agendamento multi-profissional | Múltiplas visualizações (dia, semana) | "Agende suas clientes de acordo com os horários disponíveis" |
| Turnos/horários por profissional | Configuração por agenda | — |
| Notificações automáticas | WhatsApp, SMS, e-mail, push | "Mantém clientes informadas via WhatsApp, SMS, Email ou app" |
| Auditoria | Registra automaticamente quem agendou, data e hora | "Automaticamente registra quem fez cada agendamento" |
| Agendamento online | Integrado ao site da clínica ou link público | "Marcações diretas no site da clínica" sem retrabalho |
| Painel de Atendimentos | Visão operacional do dia (check-in, em atendimento, finalizado) | — |
| Ficha de Avaliação | Anamnese digital, evolução de procedimento, fotos antes/depois | "Diferentes tipos de avaliações, histórico de fotos antes e depois" |
| Perimetria + parâmetros laser | Medições corporais e registro de parâmetros | "Perimetria, fotos antes e depois, álbum de fotos, parâmetros de laser" |
| Álbum do cliente | Galeria de fotos por cliente | — |
| Encaixes | Otimização para sessões combinadas | "Encaixes perfeitos para terapias e sessões combinadas" |
| Bioimpedância | Integração/captura de dados | "Dados de bioimpedância" |
| Anamnese personalizada | Criação de formulários customizados | "Criação de avaliações personalizadas" |

> Fontes: [cloudia.com.br](https://www.cloudia.com.br/softwares-para-clinicas-de-estetica/) · [bellesoftware.com.br](https://www.bellesoftware.com.br/) · central de ajuda (inferido via search)

### 2.2 Financeiro

| Feature | Detalhe |
|---|---|
| Contas a pagar / a receber | Fluxo básico |
| Caixa (entrada e saída) | "Tenha controle total da gestão financeira, caixa de entrada e saída" |
| TEF (Cartão de Crédito) | Integração automática com conciliação |
| Boleto Bancário | Geração e gestão |
| NFS-e (add-on R$ 70/mês) | Emissão de nota fiscal de serviços eletrônica |
| NFC-e (add-on R$ 90/mês) | Nota fiscal ao consumidor (vendas de produtos) |
| ECF / SAT | "Conformidade fiscal com NFS-e, NFC-e, ECF ou SAT" |
| Conciliação bancária | Integração com plataformas de pagamento |
| Comissão de profissionais | Configurações de comissionamento com desconto de custo de serviço |
| Inadimplência | Relatório de default |
| Relatórios detalhados | "Relatórios detalhados com conciliação bancária" |
| Pacotes / Planos | Vendas de pacotes de sessões, com controle de sessões consumidas (alvo de reclamações em RA) |
| Voucher / Cupons | Gestão de voucher |

> Fontes: [bellesoftware.com.br/precos](https://www.bellesoftware.com.br/precos/) · [cloudia.com.br](https://www.cloudia.com.br/softwares-para-clinicas-de-estetica/)
> **Observação crítica**: controle de pacotes já foi questionado publicamente ("cliente recebeu 12 sessões em vez de 10" — [Reclame Aqui](https://www.reclameaqui.com.br/empresa/geinfo/lista-reclamacoes/)).

### 2.3 CRM e Marketing

| Feature | Detalhe |
|---|---|
| CRM completo | Relacionamento, histórico, perfil VIP |
| Funil de Vendas | Gestão de prospects / leads |
| Captação de Clientes | Estratégias de aquisição |
| Listas de Segmentação | Segmentação para campanhas |
| Automação de Marketing (add-on R$ 150/mês) | "Mais de 50 jornadas de clientes" prontas |
| WhatsApp Marketing (BelleMessage, R$ 229/mês) | Confirmações, lembretes, notificações, campanhas em massa |
| SMS Marketing | Envio em lote |
| E-mail Marketing | Envio em lote |
| Push Notifications | Via app nativo |
| NPS | "Pesquisas de satisfação de clientes" |
| Contratos e Orçamentos | Geração de orçamentos formais |
| Assinatura Eletrônica (add-on R$ 45/mês) | Assinatura digital de contratos |

> Fontes: [bellesoftware.com.br/mais-resultados](https://www.bellesoftware.com.br/mais-resultados/) · [bellesoftware.com.br/precos](https://www.bellesoftware.com.br/precos/)

### 2.4 BI e Indicadores (BSC)

Belle usa o framework **Balanced Scorecard** em 4 perspectivas:

| Perspectiva | KPIs inferidos (não todos divulgados) |
|---|---|
| **Financeira** | Faturamento, saldo em conta, contas a receber, contas a pagar, taxas de inadimplência |
| **Cliente** | Satisfação (NPS), retenção, ticket médio, frequência |
| **Processos** | Ocupação de agenda, no-show, tempo médio de atendimento |
| **Aprendizado** | Crescimento de equipe, metas, treinamentos |

- **Metas**: acompanhamento de objetivos por profissional/clínica
- **BI (add-on R$ 150/mês)**: dashboards avançados de análise de dados
- Central de ajuda dedica seção específica aos indicadores BSC ([ajuda.bellesoftware.com.br/knowledge-base/indicadores-de-performance](https://ajuda.bellesoftware.com.br/knowledge-base/indicadores-de-performance/))

### 2.5 IA (BelleChat IA + Gestor IA)

#### BelleChat IA (atendimento)
- **Frontal de atendimento WhatsApp** multi-conexão
- **Chatbot treinado com briefing da clínica** — "respostas automáticas com linguagem humanizada"
- **Agendamento automatizado** via bot
- **Gestão de leads**: tags no CRM, alteração de temperatura do lead, conversas gravadas no card
- **Mensagens pré-definidas + áudio**
- **Horários de atendimento configuráveis**
- **Controle de acesso granular** por perfil
- Copy: *"Mais produtividade, menos esforço"*

#### Gestor IA (analytics conversacional)
- **Linguagem natural sobre a base de dados** — "você pergunta, o Gestor IA responde"
- Casos de uso: faturamento, vendas, agendamentos
- **Não divulga o LLM utilizado**
- Copy: *"Decisões mais rápidas, gestão mais eficiente"* · *"Tenha em segundos os dados que levariam minutos"*
- **Sem instalação** — acesso por navegador
- Controle de acesso por usuário

> Fontes: [bellesoftware.com.br/bellechat](https://www.bellesoftware.com.br/bellechat/) · [bellesoftware.com.br/gestor-ia](https://www.bellesoftware.com.br/gestor-ia/)

### 2.6 Apps Mobile

**App da Clínica (Profissionais)** — [App Store](https://apps.apple.com/br/app/belle-software-profissionais/id1300715755) · [Play Store](https://play.google.com/store/apps/details?id=br.com.bellesoftware.profissional)
- Financeiro
- Agenda
- Cadastros
- Painel de Atendimentos
- Indicadores (BSC) em 4 perspectivas

**App do Cliente** — [App Store](https://apps.apple.com/br/app/belle-software-clientes/id1277892957) · [Play Store](https://play.google.com/store/apps/details?id=br.com.bellesoftware.cliente)
- Agendamento self-service
- Compra de Serviços
- Compra de Planos
- Compra de Produtos
- Promoções
- Notificações push

**App da Franquia** (modelo rede)
- Comunicação franqueadora ↔ franqueadas
- Atualizações, ocorrências, notificações
- Dedicado por marca

### 2.7 Integrações

| Categoria | Integração |
|---|---|
| Pagamentos | TEF cartão · Boleto bancário · plataformas de pagamento genéricas |
| Fiscal | NFS-e · NFC-e · ECF · SAT |
| Comunicação | WhatsApp Business (via BelleMessage) · SMS · E-mail · Push |
| Identificação | Biometria (R$ 90/mês) |
| Parceiros | TOTVS · Markkit · Agência Follow Me |
| IA | BelleChat IA (próprio) · Gestor IA (próprio) |

> Observação: Há reclamações públicas sobre **banimento de WhatsApp por envio indevido via Speedchat integrado** — sinal de que a integração WhatsApp opera em zona cinza das políticas da Meta ([Reclame Aqui](https://www.reclameaqui.com.br/empresa/geinfo/lista-reclamacoes/)).

---

## 3. Verticais Atendidas

| Vertical | Página dedicada | O que diferencia (vs estética) |
|---|---|---|
| **Estética clínica** | `/` (home) | Core — perimetria, laser, antes/depois, anamnese |
| **Micropigmentação e sobrancelhas** | `/software-para-micropigmentacao/` | **Nenhuma funcionalidade específica** encontrada (mesmo core, apenas copy diferente) |
| **Pilates e Yoga** | `/software-para-pilates-e-yoga/` | Cadastro de alunos, **agendamento de múltiplos alunos simultaneamente** (aulas em grupo), restante idêntico |
| **Salão de Beleza** | `/software-para-salao-de-beleza/` | **Nenhuma diferenciação específica** descrita (comissão, cadeira, comanda não aparecem destacadas) |
| **Spa** | Citado em cases (Dom Vitale, Estância do Lago) | Sem página dedicada aparente |
| **Estética Integrativa** | `/sistema-para-estetica-integrativa/` | Apenas "encaixes para terapias combinadas" — **termo de marketing, não edição distinta** |
| **Franquias** | `/franquias/` | **Gestão multi-unidade real** — PRM, royalties, relatório consolidado, app da rede |

**Insight**: apesar de oferecer "verticais", só duas têm funcionalidades reais diferenciadas — **pilates** (aula em grupo) e **franquias** (multi-unidade). As demais são **re-embalagens de marketing** do mesmo core.

---

## 4. Programa +Resultados (Consultoria)

**Natureza**: serviço complementar pago, provavelmente o principal upsell de LTV.

**Proposta**: *"Preparado para impulsionar o desempenho da sua clínica e garantir uma agenda lotada?"*

**Pilares declarados**:
1. Disparos de campanhas de marketing via WhatsApp
2. Automação de marketing com mais de 50 jornadas prontas
3. Preenchimento de horários vagos e fila de espera

**Entregáveis**:
- Campanhas internas de marketing
- Automações (WhatsApp, e-mail, SMS, push)
- Recomendação de serviços e planos
- Vendas automatizadas
- Otimização contínua de resultados

**Resultados vendidos** (quantitativos declarados no site):
- Revitalize-se: **+60% ticket médio**
- Naked. Laser: **+40% faturamento**
- Clínica CAF: **+65% faturamento**
- BodyPrime: **+41% faturamento**

**Formato**: não detalhado (duração, preço, frequência, formato 1:1 ou coletivo — tudo opaco). Mentores não nominados.

**Leitura estratégica**: é um **serviço premium híbrido (software + consultoria)** onde o software serve como infraestrutura para a equipe de consultoria executar campanhas na base da clínica. Gera uplift financeiro mensurável **e** prende o cliente (switching cost alto).

> Fonte: [bellesoftware.com.br/mais-resultados](https://www.bellesoftware.com.br/mais-resultados/)

---

## 5. Modelo de Franquias

**Não é modelo de franquia do software**; é **software para redes de franquia**.

**Módulos específicos**:
- **Módulo de Expansão da Rede**
  - PRM (Partner Relationship Management) — captação de novas franqueadas
  - Implantação de novas franqueadas
- **Módulo de Gestão da Rede**
  - Gestão Financeira consolidada
  - Gestão de Estoque centralizada
  - NF-e (Nota Fiscal de Produto)
  - Indicadores de Gestão (BSC consolidado)
  - **Royalties**
  - TEF cartão de crédito consolidado
  - Boleto bancário
- **App da Franquia** — comunicação franqueadora ↔ franqueadas (atualizações, ocorrências, BO, metas)

**Case de referência**: Estética Hollywood (rede consultada por Dr. Robert Rey), Priscila Palazzo (multi-unidade), Semblànt (rede).

**Copy**: centralização + comunicação + padronização.

> Fonte: [bellesoftware.com.br/franquias](https://www.bellesoftware.com.br/franquias/)

---

## 6. Assinatura Eletrônica, NFS-e, Integrações Fiscais

| Funcionalidade | Preço (2026) | Obrigatoriedade |
|---|---|---|
| Assinatura Eletrônica | R$ 45/mês | Opcional — contrato digital |
| NFS-e | R$ 70/mês | Opcional — serviços |
| NFC-e | R$ 90/mês | Opcional — produtos |
| ECF / SAT | Incluso/variável | Conformidade legada |
| Biometria | R$ 90/mês | Opcional — controle de acesso |
| BI | R$ 150/mês | Opcional — dashboards avançados |
| Automação de Marketing | R$ 150/mês | Opcional |
| WhatsApp (BelleMessage) | R$ 229/mês | Opcional |

**Fidelidade**:
- Plano **mensal**: cancelável com 30 dias de aviso
- Plano **anual**: 15% desconto, fidelidade 1 ano
- Plano **bienal**: 26% desconto, fidelidade 2 anos

**Incluso em todos os planos**:
- Cloud AWS
- Backup diário
- Atualizações
- **Usuários administradores e de recepção ilimitados**
- **Cadastros de clientes ilimitados**
- Suporte remoto ilimitado
- 7 treinamentos remotos coletivos de ~1h

**Add-on não fiscal**:
- Treinamento Individual: R$ 250 (parcela única)

> Fonte: [bellesoftware.com.br/precos](https://www.bellesoftware.com.br/precos/)

---

## 7. Casos de Sucesso / Social Proof

### 7.1 Clientes citados na home
- **Priscila Palazzo** (multi-unidade, referência digital)
- **Buddha Spa** (rede de spas)
- **Bestlaser**
- **Adclinic**
- **Fisical** (Janaína Marchiometo, Administradora)
- **Dom Vitale Day Spa** (Márcia, Administradora)
- **BellaClin** (Vanessa Amorim, Proprietária)
- **BioEstetic** (Euclair Aparecido Cremasco, Proprietário)
- **Revitalize** (clínica de micropigmentação)

### 7.2 Cases com resultados quantitativos
| Cliente | Resultado |
|---|---|
| Revitalize-se | +60% ticket médio |
| Naked. Laser | +40% faturamento |
| Clínica CAF | +65% faturamento |
| BodyPrime | +41% faturamento |

### 7.3 Redes / franquias
- Estética Hollywood (Dr. Robert Rey)
- Semblànt
- Priscila Palazzo

### 7.4 Cases narrativos (sem depoimento literal)
BodyConcept · Aurya · PhysioTime · The Laser (Recife) · Vitaclin (Curitiba, 20 anos) · Chez Elle · Estância do Lago (Almirante Tamandaré-PR) · Fisest (Campinas, desde 2013)

### 7.5 Credenciais institucionais
- Great Place to Work (GPTW)
- Parceiros: TOTVS · Markkit · Agência Follow Me
- Presença em mídia: Terra · GloboPlay · Mundo do Marketing
- Feiras: Congresso Estetika · Estética in Sul · Estética in SP · Confidefe · Beauty Summit

### 7.6 Volume
**"Confiança de mais de 2.500 clientes"** (home) — algumas páginas secundárias mencionam 2.700+, sugerindo crescimento ou inconsistência.

> Fonte: [bellesoftware.com.br/casos-de-sucesso](https://www.bellesoftware.com.br/casos-de-sucesso/)

---

## 8. Lacunas & Fraquezas Observadas

### 8.1 Produto (o que NÃO aparece)
- **Fluxo de caixa projetado** (projeção futura) — só há caixa realizado
- **DRE gerencial** — não é explicitado
- **Precificação baseada em custo** (custo direto do procedimento → margem → preço sugerido)
- **Gestão de comanda / ordem de serviço aberta** — não aparece destacado
- **Gestão de cadeira / box / sala** — nenhum material detalha ocupação de espaço físico
- **Controle de lote e validade de insumos** — não aparece em material público
- **Gestão de compras / cotação de fornecedores**
- **Integração contábil** (ContaAzul, Nibo, exportação SPED) — ausente
- **Integração Pix direto** (QR dinâmico) — não aparece destacada
- **Marketplace de procedimentos / franchising digital**

### 8.2 UX / Operação
- Central de ajuda com **visual datado** e estrutura de knowledge-base tradicional (artigos longos)
- **Nenhuma página pública de changelog / release notes**
- Página de vídeos com **apenas 3 vídeos institucionais** — não há universidade/academia estruturada
- Páginas verticais (micropigmentação, salão, pilates) são **praticamente idênticas** — pouco carinho por vertical

### 8.3 Reputação (Reclame Aqui)
Conjunto de queixas recorrentes:
1. **Falha em controle de pacotes** ("12 sessões em vez de 10") — bug crítico de negócio
2. **Necessidade de controle manual paralelo** — "informações somem ou não executam"
3. **Muitas telas para operações simples** — UX monolítica
4. **Suporte com respostas padronizadas** — sem análise individual
5. **Atraso em entrega de backup de dados** do cliente (LGPD sensível)
6. **Problemas de integração WhatsApp** — banimento permanente de números

> Fonte: [reclameaqui.com.br/empresa/geinfo/lista-reclamacoes](https://www.reclameaqui.com.br/empresa/geinfo/lista-reclamacoes/)

### 8.4 Preço
- **Opacidade dos valores base** — tabela de preços não exibe mensalidade principal
- **Add-ons caros que empilham rápido** — uma clínica com WhatsApp + BI + Marketing + NFS-e + NFC-e paga **R$ 689/mês só em add-ons** (antes do plano base)
- **Modelo "morde várias vezes"** — pode gerar atrito em clientes pequenos

---

## 9. Decisões de Produto Inferidas

### 9.1 Filosofia
- **Full-suite, não best-of-breed**: "tudo em um sistema" → trocar é doloroso (alto switching cost), bom para reter
- **Cloud-first desde o início** (AWS) — nenhum material sugere edição on-premise
- **Mobile complementar, não primário**: o core é web; os apps são companions (profissional + cliente)
- **Add-ons monetizáveis**: cada feature "premium" vira SKU separado → ARPU cresce com uso
- **Vertical de nicho (estética)** com pétalas em micro/pilates/salão/spa — mas sem investimento sério nessas verticais

### 9.2 Posicionamento
- **"Melhor sistema para clínica de estética"** — categoria pura
- **Faturamento como KPI-norte** — "aumente as suas vendas", "agenda lotada", "ticket médio +60%"
- **Consultoria como diferencial** (+Resultados) — raramente replicado por concorrentes
- **Marca presente em feiras e mídia** (TOTVS como parceiro é selo de credibilidade)

### 9.3 Go-to-Market
- **Teste grátis de 14 dias** como isca
- **0800 + WhatsApp** como canal de venda consultiva (alto toque)
- **Planos anuais/bienais com desconto agressivo** (15%, 26%) para travar churn
- **Programa +Resultados** como upsell após adoção inicial
- **Cases de expansão** (Priscila Palazzo, Hollywood) para mover contas grandes

### 9.4 Tecnologia inferida
- Front web SSR/CSR tradicional (não é SPA moderno — central de ajuda sugere stack antigo)
- Backend provavelmente PHP/Java tradicional (parceria TOTVS, estilo enterprise)
- Banco relacional na AWS (RDS ou similar)
- Apps nativos iOS + Android separados (não híbrido)
- BelleChat IA e Gestor IA parecem plugin sobre core — provavelmente chamadas para LLM externo (OpenAI/Anthropic/Azure)

---

## 10. Insights Acionáveis para KEYRA

### 10.1 O que REPLICAR (pragmaticamente)
| Item | Por quê |
|---|---|
| **Dois apps (clínica + cliente)** | Padrão do mercado; clientes esperam |
| **Agendamento online público** | Conversão + auto-serviço reduz ligação |
| **Notificações WhatsApp/SMS/email** | Reduz no-show drasticamente |
| **NPS nativo** | Social proof + retenção |
| **Fidelidade anual/bienal com desconto** | Travar churn |
| **Pacotes / planos de sessão** | É como clínica de estética vende |
| **Teste grátis 14 dias** | Padrão B2B SaaS |
| **BSC multiperspectiva** | Framework sólido para o módulo "Metas" da KEYRA |

### 10.2 O que fazer DIFERENTE (diferenciação KEYRA)
| Eixo | Belle faz | KEYRA deve fazer |
|---|---|---|
| **Foco** | Full-suite inchado | **Financeiro profundo** + agenda/estoque básicos sólidos |
| **Precificação** | Base opaca + 8 add-ons | **Preço único transparente** publicado no site |
| **UX** | Muitas telas, monolítico | **Tela única**, **números absolutos** (princípio da idealizadora) |
| **Financeiro** | Contas a pagar/receber raso | **Fluxo de caixa projetado, DRE simplificado, precificação por custo, alerta de margem** |
| **Simplicidade** | Curva de aprendizado alta | **Onboarding em 10 minutos**, sem treinamento obrigatório |
| **IA** | Chatbot + NL → dados | **IA preditiva financeira** (risco de caixa, inadimplência, sugestão de precificação) |
| **Transparência** | Reclamações sobre SAC padrão | **Status page pública, changelog, SLA explícito** |
| **Integração bancária** | TEF + boleto + plataformas | **Open Finance, Pix dinâmico, extrato bancário nativo** |
| **Contabilidade** | Inexistente | **Exportação contábil (SPED, OFX) + integração com ContaAzul/Nibo** |

### 10.3 Onde ATACAR (brechas competitivas)
1. **"Gestão financeira é caixa, não contas" — Belle trata financeiro como contas a pagar/receber.** KEYRA pode ser o único player com **DRE gerencial + fluxo de caixa projetado + margem por serviço** prontos.
2. **Simplicidade radical.** A maior reclamação pública de Belle é complexidade. Uma KEYRA com **3 telas principais** (Hoje, Financeiro, Cliente) pode ganhar PME menor que se sente perdida no Belle.
3. **Preço transparente.** Publicar mensalidade no site já é diferencial no segmento.
4. **Pacotes sem bug.** O bug de "12 sessões em vez de 10" é sensível — KEYRA deve ter **trilha de auditoria imutável** em pacotes/sessões como pilar de confiança.
5. **LGPD first.** O atraso em entregar backup é sinal de maturidade baixa. Self-service de exportação total de dados é diferencial.
6. **WhatsApp oficial (Cloud API Meta)**, não "Speedchat". Evita banimento.
7. **Sem consultoria empurrada.** Belle monetiza +Resultados pesado. KEYRA pode fazer o oposto — **um playbook de marketing gratuito embutido** e deixar o cliente aplicar sozinho.
8. **Nicho**: KEYRA é para **estética**, ponto. Não pulverizar em pilates/salão como Belle faz — ser o melhor em um lugar só.

### 10.4 Features-tabela de batalha (copy-paste para pitch)

| Capacidade | Belle | KEYRA (meta) |
|---|---|---|
| Preço base publicado | Não | **Sim** |
| DRE gerencial | Não claro | **Sim** |
| Fluxo de caixa projetado | Não claro | **Sim** |
| Precificação por custo + margem | Não | **Sim** |
| Tela única ("Hoje") | Não | **Sim** |
| WhatsApp Cloud API oficial | Parcial (add-on R$ 229) | **Sim, incluso no plano médio** |
| Open Finance | Não | **Sim** |
| Metas com BSC leve | Sim | **Sim (mais simples)** |
| Exportação contábil SPED/OFX | Não | **Sim** |
| Pacotes com auditoria imutável | Não | **Sim** |
| Onboarding self-service | 7 treinamentos coletivos | **10 minutos, vídeo + wizard** |

---

## Anexos

### A. URLs consultadas
- [bellesoftware.com.br](https://www.bellesoftware.com.br/)
- [bellesoftware.com.br/mais-resultados](https://www.bellesoftware.com.br/mais-resultados/)
- [bellesoftware.com.br/bellechat](https://www.bellesoftware.com.br/bellechat/)
- [bellesoftware.com.br/gestor-ia](https://www.bellesoftware.com.br/gestor-ia/)
- [bellesoftware.com.br/franquias](https://www.bellesoftware.com.br/franquias/)
- [bellesoftware.com.br/casos-de-sucesso](https://www.bellesoftware.com.br/casos-de-sucesso/)
- [bellesoftware.com.br/software-para-micropigmentacao](https://www.bellesoftware.com.br/software-para-micropigmentacao/)
- [bellesoftware.com.br/software-para-pilates-e-yoga](https://www.bellesoftware.com.br/software-para-pilates-e-yoga/)
- [bellesoftware.com.br/software-para-salao-de-beleza](https://www.bellesoftware.com.br/software-para-salao-de-beleza/)
- [bellesoftware.com.br/sistema-para-estetica-integrativa](https://www.bellesoftware.com.br/sistema-para-estetica-integrativa/)
- [bellesoftware.com.br/videos](https://www.bellesoftware.com.br/videos/)
- [bellesoftware.com.br/precos](https://www.bellesoftware.com.br/precos/)
- [ajuda.bellesoftware.com.br](https://ajuda.bellesoftware.com.br/) *(bloqueada por robots — inferido via search)*

### B. Fontes secundárias
- [Reclame Aqui — Geinfo/Belle Software](https://www.reclameaqui.com.br/empresa/geinfo/lista-reclamacoes/)
- [App Store — Belle Software Profissionais](https://apps.apple.com/br/app/belle-software-profissionais/id1300715755)
- [App Store — Belle Software Clientes](https://apps.apple.com/br/app/belle-software-clientes/id1277892957)
- [Play Store — Profissionais](https://play.google.com/store/apps/details?id=br.com.bellesoftware.profissional)
- [Play Store — Clientes](https://play.google.com/store/apps/details?id=br.com.bellesoftware.cliente)
- [Cloudia — comparativo de softwares de estética 2026](https://www.cloudia.com.br/softwares-para-clinicas-de-estetica/)
- [Belasis — sistema de gestão para clínicas 2026](https://www.belasis.com.br/melhor-sistema-de-gestao-para-clinicas-de-estetica-brasil-2026/)

### C. Próximos aprofundamentos sugeridos
1. Testar o free trial de 14 dias para mapear UX real e fluxos internos
2. Agendar demo com vendedor Belle para capturar pitch de vendas ao vivo e preços reais
3. Mapear central de ajuda completa (exigiria acesso manual, não via WebFetch)
4. Análise do app clientes (testar fluxo de agendamento + compra de plano)
5. Benchmarking direto Belle vs Trinks vs Gestek vs KEYRA em matriz de features
