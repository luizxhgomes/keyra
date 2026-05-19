# COMPLIANCE-AUDIT — EPIC-COMPROVANTES (Comprovantes Inteligentes)

**Documento:** Auditoria Preventiva de Compliance LGPD
**Status:** ⚠️ **CONCERNS — endereçável**
**Data:** 2026-05-18
**Autor:** `@compliance-br` (Têmis) — Auditoria de Compliance KEYRA
**Tipo:** Auditoria preventiva (pré-implementação) — gate Phase 3.5 antecipado para a fase de spec

**Documentos auditados / referências:**
- `docs/architecture/ARCHITECTURE.md` §11.3 — **ADR-023** (Comprovantes Inteligentes — provider lock + arquitetura)
- `docs/architecture/EPIC-COMPROVANTES-SPEC.md` — **SPEC** arquitetural completa (com §9 Segurança e §12 catálogo TD-CMP)
- `docs/stories/EPIC-COMPROVANTES.md` — **EPIC** com 6 stories `comprovantes.0`–`comprovantes.5`
- `docs/legal/privacy-v1.0.0.md` — Política de Privacidade **vigente** (versão 1.0.0)
- `docs/audit/auth-v2-security-audit.md` — auditoria de referência (padrão/tom)
- Código auditado: `apps/web/src/lib/auth/require-auth.ts`, `apps/web/src/lib/observability/sentry-scrub.ts`, `apps/web/src/instrumentation.ts`, `apps/web/src/instrumentation-client.ts`

---

## 1. Sumário executivo

O EPIC-COMPROVANTES introduz um vetor de tratamento de dados pessoais inédito na KEYRA: **documentos financeiros carregados pela usuária — que contêm PII da clínica, dos pacientes e de terceiros — são enviados a uma LLM externa (`openai/gpt-4o-mini` via Vercel AI Gateway) que NÃO opera sob ZDR (Zero Data Retention)**. A spec e o ADR-023 já reconhecem boa parte dos riscos e propõem mitigações concretas (RLS em `receipts` e `storage.objects`, trigger de auditoria customizado, scrubbing estendido, Política v1.1.0 com re-aceite forçado, signed URLs de curta duração). Esse é um nível de maturidade de design acima do habitual em pré-implementação. **Porém**, nenhuma dessas mitigações está implementada ainda, várias dependem de código que hoje **não cobre o cenário novo** (o boundary `requireAuth()` não checa versão de consentimento; o scrubbing do Sentry não conhece os campos novos), e a base legal para o tratamento por IA simplesmente **não existe na Política vigente** (v1.0.0).

**Veredito: CONCERNS — endereçável.** Não há impeditivo arquitetural — todos os achados têm caminho de resolução claro e já mapeado nas stories `comprovantes.0`–`.5`. Mas a feature **não pode ir a produção** com os achados CRÍTICO/ALTO em aberto. Em particular, `comprovantes.3` (envio do documento à LLM) é **bloqueada** até a Política v1.1.0 estar publicada e o re-aceite forçado ativo em produção — exigência já cravada no Critério de Saída do EPIC (item 2) e reforçada por esta auditoria.

---

## 2. Escopo da auditoria

**Analisado:**
- Fluxo de dados ponta-a-ponta do pipeline de 6 estágios (Anexar → Normalizar → Armazenar → Ler IA → Revisar → Registrar).
- Categorias de dado pessoal tratadas: conteúdo dos comprovantes (valores, datas, contraparte/`counterparty`), metadados de arquivo, EXIF de fotos, identidade da usuária que faz upload (`uploaded_by`/`reviewed_by`).
- Base legal e transparência do tratamento por LLM externa sem ZDR.
- Mecânica de consentimento e re-aceite (Política v1.0.0 vs v1.1.0).
- Isolamento multitenant: RLS em `public.receipts` e em `storage.objects`.
- Minimização em logs de auditoria (`audit_log` universal vs trigger custom) e em observabilidade (Sentry scrubbing).
- Retenção e eliminação (`purgeOrgStorage`, exclusão de organização).
- Papéis LGPD (controlador / operador) para dados de terceiros presentes nos documentos.
- Riscos de segurança que se cruzam com compliance: documento malicioso, ausência de antivírus, vazamento por signed URL.

