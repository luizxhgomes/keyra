# Checklist QA — Recovery flow em mobile 375px (Camila persona)

**Story:** auth.5 + auth.8 (EPIC-AUTH-V2)
**Critério Done não-negociável:** lição RSC de 2026-05-02 — *build verde ≠ produto funcional*. Idealizadora precisa exercer o fluxo em mobile real (375px) antes da story ser considerada Done de fato.

---

## Pré-requisitos

- [ ] Smartphone real (não DevTools mobile-mode) com largura física entre 360-414px
- [ ] Acesso ao email `luizzzhenriqueoficial@gmail.com` (ou outro user de teste cadastrado)
- [ ] Conexão Wi-Fi/4G estável
- [ ] Browser: Safari (iOS) ou Chrome (Android) — testar pelo menos um, idealmente os dois
- [ ] Rotacionar para portrait (não landscape)

---

## Etapa 1 — Acessar `/esqueci-senha`

**Ação:** Abrir https://usekeyra.com/esqueci-senha no browser do celular.

**Critério PASS:**
- [ ] Carrega em < 3 segundos com 4G
- [ ] Card centralizado vertical e horizontalmente
- [ ] "K" da bolha visível com cor primary marrom (#c66a38)
- [ ] Título "KEYRA" + subtítulo "Recuperação de senha"
- [ ] Campo email visível, com placeholder "E-mail"
- [ ] Widget Cloudflare Turnstile carrega abaixo do email (caixa branca com checkbox)
- [ ] Botão "Enviar link de redefinição" com altura mínima 44px (não pequenininho)
- [ ] Link "Voltar ao login" no rodapé do card

**Critério FAIL:**
- [ ] Tela branca / loading infinito / texto cortado / Turnstile não carrega
- [ ] Layout desalinhado / scroll horizontal aparecendo

---

## Etapa 2 — Testar anti-enumeration (visual)

**Ação A:** Digitar email **NÃO cadastrado** (`teste-naoexiste-{random}@example.com`) → tocar "Enviar link de redefinição".

**Critério PASS:**
- [ ] Após ~1 segundo, card muda para "Pedido recebido"
- [ ] Mensagem: "Se este e-mail estiver cadastrado, enviamos um link de redefinição. Verifique sua caixa de entrada e a pasta de spam."
- [ ] Botão "Voltar ao login" visível
- [ ] **NÃO** chega email na inbox (validar 2 minutos depois)

**Ação B:** Voltar para `/esqueci-senha`. Digitar email **cadastrado** (`luizzzhenriqueoficial@gmail.com`) → tocar "Enviar link".

**Critério PASS:**
- [ ] Mesma mensagem da Ação A (idêntica — anti-enumeration)
- [ ] Email chega na inbox em até 2 minutos

**Critério FAIL:**
- [ ] Mensagens diferentes para email cadastrado vs não cadastrado
- [ ] Tempo de resposta visivelmente diferente (>1 segundo de diferença)
- [ ] Email chega para email não cadastrado

---

## Etapa 3 — Receber e validar email

**Ação:** Abrir o email recebido (após Ação B da Etapa 2).

**Critério PASS:**
- [ ] **Remetente:** "KEYRA" (não "Supabase Auth" nem "no-reply")
- [ ] **Subject:** "Redefinir sua senha do KEYRA"
- [ ] **Bolha "KEYRA"** no topo do email com tipografia caps + spacing
- [ ] **Headline:** "Vamos redefinir sua senha."
- [ ] **Botão CTA:** "Redefinir minha senha" em cor terracota (marrom alaranjado)
- [ ] **Disclaimer:** "Este link é válido por 30 minutos e funciona apenas uma vez."
- [ ] **Footer:** "Se você não pediu para redefinir sua senha, ignore este email com segurança..."
- [ ] **Sem imagens externas** (privacidade — não vaza IP por pixel tracking)

**Critério FAIL:**
- [ ] Subject em inglês ou genérico ("Reset Password")
- [ ] Botão sem cor KEYRA / em cinza
- [ ] Disclaimer fora da realidade (ex: "1 hora" — bug, otp_exp é 30min)
- [ ] Layout quebrado em Gmail iOS / Apple Mail

---

## Etapa 4 — Clicar e redefinir senha

**Ação:** Tocar no botão "Redefinir minha senha" do email.

**Critério PASS:**
- [ ] Browser abre nova aba / nova janela
- [ ] Cai em https://usekeyra.com/redefinir-senha (URL final, sem `code=` visível na barra após processar)
- [ ] Card "Definir nova senha" carrega com:
  - [ ] Título "KEYRA" + subtítulo "Definir nova senha"
  - [ ] Texto explicativo: "Use no mínimo 10 caracteres com letras maiúsculas, minúsculas e números."
  - [ ] Campo "Nova senha" com botão olho 👁️ que mostra/esconde
  - [ ] Campo "Confirme a nova senha"
  - [ ] Botão "Definir nova senha" com altura mínima 44px

**Ação:** Digitar uma senha INVÁLIDA (`abc`).

**Critério PASS:**
- [ ] Mensagem inline vermelha "Mínimo 10 caracteres" abaixo do campo

**Ação:** Digitar uma senha VÁLIDA (`KeyraNova2026!`) e confirmar com **OUTRA** (`KeyraOutra2026!`).

**Critério PASS:**
- [ ] Mensagem inline vermelha "As senhas não conferem" abaixo do campo de confirmação

**Ação:** Digitar senha válida (`KeyraNova2026!`) em ambos os campos → tocar "Definir nova senha".

**Critério PASS:**
- [ ] Após ~1 segundo, redireciona automaticamente para `/login?password_changed=1`
- [ ] Banner verde no topo do card de login: "Senha redefinida com sucesso. Faça login com a nova senha."
- [ ] Login com a senha NOVA funciona (cai em `/dashboard`)
- [ ] Login com a senha ANTIGA falha com "E-mail ou senha incorretos"

**Critério FAIL:**
- [ ] Tela branca / erro genérico
- [ ] Senha antiga ainda funciona (signOut global não rodou — R11 quebrado!)
- [ ] Banner verde não aparece

---

## Etapa 5 — SignOut global (R11) — exige 2 dispositivos

**Ação:** ANTES de tudo, logar com o user de teste em DOIS dispositivos:
- Dispositivo A: celular (você está aqui)
- Dispositivo B: navegador desktop ou outro celular

**Crítico:** Confirmar que ambos estão logados em `/dashboard` antes de seguir.

**Ação:** No Dispositivo A, fazer **TODO** o fluxo de "esqueci minha senha" → trocar para uma senha nova.

**Crítério PASS:**
- [ ] Dispositivo A: cai em `/login?password_changed=1` após trocar (já testado na Etapa 4)
- [ ] **Dispositivo B**: ao tentar navegar (ex: clicar em "Pacientes" no Sidebar), é redirecionado para `/login` — sessão foi invalidada
- [ ] Login com a senha NOVA funciona em ambos os dispositivos
- [ ] Login com a senha ANTIGA falha em ambos os dispositivos

**Critério FAIL:**
- [ ] Dispositivo B continua autenticado e funcional após troca em A — R11 quebrado!

---

## Etapa 6 — Broadcast 2 abas (auth.8) — exige desktop

**Ação:** No desktop, abrir 2 abas do mesmo navegador:
- Aba A: https://usekeyra.com/esqueci-senha
- Aba B: vazia (será aberta pelo email)

**Ação:** Na Aba A, preencher email cadastrado, tocar "Enviar link de redefinição" → ver "Pedido recebido". **NÃO FECHAR a aba A.**

**Ação:** Abrir email recebido, clicar no link "Redefinir minha senha" — deve abrir na Aba B (ou outra aba nova). Trocar senha.

**Critério PASS:**
- [ ] Após trocar senha na Aba B, a Aba A muda **automaticamente** (sem clicar em nada) para um card com:
  - [ ] Título: "Senha redefinida em outra aba"
  - [ ] Texto: "Você acabou de definir sua nova senha em outra janela. Pode fechar esta tela e fazer login com a nova senha."
  - [ ] Botão CTA: "Ir para o login"

**Critério FAIL:**
- [ ] Aba A continua mostrando "Pedido recebido" após Aba B trocar senha — BroadcastChannel quebrado / sem listener

---

## Etapa 7 — Anti-bombing (R14) — exige paciência

**Ação:** Preencher email cadastrado, tocar "Enviar link de redefinição" → ver "Pedido recebido". Voltar ao login. Imediatamente repetir.

**Critério PASS:**
- [ ] Visualmente: mesma mensagem "Pedido recebido" (anti-enumeration mantém a UX igual)
- [ ] Inbox: chega APENAS 1 email (o do primeiro pedido), não 2
- [ ] Após esperar 60 segundos, tentar de novo — agora deve disparar o 2º email

**Critério FAIL:**
- [ ] Inbox recebe 2 emails imediatamente — cooldown 60s não está aplicado

---

## Verdict final

- [ ] **Todas as 7 etapas PASS** → story `auth.5` + `auth.8` confirmadas Done de fato (não só "código + deploy READY")
- [ ] **Alguma etapa FAIL** → reportar com:
  - Número da etapa
  - Critério que falhou
  - Screenshot ou descrição do que aconteceu
  - Browser + versão + dispositivo
  - Hora aproximada (pra correlacionar com Sentry)

---

## Notas operacionais

- Após Etapa 5, sua senha de teste será a **NOVA** (`KeyraNova2026!`). Documentar no `.keyra-secrets/test-user-passwords.txt` (gitignored) para a próxima sessão.
- Se quiser limpar o cooldown da `password_reset_attempts` para repetir a Etapa 7 sem esperar 60s, rodar via Supabase Studio:
  ```sql
  DELETE FROM public.password_reset_attempts WHERE email_lower = 'luizzzhenriqueoficial@gmail.com';
  ```
- Sentry breadcrumbs do recovery (auth.5 AC2, implementado na fiscalização 2026-05-06) ficam em "Issues" filtrando por `category:auth.recovery` — útil pós-smoke para validar que cooldown/turnstile_fail/success aparecem na proporção esperada.
