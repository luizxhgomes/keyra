# EPIC-COMPROVANTES — Revisão de Pipeline de Documentos / OCR

**Autor:** `@document-processor` (Íris) — especialista em processamento de documentos e pipelines OCR
**Data:** 2026-05-18
**Documento revisado:** `docs/architecture/EPIC-COMPROVANTES-SPEC.md` (Status ACCEPTED — 2026-05-18)
**Referências cruzadas:** `docs/stories/EPIC-COMPROVANTES.md`, ADR-023 (`docs/architecture/ARCHITECTURE.md` §11.3)
**Workflow:** `keyra-integracoes-spec-sdc` — etapa de revisão da spec antes de `@sm *draft`

---

## Sumário executivo

A spec é sólida na arquitetura de armazenamento, no modelo de estados de `receipts`, no isolamento multitenant e na postura de "revisão humana sempre obrigatória" — que é o princípio correto para qualquer pipeline de OCR/LLM (OCR é falível, e a spec não esconde isso). O encaixe na arquitetura KEYRA (`next/after`, RLS, `Decimal.js`, signed URLs) está bem pensado.

**Porém, do ponto de vista de processamento de documentos, a spec tem furos materiais que comprometem a entrega prometida:**

1. A matriz de formatos §6 contém uma **afirmação tecnicamente incorreta** sobre PDF no tier "Visão direta" — `gpt-4o-mini` **não** consome PDF como file part nativo via AI SDK/Vercel AI Gateway. Isso não é um detalhe: é o caminho do formato mais comum de comprovante (NF-e, boleto, fatura, extrato).
2. **Não há nenhuma etapa de pré-processamento de imagem** (rotação por EXIF, desinclinação, normalização de contraste). Para uma feature cujo input primário é "foto tirada com celular", isso é uma omissão de princípio — fotos de comprovante chegam tortas, com sombra, recortadas e de cabeça para baixo. É o item #1 da minha persona e está ausente.
3. **Documentos multi-página não têm tratamento definido.** PDF de extrato com 5 páginas, DOCX com 3 páginas — a spec é silenciosa sobre quantas páginas vão à LLM, como são concatenadas, e qual o custo/limite. Isso é um beco sem saída para o caso de uso "anexar extrato".
4. O `confidence` é **único e geral**. A spec promete "campos com baixa confiança destacados" (Estágio 5) mas o schema não tem confiança por campo — então não há como destacar campo nenhum. Há contradição interna entre §5 e §7.

Nenhum desses furos é insanável, mas três deles precisam ser corrigidos **na spec** antes do draft das stories, porque mudam o escopo de `comprovantes.2` e `.3` (e o custo da extração). Os demais são endereçáveis via débito técnico explícito.

**Veredito: NEEDS_REVISION** (detalhe ao final).

---

## Achados por severidade

### 🔴 BLOQUEADOR

#### B-1 — PDF não é "Visão direta": `gpt-4o-mini` não aceita PDF como file part nativo

**Seção da spec:** §6 (matriz de formatos), linha "PDF — File part ao modelo; fallback: rasterizar"; §2 e ADR-023 §11.3 (tabela de tiers, "PDF: fallback de rasterização de páginas").

**Problema concreto.** A spec classifica PDF como **Tier Visão direta** e descreve o tratamento como "File part ao modelo; fallback: rasterizar páginas p/ imagem". Isso está invertido em relação à realidade técnica do stack escolhido:

- O suporte nativo a PDF como *file part* é uma capacidade dos modelos da **Anthropic** (Claude) e do **Google** (Gemini) via AI SDK. **OpenAI `gpt-4o-mini` não aceita PDF como conteúdo de mensagem** — o endpoint de chat/vision da OpenAI aceita `image_url` (imagens) e, separadamente, a API de Files (que é outro fluxo, com `purpose`, não é o `generateObject` com file part). Pelo Vercel AI Gateway com a string `"openai/gpt-4o-mini"`, enviar um `type: 'file'` com `mediaType: 'application/pdf'` **não funciona** — ou o gateway rejeita, ou o provider ignora/erra.
- Portanto, para o provider travado no ADR-023, **PDF SEMPRE precisa ser rasterizado para imagem** antes de ir à LLM. A rasterização não é "fallback" — é o **caminho único e obrigatório**.

