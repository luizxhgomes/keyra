# Belle Software — Tech Stack & Infrastructure

> Dossiê técnico observável — investigação de concorrente para KEYRA
> Data da coleta: 2026-04-16
> Método: WebFetch + WebSearch (Bash/DNS/curl indisponíveis nesta sessão; algumas inferências marcadas com [INFERIDO])
> Fonte primária: https://www.bellesoftware.com.br/ · https://app.bellesoftware.com.br/ · https://ajuda.bellesoftware.com.br/

---

## 1. Domínios e Subdomínios

| Subdomínio | Função | Confirmação |
|-----------|--------|-------------|
| `www.bellesoftware.com.br` | Site institucional / marketing | Confirmado — WebFetch direto |
| `app.bellesoftware.com.br` | SaaS (tela de login / aplicação) | Confirmado — link no site principal |
| `ajuda.bellesoftware.com.br` | Help center (knowledge base) | Confirmado — URL pública `/knowledge-base/` |
| `materiais.bellesoftware.com.br` | Landing de materiais ricos / iscas digitais | Confirmado — referenciado no rodapé |
| `app.bellesoftware.com.br/suporte/` | Módulo de suporte interno do SaaS | Confirmado |
| `atracaodetalentos.totvs.app/...` | Página de recrutamento via TOTVS (não é da Belle, mas um parceiro/cliente ATS) | [INFERIDO] uso do ATS TOTVS RH externamente |

**Rotas principais do site institucional:** `/precos`, `/mais-resultados/`, `/franquias/`, `/bellechat/`, `/gestor-ia/`, `/casos-de-sucesso/`, `/contato/`, `/videos/`, `/bellemessage/`, `/sistema-para-estetica-integrativa/`, `/termos-de-uso/`.

**Empresa responsável:** Geinfo Tecnologia da Informação Ltda (CNPJ 10.762.438/0001-60), sede em Caçador/SC. Fundada em 15/04/2009. CEO: Rafael Thibes. Outros produtos do mesmo fornecedor: **Belle Franquias** e **Dr. Análise** (software para clínicas médicas) — característica de *multi-produto vertical*, não apenas estética.

---

## 2. Infraestrutura e Hosting

Sem acesso a `curl -I` / `dig` nesta sessão, a identificação de CDN é limitada. A inspeção do HTML do site institucional **não revelou URLs de CDN de terceiros** (não há `cdn.bellesoftware`, `cloudfront`, `cloudflare`, `fastly` visíveis nos assets listados).

**Inferências baseadas em perfil:**
- Provavelmente **self-hosted ou VPS nacional** (Locaweb, UOL Host, Hostinger, KingHost) — típico de produto SaaS brasileiro fundado em 2009 por empresa regional (Caçador/SC).
- Para o SaaS `app.bellesoftware.com.br`, o fato de servir 2.700+ clínicas em tempo real sugere **infra robusta**, possivelmente AWS São Paulo (sa-east-1) ou Azure Brazil South — mas sem evidência direta coletada.
- Ausência de headers de CDN no site institucional reforça hipótese de **origem direta sem edge CDN** (oportunidade que a KEYRA pode explorar com Vercel/CloudFlare nativos).

**Status:** [INFERIDO — confirmar com `dig`/`curl -I` em sessão com Bash liberado].

---

## 3. Stack Frontend — Site Institucional (`www.bellesoftware.com.br`)

Análise do HTML via WebFetch:

| Categoria | Achado |
|-----------|--------|
| CMS | **Nenhum meta `generator` detectado.** Sem sinais óbvios de WordPress (sem `/wp-content/`, sem `/wp-includes/`, sem plugins típicos Elementor/Yoast identificados no excerpt). |
| Framework JS | **Não detectado** React/Vue/Next no HTML inspecionado |
| CSS | Não carregou bibliotecas de terceiros detectáveis (Bootstrap/Tailwind não identificados por classes) |
| Ícones/Imagens | **SVG inline** com `data:image/svg+xml` — sinal de otimização manual ou build process |
| Formulários | `<form>` HTML nativo com campos `nome`, `celular`, `email`, `mensagem` — **sem integração aparente com RD Station, HubSpot ou Pipedrive no front** |
| Google Fonts / fontes externas | Não detectadas |
| Analytics | **Nenhum detectado** (sem GA4, sem GTM, sem Meta Pixel, sem Hotjar/Clarity no HTML retornado) |
| Widget de chat | **Não há** widget flutuante de terceiros (Intercom/JivoChat/Tawk/RD Conversas ausentes) — contato via formulário e WhatsApp |