**Fora de escopo:** correção financeira das fórmulas de extração (gate de `@finance-domain-expert` Valéria); arquitetura RSC e boundary Server/Client (gate G5 / `@qa`); reconciliação automática e categorização (Fase 6, não draftada).

**Método:** leitura direta da SPEC, do EPIC, do ADR-023 e da Política vigente; inspeção do código atual de `requireAuth`, do scrubbing Sentry e da instrumentação. Toda afirmação sobre o código tem âncora de arquivo. Achados derivados exclusivamente da spec — sem invenção (Constitution Art. IV).

---

## 3. Achados por severidade

Cada achado tem ID (`CMP-{C|A|M|B}{n}`), descrição, artigo da LGPD violado ou em risco, recomendação concreta e a story (`comprovantes.0`–`.5`) responsável pelo endereçamento.

### 3.1 🔴 CRÍTICO — bloqueia go-live; sem resolução não há produção

| ID | Achado | LGPD em risco | Recomendação + story |
|----|--------|---------------|----------------------|
| **CMP-C1** | **Isolamento multitenant de `receipts` e do bucket de Storage não pode ser opcional.** A SPEC §4/§5 prevê RLS em `public.receipts` e em `storage.objects` (filtrando o primeiro segmento do path `{org_id}/...` contra o claim JWT), mas até a migration existir o bucket privado e a tabela ficam sem barreira de tenant. Documento financeiro é o ativo de PII mais concentrado da plataforma (valores, contraparte, possivelmente CPF/CNPJ visíveis na imagem). Um furo de RLS aqui expõe comprovantes de uma clínica a outra. Invariantes #1 e #2 do projeto. | Art. 6º (segurança, prevenção); Art. 46 (medidas de segurança); Art. 47 (controlador e operador respondem pela segurança). | **Obrigatório em `comprovantes.1`.** Habilitar `ROW LEVEL SECURITY` em `public.receipts` com policies `SELECT/INSERT/UPDATE/DELETE` filtrando `org_id = (SELECT auth.jwt() ->> 'org_id')::uuid`; criar policies equivalentes em `storage.objects` para o bucket `receipts` (match do 1º segmento do path); **adicionar `'receipts'` ao smoke-test inverso de `supabase/tests/rls_isolation.test.sql`** (checa `pg_class.relrowsecurity`) e um teste positivo de cross-tenant (org A não lê comprovante de org B, nem o arquivo no Storage). Migration não merge sem o teste verde no CI (`rls-tests.yml`). |

### 3.2 🟠 ALTO — não bloqueia o build, mas nenhum pode ir a produção sem resolução ou waiver explícito

