# Story comprovantes.0: Política de Privacidade v1.1.0 + re-aceite forçado + FAQ "como a IA usa meus documentos"

## Status

Ready

## Story

**Como** mantenedor do KEYRA preparando o lançamento da funcionalidade Comprovantes Inteligentes,
**Eu quero** publicar a Política de Privacidade v1.1.0 (que declara o tratamento de documentos por IA), implementar um mecanismo de re-aceite forçado que bloqueie o acesso à plataforma até a usuária aceitar a versão vigente, e disponibilizar um FAQ claro sobre como a IA usa os documentos anexados,
**Para que** o pipeline de leitura de comprovantes por LLM externa (`comprovantes.3`) tenha **base legal vigente e consentimento renovado** antes de ir a produção — sem isso, o EPIC-COMPROVANTES não pode ativar a feature de IA em prod (achados CMP-A1 e CMP-A2 da auditoria de compliance; condição 2 do veredito; item 2 do Critério de Saída do EPIC).

## Complexidade

**T-shirt:** M (~6 pontos)

**Gate Phase 3.5:** `@compliance-br` (Têmis) — **obrigatório** (a Política é entregável da Têmis). Financial e Data-engineer: **WAIVED** (`EPIC-COMPROVANTES.md` §"Gates Phase 3.5 por story").

## Acceptance Criteria

### AC1 — Política de Privacidade v1.1.0 publicada como arquivo canônico (endereça CMP-A1, CMP-M3)

1. **Given** o arquivo `docs/legal/privacy-v1.1.0-DRAFT.md` existe como DRAFT, **when** esta story é implementada, **then** o conteúdo é movido para `docs/legal/privacy-v1.1.0.md` (arquivo final, sem o sufixo `-DRAFT`).
2. No arquivo final, o cabeçalho muda de `**Status:** 📝 DRAFT — pendente de revisão jurídica` para `**Status:** ✅ Vigente`; o rodapé deixa de conter "(versão 1.1.0 — DRAFT, pendente de revisão jurídica)".
3. **Decisão editorial mantida (Migration 032):** o corpo do texto **não** contém travessões (en-dash `–` U+2013 nem em-dash `—` U+2014) — substituídos por espaço único. Verificação: `grep -nP '[\x{2013}\x{2014}]' docs/legal/privacy-v1.1.0.md` retorna 0 matches no corpo (cabeçalho/avisos em blockquote seguem o mesmo padrão da v1.0.0).
4. O conteúdo cobre, no mínimo (já presente no DRAFT — confirmar na migração): finalidade "leitura automatizada de comprovantes por IA" (§2.3, §9-A), base legal **execução de contrato** complementada por consentimento (§3), **OpenAI** e **Vercel AI Gateway** na tabela de subprocessadores (§4) e na transferência internacional (§5), papéis controlador/operador para dados de terceiros nos comprovantes (§2.3, §2.2), e a seção **9-A — Uso de Inteligência Artificial** com a explicação honesta de retenção transitória (sem ZDR) e `disallowPromptTraining`.
5. O arquivo `docs/legal/privacy-v1.0.0.md` **não** é apagado nem alterado — versões anteriores são preservadas (auditabilidade).

### AC2 — Migration seedando a v1.1.0 em `legal_documents` (endereça CMP-A1)

1. Migration nova `supabase/migrations/{timestamp}_seed_privacy_v1_1_0.sql`, timestamp posterior a `20260506000100`.
2. A migration faz `INSERT` em `public.legal_documents` com `type='privacy'`, `version='1.1.0'`, `content_md` = conteúdo integral de `privacy-v1.1.0.md`, `content_hash` = SHA-256 hex do `content_md` (calculado e fixado na migration; mesmo padrão do seed v1.0.0).
3. A migration marca a v1.0.0 como deprecada: `UPDATE public.legal_documents SET deprecated_at = now() WHERE type='privacy' AND version='1.0.0' AND deprecated_at IS NULL`.
4. **Given** a view `legal_documents_current` retorna a última versão não-deprecated por tipo, **when** a migration é aplicada, **then** `SELECT version FROM legal_documents_current WHERE type='privacy'` retorna `'1.1.0'`.
5. Migration idempotente: `INSERT` protegido contra reaplicação (a UNIQUE `(type, version)` já garante, mas usar `ON CONFLICT (type, version) DO NOTHING` para não abortar em reaplicação).
6. **Terms NÃO é tocado** — só a Política de Privacidade muda nesta story; `terms` v1.0.0 permanece vigente.

