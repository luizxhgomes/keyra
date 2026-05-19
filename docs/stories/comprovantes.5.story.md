# Story comprovantes.5: Captura mobile — câmera direta + PWA Share Target (Android) + smoke iOS/Android

## Status

Ready

## Story

**Como** Camila, profissional de estética que opera a clínica pelo celular durante o dia,
**Eu quero** tirar a foto de um comprovante na hora — sem sair do app, sem passar pela galeria — e também conseguir compartilhar uma imagem que já recebi no WhatsApp ou tenho na galeria diretamente para o KEYRA,
**Para que** anexar um comprovante seja um gesto de poucos segundos no momento em que o documento chega às minhas mãos, em vez de uma tarefa que eu adio até estar no computador.

Esta story **estende a superfície de upload** entregue em `comprovantes.4a` (campo de upload + lista de comprovantes + `ReceiptCard`). Não cria pipeline novo: a foto tirada na câmera e a imagem compartilhada caem na **mesma Server Action `uploadReceipt`** já existente. O escopo é exclusivamente a *entrada* — captura por câmera no mobile e recebimento via PWA Share Target no Android.

## Complexidade

**T-shirt:** M (~5 pontos)

> A complexidade não está em volume de código — é pouca coisa — está em **risco de fronteira RSC + comportamento real de mobile**. Câmera (`<input capture>`), PWA install e Share Target só se provam funcionais com aparelho real: build verde não diz nada (RSC Regra 4). O custo da story é o smoke duplo iOS/Android, não a implementação.

## Acceptance Criteria

### AC1 — Captura por câmera direta no campo de upload (mobile)

1. O campo de upload de comprovante (componente entregue em `comprovantes.4a`, em `app/(app)/financeiro/comprovantes/`) ganha uma **segunda forma de anexar**: além de "escolher arquivo", uma ação explícita **"Tirar foto"**.
2. A ação "Tirar foto" usa um `<input type="file" accept="image/*" capture="environment">` — o atributo `capture="environment"` instrui o browser mobile a abrir a câmera traseira diretamente, sem passar pelo seletor de galeria.
3. Em **desktop**, onde `capture` não tem efeito, a ação "Tirar foto" **não é exibida** (ou é exibida apenas como "escolher imagem") — não pode haver um botão morto. A detecção é por capability, não por user-agent string (ex.: verificar suporte a `capture` ou usar media query de ponteiro grosseiro `(pointer: coarse)`).
4. A foto capturada é submetida pela **mesma `uploadReceipt(formData)`** já consumida pelo upload de arquivo de `comprovantes.4a` — nenhuma Server Action nova é criada nesta story.
5. Após a captura, o comprovante aparece na lista com `status='pending'` (estado honesto — "processando"), exatamente como um upload de arquivo. A foto entra no pipeline `next/after` de normalização/extração sem tratamento especial.
6. O `<input>` de câmera **não substitui** o `<input>` de arquivo — ambos coexistem. A usuária escolhe a forma; o sistema não decide por ela (princípio "anexar é uma ação, não um formulário").

### AC2 — `manifest.ts` criado (KEYRA passa a ser PWA instalável)

1. Criado `apps/web/src/app/manifest.ts` exportando o `MetadataRoute.Manifest` do Next 16 (não `manifest.json` estático — a convenção do App Router é o arquivo `manifest.ts`).
2. O manifest declara, no mínimo: `name` (`KEYRA — Financeiro operacional para estética`), `short_name` (`KEYRA`), `start_url` (`/`), `display` (`standalone`), `background_color` e `theme_color` alinhados aos tokens de marca (consultar `docs/brand/` — ivory de fundo, cocoa/terracota), e `icons` reaproveitando os ícones já existentes (`src/app/icon.svg`, `src/app/apple-icon.tsx`) ou ícones PNG adicionais nos tamanhos exigidos para instalação (mínimo 192×192 e 512×512, incluindo um ícone `purpose: 'maskable'`).
3. O `layout.tsx` referencia o manifest — em Next 16 o arquivo `manifest.ts` é detectado automaticamente; confirmar que `<link rel="manifest">` é emitido no HTML.
4. Criar o manifest **não pode quebrar** o comportamento atual: a sales page em `/` (rewrite para `landing.html`) e as rotas autenticadas continuam funcionando. `start_url` aponta para `/` — a usuária instalada cai na landing/login, fluxo normal.
5. `theme_color` e ícones não introduzem percentual nem gráfico — é só metadado de instalação, sem impacto nos princípios UX de tela.