**Por que é bloqueador.** PDF é o formato mais frequente entre os comprovantes do caso de uso real (NF-e, boleto bancário, fatura de cartão, extrato Cielo/Stone/Rede — todos chegam em PDF). A spec, como está, leva `comprovantes.2`/`.3` a serem draftadas assumindo um caminho "file part" que não existe. O `@dev` vai descobrir isso só na implementação, e a rasterização de PDF em serverless Node.js **não é trivial** (ver B-2). Isso é retrabalho de escopo, não um ajuste de código.

**Correção recomendada.**
1. Reclassificar PDF na matriz §6: mover para um tier próprio **"Rasterização obrigatória"** (ou agregar ao tier Visão com a ressalva explícita de que passa por rasterização sempre).
2. Reescrever o tratamento: *"PDF → rasterizar cada página relevante para PNG/JPG via biblioteca JS pura → enviar as imagens como image parts"*. Eliminar a palavra "fallback".
3. Definir a biblioteca de rasterização e validá-la em serverless (ver B-2).
4. Documentar no ADR-023 o caminho de upgrade: *quando* migrar para `anthropic/claude-haiku` (já previsto para ZDR), o PDF nativo passa a ser possível e a rasterização pode ser removida — é mais um argumento a favor daquela migração.

---

#### B-2 — Rasterização de PDF em serverless Node.js não tem biblioteca definida e é o maior risco técnico do epic

**Seção da spec:** §6 (PDF), §10 (NFR latência da extração), ausente em §12 (débitos técnicos).

**Problema concreto.** Decorrência direta de B-1: se PDF tem que virar imagem, *como*? Renderizar PDF para bitmap em runtime serverless Node.js, **sem binários de sistema** (a própria spec §6 afirma "sem LibreOffice, sem binários"), é o ponto mais frágil de todo o pipeline. As opções reais e seus problemas:

- **`pdfjs-dist`** (Mozilla PDF.js) — renderiza para canvas. Em Node.js precisa de um backend de canvas: `@napi-rs/canvas` ou `node-canvas`. `node-canvas` tem dependências nativas (Cairo) — **inviável em serverless** sem build customizado. `@napi-rs/canvas` é prebuilt e pode funcionar, mas precisa ser **validado** no runtime Fluid Compute da Vercel (tamanho do bundle, cold start, presença do binário napi para a arquitetura do lambda).
- **`pdf-to-img`** — embrulha `pdfjs-dist` + `@napi-rs/canvas`; mesma ressalva de validação.
- **`mupdf` (WASM)** — `mupdf` tem build WASM que renderiza PDF para pixmap puramente em WASM, sem binário nativo. É a opção **mais robusta para serverless**, mas o bundle WASM é pesado (afeta cold start) e a API é de baixo nível.

A spec não escolhe nenhuma, não menciona o problema do backend de canvas, e não cataloga isso como débito ou risco. Para uma equipe que ainda não validou rasterização nesse ambiente, isso é uma **incógnita de viabilidade**, não uma tarefa de implementação.

**Por que é bloqueador.** `comprovantes.3` não pode ser estimada (está marcada L/9 pts) sem saber se a rasterização de PDF é viável e qual biblioteca. Se a escolhida não funcionar em Fluid Compute, o epic inteiro derrapa. Risco de viabilidade não catalogado = risco invisível.

**Correção recomendada.**
1. Adicionar **TD-CMP-008** ao catálogo §12: *"Rasterização de PDF em serverless — biblioteca não validada; risco de viabilidade. Severidade: Alta."*
2. Inserir uma **spike de validação técnica** ANTES de `comprovantes.3` ser draftada (pode ser uma task de `comprovantes.2` ou uma story-spike própria `comprovantes.2.5`): provar que `X` rasteriza um PDF real de boleto em Fluid Compute, dentro do orçamento de cold start e bundle.
3. Recomendação técnica de partida: avaliar **`mupdf` WASM** primeiro (sem dependência nativa, previsível em serverless), com `pdf-to-img` + `@napi-rs/canvas` como segunda opção.
4. Definir limite de páginas a rasterizar (ver A-1).

