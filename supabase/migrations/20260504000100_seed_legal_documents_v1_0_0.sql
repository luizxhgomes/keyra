-- =============================================================================
-- KEYRA — Migration 028: seed legal_documents v1.0.0 (Termos + Privacidade)
--
-- Story auth.2 do EPIC-AUTH-V2.
-- Conteúdo redigido em docs/legal/terms-v1.0.0.md e privacy-v1.0.0.md.
-- content_hash = SHA-256 lowercase do arquivo .md fonte.
--
-- Texto contém placeholders relativos à constituição jurídica formal da KEYRA
-- (CNPJ a definir, foro padrão SP) — autorizado pela idealizadora em 2026-05-03.
-- Versão 1.1.0+ substituirá esta quando KEYRA virar pessoa jurídica formal.
--
-- Após apply: usuários existentes não têm aceite registrado em
-- user_consent_records ainda — auth.3 (cadastro) é o ponto onde aceite começa
-- a ser registrado pra novos signups.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Estender RLS de legal_documents para também aceitar SELECT pelo `anon` —
--    páginas públicas /termos e /privacidade não têm sessão.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS legal_documents_select_anon ON public.legal_documents;

CREATE POLICY legal_documents_select_anon ON public.legal_documents
  FOR SELECT TO anon
  USING (deprecated_at IS NULL);

GRANT SELECT ON public.legal_documents_current TO anon, authenticated;
GRANT SELECT ON public.legal_documents TO anon;

-- -----------------------------------------------------------------------------
-- 2. Seed do conteúdo v1.0.0 (idempotente via ON CONFLICT)
-- -----------------------------------------------------------------------------

