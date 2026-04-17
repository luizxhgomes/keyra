# KEYRA — Oportunidades Extraídas da Belle Software

**Data:** 2026-04-16
**Input:** 6 dossiês de coleta + 5 análises profundas sobre Belle Software
**Output:** 36 plays acionáveis para o roadmap KEYRA, priorizadas por impacto × facilidade × gap competitivo
**Pesquisa correlata:** [Trinks Analysis](../../trinks-analysis-2026-04-16/04-synthesis/KEYRA-OPPORTUNITIES.md)

## 1. Os 3 Movimentos de Abertura (primeiros 90 dias)

### Movimento 1 — "Menos gráfico. Mais lucro." (categoria nova)
**Problema:** Belle domina a categoria "sistema de gestão para clínica de estética" com 17 anos de moat; Trinks é "parceira motivacional". Disputar a mesma categoria é corrida perdida.
**Play:** Ocupar categoria **"Sócia financeira da esteticista"**. Toda copy, LP, pitch e founder-content usa o frame.
**Métrica:** 70%+ das donas de clínica entrevistadas (n=15) repetem "sócia financeira" ou "CFO para estética" sem prompt após 90 dias.
**Esforço:** BAIXO (decisão). **Impacto:** ALTÍSSIMO. **Sprint:** Pré-MVP.

### Movimento 2 — Preço público + zero fidelidade como arma de marca
**Problema:** Belle esconde preço e trava cliente com multa de 50%; clientes descobrem custo real (R$ 619-769/mês) pós-conversão. Gera ressentimento viralizado no Reclame Aqui.
**Play:** Publicar tabela completa na home, calculadora interativa, botão "cancelar 1-clique", política de portabilidade self-service; manifesto público "Sem fidelidade. Sem multa. Sem surpresa."
**Métrica:** Taxa de conversão LP > 3% (benchmark SaaS B2B: 1,5-2%); CAC reduzido em 30% pela remoção de fricção.
**Esforço:** BAIXO (política). **Impacto:** ALTO. **Sprint:** MVP.

### Movimento 3 — WhatsApp Cloud API Meta incluso + auditoria imutável em pacotes
**Problema:** Belle tem duas fragilidades emblemáticas: (a) WhatsApp via Speedchat/BelleMessage banindo números de clientes, (b) bug em pacote de sessão ("12 em vez de 10").
**Play:** WhatsApp Cloud API Meta oficial incluso no plano base (template approvado, opt-in documentado) + feature "Auditoria Pacote" com append-only log e hash encadeado.
**Métrica:** Zero incidentes de ban Meta + zero discrepância de contagem em 100 pacotes auditados no primeiro trimestre.
**Esforço:** MÉDIO. **Impacto:** ALTÍSSIMO. **Sprint:** MVP.

---

## 2. Oportunidades de Produto (15 plays)

### 2.1 Precificação por custo com BOM editável
**Gap:** Belle + Trinks + 16 players **não têm** este módulo. É feature-âncora universal.
**Play:** BOM editável por procedimento (insumos consumidos) → custo direto automático → markup configurável → margem-alvo → preço sugerido. Simulador "se eu baixar 10%, quanto cai o lucro?".
**Evidência:** `product-features.md §8.1` · `benchmark-report.md §3` (F16)
**Esforço:** MÉDIO. **Impacto:** ALTÍSSIMO. **Sprint:** MVP.

### 2.2 DRE gerencial tela única (CFO-grade)
**Gap:** Belle não destaca DRE publicamente; Trinks é relatório clássico.
**Play:** Receita · CMV · Custo Fixo · Lucro Bruto · Pró-labore · Impostos · Lucro Líquido. Todas as linhas clicáveis p/ drill-down. Zero gráfico. Filtrável por período.
**Evidência:** `product-features.md §8.1` (F15)
**Esforço:** MÉDIO. **Impacto:** ALTO. **Sprint:** MVP.

### 2.3 Fluxo de caixa projetado (forward)
**Gap:** Belle só tem caixa realizado.
**Play:** Projeção 30/60/90 dias baseada em contas a receber + contas a pagar + assinaturas + pacotes. Alerta "seu caixa vai zerar em 12 dias".
**Evidência:** `product-features.md §8.1` (F15)
**Esforço:** MÉDIO. **Impacto:** ALTO. **Sprint:** MVP + 1 sprint.

