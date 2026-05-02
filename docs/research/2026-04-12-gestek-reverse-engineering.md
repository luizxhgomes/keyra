![
    
](image.png)# Engenharia Reversa: Gestek - Sistema de Gestão para Clínicas Estéticas

**Data:** 2026-04-12
**Pipeline:** Deep Research > Reverse Engineering + Benchmark
**Objetivo:** Mapear completamente o sistema Gestek para informar a arquitetura do KEYRA
**Status:** CONSOLIDADO

---

## 1. VISÃO GERAL DO GESTEK

### Identidade
- **Nome:** Gestek
- **Segmento:** SaaS para gestão de clínicas estéticas
- **Sede:** Rua Sinimbu, 1241 - Caxias do Sul, RS
- **CNPJ:** 43.953.891/0001-03
- **Contato:** (54) 93300-1000 | contato@gestek.com.br
- **Site:** https://www.gestek.com.br/

### Métricas Públicas
| Métrica | Valor |
|---------|-------|
| Clínicas usando | 2.394+ |
| Tratamentos agendados | 1.300.000+ |
| Pacientes atendidos | 484.000+ |

### Proposta de Valor
"Tudo o que a sua clínica precisa, em um só lugar" — sistema especializado em gestão estética com enfoque em facilidade de uso e suporte consultivo.

---

## 2. ARQUITETURA FUNCIONAL COMPLETA

### 2.1 Módulo: Agenda / Agendamentos

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Agenda multi-profissional | Separação por profissional + sala | ALTA - core do KEYRA |
| Separação de salas | Visualização e alocação por sala/espaço | MÉDIA |
| Agendamento online | Link compartilhável em redes sociais para auto-agendamento | ALTA |
| Confirmação automática SMS | Envio automático de SMS para confirmar (pago à parte) | MÉDIA |
| Confirmação automática WhatsApp | Módulo adicional de WhatsApp automático | ALTA |
| Controle de faltas | Identificação de clientes faltantes | MÉDIA |
| Identificação melhores clientes | Ranking por frequência/faturamento | ALTA |

**Lacuna Gestek vs KEYRA:** O Gestek trata a agenda como módulo operacional isolado. No KEYRA, a agenda é a **origem do faturamento** — cada agendamento gera automaticamente dados financeiros. O Gestek não conecta agenda -> financeiro automaticamente.

### 2.2 Módulo: Gestão de Clientes/Pacientes

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Cadastro completo | Dados pessoais, histórico, preferências | ALTA |
| Histórico de serviços | Registro de todos os atendimentos realizados | ALTA |
| Anamnese personalizável | Modelos pré-prontos + custom | MÉDIA |
| Relatórios de aniversário | Listagem para marketing de relacionamento | BAIXA |
| Relatório de frequência | Clientes ativos vs inativos | MÉDIA |
| Controle de sessões | Sessões de pacote utilizadas por cliente | ALTA |

**Lacuna Gestek vs KEYRA:** Não tem CRM avançado. Não calcula LTV do cliente. Não conecta histórico do cliente com rentabilidade/lucro gerado.

### 2.3 Módulo: Vendas e Faturamento

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Venda de produtos | Com controle de estoque integrado | MÉDIA |
| Venda de procedimentos | Registro detalhado por serviço | ALTA |
| Criação de pacotes | Pacotes com descontos pré-configurados | ALTA |
| Controle de sessões pacote | Tracking de sessões consumidas | ALTA |
| Cálculo taxa cartão | Desconto automático de taxas de maquininha | ALTA |

**Lacuna Gestek vs KEYRA:** O Gestek registra vendas mas NÃO calcula lucro por serviço. Não faz precificação automática. Não conecta venda com custo real (insumos + tempo + comissão).

### 2.4 Módulo: Financeiro

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Controle financeiro geral | Receitas e despesas da clínica | ALTA |
| Comissionamento | Gestão de comissões por profissional | ALTA |
| Separação por profissional | Financeiro independente por agenda | MÉDIA |
| Cálculo taxas cartão | Desconto automático das taxas | ALTA |

**Lacuna CRÍTICA Gestek vs KEYRA:** 
- NÃO tem DRE automático
- NÃO calcula lucro por serviço
- NÃO faz precificação com base em custos reais
- NÃO gera financeiro automaticamente da operação (requer lançamento manual)
- NÃO tem metas financeiras
- NÃO tem projeções
- Financeiro é REATIVO, não PROATIVO

