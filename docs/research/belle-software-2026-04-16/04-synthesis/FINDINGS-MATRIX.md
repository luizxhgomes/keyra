# Belle Software — Findings Matrix

**Data:** 2026-04-16
**Propósito:** Todas as descobertas numeradas, com evidência rastreável, grau de confiança, implicação direta para KEYRA e prioridade de ação.
**Cobertura:** 8 dimensões × 75 findings.

## Legenda
- **Confiança:** ALTA (múltiplas fontes) | MÉDIA (1 fonte sólida) | BAIXA (inferência)
- **Prioridade KEYRA:** P0 (decisão imediata) | P1 (0-6m) | P2 (6-12m) | P3 (monitorar)

## Matriz de Findings

### Dimensão 1 — Empresa & Legal

| # | Finding | Evidência | Confiança | Implicação KEYRA | Prior. |
|---|---|---|---|---|---|
| F01 | Razão social **Geinffo Tecnologia de Informação Ltda** (CNPJ 10.762.438/0001-60), fundada 15/04/2009 em Caçador/SC | `company-intel.md §1` | ALTA | Concorrente pequeno/interior; não é SP, sem escala VC | P2 |
| F02 | Capital social **R$ 170.000** após 17 anos | `company-intel.md §1,11` | ALTA | Bootstrap puro. Sem munição p/ guerra de preço | P1 |
| F03 | Origem **Incubadora FETEC/Uniarp** | `company-intel.md §1-2` | ALTA | DNA acadêmico-regional, não blitz-scale | P3 |
| F04 | 2 produtos verticais: Belle Software (estética) + Dr. Análise (clínicas médicas) | `tech-stack.md §1` | ALTA | Dr. Análise pode ser alvo futuro de aquisição de base | P3 |
| F05 | CEO Thibes é **sócio da Markkit AA** (agência parceira do Belle) — conflito de interesse estrutural | `company-intel.md §3` | ALTA | Governança bootstrap-familiar; KEYRA com governança transparente vence | P1 |
| F06 | Thibes é professor universitário + colunista Revista Negócio Estética + mestrando | `company-intel.md §3` | ALTA | Autoridade acadêmica-setorial, não founder digital | P2 |
| F07 | Headcount 11-50 (ZoomInfo), provavelmente 30-50 | `company-intel.md §5` | MÉDIA | Time pequeno — KEYRA com squad AI-augmented iguala velocidade | P2 |
| F08 | **Relação TOTVS é ilusão** — Belle é cliente do ATS TOTVS RH, não há M&A/JV/distribuição | `company-intel.md §4` · `tech-stack.md §12` | ALTA | Moat via "TOTVS" é falso; desmistificar no conteúdo | P0 |
| F09 | ARR estimado **R$ 4,8-11,3M** (2.700 × R$ 150-350) ou R$ 9,7-16,2M c/ add-ons | `company-intel.md §10` · `sales-strategy-analysis.md §10.1` | MÉDIA | Concorrente pequeno-médio; não é unicórnio | P2 |
| F10 | **Zero VC em 17 anos**; CAGR base 2020-2024 ~28% a.a. | `company-intel.md §10,11` | ALTA | Crescimento saudável, incapaz de reagir com capital | P1 |

### Dimensão 2 — Produto & Features

