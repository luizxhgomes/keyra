# Política de Privacidade da KEYRA

**Versão:** 1.1.0
**Status:** 📝 DRAFT — pendente de revisão jurídica
**Data de redação:** 18 de maio de 2026
**Substitui:** versão 1.0.0 (vigente desde 04 de maio de 2026)

> ⚠️ **Aviso de substituição e re-aceite obrigatório:** esta versão 1.1.0 substitui integralmente a versão 1.0.0. O motivo da nova versão é o lançamento da funcionalidade **Comprovantes Inteligentes**, que introduz um novo tratamento de dados pessoais (leitura de documentos financeiros por inteligência artificial). Por envolver tratamento novo, **todos os usuários ativos devem reaceitar esta Política antes do próximo acesso à plataforma** — um modal de re-aceite será exibido e bloqueará o uso até a confirmação. O registro do re-aceite (data, IP, user-agent, versão) é gravado de forma imutável em `user_consent_records`.

> ⚠️ **Aviso de redação:** texto redigido em 2026-05-18 com KEYRA ainda em fase pré-constituição formal. Quando a personalidade jurídica final estiver definida, uma versão futura desta Política a refletirá — usuários ativos receberão novo pedido de re-aceite via modal antes do próximo acesso.

## 1. Quem é a KEYRA

KEYRA é um SaaS de gestão financeiro-operacional para clínicas de estética, mantido por **[KEYRA — pessoa jurídica a constituir]** (doravante "KEYRA", "nós").

Esta Política descreve como tratamos os dados pessoais que você (Usuário) nos confia ao usar a plataforma. Está em conformidade com a **Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)**.

## 2. Quais dados coletamos

### 2.1 De você (Usuário/Clínica)

| Dado | Quando coletado | Por que |
|------|-----------------|---------|
| Nome completo | Cadastro | Identificação na plataforma; exibido no cabeçalho da app |
| Email | Cadastro | Login, recuperação de senha, comunicação operacional |
| Telefone (celular) | Cadastro | Contato de suporte; armazenado **criptografado** (pgcrypto) |
| Senha | Cadastro | Autenticação; armazenada via hash bcrypt pelo Supabase Auth — KEYRA jamais tem acesso ao texto plano |
| Nome da clínica + CNPJ (opcional) | Cadastro/onboarding | Personalização da plataforma; emissão futura de NFS-e |
| Endereço IP + user-agent | A cada signup/login | Auditoria de aceite de Termos (`user_consent_records`); detecção de fraude |

### 2.2 Que você insere (sobre seus pacientes)

Quando você cadastra clientes/pacientes da sua clínica, esses dados ficam armazenados na nossa infraestrutura sob seu controle como **controladora** (LGPD Art. 5º VI). KEYRA atua como **operadora** (Art. 5º VIII) nesse contexto.

Tipicamente: nome, telefone, email, CPF (criptografado), histórico de atendimentos, dados financeiros relacionados aos serviços.

### 2.3 Documentos e comprovantes que você anexa (Comprovantes Inteligentes)

A partir desta versão, a KEYRA permite que você anexe documentos financeiros para registro semiautomático de receitas e despesas — por exemplo: notas fiscais, recibos, comprovantes de Pix, boletos, faturas, extratos de maquininha e fotos desses documentos.

Sobre esse tratamento, você precisa saber, de forma transparente:

- **O que coletamos:** o arquivo que você anexa (em qualquer formato — foto, print, PDF, DOCX, TXT, entre outros) e o conteúdo textual extraído dele.
- **Dados de terceiros podem estar no documento.** O conteúdo de um comprovante pode conter dados pessoais de **terceiros** — por exemplo, o nome de quem pagou ou recebeu (a contraparte), valores e datas. Ao anexar um documento, você declara que tem base legítima para tratar esses dados na qualidade de **controladora** (LGPD Art. 5º VI), e a KEYRA atua como **operadora** (Art. 5º VIII), processando o conteúdo apenas para a finalidade de extrair e registrar o lançamento financeiro.
- **Leitura por inteligência artificial.** O conteúdo do documento anexado é enviado a um provedor de IA externo para que os dados (valor, data, descrição, direção do lançamento) sejam extraídos automaticamente. Os detalhes desse tratamento estão na **seção 9-A — Uso de Inteligência Artificial** e no §4 (Subprocessadores).
- **Revisão sempre sua.** Nenhum lançamento é registrado sem a sua confirmação. A IA apenas propõe; você revisa e confirma.

### 2.4 Automaticamente