| ID | Achado | LGPD em risco | Recomendação + story |
|----|--------|---------------|----------------------|
| **CMP-A1** | **Envio de documento com PII a LLM externa (OpenAI) sem ZDR e sem base legal vigente.** O ADR-023 trava `openai/gpt-4o-mini` via Vercel AI Gateway com `disallowPromptTraining: true`, mas reconhece que OpenAI **não consta na lista de provedores ZDR**. Isso significa que o conteúdo do comprovante — incluindo PII de pacientes e de terceiros — transita e pode ser retido temporariamente por um subprocessador estrangeiro. A Política **vigente (v1.0.0)** não menciona tratamento por IA, não lista OpenAI/Vercel AI Gateway como subprocessador (§4) e não descreve essa transferência internacional (§5). Tratar dado pessoal sem base legal informada e sem transparência é violação direta. | Art. 7º (bases legais); Art. 9º (transparência — direito a informação clara sobre o tratamento); Art. 33 (transferência internacional); Art. 6º VI (transparência como princípio). | **`comprovantes.0`.** Publicar **Política v1.1.0** que: (a) declare a finalidade "leitura automatizada de comprovantes por IA"; (b) defina a base legal — recomenda-se **execução de contrato** (Art. 7º V) por ser funcionalidade central do produto, **complementada por consentimento específico e destacado** (Art. 7º I + Art. 9º) dado o tratamento por terceiro estrangeiro; (c) adicione **OpenAI** e **Vercel AI Gateway** à tabela de subprocessadores (§4) e à seção de transferência internacional (§5); (d) explique em FAQ "como a IA usa meus documentos" que não há ZDR e que o uso para treinamento está desabilitado. **`comprovantes.3` não vai a produção antes da v1.1.0 publicada + re-aceite ativo** (ver veredito §6 e Critério de Saída do EPIC item 2). |
| **CMP-A2** | **`requireAuth()` não verifica versão de consentimento — re-aceite forçado é inexistente hoje.** Auditado em `apps/web/src/lib/auth/require-auth.ts`: o guard checa **apenas** `user` e `orgId` (redirect `/login` ou `/onboarding/nova-organizacao`) — não há nenhuma checagem de qual versão de Política/Termos a usuária aceitou. A Política v1.0.0 §6 e §12 *prometem* "modal de re-aceite no próximo login", mas esse mecanismo **não está implementado**. Sem ele, publicar a v1.1.0 não força ninguém a reaceitar, e a feature de IA seria ativada sem consentimento renovado — exatamente a mudança de finalidade que o Art. 8º §6 cobre. | Art. 8º §6 (consentimento inválido se a finalidade mudar — exige novo consentimento); Art. 9º (informação prévia ao titular). | **`comprovantes.0`.** Criar RPC de status de consentimento (`user_consent_status` / `lib/auth/check-consent.ts`) que compara a versão aceita pela usuária com a versão vigente de `legal_documents`; adicionar checagem em `requireAuth()` (ou no `proxy.ts`) que, se a versão for inferior à vigente, redireciona para a **página de aceite** `/aceite/privacidade` antes de liberar qualquer rota `(app)/*`. Gravar o re-aceite em `user_consent_records` (imutável). O re-aceite **precede** a ativação de `comprovantes.3` em prod. |
| **CMP-A3** | **`audit_log` universal capturaria `jsonb` sensível, violando minimização.** A SPEC §4 explica que o trigger de auditoria universal registra o `jsonb` inteiro em cada UPDATE. Para `receipts`, isso significaria logar `extraction_data` e `reviewed_data` — que contêm valores financeiros, descrição e `counterparty` (nome de quem pagou/recebeu = dado pessoal). Persistir esse conteúdo no log de auditoria é coletar mais dado do que o necessário para a finalidade "rastrear quem mudou o estado do comprovante". | Art. 6º III (necessidade — limitação ao mínimo necessário); Art. 6º I (finalidade). | **`comprovantes.1`.** Implementar o trigger `audit_receipts` **customizado** que registra **somente** `id, org_id, status anterior→novo, actor (`auth.uid()`), timestamp` — **nunca** o conteúdo de `extraction_data`/`extraction_raw_text`/`reviewed_data`. **Excluir explicitamente `receipts` do trigger de auditoria universal** (não basta criar o trigger novo — é preciso garantir que o universal não dispara em `receipts`). Cobrir com um teste que verifica que nenhuma coluna `jsonb` de conteúdo aparece no `audit_log`. |
| **CMP-A4** | **Scrubbing do Sentry não cobre os campos novos do pipeline.** Auditado em `apps/web/src/lib/observability/sentry-scrub.ts`: o `SENSITIVE_KEY_PATTERNS` atual cobre `password\|senha\|confirma\|token\|secret\|api_key\|authorization\|cookie\|cpf\|phone\|celular\|telefone` — **nenhum** desses padrões bate em `extraction_data`, `extraction_raw_text`, `reviewed_data`, `file_path`, `signed_url`, nem em `messages` (o array de mensagens enviado ao AI Gateway, que carrega o documento). Se `processReceipt`/`extractReceipt` lançar erro com esses dados no contexto, breadcrumb ou exception extra, conteúdo de comprovante (PII de terceiros, possíveis CPF/valores) vaza para o dashboard do Sentry — subprocessador estrangeiro, fora da finalidade. | Art. 6º III (necessidade/minimização); Art. 6º VII (segurança); Art. 46 (medidas de segurança em logs). | **`comprovantes.3`.** Estender `SENSITIVE_KEY_PATTERNS` com `extraction_data`, `extraction_raw_text`, `reviewed_data`, `file_path`, `signed_url`, `messages` (e variações como `signedUrl`, `rawText`). Atualizar o smoke-test inline de `sentry-scrub.ts` com amostra desses campos. Garantir que o scrubbing roda tanto no `instrumentation.ts` (servidor — onde o `after()` executa) quanto no `instrumentation-client.ts`. Considerar também escopo de breadcrumb explícito para o trecho que chama o AI Gateway. |
| **CMP-A5** | **`purgeOrgStorage` na exclusão de organização não implementado — risco de retenção indevida.** A SPEC §5 e §13 e o débito **TD-CMP-003** registram que, ao excluir uma organização, os binários no bucket `receipts` precisam ser purgados — mas `purgeOrgStorage` não existe. A tabela `receipts` tem `ON DELETE CASCADE` no FK de `organizations`, o que apaga as **linhas**; porém os **arquivos no Storage não são apagados por cascade de banco**. Resultado: após a janela de exclusão (Política §6 — 30 dias), comprovantes com PII permaneceriam no bucket indefinidamente, violando a retenção declarada e o direito à eliminação. | Art. 15/16 (término do tratamento — eliminação dos dados); Art. 18 VI (eliminação a pedido do titular); Art. 6º III (necessidade — não guardar além do necessário). | **`comprovantes.1`** (definir o contrato e o ponto de chamada) **com fechamento obrigatório antes do go-live do EPIC.** Implementar `purgeOrgStorage(org_id)` que lista e remove todos os objetos sob o prefixo `{org_id}/` do bucket `receipts`, acoplado ao fluxo de exclusão de organização (e ao toolkit LGPD `h8.x` quando existir). Enquanto não houver job automatizado, documentar procedimento manual de purga e registrar como **débito alto rastreado** (TD-CMP-003) — não como "aceito". |