| # | Finding | Evidência | Confiança | Implicação KEYRA | Prior. |
|---|---|---|---|---|---|
| F11 | Arquitetura **monolito web multi-tenant com feature flags pagas** | `product-features.md §1.2,1.3` | ALTA | Pricing "base + add-ons" gera ticket real 3-4× o anunciado | P1 |
| F12 | Stack full-suite 24+ módulos | `product-features.md §2` | ALTA | Feature-bloat intimida persona iniciante | P1 |
| F13 | **Bug recorrente em controle de pacote** ("12 sessões em vez de 10") em múltiplas reclamações RA | `company-intel.md §7` · `product-features.md §8.3` | ALTA | Trilha de auditoria imutável em pacotes = headline KEYRA | P0 |
| F14 | **BSC 4 perspectivas** (Financeira/Cliente/Processos/Aprendizado) como framework Metas | `product-features.md §2.4` | ALTA | Replicar com BSC simplificado 3 perspectivas + números absolutos | P1 |
| F15 | **Financeiro raso** — só contas a pagar/receber + caixa + TEF/boleto. Sem DRE gerencial, sem fluxo projetado, sem margem por serviço, sem precificação por custo | `product-features.md §2.2, §8.1` | ALTA | Território 100% livre — feature-âncora CFO p/ estética | P0 |
| F16 | **Sem precificação estratégica** (BOM + markup + custo direto + simulador) — gap universal Belle + Trinks + 16 players | `product-features.md §8.1` · `benchmark-report.md §3` | ALTA | Gap universal; feature-âncora obrigatória KEYRA | P0 |
| F17 | **Sem integração contábil** (SPED, OFX, ContaAzul, Nibo) | `product-features.md §8.1` | ALTA | Diferencial KEYRA fácil, difícil de copiar em stack legado | P1 |
| F18 | **Sem Open Finance / Pix dinâmico destacado** | `product-features.md §8.1` · `tech-stack.md §9` | ALTA | Diferencial KEYRA | P1 |
| F19 | **IA é bolt-on** (BelleChat + Gestor IA são chamadas LLM externas [INFERÊNCIA] sobre monolito legado) | `product-features.md §2.5` · `reverse-engineering-blueprint.md §9.3` | MÉDIA | KEYRA AI-native por design defensável 18-24m | P0 |
| F20 | **7 verticais declaradas, só 2 com features reais** (pilates agendamento coletivo; franquias multi-unidade). Demais são re-embalagem de marketing | `product-features.md §3` | ALTA | KEYRA com foco vertical único honesto vence em credibilidade | P1 |
| F21 | **2 apps mobile nativos** (profissional + cliente), Kotlin/Java + Swift, 8.5 MB cada | `product-features.md §2.6` · `tech-stack.md §5` | ALTA | Qualidade alta, custo 2×. KEYRA PWA + RN único economiza 50% | P1 |
| F22 | **Belle Franquias** produto dedicado p/ 60 redes (PRM + royalties + app) | `product-features.md §5` | ALTA | Território enterprise que KEYRA deliberadamente rejeita | P2 |
| F23 | **+Resultados** consultoria humana marketing/CRM (3 pilares); preço opaco ~R$ 1-3k/mês | `product-features.md §4` · `pricing-and-funnel.md §3` | ALTA | KEYRA substitui por AI agent (KEYRA+) c/ preço transparente | P2 |
| F24 | Cases c/ uplift: +65% fat. (CAF), +60% ticket (Revitalize), +40% fat. (BodyPrime), -26% no-show (Essencial) | `product-features.md §7.2` | ALTA | Números vêm de +Resultados (consultoria), **não do software puro** — assimetria de atribuição | P2 |
| F25 | Trial **14 + 7 ext. auto + 10 grace = 31 dias efetivos**, sem cartão | `pricing-and-funnel.md §6.1` | ALTA | KEYRA c/ 30 dias transparentes + AI copilot ativação | P1 |

### Dimensão 3 — Pricing & Monetização

| # | Finding | Evidência | Confiança | Implicação KEYRA | Prior. |
|---|---|---|---|---|---|
| F26 | **Preço opaco** — Belle não publica tabela na home; exige demo | `pricing-and-funnel.md §1.1` | ALTA | Transparência radical de preço = arma de marca imediata | P0 |
| F27 | Via Cloudia: R$ 865/ano (1 prof) · R$ 2.048/ano (3-4) · R$ 3.810/ano (12-15) — preço/prof cai drasticamente | `pricing-and-funnel.md §1.1` | MÉDIA | Estratégia enterprise discount; KEYRA mantém preço linear transparente | P2 |
| F28 | **8 add-ons pagos** empilhando R$ 689/mês: WhatsApp 229 · BI 150 · Marketing 150 · NFS-e 70 · NFC-e 90 · Biometria 90 · App Cliente 150 · Assinatura 45 | `pricing-and-funnel.md §2.3` | ALTA | Bait-and-switch perceptível; KEYRA plano único all-inclusive destrói ancoragem | P0 |
| F29 | **Fidelidade 1 ano (-15%)** e **2 anos (-26%)** c/ **multa 50% saldo devedor** | `pricing-and-funnel.md §1.2` | ALTA | Lock-in defensivo. KEYRA c/ zero fidelidade + zero multa ataca Belle e Trinks | P0 |
| F30 | Incluso: usuários admin/recepção ilimitados, cadastros ilimitados, backup AWS, 7 treinamentos, suporte | `pricing-and-funnel.md §1.3` | ALTA | Paridade obrigatória | P1 |
| F31 | Treinamento individual **R$ 250** (4 sessões) — monetiza curva de aprendizado | `pricing-and-funnel.md §1.4` | ALTA | KEYRA c/ onboarding AI copilot 10min derruba custo a zero | P1 |
| F32 | Clínica média c/ base + WhatsApp + BI + NFS-e + Marketing paga **R$ 619-769/mês** — ticket real 3-4× anunciado | `pricing-and-funnel.md §2.3` | ALTA | Ancoragem "R$ 170/mês" enganosa; KEYRA exibe preço real upfront | P0 |
| F33 | ARPU real R$ 400-800/mês; R$ 2-4k/mês com +Resultados; R$ 5-15k/mês franqueadoras | `sales-strategy-analysis.md §8.3` | MÉDIA | Belle monetiza em camadas; KEYRA foca simplicidade | P2 |
| F34 | Pagamento Pix + TED + cartão (3 opções) | `pricing-and-funnel.md §1.2` | ALTA | Paridade mínima | P1 |

