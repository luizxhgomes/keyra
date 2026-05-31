# EPIC-COMPROVANTES — Spec Arquitetural

**Status:** ACCEPTED — rev. 2 (2026-05-18) — incorpora pareceres de `@architect` e `@document-processor`
**Autor:** `@aiox-master` (Orion); revisada por `@architect` (Aria) e `@document-processor` (Íris)
**Pareceres:** `docs/architecture/reviews/EPIC-COMPROVANTES-REVIEW-ARCHITECT.md` · `docs/architecture/reviews/EPIC-COMPROVANTES-REVIEW-DOCPROC.md`
**Decisão de referência:** ADR-023 (`docs/architecture/ARCHITECTURE.md` §11.3)
**Epic:** `docs/stories/EPIC-COMPROVANTES.md`
**Escopo:** captura de documentos financeiros (receita + despesa) com leitura por IA e registro semiautomático no ledger.

---

## 1. Objetivo

Permitir que a usuária anexe um comprovante em **qualquer formato** e que o sistema, com auxílio de uma LLM, transforme esse documento em uma `transactions` revisada e correta — eliminando a digitação manual de lançamentos que entram por fora da comanda.

**Não-objetivos do MVP:**
- Reconciliação automática com transações existentes (Fase 6).
- Categorização automática sem revisão (Fase 6).
- Auto-aprovação de lançamentos (nunca — revisão humana é invariante).
- Importação em lote de extratos bancários completos (é território do `@document-processor` em Phase 7 plena, fora deste epic enxuto).

---

## 2. Arquitetura de alto nível

```
┌─────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────────┐
│  1. ANEXAR  │──►│ 2. NORMALIZAR│──►│ 3. ARMAZENAR│──►│  4. LER (IA) │
│  upload web │   │ detectar +   │   │ Storage     │   │ AI Gateway   │
│  /câmera/   │   │ converter    │   │ privado +   │   │ gpt-4o-mini  │
│  Share Tgt  │   │ p/ legível   │   │ row receipts│   │ + Zod schema │
└─────────────┘   └──────────────┘   └─────────────┘   └──────┬───────┘
                                                               │
       ┌───────────────────────────────────────────────────────┘
       ▼
┌──────────────┐   ┌─────────────────┐
│ 5. REVISAR   │──►│ 6. REGISTRAR    │
│ humano       │   │ cria transação  │
│ confirma/    │   │ direction +     │
│ corrige      │   │ origin + source │
└──────────────┘   └─────────────────┘
```

Estágios 1-2 são **síncronos** dentro da Server Action de upload (rápidos). Estágios 3-4 disparam em **`next/after`** (assíncrono, não bloqueia a resposta). Estágios 5-6 são acionados pela usuária na tela de revisão.

### Encaixe na arquitetura KEYRA

| Camada | Uso |
|--------|-----|
| `app/(app)/financeiro/comprovantes/` | Rotas novas: lista, upload, revisão. Server Components + Server Actions colados (`actions.ts`). |
| `lib/supabase/server.ts` | Cliente autenticado para `receipts` (RLS por `org_id`). |
| `lib/supabase/admin.ts` | **NÃO usado** — todo acesso a `receipts` passa por RLS. Admin só se um job de limpeza precisar (fora do MVP). |
| `lib/money.ts` | `Decimal.js` para todo valor extraído — string entra, string sai. |
| `lib/env.ts` | Novas envs: `AI_GATEWAY_API_KEY`, `RECEIPTS_BUCKET`, `RECEIPT_MAX_BYTES`. |
| Supabase Storage | Bucket privado `receipts`. |
| `next/after` | Pipeline assíncrono de normalização + extração. |

---

## 3. Pipeline detalhado por estágio

### Estágio 1 — Anexar

Server Action `uploadReceipt(formData)`:
1. `requireAuth()` no topo (guard server-side — invariante do projeto).
2. Lê o `File` do `FormData`.
3. Valida **MIME real por magic bytes** (não confiar na extensão nem no `file.type` do browser) — biblioteca leve tipo `file-type`.
4. Valida tamanho contra `RECEIPT_MAX_BYTES` (sugerido: 10 MB).
5. Calcula `sha256` do conteúdo → `file_hash`.
6. Checa idempotência: se já existe `receipts` com `(org_id, file_hash)`, retorna o registro existente (não duplica).
7. Faz upload do binário **original** ao bucket `receipts` em `{org_id}/{receipt_id}/original.{ext}`.
8. Insere row em `receipts` com `status='pending'`.
9. Dispara `after(() => processReceipt(receiptId))`.
10. Retorna `{ receiptId, status: 'pending' }` — a UI mostra "processando".