### 2.4 Controle auditável de pacote/sessão
**Gap:** Belle tem bug recorrente ("12 em vez de 10") — dor RA pública.
**Play:** Append-only log de cada sessão (quem agendou, quem executou, quando consumiu, hash encadeado). Feature "Auditoria Pacote" na home como promessa.
**Evidência:** `company-intel.md §7` · `product-features.md §8.3` (F13, F65)
**Esforço:** MÉDIO. **Impacto:** ALTÍSSIMO. **Sprint:** MVP.

### 2.5 WhatsApp Cloud API Meta oficial incluso no plano base
**Gap:** Belle cobra R$ 229/mês (BelleMessage) e opera em zona cinza — bane números.
**Play:** WhatsApp Business Cloud API incluso no plano base com template approvado + opt-in documentado. Lembretes, confirmações, reativação de cliente em risco.
**Evidência:** `tech-stack.md §9` · `company-intel.md §7` (F60, F68)
**Esforço:** MÉDIO. **Impacto:** ALTÍSSIMO. **Sprint:** MVP.

### 2.6 Tela única "Hoje" (single-pane-of-glass)
**Gap:** Belle comunica "24+ módulos"; Trinks tem 130+ relatórios. Ambos violam princípio UX da idealizadora.
**Play:** Dashboard único com 3-5 números absolutos: Caixa do dia · Faturamento vs Meta · Lucro líquido do mês · Próximos compromissos · Produtos acabando. Mobile-first. Zero gráfico.
**Evidência:** princípio UX idealizadora + `positioning-analysis.md §13` · `strategy-catalog.md Matriz #3`
**Esforço:** MÉDIO. **Impacto:** ALTÍSSIMO. **Sprint:** MVP.

### 2.7 Números absolutos (não dashboards)
**Gap:** Belle BSC com gráficos; Trinks com 130+ relatórios. Ninguém faz "absolutos puros".
**Play:** Toda tela mostra números grandes (faturamento R$ 12.340 — não "R$12,3k"). Zero gráfico de tendência. Delta simples ("+R$ 2.100 vs mês passado").
**Evidência:** princípio UX idealizadora
**Esforço:** BAIXO. **Impacto:** ALTO. **Sprint:** MVP.

### 2.8 AI copilot financeiro nativo (não bolt-on)
**Gap:** Belle tem Gestor IA como chamada LLM externa sobre monolito legado — classico bolt-on.
**Play:** IA estrutural em cada tela: sugere preço baseado em custo + benchmark setor, aponta risco de caixa, prediz churn de cliente, recomenda follow-up automático. AI-native por design no core.
**Evidência:** `product-features.md §2.5` · `reverse-engineering-blueprint.md §9.3` (F19)
**Esforço:** ALTO. **Impacto:** ALTO. **Sprint:** 3-6 meses pós-MVP.

### 2.9 Integração contábil SPED/OFX/ContaAzul/Nibo
**Gap:** Belle não tem.
**Play:** Exportação automática em SPED Contribuições, OFX bancário, conector direto com ContaAzul e Nibo. Integração com contador da clínica em 1 clique.
**Evidência:** `product-features.md §8.1` (F17)
**Esforço:** MÉDIO. **Impacto:** MÉDIO-ALTO. **Sprint:** 6 meses pós-MVP.

### 2.10 Open Finance + conciliação multi-adquirente
**Gap:** Belle e Trinks não têm.
**Play:** Conexão Open Finance para ver extratos em tempo real; conciliação automática de Stone + Cielo + PagSeguro + SumUp + InfinitePay; alerta de divergência de taxa.
**Evidência:** `product-features.md §8.1` · `benchmark-report.md §3` (F18)
**Esforço:** ALTO. **Impacto:** ALTO. **Sprint:** 6-9 meses pós-MVP.

### 2.11 Pró-labore explícito + separação PF/PJ
**Gap:** Belle fala de faturamento, nunca de pró-labore. Tabu narrativo.
**Play:** Campo de pró-labore configurável no DRE; linha "quanto seu negócio te paga" destacada. Educação em onboarding com AI copilot.
**Evidência:** `positioning-analysis.md §9` (F15 related)
**Esforço:** BAIXO. **Impacto:** MÉDIO-ALTO. **Sprint:** MVP.

