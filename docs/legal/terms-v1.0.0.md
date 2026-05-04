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