---

### 🟠 ALTO

#### A-1 — Documentos multi-página: comportamento totalmente indefinido

**Seção da spec:** §3 (Estágio 2 Normalizar, Estágio 4 Ler), §6, §7 — ausente em todas.

**Problema concreto.** A spec trata implicitamente cada documento como "uma página". A realidade do caso de uso contradiz isso:

- **PDF de extrato** (Cielo/Stone/Rede, conta bancária) — facilmente 3 a 10 páginas.
- **DOCX/ODT** de fatura ou contrato — várias páginas.
- **EPUB** — multi-XHTML por definição.

Perguntas que a spec não responde:
- Quantas páginas vão à LLM? Todas? Só a primeira? As N primeiras?
- Na rasterização (B-1), N páginas viram N imagens — todas como image parts numa única chamada `generateObject`? Isso multiplica tokens de input e custo, e pode estourar limites.
- Para o tier texto/conversão, o texto de todas as páginas é concatenado num único prompt? Há limite de tamanho?
- O Zod schema (§7) extrai **um** lançamento — mas um extrato tem **dezenas** de linhas. A spec exclui "importação em lote de extratos" dos não-objetivos (§1), o que é coerente, mas então o pipeline **deve recusar ou degradar graciosamente** um documento multi-lançamento, e isso não está especificado.

**Por que é alto.** Sem isso definido, o `@dev` improvisa, e o resultado é imprevisível: ou custo de token explode, ou só a página 1 é lida silenciosamente (a usuária anexa um extrato de 8 páginas e o sistema lê só a primeira sem avisar — viola o princípio "estado honesto" do epic).

**Correção recomendada.** Adicionar à §3/§6 uma política explícita de multi-página para o MVP. Sugestão pragmática e alinhada ao escopo enxuto:
- Definir `RECEIPT_MAX_PAGES` (sugestão: 3 a 5).
- Comprovante com mais páginas que o limite → ou processa só as N primeiras **com aviso explícito na UI** ("documento com muitas páginas — revise se algo ficou de fora"), ou cai em `failed` com mensagem clara. Decisão da idealizadora.
- Como o schema extrai 1 lançamento: o prompt deve instruir o modelo a extrair **o lançamento principal/total** do documento e o pipeline assume 1 `transactions` por `receipt`. Multi-lançamento (extrato completo) é explicitamente Fase 6 — reafirmar isso na §6.

---

#### A-2 — Ausência de pré-processamento de imagem (rotação, desinclinação, contraste)

**Seção da spec:** §6 (normalização), §3 (Estágio 2) — ausente; §12 menciona EXIF só para *privacidade* (TD-CMP-002), não para *qualidade de leitura*.

**Problema concreto.** O input primário desta feature é "foto tirada com o celular" (`comprovantes.5` é dedicada a câmera). Fotos de comprovante no mundo real chegam:
- **Rotacionadas** — o sensor do celular grava a imagem em orientação física e marca a rotação correta apenas na tag **EXIF Orientation**. Bibliotecas/modelos que ignoram EXIF veem a foto deitada/de cabeça para baixo. Modelos vision lidam *razoavelmente* com rotação, mas degradam — e a confiança cai sem necessidade.
- **Inclinadas** (skew), com **perspectiva** (foto de cima, não perpendicular).
- **Com sombra, baixo contraste, recorte ruim**.

A spec não tem **nenhuma** etapa de normalização de imagem. O Estágio 2 só "detecta e converte formato". Isso contradiz frontalmente um princípio básico de pipeline de OCR/captura: *preparar a imagem antes de ler melhora drasticamente a taxa de acerto e a confiança*.

**Por que é alto (não bloqueador).** Modelos vision modernos toleram imperfeições melhor que OCR clássico (Tesseract), então a feature não *quebra* sem isso. Mas a taxa de `needs_review` com confiança baixa será sistematicamente pior, gerando mais correção manual — exatamente o atrito que o epic existe para eliminar.

