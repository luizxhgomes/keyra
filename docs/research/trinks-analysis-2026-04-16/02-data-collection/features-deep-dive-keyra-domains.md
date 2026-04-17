# Trinks — Deep Dive em domínios KEYRA

**Data da coleta:** 2026-04-16
**Analista:** Alex (research mode)
**Escopo:** As 5 dores centrais do KEYRA (Agenda, Financeiro, Precificação, Estoque, Metas&Comissões)
**Fontes primárias:** trinks.com, negocios.trinks.com, ajuda.trinks.com, blog.trinks.com, reclameaqui.com.br/empresa/trinks, App Store (Trinks Profissional), Capterra, Google Play
**Metodologia:** WebFetch + WebSearch com queries temáticas. Páginas com redirect para imagem (agenda/, financeiro/, estoque/, comanda/) foram complementadas via Help Center textual e página Solutions.

> **Nota sobre limitações:** As URLs `negocios.trinks.com/{agenda,financeiro,estoque,comanda}/` redirecionam (301) para arquivos `.png` estáticos — confirmando que o Trinks comunica features via imagens/screenshots, não via texto rico indexável. Todo conteúdo textual foi obtido do Help Center (`ajuda.trinks.com`), do Blog e de reviews/reclamações. Itens marcados **[INFERÊNCIA]** não têm fonte textual direta; o restante tem URL citada.

---

## 1. AGENDA

### 1.1 Features mapeadas

| Feature | Evidência | Fonte |
|---------|-----------|-------|
| Agenda online (cliente auto-agenda) | "Trinks permite que seus clientes escolham seus próprios horários com autonomia" | `trinks.com/programa-para-salao/agenda-online` |
| Confirmação automática / ativar-desativar | "Você pode decidir se ativa o agendamento online... ou configura para que seja uma solicitação aguardando sua confirmação" | `ajuda.trinks.com/agendamento-online` |
| Integração Google / Instagram / Facebook | Listada na home negocios.trinks.com | `negocios.trinks.com/` |
| Intervalo de visualização 30min (padrão) ou 15min | "os horários exibidos na agenda são divididos em intervalos de 30 minutos. Porém, é possível ajustar essa visualização para 15 minutos" | Help Center |
| Rotinas de WhatsApp (confirmações, lembretes, aniversário, reativação, pesquisa) | "automatiza o envio de confirmações, lembretes, convites de retorno, mensagens de aniversário e pesquisas de satisfação" | Help Center |
| Lembretes automáticos (redução de no-show) | "o sistema envia lembretes automáticos para reduzir faltas" | Home |
| Filtro por dia / profissional | "pode acompanhar o status dos atendimentos por profissional, filtrando por dia e horário" | Help Center |
| Cadastro em balcão + agenda híbrida | "todos os agendamentos... online ou feitos no balcão" | Help Center |
| Status de atendimento | Mencionado no Help Center | Help Center |

### 1.2 UI/UX observados (via imagens estáticas e screenshots do blog)

- Visão tipo "calendário clássico" com colunas por profissional.
- Cores por status (confirmado / aguardando / cancelado).
- App "Trinks Profissional" separado para os prestadores (iOS + Android).
- Portal do cliente final em `trinks.com/{cidade}` (SEO local forte).

### 1.3 Gaps detectados

1. **Sem menção explícita a "lista de espera"** (waiting list quando cliente quer horário ocupado) — ausente no Help Center listado. **[INFERÊNCIA: não existe ou é muito limitado]**.
2. **Sem "sinal/caução" nativo** para agendamento online (pré-pagamento para evitar no-show). Reviews de concorrentes mencionam — Trinks não apareceu em nenhuma busca.
3. **Sem agendamento recorrente** (ex.: "toda 2ª 4ª semana, terça às 14h") — nenhuma fonte confirma. **[INFERÊNCIA]**.
4. **Agenda não multi-recurso** (ex.: profissional + sala + equipamento). Apenas por profissional.
5. **Granularidade mínima de 15min** — para clínicas de estética com procedimentos de 10min (limpeza rápida, aplicação laser) é **inflexível**.
6. **Sem Pix split / pagamento no ato do agendamento online** (só via máquina Stone integrada depois).