### AC3 — PWA Share Target configurado para receber imagens (Android)

1. O `manifest.ts` declara um campo `share_target` que registra o KEYRA como destino de compartilhamento de **imagens** no Android:
   - `action`: rota dedicada que recebe o arquivo compartilhado (sugerido: `/financeiro/comprovantes/compartilhar`).
   - `method`: `POST`.
   - `enctype`: `multipart/form-data`.
   - `params.files`: um item aceitando `accept: ['image/*']` (e, se viável sem custo extra, `application/pdf`).
2. A rota de destino do `share_target` recebe o `POST` `multipart/form-data` com o arquivo, **valida a sessão** (`requireAuth()` — guard server-side, invariante do projeto; usuária não autenticada é redirecionada a `/login` preservando a intenção quando possível) e encaminha o arquivo para o **mesmo fluxo `uploadReceipt`** — sem pipeline paralelo.
3. Após receber o arquivo compartilhado, a usuária é levada à **lista/tela de comprovantes** vendo o item recém-criado em `status='pending'` — confirmação visual honesta de que o compartilhamento funcionou. Não há tela de "sucesso" separada nem beco sem saída.
4. **Limitação documentada, não escondida:** PWA Share Target é suportado em **Android (Chrome/Edge)**; o **iOS/Safari não suporta** Share Target via manifest. No iOS o caminho de captura é a câmera direta (AC1) e o upload de arquivo de `comprovantes.4a`. A story não tenta um polyfill de Share Target para iOS — registra a limitação como esperada (ver Dev Notes).
5. O Share Target só funciona **com o PWA instalado**. A story documenta esse pré-requisito; não há promessa de Share Target em aba de browser comum.

### AC4 — Fronteira RSC respeitada (Gate G5 — RSC Boundary)

1. O componente de captura por câmera vive na superfície correta: se precisa de interação do browser (`onChange` do `<input>`, detecção de capability), é Client Component (`'use client'`); se é só markup, é Server. Nenhum `forwardRef` (ícone Lucide, `Button`/`Card` shadcn) é passado **como prop** através da fronteira Server↔Client (Regra 1).
2. Nenhum Client Component importa Server Component diretamente (Regra 2).
3. Nenhum uso de `useSyncExternalStore` é introduzido (Regra 3) — se a detecção de capability precisa de estado client-side, usar `useState + useEffect + queueMicrotask` conforme `docs/dev/rsc-boundary-rules.md`.
4. A rota de destino do `share_target` (Route Handler ou page que processa `POST`) não viola a fronteira: processamento do `FormData` é server-side.
5. `./scripts/check-rsc-boundaries.sh` roda **verde** localmente e no CI (job `rsc-audit` do workflow `rls-tests.yml`).
6. Antes de marcar a story Done, ler integralmente `docs/dev/rsc-boundary-rules.md` (4 regras + checklist de PR).

### AC5 — Touch target AA (Gate G3 — 44×44 mínimo)

1. A ação "Tirar foto" é um alvo clicável novo — cumpre `min-h-[44px]` (e largura equivalente) conforme W3C/Apple HIG, igual ao botão de upload de arquivo de `comprovantes.4a`.
2. Caso a ação seja deliberadamente menos proeminente que o upload padrão, a hierarquia é alcançada por cor/contraste/posição — **nunca** por reduzir a área clicável. Qualquer exceção exige waiver explícito da idealizadora no Change Log.

### AC6 — Smoke real ponta a ponta em mobile (iOS + Android) — gate inegociável

1. **iOS (Safari, aparelho real):** abrir o KEYRA em sessão autenticada → ir à tela de comprovantes → ação "Tirar foto" → a câmera traseira abre direto → fotografar um comprovante real (ex.: comprovante de Pix) → confirmar que o comprovante aparece na lista em `status='pending'` e entra no pipeline.
2. **Android (Chrome, aparelho real):** repetir o fluxo de câmera do item 1 **e adicionalmente**: instalar o KEYRA como PWA → abrir um app de imagem (galeria ou WhatsApp) → usar "Compartilhar" → selecionar **KEYRA** na folha de compartilhamento → confirmar que a imagem cai na tela de comprovantes em `status='pending'`.
3. Ambos os smokes são executados pela **idealizadora** (Camila / persona real) — não pelo agente, não em emulador. Emulador não prova comportamento de câmera nem de Share Target.
4. **Evidência anexada ao PR:** print ou descrição de cada um dos dois fluxos concluídos, mais a URL do Sentry confirmando **zero issue novo** durante os smokes.
5. Sem os **dois** smokes (iOS e Android) concluídos e evidenciados, a story **não é Done** — ver Definition of Done.

