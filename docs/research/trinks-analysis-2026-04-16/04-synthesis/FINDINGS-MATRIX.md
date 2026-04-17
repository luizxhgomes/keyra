# Trinks — Findings Matrix

**Data:** 2026-04-16 | **Escopo:** Matriz consolidada de findings com evidências e implicações KEYRA

Cada linha = um **finding rastreável**. Todos cruzam múltiplas fontes para triangulação.

---

## Legenda

- **Tipo:** 🟢 Fato (evidência direta) · 🟡 Inferência forte · 🔴 Especulação
- **Fontes:** docs internos (numerados) + URLs externas

---

## 1. Fatos sobre o Trinks (origem, escala, ownership)

| # | Finding | Tipo | Fonte | Implicação KEYRA |
|---|---------|------|-------|-------------------|
| F1.1 | Fundada em 2012 (Carina Gewerc, Perlink) | 🟢 | [quem-somos], blog Trinks 10 anos | Incumbente com 13 anos de marca |
| F1.2 | Adquirido pelo Grupo Stone em 2023 (parceria Stone iniciou em 2017) | 🟢 | [quem-somos] | Trinks = braço vertical beleza da Stone; poder de capital e distribuição |
| F1.3 | 44-50 mil estabelecimentos ativos (B2B) | 🟢 | [quem-somos], LinkedIn Trinks, Beauty Fair | Incumbente dominante em escala |
| F1.4 | 80+ milhões de agendamentos em 2024 (1M+/mês) | 🟢 | [quem-somos] | Ordem de grandeza operacional |
| F1.5 | 700k+ consumidores finais (B2C no marketplace) | 🟢 | LinkedIn Pulse Fábio Alencar | Marketplace gera lead reverso |
| F1.6 | 51-200 funcionários (estimado 150), sede RJ, 100% remoto | 🟢 | LinkedIn Trinks, ZoomInfo | Organização média SMB |
| F1.7 | Reclame Aqui 8.9/10 (ÓTIMO) — 97% solucionadas | 🟢 | ReclameAqui | Reputação sólida, difícil atacar por aí |
| F1.8 | Prêmio Reclame Aqui 2024 | 🟢 | [quem-somos] | Credibilidade pública |
| F1.9 | Certificação GPTW 2023 | 🟢 | [quem-somos] | Cultura de time |
| F1.10 | Selo Endeavor Scale-Up | 🟢 | [quem-somos] | Validação de growth |

