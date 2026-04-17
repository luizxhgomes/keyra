# Trinks — Strategy Catalog (frameworks observados)

**Data:** 2026-04-16 | **Escopo:** Catálogo de estratégias Trinks categorizadas como REPLICAR, ADAPTAR ou EVITAR

Este documento é um **manual prático**: cada estratégia vem com verdict para o KEYRA.

---

## Legenda

- 🟢 **REPLICAR** — estratégia vencedora, adotar sem hesitar
- 🟡 **ADAPTAR** — ideia boa, aplicar com tweak vertical
- 🔴 **EVITAR** — estratégia contraindicada para o KEYRA

---

## 1. Estratégias de Produto

### 1.1 🟢 Dois apps mobile distintos (dono vs profissional)
**Trinks faz:** `com.trinks.pro` (executor) e `com.trinks.m` (consumidor). Fluxos radicalmente diferentes.
**Aplicação KEYRA:** Ter app do **dono/gestor** separado de app do **profissional executor** desde o início. A dona vê caixa e metas; o profissional vê agenda e comissão acumulada.

### 1.2 🟢 Multi-tenancy desde dia 1
**Trinks faz:** `estabelecimento_id` em todas as tabelas.
**Aplicação KEYRA:** Supabase com **RLS nativo** — cada clínica isolada por policy de banco (superior ao row-level manual do Trinks).

### 1.3 🟢 NFe como módulo interno
**Trinks faz:** Emite NFS-e, NFC-e e Profissional-Parceiro internamente.
**Aplicação KEYRA:** **Não terceirizar** NFe — é complexo, mas terceirização causou NFe duplicada no Trinks (queixa RA recorrente). Integrar com gateways tipo Focus NFe ou emitir direto via API do Estado.

### 1.4 🟢 Rotinas WhatsApp como cidadão de primeira ordem
**Trinks faz:** Confirmação, lembrete, aniversário, reativação, NPS — tudo automatizado via Meta Cloud API.
**Aplicação KEYRA:** Integração WhatsApp Cloud API oficial desde MVP. Templates pré-aprovados para estética.

### 1.5 🟡 Clube de Assinaturas
**Trinks faz:** Recorrência mensal com split Stone (case Nine Barbearia triplicou faturamento).
**Aplicação KEYRA:** **Adaptar para protocolos de estética** (pacote de 10 drenagens em 6 meses) com rastreamento de sessão, não só cobrança recorrente. Incluir análise de margem por sessão (feature única).

### 1.6 🟢 Pacotes pré-pagos
**Trinks faz:** Cliente compra pacote, consome em sessões.
**Aplicação KEYRA:** Feature obrigatória + valor agregado: **análise de margem por sessão** (*"este pacote dá R$ 45 de margem por sessão após comissão e insumos"*).

### 1.7 🟢 Mapa de calor
**Trinks faz:** Visualização de horários de pico e serviços mais procurados.
**Aplicação KEYRA:** Replicar como feature simples — mas com **números absolutos na tela** (não só heatmap colorido): *"Quarta-feira 14h tem 87% de ocupação. Segunda 10h tem 12%."*

### 1.8 🟡 Ficha de Anamnese
**Trinks faz:** Formulário personalizado para clínicas de estética.
**Aplicação KEYRA:** Replicar + **adicionar foto antes/depois** com privacidade controlada + assinatura digital de termo de consentimento. Compliance LGPD é diferencial.

### 1.9 🔴 130+ relatórios
**Trinks faz:** "Mais de 130 tipos de relatórios personalizados".
**Aplicação KEYRA:** **Evitar**. A idealizadora pediu tela única, números absolutos, zero gráfico. KEYRA faz ≤10 relatórios, todos profundos e acionáveis, em tela única por tópico.

### 1.10 🔴 Mobile pesado (Ionic/WebView)
**Trinks faz:** APK 80-87MB, reviews reclamam de lentidão.
**Aplicação KEYRA:** **PWA-first < 10MB** ou React Native enxuto < 30MB. Zero WebView.

---

## 2. Estratégias de Posicionamento

### 2.1 🟢 Ancoragem de prova social numérica
**Trinks faz:** "+44 mil negócios", "+460 milhões de agendamentos", "+13 anos" — em todas as páginas.
**Aplicação KEYRA:** Começar com prova individual (*"a clínica da Mariana sobrou R$ 4.200 a mais"*). Evoluir para números agregados à medida que a base cresce.

### 2.2 🟢 Depoimentos com nome + estabelecimento
**Trinks faz:** 10 cases reais reciclados.
**Aplicação KEYRA:** Obter 3-5 cases-alpha desde dia 1 com números-resultado. Formato: *"Mariana, Clínica Velvet (São Paulo): 'descobri que meu pacote de drenagem estava com margem de 9%. Mudei o preço e hoje sobra R$ 3.400/mês a mais.'"*

### 2.3 🟢 Hub de segmentação (5 verticais)
**Trinks faz:** Landing por vertical, mesmo core de produto.
**Aplicação KEYRA:** **Inverso**: uma única vertical (estética) com sub-personas (solo, clínica, studio, rede) — cada uma com landing dedicada.