### AC3 — RPC `user_consent_status` detecta consentimento desatualizado (endereça CMP-A2)

1. Migration cria a função `public.user_consent_status()` `SECURITY DEFINER` com `SET search_path = public, pg_temp`.
2. A função, para o usuário do JWT corrente (`auth.uid()`), compara — **por tipo** (`privacy` e `terms`) — a versão vigente em `legal_documents_current` com o documento que o usuário aceitou em `user_consent_records`.
3. Retorna um resultado estruturado que permite ao chamador decidir se há re-aceite pendente, no mínimo: `privacy_current_version`, `privacy_accepted` (boolean — usuário aceitou a versão vigente de privacy), `terms_accepted` (boolean), `needs_reacceptance` (boolean — `true` se qualquer documento vigente não foi aceito).
4. `GRANT EXECUTE` para `authenticated`.
5. **Given** um usuário aceitou apenas a v1.0.0 de privacy, **when** `user_consent_status()` é chamada após a v1.1.0 estar vigente, **then** `privacy_accepted = false` e `needs_reacceptance = true`.
6. **Given** um usuário aceitou a v1.1.0, **when** a função é chamada, **then** `needs_reacceptance = false`.
7. A função é resiliente a usuário sem nenhum consent (caso de borda) — retorna `needs_reacceptance = true`, nunca erro.

### AC4 — Helper `lib/auth/check-consent.ts` (endereça CMP-A2)

1. Arquivo novo `apps/web/src/lib/auth/check-consent.ts` com `import 'server-only'` (mesmo padrão de `require-auth.ts`).
2. Exporta uma função server-side (ex.: `getConsentStatus()`) que chama a RPC `user_consent_status` via `createServerClient()` e retorna o status tipado.
3. **Falha segura:** se a RPC retornar erro (ex.: rede, função ausente), o helper **não** lança exceção que derrube a página — retorna um status que **não** força re-aceite (`needs_reacceptance = false`), para não trancar a usuária fora da plataforma por uma falha de infraestrutura. O erro é capturado para o Sentry. Justificativa registrada nas Dev Notes.
4. `pnpm typecheck` passa — o tipo de retorno é explícito, sem `any`.

### AC5 — `requireAuth()` estendido com checagem de re-aceite (endereça CMP-A2)

1. `apps/web/src/lib/auth/require-auth.ts` é estendido: após validar `user` e `orgId`, chama `getConsentStatus()` e, se `needs_reacceptance === true`, executa `redirect('/aceite/privacidade')`.
2. A ordem dos guards é preservada: sem `user` → `/login`; sem `orgId` → `/onboarding/nova-organizacao`; consentimento desatualizado → `/aceite/privacidade`. Os guards anteriores têm precedência.
3. **A própria rota `/aceite/privacidade` não pode usar o guard que redireciona para ela** — sob risco de loop infinito. A página de aceite usa um guard que valida apenas `user` + `orgId` (sem a checagem de consentimento) ou chama `getConsentStatus()` diretamente sem o `redirect`. Solução registrada nas Dev Notes.
4. **Given** uma usuária autenticada que aceitou só a v1.0.0, **when** ela acessa qualquer rota `(app)/*` (ex.: `/dashboard`), **then** é redirecionada para `/aceite/privacidade`.
5. **Given** uma usuária que aceitou a v1.1.0, **when** ela acessa `/dashboard`, **then** a página carrega normalmente — zero regressão para quem está em dia.

### AC6 — Página `/aceite/privacidade` + Server Action de re-aceite (endereça CMP-A2)