### 3.3 🟡 MÉDIO — devem constar nas stories; não bloqueiam isoladamente

| ID | Achado | LGPD em risco | Recomendação + story |
|----|--------|---------------|----------------------|
| **CMP-M1** | **EXIF de fotos não é removido — geolocalização vaza junto do comprovante.** Fotos tiradas por smartphone (fluxo `comprovantes.5` — câmera direta + Share Target) carregam metadados EXIF, incluindo **coordenadas GPS** e data/hora exatas. A SPEC §3 (Estágio 1) faz upload do **binário original** sem strip de EXIF; o débito **TD-CMP-002** já cataloga isso como "pós-MVP". Geolocalização é dado pessoal e pode revelar o endereço residencial da usuária ou do paciente. Guardar isso sem finalidade declarada fere a minimização. | Art. 6º I (finalidade) e III (necessidade) — geolocalização não tem propósito no produto. | Endereçar na **normalização** (`comprovantes.2`) — fazer strip de EXIF/metadados ao processar imagens, antes ou durante a normalização, e armazenar a versão limpa. Se ficar como débito pós-MVP, **reduzir TD-CMP-002 de "pós-MVP" para débito rastreado com prazo** e mencionar a coleta de geolocalização na Política v1.1.0 enquanto não for removida. Recomendação da auditoria: tratar em `comprovantes.2` por ser barato (strip de EXIF é JS puro). |
| **CMP-M2** | **Sem antivírus no upload — arquivo malicioso pode ser armazenado e redistribuído via signed URL.** A SPEC valida MIME por magic bytes e limite de tamanho, mas o débito **TD-CMP-001** confirma que o Supabase Storage não tem AV nativo e o MVP **aceita** o risco ("arquivo nunca executado"). O argumento é parcialmente válido para o servidor, mas o arquivo **é servido de volta** via signed URL para renderização na tela de revisão — um PDF/HTML malicioso pode atingir o navegador da usuária. Não é violação direta da LGPD, mas é falha de segurança que pode levar a incidente com dados pessoais (Art. 46). | Art. 46 (medidas de segurança); Art. 6º VII (segurança como princípio). | Manter o aceite do débito **TD-CMP-001** no MVP é tolerável **desde que**: (a) a renderização de PDF/HTML na revisão use sandbox (`<iframe sandbox>` sem `allow-scripts`, ou rasterização para imagem); (b) `Content-Disposition`/`Content-Type` corretos no signed URL evitem execução inline indevida. Endereçar o sandbox de renderização em `comprovantes.4` (tela de revisão). Avaliar ClamAV/edge function como débito pós-MVP rastreado. |
| **CMP-M3** | **Conteúdo do documento contém dado de terceiro — papéis controlador/operador precisam estar documentados.** O campo `counterparty` extraído (SPEC §7) é "quem pagou ou recebeu" — frequentemente uma **terceira pessoa** que não é a usuária da KEYRA nem cliente cadastrado da clínica (ex.: o cliente que fez um Pix, o fornecedor da NF). A Política v1.0.0 §2.2 trata o modelo controlador/operador apenas para "pacientes cadastrados", não para terceiros que aparecem incidentalmente em comprovantes. Sem documentar isso, há ambiguidade sobre quem responde pelo tratamento desse dado. | Art. 5º VI/VII (definição de controlador e operador); Art. 9º (transparência); Art. 18 (titular terceiro tem direitos). | **`comprovantes.0`** — na Política v1.1.0, estender §2.2: deixar explícito que **a clínica é controladora** dos dados pessoais que constam nos comprovantes que ela carrega (inclusive de terceiros) e **KEYRA é operadora**, tratando esses dados apenas para a finalidade de leitura/registro contratada. Incluir orientação de que a clínica é responsável por ter base legal para inserir comprovantes com PII de terceiros. |
| **CMP-M4** | **`uploaded_by`/`reviewed_by` ficam `NULL` ao excluir o usuário (`ON DELETE SET NULL`) — quebra de rastreabilidade de quem revisou um lançamento financeiro.** O schema (SPEC §4) usa `ON DELETE SET NULL` nesses FKs para `auth.users`. É correto para não apagar o comprovante quando um funcionário sai, mas significa que a trilha de "quem confirmou esta transação" some. Para uma operadora de dado financeiro, isso enfraquece a auditabilidade exigida — embora não seja violação direta. | Art. 37 (registro das operações de tratamento); Art. 6º VI (transparência/prestação de contas). | Aceitável para o MVP. Mitigação leve: o trigger `audit_receipts` (CMP-A3) registra o `actor` de cada mudança de status **no momento do evento** — então a trilha de revisão persiste no `audit_log` mesmo após o usuário ser excluído. Garantir que `audit_receipts` capture o `actor` por isso (já recomendado em CMP-A3). Documentar em `comprovantes.1`. |