### 2.5 Módulo: Estoque

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Controle de estoque | Entradas, saídas, saldo | ALTA |
| Previsão de compra | Alerta de reposição baseado em consumo | MÉDIA |
| Produtos mais vendidos | Ranking de produtos | MÉDIA |
| Integração com vendas | Baixa automática na venda | ALTA |

**Lacuna Gestek vs KEYRA:** NÃO conecta consumo de insumos por serviço (custo real do procedimento). O KEYRA precisa saber que "1 sessão de limpeza de pele = X ml de ácido + Y unidades de gaze" para calcular custo real.

### 2.6 Módulo: Documentação

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| Orçamentos personalizados | Impressão de propostas para clientes | BAIXA |
| Receituários | Orientações pós-procedimento | BAIXA |
| Notas de serviço (NFS-e) | Módulo adicional - R$ 39,90/mês | MÉDIA |
| Livro de protocolos | Consulta rápida de procedimentos | BAIXA |

### 2.7 Módulo: Comunicação

| Funcionalidade | Descrição | Relevância KEYRA |
|----------------|-----------|------------------|
| WhatsApp automático | Módulo adicional para confirmações | ALTA |
| SMS automático | Cobrado separadamente | MÉDIA |
| Botão rápido WhatsApp | Acesso direto para contato com cliente | MÉDIA |

---

## 3. MODELO DE PREÇOS DO GESTEK

### Planos

| Plano | Valor/mês | Fidelidade | Economia |
|-------|-----------|------------|----------|
| Mensal | R$ 99,90 | Sem fidelidade | — |
| Semestral | R$ 89,90 | 6 meses | 10% |
| Anual | R$ 69,90 | 12 meses | 30% |

### Adicionais

| Item | Valor/mês |
|------|-----------|
| Profissional adicional | R$ 22,90 |
| Módulo Fiscal (NFS-e) | R$ 39,90 |
| SMS | Cobrado por uso |
| WhatsApp automático | Incluso como módulo |

### Incluso em TODOS os planos
- Clientes ilimitados
- Vendas ilimitadas
- Registros ilimitados
- 1 profissional/agenda
- Acesso mobile (Android/iOS)
- Impressão de documentos
- Modelos de anamnese ilimitados
- Teste gratuito

### Análise de Pricing
- **Ticket médio estimado:** R$ 70-130/mês (considerando adicionais)
- **Estratégia:** Freemium trial -> assinatura com lock-in anual
- **Upsell:** Profissionais adicionais + módulo fiscal
- **Margem de posicionamento KEYRA:** Pode cobrar R$ 99-199/mês com o diferencial de financeiro automático + inteligência

---

## 4. ANÁLISE COMPETITIVA DO MERCADO

### Landscape Completo

| Sistema | Foco | Preço Base | Diferencial Principal | Ponto Fraco |
|---------|------|-----------|----------------------|-------------|
| **Gestek** | Estética | R$ 69,90-99,90/mês | Suporte consultivo, simplicidade | Financeiro básico, sem lucro/serviço |
| **Belle Software** | Estética | ~R$ 72/mês (anual) | Robustez, apps separados (cliente/gestor) | Preço opaco, curva aprendizado |
| **Clinicorp** | Odonto+Estética | R$ 127-149+/mês | 60+ funcionalidades, WhatsApp integrado | Complexo, mais caro, foco odonto |
| **Esthetic Manager** | Estética | Não divulgado | IA no WhatsApp (secretária virtual) | Startup mais nova, menos mercado |
| **Clinora** | Estética | Não divulgado | Modular, flexível | Menos conhecido |
| **Sistec Estética** | Estética | Não divulgado | Suporte excepcional, personalização | Menos funcionalidades |
| **Estética Fácil** | Estética | Não divulgado | Plataforma all-in-one | Interface datada |
| **Atendente.AI** | Multi | Não divulgado | IA para agendamento automático | Não é específico de estética |
| **Cloudia** | Multi saúde | Não divulgado | Chatbot IA para clínicas | Genérico, não especializado |

### Gaps de Mercado Identificados (Oportunidade KEYRA)

1. **NENHUM** sistema conecta agenda -> financeiro automaticamente
2. **NENHUM** calcula lucro real por serviço (receita - insumos - comissão - tempo)
3. **NENHUM** faz precificação automática baseada em custos reais
4. **NENHUM** gera DRE automático da operação
5. **NENHUM** oferece mentoria financeira integrada (pilar de inteligência)
6. **NENHUM** tem dashboard com números absolutos sem gráficos (princípio UX KEYRA)
7. **POUCOS** integram IA de forma nativa (apenas Esthetic Manager e Cloudia)

---

## 5. MAPEAMENTO GESTEK -> KEYRA