### Estágio 2 — Normalizar

Função `normalizeReceipt(receipt)` — define o que será enviado à LLM. Ver matriz §6. Atualiza `status='processing'`. Resultado: `normalized_kind` (`image` | `text`) + o artefato legível. Subetapas:

1. **Pré-processamento de imagem (obrigatório no MVP).** Toda imagem passa por `sharp().rotate()` — auto-rotação pela tag EXIF Orientation. Fotos de celular chegam tortas/de cabeça para baixo e isso derruba a confiança da extração sem necessidade. Custo computacional desprezível. Desinclinação (deskew) e ajuste de contraste ficam como melhoria pós-MVP (TD-CMP-002 estendido).
2. **PDF → imagem.** O `gpt-4o-mini` **não** aceita PDF como *file part* nativo (capacidade de Anthropic/Google, não OpenAI — provider travado no ADR-023). Todo PDF é **rasterizado** para imagem(ns) — ver TD-CMP-008 (spike de biblioteca de rasterização em serverless). Logo `normalized_kind` de um PDF é `image`.
3. **Conversão de office/epub** (Tier conversão da §6): texto extraído via parser JS puro.
4. **Multi-página.** PDF/DOCX com várias páginas: o pipeline processa no máximo `RECEIPT_MAX_PAGES` páginas (sugerido: 5). Se o documento excede, registra aviso em `extraction_error` e processa as primeiras N — nunca lê só a página 1 em silêncio.

### Estágio 3 — Armazenar

O original já foi armazenado no Estágio 1. Aqui apenas se persiste, quando aplicável, o artefato normalizado (ex.: texto extraído de DOCX) — opcionalmente em `{org_id}/{receipt_id}/normalized.txt`. O registro `receipts` é a fonte de verdade do estado.

### Estágio 4 — Ler (IA)

Função `extractReceipt(receipt)`:
1. Gera signed URL de curta duração (≤ 60 s) do artefato, ou carrega o texto.
2. Chama o Vercel AI Gateway (`generateObject` do AI SDK) com `openai/gpt-4o-mini`, passando o documento como *file/image part* (Tier visão) ou como texto (Tier texto), e o **Zod schema** de extração (§7).
3. Recebe objeto estruturado + um `confidence` 0..1.
4. Grava `extraction_data`, `extraction_raw_text`, `extraction_confidence`, `extraction_model`.
5. Define `status`:
   - extração OK → `status='needs_review'` (sempre cai em revisão no MVP).
   - erro/timeout → `status='failed'`, grava `extraction_error`.

### Estágio 5 — Revisar

A usuária abre a tela de revisão (`/financeiro/comprovantes/[id]`):
- Documento renderizado (imagem/PDF via signed URL) ao lado dos campos extraídos, editáveis.
- Campos com baixa confiança destacados.
- Server Action `saveReceiptReview(receiptId, reviewedData)` grava `reviewed_data`, `reviewed_by`, `reviewed_at` — **sem ainda criar transação**.

### Estágio 6 — Registrar

Server Action `confirmReceipt(receiptId)`:
1. `requireAuth()` + valida que `reviewed_data` está completo e coerente.
2. **Normalização de coerência financeira** com `Decimal.js`, espelhando o CHECK `transactions_amount_coherent`:
   - `credit`: `net = gross − fee`.
   - `debit`: o CHECK exige `fee = 0 AND net = gross`. Qualquer `fee_amount` que a IA tenha extraído num `debit` **não pode** ir para `transactions.fee_amount` — a regra: ou a usuária reclassifica como `credit` na revisão, ou o `fee` é absorvido no bruto (`gross = gross + fee`, `fee = 0`). A UI de revisão torna isso explícito. Sem essa regra, `confirmReceipt` quebra no CHECK.
3. Insere `transactions` com `origin = 'manual_income' | 'manual_expense'`, `source_type='document'`, `source_id=receipt.id`, valores do `reviewed_data`. ⚠️ `source_type='document'` exige micro-migration aditiva — ver §4.
4. Atualiza `receipts.transaction_id` e `status='confirmed'`.
5. Tudo em uma transação Postgres — se a inserção em `transactions` falhar, `receipts` não muda de estado.