- Logs técnicos (rotas acessadas, tempo de resposta) — anonimizados por scrubbing automático antes de irem ao Sentry
- Cookies de sessão e CSRF (essenciais ao funcionamento)
- Dados do widget Cloudflare Turnstile (cookie + IP) — anti-bot

## 3. Por que tratamos seus dados (bases legais)

| Base legal LGPD | Aplicação |
|-----------------|-----------|
| **Execução de contrato** (Art. 7º V) | Tudo necessário pra você usar a plataforma: cadastro, login, armazenamento de seus dados de gestão, envio de emails operacionais, **e o processamento dos documentos que você anexa — incluindo a leitura por IA para extração dos dados** |
| **Consentimento** (Art. 7º I) | Aceite explícito dos Termos+Privacidade no cadastro e no re-aceite desta versão; futura ativação de Google OAuth |
| **Legítimo interesse** (Art. 7º IX) | Segurança (CAPTCHA, scrubbing de PII em logs, anti-fraude, observabilidade técnica) |
| **Cumprimento de obrigação legal** (Art. 7º II) | Retenção de logs e registros conforme exigências fiscais/regulatórias |

## 4. Subprocessadores (compartilhamento de dados)

KEYRA contrata os seguintes terceiros pra operar a plataforma. Cada um trata apenas o mínimo necessário, sob contrato (DPA quando disponível):

| Subprocessador | Onde fica | O que recebe | Base legal |
|----------------|-----------|--------------|------------|
| **Supabase Inc.** | Singapura/EUA (DB no AWS São Paulo, BR) | Conteúdo do banco (incluindo clientes seus, criptografado em repouso AES-256); arquivos de comprovantes em bucket privado | Execução do contrato |
| **Vercel Inc.** | EUA (edge global, BR ativo) | Logs de request, conteúdo de páginas servidas; intermedia as chamadas de IA via Vercel AI Gateway | Execução do contrato |
| **OpenAI, L.L.C.** | EUA | **Conteúdo do documento que você anexa** (imagem, PDF ou texto do comprovante) — usado exclusivamente para extrair valor, data, descrição e direção do lançamento. Acesso intermediado pelo Vercel AI Gateway com `disallowPromptTraining` ativado | Execução do contrato |
| **Resend** | EUA | Email do destinatário, conteúdo do email transacional (magic link, recuperação, convite) | Execução do contrato |
| **Cloudflare Inc.** | Global | IP do visitante, cookie técnico do widget Turnstile | Legítimo interesse — segurança |
| **Sentry** | EUA | Stack trace de erros, breadcrumbs **sem PII** (scrubbing automático aplicado em `password\|senha\|cpf\|phone\|token\|authorization` e, na funcionalidade de comprovantes, também em `extraction_data`, `extraction_raw_text`, `reviewed_data`, `file_path`, `signed_url`) | Legítimo interesse — observabilidade |
| **Google Cloud** (a partir de auth.6) | EUA | Email + nome + avatar fornecidos pelo Google ao logar via OAuth | Consentimento explícito (você escolhe ativar) |

**Sobre a OpenAI — declaração honesta de retenção.** O modelo de IA utilizado é o `gpt-4o-mini`, acessado por meio do **Vercel AI Gateway** com o parâmetro `disallowPromptTraining` ativado. Isso significa, de forma direta:

- **Seus documentos NÃO são usados para treinar modelos de IA.** O `disallowPromptTraining` instrui o provedor a não empregar o conteúdo enviado no aprimoramento ou treinamento de seus modelos.
- **Há, porém, retenção transitória.** A OpenAI **não** integra a lista de provedores de **Zero Data Retention (ZDR)** do Vercel AI Gateway. Ou seja: o conteúdo enviado pode ser **retido temporariamente** pela OpenAI conforme a política de retenção dela (tipicamente para fins de monitoramento de abuso e segurança), por um período limitado, **sem ser usado para treinamento**. Não temos como reduzir esse comportamento abaixo do que a política do provedor define.
- Optamos por ser explícitos sobre isso para que você decida com plena informação se quer usar a funcionalidade de Comprovantes Inteligentes. Se preferir, você pode continuar lançando receitas e despesas **manualmente**, sem anexar documentos — nesse caso, nenhum dado vai para a OpenAI.

Não compartilhamos seus dados pessoais com terceiros para fins de marketing.

## 5. Transferência internacional

Alguns subprocessadores são empresas estrangeiras (EUA principalmente). LGPD Art. 33 permite transferência internacional desde que:
- O país receptor tenha proteção adequada **OU**
- O controlador adote cláusulas-padrão contratuais de proteção