**Correção recomendada.** Adicionar ao Estágio 2 (Normalizar) uma sub-etapa **"normalização de imagem"** com escopo mínimo viável para o MVP, tudo factível em JS puro com **`sharp`** (que roda em serverless e é o padrão de processamento de imagem em Node.js):
1. **Auto-rotação por EXIF Orientation** — `sharp().rotate()` sem argumento aplica a orientação EXIF automaticamente. Custo quase zero, ganho alto. **Isto deveria ser obrigatório no MVP, não débito.**
2. **Conversão HEIC → JPG** já prevista; encadear com o `sharp().rotate()`.
3. **Redimensionamento para um teto** (ex.: lado maior ≤ 2000 px) — reduz tokens de input da LLM e custo, sem perda relevante de legibilidade.
4. Desinclinação/correção de perspectiva e realce de contraste: catalogar como **TD-CMP-009** (pós-MVP) — é mais complexo e o modelo vision tolera.
5. Bônus: o `sharp` já resolve o strip de EXIF (TD-CMP-002) de graça — `rotate()` + reescrita do buffer descarta os metadados. Vale unificar TD-CMP-002 com esta etapa.

---

#### A-3 — Confiança única contradiz a promessa de "destacar campos com baixa confiança"

**Seção da spec:** §5 (Estágio Revisar — "Campos com baixa confiança destacados"), §7 (Zod schema — `confidence` único 0..1), §10.

**Problema concreto.** Há contradição interna na spec:
- §5 promete: *"Campos com baixa confiança destacados."*
- §7 entrega: um único `confidence: z.number()` descrito como *"Confiança geral da extração"*.

Com um confidence **geral**, não existe informação para destacar **campo nenhum** — só dá para colorir o documento inteiro de "atenção" ou não. A funcionalidade prometida em §5 é irrealizável com o schema de §7.

Do ponto de vista de processamento de documentos, isto importa: numa foto de boleto, o modelo pode ler o **valor** com altíssima confiança e a **data de vencimento** com baixa (campo borrado). O valor agregado da revisão assistida vem justamente de apontar *qual* campo merece olhar — destacar o documento todo é ruído.

**Por que é alto.** Não é cosmético: é a diferença entre uma tela de revisão útil e uma genérica. E a minha persona (Íris) exige explicitamente "score de confiança" como mecanismo de qualidade — um score que não orienta a revisão cumpre o requisito só no papel.

**Correção recomendada.** Escolher uma das duas, e fixar na §7:
- **Opção A (recomendada):** confiança por campo. Reestruturar o schema para que cada campo extraído venha com sua confiança — por exemplo, um objeto paralelo `field_confidence: { gross_amount: number, reference_date: number, ... }`, ou cada campo como `{ value, confidence }`. Manter também um `confidence` geral derivado (mínimo ou média). Isto habilita o destaque por campo de §5 de verdade.
- **Opção B (mínimo):** se confiança por campo for considerada custo demais para o MVP, então **corrigir §5** para remover a promessa de destaque por campo e dizer "comprovantes com confiança geral baixa são sinalizados na lista e na tela de revisão". É honesto, mas perde valor.
- Em qualquer caso, **definir o limiar numérico** (ex.: `< 0.7` = baixa confiança) numa env ou constante, não deixar implícito. A spec hoje fala em "baixa confiança" sem nunca dizer o que é baixo.

---

#### A-4 — RTF marcado como tier de conversão "best effort" subestima a fragilidade real

**Seção da spec:** §6 (linha RTF), §12 (TD-CMP-004).

**Problema concreto.** A spec coloca RTF junto com ODT/EPUB como "Conversão / Baixa (best effort)" e TD-CMP-004 trata os três como bloco único de severidade Baixa. Da perspectiva de parsing de documentos, **RTF é qualitativamente pior que ODT/EPUB**, e agrupá-los esconde isso:
- **ODT e EPUB** são ZIP + XML bem estruturado. Unzip + parse de `content.xml` / XHTML é determinístico e razoavelmente confiável — eu não os chamaria de "Baixa", chamaria de "Média". O texto sai limpo.
- **RTF** é um formato de marcação de controle aninhada (`{\rtf1 ... \cf2 ...}`), com escapes, code pages, e tabelas de fontes. Parsers RTF em JS puro são poucos, mal mantidos, e quebram em RTF gerado por Word/WordPad com tabelas e imagens embutidas. A taxa de falha aqui é **alta**, não baixa.