### Funcionalidades a REPLICAR (table stakes)

Estas funcionalidades são pré-requisito do mercado — o KEYRA precisa tê-las:

| Funcionalidade Gestek | Módulo KEYRA Equivalente | Prioridade |
|-----------------------|-------------------------|------------|
| Agenda multi-profissional | Agenda (Pilar 1) | P0 |
| Agendamento online | Agenda (Pilar 1) | P1 |
| Cadastro de clientes | Pacientes/CRM | P0 |
| Histórico de atendimentos | Pacientes/CRM | P0 |
| Venda de serviços | Serviços/Catálogo | P0 |
| Pacotes com desconto | Serviços/Catálogo | P1 |
| Controle sessões pacote | Serviços/Catálogo | P1 |
| Controle financeiro | Financeiro (Pilar 3) | P0 |
| Comissionamento | Financeiro (Pilar 3) | P0 |
| Controle estoque | Estoque/Insumos | P1 |
| WhatsApp integração | Comunicação | P1 |
| Acesso mobile | Infraestrutura | P0 |

### Funcionalidades a SUPERAR (diferenciais KEYRA)

Estas são as funcionalidades que o Gestek NÃO tem e que formam o diferencial competitivo do KEYRA:

| Diferencial KEYRA | Módulo | O que resolve | Gestek tem? |
|-------------------|--------|---------------|-------------|
| Comanda automática (agenda -> financeiro) | Comanda | Elimina lançamento manual | NÃO |
| Lucro por serviço | Custos/Precificação | Saber se cada serviço dá lucro | NÃO |
| Precificação automática | Custos/Precificação | Preço mínimo baseado em custo real | NÃO |
| DRE automático | DRE | Demonstrativo de resultado sem contador | NÃO |
| Custo de insumo por serviço | Estoque/Insumos | Quanto cada procedimento consome | NÃO |
| Dashboard numérico (sem gráficos) | Dashboard | Decisão rápida sem interpretar gráficos | NÃO |
| Metas financeiras | Inteligência | Acompanhamento de meta vs real | NÃO |
| Inteligência IA | Inteligência | Insights proativos sobre financeiro | NÃO |
| Upload de PDFs (notas, comprovantes) | Upload PDFs | Documentação financeira centralizada | NÃO |

### Funcionalidades a NÃO INCLUIR (fora do escopo KEYRA)

| Funcionalidade Gestek | Motivo de exclusão |
|-----------------------|-------------------|
| Anamnese/fichas clínicas | KEYRA é financeiro, não clínico |
| Receituários pós-procedimento | Função clínica, não financeira |
| Livro de protocolos | Função clínica, não financeira |
| NFS-e / Notas fiscais | Complexidade fiscal - pode ser futuro |
| SMS pago | WhatsApp resolve melhor e mais barato |

---

## 6. MODELO DE DADOS INFERIDO DO GESTEK

Baseado nas funcionalidades observadas, o Gestek provavelmente opera com estas entidades:

```
Clínica (tenant)
├── Profissional (1:N)
│   ├── Agenda (1:N)
│   │   └── Agendamento (1:N)
│   │       ├── Cliente (N:1)
│   │       ├── Serviço (N:1)
│   │       └── Sala (N:1)
│   └── Comissão (1:N)
├── Cliente (1:N)
│   ├── Anamnese (1:N)
│   ├── HistóricoAtendimento (1:N)
│   └── Pacote (1:N)
│       └── SessãoPacote (1:N)
├── Serviço (1:N - catálogo)
├── Produto (1:N - estoque)
│   └── MovimentaçãoEstoque (1:N)
├── Venda (1:N)
│   ├── ItemVenda (1:N) — serviço ou produto
│   └── Pagamento (1:N) — forma, taxa cartão
├── Financeiro
│   ├── Receita (1:N)
│   └── Despesa (1:N)
└── Documento (1:N)
    ├── Orçamento
    ├── Receituário
    └── NotaServiço
```

### Evolução necessária para KEYRA

O KEYRA precisa **estender** este modelo com:

```
Serviço
├── InsumoServiço (1:N) — custo real por procedimento
│   └── Produto/Insumo (N:1)
├── CustoFixoRateado — aluguel, energia, etc
└── MargemLucro — calculada automaticamente

Agendamento → Comanda (gerada automaticamente)
├── Receita (auto)
├── CustoInsumo (auto - baseado em InsumoServiço)
├── Comissão (auto - baseado em config profissional)
└── LucroLíquido (auto - receita - custos - comissão)

DRE (gerado automaticamente por período)
├── ReceitaBruta
├── DeduçõesImpostos
├── CustosVariáveis (insumos)
├── CustosFixos
├── DespesasOperacionais
└── LucroLíquido

Meta (por período)
├── MetaReceita
├── MetaAtendimentos
└── Acompanhamento (real vs meta)
```