Os subprocessadores acima operam sob cláusulas de proteção exigidas por GDPR/LGPD.

**Transferência específica da funcionalidade de Comprovantes Inteligentes:** ao anexar um documento financeiro para leitura por IA, o **conteúdo desse documento é transferido para os Estados Unidos**, onde a OpenAI processa a extração dos dados (intermediada pelo Vercel AI Gateway, também sediado nos EUA). Essa transferência é necessária à execução do contrato — é a operação que permite a leitura automática do comprovante. A transferência ocorre apenas quando você anexa um documento; se você optar por lançamentos manuais, nenhum conteúdo é transferido para esse fim.

Em caso de dúvida específica sobre transferência internacional, escreva pra **suporte@usekeyra.com**.

## 6. Quanto tempo guardamos

| Tipo de dado | Tempo |
|--------------|-------|
| Dados ativos da sua conta | Enquanto a conta estiver ativa |
| Documentos/comprovantes anexados | Seguem a retenção da conta — armazenados enquanto a conta estiver ativa; o **documento original fica armazenado criptografado** em bucket privado |
| Após exclusão da conta | **30 dias** de janela pra reverter, depois removidos — incluindo os comprovantes anexados e o conteúdo deles (exceto obrigações legais) |
| Logs técnicos (Sentry, Vercel) | 30-90 dias (varia por produto, sem PII) |
| Retenção transitória pelo provedor de IA (OpenAI) | Período limitado definido pela política do provedor — sem uso para treinamento; fora do controle direto da KEYRA (ver §4) |
| Registros de aceite de Termos (`user_consent_records`) | Permanente — exigência de auditoria |
| Backups de banco | 7 dias rotativos (plano atual) |

## 7. Seus direitos LGPD (Art. 18)

Você pode, a qualquer momento:

- **Confirmar** se tratamos seus dados (responder em até 15 dias úteis)
- **Acessar** os dados que temos sobre você
- **Corrigir** dados incorretos ou desatualizados
- **Anonimizar, bloquear ou eliminar** dados desnecessários ou tratados em desconformidade
- **Portar** seus dados em formato estruturado (CSV/JSON) — autoatendimento via Configurações → Exportar dados (será disponibilizado na Sprint de hardening)
- **Eliminar** dados tratados sob consentimento (revogação)
- **Saber** com quem compartilhamos (lista no §4 acima)
- **Revogar consentimento** a qualquer momento
- **Excluir um comprovante anexado** — você pode remover qualquer documento que tenha anexado; a remoção apaga o arquivo original do nosso armazenamento

Pra exercer qualquer direito: **suporte@usekeyra.com** ou Configurações → Privacidade.

## 8. Encarregado de Dados (DPO)

A designação formal está em definição (será publicada em versão futura deste documento, conforme LGPD Art. 41).

Enquanto isso, ponto de contato pra assuntos LGPD: **suporte@usekeyra.com**.

## 9. Segurança

Aplicamos:

- TLS 1.3 em todas as conexões
- Banco com Row Level Security (RLS) habilitada por tenant — sua clínica não vê dados de outra
- Senhas com hash bcrypt (Supabase Auth nativo)
- Telefone com criptografia em coluna (pgcrypto)
- Auth Hooks que rejeitam emails de domínios descartáveis
- CAPTCHA invisível (Cloudflare Turnstile) em endpoints de cadastro/recuperação
- Scrubbing automático de PII antes de qualquer log externo (Sentry)
- Auditoria de aceite de Termos imutável após gravado

**Segurança específica dos documentos anexados (Comprovantes Inteligentes):**

- **Armazenamento em bucket privado.** Todo documento anexado é guardado em um bucket de armazenamento **privado** (não público), isolado por organização (RLS por `org_id`). Um arquivo de uma clínica nunca é visível para outra.
- **Acesso só por link assinado de curta duração.** O conteúdo do documento jamais é exposto por URL pública. O acesso de leitura — seja para você revisar o comprovante na tela, seja para o sistema enviá-lo à IA — ocorre exclusivamente por meio de um **link assinado (signed URL) com expiração curta** (até 60 segundos), gerado no servidor no momento do uso.
- **Scrubbing de PII reforçado.** O scrubbing automático de dados pessoais aplicado antes de qualquer log externo foi **estendido** para cobrir os campos da funcionalidade de comprovantes — o conteúdo extraído pela IA, o texto bruto lido, os dados revisados, o caminho do arquivo e os links assinados nunca aparecem em logs de erro ou observabilidade.
- **Auditoria sem conteúdo sensível.** A auditoria de mudanças nos comprovantes registra **apenas metadados** (identificador, organização, mudança de estado, autor e horário) — nunca o conteúdo financeiro extraído, em respeito ao princípio da minimização (LGPD Art. 6º III).
- **Validação de arquivo.** O tipo real do arquivo é verificado pelo seu conteúdo (magic bytes), não pela extensão; há limite de tamanho; e o arquivo nunca é executado — apenas lido.