Além disso: RTF é um formato **raríssimo** como comprovante financeiro. Ninguém emite NF-e ou boleto em RTF. O custo de suportá-lo (mesmo "best effort") não se justifica.

**Por que é alto.** Não é o risco em si (o fallback de registro manual cobre), é a **classificação enganosa**: agrupar RTF com ODT/EPUB faz a spec parecer mais capaz do que é e induz estimativa errada em `comprovantes.2`.

**Correção recomendada.**
1. Separar a linha RTF na matriz §6: reclassificar como **"Não suportado para leitura automática no MVP"** — o arquivo ainda é aceito e armazenado (princípio "armazenamento aceita qualquer binário"), mas vai direto para registro manual, sem tentativa de extração. Isso é mais honesto e elimina uma dependência frágil.
2. Reclassificar ODT/EPUB de "Baixa" para "Média" — são mais confiáveis do que a spec diz.
3. Reescrever TD-CMP-004 para refletir a separação.

---

### 🟡 MÉDIO

#### M-1 — Imagem que é só um scan/foto sem texto legível não tem caminho de falha definido

**Seção da spec:** §7 (tratamento de erro), §6.

**Problema concreto.** A tabela de tratamento de erro §7 cobre timeout, schema inválido, rate limit, e "documento ilegível → confiança baixa → needs_review". Mas há um caso intermediário não tratado: a usuária anexa uma foto que **não é um comprovante** (uma selfie, um print de conversa, um documento em branco), ou um PDF que é um scan de página em branco. O modelo vai retornar *algum* objeto Zod-válido (porque o schema obriga campos), provavelmente com valores inventados ou zerados e confiança baixa — mas o pipeline tratará como `needs_review` normal.

A spec instrui o prompt a "nunca inventar valores" e "baixar a confiança", o que ajuda, mas não há uma **porta de saída explícita** para "isto não é um comprovante". O `document_type: 'outro'` + confiança muito baixa é o sinal disponível, mas a spec não diz o que fazer com ele.

**Correção recomendada.** Definir na §7 um tratamento para "não parece um documento financeiro": se `confidence` abaixo de um piso duro (ex.: `< 0.3`) **e** `document_type === 'outro'`, marcar com um sub-estado/aviso forte na revisão ("não conseguimos identificar isto como um comprovante — confira o arquivo"). Não precisa ser um status novo; pode ser um campo de aviso. O importante é não apresentar valores fantasma como se fossem uma extração comum.

#### M-2 — `extraction_raw_text` e o destino do texto OCR não estão coerentes para o tier Visão

**Seção da spec:** §3 (Estágio 4, grava `extraction_raw_text`), §4 (coluna), §7.

**Problema concreto.** A coluna `extraction_raw_text` é descrita como "texto bruto lido pela IA". Para o tier texto/conversão, faz sentido — é o texto que foi para o prompt. Para o tier **Visão** (imagem/PDF rasterizado), o `generateObject` retorna **só o objeto estruturado**, não um "texto bruto" — não há OCR intermediário. A spec não diz se, para imagens, esse campo fica `NULL`, ou se o prompt deve pedir um campo de transcrição literal junto.

Isto interage com a revisão (§5): seria útil mostrar a transcrição ao lado da imagem, mas isso exigiria pedir ao modelo um campo `raw_text` no schema — o que hoje não existe.

**Correção recomendada.** Decidir e documentar: ou (a) `extraction_raw_text` é `NULL` para tier Visão e a coluna serve só ao tier texto — aceitável; ou (b) adicionar ao Zod schema §7 um campo `raw_text: z.string()` ("transcrição literal do que está escrito no documento") e popular a coluna a partir dele em todos os tiers. A opção (b) tem custo de token mas dá um artefato de auditoria valioso e uniformiza a coluna. Recomendo (b) se o orçamento permitir, senão (a) com a coluna renomeada mentalmente para "texto-fonte quando aplicável".

#### M-3 — Idempotência por `file_hash` não cobre "duas fotos do mesmo comprovante" — concordo com o adiamento, mas a spec deve dizer isso na seção certa