### AC7 — Build, lint, types e CI verdes

1. `pnpm typecheck` passa sem erros.
2. `pnpm lint --max-warnings 0` passa.
3. `pnpm build` conclui (verde — mas explicitamente **não** é prova de funcionalidade, ver AC6).
4. `./scripts/check-rsc-boundaries.sh` verde local e no CI.
5. CI completo (`rls-tests.yml`: suíte RLS + RSC audit + Vercel deploy preview) verde no PR.

### AC8 — Branch + commit + PR + merge + Vercel READY

1. Branch dedicada partindo de `main` (sugerido `feat/comprovantes-5-captura-mobile`).
2. Conventional commits em pt-BR.
3. PR aberta com body estruturado, incluindo a seção de evidência de smoke mobile (AC6).
4. Após Gate G5 (RSC) + `@qa` PASS + smoke duplo evidenciado, merge squash em `main`.
5. Vercel prod deploy READY.
6. `docs/STATE.md` sincronizado refletindo `comprovantes.5` Done.

## Tasks / Subtasks

- [ ] Pre-flight: confirmar que `comprovantes.4a` está Done e identificar o arquivo exato do campo de upload + a assinatura de `uploadReceipt` (`comprovantes/actions.ts`)
- [ ] Pre-flight: confirmar ausência de `manifest.ts`/`manifest.json` hoje (verificado no draft — não existe) e inventariar ícones disponíveis (`icon.svg`, `apple-icon.tsx`)
- [ ] Branch `feat/comprovantes-5-captura-mobile` partindo de `main`
- [ ] **AC1** — adicionar ação "Tirar foto" ao campo de upload: `<input type="file" accept="image/*" capture="environment">` reutilizando `uploadReceipt`
- [ ] **AC1** — detecção de capability (esconder "Tirar foto" em desktop sem botão morto) — via `(pointer: coarse)` / suporte a `capture`, sem user-agent sniffing
- [ ] **AC2** — criar `apps/web/src/app/manifest.ts` (`MetadataRoute.Manifest`): name, short_name, start_url, display standalone, cores de marca, ícones (incl. 192/512 e `maskable`)
- [ ] **AC2** — gerar/ajustar ícones PNG nos tamanhos exigidos para instalação, se os atuais não cobrirem
- [ ] **AC2** — confirmar `<link rel="manifest">` emitido e que `/` (sales page) + rotas autenticadas seguem intactas
- [ ] **AC3** — declarar `share_target` no `manifest.ts` (action, POST, multipart/form-data, params.files com `image/*`)
- [ ] **AC3** — criar rota de destino `/financeiro/comprovantes/compartilhar` que recebe o `POST`, faz `requireAuth()` e encaminha o arquivo para `uploadReceipt`, depois redireciona para a lista de comprovantes
- [ ] **AC4** — auditar fronteira RSC: posicionar componente de câmera (Client/Server correto), sem `forwardRef` cruzando boundary, sem `useSyncExternalStore`
- [ ] **AC5** — garantir `min-h-[44px]` na ação "Tirar foto"
- [ ] **AC7** — `pnpm typecheck` + `pnpm lint --max-warnings 0` + `pnpm build` + `./scripts/check-rsc-boundaries.sh` verdes
- [ ] Ler `docs/dev/rsc-boundary-rules.md` integralmente antes de submeter (AC4.6)
- [ ] **Gate G5 (RSC Boundary)** — verificação manual + automatizada
- [ ] **AC6** — smoke real iOS (câmera) executado pela idealizadora em aparelho real — evidência coletada
- [ ] **AC6** — smoke real Android (câmera + instalar PWA + Share Target via WhatsApp/galeria) executado pela idealizadora em aparelho real — evidência coletada
- [ ] **AC6** — URL do Sentry confirmando zero issue novo durante os smokes
- [ ] QA self-gate (`@qa`)
- [ ] Commit final + push + PR open + CI verde + merge squash (operação exclusiva `@devops`)
- [ ] `docs/STATE.md` sync refletindo `comprovantes.5` Done