1. Rota nova `apps/web/src/app/aceite/privacidade/page.tsx` — fora do grupo `(app)` para não herdar o AppShell completo nem o guard que causa loop (ver AC5.3).
2. A página exibe: aviso claro de que a Política foi atualizada e o motivo (lançamento de Comprovantes Inteligentes / leitura por IA), link para ler a Política v1.1.0 integral em `/privacidade`, e um botão de aceite explícito.
3. Server Action nova (ex.: `aceitar/actions.ts` colado à rota) que: chama `requireAuth`-equivalente sem o redirect de consentimento; busca o `id` da Política vigente de `privacy` em `legal_documents_current`; grava um `INSERT` em `public.user_consent_records` com `user_id = auth.uid()`, `document_id` = id da v1.1.0, `ip_address` e `user_agent` lidos de `headers()` (mesmo padrão de `cadastro/actions.ts`).
4. O `INSERT` respeita a UNIQUE `(user_id, document_id)` — se a usuária reabrir a página e reenviar, `ON CONFLICT DO NOTHING` evita erro; o consent já gravado é imutável (RLS bloqueia UPDATE — `auth.1` AC3).
5. **Given** a usuária na página `/aceite/privacidade`, **when** ela confirma o aceite, **then** um `user_consent_records` da v1.1.0 é criado **e** ela é redirecionada para `/dashboard` (ou rota pós-login padrão), que agora carrega sem novo redirect.
6. O botão de aceite cumpre o touch target mínimo `min-h-[44px]` (gate G3) — é um botão de ação primária.
7. A Server Action lê IP de `x-forwarded-for` (primeiro segmento) e `user-agent` de `headers()`, exatamente como `signUpAction` faz.

### AC7 — FAQ "como a IA usa meus documentos" (endereça CMP-A1)

1. Conteúdo de FAQ em linguagem clara explicando o tratamento por IA dos comprovantes, cobrindo no mínimo: o que a IA faz (lê o documento, extrai valor/data/descrição/direção), o que a IA **não** faz (não decide sozinha, não treina com os dados, não cria perfil), que a leitura é auxiliar e falível (revisão humana obrigatória), retenção transitória sem ZDR, e que o uso da IA só ocorre quando a usuária anexa um documento.
2. O FAQ é acessível à usuária — implementado como **seção da página `/aceite/privacidade`** (resumo do tratamento por IA, com link para a §9-A da Política integral) **ou** como página dedicada linkada da `/aceite/privacidade` e da Política. A decisão concreta é registrada nas Dev Notes; o conteúdo da §9-A da Política v1.1.0 é a fonte de verdade — o FAQ não inventa conteúdo novo, apenas reapresenta a §9-A de forma acessível.
3. O FAQ não usa percentuais em copy (gate G1) e segue o tom editorial da KEYRA.

### AC8 — Tipos TypeScript regenerados + qualidade

1. `pnpm typegen` regenera `apps/web/src/types/database.types.ts` incluindo a função `user_consent_status` (e a v1.1.0 já é dado, não schema — só a RPC entra nos tipos).
2. `pnpm typecheck` passa sem erros.
3. `pnpm lint --max-warnings 0` passa.
4. `./scripts/check-rsc-boundaries.sh` passa — a página `/aceite/privacidade` e a Server Action respeitam as 4 regras RSC (`docs/dev/rsc-boundary-rules.md`): nenhum `forwardRef` cruzando boundary, Client não importa Server, sem `useSyncExternalStore`.

### AC9 — Bloqueio explícito de `comprovantes.3` registrado

1. Esta story registra (Dev Notes + Change Log) que `comprovantes.3` (pipeline LLM) **não pode ir a produção** antes de: (a) a Política v1.1.0 publicada e seedada (`AC1`+`AC2`); e (b) o re-aceite forçado ativo em produção (`AC3`–`AC6`). Reforça o item 2 do Critério de Saída do `EPIC-COMPROVANTES.md` e a condição 2 do veredito da `COMPLIANCE-AUDIT-EPIC-COMPROVANTES.md`.
2. Ao atingir Done, a story atualiza a tabela §5 ("Mapa de achados por story") da `COMPLIANCE-AUDIT-EPIC-COMPROVANTES.md` marcando `CMP-A1`, `CMP-A2` e `CMP-M3` como endereçados (append no Change Log do documento de auditoria).