**Seção da spec:** §3 (Estágio 1, passo 6), §10 (NFR Idempotência), §1 (não-objetivos).

**Problema concreto.** `UNIQUE (org_id, file_hash)` deduplica **arquivos byte-idênticos** — reenvio do mesmo arquivo. Não cobre o caso real: a usuária tira **duas fotos** do mesmo boleto (enquadramento diferente → hashes diferentes → dois `receipts` → risco de duas `transactions` para a mesma despesa). A pergunta do briefing é se deixar isso para a Fase 6 (reconciliação) é aceitável.

**Avaliação (Íris):** **Concordo com o adiamento.** Detectar "mesmo documento, bytes diferentes" exige *perceptual hashing* de imagem ou casamento semântico do conteúdo extraído (mesmo valor + mesma data + mesma contraparte) — isso é literalmente o trabalho da reconciliação (Fase 6) e seria sobre-engenharia no MVP. **Mas** a spec hoje dá a impressão, na §10 ("NFR Idempotência: reenvio do mesmo arquivo não duplica"), de que o problema de duplicação está resolvido. Não está — só o caso byte-idêntico está.

**Correção recomendada.** Não implementar nada novo. Apenas adicionar uma frase de honestidade na §10 e/ou §1: *"A idempotência cobre arquivos idênticos (mesmo `file_hash`). Dois arquivos diferentes do mesmo comprovante (ex.: duas fotos) podem gerar dois lançamentos — a deduplicação semântica é da Fase 6 (reconciliação). Mitigação no MVP: a tela de revisão e a lista de comprovantes mostram o que já foi registrado, dando à usuária a chance de perceber a duplicata."* Honestidade de escopo, não código.

#### M-4 — Scrubbing de PII em logs cobre Sentry mas não os logs de runtime/console nem o AI Gateway

**Seção da spec:** §9 (Vazamento de PII em logs → "Scrubbing Sentry estendido"), §12.

**Problema concreto.** A spec garante scrubbing **no Sentry**. Mas dados brutos de comprovante (valores, CPF, nome de contraparte) podem vazar por outros canais que a spec não cobre:
- **`console.log`/`console.error`** dentro de `processReceipt`, `extractReceipt`, ou no tratamento de erro — esses vão para os logs de runtime da Vercel (Fluid Compute), que não passam pelo scrubber do Sentry. A própria spec §11 lista `instrumentation*.ts` em `comprovantes.3` para scrubbing, mas o scrubbing do Sentry SDK não filtra `console` que vai para o stdout do lambda.
- **O AI Gateway** registra requests; com `disallowPromptTraining: true` o conteúdo não é usado para treino, mas o **conteúdo do prompt (o documento) passa pela infra do gateway** — isto é uma decisão de compliance já coberta pela Política v1.1.0, então não é furo novo, mas vale ser explícito.
- A spec menciona scrubbing de `signed_url` — bom — mas a signed URL expira em 60s e não é PII em si; o conteúdo *atrás* dela é o risco.

**Correção recomendada.** Em §9/§12, ampliar a mitigação de "vazamento de PII em logs":
1. Regra explícita de código: **proibido** `console.*` com `extraction_data`, `extraction_raw_text`, `reviewed_data`, ou o buffer do arquivo. Logar somente IDs e `status`. Adicionar isso como item de revisão do `@dev` em `comprovantes.3` (espelha a regra de scrubbing já existente no projeto para outros dados sensíveis).
2. Confirmar que o erro gravado em `extraction_error` é uma **mensagem categórica** (`'timeout'`, `'schema_invalid'`) e **nunca** o payload do documento ou a resposta crua do modelo.
3. Catalogar como linha em §12 se não for tratado em `comprovantes.3`.

#### M-5 — NFR de latência de extração < 30s: realista para imagem única, otimista para PDF multi-página rasterizado

**Seção da spec:** §10 (NFR "Latência da extração ponta-a-ponta < 30 s típico").