Apesar das medidas, nenhum sistema é 100% imune. Em caso de **incidente de segurança que exponha dados pessoais**, KEYRA notifica a ANPD e os usuários afetados conforme LGPD Art. 48.

## 9-A. Uso de Inteligência Artificial

A funcionalidade **Comprovantes Inteligentes** usa inteligência artificial para poupar você da digitação manual de lançamentos financeiros. Queremos que isso seja transparente, então explicamos em linguagem clara.

### O que a IA faz

- **Lê o documento que VOCÊ anexa.** Quando você anexa uma foto, um PDF ou outro arquivo de comprovante, o conteúdo desse documento é enviado a um modelo de IA (a OpenAI `gpt-4o-mini`, via Vercel AI Gateway).
- **Extrai os dados do lançamento.** A IA identifica e propõe: o **valor**, a **data**, uma **descrição**, a **direção** (se é receita ou despesa) e uma sugestão de categoria.
- **Devolve uma proposta.** O resultado é apresentado a você lado a lado com o documento, em campos editáveis, para sua revisão.

### O que a IA NÃO faz

- **A IA não decide nada sozinha.** Nenhum lançamento é registrado automaticamente. A leitura da IA é sempre uma **proposta** — **você sempre revisa e confirma** antes de qualquer valor entrar nas suas finanças. Você pode corrigir qualquer campo, ou rejeitar o comprovante por inteiro.
- **A IA não treina com seus dados.** O conteúdo enviado é processado com `disallowPromptTraining` ativado — seus documentos **não** são usados para treinar ou aprimorar modelos de IA. (Há retenção transitória pelo provedor, sem uso para treinamento — ver §4.)
- **A IA não faz julgamento sobre você nem sobre seus pacientes.** Ela apenas transcreve dados financeiros de um documento; não cria perfil, não pontua, não recomenda decisões de negócio.

### A leitura é auxiliar e falível

A extração por IA é uma **ferramenta de apoio**, não uma autoridade. Modelos de IA podem **errar** — ler um valor incorreto, confundir uma data, interpretar mal uma descrição. Por isso a revisão humana é obrigatória e **inegociável**: a responsabilidade final pelo lançamento registrado é sua. Quando a IA tiver baixa confiança em um campo, isso é sinalizado visualmente na tela de revisão para chamar sua atenção. Se a leitura automática falhar, o documento não é perdido — ele fica salvo e você pode lançar os dados manualmente.

### Sua escolha

O uso da IA acontece **apenas quando você anexa um documento**. Você pode continuar registrando receitas e despesas de forma totalmente manual, sem anexar nada — e, nesse caso, nenhum dado é enviado a qualquer provedor de IA.

## 10. Cookies

Cookies essenciais que usamos:

| Cookie | Função |
|--------|--------|
| `sb-*-auth-token` | Sessão autenticada (expira em 1h, refresh automático até 7 dias de inatividade) |
| `cf_chl_*` | Validação Cloudflare Turnstile (anti-bot) |

Não usamos cookies de tracking/marketing.

## 11. Crianças e adolescentes

KEYRA é destinada a clínicas legalmente constituídas com responsável adulto. Não criamos contas para menores de 18 anos. Se descobrirmos cadastro de menor, encerramos a conta.

## 12. Mudanças nesta Política

Esta versão **1.1.0** substitui a versão 1.0.0. Versões são publicadas em `/privacidade`. Quando uma nova versão introduzir mudança relevante de tratamento — como foi o caso da leitura de documentos por IA nesta versão —, **usuários ativos recebem um modal de re-aceite que bloqueia o acesso à plataforma até a confirmação**. O re-aceite é registrado de forma imutável em `user_consent_records` (data, IP, user-agent e versão aceita).

## 13. Contato

**suporte@usekeyra.com** — assuntos LGPD, exclusão, exportação, dúvidas gerais.

---

**Política em vigor a partir de 18 de maio de 2026 (versão 1.1.0 — DRAFT, pendente de revisão jurídica).** Substitui a versão 1.0.0 de 04 de maio de 2026. Documento elaborado com base na LGPD vigente em 2026. Foro eleito para questões relativas a esta Política: comarca de **São Paulo/SP**.