### 2.4 🟡 Copy informal acolhedor
**Trinks faz:** "Bora dar um up", "dá um up", "sonhos em sucesso".
**Aplicação KEYRA:** **Rejeitar tom motivacional**. Tom KEYRA: consultivo-técnico mas humano. Ex: *"Veja o número. Decida sabendo."*

### 2.5 🔴 Misturar narrativa horizontal
**Trinks faz:** "Salão OU barbearia OU clínica OU studio" no mesmo copy.
**Aplicação KEYRA:** Manter narrativa ultra-focada em **clínica de estética**. Sub-targets são nuances dentro desse nicho.

### 2.6 🟢 Marketplace reverso (B2C → B2B)
**Trinks faz:** trinks.com B2C gera leads para negocios.trinks.com B2B.
**Aplicação KEYRA:** **Não abrir marketplace** (superfície demais). Mas pode ter **diretório público de clínicas KEYRA-certified** como SEO asset — clientes buscam "clínicas de estética com atendimento 5 estrelas" e caem em clientes KEYRA.

---

## 3. Estratégias Comerciais

### 3.1 🔴 Trial de 5 dias
**Trinks faz:** 5 dias grátis — curto demais.
**Aplicação KEYRA:** **30 dias grátis** (paridade AgendaPro / Simples Agenda) ou mais. Trial curto não permite ver um ciclo financeiro mensal completo — que é o momento âncora de conversão da KEYRA.

### 3.2 🟡 Preço por faixa de profissionais
**Trinks faz:** 5 faixas (1-2, 3-4, 5-10, 11-20, 21+).
**Aplicação KEYRA:** **Adaptar** para 4 faixas mais limpas, todas com **preço público**: Solo, Clinic, Studio, Rede. Transparência total.

### 3.3 🔴 Ocultar preço de 3+ profissionais
**Trinks faz:** "sob consulta" — fricção no funil.
**Aplicação KEYRA:** **Todo preço público**. Cálculo transparente. Criador de pacote com preços somados ao vivo na página.

### 3.4 🔴 Multa de fidelidade percebida como abusiva
**Trinks faz:** 50% das parcelas restantes (percebida como 80%).
**Aplicação KEYRA:** **Zero fidelidade** — contrato mensal ou anual (com desconto óbvio) sem multa na saída. Virar argumento de marketing.

### 3.5 🟢 Onboarding personalizado incluso
**Trinks faz:** Onboarding + migração assistida no preço base.
**Aplicação KEYRA:** Replicar — onboarding de 60-90min com setup vertical de estética pré-configurado + importação automática de sistema anterior (Trinks, Belasis, Excel).

### 3.6 🟢 Cupom de 1ª mensalidade
**Trinks faz:** Cupom "30 dias grátis + 50% off 1ª mensalidade" via parceiros (Revista Fórum, etc).
**Aplicação KEYRA:** Replicar com afiliados estratégicos (Sebrae, influenciadores de gestão, contadores especializados).

### 3.7 🟡 Beauty Fair como canal
**Trinks faz:** Patrocinadora recorrente.
**Aplicação KEYRA:** Presença sim, mas como **palestrante de financeiro**, não como expositor de SaaS — diferencia no posicionamento.

### 3.8 🟢 Parceria Sebrae
**Trinks faz:** Co-presença em eventos de empreendedorismo.
**Aplicação KEYRA:** Replicar — Sebrae tem sede em conteúdo de gestão financeira para pequeno empreendedor.

### 3.9 🟢 Customer Success humanizado
**Trinks faz:** Suporte humano + comunidade + masterclass semanal.
**Aplicação KEYRA:** Replicar — suporte humano desde MVP, não escalar com bots. Diferencial: CS com background de CFO, não só técnico.

### 3.10 🟡 Cross-sell ecossistema
**Trinks faz:** SaaS → Belezinha → Conta Digital → Crédito Stone.
**Aplicação KEYRA:** Replicar logic mas com parcerias: KEYRA SaaS → parceiro adquirente preferido (com spread melhor) → parceiro contabilidade → crédito alternativo. **Sem lock-in** — sempre opcional.

---

## 4. Estratégias Técnicas

### 4.1 🟢 API pública com documentação em readme.io
**Trinks faz:** trinks.readme.io com docs claras, X-Api-Key, versioning /v1.
**Aplicação KEYRA:** Replicar (stoplight.io, mintlify.com ou readme.io). Diferencial: docs com **exemplos em português** e receitas específicas para integrações com contadores.

### 4.2 🟢 Multi-tenant por tenant_id com isolamento
**Trinks faz:** `estabelecimento_id` em todas as tabelas.
**Aplicação KEYRA:** Usar **RLS nativo do Postgres** (Supabase) — policies automáticas garantem isolamento sem lógica manual no código.