### 2.12 Lote + validade em estoque (Anvisa-ready)
**Gap:** Belle e Trinks não têm.
**Play:** Controle por lote e validade de dermocosmético/biocomposto. Alerta "use antes de abrir novo". FIFO automático. Relatório Anvisa-ready.
**Evidência:** `product-features.md §8.1` (gap universal)
**Esforço:** MÉDIO. **Impacto:** MÉDIO. **Sprint:** 3 meses pós-MVP.

### 2.13 Pré-pagamento Pix no agendamento online
**Gap:** Belle e Trinks dependem de cartão/maquininha.
**Play:** Cliente final agenda online → paga via Pix na hora (QR dinâmico) → reduz no-show sem depender de cartão. Conecta a Open Finance nativo.
**Evidência:** `product-features.md §8.1`
**Esforço:** BAIXO-MÉDIO. **Impacto:** MÉDIO. **Sprint:** 2-3 meses pós-MVP.

### 2.14 Exportação total de dados self-service (LGPD first)
**Gap:** Belle tem atraso em entrega de backup (RA); sem API pública.
**Play:** Botão "Exportar todos os meus dados" 1-clique gerando ZIP com CSV de clientes, agendamentos, financeiro, pacotes, fotos, anamneses. Em 60 segundos.
**Evidência:** `company-intel.md §7, §14 #6` (F62)
**Esforço:** BAIXO-MÉDIO. **Impacto:** MÉDIO-ALTO. **Sprint:** MVP + 1 sprint.

### 2.15 App unificado PWA + RN (não 2 apps nativos separados)
**Gap:** Belle mantém 4 binários (profissional iOS+Android, cliente iOS+Android) — custo de manutenção 2×.
**Play:** 1 app B2B em React Native/Expo com feature flag por persona + PWA leve para cliente final. 1 codebase, atualização instantânea.
**Evidência:** `tech-stack.md §5` (F21)
**Esforço:** ALTO. **Impacto:** MÉDIO-ALTO. **Sprint:** 3-6 meses pós-MVP.

---

## 3. Oportunidades de Pricing & GTM (10 plays)

### 3.1 Preço público transparente em todas as faixas
**Gap:** Belle preço opaco (demo obrigatória); Trinks só 1-2 profissionais visível.
**Play:** Tabela completa na home + calculadora interativa ("quantos profissionais? aqui está seu preço").
**Evidência:** `pricing-and-funnel.md §1.1` (F26)
**Esforço:** BAIXO. **Impacto:** ALTO. **Sprint:** MVP.

### 3.2 Zero fidelidade, zero multa, cancelamento self-service
**Gap:** Belle multa 50% do saldo; Trinks multa percebida 80%.
**Play:** Plano mensal sem travas. Botão "cancelar" funcional em 1 clique. Copy: "A KEYRA cresce com você porque entrega valor, não porque te prende."
**Evidência:** `pricing-and-funnel.md §1.2` (F29)
**Esforço:** BAIXO (política). **Impacto:** ALTO. **Sprint:** MVP.

### 3.3 Plano único all-inclusive (WhatsApp + NFS-e + precificação + metas)
**Gap:** Belle plano base + 8 add-ons inflando 3-4× o preço nominal.
**Play:** Plano único com tudo que 90% dos clientes precisa. Premium só p/ uso avançado (AI+ agent, multi-unidade, integração contábil).
**Evidência:** `pricing-and-funnel.md §2.3` (F28, F32)
**Esforço:** BAIXO (decisão). **Impacto:** ALTÍSSIMO. **Sprint:** MVP.

### 3.4 LP `/migrar-do-belle` + importador assistido + crédito de multa
**Gap:** Belle tem `/migracao-de-dados` sem título (ativo subutilizado).
**Play:** LP completa c/ copy honesto (dor-solução-timeline), importador semi-automatizado (exportação manual + scripts), crédito de até R$ 500 da multa de saída ("KEYRA paga parte").
**Evidência:** `site-map.md` · `strategy-catalog.md §1.4` (F36)
**Esforço:** MÉDIO. **Impacto:** ALTÍSSIMO. **Sprint:** 2-3 meses pós-MVP.

