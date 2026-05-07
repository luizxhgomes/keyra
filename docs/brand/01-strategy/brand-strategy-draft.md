# Brand Strategy — Rascunho consolidado

> **Status:** ⚠️ **DRAFT — pendente validação formal de `@marty-neumeier` (Brand Gap, Onliness, Zag) e `@april-dunford` (Positioning Canvas).**
> **Origem:** consolidação produzida pelo brand-chief em 2026-05-07 a partir de PRD, áudios da idealizadora, pesquisas competitivas (Trinks, Belle, Conta Azul, Kamino, Gestek, Clínica Experts DEZ) e brand identity v1.0.
> **Como tratar:** ponto de partida, não palavra final. Antes de virar oficial, executar Fase 1 e Fase 2 do squad com os agentes especialistas.

---

## 1. Brand Gap (Marty Neumeier — pendente formal)

Os 5 disciplinas do Brand Gap em rascunho:

### 1.1. Differentiate
**O que pretendemos ser o único:** o único software de gestão para clínica de estética em que **o financeiro nasce automaticamente da operação** — atendimento concluído gera comanda, pagamento gera transação, transação alimenta DRE, DRE informa decisão.

### 1.2. Collaborate
**Time/parceria implícita:** uma idealizadora dona de clínica + um dev que viveu o problema na clínica dela = produto que captura a realidade do balcão. Não é vendor distante.

### 1.3. Innovate
**Inovação central:** automação genuína via banco (triggers Postgres `trg_appointments_done_to_command`, `trg_payments_to_transaction`) — financeiro não precisa lançar manualmente. Aplicação fina sobre schema vivo.

### 1.4. Validate
**Validação:** PRD com 66 FR, 27 NFR, 27 CON. MVP feature-complete em produção. Concorrentes mapeados em pesquisas profundas. Persona-target identificada (Camila, 30-45, dona de clínica).

### 1.5. Cultivate
**Cultivo de longo prazo:** princípios UX inegociáveis (números absolutos, comparativos textuais, tela única, zero gráficos) são religião do produto — não negociáveis nem em pressão de feature request.

---

## 2. Onliness Statement (rascunho — formato Neumeier)

> "**KEYRA** é o único **software vertical de gestão financeira para clínicas de estética** que **conecta atendimento → comanda → pagamento → DRE em automação contínua de banco** — para **mulheres empreendedoras que cansaram de virar madrugada com planilha** durante o **boom da estética profissional brasileira pós-2023**."

Estrutura validada (formato canônico Zag):
- ✅ Quem somos: KEYRA
- ✅ O que fazemos: software vertical de gestão financeira para clínicas de estética
- ✅ Como: automação contínua via banco (não lançamento manual)
- ✅ Para quem: mulheres empreendedoras que cansaram de virar madrugada com planilha
- ✅ Quando/contexto: boom da estética profissional brasileira pós-2023

**Pendente Neumeier:** afiar redação, validar onliness real (alguém faz exatamente isso?) e checar **zag** — onde os concorrentes não jogam.

---

## 3. Brand Ladder (Atributos → Recompensas → Valores → Propósito)

### Atributos
- Automação genuína via banco
- Schema rico (21 tabelas, 6 views)
- Multi-tenancy por JWT claim
- Princípios UX inegociáveis
- Pt-BR culto e direto
- Editorial luxury sem ostentação

### Benefícios funcionais
- Financeiro fechado sem trabalho manual
- DRE confiável em tempo real
- Decisão com dado, não achismo
- Domingo livre (sem planilha)
- Acabar com vazamento de receita

### Recompensas emocionais
- Sensação de **controle** (não de surpresa)
- Sensação de **estar em paz com o dinheiro**
- Sensação de **profissionalismo** (estou usando algo à minha altura)
- Sensação de **não estar sozinha** (alguém entendeu)

### Valores
- Decisão clara > planilha bonita
- Operação real > dashboard vazio
- Mulher profissional > clichê beauty
- Quiet luxury > ostentação
- Verdade financeira > otimismo motivacional

### Propósito (rascunho)
**Devolver às mulheres empreendedoras o controle do dinheiro que sai dos seus serviços, com a calma e a clareza que a clínica delas merece.**

(Pendente validação Neumeier — propósito é coisa séria; rascunho aqui é palpite informado.)

---

## 4. Positioning (April Dunford — pendente formal)

### 4.1. Categoria de mercado
**Software vertical de gestão financeira para clínicas de estética brasileiras.**

Não é "ERP genérico" (Conta Azul, Omie). Não é "agenda com financeiro" (Trinks, Belle, Gestek). É **categoria nova**: o financeiro como output da operação, não input contábil.

### 4.2. Alternativas competitivas (a perspectiva da Camila)