### Recuperação de estados presos

`next/after` **não é garantido**: se o runtime serverless for suspenso antes do callback concluir, a row fica presa em `pending`/`processing` sem nunca chegar a `failed`. Mitigação MVP (princípio "estado honesto" — sem spinner eterno):

- A UI exibe ação **"reprocessar"** para qualquer comprovante em `pending`, `processing` ou `failed` há mais que um limiar (sugerido: 10 min de `updated_at`).
- **Vercel Cron** diário (`/api/receipts/sweep`) re-despacha `processReceipt` para rows presas — rede de segurança. Cron está disponível no plano Hobby.
- `processReceipt` é idempotente: reexecutar sobre uma row já `needs_review`/`confirmed` é no-op.

A usuária também pode **rejeitar** um comprovante (`rejectReceipt`) → `status='rejected'`, nenhuma transação criada.

---

## 4. Schema — tabela `receipts`

> Materializada por `comprovantes.1`. DDL de referência (a story produz a migration final, revisada por `@data-engineer`).

```sql
CREATE TABLE IF NOT EXISTS public.receipts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by           uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Arquivo original
  file_path             text   NOT NULL,                 -- caminho no bucket privado
  original_filename     text   NOT NULL,
  mime_type             text   NOT NULL,                  -- MIME real (magic bytes)
  file_size_bytes       bigint NOT NULL CHECK (file_size_bytes > 0),
  file_hash             text   NOT NULL,                  -- sha256 hex — idempotência

  -- Normalização
  normalized_kind       text   NULL CHECK (normalized_kind IS NULL OR normalized_kind IN ('image','pdf','text')),

  -- Ciclo de vida
  status                text   NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','processing','needs_review','confirmed','rejected','failed')),

  -- Extração da IA
  extraction_data       jsonb         NULL,               -- objeto validado pelo Zod schema (§7)
  extraction_raw_text   text          NULL,               -- texto bruto lido pela IA
  extraction_confidence numeric(4,3)  NULL CHECK (extraction_confidence IS NULL
                                                  OR extraction_confidence BETWEEN 0 AND 1),
  extraction_model      text          NULL,               -- ex.: 'openai/gpt-4o-mini'
  extraction_error      text          NULL,

  -- Revisão humana
  reviewed_data         jsonb         NULL,               -- o que o humano confirmou/corrigiu
  reviewed_by           uuid          NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at           timestamptz   NULL,

  -- Ligação ao ledger
  transaction_id        uuid          NULL REFERENCES public.transactions(id) ON DELETE SET NULL,

  -- Auditoria
  created_at            timestamptz   NOT NULL DEFAULT now(),
  updated_at            timestamptz   NOT NULL DEFAULT now(),
  deleted_at            timestamptz   NULL,

  CONSTRAINT receipts_org_hash_unique UNIQUE (org_id, file_hash)
);

CREATE INDEX receipts_org_status_idx ON public.receipts (org_id, status, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX receipts_transaction_idx ON public.receipts (transaction_id)
  WHERE transaction_id IS NOT NULL;

CREATE TRIGGER receipts_set_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER receipts_enforce_org_id
  BEFORE UPDATE OF org_id ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
```

### Máquina de estados

```
pending ──► processing ──► needs_review ──► confirmed
   │            │               │
   │            │               └──► rejected
   │            └──► failed                 (reprocessar / cron sweep)
   │                   │                            │
   └───────────────────┴──► processing ◄────────────┘
        (presos: pending/processing/failed → reprocessável — ver §3)
```

### RLS

