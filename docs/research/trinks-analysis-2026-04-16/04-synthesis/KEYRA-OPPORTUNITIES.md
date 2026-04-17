# KEYRA — Opportunity Playbook (derivado da análise Trinks)

**Data:** 2026-04-16
**Input:** Pesquisa estratégica completa Trinks (6 frentes + 5 reports de análise)
**Output:** 30+ plays acionáveis para o roadmap KEYRA, priorizadas por impacto × facilidade de execução × gap competitivo

---

## Como ler este documento

Cada play tem:
- **# de prioridade** (P1 = urgente, P2 = próximos 6m, P3 = depois)
- **Impacto** (ALTO/MÉDIO/BAIXO) — quanto move a agulha de diferenciação
- **Dificuldade** (ALTA/MÉDIA/BAIXA) — esforço de execução
- **Gap Trinks** (INEXISTE/RASO/IGUAL) — posição do concorrente
- **Evidência** — onde o finding foi descoberto

---

## PARTE 1 — PRODUTO (15 plays)

### P1.1 🎯 Módulo Precificação Inteligente
**Impacto:** ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** INEXISTE
Calculadora de custo direto → markup → margem-alvo → preço sugerido. Simulador: *"se eu baixar 10%, quanto cai o lucro?"*. Alerta quando margem cai abaixo de piso configurável.
**Evidência:** features-deep-dive §3 — "Trinks NÃO TEM este módulo."
**Por que agora:** gap universal do mercado (zero dos 16 concorrentes tem); é o feature-âncora de posicionamento.

### P1.2 🎯 Tela Única "Meu Dia" com 5 números-hero
**Impacto:** ALTO · **Dificuldade:** BAIXA · **Gap Trinks:** OPOSTO
5 números grandes: Caixa de hoje · Faturamento vs Meta · Produtos acabando · Próximos compromissos · Margem do mês. Zero gráfico. Mobile-first.
**Evidência:** princípio UX idealizadora + positioning-analysis §9 + features-deep-dive §2.7.
**Por que agora:** é o manifesto UX do KEYRA — Trinks tem 130+ relatórios como argumento.

### P1.3 🎯 DRE "CFO-grade" para estética
**Impacto:** ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** RASO
Receita · CMV · Custo fixo · Lucro bruto · Pró-labore · Impostos · Lucro líquido. Filtráveis por período. Todas as linhas clicáveis para drill-down. Zero gráfico.
**Evidência:** features-deep-dive §2 — "DRE existe mas é relatório clássico".
**Por que agora:** DRE é passagem obrigatória para vender "CFO para estética".

### P1.4 🎯 Conciliação multi-adquirente automática
**Impacto:** ALTO · **Dificuldade:** ALTA · **Gap Trinks:** INEXISTE
Importação automática de extratos Stone + Cielo + PagSeguro + SumUp + InfinitePay. Matching com recebimento esperado. Destaque de divergência de taxa.
**Evidência:** features-deep-dive §2.3 — RA título literal "Problemas com antecipação de recebíveis e split de pagamentos".
**Por que agora:** dor invisível de 90% do mercado; ninguém resolve.