### 1.4 Reviews — elogios

- "conveniência do agendamento de serviços" e "versatilidade do aplicativo" (Capterra Portugal).
- Usabilidade cotidiana do agendamento reconhecida nas avaliações positivas.

### 1.5 Reviews — reclamações

- **"Problemas recorrentes no agendamento online e cadastro"** (RA, URL dedicada) — título literal.
- **"Após finalizar um agendamento, a tela volta para login como se o agendamento não tivesse sido feito, exigindo várias tentativas"** (RA, 2025).
- **"SISTEMA FORA DO AR E SEM SUPORTE"** (RA, abril/2025) — "o sistema ficou fora do ar no sábado, deixando estúdios sem acesso aos clientes agendados".
- **"Marcação"** (RA, título) — relato de falha em reserva.

### 1.6 Benchmarks de concorrentes

| Concorrente | Diferencial em agenda |
|-------------|----------------------|
| **Booksy** (internacional, entrando no BR) | Lista de espera nativa + reengajamento automático quando vaga abre |
| **Belle Software** | Lembretes SMS + email + agenda multi-unidade |
| **Fresha** (global) | Pré-pagamento/cartão obrigatório no booking online (zero no-show) |

### 1.7 Oportunidade KEYRA

- **Agenda mínima útil** com foco em **duração variável de procedimento** (5, 10, 15, 20, 30min — clínica de estética tem protocolo curto).
- **Pré-pagamento via Pix** embutido no agendamento online (reduz no-show sem cartão).
- **Lista de espera automática** com notificação instantânea quando cliente cancela.
- **Visão "números absolutos" do dia** — quantos clientes hoje, quanto de faturamento projetado, quantos no-shows na semana — em **tela única, sem gráfico** (alinha com exigência da idealizadora).

---

## 2. FINANCEIRO

### 2.1 Features mapeadas

| Feature | Evidência | Fonte |
|---------|-----------|-------|
| Fluxo de caixa | "controle de fluxo de caixa" | home negocios.trinks.com |
| Contas a pagar / Despesas | "Financeiro > Despesas/Contas a Pagar" | Help Center `acessando-a-funcionalidade-de-lancamentos` |
| Tipos de despesa customizáveis | "pode criar novos tipos de despesas relacionadas aos profissionais, com flexibilidade para definir se cada uma adiciona ou subtrai" | Help Center |
| DRE (Demonstrativo de Resultados) | "Na DRE do Trinks, você encontra todas as suas receitas e despesas, separadas por categorias... Relatórios > Demonstrativo de Resultado" | `ajuda.trinks.com/demonstrativo-de-resultado` + blog |
| 130+ relatórios | "mais de 130 tipos de relatórios personalizados" | home |
| Conta digital Stone integrada | "Conta digital... Grupo Stone" | home |
| Máquina Stone (Belezinha) + split | "Split de pagamentos", "máquina de cartão integrada" | home |
| Fluxo financeiro por forma de pagamento | `ajuda.trinks.com/fluxo-financeiro-por-forma-de-pagamento` | Help Center |
| Fechamento de conta (comanda → caixa) | "fechamento de caixa" | Help Center |

### 2.2 UI/UX observados

- Menu: Financeiro > Despesas/Contas a Pagar / Relatórios > Demonstrativo de Resultado.
- Integração profunda com Stone (conta digital + maquininha).
- Dashboards numéricos (via screenshots) com vários relatórios em tabelas.

### 2.3 Gaps detectados

1. **Conciliação bancária automática: AUSENTE**. Nenhuma página do Help Center menciona "conciliação bancária" ou importação OFX/extrato. Conta Stone é a única "fonte" financeira nativa — quem usa outro banco fica manual.
2. **Conciliação de adquirente (maquininha x extrato): AUSENTE**. Usuários reclamam de "Problemas com antecipação de recebíveis e split de pagamentos" (RA título literal).
3. **Contas a receber robustas (fiado, crediário): LIMITADAS**. Existe fechamento de conta mas não há módulo de "cobrança recorrente/boleto avulso".
4. **Pagamento de fornecedor via Trinks: BLOQUEADO**. Help Center FAQ: *"a Conta Digital Trinks atualmente permite apenas pagamento para profissionais. Outros pagamentos como fornecedores devem ser feitos via app Stone"*. **Gap operacional real.**
5. **Multi-moeda / multi-banco: AUSENTE** — single-account mindset.
6. **Centro de custo / projeto / unidade no DRE: NÃO CONFIRMADO**. DRE separa por categorias, não por profissional/sala/unidade na fonte pública.