## Dependencies

- **Interna:** `comprovantes.4a` (UI lista + upload + `ReceiptCard`) — **deve estar Done**. Esta story estende o campo de upload e reutiliza `uploadReceipt`; sem `.4a` não há superfície sobre a qual construir.
- **Interna (encadeada):** `comprovantes.1` (tabela `receipts` + bucket) e `comprovantes.2` (`uploadReceipt` + normalização) — pré-requisitos de `.4a`, logo já satisfeitos quando `.4a` está Done.
- **Externa (idealizadora):** disponibilidade da idealizadora com **um aparelho iOS real e um aparelho Android real** para executar o smoke duplo (AC6). Sem isso a story não fecha — é a dependência crítica de cronograma.
- **Sem dependência de `comprovantes.3`/`.4b`:** captura é só *entrada*; a extração LLM e a tela de revisão não precisam estar prontas para esta story funcionar (a foto cai em `pending` e segue o pipeline existente).

## Definition of Done

- [ ] Todos os 8 ACs atendidos
- [ ] Ação "Tirar foto" funcional no campo de upload, reutilizando `uploadReceipt`, escondida em desktop sem botão morto (AC1)
- [ ] `apps/web/src/app/manifest.ts` criado; KEYRA instalável como PWA; `/` e rotas autenticadas intactas (AC2)
- [ ] `share_target` declarado e rota de destino funcional com `requireAuth()` (AC3)
- [ ] **Gate G5 (RSC Boundary)** verde — `./scripts/check-rsc-boundaries.sh` passa local e no CI; `docs/dev/rsc-boundary-rules.md` lido (AC4)
- [ ] Touch target da ação "Tirar foto" cumpre `min-h-[44px]` (AC5)
- [ ] `pnpm typecheck` + `pnpm lint --max-warnings 0` + `pnpm build` verdes (AC7)
- [ ] CI completo verde no PR (RLS + RSC audit + Vercel deploy) (AC7/AC8)
- [ ] **SMOKE REAL — CRITÉRIO INEGOCIÁVEL (RSC Regra 4):** a idealizadora executou, em **aparelho iOS real**, o fluxo de câmera direta (tirar foto de um comprovante → vê-lo entrar no pipeline em `status='pending'`) **E**, em **aparelho Android real**, o fluxo de câmera **E** o fluxo de PWA Share Target (instalar PWA → compartilhar imagem do WhatsApp/galeria → vê-la cair em comprovantes). **Os dois smokes — iOS e Android — são obrigatórios; um só não fecha a story.** Build verde não substitui este gate.
- [ ] Evidência dos dois smokes anexada ao PR (descrição/print de cada fluxo) + URL do Sentry com zero issue novo (AC6)
- [ ] PR mergeado em `main`; Vercel prod deploy READY (AC8)
- [ ] `docs/STATE.md` atualizado refletindo `comprovantes.5` Done
- [ ] Limitação iOS sem Share Target documentada (não é defeito — é fato da plataforma)

## Dev Notes

### Por que `<input capture>` e não a Media Capture API (`getUserMedia`)

A captura por câmera tem dois caminhos no browser:

1. **`<input type="file" accept="image/*" capture="environment">`** — o browser mobile abre o app de câmera nativo, a usuária fotografa, o resultado volta como `File` no `<input>`. Zero código de stream, zero permissão gerenciada manualmente, comportamento idêntico ao de um upload de arquivo comum.
2. **`navigator.mediaDevices.getUserMedia()`** — abre um stream de vídeo dentro da página, exige UI própria de viewfinder, captura de frame em `<canvas>`, gestão de permissão e de ciclo de vida do stream.

**Esta story usa exclusivamente o caminho 1.** É o que casa com o princípio "anexar é uma ação, não um formulário" e com o escopo M (5 pts): o `File` resultante entra na **mesma `uploadReceipt`** sem nenhum tratamento especial. `getUserMedia` seria over-engineering — fica fora de escopo (e nem é cogitado no MVP).

> `capture="environment"` pede a câmera traseira (a correta para fotografar um documento). `capture="user"` seria a frontal. Em desktop o atributo é ignorado — daí AC1.3 esconder a ação para não deixar botão morto.