### Dimensão 4 — Funil & GTM

| # | Finding | Evidência | Confiança | Implicação KEYRA | Prior. |
|---|---|---|---|---|---|
| F35 | **5 LPs de trial simultâneas** (canônica, A/B, A/B v2, Meta Ads, 60 dias) | `site-map.md` · `sales-strategy-analysis.md §6` | ALTA | Replicar 5 LPs segregadas desde pré-lançamento | P1 |
| F36 | Página `/migracao-de-dados` existe (sem título) remove fricção de switch | `site-map.md` · `pricing-and-funnel.md §9.5` | ALTA | Replicar amplificado: `/migrar-do-belle` + importador + crédito de multa | P0 |
| F37 | **Blog-autoridade em domínio separado: `gestaodeestetica.com`** rankeia "gestão de estética" | `brand-and-positioning.md §6.1` | ALTA | Replicar c/ `financeiroparaestetica.com.br` focado em dor financeira | P1 |
| F38 | **3 ebooks lead magnet** (Automatização, Campanhas, Máquina de Vendas) | `pricing-and-funnel.md §7.1` | ALTA | KEYRA cria ebook "Quanto sobra por trás de uma limpeza de pele?" | P1 |
| F39 | **Gestão de Estética Conference** 23k+ inscritos acumulados (6 edições) | `brand-and-positioning.md §6.5` | ALTA | Moat setorial forte, mas 1×/ano = 11 meses silêncio. Comunidade contínua vence | P1 |
| F40 | Presença em feiras: Estetika, Estética in SP/Sul, Beauty Summit, Confidefe | `sales-strategy-analysis.md §2.3` | ALTA | Canal B2B qualificado; KEYRA pode entrar ano 1 | P2 |
| F41 | Meta Ads com LP dedicada + variações A/B | `sales-strategy-analysis.md §2.2` | MÉDIA | KEYRA c/ analytics + tracking server-side desde MVP | P1 |
| F42 | Conflito CEO → Markkit (canal de leads opaco) | `company-intel.md §3` | ALTA | Opacidade; KEYRA c/ governança transparente | P2 |
| F43 | Equipe comercial: Camila Stofela (gerente), Leandro Ponte (closer), Karine da Silva (atendimento) | `company-intel.md §3` | ALTA | Estrutura PME bootstrap | P3 |
| F44 | SLA suporte 2a-6a 8h-22h + Sáb 9h-16h30; **sem SLA público de tempo de resposta** | `sales-strategy-analysis.md §7.4` | ALTA | KEYRA c/ SLA público + status page = maturidade | P1 |
| F45 | Onboarding depende de **7 treinamentos Zoom + 2 kickoffs 30min** | `pricing-and-funnel.md §8.3` | ALTA | KEYRA c/ copilot in-app elimina Zoom | P1 |

### Dimensão 5 — Brand & Posicionamento