Políticas `SELECT/INSERT/UPDATE/DELETE` todas filtrando `org_id = (SELECT auth.jwt() ->> 'org_id')::uuid` — mesmo padrão das 21 tabelas existentes. **Migration nova obriga:** habilitar RLS + adicionar `'receipts'` ao smoke-test inverso em `supabase/tests/rls_isolation.test.sql` (invariante #2 do projeto).

### Trigger de auditoria customizado

O `audit_log` universal opera sobre uma lista de tabelas; `receipts`, sendo tabela nova, **não entra nessa lista** — não há nada a "excluir". A decisão: `receipts` recebe um trigger **dedicado** `audit_receipts` (e nunca é adicionada ao trigger universal). Razão: o trigger universal capturaria o `jsonb` inteiro, logando `extraction_data` / `reviewed_data` (valores financeiros + contraparte = dado pessoal) — violando minimização (LGPD Art. 6º III). O `audit_receipts` registra **apenas** `id, org_id, status anterior→novo, actor, timestamp` — nunca o conteúdo extraído. `comprovantes.1` implementa.

### Micro-migration aditiva em `transactions` (BLOQUEADOR resolvido)

`transactions.source_type` tem hoje o CHECK `IN ('command','payment','invoice','manual','import')` — **não aceita `'document'`** (confirmado em `20260416001200_transactions.sql:41`). A versão anterior desta spec, do ADR-023 e do EPIC afirmavam erroneamente que `transactions` não precisava de migration. Correção: `comprovantes.1` inclui uma **micro-migration aditiva** que faz `DROP CONSTRAINT` + `ADD CONSTRAINT` adicionando `'document'` à lista. É aditiva (não remove valores) e de baixo risco. Sem ela, `confirmReceipt` quebra em runtime no CHECK.

---

## 5. Supabase Storage

| Item | Decisão |
|------|---------|
| Bucket | `receipts` — **privado** (`public = false`) |
| Caminho | `{org_id}/{receipt_id}/original.{ext}` (+ `normalized.txt` quando há conversão) |
| RLS de Storage | Políticas em `storage.objects` filtrando o primeiro segmento do path (`org_id`) contra o claim JWT |
| Acesso de leitura | Somente via **signed URL** com expiração ≤ 60 s, gerada server-side na hora de renderizar a revisão ou chamar a LLM |
| Limite de tamanho | `RECEIPT_MAX_BYTES` (sugerido 10 MB) — validado antes do upload concluir |
| Retenção | Comprovante segue a retenção da conta; após exclusão da org, purga junto (débito `purgeOrgStorage` — ver §12) |

> **⚠️ RLS de Storage não tem precedente no KEYRA.** O MVP nunca usou Supabase Storage — as 21 tabelas auditadas são todas `public.*`. Políticas em `storage.objects` são outro schema e outro modelo de policy; não está garantido que o claim JWT `org_id` (nem o helper `current_org_id()`) esteja disponível no contexto de avaliação de uma policy de storage. **`comprovantes.1` deve começar por um spike** que prova o isolamento por `org_id` no bucket antes de qualquer outra coisa. Além disso, `rls_isolation.test.sql` cobre só `public.*` com lista hardcoded — estender a suíte para cobrir `storage.objects` é parte de `comprovantes.1` (senão uma falha de isolamento de storage passa pelo CI inteiro).

---

## 6. Camada de normalização — matriz de formatos

A usuária anexa **qualquer coisa**. O sistema decide o tratamento. Tudo executa em runtime Node.js (Fluid Compute) — sem binários de sistema (LibreOffice indisponível em serverless).

| Formato | MIME | Tier | Tratamento | Confiabilidade |
|---------|------|------|------------|----------------|
| JPG, PNG, WEBP | `image/*` | Visão | Enviado como image part ao modelo vision | Alta |
| HEIC (foto iPhone) | `image/heic` | Visão | Converter p/ JPG (`heic-convert`) → image part | Alta |
| PDF | `application/pdf` | Conversão→Visão | **Rasterizar** página(s) para imagem — `gpt-4o-mini` NÃO aceita PDF nativo. Biblioteca a definir em spike (TD-CMP-008). PDF é o formato mais comum de comprovante real (NF-e, boleto, fatura) | Alta (após spike) |
| TXT, MD | `text/plain`, `text/markdown` | Texto | Conteúdo enviado como texto no prompt | Alta |
| HTML | `text/html` | Texto | Extrair texto visível (strip de tags) → prompt | Média |
| DOCX | `application/vnd.openxmlformats-...` | Conversão | `mammoth` (JS puro) extrai texto → prompt | Média |
| ODT | `application/vnd.oasis.opendocument.text` | Conversão | Unzip + parse `content.xml` → texto → prompt | Baixa (best effort) |
| EPUB | `application/epub+zip` | Conversão | Unzip + concatenar XHTML → texto → prompt | Baixa (best effort) |
| RTF | `application/rtf` | Conversão | Parser RTF JS → texto → prompt | Baixa (best effort) |
| Outro | qualquer | — | `status='failed'`, mensagem clara: "formato não suportado para leitura automática — você pode lançar manualmente" | — |

**Princípio:** o **armazenamento aceita qualquer binário**; a **leitura por IA tem tiers**. Quando a normalização falha (formato exótico, arquivo corrompido), o comprovante não é perdido — fica salvo e a usuária registra manualmente. Nunca um beco sem saída.

---

## 7. Extração LLM

### Provider

`openai/gpt-4o-mini` via **Vercel AI Gateway** (string `"openai/gpt-4o-mini"` — sem pacote provider-específico). AI SDK `generateObject`. Header de gateway com `disallowPromptTraining: true`. Env: `AI_GATEWAY_API_KEY`.

### Zod schema de extração

```ts
import { z } from 'zod';

export const receiptExtractionSchema = z.object({
  direction: z.enum(['credit', 'debit'])
    .describe('credit = entrada/receita; debit = saída/despesa'),
  document_type: z.enum(['nota_fiscal', 'recibo', 'comprovante_pix',
                          'boleto', 'extrato', 'fatura', 'outro']),
  gross_amount: z.string()
    .describe('Valor bruto em reais, formato "1234.56" (ponto decimal, sem milhar)'),
  fee_amount: z.string()
    .describe('Taxa/desconto se houver, formato "12.34"; "0" se não houver'),
  net_amount: z.string()
    .describe('Valor líquido, formato "1222.22"'),
  reference_date: z.string()
    .describe('Data de competência em ISO YYYY-MM-DD'),
  description: z.string().describe('Descrição curta do lançamento'),
  counterparty: z.string().nullable()
    .describe('Quem pagou ou recebeu, se identificável'),
  suggested_category: z.string().nullable()
    .describe('Categoria sugerida — apenas sugestão, humano decide'),
  confidence: z.number().min(0).max(1)
    .describe('Confiança geral da extração, 0 a 1'),
  field_confidence: z.object({
    gross_amount:   z.number().min(0).max(1),
    reference_date: z.number().min(0).max(1),
    direction:      z.number().min(0).max(1),
  }).describe('Confiança por campo crítico — usada pela UI para destacar o que revisar'),
});
```

> **Confiança por campo é obrigatória.** §5 promete "campos com baixa confiança destacados" — um `confidence` único e geral não permite destacar campo nenhum. O `field_confidence` resolve a contradição. **Limiar de destaque:** campo com confiança `< 0.75` é marcado visualmente na revisão como "confira este campo". O limiar vive em `lib/receipts/schema.ts` como constante nomeada, não mágico no JSX.

> Valores monetários são **strings** desde a saída do modelo. `Decimal.js` faz toda aritmética no Estágio 6. Conversão para `Number` só no `Intl.NumberFormat` da UI (invariante #3 do projeto). O modelo é instruído a normalizar o formato BR (`1.234,56`) para `1234.56`.

### Prompt (esqueleto)

Sistema: *"Você extrai dados financeiros de comprovantes de uma clínica de estética brasileira. Datas no formato brasileiro DD/MM/AAAA devem virar ISO. Valores com vírgula decimal viram ponto. Se um campo não estiver no documento, use null/0 e baixe a confiança. Nunca invente valores."* — Usuário: o documento (file/image/texto).

### Tratamento de erro

| Erro | Ação |
|------|------|
| Timeout do Gateway | `status='failed'`, `extraction_error='timeout'`; reprocessável |
| Schema inválido (modelo não respeitou Zod) | 1 retry; se persistir → `failed` |
| Documento ilegível | Modelo retorna `confidence` baixa → `needs_review` com aviso forte |
| Rate limit | Backoff; após N tentativas → `failed` |

---

## 8. Server Actions (`comprovantes.4`)

Coladas em `app/(app)/financeiro/comprovantes/actions.ts`. Todas com `requireAuth()` no topo.

| Action | Função |
|--------|--------|
| `uploadReceipt(formData)` | Valida, armazena, cria row `pending`, dispara `after()` |
| `saveReceiptReview(receiptId, data)` | Grava `reviewed_data` (sem criar transação) |
| `confirmReceipt(receiptId)` | Cria `transactions`, liga `transaction_id`, `status='confirmed'` |
| `rejectReceipt(receiptId)` | `status='rejected'`, nenhuma transação |

Função interna (não Server Action, roda em `after`): `processReceipt(receiptId)` → normaliza + extrai.

---

## 9. Segurança e LGPD (resumo — detalhe em COMPLIANCE-AUDIT)

| Vetor | Mitigação |
|-------|-----------|
| Isolamento multitenant | RLS em `receipts` + RLS em `storage.objects`; teste no `rls_isolation.test.sql` |
| Vazamento de PII em logs | Scrubbing Sentry estendido p/ `extraction_data`, `extraction_raw_text`, `reviewed_data`, `file_path`, `signed_url`, `messages` |
| Auditoria com dado sensível | Trigger `audit_receipts` customizado — só metadados, nunca conteúdo |
| Documento malicioso | MIME por magic bytes, limite de tamanho, arquivo nunca executado |
| Base legal do tratamento por IA | Política v1.1.0 + re-aceite forçado antes da feature em prod |
| Acesso indevido ao arquivo | Bucket privado + signed URL ≤ 60 s |
| Retenção | Comprovante segue retenção da conta; purga na exclusão da org |

---

## 10. NFRs

| NFR | Alvo |
|-----|------|
| Latência do upload (resposta ao browser) | < 2 s — extração roda em `after`, não bloqueia |
| Latência da extração ponta-a-ponta | < 30 s para imagem única; PDF multi-página soma o tempo de rasterização — aferir após spike TD-CMP-008 |
| Páginas processadas | até `RECEIPT_MAX_PAGES` (sugerido 5); excedente gera aviso explícito, nunca leitura silenciosa só da pág. 1 |
| Coerência financeira | `credit`: `net = gross − fee`; `debit`: `fee = 0, net = gross` — espelha `transactions_amount_coherent` (ver §3 Estágio 6) |
| Idempotência | Reenvio do **mesmo arquivo** (mesmo `file_hash`) não duplica. ⚠️ **Duas fotos do mesmo comprovante** têm hashes diferentes e **não** são deduplicadas no MVP — deduplicação semântica é Fase 6 (reconciliação) |
| Estados presos | Row em `pending`/`processing` além do limiar é reprocessável (ação manual + cron sweep) — ver §3 |
| Disponibilidade degradada | Gateway fora → comprovante salvo em `failed`, registro manual sempre disponível |

---

## 11. Mapeamento story-por-story

| Story | Entrega | Arquivos-chave |
|-------|---------|----------------|
| `comprovantes.0` | Política v1.1.0 + RPC `user_consent_status` + re-aceite forçado + FAQ | `docs/legal/privacy-v1.1.0.md`, `lib/auth/check-consent.ts`, `/aceite/privacidade` |
| `comprovantes.1` | **Spike RLS de Storage** → migration `receipts` + bucket + RLS + trigger `audit_receipts` + **ALTER `transactions.source_type` (add `'document'`)** + extensão de `rls_isolation.test.sql` (incl. `storage.objects`) | `supabase/migrations/*_receipts.sql`, `*_transactions_source_type.sql`, `rls_isolation.test.sql` |
| `comprovantes.2` | **Spike rasterização de PDF (TD-CMP-008)** → `uploadReceipt` + validação MIME/tamanho/hash + `normalizeReceipt` (pré-processamento `sharp`, rasterização PDF, conversão office — matriz §6) | `comprovantes/actions.ts`, `lib/receipts/normalize.ts` |
| `comprovantes.3` | `processReceipt` + `extractReceipt` + Zod schema (incl. `field_confidence`) + AI Gateway + scrubbing + cron sweep | `lib/receipts/extract.ts`, `lib/receipts/schema.ts`, `app/api/receipts/sweep`, `instrumentation*.ts` |
| `comprovantes.4a` | UI lista de comprovantes + upload + `ReceiptCard` (superfície leve) | `comprovantes/page.tsx`, `components/keyra/ReceiptCard.tsx` |
| `comprovantes.4b` | Tela de revisão + `saveReceiptReview`/`confirmReceipt`/`rejectReceipt` (registro financeiro) | `comprovantes/[id]/page.tsx`, `comprovantes/actions.ts` |
| `comprovantes.5` | Câmera + PWA Share Target Android + manifest | `manifest.ts`, `comprovantes/upload` |

> **Por que `.4` virou `.4a`+`.4b`:** a story original (XL, 13 pts) empacotava lista + upload + tela de revisão (Client pesado) + 3 Server Actions financeiras — exatamente a superfície Server↔Client onde o Dashboard quebrou em produção (ver `docs/dev/rsc-boundary-rules.md`). A divisão separa o gate RSC G5 (`.4a`) do gate `@finance-domain-expert` (`.4b`) e reduz o risco de cada entrega.

---

## 12. Riscos e débitos técnicos (catálogo TD-CMP)

| ID | Débito | Severidade | Tratamento |
|----|--------|------------|------------|
| TD-CMP-001 | Sem antivírus no upload (Supabase Storage não tem AV nativo) | Média | Aceito no MVP (arquivo nunca executado); avaliar ClamAV/edge function pós-MVP |
| TD-CMP-002 | EXIF de fotos de smartphone não é removido (geolocalização) | Média | Strip de EXIF na normalização — pós-MVP |
| TD-CMP-003 | `purgeOrgStorage` na exclusão de org ainda não implementado | Alta / **rastreado** | **Contrato cravado em `comprovantes.1` (AC7) — ver §12.1.** Implementação obrigatória antes do go-live do EPIC; não é mais "aceito tácito" |
| TD-CMP-004 | Tiers ODT/RTF/EPUB são best effort — taxa de falha alta | Baixa | Documentado; fallback de registro manual cobre |
| TD-CMP-005 | Sem dashboard de governança/custo do AI Gateway | Baixa | Observabilidade pós-MVP |
| TD-CMP-006 | Reprocessamento de `failed` é manual (sem fila) | Baixa | Inngest resolve quando entrar (ADR-009) |
| TD-CMP-007 | Se últimos 4 dígitos de cartão forem extraídos, avaliar PCI-DSS | Baixa | Instruir o prompt a NÃO extrair número de cartão |
| TD-CMP-008 | Rasterização de PDF em runtime serverless (sem binários de sistema) é o ponto mais frágil — `node-canvas` inviável (Cairo nativo); `@napi-rs/canvas` e `mupdf`/`pdfium` WASM precisam de validação no Fluid Compute | **Alta** | **Spike obrigatório no início de `comprovantes.2`** — sem ele a story não é estimável |
| TD-CMP-009 | Pré-processamento de imagem além da auto-rotação EXIF (desinclinação/deskew, contraste, recorte de bordas) | Média | Pós-MVP — auto-rotação via `sharp().rotate()` é o mínimo obrigatório no MVP |

### 12.1 Contrato de `purgeOrgStorage(org_id)` (cravado em `comprovantes.1`, AC7)

`ON DELETE CASCADE` em `receipts.org_id` apaga as **linhas** da tabela quando a organização é excluída, mas **não** alcança os binários em `storage.objects` — o cascade de banco não cruza para o schema `storage`. Sem uma rotina de purga, os arquivos ficam órfãos no bucket, violando o critério de retenção (LGPD: dado pessoal não persiste além da finalidade).

**Contrato:**

```
purgeOrgStorage(org_id uuid) → void
```

- Lista todos os objetos sob o prefixo `{org_id}/` no bucket `receipts` (Supabase Storage API `list`, paginado).
- Remove-os em lote (`remove`).
- **Idempotente** (reexecutar sobre prefixo já vazio é no-op) e **acoplado ao fluxo de exclusão de organização** (mesma operação que apaga a org).
- Executa server-side com `service_role` — precisa enxergar todos os objetos da org, fora do contexto de um usuário autenticado.

**Status:** contrato definido aqui; **implementação é `TD-CMP-003` rastreado**, obrigatória antes do go-live do EPIC (não vai a prod com comprovantes reais sem a purga funcionando).

---

## 13. Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-05-18 | `@aiox-master` (Orion) | Spec criada/reconstruída a partir do ADR-023. Escopo entrada+saída. |
| 2026-05-18 | `@architect` (Aria) + `@document-processor` (Íris) | **Revisão rev. 2** — veredito NEEDS_REVISION dos dois pareceres. 3 bloqueadores + 9 achados ALTO corrigidos: (B) `transactions.source_type` exige micro-migration (`'document'` não existia no CHECK); (B) PDF não é visão nativa no `gpt-4o-mini` → rasterização sempre + spike TD-CMP-008; (A) RLS de Storage sem precedente → spike em `.1`; (A) `next/after` pode perder callback → recuperação de estados presos + cron sweep; (A) `comprovantes.4` XL dividida em `.4a`/`.4b`; (A) coerência `debit` explícita; (A) pré-processamento `sharp().rotate()` obrigatório; (A) `field_confidence` por campo; (A) `RECEIPT_MAX_PAGES` multi-página. Achados MÉDIO/BAIXO/NIT registrados nos pareceres para `@sm` absorver no draft. |