### Estado atual do PWA no KEYRA — não existe manifest

Verificado no draft: **não há `manifest.ts` nem `manifest.json`** em `apps/web`. O `layout.tsx` define `metadata` (title, description, `applicationName: 'KEYRA'`) e existem `src/app/icon.svg` + `src/app/apple-icon.tsx`, mas **o KEYRA não é hoje um PWA instalável**. Não há service worker.

Consequência para esta story: **`comprovantes.5` é a story que torna o KEYRA instalável.** O `manifest.ts` é criado aqui porque o PWA Share Target (AC3) o exige — Share Target é um campo do manifest e só funciona com o app instalado. Criar o manifest é, portanto, pré-requisito técnico do Share Target, não um extra.

> **Service worker:** Share Target via `method: POST`/`enctype: multipart/form-data` no Android **não exige** um service worker que intercepte o `POST` — o navegador entrega o `multipart/form-data` direto na `action` URL como uma navegação POST normal. A rota de destino server-side processa o `FormData`. Portanto **esta story não introduz service worker** — mantém o escopo M. (Service worker para offline/cache é assunto de outra story futura, fora deste epic.)

### Por que tudo reusa `uploadReceipt` — nada de pipeline paralelo

O EPIC-COMPROVANTES define um único pipeline: `Anexar → Normalizar → Armazenar → Ler → Revisar → Registrar`. A spec (§3 Estágio 1) lista `uploadReceipt(formData)` como a porta de entrada única — e o diagrama da §2 já prevê "upload web / câmera / Share Tgt" convergindo no mesmo Estágio 1.

`comprovantes.5` honra isso: a foto da câmera e a imagem compartilhada são apenas **novas origens do mesmo `File`** que `uploadReceipt` já sabe tratar (validação de MIME por magic bytes, hash, idempotência, `next/after`). **Nenhuma Server Action nova.** Se a implementação se vir tentada a criar `uploadReceiptFromCamera` ou similar, é sinal de desvio de escopo — parar e reusar.

A rota do `share_target` (AC3.2) é a única peça server nova: ela existe só para receber o `POST` do Android, autenticar e **delegar** a `uploadReceipt`. É um adaptador fino, não um pipeline.

### Limitação de plataforma — iOS não tem Share Target (e tudo bem)

PWA Share Target via manifest é suportado em **Android (Chrome/Edge)**. **iOS/Safari não implementa** `share_target` — não há manifest field que faça o KEYRA aparecer na folha de compartilhamento do iOS.

Isto **não é um bug a corrigir** nesta story. É uma diferença de plataforma conhecida. No iOS o caminho de entrada rápida é a **câmera direta (AC1)**, que funciona perfeitamente no Safari mobile, somada ao upload de arquivo de `comprovantes.4a`. A story documenta a limitação (AC3.4) e o QA não deve tratá-la como CONCERN. Tentar um polyfill (ex.: Web Share API só funciona como *origem*, não como *destino*, no iOS) seria escopo inventado — proibido pelo Artigo IV (No Invention).

### Por que o smoke duplo é o coração da story (RSC Regra 4)

`docs/dev/rsc-boundary-rules.md` Regra 4 é explícita: **build verde não é funcional.** O Dashboard ficou quebrado em produção por mais de 1h apesar de Sprints 5/6/7 fecharem "Done" com deploy READY — porque ninguém abriu o produto em sessão real.

Câmera e Share Target são *exatamente* o tipo de funcionalidade que `tsc`/`eslint`/`next build`/emulador **não conseguem provar**:
- `<input capture>` só abre a câmera traseira em um aparelho com câmera traseira.
- Share Target só aparece na folha de compartilhamento de um Android com o PWA realmente instalado.

Por isso AC6 e o DoD exigem **dois smokes independentes** (iOS e Android), executados pela idealizadora em aparelhos reais — alinhado também com a regra de validação dupla do projeto (defesa contra falso positivo Sprint 5/6/7). Um smoke só não fecha: iOS valida câmera; Android valida câmera **e** Share Target. São superfícies distintas.

### Princípios UX inegociáveis aplicáveis