| # | Finding | Evidência | Confiança | Implicação KEYRA | Prior. |
|---|---|---|---|---|---|
| F46 | Tagline oficial: **"O Melhor Sistema para Clínica de Estética"** (repetido ad nauseam) | `brand-and-positioning.md §1` | ALTA | Superlativo saturado; KEYRA cria categoria nova | P0 |
| F47 | **Arquétipo jungiano: Governante + Sábio** (autoridade, controle, legado) | `brand-and-positioning.md §5` | ALTA | KEYRA Cuidador + Sábio = território 180° oposto, irreplicável por Belle | P0 |
| F48 | Léxico proibido para KEYRA (dominante em Belle): *melhor, completo, integrado, total, automação, eficiência* | `brand-and-positioning.md §5` | ALTA | Guia de voz KEYRA c/ checklist obrigatório | P0 |
| F49 | **Instagram @bellesoftware: 11k seguidores** (sub p/ 2.700 clientes) | `brand-and-positioning.md §6.3` | ALTA | Baixo investimento em brand content; KEYRA founder-led ocupa | P1 |
| F50 | Selo GPTW declarado; ZoomInfo não confirma (possível inconsistência) | `company-intel.md §5` | MÉDIA | Monitorar; não atacar frontalmente | P3 |
| F51 | Cases estruturados `[Clínica] + [%] + [KPI]` | `brand-and-positioning.md §7` | ALTA | KEYRA replica c/ KPIs de **lucro** (margem 12%→28%, pró-labore +R$ 11k) | P1 |
| F52 | PR editorial: Terra/Dino, GloboPlay, Mundo Marketing, coluna Thibes Revista | `brand-and-positioning.md §9` | ALTA | Belle = autoridade de palco; KEYRA = construir-em-público digital | P2 |

### Dimensão 6 — Tech Stack & Infra

| # | Finding | Evidência | Confiança | Implicação KEYRA | Prior. |
|---|---|---|---|---|---|
| F53 | Hospedagem **AWS** declarada; site institucional sem CDN terceira detectada | `tech-stack.md §2` | ALTA | KEYRA c/ Vercel + Supabase + Cloudflare entrega TTFB <100ms | P1 |
| F54 | Site institucional estático/WP limpo; **ZERO analytics/GTM/Pixel/Hotjar/Clarity no HTML** | `tech-stack.md §3, §7` | ALTA | Marketing não data-driven; KEYRA c/ stack analytics completo supera | P0 |
| F55 | SaaS `app.bellesoftware.com.br` — stack [INFERÊNCIA] ASP.NET Web Forms ou PHP legado | `tech-stack.md §4, §13` | BAIXA | Dívida técnica inviabiliza velocidade; KEYRA greenfield 3-5× mais rápido | P1 |
| F56 | APK Android **8.5 MB versão 2.4.23 (ago/2025)**; iOS id 1277892957 (~2017) | `tech-stack.md §5` | ALTA | Nativo puro qualidade alta, roadmap mobile lento | P2 |
| F57 | **Help Center WordPress + Heroic KB plugin** (URL `/knowledge-base/{slug}/`) datado | `tech-stack.md §6` | ALTA | KEYRA c/ Mintlify/Docusaurus moderno = maturidade tech | P1 |
| F58 | **Sem API pública documentada** — integrações só via **Pluga (iPaaS pago)** | `tech-stack.md §9` | ALTA | KEYRA c/ API REST + OpenAPI + docs Stripe-style dia 1 = moat estrutural | P0 |
| F59 | Sem webhooks nativos; tudo via Pluga | `tech-stack.md §9` | ALTA | KEYRA c/ webhooks nativos destrói middleware pago | P1 |
| F60 | Múltiplos gateways WhatsApp: BelleMessage + PlugMessage + ZapBot (indica produto próprio não-robusto) | `tech-stack.md §9` | ALTA | Risco de ban Meta; KEYRA c/ Cloud API oficial = seguro + feature-âncora | P0 |
| F61 | **Status page pública inexistente** (`status.bellesoftware.com.br` não existe) | `tech-stack.md §14 #9` | ALTA | KEYRA c/ Instatus/BetterStack dia 1 = confiança B2B | P1 |
| F62 | Termos publicados, **sem DPO identificado**; atraso em entrega de backup LGPD no RA | `company-intel.md §14 #6` | ALTA | KEYRA c/ DPO nomeado + portabilidade self-service 1-clique = LGPD first | P0 |
| F63 | Multi-tenancy [INFERÊNCIA] schema/row-level; sem RLS nativo detectado | `tech-stack.md §13` | BAIXA | KEYRA c/ RLS Postgres (Supabase) garante isolamento verificável | P1 |

### Dimensão 7 — Reputação & Reclamações