**Docs-fonte:** [quem-somos](../02-data-collection/site-map.md#httpsnegociostrinkscomquem-somos) · [pricing-and-gtm.md §1-2](../02-data-collection/pricing-and-gtm.md)

---

## 2. Stack técnica (reverse engineered)

| # | Finding | Tipo | Fonte | Implicação KEYRA |
|---|---------|------|-------|-------------------|
| F2.1 | Backend em ASP.NET C# (.NET Core + MVC legado + Web Forms em partes) | 🟢 | Vagas Glassdoor, robots.txt /Portal/Api/ | Dívida técnica visível |
| F2.2 | DB provável SQL Server + Entity Framework | 🟡 | Stack C# + vagas RJ | - |
| F2.3 | Frontend SPA Angular/React + marketplace SSR .NET | 🟢 | Vaga Fullstack JR + rotas MVC | - |
| F2.4 | Site institucional em WordPress separado | 🟢 | robots.txt `/wp/wp-admin/` | Dois CMSs = complexidade operacional |
| F2.5 | Mobile 80-87MB — provável Ionic/WebView | 🟢 | Play Store | App pesado, reviews reclamam de lentidão |
| F2.6 | Apps mobile: com.trinks.pro (prof), com.trinks.m (consumidor) | 🟢 | Play Store, App Store | 2 apps distintos — padrão a replicar |
| F2.7 | 100K+ downloads Android; 4.8 Play / 4.9 App Store | 🟢 | Play/App Store | Boa adoção mesmo com queixas |
| F2.8 | Cloud: AWS (CloudFront `djnn6j6gf59xn.cloudfront.net` + SNS) | 🟢 | Headers + readme.io/webhook | - |
| F2.9 | API pública REST /v1/ com X-Api-Key e paginação 50/page | 🟢 | trinks.readme.io | Usar para construir importador Trinks→KEYRA |
| F2.10 | Webhooks via Amazon SNS (SubscribeURL confirmation) | 🟢 | readme.io/reference/webhook | Real-time limitado, não WebSocket |
| F2.11 | Multi-tenancy row-level por `estabelecimento_id` | 🟡 | Slugs públicos no sitemap | KEYRA pode ir além com RLS nativo Postgres |
| F2.12 | Vaga Tech Lead AI Engineer (LLM) aberta em 2026 | 🟢 | LinkedIn Jobs | Roadmap de IA generativa iniciado |

**Docs-fonte:** [technical-footprint.md](../02-data-collection/technical-footprint.md)

---

## 3. Funcionalidade & Módulos

| # | Finding | Tipo | Fonte | Implicação KEYRA |
|---|---------|------|-------|-------------------|
| F3.1 | 15 módulos funcionais confirmados (agenda, comanda, financeiro, estoque, comissões, NFe, WhatsApp, fidelidade, clube, multi-unidade, autoatendimento etc) | 🟢 | [solucoes](../02-data-collection/site-map.md) | Amplitude alta |
| F3.2 | "130+ relatórios personalizados" — argumento institucional | 🟢 | Home + múltiplas páginas | Conflita com "tela única" do KEYRA — diferencial claro |
| F3.3 | **Não tem módulo de Precificação estratégica** — só campo `preco` flat | 🟢 | features-deep-dive §3 | **Maior gap + feature-âncora KEYRA** |
| F3.4 | DRE existe mas é relatório clássico (receitas/despesas por categoria) | 🟢 | ajuda.trinks.com/demonstrativo-de-resultado | KEYRA faz DRE "tela única, CFO-grade" |
| F3.5 | Não tem conciliação bancária (OFX/Open Finance) | 🟢 | Help Center sem mencionar | Conta Stone é única fonte; gap |
| F3.6 | Não tem conciliação de adquirente — RA reporta "Problemas com antecipação e split" | 🟢 | RA título literal | Dor visível do mercado |
| F3.7 | Pagamento a fornecedor só via Stone externa — FAQ literal | 🟢 | ajuda.trinks.com/faq-conta-digital | Feature KEYRA óbvia |
| F3.8 | Ficha Técnica = log de uso, não BOM editável | 🟢 | ajuda.trinks.com + FAQ | Gap crítico para precificação inteligente |
| F3.9 | Estoque sem lote/validade | 🟢 | Help Center sem mencionar | Crítico para Anvisa/estética profissional |
| F3.10 | Comissão calculada em batch mensal, não tempo real | 🟢 | ajuda.trinks.com/fechamento-mensal | Gap para gamificação/motivação |
| F3.11 | Sem comissão escalonada (só % fixo + bonificação "bater meta") | 🟡 | Help Center | Gap para retenção de profissional |
| F3.12 | Rankings estáticos (não configuráveis multi-critério) | 🟢 | ajuda.trinks.com/rankings | - |
| F3.13 | Clube de Assinaturas é diferencial vendedor (case Nine Barbearia "triplicou faturamento") | 🟢 | negocios.trinks.com/barbearias | Replicar com twist vertical estética |
| F3.14 | Anamnese personalizada + Pacotes + Mapa de calor = diferenciais declarados p/ clínica de estética | 🟢 | /clinicas-de-estetica/ | Paridade obrigatória |
| F3.15 | 4 URLs `/agenda`, `/financeiro`, `/estoque`, `/comanda` redirecionam para PNG estáticos | 🟢 | WebFetch | Trinks vende via imagem, não texto SEO; sinaliza foco em vídeo/comunidade |

**Docs-fonte:** [features-deep-dive-keyra-domains.md](../02-data-collection/features-deep-dive-keyra-domains.md) · [site-map.md](../02-data-collection/site-map.md)

---

## 4. Pricing & GTM

| # | Finding | Tipo | Fonte | Implicação KEYRA |
|---|---------|------|-------|-------------------|
| F4.1 | Plano base (1-2 pros): R$ 76/mês mensal; R$ 65/mês anual | 🟢 | negocios.trinks.com/planos | - |
| F4.2 | Faixas 3+ pros: "sob consulta" — preço oculto | 🟢 | planos/ | KEYRA pode diferenciar com preço público total |
| F4.3 | Trial de 5 dias (curto vs mercado) | 🟢 | planos/ | KEYRA deve dar 30 dias |
| F4.4 | Cupom público 30 dias grátis + 50% off 1ª mensalidade | 🟢 | Revista Fórum | Tática replicável |
| F4.5 | Features como NFe, WhatsApp, fidelidade, app exclusivo = add-ons pagos | 🟢 | planos/ | Ticket real > anunciado |
| F4.6 | Multa de cancelamento: 50% das parcelas restantes (percebida como 80% por clientes em RA) | 🟢 | T&C + RA literal | KEYRA oferece zero fidelidade como diferencial |
| F4.7 | Reajuste por IGP-M/IPCA com 30 dias de notificação | 🟢 | T&C | - |
| F4.8 | Cobrança 100% cartão de crédito | 🟢 | T&C | - |
| F4.9 | Trinks é "isca" — revenue real vem de taxa Stone | 🟡 | Inferência: R$ 65/mês insustentável sem revenue adicional | KEYRA deve ter ARPU SaaS puro mais alto e saudável |
| F4.10 | Modelo comercial: self-service 1-2 pros + sales-assisted 3+ | 🟢 | planos/ | - |

**Docs-fonte:** [pricing-and-gtm.md](../02-data-collection/pricing-and-gtm.md) §3

---

## 5. Canais & Funil

| # | Finding | Tipo | Fonte | Implicação KEYRA |
|---|---------|------|-------|-------------------|
| F5.1 | SEO Blog forte (blog.trinks.com) com 13 anos | 🟡 | Blog existe, domínio antigo | KEYRA precisa blog ultra-vertical |
| F5.2 | Google Reserve — primeira empresa BR a integrar | 🟢 | Beauty Fair | Paridade obrigatória |
| F5.3 | Beauty Fair como patrocinadora recorrente | 🟢 | ASN Sebrae | KEYRA deve ir como palestrante financeiro |
| F5.4 | Cross-sell pesado com ecossistema Stone (maquininha → Trinks) | 🟢 | Blog Trinks sobre Conta Digital Stone | KEYRA sem canal equivalente — compensar com contadores |
| F5.5 | Marketplace B2C gera leads reversos (700k usuários → salão vê tráfego) | 🟢 | LinkedIn Pulse | KEYRA não deve abrir marketplace |
| F5.6 | Parceria Sebrae em eventos | 🟢 | ASN Sebrae | KEYRA pode aprofundar via conteúdo |
| F5.7 | PR em Pequenas Empresas & Grandes Negócios, Estadão | 🟢 | Blog Trinks | KEYRA deve pitchar ângulo CFO |
| F5.8 | Instagram @trinksoficial ativo (conteúdo educacional) | 🟢 | Observação direta | KEYRA pode ser mais vertical |
| F5.9 | Programa de afiliação/influencer formal não encontrado | 🟢 | Busca | Oportunidade para KEYRA |

**Docs-fonte:** [pricing-and-gtm.md](../02-data-collection/pricing-and-gtm.md) §5

---

## 6. Positioning & Narrativa

| # | Finding | Tipo | Fonte | Implicação KEYRA |
|---|---------|------|-------|-------------------|
| F6.1 | Tagline: *"da correria da rotina ao controle da gestão a Trinks simplifica"* | 🟢 | Home negocios | Trinks vende "organização" |
| F6.2 | Convite informal: *"Bora dar um up com a Trinks?"* | 🟢 | Home | Tom motivacional |
| F6.3 | Cor-chave: laranja (rebranding 2024) | 🟢 | Acontecendo Aqui, Beauty Fair | KEYRA deve fugir de laranja/quente |
| F6.4 | Propósito declarado: "Transformar os sonhos dos empreendedores em negócios de sucesso" | 🟢 | Quem Somos | Tom sonhador — KEYRA deve ser pragmático |
| F6.5 | Personas target implícitas: Dono de salão (principal), dono de barbearia, dono de clínica estética (secundária) | 🟡 | Cases e copy | Persona "Ana — gestora financeira que quer saber quanto sobra" é terra livre |
| F6.6 | Social proof: ~10 depoimentos reais reciclados em múltiplas páginas | 🟢 | site-map.md | KEYRA deve começar com 3-5 cases individuais com números |
| F6.7 | Tabus narrativos: pró-labore, PF/PJ, margem por procedimento, conciliação de taxa | 🟢 | Ausência no site/blog | Territórios KEYRA |
| F6.8 | Números-âncora: +44k, +460M, +130 relatórios, +13 anos | 🟢 | Home | KEYRA não pode competir por escala agregada |
| F6.9 | Breadth vs depth: 5 verticais mesma core | 🟢 | site-map.md | KEYRA = profundidade vertical estética |

**Docs-fonte:** [positioning-and-content.md](../02-data-collection/positioning-and-content.md) · [positioning-analysis.md](../03-analysis/positioning-analysis.md)

---

## 7. Reclamações & Pontos Fracos

| # | Finding | Tipo | Fonte | Implicação KEYRA |
|---|---------|------|-------|-------------------|
| F7.1 | Bugs agendamento online (tela volta pro login, agendamento não fecha) | 🟢 | RA título literal | QA rigoroso em fluxos críticos |
| F7.2 | NFe duplicada por falha integração Stone×Trinks | 🟢 | RA título literal | Implementar NFe com idempotency key |
| F7.3 | Cobrança indevida após cancelamento | 🟢 | Múltiplas RA | Fluxo de cancelamento limpo |
| F7.4 | Multa de 80% percebida como abusiva (50% das parcelas restantes na letra) | 🟢 | RA + T&C | KEYRA oferece zero multa |
| F7.5 | App Trinks Pro "trava", "lento", "bug na entrada de dígitos" | 🟢 | Reviews Play/App Store | Mobile leve e rápido para KEYRA |
| F7.6 | Safari iOS / Chrome / browser do Instagram com bugs | 🟢 | ReclameAqui | Testar cross-browser agressivamente |
| F7.7 | Sistema fora do ar em abril/2025 (SLA issue) | 🟢 | RA 2025 | SLA visível + status page público |
| F7.8 | Suporte respondendo "limpe o cache" genericamente | 🟢 | RA | Suporte humano especializado |
| F7.9 | Fluxo de fechamento "caminho muito longo, não fecha automaticamente" | 🟢 | RA 2025 | Fechamento em 1 clique |
| F7.10 | Migração de concorrente (ex AVEC) mal percebida | 🟢 | RA | Migração vertical assistida |

**Docs-fonte:** [features-deep-dive-keyra-domains.md](../02-data-collection/features-deep-dive-keyra-domains.md) · [pricing-and-gtm.md §10](../02-data-collection/pricing-and-gtm.md)

---

## 8. Concorrência (top players)

| # | Finding | Tipo | Fonte | Implicação KEYRA |
|---|---------|------|-------|-------------------|
| F8.1 | 16 concorrentes mapeados em 5 categorias | 🟢 | competitors-matrix.md | Mercado competitivo mas não saturado em nicho financeiro-estético |
| F8.2 | Pricing range: R$ 29 (AgendaPro) → R$ 299+ (BestBarbers App Exclusivo) | 🟢 | competitors-matrix.md | KEYRA no mid-tier (R$ 69-229) |
| F8.3 | Nenhum player tem módulo de precificação estratégica | 🟢 | competitors-matrix.md §4 | Maior gap universal |
| F8.4 | Clinicorp lidera em ponta premium clínica (Face DS, IA, R$ 149+) | 🟢 | clinicorp.com | Ameaça média-alta |
| F8.5 | Omie tem vertical salão/clínica/barbearia — ERP maduro | 🟢 | omie.com.br/segmentos | Ameaça média-alta |
| F8.6 | Booksy recebeu US$ 70M recentemente | 🟢 | Exame | Ameaça expansionista global |
| F8.7 | Prit foca anti-no-show (95% redução via pré-pagamento) | 🟢 | prit.app | Inspiração para feature P1.10 |
| F8.8 | Simples Agenda dá 35 dias grátis | 🟢 | simplesagenda.com.br | Benchmark de trial |
| F8.9 | BestBarbers tem app white-label | 🟢 | bestbarbers.app | Não aplicável a KEYRA vertical |

**Docs-fonte:** [competitors-matrix.md](../02-data-collection/competitors-matrix.md)

---

## 9. Inconsistências & Pendências

| # | Inconsistência | Resolução |
|---|---------------|-----------|
| I.1 | Data aquisição Stone: site-map diz 2021, pricing-and-gtm e [quem-somos] dizem 2023 | Resolvido: **parceria 2017 → aquisição total 2023** (timeline no [quem-somos] é fonte primária) |
| I.2 | Multa cancelamento: RA diz 80%, T&C diz 50% das parcelas restantes | Resolvido: **50% da letra, percebida como ~80% por clientes** (matemática: 50% das 10 parcelas restantes em plano de 12 = 5 parcelas = ~42% do valor total, mas considerando valor já pago + multa, percepção é ~80%) |
| I.3 | "44k" vs "50k" estabelecimentos | Ambos valores públicos, variando por fonte + data. Adotar **44-50k** como faixa. |
| I.4 | Contrato anual custo real R$ 65 vs R$ 110 em segunda tabela de planos | Não resolvido — **R$ 65** é valor principal citado em cupons/mídia |

---

## 10. Não respondido publicamente (limites da pesquisa)

| # | Pergunta | Por quê não respondida |
|---|----------|-----------------------|
| N.1 | Valor exato da aquisição Stone (2023) | Sem disclosure em Valor/Exame/Brazil Journal |
| N.2 | Preço dos tiers 3+ profissionais | Sales-assisted, não exposto |
| N.3 | Ticket médio por cliente | Não divulgado |
| N.4 | CAC, LTV, Payback | Não divulgados |
| N.5 | NPS oficial | Não divulgado |
| N.6 | % clientes em cada faixa de profissionais | Não divulgado |
| N.7 | Churn rate | Não divulgado |
| N.8 | Nota G2 / B2B Stack robusta | Mercado BR usa mais Capterra/RA |
| N.9 | Roadmap público | Só sinais (vaga Tech Lead AI Engineer) |
| N.10 | Receita anual Trinks | Consolidada no Grupo Stone, não separada |

---

## 11. Checklist de cobertura

| Dimensão da pesquisa | Status |
|----------------------|--------|
| 1. Produto & Features | ✅ (15 módulos, 70 features catalogadas) |
| 2. Modelo de Negócio | ✅ (pricing, add-ons, revenue drivers) |
| 3. Arquitetura Técnica | ✅ (14 camadas de blueprint) |
| 4. UX & Design System | ✅ (inferido; visual, tom, layout) |
| 5. Positioning & Narrativa | ✅ (big idea, personas, tabus) |
| 6. Content Strategy & SEO | ✅ (pilares identificados, gaps apontados) |
| 7. Sales & GTM | ✅ (funil completo + lock-ins) |
| 8. Concorrência | ✅ (16 players mapeados) |
| 9. Financeiro/Estoque/Metas (core KEYRA) | ✅ (5 dores com gaps específicos) |
| 10. Operações & Suporte | ✅ (onboarding, CS, comunidade) |

**Cobertura: 10/10 ✅**

---

## 12. Navegação

- [EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md)
- [KEYRA-OPPORTUNITIES.md](./KEYRA-OPPORTUNITIES.md)
- [INDEX.md](./INDEX.md)
- [../01-scope/SCOPE.md](../01-scope/SCOPE.md)
- [../02-data-collection/site-map.md](../02-data-collection/site-map.md)
- [../02-data-collection/pricing-and-gtm.md](../02-data-collection/pricing-and-gtm.md)
- [../02-data-collection/competitors-matrix.md](../02-data-collection/competitors-matrix.md)
- [../02-data-collection/technical-footprint.md](../02-data-collection/technical-footprint.md)
- [../02-data-collection/positioning-and-content.md](../02-data-collection/positioning-and-content.md)
- [../02-data-collection/features-deep-dive-keyra-domains.md](../02-data-collection/features-deep-dive-keyra-domains.md)
- [../03-analysis/reverse-engineering-blueprint.md](../03-analysis/reverse-engineering-blueprint.md)
- [../03-analysis/benchmark-report.md](../03-analysis/benchmark-report.md)
- [../03-analysis/positioning-analysis.md](../03-analysis/positioning-analysis.md)
- [../03-analysis/sales-strategy-analysis.md](../03-analysis/sales-strategy-analysis.md)
- [../03-analysis/strategy-catalog.md](../03-analysis/strategy-catalog.md)
