# Trinks — Site Map & Content Inventory

> Coleta realizada em 2026-04-16 via WebFetch. Fonte: sites públicos `trinks.com`, `negocios.trinks.com`, `blog.trinks.com`, `ajuda.trinks.com`, `sistema.trinks.com` e lojas de aplicativos. Algumas URLs (blog, app stores, central de ajuda) retornaram bloqueio de permissão do WebFetch e estão marcadas como "não coletado diretamente" — porém descobertas via links internos.

---

## Visão Geral

**Posicionamento:** "Sistema de gestão para salões, barbearias, clínicas e muito mais!" — plataforma verticalizada para o ecossistema **beleza e bem-estar** no Brasil.

**Tagline institucional:** *"da correria da rotina ao controle da gestão a Trinks simplifica"* e *"Bora dar um up com a Trinks?"*.

**Proposta de valor central (home de negócios):** sistema completo (agenda + financeiro + comunicação + estoque + pagamentos) integrado verticalmente ao ecossistema **Stone** (adquirente desde 2021), oferecendo conta digital, maquininha própria (**Belezinha**) e split de pagamentos.

**Segmentos atendidos (5 verticais):**
1. Salões de Beleza
2. Barbearias
3. Clínicas de Estética
4. Studios (lash designer, nail designer, esmalteria, tatuagem, sobrancelha, depilação, micropigmentação, massoterapia)
5. Redes e Franquias

**Arquitetura de domínios (2 frentes):**
- `www.trinks.com` — **marketplace B2C**: cliente final busca e agenda serviços de beleza; login do estabelecimento.
- `negocios.trinks.com` — **SaaS B2B institucional**: captação de empreendedores, apresentação de features e planos.
- `sistema.trinks.com` — produto logado (Backoffice/área profissional).
- `blog.trinks.com` — conteúdo de marketing.
- `ajuda.trinks.com` — central de ajuda (não coletado diretamente).

**Números institucionais divulgados (abril/2026):**
- +13 anos no mercado (fundação 2012; origem em consultoria Perlink desde ~1982/2011)
- +44 mil negócios de beleza atendidos
- +5.500 cidades atendidas
- +7 milhões de usuários finais (clientes)
- +460 milhões de agendamentos acumulados
- +80 milhões de agendamentos em 2024 (página "quem somos")
- 1.600 profissionais capacitados
- Aquisição: **Stone** (2021); selo **Endeavor Scale-Up**

---

## Taxonomia do Site

```
trinks.com (B2C — marketplace)
└── /Login-Estabelecimento
└── /programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais
└── /AreaProfissional/MinhaAgenda
└── /Backoffice

negocios.trinks.com (B2B — institucional)
├── / (home institucional)
├── /negocios/
│   ├── /negocios/saloes-de-beleza/
│   ├── /negocios/barbearias/
│   ├── /negocios/clinicas-de-estetica/
│   ├── /negocios/studios/
│   └── /negocios/redes-e-franquias/
├── /solucoes/
│   ├── /solucoes/o-essencial-para-o-seu-sucesso/
│   ├── /solucoes/simplificar-financas/
│   ├── /solucoes/comunicacao-para-ir-alem/
│   └── /solucoes/para-expandir-sem-limites/
├── /planos/
├── /quem-somos/
├── /contato/
├── /termos-de-uso/
└── /politica-de-privacidade/

sistema.trinks.com
├── /trinks-de-vantagens-2 (clube de benefícios)
└── /relatório-de-transparência-e-equidade-salarial

Outros:
├── blog.trinks.com
├── ajuda.trinks.com (inferido)
├── apps.apple.com/br/app/trinks-profissional/id1514616279
└── play.google.com/store/apps/details?id=com.trinks.pro
```

---

## Inventário de Páginas

