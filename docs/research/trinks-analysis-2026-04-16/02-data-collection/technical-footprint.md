# Trinks — Technical Footprint & Reverse Engineering

> **Data da coleta:** 2026-04-16
> **Escopo:** Reverse engineering público do ecossistema Trinks (trinks.com, app.trinks.com, negocios.trinks.com, apps mobile)
> **Finalidade:** Inspirar arquitetura do KEYRA e identificar diferenciadores
> **Legenda:** `[EVIDÊNCIA]` = fonte pública verificável · `[INFERÊNCIA]` = dedução a partir de sinais

---

## 0. Sumário Executivo (TL;DR)

- **Stack core:** ASP.NET (C#, .NET Core + MVC legado), SQL Server, Angular/React no front, hospedagem em **AWS** (CloudFront + SNS confirmados). `[EVIDÊNCIA]`
- **Arquitetura:** Monólito modular legado em .NET Framework/MVC migrando incrementalmente para .NET Core + SPA, com APIs REST públicas versionadas (`/v1`) e webhooks sobre Amazon SNS. `[INFERÊNCIA forte]`
- **Marketplace (www.trinks.com):** SSR server-rendered pelo backend .NET (rotas `/Portal/...`, `/Home/...`, slugs `/{estabelecimento}`, cidades `/sao-paulo-sp`). Sem Next/Nuxt. `[EVIDÊNCIA]`
- **Site institucional (negocios.trinks.com):** WordPress separado (marketing/SEO). `[EVIDÊNCIA]`
- **Mobile:** Apps nativos/híbridos — Trinks Pro (~80-87 MB, Android 5.1+), sinais de Ionic/Angular ou WebView mesclado com nativo. `[EVIDÊNCIA parcial]`
- **Stone é o proprietário (2022+)** e integrou Conta PJ, maquininha Belezinha, Pagar.me para split. `[EVIDÊNCIA]`

---

## 1. Arquitetura Macro Inferida

**Modelo:** Monólito modular (.NET MVC) com APIs REST públicas e frontends SPA. Multi-tenant lógico por `estabelecimento_id` (slug público por loja) — sinal claro nos sitemaps que expõem cada salão como path root (`/trinksmeusalao`, `/cutcut`, etc.). `[EVIDÊNCIA]`

**Decomposição aparente:**

| Componente | Domínio | Tecnologia inferida |
|------------|---------|--------------------|
| Marketplace B2C | www.trinks.com | ASP.NET MVC (SSR) `[EVIDÊNCIA: rotas /Portal, /Home, /Login, robots.txt]` |
| App profissional web | app.trinks.com | ASP.NET + SPA (Angular/React) `[INFERÊNCIA]` |
| Site institucional/marketing | negocios.trinks.com | WordPress `[EVIDÊNCIA: robots.txt com /wp/wp-admin]` |
| API pública | api.trinks.com (`/v1/...`) | .NET Web API, REST, X-Api-Key `[EVIDÊNCIA: trinks.readme.io]` |
| ProAPI interna | `/ProApi/` | Endpoints internos do app profissional `[EVIDÊNCIA: robots.txt /ProApi/]` |
| Webhooks | Amazon SNS | Push HTTPS JSON + SubscribeURL confirmation `[EVIDÊNCIA: readme.io/reference/webhook]` |
| Mobile Pro | com.trinks.pro | Android 5.1+, ~80-87 MB `[EVIDÊNCIA: Play Store]` |
| Mobile Consumer | com.trinks.m | Cliente final consumidor `[EVIDÊNCIA: Play Store]` |

**Separação robots.txt entre `www.trinks.com` (.NET) e `negocios.trinks.com` (WordPress)** é um indicador forte de split marketing-vs-produto: SEO é rodado em WordPress independente do core transacional. `[EVIDÊNCIA]`

---

## 2. Stack Frontend (Web)

- **Framework:** Angular e/ou React (SPA clássica, não Next/Nuxt — nenhum marker `__NEXT_DATA__` ou `__NUXT__` detectado) `[EVIDÊNCIA parcial + vaga Glassdoor explícita: "Angular/React"]`
- **Build:** Provavelmente Webpack (padrão .NET + Angular CLI) `[INFERÊNCIA]`
- **Marketplace (www.trinks.com):** HTML server-rendered pelo .NET, sem SPA marker no root — SSR puro para SEO dos salões `[EVIDÊNCIA]`
- **Evidências:**
  - Vaga Glassdoor Fullstack JR: "C#, Javascript, Angular/React" `[EVIDÊNCIA]`
  - Vaga Sênior/PL: ".Net C#, Fullstack" `[EVIDÊNCIA]`
  - Rotas do sitemap com estilo ASP.NET MVC (`/Portal/...`, `/Home/...`) `[EVIDÊNCIA: www.trinks.com/robots.txt]`
  - CDN estática: `djnn6j6gf59xn.cloudfront.net` (AWS CloudFront) e `s.criacaostatic.cc` (agência Criação.cc para institucional) `[EVIDÊNCIA]`

---

## 3. Stack Backend

- **Linguagem:** C# (.NET) `[EVIDÊNCIA: vagas Glassdoor, LinkedIn "Fullstack Developer JR .Net C#"]`
- **Framework:** ASP.NET MVC (legado) + ASP.NET Core Web API (moderno) `[INFERÊNCIA forte]`
- **Padrões:** REST, paginação máx 50 items/page, autenticação via header `X-Api-Key` (ApiKey scheme), versionamento por path `/v1/` `[EVIDÊNCIA: trinks.readme.io]`
- **Recursos REST expostos (endpoints públicos):**
  - `GET /v1/clientes` — listar clientes
  - `GET /v1/servicos` — listar serviços
  - Agendamentos (listar/criar/cancelar) — paginação obrigatória
  - `[EVIDÊNCIA: trinks.readme.io/reference/get_v1-clientes, get_v1-servicos]`
- **Evidências de legado:** Uma vaga menciona "Web Forms e SQL" — sinaliza ASP.NET Web Forms ainda em partes do monólito `[EVIDÊNCIA: Glassdoor]`

---

## 4. Banco de Dados

- **Tipo:** **Microsoft SQL Server** `[INFERÊNCIA muito forte: stack .NET + vagas .NET+SQL+Entity Framework na região RJ]`
- **ORM provável:** Entity Framework / EF Core `[INFERÊNCIA]`
- **Cache:** Não determinável publicamente — provável Redis ou MemoryCache in-proc `[INFERÊNCIA]`
- **Multi-tenancy:** Row-level (coluna `estabelecimento_id` discriminadora) baseado nos slugs públicos `[INFERÊNCIA]`
- **Escala declarada:** 44 mil estabelecimentos, 7 milhões de usuários, 460 milhões de agendamentos históricos `[EVIDÊNCIA: negocios.trinks.com home]`

---

## 5. Mobile

| App | Bundle ID | Plataforma | Tamanho | Min OS | Downloads |
|-----|-----------|-----------|---------|--------|-----------|
| Trinks Profissional | `com.trinks.pro` | Android + iOS | 80-87 MB | Android 5.1+ | 100K+ |
| Trinks (consumidor) | `com.trinks.m` | Android + iOS | não coletado | - | - |
| iOS Pro | id1514616279 | App Store BR | - | - | - |
| iOS Consumer | id628518776 | App Store BR | - | - | - |

`[EVIDÊNCIA: Play Store, App Store, Aptoide, APKPure]`

- **Framework inferido:** Híbrido **Ionic + Angular** (compatível com vaga que menciona "Ionic ou React Native" + stack .NET/Angular do core) OU WebView reaproveitando o SPA Angular. Tamanho 80-87 MB é grande demais para React Native puro e compatível com Ionic+Capacitor ou nativo com webpack bundle. `[INFERÊNCIA]`
- **Permissões/dados declarados:** compartilha *Personal info, Contacts, App info and performance* com terceiros `[EVIDÊNCIA: Google Play Data Safety]`
- **Bugs recorrentes reportados:** loop de login após agendamento, código de confirmação de cadastro não chega, incompatibilidade Safari iOS / Chrome / browser do Instagram, instabilidade na v3.0.41 `[EVIDÊNCIA: ReclameAqui + reviews Play Store]`

---

## 6. Infraestrutura

- **Cloud:** **AWS** `[EVIDÊNCIA forte]`
  - CloudFront: `djnn6j6gf59xn.cloudfront.net` serve assets estáticos versionados `[EVIDÊNCIA]`
  - Amazon SNS para webhooks (padrão SubscribeURL explícito) `[EVIDÊNCIA: trinks.readme.io/reference/webhook]`
- **CDN:** CloudFront (core) + `s.criacaostatic.cc` (apenas institucional WordPress pela agência Criação.cc) `[EVIDÊNCIA]`
- **Compute:** Não determinável — provável EC2/ECS rodando Windows Server ou Linux com .NET Core `[INFERÊNCIA]`
- **Não há evidência** de Azure, GCP, Cloudflare, Vercel, ou Kubernetes público.

---

## 7. Integrações Detectadas

| Categoria | Parceiro | Status |
|-----------|----------|--------|
| Adquirente / Pagamentos físicos | **Stone** (dono) — maquininha Belezinha | `[EVIDÊNCIA]` |
| Gateway online | **Pagar.me** (grupo Stone) — link de pagamento, split de comissão | `[EVIDÊNCIA]` |
| Conta digital PJ | **Stone Conta Digital** (integrada nativamente) | `[EVIDÊNCIA]` |
| PIX | Stone (pagamento de profissionais via Pix) | `[EVIDÊNCIA]` |
| Mensageria | **Meta/WhatsApp** (oficial) — lembretes, confirmações, NPS | `[EVIDÊNCIA: negocios.trinks.com/solucoes]` |
| NFe | Emissão própria — Produto, Serviço, Profissional-Parceiro | `[EVIDÊNCIA]` |
| Agendamento externo | Google Reserve, Instagram, Facebook (botão "Agendar") | `[EVIDÊNCIA]` |
| API pública | `trinks.readme.io` — ReadMe.com como doc portal | `[EVIDÊNCIA]` |
| Analytics | Não determinável no root HTML (possivelmente injetado client-side por GTM) | `[INFERÊNCIA]` |

**Não evidenciados:** Zenvia, Twilio, Sinch, Cielo, Rede, Adyen, SendGrid, Mailgun, Segment, Mixpanel, Intercom.

---

## 8. Compliance & Segurança Visíveis

- **CNPJ público:** 73.499.238/0001-87 — Trinks (Grupo Stone) `[EVIDÊNCIA]`
- **LGPD:** Política de Privacidade e Termos linkados no footer `[EVIDÊNCIA]`
- **Transparência salarial:** Relatório público no footer `[EVIDÊNCIA]`
- **API Security:** header `X-Api-Key`, token pessoal e intransferível, recomendação de secret manager `[EVIDÊNCIA: trinks.readme.io/reference/autenticacao]`
- **Webhook Security:** SNS SubscribeURL confirmation (prevenção contra endpoints maliciosos) `[EVIDÊNCIA]`
- **Não há** menções públicas a SOC 2, ISO 27001, PCI DSS (provavelmente herdado via Stone/Pagar.me para os fluxos financeiros).

---

## 9. Módulos Funcionais Inferidos

`[EVIDÊNCIA: negocios.trinks.com/solucoes — módulos nomeados na página oficial]`

1. **Agenda** — online, automatizada, multi-device, fila ou slots
2. **Comanda / Atendimento** — inferido do fluxo profissional
3. **Financeiro** — entradas, saídas, fechamento de caixa
4. **Comissões** — cálculo automático + split via Pagar.me
5. **Estoque** — entrada/saída de produtos, alertas de reposição
6. **Clientes (CRM)** — histórico, preferências
7. **Profissionais** — cadastro, agenda individual, app próprio
8. **Marketing & Visibilidade** — site próprio, Google Reserve, Instagram/Facebook booking
9. **Comunicação WhatsApp** — lembretes, confirmações, NPS
10. **Fidelidade** — Clube de Assinaturas + Programa de Pontos
11. **NFe** — Produto, Serviço, Profissional-Parceiro
12. **Relatórios** — **130+ tipos de relatórios consolidados** `[EVIDÊNCIA literal]`
13. **Redes / Franquias** — consolidação multi-unidade
14. **Autoatendimento** — totem/self-service no estabelecimento (pós-aquisição Stone) `[EVIDÊNCIA]`
15. **Pagamentos** — Belezinha (maquininha), Pagar.me, Pix, Conta Stone

---

## 10. Modelo de Dados Presumido (diagrama textual)

```
Estabelecimento (tenant)
  ├── slug_publico (unique) [marketplace SEO]
  ├── 1:N Profissionais
  │       ├── comissao_padrao
  │       └── agenda_individual
  ├── 1:N Servicos (catálogo)
  │       └── duracao, preco, comissao_percentual
  ├── 1:N Produtos (estoque)
  ├── 1:N Clientes
  │       └── historico_atendimentos
  ├── 1:N Agendamentos
  │       ├── FK Cliente
  │       ├── FK Profissional
  │       ├── FK Servico[]
  │       └── status (confirmado/realizado/cancelado)
  ├── 1:N Comandas (checkout)
  │       ├── FK Agendamento
  │       ├── FK Produtos_vendidos[]
  │       └── FK Pagamentos[]
  ├── 1:N Pagamentos
  │       └── split via Pagar.me → comissões automáticas
  ├── 1:N Movimentacoes_Financeiras
  ├── 1:N NFes (Produto/Servico/Profissional-Parceiro)
  └── 1:N Assinaturas_Clube (recorrência)
```

Todas as tabelas carregam `estabelecimento_id` + `deleted_at` (soft delete) + `created_at/updated_at`. `[INFERÊNCIA]`

---

## 11. Fluxos de Usuário Principais

**Consumidor (www.trinks.com):**
1. SEO landing via cidade (`/sao-paulo-sp`) ou slug do salão (`/cutcut`)
2. Busca `?pesquisa=corte%20masculino` (query param, não SPA)
3. Página de estabelecimento (SSR) → calendário → agendamento
4. Login/cadastro (com gargalo de SMS confirmação reportado) `[EVIDÊNCIA: ReclameAqui]`
5. Confirmação via WhatsApp

**Profissional (app.trinks.com + Trinks Pro mobile):**
1. Dashboard do dia → agenda
2. Comanda → fechamento com pagamento (Belezinha/Pagar.me)
3. Split automático de comissão → Pix profissional via Conta Stone
4. Emissão NFe
5. Relatórios e fechamento financeiro

---

## 12. Pontos Fracos Técnicos Inferidos

1. **Legado Web Forms + MVC** coexistindo com .NET Core — débito de migração visível em vagas `[EVIDÊNCIA]`
2. **Instabilidade no fluxo de login/agendamento** — loop pós-booking, SMS não entregue, incompatibilidade Safari/IG browser `[EVIDÊNCIA: ReclameAqui, reviews Play Store]`
3. **Mobile pesado (80-87 MB)** — sugere Ionic/WebView, UX degradada em devices de baixo perfil
4. **SEO depende de SSR server-rendered pelo monólito .NET** — acoplamento entre marketplace B2C e core transacional
5. **API pública limitada a 50 items/page** — pode forçar muitas chamadas para integrações de grande volume `[EVIDÊNCIA]`
6. **Split marketing (WordPress) vs produto (.NET)** — dois CMSs, dois times de conteúdo, risco de inconsistência
7. **Ausência de GraphQL, gRPC, ou event-sourcing público** — arquitetura REST clássica, dificulta real-time

---

## 13. Implicações para KEYRA

**Onde podemos ser estruturalmente diferentes:**

| Dimensão | Trinks (hoje) | KEYRA (oportunidade) |
|----------|--------------|----------------------|
| Stack | .NET + SQL Server monolítico legado | **Next.js 16 + Supabase (Postgres + RLS)** — greenfield, sem débito |
| Marketplace | SSR pelo core .NET | **App-only foco profissional** (sem marketplace B2C no início) — menor superfície |
| Multi-tenant | Row-level por `estabelecimento_id` | **RLS nativo Postgres** — isolamento por política de banco, não por código app |
| Real-time | REST + webhooks SNS | **Supabase Realtime (Postgres logical replication via WebSocket)** — agenda/comanda live sem polling |
| Mobile | Ionic/WebView híbrido (80-87 MB) | **PWA primeiro** ou React Native enxuto (<30 MB) |
| Foco funcional | Tudo-para-todos (130+ relatórios) | **Foco cirúrgico financeiro para estética** — menos features, mais clareza |
| UX | Tela cheia, muitos gráficos | **Números absolutos, tela única, sem gráficos** (diretriz da idealizadora) |
| Pagamentos | Stone vertical (parte do grupo) | **Abstrair gateway**: Stone/Cielo/Mercado Pago via adapter pattern |
| Comunicação | WhatsApp via BSP Meta oficial | **Mesma rota** (WhatsApp Cloud API direto) — paridade competitiva |
| API | REST privada + paginação 50 | **REST + Realtime WebSocket + paginação cursor** — DX superior |

**Diferenciadores centrais KEYRA:**
1. **Greenfield moderno** (Next.js 16 + Supabase) versus monólito .NET com Web Forms legado
2. **Foco financeiro estética** vs. Trinks horizontal (salão + barbearia + clínica + spa + estúdio)
3. **Precificação e metas** como primeiro cidadão (Trinks não expõe esse módulo)
4. **Simplicidade radical** na UX (idealizadora: "números absolutos, tela única")
5. **RLS de banco** reduz classe inteira de vulnerabilidades multi-tenant que monólito C# precisa implementar manualmente

---

## Fontes (verificáveis)

- `https://www.trinks.com/robots.txt` — paths .NET (`/Portal/`, `/Api/`, `/ProApi/`, `/Login/`, `/Backoffice/`)
- `https://negocios.trinks.com/robots.txt` — `/wp/wp-admin/` confirma WordPress
- `https://www.trinks.com/Home/Sitemap` — estrutura de URLs (cidades, slugs de estabelecimentos)
- `https://negocios.trinks.com/` — stats, módulos, Criação.cc CDN, App Store links, Stone branding
- `https://negocios.trinks.com/solucoes/` — lista completa de módulos
- `https://trinks.readme.io/reference/introducao` — API REST, X-Api-Key, paginação 50
- `https://trinks.readme.io/reference/webhook` — Amazon SNS, SubscribeURL
- `https://trinks.readme.io/reference/autenticacao` — ApiKey header
- `https://play.google.com/store/apps/details?id=com.trinks.pro` — Trinks Profissional Android
- `https://play.google.com/store/apps/details?id=com.trinks.m` — Trinks consumidor Android
- `https://apps.apple.com/br/app/trinks-profissional/id1514616279` — iOS Pro
- `https://apps.apple.com/br/app/trinks-com/id628518776` — iOS consumer
- `https://br.linkedin.com/company/trinks` — página corporativa
- `https://www.glassdoor.com.br/job-listing/fullstack-developer-jr-net-c-trinks-JV_IC2402386_KO0,28_KE29,35.htm` — vaga .NET C# Fullstack JR RJ
- `https://www.reclameaqui.com.br/trinks/` — bugs recorrentes (cadastro, SMS, Safari)
- `https://ajuda.trinks.com/faq-completo-conecta-trinks-e-integracoes` — parceiros de integração
- `https://blog.trinks.com/conheca-a-api-de-integracao-da-trinks/` — overview API pública
- CDN: `djnn6j6gf59xn.cloudfront.net` (AWS CloudFront, assets core)