### 2.4 Reviews — elogios

- DRE elogiado no próprio blog como "raio-X do negócio" (self-marketing).
- Integração Stone é vista como diferencial por quem já usa maquininha Stone.

### 2.5 Reviews — reclamações

- **"Problemas com antecipação de recebíveis e split de pagamentos no sistema Trinks"** — RA título literal.
- **"Problemas na cobrança ao cliente - maquina x sistema trinks"** — RA título literal: conflito maquininha x software.
- **"Usuários reportaram emissão de notas fiscais duplicadas por falhas de integração, gerando cobranças tributárias indevidas"** (RA, síntese 2025).
- **"executar cobranças com o sistema agora submetendo um caminho muito longo e não fechando automaticamente"** (RA, 2025 — fluxo ficou mais burocrático após update).
- **"O sistema não é confiável e ACABOU com o meu negócio!!"** (RA título literal).

### 2.6 Benchmarks de concorrentes

| Concorrente | Diferencial financeiro |
|-------------|----------------------|
| **Conta Azul / Omie** (ERP geral) | Conciliação bancária via Open Finance, DRE com centros de custo, contas a pagar/receber completas |
| **Kamino / Gestek** (fintechs verticais) | Conciliação de adquirente automática (maquininha x extrato), antecipação self-service |
| **Clinicorp** (clínicas) | DRE por procedimento + custo direto do insumo |

### 2.7 Oportunidade KEYRA

- **Conciliação de adquirente como feature #1** (Stone, Cielo, PagSeguro, SumUp, InfinitePay) — dor #1 do Trinks segundo RA.
- **DRE simplificado "uma tela só"** com números absolutos: receita, custo direto, custo fixo, lucro — sem gráficos (regra da idealizadora).
- **Pagamento de fornecedor via Pix direto no app** — resolve gap assumido do Trinks.
- **Fechamento automático do dia** sem "caminho muito longo" (queixa RA).
- **Contas a receber com link Pix** sem depender de maquininha específica.

---

## 3. PRECIFICAÇÃO

### 3.1 Features mapeadas

**⚠️ CONFIRMADO: O TRINKS NÃO TEM MÓDULO DE PRECIFICAÇÃO NATIVO.**

- Busca "Trinks precificação markup custo serviço" retornou **zero páginas do Trinks** como primary source. Apenas artigos de blog genéricos (Cora, Agendor, Sebrae) + link para `ajuda.trinks.com/comissao` (comissão, não precificação).
- O único "custo" mencionado pelo Trinks no Help Center de Comissão: *"você pode definir como o custo operacional do serviço deve ser considerado no cálculo da comissão"* — ou seja, custo serve **apenas para descontar comissão**, não para calcular preço de venda.
- Blog do Trinks até tem artigos genéricos ("como calcular comissão", "como precificar"), mas são **tutoriais educativos, não features do produto**.

### 3.2 UI/UX observados

- Cadastro de serviço: nome, duração, preço único digitado manualmente (inferência via `ajuda.trinks.com/como-cadastrar-servicos`).
- Sem calculadora de markup.
- Sem simulador "este preço dá lucro?".
- Sem campo "custo direto estimado por atendimento".

### 3.3 Gaps detectados (TODOS)

1. **Sem calculadora de markup.**
2. **Sem vínculo custo do insumo (ficha técnica) → preço sugerido de venda.**
3. **Sem margem alvo configurável** ("quero 60% de margem neste serviço").
4. **Sem simulação "se eu baixar 10% o preço, quanto cai meu lucro?".**
5. **Sem benchmarking regional** (quanto outros salões da cidade cobram pelo mesmo serviço).
6. **Precificação dinâmica / premium hours: AUSENTE.**