### 3.4 ⚪ BAIXO — nice-to-have / instrução de prompt

| ID | Achado | LGPD em risco | Recomendação + story |
|----|--------|---------------|----------------------|
| **CMP-B1** | **Possível extração de número de cartão → escopo PCI-DSS indesejado.** Um comprovante (fatura, cupom de maquininha) pode conter número de cartão (PAN, total ou parcial). Se a LLM extrair e o sistema persistir esse dado em `extraction_data`/`extraction_raw_text`, a KEYRA entra sem querer no escopo de **PCI-DSS** e amplia a superfície de PII sensível. O débito **TD-CMP-007** já registra o risco. | Art. 6º III (necessidade — PAN não tem finalidade no produto); padrão PCI-DSS (regulatório, fora da LGPD mas correlato). | **`comprovantes.3`.** Instruir o **prompt do sistema** explicitamente a **NÃO extrair, NÃO transcrever e NÃO repetir números de cartão** — apenas valor, data, descrição, direção, contraparte. Como defesa em profundidade, considerar um regex de mascaramento de sequências tipo-PAN em `extraction_raw_text` antes de gravar. Manter o débito TD-CMP-007 rastreado. |

---

## 4. Catálogo de débitos técnicos — alinhamento com a SPEC §12

A SPEC §12 já cataloga sete débitos `TD-CMP-001`–`007`. Esta auditoria os reavalia sob a ótica de compliance e cruza cada um com os achados acima. **Recomendação geral:** débitos que tocam direito do titular (eliminação, minimização) **não** devem ficar como "aceito" — devem ser "rastreado com prazo".