### 3.5 Trial 30 dias honesto (não "14 com truques")
**Gap:** Belle "14 dias" com extensão silenciosa (31 efetivos); Trinks 5 dias (curto demais).
**Play:** 30 dias abertos + extensão por pedido + AI copilot de ativação que detecta inatividade e oferece ajuda via chat.
**Evidência:** `pricing-and-funnel.md §6.1` (F25)
**Esforço:** BAIXO-MÉDIO. **Impacto:** MÉDIO-ALTO. **Sprint:** MVP.

### 3.6 5 LPs de trial segregadas por canal
**Gap:** Belle tem 5 LPs mas A/B sem rigor; zero analytics.
**Play:** `/trial-organico`, `/trial-meta`, `/trial-google`, `/trial-indicacao`, `/trial-migracao-belle`. Tracking server-side via Cloudflare. GrowthBook p/ A/B test.
**Evidência:** `strategy-catalog.md §1.7` (F35)
**Esforço:** BAIXO. **Impacto:** MÉDIO-ALTO. **Sprint:** Pré-lançamento.

### 3.7 SEO sniper em "belle alternativa" + "migrar do belle" + "whatsapp banido"
**Gap:** Belle tem zero analytics/CRO; reage lento em SEO defensivo.
**Play:** 5 artigos âncora publicados em 30 dias: "Belle Software alternativa 2026", "Migrar do Belle Software: passo a passo", "Belle Software problemas em pacote de sessão", "WhatsApp banido em clínica — como evitar", "Belle Software preço real (descomplicado)". SEO long-tail compounding.
**Evidência:** `company-intel.md §15` (F70)
**Esforço:** MÉDIO (conteúdo). **Impacto:** ALTO. **Sprint:** Pré-lançamento.

### 3.8 ABM nos reclamantes públicos do RA/Geinfo
**Gap:** RA Geinfo tem queixas concretas (WhatsApp banido, bug em pacote, backup atrasado).
**Play:** Lista curada de 20-30 clínicas reclamantes. Abordagem 1-on-1 via LinkedIn/WhatsApp com case de migração assistida + 2 meses grátis. CAC próximo de zero.
**Evidência:** `company-intel.md §7,15` (F64-F69)
**Esforço:** BAIXO. **Impacto:** MÉDIO-ALTO. **Sprint:** 1-2 meses pós-MVP.

### 3.9 Outreach PR em rankings editoriais (Cloudia, Celcoin, Belasis, Portal Vida Livre)
**Gap:** Belle usa esses sites p/ aparecer em rankings.
**Play:** Outreach manual oferecendo ebook exclusivo + entrevista founder + acesso beta → menção em ranking. Paralelamente: ranking próprio no blog KEYRA ("10 melhores softwares para estética 2026").
**Evidência:** `strategy-catalog.md §1.12`
**Esforço:** BAIXO. **Impacto:** MÉDIO. **Sprint:** 1-2 meses pós-MVP.

### 3.10 Status page + SLA público + DPO nomeado
**Gap:** Belle não tem nenhum; DPO ausente na Política de Privacidade.
**Play:** Instatus ou BetterStack com uptime histórico público + SLA 99,9% publicado + DPO com e-mail direto + política LGPD explícita + portabilidade self-service.
**Evidência:** `tech-stack.md §14` · `company-intel.md §14 #6` (F61, F62)
**Esforço:** BAIXO. **Impacto:** MÉDIO-ALTO. **Sprint:** MVP + 1 sprint.

---

## 4. Oportunidades de Brand & Posicionamento (7 plays)

### 4.1 Categoria "Sócia financeira da esteticista"
**Gap:** Belle é Governante corporativo; Trinks é Parceira motivacional. Território Cuidador + Sábio 100% vago.
**Play:** Toda narrativa de marca + LP + pitch + bio social + assinatura de email usa a categoria. Copy-âncora: *"A Belle te dá gestão. A KEYRA te dá renda."*
**Evidência:** `positioning-analysis.md §11-13` · `brand-and-positioning.md §12` (F47)
**Esforço:** BAIXO. **Impacto:** ALTÍSSIMO. **Sprint:** Pré-MVP.