| Alternativa | O que faz | Por que perde |
|-------------|-----------|---------------|
| **Planilha Excel/Google** | Tudo manual | Domingo perdido, erro humano, sem auditoria, não escala |
| **Conta Azul / Omie** | ERP genérico | Pensado para qualquer negócio; lançamento manual; cadastro de produto, não serviço; UX corporativa fria |
| **Trinks (Stone)** | Agenda + comanda + maquininha | Stack legado, financeiro raso, sem DRE-por-serviço, sem precificação. Vendido como "agenda inteligente", não plataforma financeira |
| **Belle Software (Geinffo-SC)** | Vertical estética 17 anos | UI denso/datado (FlatUI 2015), dependente de implantação manual, sem self-service, regional |
| **Gestek** | Vertical estética pequeno | Pricing baixo, agenda-first, financeiro muito raso |
| **Kamino** | Vertical estética | Régua de cobrança forte, mas resto fraco |
| **Clínica Experts DEZ** | Vertical AI-first | Mais próximo conceitualmente; tem IA Anna; mas financeiro raso ainda |
| **Não fazer nada** | Status quo | Vazamento de receita continua, achismo continua, planilha continua |

### 4.3. Atributos únicos da KEYRA

1. **Financeiro nasce da operação** (triggers de banco, não lançamento manual)
2. **DRE-por-serviço real** (não DRE genérico de empresa)
3. **Princípios UX inegociáveis** (números absolutos, sem gráficos no MVP, tela única)
4. **Decimal.js + ROUND_HALF_EVEN consistente** (precisão financeira invariante)
5. **Multi-tenant por JWT claim** (segurança real, não promessa)
6. **Marca editorial luxury** (não SaaS genérico, não ERP, não spa fofo)

### 4.4. Valor entregue (em uma frase para Camila)
"Você abre o KEYRA depois do último atendimento, vê quanto entrou, quanto sobrou, e sabe o que ajustar — em 30 segundos, sem planilha."

### 4.5. Quem é o cliente (best-fit ICP)

- **Mulher**, 30-45 anos
- **Dona** de clínica de estética (não funcionária)
- **1-3 unidades** ou **clínica única com equipe**
- Faturamento mensal **R$ 30k a R$ 250k**
- Tem **contador externo** (MEI, Simples ou Lucro Presumido)
- Tem **maquininha** Cielo/Rede/Stone/PagSeguro
- **Já tentou** planilha bonita ou Conta Azul, **abandonou**
- Quer **lucro real**, não dashboard bonito
- **Fala pt-BR culto, direto.** Não é influencer beauty, não é coach financeira

### 4.6. Quem **NÃO** é o cliente

- Salões de beleza grandes com depto financeiro próprio (overkill)
- Clínicas com >5 unidades + ERP corporativo já implantado
- Profissionais autônomos sem CNPJ (KEYRA tem multi-tenant pesado, não vale a pena)
- Estéticos sociais/comunitários (preço errado)
- Spas hoteleiros (modelo diferente)

### 4.7. Categoria de mercado posicionada

> "Para mulheres empreendedoras donas de clínica de estética que cansaram de virar madrugada com planilha, **KEYRA é o software vertical de gestão financeira em que o financeiro nasce automaticamente da operação**, em vez de ERPs genéricos onde tudo é lançamento manual ou agendas que param na comanda."

(Pendente validação Dunford — afiar redação, testar com 5 Camilas reais, ajustar até ela completar a frase sozinha.)

---

## 5. Brand Soul (Emily Heyward — pendente Fase 5)

Antecipando o que vai virar movimento:

- **Belief central:** mulher empreendedora merece tecnologia à sua altura, não infantilizada
- **Inimigo simbólico:** a planilha de domingo (símbolo do trabalho invisível)
- **Aliado simbólico:** a contadora aliada (não vilã — KEYRA conversa com contador)
- **Tribe:** "Mulheres que tocam clínica" (não "donas de clínica" — ação, não posse)
- **Ritual:** o fechamento do dia em 30 segundos (não a maratona de domingo)
- **Vitória:** primeiro mês fechado positivo + domingo livre

Pendente desenvolvimento formal por `@emily-heyward` na Fase 5.

---

## 6. Próximos passos formais

| Fase | Quem ativa | Comando | Output |
|------|-----------|---------|--------|
| **1. Diagnose** | `@marty-neumeier` | `*brand-diagnosis` consumindo este draft + áudios + PRD | `01-strategy/brand-soul-canvas.md`, `01-strategy/onliness-statement.md`, `01-strategy/brand-ladder.md` |
| **2. Position** | `@april-dunford` | `*positioning-exercise` consumindo este draft + pesquisas competitivas | `01-strategy/positioning-canvas.md` |
| **5. Activate** | `@emily-heyward` | `*movement-architecture` (após 1, 2, 4 fechadas) | `04-activate/narrative-architecture.md`, `04-activate/movement-blueprint.md` |

Este draft (`brand-strategy-draft.md`) **não é** o documento oficial — é o ponto de partida para esses agentes refinarem. Após validação formal, este arquivo é arquivado em favor dos outputs canônicos das fases 1, 2, 5.

---

_Última atualização: 2026-05-07 · brand-chief consolidando v1.0._