### AC10 — Branch + commit + push + PR + merge + Vercel READY

1. Branch partindo de `main` atual, nome no padrão `feat/comprovantes-0-...`.
2. Conventional commits em pt-BR.
3. PR aberta com body estruturado citando os achados endereçados (CMP-A1, CMP-A2, CMP-M3).
4. CI checks PASS (RSC audit + RLS suite + Vercel deploy).
5. Após gate `@compliance-br` APPROVE + `@qa` PASS, merge squash em `main`.
6. Vercel prod deploy READY; smoke pós-deploy (ver Definition of Done).
7. `docs/STATE.md` sincronizado refletindo `comprovantes.0` Done.

## Tasks / Subtasks

- [ ] Pre-flight: confirmar que `legal_documents` e `user_consent_records` existem em prod (criadas por `auth.1`); confirmar última migration (`20260506000100`); confirmar que não há v1.1.0 de privacy já seedada
- [ ] Branch `feat/comprovantes-0-politica-v1-1-0-reaceite` partindo de `main`
- [ ] **AC1** — mover `docs/legal/privacy-v1.1.0-DRAFT.md` → `docs/legal/privacy-v1.1.0.md`; atualizar cabeçalho (Status → Vigente) e rodapé; remover travessões residuais (validar com `grep -nP`)
- [ ] **AC2** — migration `{timestamp}_seed_privacy_v1_1_0.sql`: `INSERT` da v1.1.0 com `content_hash` SHA-256 + `UPDATE` deprecando a v1.0.0; `ON CONFLICT DO NOTHING`
- [ ] **AC3** — na mesma migration (ou migration irmã): função `public.user_consent_status()` `SECURITY DEFINER` + `GRANT EXECUTE` para `authenticated`
- [ ] Validar migration localmente via `./scripts/run-rls-tests.sh` (Postgres efêmero) ou validação Docker; se Docker off, snapshot + rollback prontos
- [ ] **Idealizadora autoriza** `supabase db push` aplicando a migration em prod (schema/dados em sistema externo)
- [ ] Após apply: `pnpm typegen` regenera `database.types.ts` com a RPC `user_consent_status`
- [ ] **AC4** — `apps/web/src/lib/auth/check-consent.ts` com `import 'server-only'`, `getConsentStatus()` com falha segura
- [ ] **AC5** — estender `require-auth.ts` com checagem de re-aceite (redirect `/aceite/privacidade`); guard sem-loop para a rota de aceite
- [ ] **AC6** — página `apps/web/src/app/aceite/privacidade/page.tsx` + Server Action de re-aceite (`INSERT` em `user_consent_records` com IP/UA)
- [ ] **AC7** — conteúdo de FAQ "como a IA usa meus documentos" (seção da página de aceite ou página dedicada — decisão registrada nas Dev Notes)
- [ ] **AC8** — `pnpm typecheck` + `pnpm lint --max-warnings 0` + `./scripts/check-rsc-boundaries.sh` verdes
- [ ] Gate G1 (princípios — copy sem percentual) + G3 (touch target 44×44 no botão de aceite) + G5 (RSC boundary)
- [ ] Smoke pós-apply: usuário de teste que aceitou só v1.0.0 → ao abrir `/dashboard` é redirecionado para `/aceite/privacidade`; após confirmar aceite → `/dashboard` carrega
- [ ] Smoke de não-regressão: usuário que aceita a v1.1.0 → `/dashboard` carrega direto, sem redirect
- [ ] **AC9** — atualizar §5 da `COMPLIANCE-AUDIT-EPIC-COMPROVANTES.md` (append no Change Log) marcando CMP-A1/A2/M3 endereçados
- [ ] Gate `@compliance-br` (Têmis) — `*lgpd-audit`: revisar Política v1.1.0 publicada, base legal, subprocessadores, re-aceite forçado, FAQ
- [ ] QA self-gate (@qa) — 7 checks
- [ ] Commit final + push + PR open + CI verde + smoke prod + merge squash (`@devops`)
- [ ] `docs/STATE.md` sync