### 4.2 Arquétipo Cuidador + Sábio vs Governante + Sábio da Belle
**Gap:** Belle = autoridade, controle, legado (masculino-executivo); setor 90% feminino.
**Play:** Toda copy emana cuidado, intimidade, expertise empática. Fotografia de donas de clínica reais (não stock photo). Tom amiga-estrategista.
**Evidência:** `brand-and-positioning.md §5` · `positioning-analysis.md §3` (F47)
**Esforço:** MÉDIO (guia de voz). **Impacto:** ALTO. **Sprint:** Pré-MVP.

### 4.3 Tom íntimo afetivo pt-BR com acentuação rigorosa
**Gap:** Belle escreve como SAP; léxico corporativo frio; acentuação às vezes precária.
**Play:** Guia de voz com léxico proibido (*melhor, completo, integrado, total, eficiência*) e aprovado (*sua renda, seu tempo, tranquilidade, dormir em paz, no seu bolso, final do mês, sua clínica, amiga*). Toda copy passa por checklist afetivo **+ checklist de acentuação pt-BR (inegociável)**.
**Evidência:** `brand-and-positioning.md §5` · MEMORY.md idealizadora + acentuação pt-BR (F48)
**Esforço:** BAIXO (documento). **Impacto:** ALTO. **Sprint:** Pré-MVP.

### 4.4 Founder-led content diário (Luiz @luizhenriquexpro)
**Gap:** Rafael Thibes acadêmico em Conference 1×/ano, sem tração digital. Founder-led moderno ausente.
**Play:** LinkedIn diário + YouTube semanal + built-in-public do Luiz. Narrativa founder-amigo construindo a KEYRA em público. Usar skill `lh-content-generator`.
**Evidência:** `company-intel.md §15` · `strategy-catalog.md §2.14`
**Esforço:** CONTÍNUO. **Impacto:** ALTO. **Sprint:** Pré-lançamento (começar agora).

### 4.5 Comunidade contínua "Círculo KEYRA" (vs Conference anual da Belle)
**Gap:** Belle concentra comunidade 2 dias em março; 11 meses de silêncio.
**Play:** WhatsApp curado + masterclass mensal (Luiz + convidadas) + peer-benchmarking anônimo entre pares. "Você não aparece uma vez por ano. Conversa toda semana."
**Evidência:** `brand-and-positioning.md §6.5, §12.7` (F73)
**Esforço:** MÉDIO (moderação). **Impacto:** ALTO (moat comunitário). **Sprint:** 1-2 meses pós-MVP.

### 4.6 Manifesto "para quem quer ter a melhor clínica da rua, não a maior rede do Brasil"
**Gap:** Belle mira franqueadoras e redes (Belle Franquias, Dr. Rey, Vitaclin); KEYRA mira oposto.
**Play:** Manifesto público que recorta ICP honestamente: *"Não somos para franquias. Somos para quem quer ter a melhor clínica da rua, renda consistente e vida fora da clínica."*
**Evidência:** `positioning-analysis.md §13 Play 12`
**Esforço:** BAIXO. **Impacto:** MÉDIO-ALTO (foco). **Sprint:** Pré-MVP.

### 4.7 Identidade visual estética (nude/dourado/orgânico) — anti azul-corporativo
**Gap:** Belle é azul corporativo (parece banco); Trinks é laranja motivacional. Ninguém usa paleta do universo estético real.
**Play:** Paleta nude + champanhe + dourado suave; tipografia elegante; fotografia real de donas de clínica; visual de estúdio boutique, não ERP.
**Evidência:** `brand-and-positioning.md §8, §12.8`
**Esforço:** MÉDIO (design system). **Impacto:** MÉDIO-ALTO. **Sprint:** Pré-MVP.

---

## 5. Oportunidades Ofensivas (atacar base Belle)

### 5.1 ABM em reclamantes públicos do RA
Lista curada de 20-30 clientes com queixa específica (bug pacote, WhatsApp banido, backup atrasado). Abordagem 1-on-1 com case de migração assistida. Ver play 3.8.

### 5.2 Conteúdo comparativo honesto (não spammy)
Artigo "Belle Software: quando faz sentido e quando não faz" — análise respeitosa com critérios objetivos. Nunca atacar Thibes (autoridade setorial); atacar apenas produto (UX, bugs, add-ons).