INSERT INTO public.legal_documents (type, version, content_hash, content_md)
VALUES (
  'terms',
  '1.0.0',
  'a8b8323f16f09331e575611abb9385dc6b9b01e0e0c334673be55b2166b8e207',
$LEGAL$
# Termos de Uso da KEYRA

**Versão:** 1.0.0
**Vigente desde:** 04 de maio de 2026

> ⚠️ **Aviso de redação:** este texto foi redigido em 2026-05-04 com placeholders relativos à constituição jurídica formal da KEYRA, ainda em definição. Quando KEYRA for constituída como pessoa jurídica formal (CNPJ definido), uma nova versão (1.1.0+) substituirá esta — e usuários ativos receberão pedido de re-aceite via modal antes do próximo acesso.

## 1. Quem somos

KEYRA é um sistema de gestão financeiro-operacional voltado para clínicas de estética. Esta plataforma é mantida por **[KEYRA — pessoa jurídica a constituir]** (doravante "KEYRA", "nós", "nossa"), com endereço a definir e jurisdição padrão na Comarca de São Paulo/SP.

Você (doravante "Usuário", "você") é a clínica ou profissional cadastrado na plataforma.

## 2. Aceite

Ao clicar no checkbox de aceite no momento do cadastro, você declara que leu, compreendeu e concorda com estes Termos e com a [Política de Privacidade](/privacidade) vigente. O aceite é registrado de forma imutável (data, hora, IP, user-agent) na tabela `user_consent_records` para fins de auditoria, conforme Art. 9º §6º da LGPD.

## 3. O que você pode fazer com a KEYRA

A KEYRA permite que você:

- Cadastre clientes (pacientes da sua clínica) e gerencie agendamentos
- Registre pagamentos, despesas, custos fixos e variáveis
- Acompanhe DRE (Demonstrativo de Resultado) por serviço, profissional e período
- Mantenha estoque de insumos com rateio automático ao executar serviços
- Defina metas mensais e visualize indicadores e alertas

A KEYRA é fornecida no modelo **SaaS (Software como Serviço)**. Você não recebe cópia do software — acessa via navegador.

## 4. Suas responsabilidades

Você é responsável por:

- Fornecer informações verdadeiras no cadastro (nome, celular, email, CNPJ da clínica quando aplicável)
- Manter a confidencialidade da sua senha — KEYRA jamais pedirá sua senha por email, telefone ou WhatsApp
- Garantir que tem base legal própria (consentimento, execução de contrato ou outra) para processar dados pessoais dos seus clientes/pacientes na plataforma. Nesse contexto, **você é controladora** dos dados dos seus pacientes e a **KEYRA atua como operadora** (LGPD Art. 5º VIII), conforme detalhado na Política de Privacidade
- Cumprir leis aplicáveis ao seu negócio: regulamentações sanitárias da ANVISA, conselhos profissionais (CRM, COREN, CRO conforme o caso), legislação fiscal, trabalhista, e LGPD em relação aos seus clientes

## 5. Segurança da conta

- Senha mínima: 10 caracteres com letras maiúsculas, minúsculas e dígitos
- Confirmação de email obrigatória no cadastro
- Trocar senha exige reautenticação recente
- Tentativas excessivas de login geram bloqueio temporário
- Telefone armazenado de forma criptografada (pgcrypto + chave de coluna isolada)

## 6. Subprocessadores

A KEYRA opera sobre infraestrutura de terceiros listados a seguir. Detalhes de função e base legal estão na [Política de Privacidade](/privacidade) §4.

| Subprocessador | Função | Localização |
|----------------|--------|-------------|
| Supabase Inc. | Banco de dados + autenticação | Singapura/EUA (dados em São Paulo, BR) |
| Vercel Inc. | Hospedagem da aplicação | EUA |
| Resend | Envio de emails transacionais | EUA |
| Cloudflare Inc. | CAPTCHA Turnstile | Global |
| Sentry | Observabilidade técnica | EUA |
| Google Cloud (futuro) | Login social via OAuth (a partir de auth.6) | EUA |

## 7. Indisponibilidade e SLA

KEYRA oferece infraestrutura "best-effort" no plano atual. Não garantimos uptime contratual nesta versão dos Termos. Backups diários do banco são executados pela infraestrutura Supabase com retenção mínima de 7 dias no plano atual; trabalhamos para evoluir esse compromisso conforme KEYRA cresce.

## 8. Encerramento da conta

Você pode encerrar sua conta a qualquer momento via Configurações → Conta → Excluir.

Após o pedido de exclusão, KEYRA inicia o processo de remoção de dados pessoais com **período de retenção de 30 (trinta) dias** — janela para reverter exclusão acidental. Após esse prazo, seus dados pessoais são apagados (LGPD Art. 18 II — direito ao esquecimento), exceto registros que a lei nos obriga a preservar (auditoria fiscal, registros de aceite de Termos para defesa em eventual disputa, logs de acesso por período razoável).

KEYRA pode encerrar sua conta unilateralmente se você violar estes Termos, com aviso prévio salvo em casos de fraude, atividade ilícita ou risco à plataforma.

## 9. Propriedade intelectual

KEYRA é uma marca registrada (em processo). Você recebe licença de uso pessoal e intransferível enquanto sua conta estiver ativa. Os DADOS que você insere (clientes, agenda, DRE, etc.) **continuam sendo seus** — você pode exportar a qualquer momento (LGPD Art. 18 II — direito de portabilidade).

## 10. Limitação de responsabilidade

KEYRA é uma ferramenta. Decisões de negócio (cobrança, contrato com cliente, regime tributário, formação de preço) são suas. Não nos responsabilizamos por:

- Perdas financeiras decorrentes de decisões tomadas com base em informações que você inseriu
- Bugs, indisponibilidades ou perda de dados além do que infraestrutura padrão (backups Supabase) cobre
- Conteúdo gerado/inserido por você que viole leis aplicáveis

## 11. Mudanças nos Termos

Quando atualizarmos estes Termos materialmente, nova versão é publicada em `/termos` e usuários ativos recebem modal de re-aceite no próximo login. Sem re-aceite, acesso à plataforma é suspenso até concordância.

Mudanças cosméticas (correção tipográfica, link quebrado) não geram nova versão major.

## 12. Foro

Comarca de **São Paulo / SP** — sem prejuízo do direito do consumidor de escolher o foro do seu domicílio nos casos previstos em lei.

## 13. Contato

DPO (Encarregado de Dados): a designar (vamos publicar identificação completa em versão futura conforme exigência LGPD Art. 41).

Para dúvidas, suporte ou exercício de direitos LGPD: **suporte@usekeyra.com**.

---

**Estes Termos têm vigência a partir de 04 de maio de 2026 (versão 1.0.0).** Aceitando, você confirma que leu integralmente e concorda. Em caso de dúvida, entre em contato antes de aceitar.
$LEGAL$
)
ON CONFLICT (type, version) DO UPDATE
  SET content_hash = EXCLUDED.content_hash,
      content_md   = EXCLUDED.content_md;

