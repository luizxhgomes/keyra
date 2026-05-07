# Setup Google OAuth — Story `auth.6` (deferida)

**Status atual:** ⏸️ deferida pendente setup manual seu
**Origem:** EPIC-AUTH-V2 fechado parcialmente em 2026-05-06 com 9/10 stories Done. Esta story exige criar OAuth 2.0 Client ID no Google Cloud Console — não pode ser automatizada por agente.

**Quando rodar a story `auth.6`:** assim que você terminar este setup e me entregar Client ID + Client Secret, eu disparo `@sm *draft auth.6` e executo o resto (Supabase config + código KEYRA + smokes E2E + merge).

---

## Pré-requisitos

- Conta Google Workspace ou Gmail (vc já tem)
- ~10-15 minutos
- Decisões de identidade do app (KEYRA — nome, logo, scopes)

---

## Passo a passo no Google Cloud Console

### 1. Criar/selecionar projeto

1. Acesse https://console.cloud.google.com
2. Selecione projeto existente OU clique "Create Project"
3. Nome sugerido: **"KEYRA Auth"** · Org: deixar default
4. Clica Create e aguarda ~10s

### 2. OAuth consent screen

1. Menu lateral → **APIs & Services** → **OAuth consent screen**
2. User type: **External** (qualquer Google account pode usar)
3. Click Create
4. Preenche:
   - **App name:** `KEYRA`
   - **User support email:** `suporte@usekeyra.com`
   - **App logo:** (opcional) upload do "K" KEYRA — dá credibilidade na tela do Google. Aceita PNG ≥ 120×120
   - **App domain:**
     - Application home page: `https://usekeyra.com`
     - Application privacy policy link: `https://usekeyra.com/privacidade`
     - Application terms of service link: `https://usekeyra.com/termos`
   - **Authorized domains:** `usekeyra.com`
   - **Developer contact information:** seu email
5. Save and Continue

### 3. Scopes (mínimo necessário)

1. Click **Add or Remove Scopes**
2. Marca **APENAS** estes 3:
   - ✅ `.../auth/userinfo.email` (See your primary Google Account email address)
   - ✅ `.../auth/userinfo.profile` (See your personal info, including any personal info you've made publicly available)
   - ✅ `openid` (Associate you with your personal info on Google)
3. **Não marca nada de "sensitive" ou "restricted"** — manter só email/profile/openid evita verificação Google formal (que demora semanas)
4. Save and Continue

### 4. Test users (se ficar em modo Testing)

- Se publicar app diretamente (passo 6), pula este
- Senão: adiciona seu email como test user pra validar antes

### 5. OAuth Client ID

1. Menu lateral → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `KEYRA Web`
5. **Authorized JavaScript origins** (não obrigatório mas recomendado):
   - `https://usekeyra.com`
6. **Authorized redirect URIs** (este é CRÍTICO — copiar exato):
   - `https://oapdfhivzojyahvphebs.supabase.co/auth/v1/callback`
7. Click Create
8. Modal aparece com **Client ID** + **Client Secret** — copia ambos AGORA (o secret só aparece nesta tela)

### 6. Publish app (sair de Testing pra Production)

1. Volta pra OAuth consent screen
2. No box "Publishing status" click **Publish App**
3. Modal de confirmação: "Your app will be available to all users with a Google Account. Verification is not required if you don't use sensitive scopes." (porque escolhemos só email/profile/openid)
4. Click Confirm
5. Status muda pra **In production**

### 7. Salvar credenciais localmente

```bash
# No diretório do projeto KEYRA
echo "<seu-client-id-aqui>" > .keyra-secrets/google-oauth-client-id.txt
chmod 600 .keyra-secrets/google-oauth-client-id.txt

echo "<seu-client-secret-aqui>" > .keyra-secrets/google-oauth-client-secret.txt
chmod 600 .keyra-secrets/google-oauth-client-secret.txt
```

Ou, se preferir, me passa as 2 strings no chat e eu salvo pra você.

---

## Quando você terminar — checklist final

- [ ] OAuth consent screen criado em modo "In production"
- [ ] Scopes: apenas `email` + `profile` + `openid`
- [ ] OAuth Client ID criado tipo "Web application"
- [ ] Authorized redirect URI configurada: `https://oapdfhivzojyahvphebs.supabase.co/auth/v1/callback`
- [ ] Client ID copiado
- [ ] Client Secret copiado
- [ ] (Recomendado) Salvo em `.keyra-secrets/google-oauth-{client-id,client-secret}.{txt,key}` com chmod 600

---

## O que eu faço quando você me entregar as credenciais

1. **Configuração Supabase via Mgmt API** — script `scripts/configure-supabase-google-oauth.sh` (idempotente + snapshot defensivo + validação GET, mesmo padrão dos outros)
2. **Story formal `auth.6`** — draft + @po valida + @dev implementa
3. **Código KEYRA:**
   - Server Action `signInWithGoogleAction` em `(auth)/login/actions.ts`
   - Ativar botão "Continuar com Google" no `SignInCard` (remover `disabled` + badge "EM BREVE" + adicionar onClick)
   - Mesmo botão também no `SignUpCard` (login social no cadastro também)
   - Callback handler em `/auth/callback/route.ts` já lida com PKCE — só validar
   - **Edge case crítico (R18 da auditoria):** user que vem do Google só tem `email + nome + avatar`. Se `profiles.phone IS NULL` ou user sem `memberships`, redirecionar para `/cadastro/completar` (rota nova) com os campos faltantes
4. **Validações E2E:**
   - Smoke programático: GET `/login` confirma botão sem badge
   - Smoke real seu: clicar "Continuar com Google" → autorizar conta → redirect pra `/dashboard` (se memberships) ou `/cadastro/completar` (se incompleto)
5. **Compliance:** validar com `@compliance-br` que Termos/Privacidade já mencionam Google Cloud como subprocessor (já foi feito na `auth.2`)
6. **EPIC-AUTH-V2 fecha 100%** após merge

---

## Custo estimado de execução

- Você (este setup): **10-15 min**
- Eu (resto): **30-40 min**

---

## Por que NÃO consigo fazer o passo 1-7 sozinho

Google Cloud Console exige:
1. Login na sua conta Google (eu não tenho acesso)
2. Decisões de identidade do app (nome, logo, copy)
3. Aceite explícito dos Terms of Service do Google Cloud
4. Confirmação de propriedade do domínio `usekeyra.com` (caso pedido pra autorizar domínio adicional — não é o padrão pra Web client comum)

Tudo isso é por design — Google evita que apps OAuth sejam criadas automaticamente sem responsabilidade humana atrás (anti-fraude).

---

## Alternativas / não-objetivos

- **NÃO incluir Google Workspace SSO empresarial** — fora do escopo do MVP
- **NÃO incluir Google Sign-In One Tap** — fora do escopo (overhead pra ganho marginal)
- **NÃO incluir scopes sensíveis** (Drive, Calendar, etc.) — não precisamos e exigiria verificação Google formal (semanas)

---

## Referências

- ADR-022 (Auth UX V2) — `docs/architecture/ARCHITECTURE.md` §11.2
- EPIC-AUTH-V2 — `docs/stories/EPIC-AUTH-V2.md`
- Auditoria de segurança — `docs/audit/auth-v2-security-audit.md` R18 (user incompleto pós-OAuth)
- Doc oficial Supabase Google Auth — https://supabase.com/docs/guides/auth/social-login/auth-google
- Doc oficial Google OAuth — https://developers.google.com/identity/protocols/oauth2/web-server