### 5.3 Refund de multa parcial para migração
LP `/migrar-do-belle` oferece até R$ 500 de crédito para cobrir parte da multa de saída. Lead entra pagando menos, KEYRA recupera em 2-3 meses.

### 5.4 Importador de dados via planilhas + scripts
Belle não tem API pública. Processo assistido: exportação manual de CSVs + scripts Python + onboarding 1-on-1 dos primeiros 100 migrantes. CAC próximo de zero, conversão alta.

### 5.5 Evento regional paralelo ao Conference da Belle
Março 2027 (mesmo mês): KEYRA Encontro SP 150 pessoas focado em "donas que querem lucrar, não virar rede". Convidadas: contadoras de estética, donas reais com case de margem, mentoras financeiras para mulheres. Evento-satélite que fere autoridade de palco da Belle.

---

## 6. Riscos a Evitar (anti-patterns da Belle)

1. **Preço opaco** → KEYRA publica tabela completa e calculadora
2. **Fidelidade + multa 50%** → KEYRA zero trava contratual
3. **Add-ons obrigatórios na prática** → KEYRA plano único all-inclusive
4. **Zero analytics/CRO** → KEYRA stack completo desde MVP (GA4 + GTM + Clarity + PostHog)
5. **Tom frio de ERP corporativo** → KEYRA íntimo afetivo pt-BR acentuado
6. **Feature-bloat ("24 módulos")** → KEYRA 3 fluxos + tela única
7. **Conflito CEO-agência sócia** → KEYRA governança limpa e transparente
8. **Vertical multiplicado sem diferenciação** → KEYRA só estética, ponto
9. **WhatsApp em zona cinza** → KEYRA Cloud API Meta oficial
10. **Bug em feature core** → KEYRA trilha auditoria imutável como promessa
11. **Help Center datado WordPress** → KEYRA Mintlify/Docusaurus
12. **2 apps nativos separados** → KEYRA PWA + RN único
13. **Stack legado ASP.NET/PHP** → KEYRA Next.js + Supabase greenfield
14. **CEO invisível em redes modernas** → KEYRA founder-led Luiz diário
15. **Instagram subdimensionado** → KEYRA estratégia IG intencional

## 7. Matriz Priorizada Final (Impacto × Esforço)