INSERT INTO public.legal_documents (type, version, content_hash, content_md)
VALUES (
  'privacy',
  '1.0.0',
  '7055ca330cdbf57d7de7db85e4f097520a760ad170962d6b5150fc54fdec15be',
$LEGAL$
# Política de Privacidade da KEYRA

**Versão:** 1.0.0
**Vigente desde:** 04 de maio de 2026

> ⚠️ **Aviso de redação:** texto redigido em 2026-05-04 com KEYRA em fase pré-constituição formal. Versão 1.1.0+ substituirá esta quando a personalidade jurídica final estiver definida — usuários ativos receberão pedido de re-aceite via modal antes do próximo acesso.

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

### 2.3 Automaticamente

- Logs técnicos (rotas acessadas, tempo de resposta) — anonimizados por scrubbing automático antes de irem ao Sentry
- Cookies de sessão e CSRF (essenciais ao funcionamento)
- Dados do widget Cloudflare Turnstile (cookie + IP) — anti-bot

## 3. Por que tratamos seus dados (bases legais)

| Base legal LGPD | Aplicação |
|-----------------|-----------|
| **Execução de contrato** (Art. 7º V) | Tudo necessário pra você usar a plataforma: cadastro, login, armazenamento de seus dados de gestão, envio de emails operacionais |
| **Consentimento** (Art. 7º I) | Aceite explícito dos Termos+Privacidade no cadastro; futura ativação de Google OAuth |
| **Legítimo interesse** (Art. 7º IX) | Segurança (CAPTCHA, scrubbing de PII em logs, anti-fraude, observabilidade técnica) |
| **Cumprimento de obrigação legal** (Art. 7º II) | Retenção de logs e registros conforme exigências fiscais/regulatórias |

## 4. Subprocessadores (compartilhamento de dados)

KEYRA contrata os seguintes terceiros pra operar a plataforma. Cada um trata apenas o mínimo necessário, sob contrato (DPA quando disponível):

| Subprocessador | Onde fica | O que recebe | Base legal |
|----------------|-----------|--------------|------------|
| **Supabase Inc.** | Singapura/EUA (DB no AWS São Paulo, BR) | Conteúdo do banco (incluindo clientes seus, criptografado em repouso AES-256) | Execução do contrato |
| **Vercel Inc.** | EUA (edge global, BR ativo) | Logs de request, conteúdo de páginas servidas | Execução do contrato |
| **Resend** | EUA | Email do destinatário, conteúdo do email transacional (magic link, recuperação, convite) | Execução do contrato |
| **Cloudflare Inc.** | Global | IP do visitante, cookie técnico do widget Turnstile | Legítimo interesse — segurança |
| **Sentry** | EUA | Stack trace de erros, breadcrumbs **sem PII** (scrubbing automático aplicado em `password\|senha\|cpf\|phone\|token\|authorization`) | Legítimo interesse — observabilidade |
| **Google Cloud** (a partir de auth.6) | EUA | Email + nome + avatar fornecidos pelo Google ao logar via OAuth | Consentimento explícito (você escolhe ativar) |

Não compartilhamos seus dados pessoais com terceiros para fins de marketing.

## 5. Transferência internacional

Alguns subprocessadores são empresas estrangeiras (EUA principalmente). LGPD Art. 33 permite transferência internacional desde que:
- O país receptor tenha proteção adequada **OU**
- O controlador adote cláusulas-padrão contratuais de proteção

Os subprocessadores acima operam sob cláusulas de proteção exigidas por GDPR/LGPD. Em caso de dúvida específica, escreva pra **suporte@usekeyra.com**.

## 6. Quanto tempo guardamos

| Tipo de dado | Tempo |
|--------------|-------|
| Dados ativos da sua conta | Enquanto a conta estiver ativa |
| Após exclusão da conta | **30 dias** de janela pra reverter, depois removidos (exceto obrigações legais) |
| Logs técnicos (Sentry, Vercel) | 30-90 dias (varia por produto, sem PII) |
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

Pra exercer qualquer direito: **suporte@usekeyra.com** ou Configurações → Privacidade.

## 8. Encarregado de Dados (DPO)

A designação formal está em definição (será publicada em versão 1.1.0+ deste documento, conforme LGPD Art. 41).

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

Apesar das medidas, nenhum sistema é 100% imune. Em caso de **incidente de segurança que exponha dados pessoais**, KEYRA notifica a ANPD e os usuários afetados conforme LGPD Art. 48.

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

Versões futuras são publicadas em `/privacidade` e usuários ativos recebem modal de re-aceite no próximo login.

## 13. Contato

**suporte@usekeyra.com** — assuntos LGPD, exclusão, exportação, dúvidas gerais.

---

**Política em vigor a partir de 04 de maio de 2026 (versão 1.0.0).** Documento elaborado com base na LGPD vigente em 2026.
$LEGAL$
)
ON CONFLICT (type, version) DO UPDATE
  SET content_hash = EXCLUDED.content_hash,
      content_md   = EXCLUDED.content_md;
