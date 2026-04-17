# Trinks — Reverse Engineering Blueprint

**Data:** 2026-04-16 | **Escopo:** Blueprint completo do Trinks como se fôssemos reconstruí-lo
**Fontes primárias:** `site-map.md`, `technical-footprint.md`, `features-deep-dive-keyra-domains.md`, `pricing-and-gtm.md`

Este documento responde: **"Como o Trinks foi construído, camada por camada?"** — para servir de referência técnica e funcional ao KEYRA.

---

## Sumário em 1 parágrafo

Trinks é um **monólito modular em ASP.NET (C#) + SQL Server**, com marketplace B2C renderizado em SSR pelo próprio backend, área profissional em SPA (Angular/React), site institucional em **WordPress separado** e app mobile **híbrido (Ionic/WebView, 80-87MB)**. Multi-tenant por `estabelecimento_id`. Hospedagem **AWS** (CloudFront + SNS). Adquirido pela Stone em 2023, o produto está profundamente acoplado ao ecossistema Stone (Belezinha, Pagar.me, Conta Digital, Pix). **15 módulos, 130+ relatórios, API REST pública v1** documentada em readme.io. Dívida técnica visível (Web Forms legado coexistindo com .NET Core). Pivô de IA iniciado em 2026 (vaga de Tech Lead AI Engineer).

---

## 1. Camada 1 — Domínios e Topologia

```
┌────────────────────────────────────────────────────────────────┐
│                       TOPOLOGIA TRINKS                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   www.trinks.com                negocios.trinks.com             │
│   [Marketplace B2C]             [Site institucional B2B]        │
│   ASP.NET MVC — SSR             WordPress + CDN Criação.cc      │
│   SEO por cidade + slug         Acoplado a /blog.trinks.com     │
│   CloudFront (AWS)              CloudFront (AWS)                │
│       │                                                         │
│       │  (login estabelecimento)                                │
│       ▼                                                         │
│   sistema.trinks.com / app.trinks.com                           │
│   [Produto logado]                                              │
│   ASP.NET Core Web API + SPA Angular/React                      │
│   Multi-tenant por estabelecimento_id                           │
│                                                                 │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│   │   Apps      │   │   API v1    │   │  Webhooks   │           │
│   │   Mobile    │   │  (Pública)  │   │  (AWS SNS)  │           │
│   │  com.trinks.│◀─▶│ X-Api-Key   │   │ SubscribeURL│           │
│   │  pro / .m   │   │ 50 ipp      │   │             │           │
│   └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                 │
│   ─── Integrações externas ────────────────────────             │
│   Stone Belezinha · Pagar.me · Conta Digital Stone ·            │
│   Meta WhatsApp Cloud · Google Reserve · Instagram/FB           │
└────────────────────────────────────────────────────────────────┘
```

**Observação crítica para KEYRA:** o split `negocios` (WP) vs `sistema` (.NET) duplica times/CMS/CDN — é uma decisão de *marketing-first* que funciona mas exige sincronização. KEYRA pode consolidar tudo em Next.js (marketing + produto no mesmo domínio) ganhando agilidade de iteração.

---

## 2. Camada 2 — Arquitetura Macro

| Elemento | Trinks | Evidência |
|----------|--------|-----------|
| Pattern | Monólito modular | Rotas `/Portal/`, `/Home/`, `/Api/`, `/ProApi/`, `/Backoffice/` no robots.txt |
| Deployment | Provável EC2/ECS sobre Windows Server ou Linux + .NET Core | Stack C# + vagas apontando IIS/Kestrel |
| Multi-tenancy | Row-level via `estabelecimento_id` | Slugs públicos únicos por loja |
| Persistence | SQL Server + (prov.) EF Core | Vagas RJ pedem .NET+SQL+EF |
| Cache | Provável Redis ou MemoryCache in-proc | n/d publicamente |
| Real-time | REST + webhooks SNS — **não WebSocket** | readme.io |
| Background jobs | Prováveis Hangfire / Quartz.NET | Necessário para comissão batch mensal + NFe |
| API gateway | `/v1/` dentro do monólito | Não há BFF ou gateway separado visível |

---

## 3. Camada 3 — Stack Completa

### Backend
- **Linguagem:** C# (.NET)
- **Framework:** ASP.NET MVC (legado) + ASP.NET Core Web API + pedaços de **ASP.NET Web Forms** confirmados em vagas
- **Paginação:** cursor/limit fixo de 50 items/page
- **Autenticação API:** header `X-Api-Key` (sem OAuth2 exposto)
- **Versionamento:** path-based `/v1/`

### Frontend Web
- **Área profissional:** SPA Angular/React (provável Angular pelo histórico .NET + confirmação de vaga)
- **Marketplace B2C:** HTML server-rendered pelo .NET (sem Next.js/Nuxt)
- **Build:** Webpack padrão Angular CLI
- **CDN assets:** CloudFront `djnn6j6gf59xn.cloudfront.net`

### Mobile
- **Bundle IDs:** `com.trinks.pro` (profissional), `com.trinks.m` (consumidor)
- **Tamanho APK:** 80-87 MB → sugere **Ionic + Angular** em Capacitor ou WebView pesado
- **Min OS:** Android 5.1+
- **Downloads:** 100K+
- **Avaliações:** 4.8 (Play) / 4.9 (App Store)

### Infra
- **Cloud:** AWS
- **CDN:** CloudFront
- **Queue/pub-sub:** Amazon SNS para webhooks outbound
- **Monitoring:** n/d publicamente

### Integrações de 3ª parte
| Categoria | Parceiro | Status |
|-----------|----------|--------|
| Adquirente físico | **Stone** (Belezinha) | Nativo/dono |
| Gateway online | **Pagar.me** (subsidiária Stone) | Split de comissão |
| Conta digital | **Stone Conta Digital** | Integrada |
| Pix | Stone | Nativo |
| Mensagem | **Meta WhatsApp Cloud API** | Oficial (BSP) |
| NFe | Emissão própria (NFS-e, NFC-e, Profissional-Parceiro) | Interno |
| Agendamento externo | **Google Reserve**, Instagram, Facebook | Integrado |

**Não detectados:** Segment, Mixpanel, Intercom, Twilio, SendGrid, Cielo, Mercado Pago, Rede.

---

## 4. Camada 4 — Modelo de Dados (reconstrução inferida)

```
Estabelecimento (tenant raiz)
├── slug_publico (UNIQUE)           — usado no marketplace
├── tipo                            — salão/barbearia/clínica/studio/rede
├── cnpj + razao_social + fantasia
├── endereco + geolocalizacao
├── 1:N Unidades                    — multi-unidade (Enterprise)
├── 1:N Profissionais
│       ├── comissao_padrao_pct
│       └── agenda_individual
├── 1:N Servicos (catálogo)
│       ├── nome, duracao_min, preco
│       ├── comissao_percentual
│       └── categoria
├── 1:N Produtos (estoque)
│       ├── preco_venda, custo_medio
│       ├── estoque_atual, estoque_minimo
│       └── tipo (interno/revenda)
├── 1:N Clientes
│       ├── historico_atendimentos
│       ├── fichas_anamnese (1:N)   — clínicas estética
│       └── preferencias
├── 1:N Agendamentos
│       ├── FK Cliente, FK Profissional, FK Servico[]
│       ├── horario_inicio, duracao
│       └── status (confirmado, realizado, cancelado, falta)
├── 1:N Comandas (checkout)
│       ├── FK Agendamento
│       ├── produtos_vendidos[]
│       └── pagamentos[]
├── 1:N Pagamentos
│       ├── metodo (cartao, pix, dinheiro, clube)
│       ├── valor, taxas, split_data
│       └── profissional_comissao_valor
├── 1:N Movimentacoes_Financeiras   — fluxo de caixa
├── 1:N Contas_a_Pagar
├── 1:N NFes (NFS-e, NFC-e, Prof-Parceiro)
├── 1:N Assinaturas_Clube           — recorrência mensal
├── 1:N Pacotes                     — pré-pago, N sessões
│       └── comissionamento_de_pacote
├── 1:N Rotinas_WhatsApp            — mensagens programadas
└── 1:N Campanhas                   — email/SMS

Todas tabelas herdam: estabelecimento_id, created_at, updated_at, deleted_at (soft delete)
```

**Ausências notáveis (dores KEYRA):**
- Sem tabela `PrecificacaoInteligente` / `CustoProcedimento` (precificação é só `preco` flat)
- Sem `FichaTecnica_BOM` (receita configurável de insumos por serviço)
- Sem `ConciliacaoBancaria` / `ConciliacaoAdquirente` 
- Sem `MetaProfissional` / `MetaEquipe` com escalonamento
- Sem `Lote` / `Validade` em Produtos

---

## 5. Camada 5 — Módulos Funcionais (15 confirmados)

| # | Módulo | Profundidade (1-5) | Observação |
|---|--------|---------------------|-----------|
| 1 | Agenda online | 4 | Forte — com Google Reserve, rotinas WhatsApp, mapa de calor |
| 2 | Comanda / Atendimento | 4 | Fechamento conectado a pagamentos Stone |
| 3 | Financeiro | **3** | DRE existe mas é relatório clássico; sem conciliação bancária/adquirente |
| 4 | Comissões | 3 | % fixo + bonificação em batch mensal; sem escalonamento |
| 5 | Estoque | 3 | Baixa automática existe; sem lote/validade/BOM editável |
| 6 | Clientes / CRM | 4 | Forte — histórico, anamnese, segmentação |
| 7 | Profissionais | 4 | App dedicado + agenda individual + controle de caixa |
| 8 | NFe | 3 | NFS-e, NFC-e, Prof-Parceiro — mas RA reporta duplicadas |
| 9 | Clube de Assinaturas | 5 | Diferencial competitivo — recorrência com split Stone |
| 10 | Marketing (WhatsApp, SMS, Email) | 4 | Add-on pago em planos menores |
| 11 | Pagamentos integrados | 5 | Belezinha, Pagar.me, Conta Digital — ecossistema Stone |
| 12 | Multi-unidade (Redes) | 4 | Visão consolidada, transferência estoque |
| 13 | Relatórios | 5 | **130+ tipos** — amplitude, não profundidade |
| 14 | Autoatendimento (totem) | 3 | Pós-aquisição Stone |
| 15 | Fidelidade (Pontos) | 3 | Programa básico de pontos |

**Média de profundidade:** ~3.8/5 — Trinks é **amplo e de qualidade operacional sólida**, mas **raso em inteligência financeira**.

**Módulo INEXISTENTE:** Precificação estratégica (markup, custo direto, margem-alvo, simulação). Aparece apenas como campo `preco` flat no cadastro de serviço.

---

## 6. Camada 6 — Fluxos Principais

### Fluxo A — Consumidor agenda no marketplace
```
Cliente final (Google/SEO)
  → www.trinks.com/{cidade}/{categoria}  [SSR .NET]
  → lista de estabelecimentos + avaliações
  → /{slug-do-salao}
  → cards de serviços + calendário
  → Login/cadastro SMS  [BUG RA: loop pós-agendamento]
  → Agendamento confirmado
  → Push WhatsApp automático
  → (opcional) link pagamento Pagar.me
```

### Fluxo B — Profissional no dia-a-dia
```
Login (app.trinks.com ou Trinks Pro mobile)
  → Dashboard do dia (ocupação + caixa)
  → Agenda com status colorido por situação
  → Cliente chega → abre Comanda
  → Adiciona serviços + produtos
  → Fechamento: cobra via Belezinha / Pagar.me / Pix Stone
  → Split automático de comissão → Conta Stone do profissional
  → Emissão NFS-e automática
  → (no fim do mês) Fechamento Mensal → comissões batch → relatório
```

### Fluxo C — Dono/gestor operando o negócio
```
Login → Dashboard consolidado
  → 130+ relatórios disponíveis
  → DRE (Receitas - Despesas por categoria)
  → Fluxo de Caixa
  → Bonificação se meta foi atingida (manual)
  → Ranking de profissionais
  → ⚠️ Sem "tela única do dia" com números-hero
  → ⚠️ Sem "quanto sobra pra mim" (pró-labore explícito)
  → ⚠️ Sem "essa limpeza de pele dá lucro?"
```

---

## 7. Camada 7 — Pricing e Monetização

### Modelo de cobrança
- **Não vende por tier de feature** — vende por **faixa de número de profissionais**
- 5 faixas: 1-2 / 3-4 / 5-10 / 11-20 / 21+
- Faixa 1-2: **R$ 76/mês (mensal)** ou **R$ 65/mês (anual)**
- Faixas 3+: "sob consulta" → sales-assisted

### Add-ons (upsell)
- App exclusivo white-label
- Clube de Assinaturas
- WhatsApp automation
- SMS / Email marketing
- Programa de fidelidade
- Autoatendimento
- Emissão NFe
→ **Ticket real > preço anunciado**

### Revenue multiplier verdadeiro
O SaaS (R$ 76) é **isca** — o lucro vem do ecossistema Stone:
- Taxa Belezinha (maquininha)
- Taxa Pagar.me online
- Float na Conta Digital
- Split tarifado nas comissões de profissionais
- Cross-sell de crédito Stone

### Lock-in
- **Multa de 50% das parcelas restantes** (conforme T&C) — que pode chegar a **~80% do valor restante** percebido por clientes em RA
- Cobrança via cartão de crédito apenas
- Aquisição Stone implica uso preferencial do ecossistema Stone

---

## 8. Camada 8 — Dívida Técnica & Débitos Visíveis

| # | Débito | Evidência | Impacto |
|---|--------|-----------|---------|
| 1 | **ASP.NET Web Forms coexistindo com .NET Core** | Vaga Glassdoor literal | Velocidade de evolução lenta em áreas legadas |
| 2 | **Mobile 80-87MB (Ionic/WebView)** | Play Store | UX degradada em devices baixos; usuários reclamam de lentidão |
| 3 | **Bugs login/agendamento pós-booking** (loop, SMS não chega, Safari iOS) | Reclame Aqui | Dor direta na conversão |
| 4 | **NFe duplicada** por falha de integração Stone ↔ Trinks | RA título literal | Cobranças tributárias indevidas |
| 5 | **Fluxo de fechamento "muito longo e não fecha automaticamente"** após update 2025 | RA 2025 | Fricção operacional diária |
| 6 | **API pública limitada a 50 items/page** | readme.io | Integrações grandes exigem muitas requisições |
| 7 | **Ausência de real-time nativo** (REST + webhooks SNS) | readme.io | Agenda multiusuário pode ficar dessincronizada |
| 8 | **Split marketing (WP) vs produto (.NET)** | robots.txt | Dois CMSs = dois times + risco inconsistência |
| 9 | **Cobrança indevida após cancelamento** | Múltiplos RA | Problema de ciclo de billing |
| 10 | **App "trava", "bug na entrada de dígitos", "atualizações deixaram mais lento"** | Reviews Play/App Store | Produto sob pressão operacional |

---

## 9. Camada 9 — UX & Design System (inferido)

- **Paleta:** Laranja como cor-chave após rebranding de 2024 — "popular-premium"
- **Tom:** Próximo, brasileiro, informal — "bora", "dá um up"
- **Padrão visual:** Calendário tradicional (colunas por profissional, cores por status)
- **Dashboards:** Muitos gráficos + tabelas densas + **130+ relatórios**
- **Mobile UX:** Duas apps distintas (Pro vs Consumer); Pro reportado "lento" nos reviews
- **Conflito com princípio UX do KEYRA:** Trinks privilegia breadth (ver tudo), KEYRA pede depth-simplicity (ver só o que importa, em números absolutos, tela única).

---

## 10. Camada 10 — GTM & Funil

```
AQUISIÇÃO
  ├─ SEO Blog (blog.trinks.com, domínio forte)
  ├─ Beauty Fair (feira principal — patrocinadora recorrente)
  ├─ Google Reserve (primeira empresa BR a integrar)
  ├─ Instagram @trinksoficial (conteúdo educacional)
  ├─ Cross-sell Stone (maquininha → Trinks)
  ├─ Marketplace B2C (700k usuários → lead reverso)
  └─ PR (Pequenas Empresas & Grandes Negócios, Beauty Fair)

CONVERSÃO
  ├─ Faixa 1-2 pros: self-service direto R$ 76/65 mensal/anual
  ├─ Faixa 3+: sales-assisted (SDR + cotação)
  ├─ Trial 5 dias (curto — outros concorrentes dão 30-35 dias)
  └─ Cupom: 30 dias grátis + 50% off 1ª mensalidade

RETENÇÃO
  ├─ Contratos semestrais/anuais com multa de 50%
  ├─ CS humanizado + comunidade + treinamento
  ├─ Clube de Vantagens (retention lever)
  └─ Lock-in Stone (maquininha + conta)

EXPANSÃO
  ├─ Upgrade de faixa (salão cresce)
  ├─ Add-ons pagos (WhatsApp, NFe, fidelidade, app exclusivo)
  └─ Cross-sell Stone (crédito, antecipação, gestão)
```

**KPI-chave inferido:** Trinks otimiza para **LTV do ecossistema Stone**, não para ARPU SaaS puro. Por isso o preço-base é agressivo (R$ 65) — recuperam via taxa de cartão e float.

---

## 11. Camada 11 — Diferenciadores Declarados vs Realidade

| Declarado | Realidade observada |
|-----------|---------------------|
| "Sistema completo" | Amplo sim, profundo no financeiro/precificação **não** |
| "130+ relatórios" | Amplitude, não insight — conflita com simplicidade |
| "Para clínicas de estética" | Copy dedicado mas **mesmo core** de salão/barbearia (anamnese + pacotes + mapa de calor como únicos diferenciais) |
| "Suporte humanizado" | RA reclama de respostas genéricas ("limpe o cache") |
| "Transparência" | Preço de 3+ pros oculto; multa em cancelamento pouco clara no checkout |
| "Sem taxa de adesão" | Verdade, mas add-ons podem dobrar o ticket |

---

## 12. Camada 12 — Roadmap Inferido (próximos 12-18 meses)

Sinais públicos:
- **Vaga Tech Lead AI Engineer (LLM)** — IA generativa para concierge WhatsApp, previsão de demanda, auto-preenchimento de anamnese
- **Autoatendimento (totem)** já existe — provável expansão para self-service kiosk completo
- **Clube de Assinaturas** é o produto estratégico — Stone monetiza recorrência
- **Integrações Google/Meta** profundas continuam — lead-gen é pilar

**Defesa KEYRA (12-18 meses):**
1. Preservar moat em **precificação estratégica + financeiro profundo** (território vago)
2. Construir **tela única com números absolutos** antes que Trinks adote IA que resolva isso
3. Ocupar narrativa "CFO para estética" com SEO/conteúdo antes de Trinks pivotar tom

---

## 13. Camada 13 — Diferenciação Estrutural KEYRA

| Dimensão | Trinks | KEYRA (oportunidade) |
|----------|--------|----------------------|
| Stack | .NET + SQL Server + Web Forms legado | **Next.js 16 + Supabase (Postgres + RLS nativo)** |
| Marketplace | SSR próprio no core | **App-only foco profissional** (sem marketplace no MVP) |
| Multi-tenant | Row-level em código | **RLS policies nativas** |
| Real-time | REST + webhooks SNS | **Supabase Realtime (WebSocket)** |
| Mobile | Ionic/WebView 80-87MB | **PWA-first < 10MB** ou RN enxuto |
| Horizontalidade | 5 verticais no mesmo core | **Vertical pura estética** |
| Precificação | Campo `preco` flat | **Módulo Precificação Inteligente (custo→markup→simulador)** |
| Financeiro | DRE relatório clássico | **Tela única "Hoje" com números absolutos** |
| Metas | Bonificação batch mensal | **Meta em tempo real + push gamificado** |
| Estoque | Log de uso (`ficha técnica`) | **BOM editável + lote/validade** |
| Pagamentos | Stone-locked | **Adapter pattern multi-adquirente** |
| Conciliação | Manual / Stone only | **Conciliação automática de múltiplas maquininhas** |
| UX | Breadth, muitos gráficos | **Depth vertical + zero gráfico + tela única** |
| Tom | "Parceira motivacional" | **"CFO técnico para estética"** |

---

## 14. Camada 14 — Princípios Arquiteturais para KEYRA (extraídos)

**O que COPIAR do Trinks:**
1. **Multi-tenant desde dia zero** (mas com RLS em vez de row-level manual)
2. **Dois apps distintos** (dono vs profissional) — fluxos radicalmente diferentes
3. **Rotinas WhatsApp** como feature-cidadã de primeira ordem
4. **NFe como módulo interno** (não terceirizar — dor visível no Trinks)
5. **Clube de Assinaturas** como diferencial (replicar com DNA estética)
6. **Suporte humano** desde MVP — não escalar só com bots
7. **Integração Google/Meta** para aquisição orgânica

**O que EVITAR do Trinks:**
1. Web Forms / legado misturado (KEYRA = greenfield moderno)
2. Mobile pesado (< 30MB é mandatório)
3. 130+ relatórios (KEYRA faz ≤ 10, mas profundos)
4. Pricing escondido para tier maior (preços públicos sempre)
5. Contratos de fidelidade com multa percebida como abusiva
6. Lock-in de adquirente (adapter pattern de dia zero)
7. Gráficos densos (idealizadora KEYRA exige números absolutos, tela única)
8. Bugs de fluxo crítico (login, agendamento, NFe) — QA rigoroso

---

## 15. Apêndice — Evidências consolidadas

**Documentos-fonte neste pacote:**
- [site-map.md](../02-data-collection/site-map.md) — 18 páginas mapeadas
- [technical-footprint.md](../02-data-collection/technical-footprint.md) — stack completo
- [pricing-and-gtm.md](../02-data-collection/pricing-and-gtm.md) — pricing + funil
- [features-deep-dive-keyra-domains.md](../02-data-collection/features-deep-dive-keyra-domains.md) — 5 dores KEYRA
- [competitors-matrix.md](../02-data-collection/competitors-matrix.md) — 16 concorrentes
- [positioning-and-content.md](../02-data-collection/positioning-and-content.md) — marca

**URLs-chave verificáveis:**
- https://negocios.trinks.com/planos/ · https://negocios.trinks.com/solucoes/
- https://trinks.readme.io/reference/introducao · https://trinks.readme.io/reference/webhook
- https://play.google.com/store/apps/details?id=com.trinks.pro
- https://www.reclameaqui.com.br/empresa/trinks/
- https://blog.trinks.com/10-anos-do-trinks-venha-saber-tudo-sobre-a-gente/