## Dependencies

- **Interna:** `auth.1` ✅ Done — fornece as tabelas `legal_documents`, `user_consent_records` e a view `legal_documents_current`. `auth.2`/Migration 031-032 ✅ — seedaram `privacy` v1.0.0 (esta story segue exatamente o mesmo padrão de seed). Esta story **não** depende de `comprovantes.1`–`.5`.
- **Paralelismo:** `comprovantes.0` é **paralelizável com `comprovantes.1`** — sem arquivo compartilhado exceto `database.types.ts` (regen ao final de cada story; resolver conflito de regen na ordem de merge). `EPIC-COMPROVANTES.md` §"Cadeia de dependências".
- **Bloqueio que esta story remove:** `comprovantes.3` (pipeline LLM) **fica bloqueada para produção** até esta story estar Done — é a precondição legal de go-live (CMP-A1+CMP-A2; veredito §6 da auditoria; Critério de Saída do EPIC item 2).
- **Externa (idealizadora):** autorização para `supabase db push` em prod (seed de dado legal + função nova). A revisão jurídica da Política (mencionada como pendente no DRAFT) é decisão da idealizadora — registrar no PR se foi feita ou se segue como ressalva.

## Definition of Done

- [ ] Todos os 10 ACs atendidos
- [ ] `docs/legal/privacy-v1.1.0.md` existe como arquivo final (sem `-DRAFT`), com Status Vigente e sem travessões no corpo
- [ ] Migration aplicada em prod; `legal_documents_current` retorna `version='1.1.0'` para `type='privacy'`; v1.0.0 com `deprecated_at` preenchido
- [ ] `content_hash` da v1.1.0 confere com SHA-256 do `content_md` seedado
- [ ] RPC `user_consent_status` existe, com `GRANT EXECUTE` para `authenticated`, e retorna `needs_reacceptance` correto nos dois cenários (aceitou v1.0.0 → true; aceitou v1.1.0 → false)
- [ ] `requireAuth()` redireciona para `/aceite/privacidade` quando o consentimento está desatualizado; rota de aceite não entra em loop
- [ ] Página `/aceite/privacidade` funcional; Server Action grava `user_consent_records` imutável da v1.1.0 com IP/UA
- [ ] FAQ "como a IA usa meus documentos" acessível à usuária
- [ ] `pnpm typegen` regenerou os tipos; `pnpm typecheck` + `pnpm lint --max-warnings 0` + `./scripts/check-rsc-boundaries.sh` verdes
- [ ] Smoke prod **duplo** (defesa contra falso positivo — `feedback_double_validation_smoke`): (1) usuário que aceitou v1.0.0 é forçado ao re-aceite e, após aceitar, navega normalmente; (2) usuário que aceitou v1.1.0 não vê redirect — em momentos/devices independentes
- [ ] Gate `@compliance-br` APPROVE (Política publicada, base legal, subprocessadores, re-aceite, FAQ)
- [ ] Gate `@qa` PASS
- [ ] §5 da `COMPLIANCE-AUDIT-EPIC-COMPROVANTES.md` atualizada (CMP-A1, CMP-A2, CMP-M3 marcados como endereçados)
- [ ] PR mergeado em `main`; Vercel prod deploy READY
- [ ] `docs/STATE.md` atualizado refletindo `comprovantes.0` Done
- [ ] Registrado explicitamente que `comprovantes.3` continua bloqueada para prod até esta story estar Done — agora desbloqueado quando esta atingir Done

## Dev Notes

### Por que o re-aceite forçado é obrigatório (não cosmético)

A Política v1.1.0 introduz um **tratamento de dado pessoal inédito**: o conteúdo de documentos financeiros (com PII da clínica, de pacientes e de terceiros) é enviado a uma LLM externa (OpenAI `gpt-4o-mini` via Vercel AI Gateway) que **não opera sob ZDR**. LGPD Art. 8º §6 é direto: quando a finalidade do tratamento muda, o consentimento anterior **deixa de ser válido** e exige novo consentimento. A v1.0.0 não menciona IA, não lista OpenAI como subprocessador e não descreve essa transferência internacional. Publicar a v1.1.0 sem forçar re-aceite ativaria a feature de IA sobre consentimento que não a cobre — violação de Art. 7º + Art. 8º §6 + Art. 9º.