- **Anexar é uma ação, não um formulário** — "Tirar foto" e "escolher arquivo" coexistem como duas ações simples; a usuária escolhe, o sistema não interroga (AC1.6).
- **Estado honesto** — a foto capturada/compartilhada aparece na lista em `status='pending'` ("processando"), nunca um falso "pronto" nem spinner eterno (AC1.5, AC3.3).
- **Sem gráfico, sem percentual** — esta story não toca copy de dashboard nem comparativos; manifest é metadado puro (AC2.5). Gate G1 trivialmente satisfeito.

### Gates Phase 3.5

Conforme `EPIC-COMPROVANTES.md` (tabela de gates) e a spec §11: `comprovantes.5` tem **Compliance WAIVED, Financial WAIVED, Data-engineer WAIVED**. O único gate obrigatório é o **G5 (RSC Boundary)** — esta story é puramente de *entrada* (não cria `transactions`, não envia nada a LLM, não toca dados pessoais além de reusar o upload já auditado em `.2`). Se a implementação derivar para algo que toque o ledger ou envie dados externos, **parar** — isso seria outra story.

### Arquivos-chave previstos (File List a confirmar pelo `@dev`)

- `apps/web/src/app/manifest.ts` — **novo** (manifest PWA + `share_target`)
- `apps/web/src/app/(app)/financeiro/comprovantes/` — campo de upload de `.4a` estendido com a ação "Tirar foto" (arquivo exato confirmado no pre-flight)
- `apps/web/src/app/(app)/financeiro/comprovantes/compartilhar/` — **nova** rota de destino do `share_target`
- Possíveis ícones PNG novos (192/512/maskable) em `apps/web/public/` ou `src/app/`, se os atuais não cobrirem os requisitos de instalação
- `docs/STATE.md` — sync ao fechar

## QA Results

_(a preencher pelo @qa após implementação)_

## Change Log

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2026-05-18 | 1.0 | Story criada a partir de `EPIC-COMPROVANTES.md` (story `comprovantes.5`, 5 pts, M) e `EPIC-COMPROVANTES-SPEC.md` §11. Escopo: captura por câmera direta (`<input capture>`) estendendo o campo de upload de `comprovantes.4a` + criação do `manifest.ts` (KEYRA passa a ser PWA instalável — verificado: não existe manifest hoje) + PWA Share Target para Android reusando `uploadReceipt`. 8 ACs testáveis. Gate único G5 (RSC Boundary). Definition of Done exige smoke real DUPLO (iOS câmera + Android câmera/Share Target) pela idealizadora em aparelhos reais como critério inegociável (RSC Regra 4 + regra de validação dupla do projeto). Limitação iOS sem Share Target documentada como fato de plataforma, não defeito. Pendente: `@po *validate-story-draft`. | `@sm` (River) |
| 2026-05-18 | 1.1 | `@po` validou **10/10 — GO**. Checklist: título claro; descrição completa com persona real (Camila); 8 ACs testáveis (cada item verificável, AC6 com passo a passo iOS/Android); escopo IN/OUT bem delimitado (Dev Notes descarta `getUserMedia`, service worker e polyfill iOS de Share Target — Artigo IV); dependência de `comprovantes.4a` clara (descrição + seção Dependencies + tasks + arquivos-chave) e não-dependência de `.3`/`.4b` explicitada; estimativa M (~5 pts) batendo com Epic/spec §11; valor de negócio claro (anexar vira gesto de segundos); riscos documentados (RSC Regra 4 como coração da story, limitação iOS, dependência de aparelhos reais); Definition of Done exige smoke real DUPLO iOS+Android pela idealizadora em aparelhos reais como critério inegociável; alinhamento total com `EPIC-COMPROVANTES.md` e spec. Escopo do `manifest.ts` bem delimitado — criado porque o Share Target o exige, com justificativa técnica. Status Draft → Ready. **Concerns não-bloqueantes para `@dev`:** (C1) confirmar G3 touch target 44×44 no PR; (C2) `start_url` aponta para `/` (sales page) — confirmar no smoke que o PWA instalado leva a usuária logada a destino útil via `proxy.ts`, não a uma landing de vendas; (C3) `theme_color`/`background_color` usam tokens reais de `docs/brand/`, não hex soltos; (C4) decidir e documentar explicitamente o comportamento do arquivo compartilhado quando o redirect a `/login` ocorre (multipart POST provavelmente não sobrevive ao redirect — aceitável no MVP, mas não prometer recuperação inexistente). | `@po` (Pax) |