| # | Play | Impacto | Esforço | Priority | Sprint |
|---|---|---|---|---|---|
| 1 | Categoria "Sócia financeira da esteticista" | ALTÍSSIMO | BAIXO | **CRÍTICA** | Pré-MVP |
| 2 | Tela única "Hoje" c/ 3-5 números absolutos | ALTÍSSIMO | MÉDIO | **CRÍTICA** | MVP |
| 3 | Precificação por custo com BOM editável | ALTÍSSIMO | MÉDIO | **CRÍTICA** | MVP |
| 4 | Plano único all-inclusive (WhatsApp + NFS-e + precificação) | ALTÍSSIMO | BAIXO | **CRÍTICA** | MVP |
| 5 | WhatsApp Cloud API Meta oficial incluso | ALTÍSSIMO | MÉDIO | **CRÍTICA** | MVP |
| 6 | Zero fidelidade + zero multa + cancelamento 1-clique | ALTO | BAIXO | **CRÍTICA** | MVP |
| 7 | Preço público todas as faixas + calculadora | ALTO | BAIXO | **CRÍTICA** | MVP |
| 8 | Tom íntimo afetivo pt-BR + guia de voz | ALTO | BAIXO | **CRÍTICA** | Pré-MVP |
| 9 | Controle auditável de pacote/sessão | ALTÍSSIMO | MÉDIO | **CRÍTICA** | MVP |
| 10 | DRE gerencial tela única CFO-grade | ALTO | MÉDIO | **CRÍTICA** | MVP |
| 11 | Pró-labore explícito + PF/PJ | MÉDIO-ALTO | BAIXO | **CRÍTICA** | MVP |
| 12 | Arquétipo Cuidador + Sábio | ALTO | MÉDIO | **CRÍTICA** | Pré-MVP |
| 13 | Manifesto "melhor clínica da rua" | MÉDIO-ALTO | BAIXO | **CRÍTICA** | Pré-MVP |
| 14 | AI copilot de ativação (onboarding 10 min) | ALTÍSSIMO | ALTO | **ALTA** | MVP + 1 sprint |
| 15 | 5 LPs trial segregadas por canal | MÉDIO-ALTO | BAIXO | **ALTA** | Pré-lançamento |
| 16 | LP `/migrar-do-belle` + importador + crédito de multa | ALTÍSSIMO | ALTO | **ALTA** | 2-3 meses pós-MVP |
| 17 | Analytics stack completo (GA4+GTM+Clarity+PostHog) | ALTO | BAIXO | **ALTA** | MVP |
| 18 | Status page + SLA público + DPO nomeado | MÉDIO-ALTO | BAIXO | **ALTA** | MVP + 1 sprint |
| 19 | Central de ajuda Mintlify/Docusaurus | MÉDIO-ALTO | BAIXO | **ALTA** | MVP |
| 20 | Blog-autoridade em domínio neutro | ALTO (longo prazo) | MÉDIO | **ALTA** | MVP + 2 meses |
| 21 | SEO sniper "belle alternativa" + 4 artigos âncora | ALTO | MÉDIO | **ALTA** | Pré-lançamento |
| 22 | Founder-led content diário Luiz | ALTO | CONTÍNUO | **ALTA** | Pré-lançamento |
| 23 | Cases com números de LUCRO (margem, pró-labore) | ALTÍSSIMO | MÉDIO | **ALTA** | 3-6 meses pós-MVP |
| 24 | ICP recorte: solo/pequena clínica, não rede | ALTO | BAIXO | **ALTA** | Pré-MVP |
| 25 | BSC simplificado 3 perspectivas (Dinheiro/Cliente/Operação) | ALTO | MÉDIO | **ALTA** | MVP |
| 26 | Fluxo de caixa projetado (30/60/90 dias) | ALTO | MÉDIO | **ALTA** | MVP + 1 sprint |
| 27 | Exportação total de dados self-service | MÉDIO-ALTO | BAIXO-MÉDIO | **ALTA** | MVP + 1 sprint |
| 28 | Identidade visual nude/dourado/orgânico | MÉDIO-ALTO | MÉDIO | **ALTA** | Pré-MVP |
| 29 | Comunidade contínua "Círculo KEYRA" WhatsApp | ALTO (moat) | MÉDIO | **MÉDIA** | 1-2 meses pós-MVP |
| 30 | ABM em reclamantes públicos RA Geinfo | MÉDIO-ALTO | BAIXO | **MÉDIA** | 1-2 meses pós-MVP |
| 31 | Outreach PR rankings setoriais | MÉDIO | BAIXO | **MÉDIA** | 1-2 meses pós-MVP |
| 32 | Programa "Amiga KEYRA" indicação | MÉDIO-ALTO | BAIXO | **MÉDIA** | Após 100 clientes |
| 33 | Integração contábil SPED/OFX/ContaAzul/Nibo | MÉDIO | MÉDIO | **MÉDIA** | 6 meses pós-MVP |
| 34 | Open Finance + conciliação multi-adquirente | ALTO | ALTO | **MÉDIA** | 6-9 meses pós-MVP |
| 35 | AI copilot financeiro estrutural (precificação + risco caixa + churn preditivo) | ALTO | ALTO | **MÉDIA** | 6-12 meses pós-MVP |
| 36 | KEYRA Encontro anual (mini-Conference) | ALTO (longo prazo) | ALTO | **BAIXA** | Ano 2 |

## 8. 5 Métricas de Guerra (KPIs que mostram vitória)

1. **Taxa de clientes migrados de Belle/Trinks (%)** — meta 30% dos primeiros 100 pagantes em 6 meses
2. **Palavras-mantra da categoria ("sócia financeira", "CFO estética") em entrevistas não-prompted** — meta 70%+ em 15 entrevistas
3. **Cases com métrica de lucro real (margem 12→28%, pró-labore +R$ 11k)** — meta 5 cases publicados em 6 meses
4. **SEO ranking top-3 em "belle software alternativa" + "migrar do belle software"** — meta 3 meses pós-lançamento
5. **NPS + reviews G2/Capterra nos primeiros 100 clientes** — meta NPS 60+ e 20+ reviews ≥ 4,5/5 em 9 meses