| Débito (SPEC §12) | Severidade SPEC | Achado da auditoria | Reavaliação de compliance |
|-------------------|-----------------|---------------------|---------------------------|
| **TD-CMP-001** — Sem antivírus no upload | Média | **CMP-M2** | Aceite tolerável **somente** com sandbox de renderização na revisão (`comprovantes.4`). Sem o sandbox, sobe para Alto. |
| **TD-CMP-002** — EXIF de fotos não removido | Média | **CMP-M1** | **Recomenda-se antecipar para `comprovantes.2`** (strip de EXIF é JS puro, barato). Se ficar pós-MVP, mencionar a coleta de geolocalização na Política v1.1.0. |
| **TD-CMP-003** — `purgeOrgStorage` não implementado | Alta | **CMP-A5** | Confirmado **ALTO**. Não é "aceito" — é bloqueador do critério de retenção. Definir contrato em `comprovantes.1`; fechar antes do go-live do EPIC. |
| **TD-CMP-004** — Tiers ODT/RTF/EPUB best effort | Baixa | — | Sem impacto de compliance — o fallback de registro manual cobre. Mantido como está. |
| **TD-CMP-005** — Sem dashboard de governança/custo do AI Gateway | Baixa | (relacionado a CMP-A1) | Sem impacto direto de LGPD, mas observabilidade do AI Gateway ajuda a comprovar o `disallowPromptTraining`. Mantido pós-MVP. |
| **TD-CMP-006** — Reprocessamento de `failed` é manual | Baixa | — | Sem impacto de compliance. Mantido como está. |
| **TD-CMP-007** — Extração de dígitos de cartão → PCI-DSS | Baixa | **CMP-B1** | Confirmado BAIXO. Instrução de prompt em `comprovantes.3` resolve a maior parte; mascaramento por regex é defesa adicional. |

**Sem novos débitos** propostos por esta auditoria — todos os achados ALTO/CRÍTICO têm story de fechamento dentro do EPIC (`comprovantes.0` e `.1`), não viram débito.

---

## 5. Mapa de achados por story

| Story | Achados a endereçar | Gate Phase 3.5 |
|-------|---------------------|----------------|
| `comprovantes.0` (Política v1.1.0 + re-aceite + FAQ) | **CMP-A1**, **CMP-A2**, **CMP-M3** | Compliance ✅ obrigatório |
| `comprovantes.1` (schema `receipts` + bucket + RLS + trigger custom) | **CMP-C1**, **CMP-A3**, **CMP-A5** (definição), **CMP-M4** | Compliance ✅ + Data-engineer ✅ |
| `comprovantes.2` (ingestão + normalização) | **CMP-M1** (strip de EXIF — recomendação de antecipação) | Compliance ✅ obrigatório |
| `comprovantes.3` (pipeline LLM + scrubbing) | **CMP-A4**, **CMP-B1** — **bloqueada para prod até CMP-A1+CMP-A2 resolvidos** | Compliance ✅ + Financial ✅ |
| `comprovantes.4b` (revisão + registro) | **CMP-M2** (renderização segura — só o artefato normalizado de `.2`, nunca o original cru; AC1.2 + AC2.2) | Financial ✅ |
| `comprovantes.5` (captura mobile) | dependente de **CMP-M1** (fonte das fotos com EXIF) | — |

---

## 6. Veredito final

### ⚠️ CONCERNS — endereçável