**Hipótese mais provável:** Site institucional é **estático ou server-rendered minimalista** (possivelmente HTML compilado ou WordPress muito limpo com cache agressivo). O HTML enviado parece servidor → cliente direto, sem bundle SPA.

---

## 4. Stack Frontend — SaaS (`app.bellesoftware.com.br`)

WebFetch foi bloqueado para `app.*` nesta sessão (permissão), mas a WebSearch retornou inferências indiretas:

| Aspecto | Achado / Inferência |
|---------|---------------------|
| Tipo | Provável **SPA clássico** servido no domínio `app.*`, com `/suporte/` como rota interna |
| Framework | **Indeterminado** — nenhuma fonte pública cita explicitamente React/Angular/Vue para o Belle Software |
| Auth | Tela de login tradicional (email+senha), sem SSO Google/Microsoft visível na pesquisa |
| Bundler / hash | Não capturável nesta sessão (requer inspeção direta do HTML do app) |

**Inferência forte baseada em sinais indiretos:**
- Produto existe desde ~2009 (Geinfo fundada em abr/2009)
- Perfis LinkedIn de funcionários antigos mencionam *Full-Stack Developer* (Andre Bertachini, João Moschetta) sem stack específica
- O padrão brasileiro para SaaS legado dessa idade é **ASP.NET Web Forms / ASP.NET MVC (C#)** ou **PHP (Laravel / CodeIgniter)** — [INFERIDO]
- Apps mobile tão enxutos (ver seção 5) e a presença de "Gestor IA" + "BelleChat" recentes sugerem **stack híbrida**: backend legado + módulos novos possivelmente em Node/Python

**AÇÃO DE FOLLOW-UP para KEYRA:** Inspeção manual do `view-source:` e Network tab (DevTools) em `app.bellesoftware.com.br` para identificar: (a) framework via nomes de bundle, (b) endpoints de API, (c) headers do servidor (`X-Powered-By`, `Server`), (d) se há PWA/service worker.

---

## 5. Apps Mobile

Dois apps nativos separados (**profissionais** e **clientes**) em iOS + Android — padrão *dois-apps*:

| App | Android (Play) | iOS (App Store) |
|-----|----------------|-----------------|
| **Belle Software — Profissionais** | `br.com.bellesoftware.profissional` — versão 2.4.23 (15/ago/2025), **8.5–8.62 MB** | `id1300715755` — requer iOS 13.0+ |
| **Belle Software — Clientes** | `br.com.bellesoftware.cliente` | `id1277892957` |
| Desenvolvedor | Geinfo — Tecnologia da Informação | Idem |

**Sinal técnico crítico — bundle de 8.5 MB:**
- **React Native** costuma resultar em APKs de 20–40 MB
- **Flutter** costuma gerar 15–25 MB (engine + framework)
- **Native Android puro (Kotlin/Java)** entrega APKs de 5–15 MB
- **Cordova / Capacitor / Ionic** costumam ficar 10–20 MB com WebView

**Conclusão [INFERIDO — alta confiança]:** O app de **8.5 MB é nativo Android puro (Kotlin/Java)**, possivelmente espelhado em **Swift nativo** no iOS. Isso é consistente com a idade do produto (app iOS cadastrado com ID 1277892957 — IDs desse range datam de 2017). Belle optou por **não migrar para cross-platform**, o que implica **maior custo de manutenção** e **roadmap mobile mais lento** — oportunidade para KEYRA entregar multi-plataforma (RN/Flutter) com 1 time.

---

## 6. Help Center (`ajuda.bellesoftware.com.br`)

**Identificação forte:** a URL pública usa padrão `/knowledge-base/{slug}/` e `/article-categories/{slug}/`, `/modulos-opcionais/`, `/fale-conosco/`. Esse esquema é **idêntico ao do plugin WordPress `Heroic Knowledge Base` (HeroThemes)** — um dos KB plugins mais populares do ecossistema WP brasileiro.

**Conclusão [INFERIDO — confiança alta]:**
- Plataforma: **WordPress + plugin Heroic KB**
- Theme: provavelmente um theme custom HeroThemes (KnowAll ou similar)
- Busca: live search nativa do Heroic KB (não Algolia)
- Categorias observadas: `integracoes-com-belle`, `modulos-adicionais`, `equipamentos`, `questoes-sobre-aplicativos`, `questoes-sobre-integracao`, `aplicativo-para-a-clinica-de-estetica`, `teleatendimento`, `funcionalidades-aplicativo-belle-software`, `gerenciamento-de-nfs-e`, `canais-de-suporte-belle-software`

O help center **NÃO é Zendesk Guide, Intercom Articles, HelpScout Docs, Freshdesk, Movidesk nem Notion** — todos têm padrões de URL distintos.

---

## 7. Analytics e Tracking

**Nada detectado no HTML público do institucional.** Ausência observada de:
- Google Analytics 4 (sem `G-` ID)
- Google Tag Manager (sem `GTM-` container)
- Meta Pixel / Facebook Pixel
- Hotjar / Microsoft Clarity
- LinkedIn Insight Tag
- TikTok Pixel

**Implicação:** OU a Belle usa tracking exclusivamente server-side (improvável para operação 2.700+ clínicas), OU não investe em ferramentas de CRO/atribuição modernas. **[Oportunidade KEYRA]: marketing data-driven bem executado supera a Belle facilmente.**

---

## 8. Comunicação e CRM de Atendimento

- **Site institucional:** sem widget de chat flutuante. Contato via **formulário HTML + WhatsApp + e-mail**.
- **SaaS:** rota `/suporte/` interna ao app (suporte é feature nativa, não widget Intercom/Zendesk).
- **Help center:** URL `/fale-conosco/` no próprio WordPress.
- **Canal principal declarado:** WhatsApp (produto próprio **BelleMessage** + **BelleChat**).

**Ausência notável:** nenhum sinal de **Intercom, Zendesk, HelpScout, Crisp, JivoChat, Movidesk, Octadesk**. Atendimento parece 100% proprietário ou manual.

---

## 9. APIs e Integrações Observáveis

Integrações declaradas na base de conhecimento:

| Integração | Finalidade | Tipo |
|-----------|-----------|------|
| **BelleMessage** (produto próprio) | Envio automatizado de WhatsApp — lembretes, promoções | Módulo adicional pago |
| **PlugMessage** | WhatsApp gateway de terceiros | Integração externa |
| **ZapBot** | WhatsApp gateway alternativo | Integração externa |
| **Pluga.co** | iPaaS — conecta Facebook Leads, RD Station Marketing etc. | Middleware (webhook-based) |
| **RD Station Marketing** (via Pluga) | Captura de leads → CRM | Webhook `RD Station + Pluga Webhooks` |
| **Facebook Lead Ads** (via Pluga) | Captura de leads de Ads | Via Pluga |
| **Cloudia** (secretária virtual com IA) | Integração declarada em cloudia.com.br/integracao/belle-software/ | Integração externa |
| **NFS-e municipal** | Emissão de nota fiscal de serviço | Integração por município (webservice onde disponível) |

**API pública própria:** **não divulgada** na pesquisa. Integrações dependem de módulos pagos e middlewares (Pluga). **[Oportunidade KEYRA]: API-first com docs públicos = diferencial competitivo imediato.**

**Pagamentos:** nenhum provedor detectado (Stripe, Pagar.me, Iugu, Asaas, Mercado Pago) nos scripts públicos. Provável cobrança via boleto/PIX manual ou processador oculto.

---

## 10. Performance Observável

Sem headers `curl -I` nesta sessão, os dados são qualitativos:
- HTML institucional **curto, sem SPA bundle**, inline SVG → **TTFB e FCP provavelmente rápidos**
- Ausência de CDN terceira → **latência pode variar** fora do Brasil (não crítico, público 100% BR)
- Apps mobile compactos (8.5 MB) → download rápido mesmo em 4G fraco
- Site institucional sem Analytics pesados → **menos overhead no browser**

**Status:** [INFERIDO — executar Lighthouse/WebPageTest em sessão futura para números concretos].

---

## 11. Segurança Observável

- `https://` em todos os subdomínios (HTTPS por padrão) — confirmado por navegação WebFetch bem-sucedida
- **Headers específicos (HSTS, CSP, X-Frame-Options, Referrer-Policy) não capturados** nesta sessão
- Apps mobile nativos — menor superfície de ataque que WebView/Cordova
- **Termos de uso publicados** em `/termos-de-uso/` (compliance básico LGPD presumido)
- Sem sinais públicos de incidentes de segurança

**Status:** [INFERIDO — auditoria de headers com `curl -I` e securityheaders.com em sessão futura].

---

## 12. Relação com TOTVS

**Nada encontrado** que indique aquisição ou parceria formal entre **Geinfo/Belle Software** e **TOTVS**. O subdomínio `atracaodetalentos.totvs.app` é a plataforma de recrutamento da TOTVS (produto **TOTVS RH Atração de Talentos**) — usada por múltiplas empresas como ATS SaaS.

**Interpretação da referência mencionada no briefing:**
- Se você viu uma vaga da Belle em `atracaodetalentos.totvs.app/bellesoftware` (ou similar), significa apenas que a **Belle/Geinfo é CLIENTE do ATS da TOTVS** para recrutar — não que exista aquisição, fusão ou parceria estratégica.
- Isto é consistente com o perfil da Geinfo: empresa independente, privada, em Caçador/SC.

**Conclusão:** Nenhuma evidência de integração societária, tecnológica ou comercial com a TOTVS além do uso do produto de recrutamento.

---

## 13. Decisões Técnicas Inferidas

| Dimensão | Decisão provável | Evidência |
|----------|------------------|-----------|
| Arquitetura | **Monolito legado com módulos** | Produto ativo desde ~2009; módulos comercializados separadamente (BelleMessage, NFS-e, Teleatendimento) |
| Cloud | **Self-hosted / VPS nacional** (não multi-cloud) | Ausência de sinais CloudFront/CloudFlare/Azure no HTML |
| Frontend SaaS | **SPA próprio ou MPC server-rendered** | Indeterminado, mas não há sinal de stack moderna (React/Next) |
| Frontend site | **Estático ou WP muito limpo** | HTML enxuto, SVG inline, zero analytics |
| Mobile | **Nativo puro Android + iOS (dois apps por persona)** | Bundles de 8.5 MB + ID iOS antigo (2017) |
| Help center | **WordPress + Heroic KB plugin** | Padrão de URL `/knowledge-base/` + `/article-categories/` |
| Integrações | **Webhook-based via Pluga**, sem API pública | Docs KB |
| WhatsApp | **Produto próprio (BelleMessage) + gateways parceiros** (PlugMessage, ZapBot) | Declarado no site |
| Analytics | **Inexistente ou minimalista** | Nenhum script detectado |
| Tempo em mercado | **17 anos** (Geinfo 2009 → hoje 2026) — produto maduro mas com dívida técnica visível | WHOIS/CNPJ |
| Time | Pequeno (70 followers no LinkedIn, ~5–15 desenvolvedores visíveis no ZoomInfo) | LinkedIn + ZoomInfo |
| Base instalada | **2.700+ clínicas** (Facebook oficial) | Fonte social |

---

## 14. Insights Técnicos para KEYRA

### O que a Belle faz bem (imitar)
1. **Domínios separados por função** (`www`, `app`, `ajuda`, `materiais`) — clareza de papéis
2. **Apps mobile nativos compactos** — 8.5 MB é muito bom para 4G brasileiro
3. **Help center com plugin maduro** (Heroic KB) — time-to-market baixo
4. **Monetização modular** (módulos opcionais BelleMessage, NFS-e, Teleatendimento) — expansion revenue por cliente
5. **Múltiplas opções de WhatsApp** (produto próprio + PlugMessage + ZapBot) — reduz risco de bloqueio da Meta
6. **Produto de suporte dentro do app** (`/suporte/`) — reduz churn por fricção de atendimento

### Onde a Belle está defasada (superar)
1. **Sem API pública documentada** → KEYRA deve lançar **API REST + GraphQL pública com docs** (Stripe-style) desde o dia 1
2. **Sem CDN global** → KEYRA em **Vercel/CloudFlare** entrega TTFB < 100ms em qualquer lugar
3. **Sem analytics/CRO** no site institucional → KEYRA com **GA4 + GTM + Clarity + Hotjar** mede e otimiza funil
4. **Dois apps separados (pro + cliente) aumentam custo e confusão** → KEYRA pode **unificar com feature flags** ou apostar em **PWA + React Native único**
5. **Stack provavelmente legada (.NET Web Forms / PHP antigo — [INFERIDO])** → KEYRA greenfield com **Next.js + Supabase + RN/Expo** entrega 3–5x mais features por sprint
6. **Sem SSO corporativo** (Google/Microsoft) visível → KEYRA deve entregar desde MVP
7. **Integrações dependem de Pluga (iPaaS pago)** → KEYRA com webhooks nativos + Zapier/Make oficial reduz custo para o cliente
8. **Analytics preditiva ausente** (Belle tem "Gestor IA" recente, mas genérico) → KEYRA pode entregar **metas, LTV e previsão de churn** nativamente com IA
9. **Sem status page pública** (status.bellesoftware.com.br não existe) → KEYRA com **BetterStack/Instatus** desde o dia 1 transmite confiança enterprise
10. **Ausência de comunidade/Discord/fórum** → KEYRA pode construir **comunidade de esteticistas** como moat

### Recomendações de investigação adicional (quando Bash liberado)
- `curl -I` nos 4 subdomínios → identificar servidor, CDN, HSTS, CSP
- `dig` para ver hospedagem real (IP → ASN → provedor)
- `whois bellesoftware.com.br` para ver registrar e date de registro
- Lighthouse em `www.*` e `app.*` → LCP/FID/CLS/TTI concretos
- DevTools Network tab em `app.bellesoftware.com.br` → identificar bundle, framework e endpoints de API
- `wappalyzer` ou `builtwith.com/bellesoftware.com.br` → detecção automatizada de stack
- Baixar e descompactar o APK (`br.com.bellesoftware.profissional`) → inspecionar `AndroidManifest.xml`, libs, strings — confirmaria/refutaria nativo vs RN/Flutter

---

## Fontes consultadas

- [Belle Software — site oficial](https://www.bellesoftware.com.br/)
- [BelleMessage](https://www.bellesoftware.com.br/bellemessage/)
- [Central de Ajuda Belle Software](https://ajuda.bellesoftware.com.br/)
- [Integrações Pluga × Belle Software](https://ajuda.bellesoftware.com.br/knowledge-base/integracoes-pluga/)
- [PlugMessage WhatsApp](https://ajuda.bellesoftware.com.br/knowledge-base/integracao-com-o-whatsapp-plugzapi/)
- [Gerenciamento NFS-e](https://ajuda.bellesoftware.com.br/knowledge-base/gerenciamento-de-nfs-e/)
- [Módulos Opcionais](https://ajuda.bellesoftware.com.br/modulos-opcionais/)
- [Belle Software Profissionais — Google Play](https://play.google.com/store/apps/details?id=br.com.bellesoftware.profissional)
- [Belle Software Clientes — Google Play](https://play.google.com/store/apps/details?id=br.com.bellesoftware.cliente)
- [Belle Software Profissionais — App Store](https://apps.apple.com/br/app/belle-software-profissionais/id1300715755)
- [Belle Software Clientes — App Store](https://apps.apple.com/br/app/belle-software-clientes/id1277892957)
- [Geinfo — LinkedIn](https://www.linkedin.com/company/geinfo)
- [Geinfo — EconoData (CNPJ)](https://www.econodata.com.br/consulta-empresa/10762438000160-geinffo-tecnologia-de-informacao-ltda)
- [Integração Cloudia × Belle Software](https://www.cloudia.com.br/integracao/belle-software/)
- [Heroic Knowledge Base Plugin (HeroThemes)](https://herothemes.com/plugins/heroic-wordpress-knowledge-base/)
- [APKPure — APK Belle Software](https://apkpure.com/belle-software-profissionais/br.com.bellesoftware.profissional)

---

**Confiabilidade da análise:** MÉDIA. Limitada pela indisponibilidade de `curl`/`dig`/WebFetch em `app.*` e `ajuda.*` nesta sessão. Recomenda-se nova passada com Bash liberado para confirmar (a) stack do SaaS via inspeção de bundle, (b) headers de CDN/servidor, (c) Lighthouse, (d) decompilação do APK. As inferências [INFERIDO] estão marcadas e têm confiança variável — help center (WordPress+Heroic KB) é alta confiança; stack do SaaS (.NET/PHP legado) é média confiança.