| # | Finding | Evidência | Confiança | Implicação KEYRA | Prior. |
|---|---|---|---|---|---|
| F64 | Página RA Geinfo **não atinge 10 reclamações** p/ nota calculada — volume baixo | `company-intel.md §7` | ALTA | Baixa exposição, temas graves; ABM em reclamantes | P1 |
| F65 | Padrão: **bugs controle pacote/sessão** — clientes entregando sessões sem cobrar | `company-intel.md §7` | ALTA | Feature-headline KEYRA: auditoria imutável | P0 |
| F66 | Padrão: **interface datada "anos 90"** | `company-intel.md §7` | ALTA | KEYRA UX moderna tela única = diferencial percebido imediato | P0 |
| F67 | Padrão: **perda/sumiço de dados** — "informações desaparecem, controlamos em planilha paralela" | `company-intel.md §7` | ALTA | Compliance + trilha de auditoria na home KEYRA | P1 |
| F68 | Padrão: **WhatsApp banido permanentemente** via BelleMessage/Speedchat (caso Shopee) | `company-intel.md §7` | ALTA | Cloud API Meta oficial + template approvado + opt-in documentado | P0 |
| F69 | Padrão: **SAC padronizado frio**, demora entrega backup | `company-intel.md §7` | ALTA | KEYRA c/ SLA público + exportação self-service | P1 |
| F70 | **Zero presença em G2/Capterra/Trustpilot** | `company-intel.md §8` | ALTA | KEYRA pode ocupar "Belle alternative" em reviews internacionais | P1 |
| F71 | Apps mobile têm reviews mas volume não levantado | `company-intel.md §8` | MÉDIA | Monitorar em passada futura | P3 |

### Dimensão 8 — Retenção & Lock-in

| # | Finding | Evidência | Confiança | Implicação KEYRA | Prior. |
|---|---|---|---|---|---|
| F72 | Lock-in estrutural: fidelidade + multa 50% + sem API + atraso backup + +Resultados amarra + Conference + Belle Franquias | `reverse-engineering-blueprint.md §4.4` | ALTA | Retenção defensiva (custo de saída, não amor). Clientes trocam c/ opção + migração | P0 |
| F73 | **Zero comunidade contínua** (Discord, fórum, WhatsApp) — só Conference 1×/ano | `brand-and-positioning.md §6.5, §12.7` | ALTA | KEYRA c/ "Círculo KEYRA" preenche 11 meses silêncio | P1 |
| F74 | **Zero changelog público** / release notes | `product-features.md §8.2` | ALTA | KEYRA c/ changelog + status page + roadmap visível = produto vivo | P2 |
| F75 | Página de vídeos c/ apenas 3 institucionais — sem universidade estruturada | `product-features.md §8.2` | ALTA | KEYRA YouTube founder-led Luiz ocupa thought-leadership vídeo | P2 |

## Contagem por Dimensão

| # | Dimensão | Findings | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|---|
| 1 | Empresa & Legal | 10 | 1 | 3 | 4 | 2 |
| 2 | Produto & Features | 15 | 3 | 8 | 4 | 0 |
| 3 | Pricing & Monetização | 9 | 3 | 4 | 2 | 0 |
| 4 | Funil & GTM | 11 | 1 | 7 | 2 | 1 |
| 5 | Brand & Posicionamento | 7 | 3 | 2 | 1 | 1 |
| 6 | Tech Stack & Infra | 11 | 4 | 5 | 1 | 0 |
| 7 | Reputação | 8 | 3 | 3 | 0 | 1 |
| 8 | Retenção & Lock-in | 4 | 1 | 1 | 2 | 0 |
| **Total** | | **75** | **19** | **33** | **16** | **5** |

## Contagem por Prioridade

| Prioridade | Findings | % |
|---|---|---|
| P0 (decisão imediata) | 19 | 25% |
| P1 (0-6m) | 33 | 44% |
| P2 (6-12m) | 16 | 22% |
| P3 (monitorar) | 5 | 7% |
| **P0+P1** | **52** | **69%** |

**Leitura:** 69% dos findings acionáveis no curto prazo — janela competitiva aberta e rica.

## Contagem por Confiança

| Confiança | Findings | % |
|---|---|---|
| ALTA | 63 | 84% |
| MÉDIA | 9 | 12% |
| BAIXA | 3 | 4% |

## Top 10 Findings de Maior Alavancagem KEYRA

1. **F08** — Relação TOTVS é ilusão (desmistificar no conteúdo)
2. **F13** — Bug em pacotes (feature-headline auditoria imutável)
3. **F15** — Financeiro raso (CFO-grade é território livre)
4. **F16** — Gap universal de precificação estratégica (feature-âncora)
5. **F19** — IA bolt-on (AI-native por design é moat)
6. **F26** — Preço opaco (transparência radical)
7. **F28** — Add-ons empilham 3-4× (plano único all-inclusive)
8. **F29** — Fidelidade + multa 50% (zero lock-in como diferencial)
9. **F58** — Sem API pública (Stripe-style docs é moat)
10. **F68** — WhatsApp banido (Cloud API Meta oficial incluso)