### 3.4 Reviews — elogios

Nenhum elogio encontrado sobre precificação — **o módulo não existe para ser elogiado**.

### 3.5 Reviews — reclamações

Nenhuma reclamação específica — usuários **não esperam** esse feature do Trinks (não está prometido).

### 3.6 Benchmarks de concorrentes

| Concorrente | Precificação |
|-------------|-------------|
| **Clinicorp** | Artigos + relatório "lucro por procedimento" (custos do insumo considerados) — há módulo de rentabilidade |
| **Gestek / Kamino** | Ferramentas de precificação para prestadores de serviço com base em custo + markup |
| **MarketUP** | Calculadora de markup grátis online (referenciada nas buscas) |
| **Vollo (estética)** | **[INFERÊNCIA]** precificação por procedimento com custo de insumo |

### 3.7 Oportunidade KEYRA — **ESTE É O MAIOR GAP**

- **"Preço inteligente"** em tela única: *"Serviço: limpeza de pele — custo direto R$ 18 | meu preço R$ 120 | margem 85%"*.
- **Simulador**: "se eu atender 20 pessoas/mês a R$ 120 vs 30 pessoas a R$ 99, qual cenário dá mais lucro?" — número absoluto, sem gráfico.
- **Vínculo ficha técnica → custo → preço sugerido**: ao cadastrar serviço, você já vê o custo direto dos insumos e o markup gera preço sugerido.
- **Alerta de margem baixa**: *"Atenção: você cadastrou drenagem a R$ 80 mas o custo direto é R$ 65. Margem 18%."*.
- **Precificação diferenciada por dia/horário** (sábado +15%, segunda vazia -10%).

---

## 4. ESTOQUE

### 4.1 Features mapeadas

| Feature | Evidência | Fonte |
|---------|-----------|-------|
| Controle de estoque + alerta de reposição | "registrar entradas e saídas de produtos, criar alertas de reposição e acompanhar o valor total do estoque em tempo real" | home negocios.trinks.com |
| Movimentação de estoque | "Meu Estabelecimento > Produtos > Movimentação de estoque" | `ajuda.trinks.com/movimentacao-de-estoque` |
| Baixa automática (por serviço) | "editar baixa automática do estoque" (título de artigo) + "os insumos utilizados são automaticamente descontados do estoque" | `ajuda.trinks.com/como-editar-baixa-automática-do-estoque-...` |
| Ficha técnica (rastreamento produtos-serviço) | "com essa funcionalidade você consegue conferir os produtos que foram usados na execução dos serviços" | Help Center |
| Permissão restrita a admin | "Apenas usuários com acesso de perfil Administrador podem registrar entradas e saídas" | Help Center |
| Cadastro de produto (revenda + uso interno) | "cadastrar todos os produtos que utiliza para serviços internos ou revenda" | Help Center |

### 4.2 UI/UX observados

- Menu: Meu Estabelecimento > Produtos > Movimentação de Estoque.
- Dois modos de saída: movimentação manual (uso interno por cliente) + baixa automática (vinculada ao fechamento de serviço).
- Controle de valor total do estoque (inventário valorizado).

### 4.3 Gaps detectados

1. **Sem múltiplos fornecedores por produto** — cadastro simples de produto sem fornecedor estruturado confirmado.
2. **Sem validade/lote** — crítico para clínicas de estética (ampolas, ácidos, produtos perecíveis). Nenhuma menção em fonte pública.
3. **Sem código de barras / leitura mobile** — não mencionado.
4. **Sem inventário físico guiado** (contagem cíclica com divergência calculada) — não há artigo no Help Center encontrado.
5. **Ficha técnica = "rastreamento de uso"**, não é "receita configurável" (tipo "limpeza de pele usa: 2ml do produto X, 1ml do produto Y"). **Nuance crítica**. O que o Trinks chama de ficha técnica é mais um log de baixa, não uma BOM (bill of materials) editável.
6. **Sem integração com ERP/fornecedor** (ex.: compra automática quando atinge mínimo).

### 4.4 Reviews — elogios

Poucos elogios específicos ao estoque encontrados. A existência de baixa automática é vista como diferencial vs planilhas.