### 4.3 🟢 Integrações Google/Meta nativas
**Trinks faz:** Google Reserve, Instagram/Facebook booking.
**Aplicação KEYRA:** Paridade obrigatória — integrar cedo para não perder aquisição orgânica.

### 4.4 🟢 WhatsApp Cloud API oficial (Meta BSP)
**Trinks faz:** BSP Meta oficial (não terceirizado).
**Aplicação KEYRA:** Integrar direto com WhatsApp Cloud API da Meta — sem intermediários (Twilio, Zenvia) no MVP para reduzir custo.

### 4.5 🔴 Monólito com legado misto
**Trinks faz:** Web Forms + MVC + .NET Core coexistindo.
**Aplicação KEYRA:** Greenfield puro — Next.js 16 + Supabase. Zero dívida de dia 1.

### 4.6 🔴 CDN + CMS separado do produto
**Trinks faz:** WordPress no marketing, .NET no produto — dois times.
**Aplicação KEYRA:** Consolidar em Next.js 16 (marketing + produto no mesmo domínio, com sub-paths). Uma única stack, um único deploy.

### 4.7 🟡 Webhooks via AWS SNS
**Trinks faz:** Outbound via SNS com SubscribeURL.
**Aplicação KEYRA:** **Adaptar** — usar **Supabase Realtime (WebSocket)** para live updates internos + webhooks HTTP clássicos para integrações externas. Real-time nativo é superior.

### 4.8 🔴 Paginação 50 items/page
**Trinks faz:** Limit fixo de 50 items/page.
**Aplicação KEYRA:** Paginação cursor-based com limit configurável (default 100, max 500).

### 4.9 🟢 Emissão NFe local + fallback
**Trinks faz:** NFe interna mas com bugs (duplicação).
**Aplicação KEYRA:** NFe interna com **retry idempotente** + **lock transacional** para prevenir duplicação. Aprender com a dor do Trinks.

---

## 5. Estratégias de Conteúdo & SEO

### 5.1 🟢 Blog como SEO asset central
**Trinks faz:** blog.trinks.com com 10+ anos de conteúdo.
**Aplicação KEYRA:** Blog desde dia 1, mas **ultra-vertical** (só clínica de estética, só financeiro) — 100 posts profundos > 1000 posts genéricos.

### 5.2 🟢 Comunidade de empreendedores
**Trinks faz:** Comunidade declarada como feature.
**Aplicação KEYRA:** Comunidade Telegram/Discord de **donas de clínica de estética** com peer learning em finanças. Reduz churn.

### 5.3 🟢 PR em veículos SMB
**Trinks faz:** Menções em Pequenas Empresas & Grandes Negócios, Estadão.
**Aplicação KEYRA:** Pitch para Revista Beleza (popular), Beauty Fair Magazine, PE&GN — ângulo "CFO para estética".

### 5.4 🟡 Trinks de Vantagens (clube de desconto)
**Trinks faz:** Clube com parceiros — retention lever.
**Aplicação KEYRA:** **Adaptar** — clube de benefícios com parceiros verticais (fornecedores de dermocosméticos, contadores especializados, consultores de marketing para estética).

---

## 6. Estratégias Anti-Trinks (diferenciação pura)

Estratégias **opostas** ao Trinks, usadas como argumento de marca:

### 6.1 🟢 "Tela única, números absolutos, zero gráfico"
**Manifesto KEYRA versus Trinks's 130 relatórios**.

### 6.2 🟢 "Preço público e contrato sem multa"
**Contra** opacidade + fidelidade do Trinks.

### 6.3 🟢 "Precificação que o Trinks não faz"
**Ataque direto** ao maior gap universal do mercado.

### 6.4 🟢 "CFO técnico, não parceira motivacional"
**Frame** narrativo que isola o KEYRA.

### 6.5 🟢 "Vertical estética pura"
**Contra** a horizontalidade Trinks de 5 segmentos.

### 6.6 🟢 "Multi-adquirente, sem lock-in Stone"
**Contra** dependência do ecossistema Stone.

### 6.7 🟢 "Pró-labore explícito, PF/PJ separados"
**Contra** o tabu narrativo do Trinks.

---

## 7. Síntese — Scorecard final

| Categoria | REPLICAR | ADAPTAR | EVITAR |
|-----------|----------|---------|--------|
| Produto | 6 | 3 | 2 |
| Posicionamento | 3 | 1 | 2 |
| Comercial | 4 | 2 | 3 |
| Técnica | 4 | 1 | 4 |
| Conteúdo | 3 | 1 | — |
| **Total** | **20** | **8** | **11** |

**Leitura:** Trinks fez ~**51% das coisas certas** para replicar diretamente — é um player maduro com lições reais. **~21% exigem adaptação vertical** (estética, não salão). **~28% devem ser ativamente evitadas** como diferenciadores anti-Trinks.

O KEYRA não precisa reinventar a roda — precisa **reusar o que funciona + atacar cirurgicamente os gaps**.

---

## 8. Fontes

Todos os dados neste catálogo derivam dos 6 documentos de coleta em `02-data-collection/` — consulte-os para detalhes específicos e evidências.
