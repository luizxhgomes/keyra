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