**Problema concreto.** O alvo de < 30s é razoável para `gpt-4o-mini` vision com **uma** imagem. Mas o "ponta-a-ponta" inclui, para PDF: download do Storage → **rasterização de N páginas** (B-1/B-2 — pode ser segundos por página dependendo da biblioteca, especialmente WASM com cold start) → N imagens → chamada LLM com N image parts (mais tokens = mais latência). Com 3-5 páginas e cold start do lambda, 30s fica apertado. A spec apresenta o número como se fosse uniforme para todos os tiers.

**Correção recomendada.** Diferenciar o NFR §10 por tier: < 15-20s para imagem única e texto; < 30-45s para PDF multi-página rasterizado. Ou manter 30s como alvo de imagem única e marcar PDF como "best effort de latência". Como tudo roda em `next/after` (não bloqueia a usuária) e a UI mostra "processando", a latência alta não é crítica para UX — mas o NFR deve ser **honesto** para não virar falso descumprimento. Reforça também a necessidade de `RECEIPT_MAX_PAGES` (A-1).

#### M-6 — Validação de MIME por magic bytes vs. formatos que são containers ZIP

**Seção da spec:** §3 (Estágio 1, passo 3 — "Valida MIME real por magic bytes ... biblioteca tipo `file-type`").

**Problema concreto.** DOCX, ODT e EPUB são **todos arquivos ZIP** — seus magic bytes iniciais são idênticos (`PK\x03\x04`). A biblioteca `file-type` lida com isso inspecionando o conteúdo interno do ZIP (presença de `word/document.xml`, `mimetype` com `application/epub+zip`, etc.), e geralmente acerta — mas a spec trata "validar MIME por magic bytes" como se fosse trivial. Para esses três formatos a detecção é mais sutil, e um ODT mal-formado pode ser detectado como `application/zip` genérico e cair em "Outro / failed" indevidamente.

**Correção recomendada.** Nota de implementação na §3/§6: a detecção dos containers ZIP (DOCX/ODT/EPUB) depende de inspeção interna; validar que a `file-type` (ou equivalente) distingue os três corretamente, e definir o comportamento quando o resultado é `application/zip` genérico (tentar tratar como ODT/DOCX por heurística do conteúdo, ou recusar com mensagem clara). Pequeno, mas evita falso "formato não suportado".

---

### 🔵 BAIXO

#### L-1 — Campo `payment_method` ausente do schema de extração

**Seção da spec:** §7 (Zod schema).

O schema extrai `document_type` mas não a **forma de pagamento** (Pix, cartão de crédito/débito, dinheiro, boleto). Para uma clínica, saber que uma receita entrou por Pix vs. cartão é informação financeira relevante e quase sempre está visível no comprovante. Não é bloqueante — a usuária preenche na revisão — mas é um campo barato de extrair e que reduz digitação. Recomendo avaliar adicionar `payment_method: z.enum([...]).nullable()`. Verificar antes se `transactions` tem coluna correspondente; se não tiver, fica para Fase 6.

#### L-2 — `reference_date`: a descrição diz ISO mas o caso de uso tem duas datas

**Seção da spec:** §7 (`reference_date`).

O schema tem um único `reference_date` ("data de competência"). Comprovantes financeiros costumam ter **duas** datas: data de emissão e data de vencimento/pagamento (claro em boleto e fatura). "Competência" é ambíguo entre elas. Para o MVP com 1 data, está aceitável, mas o `describe()` deve ser explícito sobre **qual** data o modelo deve priorizar (sugiro: a data do efetivo pagamento/recebimento, pois é o que importa para fluxo de caixa e DRE), senão o modelo escolhe sozinho e a confiança/consistência sofre.

#### L-3 — WEBP e animação / HEIC sequencial

**Seção da spec:** §6.

Detalhe menor de robustez: WEBP pode ser animado e HEIC pode conter sequência de imagens (Live Photo). O pipeline deve sempre extrair o **primeiro frame**. `sharp` e `heic-convert` por padrão pegam a imagem principal, então provavelmente já está coberto — mas vale uma linha de nota para o `@dev` não ser surpreendido.

#### L-4 — Texto sem limite de tamanho no prompt (tier texto/conversão)

**Seção da spec:** §6, §7.