O EPIC-COMPROVANTES está **arquiteturalmente apto a prosseguir**. O design já antecipa a maioria dos riscos de compliance e propõe mitigações corretas; não há defeito conceitual que exija redesenho. Os achados desta auditoria são **endereçáveis dentro das 6 stories já planejadas**, sem novas stories e sem novos débitos.

**Condições inegociáveis para o go-live:**

1. **Nenhum achado CRÍTICO ou ALTO pode ir a produção sem resolução completa OU waiver explícito** registrado no Change Log da story responsável, aprovado pelo `@po`, com justificativa concreta (não racionalização). Isso cobre `CMP-C1`, `CMP-A1`, `CMP-A2`, `CMP-A3`, `CMP-A4`, `CMP-A5`.

2. **`comprovantes.3` (envio do documento à LLM) NÃO pode ir a produção antes de:**
   - a **Política de Privacidade v1.1.0 publicada** em `/privacidade`, com finalidade de IA, base legal, OpenAI + Vercel AI Gateway nos subprocessadores e na transferência internacional, e FAQ "como a IA usa meus documentos" (achado **CMP-A1**); **e**
   - o **re-aceite forçado ativo em produção** — RPC de status de consentimento + checagem em `requireAuth()`/`proxy.ts` + página `/aceite/privacidade` (achado **CMP-A2**).

   Esta condição reforça o item 2 do Critério de Saída do EPIC (`EPIC-COMPROVANTES.md`). Um deploy de `comprovantes.3` sem ambos é violação de processo e de LGPD (Art. 7º + Art. 8º §6 + Art. 9º).

3. **`CMP-C1` (RLS de `receipts` + `storage.objects`) é obrigatório em `comprovantes.1`** e bloqueia o merge da migration: sem o teste positivo de cross-tenant verde no CI, a story não fecha.

4. **`CMP-A5` (`purgeOrgStorage`)** deve ter contrato definido em `comprovantes.1` e estar fechado — implementado ou com procedimento manual documentado e débito rastreado — **antes do go-live do EPIC completo**.

5. Re-auditoria de compliance (`@compliance-br *lgpd-audit`) recomendada como gate Phase 3.5 em cada story marcada "Compliance obrigatório" na tabela §5, e uma verificação final antes do critério de saída do EPIC.

**Resumo do veredito:** prosseguir com a implementação; manter esta auditoria como checklist vivo; nenhum CRÍTICO/ALTO em aberto chega a produção; `comprovantes.3` permanece bloqueada até v1.1.0 + re-aceite.

---

## 7. Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-05-18 | `@compliance-br` (Têmis) | Auditoria preventiva LGPD do EPIC-COMPROVANTES criada. 11 achados: 1 CRÍTICO, 5 ALTO, 4 MÉDIO, 1 BAIXO. Veredito **CONCERNS — endereçável**. Achados derivados de `EPIC-COMPROVANTES-SPEC.md`, ADR-023 e inspeção de `require-auth.ts` + `sentry-scrub.ts`. Catálogo TD-CMP-001–007 reavaliado e cruzado com os achados. Condições de go-live cravadas — `comprovantes.3` bloqueada até Política v1.1.0 publicada + re-aceite forçado ativo. |
| 2026-05-18 | `@aiox-master` (Orion) | Auditoria de consolidação das 7 stories. §5 — achado **CMP-M2** reatribuído de `comprovantes.4` para `comprovantes.4b` (a story `.4` foi dividida em `.4a`/`.4b`; CMP-M2 estava órfão). CMP-M2 fechado nos ACs: `comprovantes.2` AC5.6 (persistir artefato normalizado renderizável — `normalized-p{n}.png` para PDF) e `comprovantes.4b` AC1.2/AC2.2 (revisão renderiza só o artefato normalizado, nunca o original cru). Os outros 10 achados confirmados com AC dono nas stories. |

---

**Fim do documento.** Atualizar a seção §5 (mapa por story) e o Change Log conforme cada story `comprovantes.*` endereçar os achados; reavaliar o veredito antes do critério de saída do EPIC.