### https://negocios.trinks.com/
- **Título H1:** "Sistema de gestão para salões, barbearias, clínicas e muito mais!"
- **Proposta/Promessa:** "da correria da rotina ao controle da gestão a Trinks simplifica"
- **Features/Benefícios listados:** Agenda online; Fechamento de contas; Controle de clientes e profissionais; Pesquisa de satisfação; Controle de agenda online; Cálculo e pagamento de comissões; Fluxo de caixa; App para profissionais; Clube de Assinaturas; Gestão de pacotes; Fichas de Anamnese; Controle de estoque; Soluções para captação de clientes; Split de pagamentos; Gestão centralizada de unidades; Relatórios consolidados; Fidelização de clientes; +130 tipos de relatórios personalizados; Seu site; E-mail Marketing e SMS; Rotina de mensagens via WhatsApp; Integração com Google e redes sociais; Autoatendimento; Conta digital; Relatórios financeiros; Máquina de cartão integrada; Belezinha.
- **CTAs (texto exato):** "TESTE GRÁTIS"; "teste grátis"; "Teste grátis por 5 dias"; "fale com a gente" (WhatsApp +55 21 99576-5208); "Acesse Trinks de Vantagens".
- **Depoimentos/Cases citados:** Rodrigo Guimarães (Club Men); Bruno Lotufo (Studio Lotufo); Jane Muniz (Spa das Sobrancelhas); Leonardo Benites (Confraria da Barba); Cleusa Valença (La Vie en Rose); Vania Urias (One Beaute); Carina Arruda (My Lash); Gustavo Andrade (Esmalteria Nacional); Marize Tolezano (Prya); Michel Melo (Fast Escova — diretor operacional).
- **Números/métricas exibidas:** +13 anos; +44 mil negócios; +5.500 cidades; +7 mi usuários; +460 mi agendamentos.
- **Links internos destaque:** menu completo de segmentos (/negocios/*), soluções (/solucoes/*), /planos/, /quem-somos/, /contato/, trinks.com.
- **Observações:** Home concentra todas as provas sociais e a oferta "Teste grátis 5 dias". Hub central — agrega todas as linhas.

---

### https://www.trinks.com/
- **Título H1:** "Encontre e **agende** serviços de **beleza e bem-estar**. A qualquer hora, de qualquer lugar."
- **Proposta/Promessa:** "Bora dar um up com a Trinks?" — marketplace B2C de busca e agendamento.
- **Features/Benefícios listados:** busca por serviço/cidade; agendamento 24/7; apps mobile (iOS/Android); programa "Quero indicar" (indicação de estabelecimento).
- **CTAs (texto exato):** "BUSCAR"; "Quero indicar"; "Teste grátis por 5 dias!"; "Cadastre seu Estabelecimento"; "Baixe o aplicativo do Trinks no Google Play"; "Baixe o aplicativo do Trinks na Apple Store".
- **Depoimentos/Cases citados:** não localizado (foco B2C).
- **Números/métricas exibidas:** não exibidos nesta home.
- **Links internos destaque:** /blog, /Login, /programa-para-salao-de-beleza, /Backoffice, /AreaProfissional/MinhaAgenda.
- **Observações:** Fronte B2C. Serve ao mesmo tempo como canal de aquisição de estabelecimentos (CTA cruzado "Cadastre seu Estabelecimento").

---

### https://negocios.trinks.com/negocios/clinicas-de-estetica/
- **Título H1:** "Sistema de gestão completo para a sua clínica de estética ir além"
- **Proposta/Promessa:** "Garanta o sucesso da sua clínica de estética com o melhor software para clínica de estética. Crie pacotes exclusivos, utilize fichas de Anamnese personalizadas, aproveite recursos para atrair clientes e muito mais."
- **Features/Benefícios listados:** Agendamentos recorrentes; Fichas de Anamnese personalizadas; Criação de pacotes estéticos (corporais e faciais); Otimização financeira (receitas, despesas, comissões); Controle de estoque com alertas de reposição de produtos estéticos; Emissão de notas fiscais; Relatórios financeiros detalhados; Mensagens automáticas (WhatsApp, SMS, e-mail); Mapa de calor para análise de fluxo; E-mail marketing; Agenda online; Relatórios de performance; histórico de tratamentos e preferências; automação de comissões.
- **CTAs (texto exato):** "TESTE GRÁTIS POR 5 DIAS"; "Teste grátis por 5 dias"; "TESTE GRÁTIS".
- **Depoimentos/Cases citados:** Marysol Almeida (Tevali Beauty Spa); Jane Muniz (Presidente Spa das Sobrancelhas).
- **Números/métricas exibidas:** "Mais de 40 mil negócios"; teste grátis 5 dias.
- **Links internos destaque:** /negocios/saloes-de-beleza/, /negocios/barbearias/, /negocios/studios/, /negocios/redes-e-franquias/, /planos/.
- **Observações:** Esta é a página-alvo para o concorrente direto do KEYRA. Diferenciais para clínicas: **Anamnese personalizada**, **pacotes**, **recorrência**, **mapa de calor**, **marketing**, **estoque de produtos estéticos**. O "financeiro" é tratado como item do pacote — não é núcleo.

---

### https://negocios.trinks.com/negocios/saloes-de-beleza/
- **Título H1:** "Os recursos que o seu salão de beleza precisa? Está tudo aqui"
- **Proposta/Promessa:** sistema completo para salão com agenda, financeiro, estoque, comissionamento e marketing.
- **Features/Benefícios listados:** Agenda online com autonomia para profissionais; controle financeiro com 130+ tipos de relatórios; automação de comissões e notas fiscais; gestão de clientes com histórico e preferências; controle de estoque com alertas; comunicação automatizada (SMS, WhatsApp, e-mail); integração com Conta Digital Stone e Belezinha; **mapa de calor** para horários de pico e serviços mais procurados.
- **CTAs (texto exato):** "TESTE GRÁTIS POR 5 DIAS"; "Teste grátis por 5 dias"; "Teste a Trinks antes de contratar".
- **Depoimentos/Cases citados:** Vania Urias (One Beauty) — "Mais que um software, a Trinks é uma parceira de resultados!"; Erica Cristina (Cortelândia).
- **Números/métricas exibidas:** não específicos.
- **Links internos destaque:** /planos/, cadastro.
- **Observações:** Copy quase idêntico ao das clínicas — diferencial sutil é o foco em "profissionais autônomos dentro do salão".

---

### https://negocios.trinks.com/negocios/barbearias/
- **Título H1:** "Escolha um sistema completo para gestão de barbearia"
- **Proposta/Promessa:** sistema completo para barbearia com foco em **Clube de Assinaturas** como diferencial.
- **Features/Benefícios listados:** Agenda online com fila de espera; App Trinks Professional para barbeiros; cálculo automático de comissões; Clube de Assinaturas (barbearia por assinatura); Emissão de Notas Fiscais; Controle de estoque; rotinas automáticas de marketing via WhatsApp; mensagens de aniversário; convites de retorno.
- **CTAs (texto exato):** "Teste grátis por 5 dias"; "TESTE GRÁTIS".
- **Depoimentos/Cases citados:** Lucas Caval (Caval Barber Shop); Magno Ferreira (Nine Barbearia) — "triplicamos nosso faturamento" via Clube de Assinaturas; Victor Bueno (Barbearia Bonanza); Rodrigo Guimarães (Club Men).
- **Números/métricas exibidas:** case "triplicamos faturamento" (Nine Barbearia).
- **Observações:** Segmento onde o **Clube de Assinaturas** é vendido como arma competitiva principal.

---

### https://negocios.trinks.com/negocios/studios/
- **Título H1:** "Soluções completas em gestão para studios de beleza e bem-estar"
- **Proposta/Promessa:** sistema para profissionais autônomos e studios especializados.
- **Features/Benefícios listados:** agendamentos recorrentes; criação de pacotes (manutenção de unhas, sobrancelhas, sessões de tatuagem); pagamentos de comissões via Belezinha com função Split; controle de estoque com alertas; relatórios detalhados.
- **Sub-segmentos citados:** lash designer, nail designer, tatuagem, sobrancelhas, depilação, micropigmentação, massoterapia.
- **CTAs (texto exato):** "TESTE GRÁTIS POR 5 DIAS"; "Teste grátis por 5 dias"; "Teste gratuito por 5 dias e ver como a Trinks pode transformar".
- **Depoimentos/Cases citados:** Lara Lisis (6 anos); Joice Moura (4+ anos); Leticia Oliveira; Carina Arruda (rede My Lash); Railla Stefany (3 anos).
- **Observações:** Copy genérico — diferenciação por lista de sub-segmentos.

---

### https://negocios.trinks.com/negocios/redes-e-franquias/
- **Título H1:** "Gestão otimizada para redes e franquias de negócios de beleza e bem-estar"
- **Proposta/Promessa:** **gestão centralizada** e **padronizada** para redes multi-unidade.
- **Features/Benefícios listados:** gestão centralizada com visão unificada; +130 relatórios integrados entre unidades; controle multi-unidade com transferência de estoque entre unidades; padronização de gestão.
- **Relatórios consolidados citados:** Faturamento, Produtividade, Estoque, Recorrência, Frequência de atendimento.
- **CTAs (texto exato):** "TESTE GRÁTIS POR 5 DIAS"; "Teste grátis por 5 dias"; "Você pode testar a plataforma para franquias da Trinks gratuitamente por 5 dias".
- **Depoimentos/Cases citados:** Gustavo Andrade (Esmalteria Nacional) — "visão detalhada do faturamento das unidades"; Marcos Molima (Dom Hélio) — "o único sistema que conheci que entende administração de empresas de verdade".
- **Observações:** Ponto de entrada para plano **Enterprise** / **Customizado**.

---

### https://negocios.trinks.com/solucoes/
- **Título H1:** "seu sistema de gestão completo"
- **Proposta/Promessa:** hub para as 4 grandes linhas de solução.
- **Features/Benefícios listados (atalhos):** Agenda online; Seu site; Controle financeiro; Pagamento de profissionais; Rotina de mensagens via WhatsApp; Clube de assinaturas; Programa de fidelidade; Belezinha; Controle de estoque; Emissão de notas fiscais.
- **4 pilares:** (1) Essencial, (2) Finanças, (3) Comunicação, (4) Expansão.
- **CTAs (texto exato):** "TESTE GRÁTIS"; "Já sou cliente"; "VER PLANOS"; "Saiba mais" (em cada solução).
- **Observações:** Página-índice estruturante da narrativa comercial.

---

### https://negocios.trinks.com/solucoes/o-essencial-para-o-seu-sucesso/
- **Título H1:** "O essencial para o seu sucesso"
- **Proposta/Promessa:** "Digitalize e automatize sua gestão".
- **Features/Benefícios listados:** Gestão de Agenda Online (autonomia para cliente escolher horário); Fechamento de Conta (histórico de serviços/produtos por cliente); Controle Financeiro (receitas, despesas, lucro em tempo real); Rotina de Mensagens WhatsApp (lembretes, confirmações, aniversários); Pesquisa de Satisfação. Recursos adicionais: antecipação de recebíveis, controle de estoque, autoatendimento, mapa de calor, integração Google/Instagram/Facebook, lembrete premium, Belezinha Stone, clube de assinatura.
- **CTAs:** "TESTE GRÁTIS POR 5 DIAS"; "Teste grátis por 5 dias"; "TESTE GRÁTIS"; FAQ "Posso testar a Trinks antes de contratar?".
- **Benefícios:** mais tempo para crescer; controle da agenda; otimização de tempo; fidelização; redução de confusões operacionais; visibilidade Google/redes; previsibilidade de receita.

---

### https://negocios.trinks.com/solucoes/simplificar-financas/
- **Título H1:** "Bora simplificar as finanças"
- **Features financeiras listadas:**
  - **Fluxo de Caixa:** entradas, saídas, fechamento de contas remoto.
  - **Belezinha Stone:** maquininha integrada.
  - **Link de Pagamentos Pagar.me:** links personalizados.
  - **Comissão de Profissionais:** divisão e pagamento automático via Split da Belezinha.
  - **Conta Digital Stone:** recebimento automático, repasses em lote, Pix.
  - **Fechamento de Conta:** diário integrado.
  - **Contas a Pagar e Receber.**
  - **Emissão de Notas Fiscais:** NFe de Serviços, Consumidor e Profissional-Parceiro.
  - **Relatórios Financeiros:** +130 tipos.
  - **Ticket Médio:** cálculos automáticos.
  - **Cobrança Recorrente:** integrada Stone.
- **Integrações bancárias/pagamento:** Stone (conta PJ, Belezinha, Split), Pagar.me, Pix.
- **Benefícios:** controle remoto, automação de pagamentos manuais, divisão de comissões, repasses em lote, zero custo conta digital, eliminação de planilhas.
- **CTAs:** "TESTE GRÁTIS"; "TESTE GRÁTIS POR 5 DIAS".
- **Observações:** Esta é a página mais relevante para o KEYRA — é onde o Trinks se posiciona como financeiro. Forte ancoragem na infraestrutura Stone (lock-in de adquirência).

---

### https://negocios.trinks.com/solucoes/comunicacao-para-ir-alem/
- **Título H1:** "Comunicação para ir além"
- **Features listadas:**
  - **Rotina de Mensagens WhatsApp:** automações disparadas pela agenda (confirmação, avaliação).
  - **Convite de Retorno:** identifica clientes inativos e reativa via WhatsApp/SMS/email.
  - **Integração Google Reserve + Instagram/Facebook:** agendamentos externos caem na mesma agenda.
  - **Pesquisa de Satisfação:** estrelas + comentários pós-atendimento.
  - **Clube de Assinaturas:** pacotes recorrentes, receita mensal previsível.
  - **Lembretes SMS e Email Marketing.**
- **CTAs:** "TESTE GRÁTIS POR 5 DIAS"; "Teste grátis por 5 dias"; "TESTE GRÁTIS".

---

### https://negocios.trinks.com/solucoes/para-expandir-sem-limites/
- **Título H1:** "Para expandir sem limites"
- **Features listadas:** gestão centralizada multi-unidade; +130 relatórios consolidados; controle de estoque com transferência entre unidades; processamento de dados centralizado; app personalizado para o negócio.
- **Tipos de relatório:** financeiro, agendamento, comissão, desempenho por unidade, atendimento por profissional, estoque.
- **CTAs:** "TESTE GRÁTIS POR 5 DIAS".

---

### https://negocios.trinks.com/planos/
- **Título H1:** "trinks sob medida para o seu sucesso"
- **Planos (5 faixas por número de profissionais):**
  1. **Base** — 1 a 2 profissionais — **R$ 76/mês** (valor identificado; segunda tabela referencia R$ 110 sem atribuição clara, possivelmente plano superior)
  2. **Intermediário** — 3 a 4 profissionais — sob consulta
  3. **Profissional** — 5 a 10 profissionais — sob consulta
  4. **Enterprise** — 11 a 20 profissionais — sob consulta
  5. **Customizado** — 21+ profissionais — sob consulta
- **Features incluídas (Base):** Agenda Online; Site e App para agendamento; Gestão e relatórios financeiros; Conta digital integrada; Pacotes, serviços e promoções; Controle de estoque; App profissional; Comunidade de empreendedores; Suporte humanizado; Treinamentos online; Onboarding personalizado; Migração assistida.
- **Recursos add-on (não inclusos no Base — cobrados à parte):** Aplicativo exclusivo; Clube de Assinaturas; Rotina de mensagens via WhatsApp; Programa de fidelidade; Lembretes e convite de retorno; Autoatendimento; Emissão de Notas Fiscais.
- **Condições:** teste grátis 5 dias; sem taxa de adesão; cobrança mensal sem consumir limite do cartão; planos semestral/anual podem ser parcelados; cancelamento semestral/anual com **multa de 50% das parcelas restantes**; upgrade livre; downgrade sujeito a multa em planos com fidelidade.
- **CTAs:** "TESTE GRÁTIS"; "Falar com especialista".
- **Observações-chave:** 
  - Modelo de preço **por faixa de profissionais** — alinhado ao salão multi-profissional, pode ser desalinhado para clínica pequena de 1-2 esteticistas que paga por features que não usa.
  - **Várias features críticas são add-on** (WhatsApp, NFe, fidelidade) — o ticket real cresce além do R$ 76 anunciado.

---

### https://negocios.trinks.com/quem-somos/
- **Título H1:** "A parceira para donos de negócios de beleza e bem-estar que estão prontos para crescer"
- **História:**
  - 2011 (origem): Perlink — consultoria em software (30+ anos de mercado).
  - 2012: nasce Trinks após insight da fundadora Carina em Goiânia (dificuldade de agendar salão).
  - Marcos: 1k clientes (2015), 3k (2017), 5k (2018), 40k+ (2023), 44k (2024).
- **Propósito:** "Transformar os sonhos dos empreendedores em negócios de sucesso".
- **Essência:** "poder das conexões".
- **Visão:** ser autoridade em tecnologia para beleza e bem-estar.
- **Números:** +40 mil empreendedores; 44 mil estabelecimentos (2024); 80+ milhões de agendamentos em 2024; 1.600 profissionais capacitados.
- **Liderança:** Carina (fundadora); Fernando Bichara (CTO).
- **Investidores/parceiros:** **Stone** (aquisição 2021); **Endeavor** (Scale Up); Doctor Feet; influenciadores.
- **Observações:** evidencia forte sinergia com Stone — o Trinks é braço vertical do ecossistema Stone em beleza.

---

### https://negocios.trinks.com/contato/
- **Título H1:** "Fale com a Trinks e dê um up na gestão do seu negócio de beleza."
- **Canais:** WhatsApp Suporte +55 21 99748-6902; canal Comercial e Adicionais; formulário (Nome, E-mail, Telefone, Mensagem).
- **CTAs:** "TESTE GRÁTIS"; "Já sou cliente"; "Central de ajuda"; "Suporte"; "Comercial"; "Adicionais".
- **Observações:** WhatsApp é o canal preferencial — não há telefone fixo ou endereço físico divulgado.

---

### https://negocios.trinks.com/termos-de-uso/
- **Título H1:** "Termos de uso"
- **Planos:** mensal, semestral e anual; semestral/anual têm fidelidade (6 ou 12 meses).
- **Renovação automática:** avisar 30 dias antes para não renovar.
- **Cancelamento:** multa de 50% das parcelas restantes (fidelidade); reembolso de 50% dos meses não usados (pago à vista).
- **Reajuste:** IGP-M, IPCA ou índices similares; notificação com 30 dias.
- **Features referenciadas (nos T&C):**
  - Estabelecimentos: agenda, profissionais, horários, estoque, precificação, cadastro/histórico de clientes, emissão NFS-e e NFC-e, campanhas (SMS, push, e-mail), relatórios, **hotsite no domínio Trinks**.
  - Profissionais: agenda pessoal, histórico, relatórios financeiros conforme permissão, controle de caixa.
  - Clientes: visualizar serviços, agendar online, comprar produtos/pacotes, avaliar, programa de fidelidade com pontos.
- **Observações:** Confirma NFC-e (Nota do Consumidor) — funcionalidade relevante para venda de produtos no varejo da clínica.

---

### https://negocios.trinks.com/politica-de-privacidade/
- **Título H1:** "Política de privacidade"
- **Dados coletados:** Profissionais (nome, CPF, nascimento, sexo, foto, endereço, e-mail, telefone, serviços, disponibilidade, histórico, valores); Clientes (mesmos + serviços contratados, profissional preferido, valores, data/hora/local, e-mails); Estabelecimentos (razão social, nome fantasia, CNPJ, endereço, e-mail, telefone, áreas, serviços, disponibilidade, histórico, valores, nº funcionários, foto, logomarca); Automáticos (geolocalização, device, SO, browser, session ID).
- **Bases LGPD:** menciona LGPD 13.709/2018, "legítimo interesse", "execução de contrato".
- **Compartilhamento terceiros:** **Stone Pagamentos S/A**; parceiros cloud (EUA, LATAM, Europa); afiliadas, franqueadores, redes.
- **Direitos do titular:** acesso, edição, correção, exclusão, restrição, opt-out de marketing.

---

### https://www.trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais
- **Título H1:** "Cadastre-se na Trinks"
- **Campos:** nome completo, celular, e-mail, nome do negócio, CEP, bairro, logradouro, número, complemento, senha, cupom (opcional).
- **Etapas onboarding:** (1) dados básicos → (2) seleção do tipo (Salão, Barbearia, Esmalteria, Centro de Estética, Podologia, Spa, Outro) → (3) endereço → (4) confirmação → (5) acesso + planos.
- **CTAs:** "Cadastrar negócio"; "Cadastre-se como cliente!"; "Acessar sistema"; "Ver planos"; "Ir para agenda"; "Entrar"; "Enviar"; "Finalizar"; "Começar".
- **Observações:** Tipo "Centro de Estética" é uma das opções oficiais (vs "Clínica de Estética" usada no marketing). Sem escolher plano, o novo usuário já entra no sistema (trial-first).

---

### https://sistema.trinks.com/trinks-de-vantagens-2 (referenciado; não coletado diretamente)
- **Observações:** Descoberto via link "Acesse Trinks de Vantagens" na home. É um clube de benefícios para estabelecimentos clientes (descontos em parceiros, cursos, produtos). Funciona como **retention lever**.

---

### blog.trinks.com (não coletado — WebFetch bloqueado)
- **Observações:** Conteúdo de marketing. Categorias prováveis: gestão, marketing, atendimento, financeiro, inspiração (inferido dos links internos do site institucional).

---

### ajuda.trinks.com (inferido via link "Central de ajuda" em /contato/; não coletado)
- **Observações:** Central de ajuda do usuário logado. Não enumerada nos fetches.

---

### apps.apple.com / play.google.com (não coletado — bloqueio)
- **Apps identificados por ID:**
  - **Trinks Profissional** — iOS (`id1514616279`) e Android (`com.trinks.pro`).
  - **Trinks** (marketplace do consumidor) — apps referenciados no rodapé de www.trinks.com.
- **Observações:** Dois aplicativos distintos — um para dono/profissional, outro para cliente final.

---

## Features Consolidadas (catálogo unificado)

Lista única deduplicada coletada em TODAS as páginas mapeadas. Agrupada por domínio funcional.

### Agenda & Agendamento
- Agenda online (com autonomia do cliente para escolher horário)
- Agendamentos recorrentes (fixos em dias/horas)
- Fila de espera (destaque em barbearias)
- Autoatendimento no estabelecimento
- Integração Google Reserve
- Integração agendamento via Instagram e Facebook
- Convite de retorno para clientes inativos
- Mapa de calor (horários de pico, serviços mais procurados)
- Hotsite personalizado no domínio Trinks
- Seu site (website do estabelecimento)
- App de agendamento para o cliente final (marketplace trinks.com)

### Clientes & CRM
- Cadastro e histórico completo por cliente
- Fichas de Anamnese personalizadas (foco clínicas de estética)
- Preferências e histórico de tratamentos
- Programa de fidelidade com pontuação
- Pesquisa de satisfação pós-atendimento (estrelas + comentários)
- Mensagens de aniversário automáticas
- Segmentação para convite de retorno

### Financeiro
- Fluxo de Caixa (entradas, saídas, fechamento)
- Fechamento de conta (por cliente, diário)
- Contas a pagar e receber
- Conta Digital Stone (PJ integrada)
- **Belezinha Stone** (maquininha integrada)
- Split de pagamentos
- Link de pagamento Pagar.me
- Cobrança recorrente
- Pix
- Antecipação de recebíveis
- Cálculo automático de comissões
- Pagamento de comissões em lote (Split)
- Emissão de notas fiscais (NFS-e de serviços, NFC-e do consumidor, Profissional-Parceiro)
- Ticket médio automático
- Relatórios financeiros (+130 tipos)
- Precificação de serviços e produtos

### Estoque & Produtos
- Controle de estoque
- Alertas de reposição
- Gestão de pacotes (corporais, faciais, serviços combinados)
- Transferência de estoque entre unidades (redes)

### Comunicação & Marketing
- Rotina de mensagens WhatsApp (confirmação, lembrete, pós-atendimento)
- SMS marketing
- E-mail marketing
- Lembretes premium
- Campanhas (push, SMS, e-mail)
- Integração Google / Instagram / Facebook
- Hotsite / site próprio

### Monetização Recorrente
- Clube de Assinaturas (pacotes mensais)
- Programa de fidelidade (pontos)
- Pacotes pré-pagos

### Profissionais & Operação
- App Trinks Profissional (iOS/Android)
- Cadastro e agenda individual por profissional
- Controle de caixa do profissional
- Pesquisa de satisfação por profissional

### Multi-unidade / Redes
- Gestão centralizada
- Relatórios consolidados por unidade
- Padronização operacional
- Transferência de estoque entre unidades

### Gestão & Reports
- Relatórios financeiros (+130 tipos)
- Relatórios de agendamento, comissão, desempenho por unidade, atendimento por profissional, estoque, recorrência, frequência
- Mapa de calor
- Dashboards em tempo real

### Suporte & Onboarding
- Onboarding personalizado
- Migração assistida
- Treinamentos online
- Masterclass semanal
- Suporte humanizado
- Time dedicado (planos superiores)
- Comunidade de empreendedores
- Trinks de Vantagens (clube de benefícios)

---

## CTAs e Copy patterns

### CTAs dominantes (ordem de frequência)
1. **"TESTE GRÁTIS"** / **"Teste grátis por 5 dias"** — presente em 100% das páginas institucionais.
2. **"Falar com especialista"** — em planos/soluções.
3. **"VER PLANOS"** — secundário.
4. **"Já sou cliente"** — para usuário logado.
5. **"Fale com a gente"** — via WhatsApp.
6. **"Cadastre seu Estabelecimento"** — cross-site no trinks.com B2C.
7. **"Saiba mais"** — nos blocos de soluções.

### Padrões de linguagem/copy
- **Tom:** informal, próximo, brasileiro, uso constante de "bora" e "dá um up".
- **Verbos de ação:** simplificar, ir além, expandir, otimizar, automatizar, conectar.
- **Estrutura H1:** narrativa de transformação ("da correria da rotina ao controle da gestão").
- **Fórmula:** *[problema do empreendedor] + [Trinks simplifica] + [prova social numérica]*.
- **Prova social:** ~10 depoimentos reais com nome+estabelecimento reutilizados em múltiplas páginas.
- **Ancoragem de números:** +44k, +460 milhões, +130 relatórios, +13 anos — repetidos em todas as páginas.
- **Urgência:** baixa. Sem cronômetros ou "vagas limitadas".
- **Risco:** mitigação via "5 dias grátis" + "sem taxa de adesão".

---

## Posicionamento Percebido

**O Trinks se posiciona como:**

1. **"O sistema completo"** para o ecossistema beleza e bem-estar — não um especialista financeiro, não um agendador simples; um **ERP vertical** que faz tudo de forma apenas suficiente.

2. **Player consolidado e seguro** — apoia-se em escala (+44k clientes, 13 anos) e backing da **Stone** (aquisição 2021). Mensagem implícita: "se a Stone comprou, é confiável".

3. **Uma camada de tecnologia + camada de serviços financeiros Stone** — a monetização verdadeira parece estar mais na adquirência (Belezinha, Conta Digital, Split) do que na assinatura do SaaS (R$ 76 base). SaaS é o canal de aquisição; pagamentos são o revenue multiplier.

4. **Horizontal entre 5 verticais** (salão, barbearia, clínica de estética, studio, rede) — usa mesmo core de produto e muda o copy e a foto. **Para clínicas de estética, oferece Anamnese + Pacotes + Mapa de Calor** como diferenciais, mas não há arquitetura separada.

5. **Foco em fluxo operacional (agenda → atendimento → fechamento → mensagem)** — o financeiro é **transacional e de fluxo de caixa**, não estratégico. Não vi (em todas as páginas coletadas): indicadores gerenciais tipo DRE, CMV, margem por serviço, ponto de equilíbrio, precificação por rentabilidade, metas de faturamento, projeções, análise de lucratividade por profissional ou por serviço.

6. **Estratégia de preço baseada em tamanho do time**, com features críticas (WhatsApp, NFe, fidelidade) como add-ons — criando um modelo onde o preço anunciado (R$ 76) fica longe do ticket real.

**Gaps/oportunidades para KEYRA (observados da pesquisa pública):**
- Financeiro é fluxo de caixa, não inteligência financeira (metas, DRE, margem real).
- Precificação de serviços e produtos é operacional (catálogo), não estratégica (baseada em custo + margem alvo).
- Não há evidência pública de **precificação inteligente** (simulador, ponto de equilíbrio, CMV).
- Não há evidência de **metas de faturamento** visuais ou gamificação de objetivos.
- A navegação exibe muitos gráficos/relatórios (+130) — conflita com princípio UX KEYRA de "números absolutos, tela única".
- Público-alvo prioritário é o **multi-profissional com equipe** (modelo salão); clínica de estética de 1-2 esteticistas fica fora do sweet spot.
- Lock-in Stone é explícito — clínica que quer usar outra adquirente ou antecipar recebíveis de outra forma está amarrada.
- Não foi localizado conteúdo específico sobre **controle de custos de procedimento** (ampolas, descartáveis por sessão) — apenas estoque genérico.

---

## Apêndice — Páginas testadas e resultado

| URL | Status | Método |
|---|---|---|
| negocios.trinks.com/ | OK | WebFetch |
| www.trinks.com/ | OK | WebFetch |
| negocios.trinks.com/negocios/clinicas-de-estetica/ | OK | WebFetch |
| negocios.trinks.com/negocios/saloes-de-beleza/ | OK | WebFetch |
| negocios.trinks.com/negocios/barbearias/ | OK | WebFetch |
| negocios.trinks.com/negocios/studios/ | OK | WebFetch |
| negocios.trinks.com/negocios/redes-e-franquias/ | OK | WebFetch |
| negocios.trinks.com/solucoes/ | OK | WebFetch |
| negocios.trinks.com/solucoes/o-essencial-para-o-seu-sucesso/ | OK | WebFetch |
| negocios.trinks.com/solucoes/simplificar-financas/ | OK | WebFetch |
| negocios.trinks.com/solucoes/comunicacao-para-ir-alem/ | OK | WebFetch |
| negocios.trinks.com/solucoes/para-expandir-sem-limites/ | OK | WebFetch |
| negocios.trinks.com/planos/ | OK | WebFetch |
| negocios.trinks.com/quem-somos/ | OK | WebFetch |
| negocios.trinks.com/contato/ | OK | WebFetch |
| negocios.trinks.com/termos-de-uso/ | OK | WebFetch |
| negocios.trinks.com/politica-de-privacidade/ | OK | WebFetch |
| www.trinks.com/programa-para-salao-de-beleza/cadastrar-meu-estabelecimento/dados-iniciais | OK | WebFetch |
| negocios.trinks.com/funcionalidades/ | 404 | — |
| negocios.trinks.com/clube-de-assinaturas/ | 404 | — |
| negocios.trinks.com/belezinha/ | 404 | — |
| negocios.trinks.com/agendamento-online/ | Redireciona p/ imagem | — |
| negocios.trinks.com/app-profissional/ | 404 | — |
| negocios.trinks.com/sitemap.xml | 404 | — |
| www.trinks.com/sitemap.xml | 404 | — |
| blog.trinks.com/ | Bloqueado | — |
| sistema.trinks.com/trinks-de-vantagens-2 | Bloqueado | — |
| apps.apple.com/.../trinks-profissional/... | Bloqueado | — |
| play.google.com/.../com.trinks.pro | Bloqueado | — |

**Total mapeado com sucesso: 18 páginas únicas** (acima do mínimo de 15 requerido).

---

*Arquivo gerado automaticamente por source-analyst em 2026-04-16.*