### P1.5 🎯 BOM editável (ficha técnica real)
**Impacto:** ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** RASO
Cadastrar insumos consumidos por procedimento (produto X: 2ml, produto Y: 1un). Baixa automática derivada. Custo direto por serviço alimenta módulo de Precificação (#P1.1).
**Evidência:** features-deep-dive §4 — "Trinks chama 'ficha técnica' o que é log de uso".
**Por que agora:** alavanca a Precificação e elimina a dor central da dona de clínica.

### P1.6 🎯 Lote + validade em estoque
**Impacto:** MÉDIO-ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** INEXISTE
Controle por lote e validade. Alerta "use antes de abrir novo". FIFO. Relatório Anvisa-ready.
**Evidência:** features-deep-dive §4 — crítico para dermocosméticos/biocompostos.
**Por que agora:** compliance + diferencial para clínica séria.

### P1.7 🎯 Metas em tempo real com push de conquista
**Impacto:** MÉDIO-ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** RASO
Meta do mês em número absoluto ("R$ 7.200 de R$ 10.000, falta R$ 2.800"). Push notification em 50/80/100%. Comissão escalonada (40/50/60%) configurável.
**Evidência:** features-deep-dive §5 — "Trinks faz comissão batch mensal, ranking estático".
**Por que agora:** retenção de profissional é dor da clínica; motor de gamificação sem infantilizar.

### P1.8 🎯 Pacotes com análise de margem por sessão
**Impacto:** MÉDIO-ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** RASO
Quando cadastra pacote (ex: 10 drenagens R$ 990), mostra margem projetada por sessão considerando comissão + insumos + descontos.
**Evidência:** competitors-matrix §4 — "Pacotes/sessões com gestão de margem por sessão" = gap universal.
**Por que agora:** clínica vende muito pacote no escuro — diferencial visível.

### P1.9 🎯 Pagamento a fornecedor via Pix no app
**Impacto:** MÉDIO · **Dificuldade:** BAIXA-MÉDIA · **Gap Trinks:** BLOQUEADO
Pagar fornecedor direto do app via Pix ou boleto. Vincular à despesa (contas a pagar). Baixa automática no fluxo de caixa.
**Evidência:** features-deep-dive §2.3 — FAQ Trinks: "Conta Digital Trinks permite apenas pagamento para profissionais".
**Por que agora:** fechar ciclo financeiro completo sem forçar cliente a sair do app.

### P1.10 🎯 Pré-pagamento Pix no agendamento online
**Impacto:** MÉDIO · **Dificuldade:** BAIXA · **Gap Trinks:** RASO
Cliente final agenda online → paga via Pix na hora → reduz no-show sem depender de cartão/maquininha.
**Evidência:** features-deep-dive §1.3 + concorrente Prit ("95% redução no-show").
**Por que agora:** paridade com melhor prática de nicho + liberdade de adquirente.

### P1.11 🎯 Lista de espera automática
**Impacto:** MÉDIO · **Dificuldade:** BAIXA · **Gap Trinks:** INEXISTE
Cliente pede horário ocupado → entra em fila → recebe WhatsApp automático quando vaga abre.
**Evidência:** features-deep-dive §1.3 — "Sem menção explícita a lista de espera".
**Por que agora:** feature quase-padrão em SaaS modernos, óbvia de vender.

### P1.12 🎯 Pró-labore explícito e separação PF/PJ
**Impacto:** MÉDIO-ALTO · **Dificuldade:** BAIXA · **Gap Trinks:** TABU
Campo de pró-labore configurável. Linha "quanto seu negócio te paga" no DRE. Educação em onboarding.
**Evidência:** positioning-analysis §8 Tabu 1 — "Trinks fala de faturamento, nunca de pró-labore".
**Por que agora:** ocupar tabu narrativo do mercado.

### P1.13 🎯 Importador Trinks→KEYRA via API pública
**Impacto:** MÉDIO-ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** N/A
Usar `GET /v1/clientes`, `GET /v1/servicos` da API pública Trinks para migrar cadastros em 1 clique.
**Evidência:** technical-footprint §3 + trinks.readme.io docs.
**Por que agora:** caça aos insatisfeitos em Reclame Aqui/App Store reviews; remove fricção de switch.

### P1.14 🎯 Anamnese + foto antes/depois com privacidade
**Impacto:** MÉDIO · **Dificuldade:** MÉDIA · **Gap Trinks:** RASO
Ficha de anamnese personalizada + captura de foto antes/depois (S3 privado + URL pré-assinada) + termo de consentimento LGPD com assinatura digital.
**Evidência:** features-deep-dive + competitors-matrix §4 Gap 8.
**Por que agora:** paridade com Trinks + compliance LGPD diferencial + Face DS (Clinicorp) atende premium.

### P1.15 🎯 App mobile da DONA (não do executor)
**Impacto:** MÉDIO-ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** INEXISTE
App mobile específico para o gestor/dono com foco CFO: caixa + metas + margem + alertas. Separado do app dos profissionais executores.
**Evidência:** competitors-matrix §6.1 item 7.
**Por que agora:** ninguém faz; retenção visceral da persona-alvo.

---

## PARTE 2 — POSITIONING & NARRATIVA (6 plays)

### P2.1 🎯 Ocupar categoria "CFO para estética"
**Impacto:** ALTO · **Dificuldade:** BAIXA · **Gap Trinks:** ABERTO
Pacote de mensagens:
- Tagline: *"Menos gráfico. Mais lucro."* ou *"Você trabalha. A KEYRA mostra o que sobra."*
- Anti-frame: "Trinks vende faturar mais. KEYRA vende sobrar mais."
- Tom: consultivo-numérico, respeitoso, humano sem ser motivacional.
**Evidência:** positioning-analysis §9.
**Por que agora:** categoria vaga no mercado; SEO + PR ainda aberto.

### P2.2 🎯 Identidade visual séria-premium (anti-Trinks)
**Impacto:** MÉDIO · **Dificuldade:** BAIXA · **Gap Trinks:** OPOSTO
Paleta: escuro + accent único (azul/verde escuro/roxo), não laranja/quente. Tipografia com personalidade. Fotografia focada em números grandes, não pessoas.
**Evidência:** positioning-analysis §7.
**Por que agora:** diferenciação visível; Trinks rebrand 2024 ocupou laranja.

### P2.3 🎯 Estratégia de social proof "resultado individual"
**Impacto:** MÉDIO · **Dificuldade:** MÉDIA · **Gap Trinks:** ESCALA
Obter 3-5 cases-alpha desde MVP com números-resultado. Formato: *"Mariana, Clínica Velvet SP: 'descobri que meu pacote estava com margem de 9%. Mudei o preço e sobra R$ 3.400/mês a mais.'"* Evita competir com "+44k" do Trinks.
**Evidência:** positioning-analysis §10 + competitors-matrix.
**Por que agora:** sem base, use prova pessoal.

### P2.4 🎯 Conteúdo — Pilar "Anatomia do Lucro"
**Impacto:** ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** ABERTO
Blog + YouTube sobre: custo real por procedimento, margem-alvo, ponto de equilíbrio, DRE simplificado. Artigo-âncora: *"Quanto sobra por trás de uma limpeza de pele de R$ 120?"*
**Evidência:** positioning-analysis §10.
**Por que agora:** SEO aberto; Trinks não toca.

### P2.5 🎯 Conteúdo — Pilar "Números que importam"
**Impacto:** ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** ABERTO
5 KPIs da estética: Faturamento, Ocupação, Ticket médio, Taxa de retorno, Margem bruta. Como ler cada um em 10s.
**Evidência:** positioning-analysis §10.
**Por que agora:** alinha com manifesto UX da KEYRA.

### P2.6 🎯 Conteúdo — Pilar "Equipe no azul" (metas + comissão)
**Impacto:** MÉDIO · **Dificuldade:** MÉDIA · **Gap Trinks:** PARCIAL
Por que ranking não motiva sozinho. Como montar comissão escalonada. Metas que a equipe compra.
**Evidência:** positioning-analysis §10.
**Por que agora:** alimenta módulo P1.7.

---

## PARTE 3 — COMERCIAL & GTM (7 plays)

### P3.1 🎯 Pricing público em todas as faixas
**Impacto:** ALTO · **Dificuldade:** BAIXA · **Gap Trinks:** OPOSTO
Todas as faixas com preço público. Simulador ao vivo na página de pricing. Virar argumento de marca.
**Evidência:** sales-strategy §2 + §8.2.
**Por que agora:** contraste direto com Trinks opaco para 3+ pros.

### P3.2 🎯 Contrato sem multa de fidelidade
**Impacto:** ALTO · **Dificuldade:** BAIXA · **Gap Trinks:** OPOSTO
Sempre disponível plano mensal. Plano anual com desconto óbvio mas sem multa na saída. "Zero fidelidade" como tagline comercial.
**Evidência:** sales-strategy §8.1 + RA reclamações.
**Por que agora:** anti-lock-in vira diferencial estrutural.

### P3.3 🎯 Trial de 30 dias (6x mais que Trinks)
**Impacto:** MÉDIO-ALTO · **Dificuldade:** BAIXA · **Gap Trinks:** 5 DIAS
30 dias grátis — tempo suficiente para ver 1 ciclo financeiro mensal completo. Onboarding guiado no trial.
**Evidência:** sales-strategy §3.
**Por que agora:** paridade com AgendaPro/Simples Agenda + conversão melhor (ciclo mensal visto).

### P3.4 🎯 Onboarding vertical pré-configurado
**Impacto:** MÉDIO-ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** GENÉRICO
Clínica entra → já vem com 40 procedimentos de estética pré-cadastrados, fichas técnicas sugeridas, categorias de despesa típicas, metas sugeridas.
**Evidência:** sales-strategy §8.3.
**Por que agora:** elimina fricção inicial; diferencial vertical.

### P3.5 🎯 Parceria com contadores especializados em estética
**Impacto:** MÉDIO · **Dificuldade:** MÉDIA · **Gap Trinks:** SEM CANAL
Identificar contadores B2B que atendem clínicas de estética. Programa de afiliação + materiais de onboarding. Canal de aquisição + retention lever.
**Evidência:** sales-strategy §6 + strategy-catalog §3.10.
**Por que agora:** contador é influenciador-âncora de decisão financeira.

### P3.6 🎯 Sebrae partnership via conteúdo
**Impacto:** MÉDIO · **Dificuldade:** MÉDIA · **Gap Trinks:** EXISTE
Palestras + materiais Sebrae sobre "gestão financeira para clínica de estética". Trinks usa Sebrae como eventos, não como conteúdo — KEYRA aprofunda.
**Evidência:** sales-strategy §6 + pricing-and-gtm §7.
**Por que agora:** autoridade + distribuição orgânica.

### P3.7 🎯 Cupom de ativação com afiliados estratégicos
**Impacto:** MÉDIO · **Dificuldade:** BAIXA · **Gap Trinks:** EXISTE
Cupom "30 dias extras grátis + 50% off 1ª mensalidade" via afiliados selecionados (Sebrae, influenciadores de gestão, contadores).
**Evidência:** strategy-catalog §3.6.
**Por que agora:** replicar o que funciona no Trinks.

---

## PARTE 4 — TÉCNICA & ARQUITETURA (5 plays)

### P4.1 🎯 Supabase RLS multi-tenant desde dia 1
**Impacto:** ALTO · **Dificuldade:** BAIXA · **Gap Trinks:** MANUAL
Row Level Security nativo do Postgres via policies → isolamento de dados por clínica garantido pelo banco, não pelo código.
**Evidência:** reverse-engineering-blueprint §13 + technical-footprint §1.
**Por que agora:** reduz classe inteira de bugs multi-tenant que Trinks precisa resolver manualmente.

### P4.2 🎯 Supabase Realtime (WebSocket) para agenda colaborativa
**Impacto:** MÉDIO · **Dificuldade:** BAIXA · **Gap Trinks:** REST+SNS
Agenda multi-usuário atualizando em tempo real sem polling. Conflito de horário detectado on-the-fly.
**Evidência:** technical-footprint §7 + §13.
**Por que agora:** diferencial técnico visível + UX superior.

### P4.3 🎯 Mobile PWA-first <10MB
**Impacto:** MÉDIO · **Dificuldade:** MÉDIA · **Gap Trinks:** 80-87MB
PWA instalável com offline-first. Mobile-optimized Next.js. Resolve dor de "app lento" que Trinks tem.
**Evidência:** technical-footprint §5 + §12.
**Por que agora:** leve, rápido, instalável em devices modestos (público-alvo tem Android baratos).

### P4.4 🎯 NFe com retry idempotente + lock transacional
**Impacto:** ALTO · **Dificuldade:** MÉDIA · **Gap Trinks:** BUGADO
Prevenir NFe duplicada (dor #2 do Trinks em RA) via lock transacional + idempotency key no gateway do Estado.
**Evidência:** technical-footprint §12 + RA título literal.
**Por que agora:** aprender com a dor alheia antes de ter o bug.

### P4.5 🎯 API pública com docs em português (readme.io / stoplight)
**Impacto:** MÉDIO · **Dificuldade:** MÉDIA · **Gap Trinks:** EXISTE
Docs claras + OpenAPI + exemplos em português focados em integração com contadores e ecossistema de estética.
**Evidência:** strategy-catalog §4.1.
**Por que agora:** fator de lock-in positivo (clínica com integrações se muda menos).

---

## Priorização Consolidada — Top 10 para MVP

Se tivéssemos **só 10 bets** para o MVP (0-6 meses), seriam:

| Prioridade | Play | Impacto | Categoria |
|-----------|------|---------|-----------|
| 1 | P1.2 — Tela Única "Meu Dia" (5 números) | ALTO | Produto |
| 2 | P1.1 — Módulo Precificação Inteligente | ALTO | Produto |
| 3 | P1.3 — DRE CFO-grade | ALTO | Produto |
| 4 | P1.5 — BOM editável | ALTO | Produto |
| 5 | P1.7 — Metas em tempo real + push | MÉDIO-ALTO | Produto |
| 6 | P2.1 — Categoria "CFO para estética" | ALTO | Narrativa |
| 7 | P3.1 — Pricing público total | ALTO | Comercial |
| 8 | P3.2 — Zero fidelidade | ALTO | Comercial |
| 9 | P3.3 — Trial 30 dias | MÉDIO-ALTO | Comercial |
| 10 | P4.1 — Supabase RLS multi-tenant | ALTO | Técnica |

**6-12 meses adicionais:**
- P1.4 (Conciliação multi-adquirente) — maior dor invisível do mercado
- P1.15 (App da DONA) — visceral para persona-alvo
- P1.13 (Importador Trinks→KEYRA) — caça aos insatisfeitos
- P2.4 + P2.5 (Conteúdo SEO) — autoridade

---

## Matriz impacto × dificuldade (visual)

```
          ALTA DIFICULDADE
                 ▲
                 │
     P1.4        │
     conciliação │
                 │          P1.1 Precificação
                 │          P1.13 Importador
                 │
                 │
     P1.15       │          P1.7 Metas    P1.3 DRE
     App DONA    │          P1.14 Anamnese
                 │                         P3.4 Onboarding
                 │
  BAIXO ◄────────┼─────────────────────► ALTO IMPACTO
                 │
                 │                         P2.1 Categoria
     P2.3 Cases  │          P2.4 Conteúdo  P1.2 Tela Única
                 │          P1.8 Pacotes   P4.1 RLS
                 │                         P3.1 Preço público
                 │          P1.11 Lista    P3.2 Zero fidelidade
                 │          P1.10 Pix pré  P3.3 Trial 30
                 │                         P4.3 PWA
                 │
                 ▼
          BAIXA DIFICULDADE
```

**Quick wins (baixa dificuldade + alto impacto):** P2.1, P1.2, P4.1, P3.1, P3.2, P3.3, P4.3. **Fazer primeiro.**

---

## Fontes

- [EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md) — síntese
- [FINDINGS-MATRIX.md](./FINDINGS-MATRIX.md) — matriz de evidências
- Todos os documentos em `02-data-collection/` e `03-analysis/`