Por isso a Migration 032 (`legal_documents_v1_0_0_no_dashes`) **não** gerou nova versão (mudança cosmética = mesma `1.0.0`), mas esta story **gera v1.1.0** — a mudança é material.

### Estado atual do `requireAuth()` — o que falta

`apps/web/src/lib/auth/require-auth.ts` hoje checa **apenas** `user` (→ `/login`) e `orgId` (→ `/onboarding/nova-organizacao`). **Não há nenhuma checagem de versão de consentimento.** A Política v1.0.0 §12 já *promete* "modal de re-aceite no próximo login", mas o mecanismo nunca foi implementado — esta story o materializa (achado CMP-A2 da auditoria).

### Como evitar o loop de redirect na rota de aceite

Se `/aceite/privacidade` usar o `requireAuth()` estendido, e o usuário tem consentimento desatualizado, o guard redireciona para `/aceite/privacidade` — que redireciona de novo — loop infinito. Duas soluções aceitáveis (escolher uma na implementação e registrar):

1. A página `/aceite/privacidade` fica **fora do grupo `(app)`** (rota `app/aceite/privacidade/`, não `app/(app)/...`) e usa um guard mínimo que valida só `user` + `orgId` — uma função separada (ex.: `requireAuthBare()`) ou chamada direta a `getCurrentUser`/`getActiveOrgId` sem o passo de consentimento.
2. O guard estendido recebe um parâmetro opcional `{ skipConsentCheck: true }` usado apenas pela página de aceite.

Recomendação: opção 1 — rota fora de `(app)` é mais explícita e não acopla um parâmetro de exceção ao guard universal. Espelha o padrão já usado por `(auth)/*` e `(public)/*` (grupos sem o AppShell autenticado).

### Por que o helper `check-consent.ts` falha de forma segura

Se a RPC `user_consent_status` falhar por rede/timeout, **não** se pode trancar a usuária fora da plataforma — isso transformaria um soluço de infraestrutura em uma negação de serviço total. O helper, em erro, retorna `needs_reacceptance = false` (libera o acesso) e captura o erro no Sentry. O risco residual — uma janela curta em que um usuário com consentimento desatualizado acessa a app durante uma falha da RPC — é aceitável e muito menor que o de trancar todos. O acesso é re-verificado a cada navegação; assim que a RPC volta, o re-aceite é exigido. Decisão de defesa-em-profundidade, registrada para o gate da Têmis.

### Padrão de gravação do consent — espelhar `cadastro/actions.ts`

A Server Action de re-aceite reaproveita o padrão vivo de `apps/web/src/app/(auth)/cadastro/actions.ts`: lê `x-forwarded-for` (primeiro segmento) para `ip_address` e `user-agent` de `headers()`. A diferença é que aqui **não** há `auth.signUp` nem RPC atômica de criação de conta — o usuário já existe e tem org; é só um `INSERT` em `user_consent_records` da v1.1.0. A imutabilidade do registro é garantida pela RLS de `auth.1` (UPDATE bloqueado).

### Padrão de seed de `legal_documents` — espelhar Migration 031/032

`auth.2` seedou `privacy` v1.0.0 via migration com `content_md` inline (`$LEGAL$ ... $LEGAL$` dollar-quote) e `content_hash` SHA-256 fixado. Esta story segue exatamente isso para a v1.1.0. O `INSERT` é INSERT-only via service_role (RLS de `legal_documents` bloqueia `INSERT` para `authenticated` — `auth.1` AC2) — por isso o seed vive na migration, não em código de app.

### FAQ — fonte de verdade é a §9-A da Política