### 4.5 Reviews — reclamações

Reclamações específicas de estoque não apareceram top-of-mind em RA (maioria é financeiro/agenda/suporte). **[INFERÊNCIA: estoque é suficientemente básico para não gerar dor aguda, mas tampouco entusiasma]**.

### 4.6 Benchmarks de concorrentes

| Concorrente | Diferencial estoque |
|-------------|----------------------|
| **Vollo / Clinicorp** | Ficha técnica configurável por procedimento (BOM real) + controle de validade/lote |
| **MarketUP** | Integração com fornecedores e cotação |
| **Gestek** | Código de barras + inventário cíclico |

### 4.7 Oportunidade KEYRA

- **Ficha técnica real = BOM editável**: para cada serviço, o usuário define "insumos consumidos por atendimento" (produto X: 2ml, produto Y: 1un). Baixa automática é derivada.
- **Validade e lote** (crítico para estética profissional e compliance Anvisa).
- **Alerta antes de abrir produto novo**: "ainda há 30ml do lote A, use antes de abrir o lote B".
- **Custo médio ponderado** (move average cost) para insumo, alimentando a **Precificação** (#3) de forma automática.
- **Inventário em 1 tela, números absolutos**: "Você tem R$ 3.840 em estoque. 4 produtos abaixo do mínimo."

---

## 5. METAS & COMISSÕES

### 5.1 Features mapeadas

| Feature | Evidência | Fonte |
|---------|-----------|-------|
| Cálculo de comissão (% por profissional) | "comissão registrada para o profissional... valor calculado" | `ajuda.trinks.com/comissao` |
| Comissão por serviço, produto, pacote | "todas as vendas de produto, serviços e pacotes, consumos de pacote, bonificações e descontos" | Help Center |
| Comissionamento de pacote | Página dedicada | `ajuda.trinks.com/comissionamento-de-pacotes` |
| Recálculo de comissão | Página dedicada | `ajuda.trinks.com/recalculo-de-comissao` |
| Bonificação (meta atingida → comissão extra) | "bonificações adicionais se o profissional exceder uma meta de vendas, com comissão extra sobre o total" | `ajuda.trinks.com/acessando-a-funcionalidade-bonifica%C3%A7%C3%A3o-e-vale/adiantamento` |
| Vale / adiantamento | Página dedicada | Help Center |
| Fechamento mensal | `ajuda.trinks.com/fechamento-mensal` | Help Center |
| Custo operacional descontado da comissão | "você pode definir como o custo operacional do serviço deve ser considerado no cálculo da comissão" | Help Center |
| Rankings de profissionais | "Com o ranking você consegue visualizar os profissionais que mais realizaram serviços... classificados conforme o maior retorno de clientes e o maior número de novos clientes" | `ajuda.trinks.com/rankings` |
| Relatório por profissional + geral | "relatórios de comissão completos (Serviços e Produtos) para todos os profissionais ou individual" | Help Center |

### 5.2 UI/UX observados

- Cálculo roda via fechamento mensal (batch), não em tempo real.
- Ranking simples (não configurável para multi-critério segundo fontes públicas).
- Bonificação = linha adicional no fechamento, não tem "gamificação" (sem badges, sem tela para o profissional ver progresso em tempo real).

### 5.3 Gaps detectados

1. **Meta individual configurável (do tipo "Profissional X tem meta R$ 10k este mês"): LIMITADA**. Existe "exceder meta" para bonificação mas não achei tela própria de "definir metas SMART do profissional".
2. **Gamificação real: AUSENTE**. Sem badges, sem níveis, sem feed "você bateu 80% da meta". Ranking é estático.
3. **Meta de equipe / unidade: NÃO CONFIRMADO**. **[INFERÊNCIA: só individual]**.
4. **Dashboard do profissional em tempo real: LIMITADO** — "Trinks Profissional" app existe mas reviews reclamam de lentidão.
5. **Comissão escalonada complexa** (ex.: 40% até R$5k, 50% de R$5k a R$10k, 60% acima) — **[INFERÊNCIA: não há escala; é % fixo com bonificação acima da meta]**.
6. **Split com produto consumido no serviço**: considerado só como "custo operacional", sem split "profissional paga X% do insumo".

### 5.4 Reviews — elogios

- Automação do cálculo é reconhecida como poupador de tempo (blog Trinks, Capterra).
- Ranking de profissionais é mencionado positivamente em artigos.

### 5.5 Reviews — reclamações

- App Trinks Profissional: **"Horrível"**, **"trava abessa"**, **"atualizações deixaram o sistema mais lento"**, **"bug na entrada de dígitos que altera a ordem dos valores"** (App Store BR + Google Play).
- Dev respondeu que release 3.0.41 estabilizou.
- **"ficando sem acesso... gestão financeira para pagamentos de profissionais"** (RA 2025 — sistema fora do ar impediu pagamento).

### 5.6 Benchmarks de concorrentes

| Concorrente | Meta & Comissão |
|-------------|----------------|
| **Gorila Plan** (metas em salão) | Gamificação com ranking em tempo real + níveis |
| **Vollo** | Comissão escalonada + meta por equipe |
| **SalaoVIP / Belle** | Dashboard do profissional com progresso |

### 5.7 Oportunidade KEYRA

- **Meta em tela única, número absoluto**: "Profissional X: R$ 7.200 de R$ 10.000 (falta R$ 2.800)" — sem gráfico, alinhado com a regra da idealizadora.
- **Comissão escalonada** (3-4 faixas progressivas).
- **Meta de equipe + individual** com rateio.
- **Push notification de conquista** quando bater marcos (50%, 80%, 100%) — forma de gamificação **sem infantilizar**.
- **Cálculo em tempo real** (não batch mensal) — profissional vê comissão acumulada todo dia.
- **Transparência total do cálculo** — clique no valor mostra breakdown: "R$ 1.200 de serviços × 45% = R$ 540 — R$ 30 custo insumo = R$ 510".

---

## Síntese: Matriz comparativa

| Dor | Trinks cobre? | Profundidade (1-5) | Gap principal |
|-----|--------------|---------------------|----------------|
| 1. Agenda | **SIM** | **4** | Lista de espera, pré-pagamento Pix, recorrência, granularidade <15min |
| 2. Financeiro | **SIM (parcial)** | **3** | Conciliação bancária/adquirente automática, pagamento a fornecedor, centro de custo no DRE |
| 3. Precificação | **NÃO** | **0** | Módulo inexistente — calculadora markup, margem-alvo, vínculo ficha→preço |
| 4. Estoque | **SIM (básico)** | **3** | Ficha técnica = "log de uso", não BOM editável; sem validade/lote; sem código de barras |
| 5. Metas & Comissões | **SIM (parcial)** | **3** | Sem gamificação real, sem escalonamento, cálculo batch não tempo-real, app lento |

**Média geral de profundidade: 2.6 / 5** — Trinks é **amplo mas raso** no financeiro vertical. Forte em agenda e comissão básica; fraco em precificação (inexistente) e conciliação financeira.

---

## Top 10 Oportunidades KEYRA (priorizadas por impacto × gap Trinks)

| # | Oportunidade | Dor | Impacto | Gap Trinks |
|---|--------------|-----|---------|-----------|
| 1 | **Módulo Precificação inteligente** (custo insumo → markup → preço sugerido → simulador) | 3 | ALTO | INEXISTENTE |
| 2 | **Conciliação automática de adquirente** (Stone/Cielo/PagSeguro/SumUp/InfinitePay) | 2 | ALTO | AUSENTE |
| 3 | **Ficha técnica como BOM editável** (receita de insumo por serviço) + validade/lote | 4 | ALTO | LIMITADO |
| 4 | **DRE em tela única, número absoluto, sem gráfico** (alinha UX da idealizadora) | 2 | ALTO | DRE existe mas é "relatório clássico" |
| 5 | **Meta e comissão em tempo real + escalonadas + push de conquista** | 5 | MÉDIO-ALTO | Batch mensal + sem gamificação |
| 6 | **Pré-pagamento Pix no agendamento online** (zero no-show, sem maquininha obrigatória) | 1 | MÉDIO-ALTO | Só Stone integrada |
| 7 | **Lista de espera automática** com alerta quando vaga abre | 1 | MÉDIO | AUSENTE |
| 8 | **Pagamento a fornecedor dentro do app** (Pix/Boleto), sem depender de Stone externa | 2 | MÉDIO | BLOQUEADO no Trinks |
| 9 | **Agendamento recorrente** (protocolos de estética com 6–10 sessões em datas fixas) | 1 | MÉDIO | NÃO CONFIRMADO |
| 10 | **Fechamento de caixa em 1 clique + tela única "Hoje"** (números absolutos: faturei X, recebi Y, devo Z) | 2 | MÉDIO | Queixa RA: "caminho longo" |

---

## Apêndice: Fontes citadas

- https://negocios.trinks.com/ — home (2026-04-16)
- https://negocios.trinks.com/solucoes/ — solutions (2026-04-16)
- https://negocios.trinks.com/solucoes/simplificar-financas/ — financeiro (2026-04-16)
- https://ajuda.trinks.com/agenda — Help Center agenda
- https://ajuda.trinks.com/financeiro-e-vendas — Help Center financeiro
- https://ajuda.trinks.com/demonstrativo-de-resultado — DRE
- https://ajuda.trinks.com/fluxo-financeiro-por-forma-de-pagamento — fluxo por forma pagto
- https://ajuda.trinks.com/acessando-a-funcionalidade-de-lancamentos — contas a pagar
- https://ajuda.trinks.com/faq-conta-digital — gap pagamento fornecedor
- https://ajuda.trinks.com/movimentacao-de-estoque — estoque
- https://ajuda.trinks.com/como-editar-baixa-automática-do-estoque-central-de-ajuda-do-trinks — baixa automática
- https://ajuda.trinks.com/comissao — comissão
- https://ajuda.trinks.com/comissionamento-de-pacotes — pacotes
- https://ajuda.trinks.com/recalculo-de-comissao — recálculo
- https://ajuda.trinks.com/fechamento-mensal — fechamento
- https://ajuda.trinks.com/rankings — rankings
- https://ajuda.trinks.com/acessando-a-funcionalidade-bonifica%C3%A7%C3%A3o-e-vale/adiantamento — bonificação/vale
- https://ajuda.trinks.com/agendamento-online — agendamento online
- https://blog.trinks.com/dre-servicos-lucrativos-negocio-beleza/ — DRE blog
- https://blog.trinks.com/saiba-como-calcular-a-comissao-de-um-profissional-de-beleza/ — comissão blog
- https://www.trinks.com/programa-para-salao/agenda-online — landing agenda
- https://www.reclameaqui.com.br/empresa/trinks/ — perfil RA
- https://www.reclameaqui.com.br/empresa/trinks/lista-reclamacoes/ — lista reclamações
- https://www.reclameaqui.com.br/trinks/sistema-fora-do-ar-e-sem-suporte_8tRz1-DThUDCzOoF/ — RA título literal
- https://www.reclameaqui.com.br/trinks/problemas-com-antecipacao-de-recebiveis-e-split-de-pagamentos-no-sistema-trinks_RHDi94xo_z5c0Mwl/ — RA título literal
- https://www.reclameaqui.com.br/trinks/problemas-recorrentes-no-agendamento-online-e-cadastro_xW5wsoS83y5_F64E/ — RA título literal
- https://www.reclameaqui.com.br/trinks/problemas-na-cobranca-ao-cliente-maquina-x-sistema-trinks_hbciphNiMAiK4Arj/ — RA título literal
- https://apps.apple.com/br/app/trinks-profissional/id1514616279 — App Store Trinks Profissional
- https://play.google.com/store/apps/details?id=com.trinks.pro — Google Play Trinks Profissional
- https://www.capterra.pt/software/1030791/trinks — Capterra Portugal
- https://www.capterra.com.br/alternatives/1030791/trinks — Capterra alternativas
- https://www.clinicorp.com/post/como-fazer-precificacao-de-servicos — benchmark Clinicorp
- https://www.belasis.com.br/melhor-sistema-para-salao-de-beleza-brasil-2026-... — comparativo concorrentes