---

## 7. STACK TÉCNICA INFERIDA DO GESTEK

| Aspecto | Observado |
|---------|-----------|
| Tipo | Web-based (SaaS) |
| Acesso | Browser + apps mobile (Android/iOS) |
| Hospedagem | Cloud (acesso de qualquer lugar) |
| Apps mobile | Provavelmente webview/hybrid |
| Integração | WhatsApp API, SMS gateway |
| Modelo | Multi-tenant |

---

## 8. RECOMENDAÇÕES ESTRATÉGICAS PARA O KEYRA

### 8.1 Posicionamento
O KEYRA não compete diretamente com o Gestek. O Gestek é um **sistema de gestão operacional** (agenda, clientes, estoque). O KEYRA é um **sistema financeiro operacional** — onde a operação GERA o financeiro automaticamente.

**Narrativa:** "O Gestek organiza sua clínica. O KEYRA mostra se sua clínica dá lucro."

### 8.2 Prioridade de Desenvolvimento (MVP)

| Fase | Módulos | Justificativa |
|------|---------|---------------|
| MVP | Agenda + Serviços + Comanda Auto + Financeiro Básico | Core loop: agendar -> atender -> faturar automaticamente |
| V1 | + Custos/Precificação + Dashboard Numérico | Diferencial: lucro por serviço |
| V2 | + Estoque/Insumos + DRE + Metas | Gestão financeira completa |
| V3 | + IA + Upload PDFs + Marketplace | Inteligência e ecossistema |

### 8.3 Pricing Sugerido

| Plano | Público | Faixa | Justificativa |
|-------|---------|-------|---------------|
| Start | Autônoma (1 prof) | R$ 79-99/mês | Compete com Gestek anual |
| Crescimento | Clínica (2-5 prof) | R$ 149-199/mês | Valor pelo financeiro auto |
| Autoridade | Rede (5+ prof) | R$ 299-399/mês | DRE + IA + multi-unidade |

### 8.4 Riscos e Mitigações

| Risco | Mitigação |
|-------|----------|
| Gestek adicionar funções financeiras | Velocidade de execução + profundidade financeira |
| Complexidade do financeiro automático | UX simplificada (princípios da idealizadora) |
| Mercado acostumado com sistemas operacionais | Educação via conteúdo da mentora |
| Concorrentes com IA (Esthetic Manager) | IA focada em financeiro, não em agendamento |

---

## 9. CONCLUSÃO

O Gestek é um sistema **operacional competente mas financeiramente superficial**. Ele resolve bem o dia a dia da clínica (agenda, clientes, estoque) mas deixa a profissional sem saber:

1. Quanto ela realmente lucra por serviço
2. Se o preço que cobra cobre seus custos
3. Qual é o DRE real do mês
4. Se está batendo suas metas
5. Onde está perdendo dinheiro

O KEYRA ocupa exatamente esse gap. A estratégia não é substituir o Gestek — é ser o **complemento financeiro inteligente** que nenhum sistema do mercado oferece, ou eventualmente o **sistema único** que faz operação E financeiro de forma integrada.

---

## FONTES

- [Gestek - Site Oficial](https://www.gestek.com.br/)
- [Gestek - Central de Ajuda](https://ajuda.gestek.com.br/)
- [Os 9 Melhores Sistemas para Clínicas de Estética em 2026](https://clinora.com.br/os-9-melhores-sistemas-para-clinicas-de-estetica-em-2026/)
- [Comparativo de Softwares de Gestão para Estética](https://clinora.com.br/comparativo-diferentes-softwares-de-gestao-para-clinicas-de-estetica/)
- [Como Escolher Sistema de Gestão para Estética 2026](https://www.belasis.com.br/melhor-sistema-de-gestao-para-clinicas-de-estetica-brasil-2026/)
- [Belle Software - Planos e Preços](https://www.bellesoftware.com.br/precos/)
- [Clinicorp - Planos](https://www.clinicorp.com/planos)
- [Esthetic Manager](https://estheticmanager.com.br/)
- [Cloudia - Softwares para Clínicas de Estética](https://www.cloudia.com.br/softwares-para-clinicas-de-estetica/)
- [Gestek LinkedIn](https://br.linkedin.com/company/sistemagestek)
- [Gestek Facebook](https://www.facebook.com/gestekoficial/)