A §9-A ("Uso de Inteligência Artificial") da Política v1.1.0 já contém o texto completo e aprovado: o que a IA faz, o que não faz, leitura auxiliar e falível, retenção transitória, escolha da usuária. O FAQ **não** redige conteúdo novo (Constitution Art. IV — No Invention) — reapresenta a §9-A de forma acessível no ponto de decisão (a página de aceite). Recomendação: seção dentro de `/aceite/privacidade` com um resumo curto + link "ler na íntegra" para `/privacidade#9-a`. Se a idealizadora preferir página dedicada, registrar a decisão.

### Escopo OUT (explícito)

- **Schema de `receipts`, bucket de Storage, RLS de Storage:** é `comprovantes.1`. Esta story não toca nada de Storage.
- **Pipeline LLM, scrubbing do Sentry estendido, `extraction_data`:** é `comprovantes.3` (achado CMP-A4). Esta story só **desbloqueia** `comprovantes.3` legalmente.
- **`purgeOrgStorage` (CMP-A5):** contrato definido em `comprovantes.1`. Fora desta story.
- **Strip de EXIF (CMP-M1):** `comprovantes.2`. Fora desta story.
- **Revogação de consentimento / tabela `user_consent_revocations`:** mencionada como Sprint futura em `auth.1` Dev Notes — não é desta story. O re-aceite aqui é só "aceitar a versão nova", não "revogar".
- **Termos de Uso v1.1.0:** não há mudança nos Termos nesta story; só a Política de Privacidade.

### Riscos

- **R1 — `content_hash` divergente:** se o `content_md` seedado não bater byte-a-byte com `privacy-v1.1.0.md` (ex.: travessão residual, whitespace), o hash registrado fica inconsistente com a fonte. Mitigação: calcular o hash a partir do mesmo conteúdo exato inserido; AC1.3 + AC2.2 cobrem.
- **R2 — Loop de redirect:** ver seção dedicada acima; AC5.3 é o gate.
- **R3 — Negação de serviço por falha da RPC:** mitigado pela falha segura do helper (AC4.3).
- **R4 — Regressão para usuários em dia:** todo usuário que aceitou a v1.0.0 será forçado ao re-aceite — comportamento **correto e intencional**. O risco é redirecionar quem já está na v1.1.0; AC5.5 + smoke de não-regressão cobrem.

## QA Results

_(a preencher pelo @qa após implementação)_

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-18 | 1.0 | Story criada. Escopo: publicar Política de Privacidade v1.1.0 (mover DRAFT → final + seed em `legal_documents` com `content_hash`), implementar re-aceite forçado (RPC `user_consent_status` + helper `check-consent.ts` + `requireAuth()` estendido + página `/aceite/privacidade` + Server Action de re-aceite) e FAQ "como a IA usa meus documentos". Endereça CMP-A1, CMP-A2 e CMP-M3 da `COMPLIANCE-AUDIT-EPIC-COMPROVANTES.md`; desbloqueia `comprovantes.3` para produção. 10 ACs com smoke testável (Given/When/Then), gate `@compliance-br` obrigatório. Paralelizável com `comprovantes.1`. | `@sm` (River) |
| 2026-05-18 | 1.1 | **@po validou 10/10 — veredito GO.** Checklist de 10 pontos: título claro (3 entregáveis explícitos), descrição completa (problema legal — base legal vigente antes do pipeline LLM), 10 ACs testáveis com Given/When/Then e smokes verificáveis (`grep -nP`, `SELECT` em `legal_documents_current`), escopo IN/OUT explícito (seção "Escopo OUT" com 6 itens), dependências mapeadas (`auth.1` Done, paralela a `.1`, desbloqueio de `comprovantes.3`), estimativa M (~6 pts), valor de negócio claro (precondição legal de go-live), riscos R1-R4 com mitigação + gates G1/G3/G5 reconhecidos, DoD com smoke duplo e gate `@compliance-br`, alinhamento com EPIC/SPEC §11/COMPLIANCE-AUDIT. **Concern não-bloqueante propagado ao @dev:** a revisão jurídica da Política (pendente no DRAFT) é decisão da idealizadora — confirmar explicitamente o status dessa revisão e registrá-lo no PR antes do merge. Status Draft → Ready. | `@po` (Pax) |