Para TXT/MD/HTML/DOCX, "conteúdo enviado como texto no prompt" não tem teto. Um TXT de 5 MB (dentro do `RECEIPT_MAX_BYTES`) estoura o contexto do modelo. Definir um limite de caracteres para o texto enviado (truncar com aviso) — relacionado a A-1.

---

### ⚪ NIT

- **N-1 (§6):** A coluna "Confiabilidade" da matriz mistura duas dimensões — confiabilidade da *conversão* (DOCX → texto) e confiabilidade da *extração* pela LLM. São coisas diferentes. Renomear para "Confiabilidade da conversão" deixa claro que a extração ainda depende da qualidade do conteúdo.
- **N-2 (§3, Estágio 4):** "Gera signed URL de curta duração (≤ 60 s)" — para o caso em que o artefato é **texto** (tier conversão), não há signed URL: o texto é carregado direto. A frase "ou carrega o texto" cobre, mas a ordem sugere que signed URL é o caminho padrão. Pequena clareza redacional.
- **N-3 (§4, DDL):** `extraction_confidence numeric(4,3)` aceita `0.000`–`9.999`; o `CHECK BETWEEN 0 AND 1` corrige na prática. Sem problema, só observo que `numeric(4,3)` é folgado — `numeric(4,3)` está ok, mantenha o CHECK.
- **N-4 (§11):** A story `comprovantes.3` concentra normalização-de-imagem (se A-2 for aceito), rasterização de PDF (B-1/B-2), conversões e a chamada LLM. Se A-2 e B-2 entrarem, `comprovantes.3` provavelmente passa de 9 pts — revisar a estimativa, ou mover a normalização de imagem/PDF para `comprovantes.2` (que já é "ingestão + normalização").

---

## Veredito final

**NEEDS_REVISION**

A spec não pode seguir para `@sm *draft` como está. A arquitetura de armazenamento, RLS, estados e a postura de revisão humana estão maduras e aprovadas — mas a **camada de leitura de documentos**, que é o coração da feature e o meu domínio, contém uma afirmação tecnicamente incorreta (B-1: PDF não é file part nativo no `gpt-4o-mini`) e uma incógnita de viabilidade não catalogada (B-2: rasterização de PDF em serverless). Esses dois bloqueadores mudam o escopo e a estimativa de `comprovantes.2`/`.3` e precisam ser resolvidos **no documento** antes do draft. Os achados ALTO A-1, A-2 e A-3 são furos de especificação que, se não fechados na spec, serão improvisados pelo `@dev` com resultado imprevisível.

**Condições para virar APPROVED:**
1. Corrigir B-1 — reclassificar PDF como rasterização obrigatória; remover a noção de "file part nativo" para `gpt-4o-mini`.
2. Endereçar B-2 — catalogar TD-CMP-008 e inserir spike de validação de rasterização antes de `comprovantes.3`.
3. Definir a política multi-página (A-1) — `RECEIPT_MAX_PAGES` + comportamento de degradação.
4. Adicionar pré-processamento de imagem mínimo (A-2) — auto-rotação EXIF via `sharp` como obrigatório no MVP; resto como TD-CMP-009.
5. Resolver a contradição §5↔§7 sobre confiança (A-3) — confiança por campo, ou corrigir a promessa de §5; e fixar o limiar numérico.
6. Reclassificar RTF (A-4) — fora do escopo de leitura automática.

Os achados MÉDIO e BAIXO podem ser endereçados via ajuste de redação na spec ou catalogados como débito explícito, sem bloquear. Reviso novamente após a rodada de correções.

---

## Resumo de contagem

| Severidade | Quantidade |
|------------|------------|
| 🔴 BLOQUEADOR | 2 |
| 🟠 ALTO | 4 |
| 🟡 MÉDIO | 6 |
| 🔵 BAIXO | 4 |
| ⚪ NIT | 4 |
| **Total** | **20** |

---

*Revisão produzida por `@document-processor` (Íris) no workflow `keyra-integracoes-spec-sdc`. Próximo passo: `@aiox-master`/`@architect` aplicam as correções de B-1, B-2, A-1, A-2, A-3, A-4 na spec; re-submeter para nova revisão antes de `@sm *draft comprovantes.0`.*
