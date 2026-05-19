# EPIC COMPROVANTES — Comprovantes Inteligentes (Phase 7.0 do KEYRA)

**Status:** 📋 Active — pronto para `@sm *draft comprovantes.0`
**Criado em:** 2026-05-18
**Squad responsável:** [`squad-keyra-integrations`](../../squads/squad-keyra-integrations/) (workflow `keyra-integracoes-spec-sdc.yaml`)
**Pré-condição:** MVP feature-complete (Sprints 1-8 Done) — ✅ atendida
**Numeração:** prefixo `comprovantes.x` para evitar colisão com `i5.x`/`i6.x` (EPIC-INTELLIGENCE) e `auth.x`
**Documentos canônicos:**
- `docs/architecture/EPIC-COMPROVANTES-SPEC.md` — spec arquitetural completa
- `docs/architecture/ARCHITECTURE.md` §11.3 — ADR-023 (provider lock + arquitetura)
- `docs/architecture/COMPLIANCE-AUDIT-EPIC-COMPROVANTES.md` — auditoria preventiva LGPD (Têmis)
- `docs/legal/privacy-v1.1.0-DRAFT.md` — nova Política de Privacidade

---

## Por que existe

A tese da KEYRA — *"o financeiro nasce automaticamente da operação"* — está provada: comanda → pagamento → transação roda sozinho via triggers. Mas a tese cobre só o que passa pela comanda. **Tudo que entra por fora dela ainda exige digitação manual:**

| Lançamento | Origem típica | Direção | Hoje |
|------------|---------------|---------|------|
| Pix recebido de cliente | Venda avulsa, sinal | Receita (`credit`) | Digitação manual em `/financeiro/receitas` |
| Venda de produto no balcão | Cosmético, skincare | Receita (`credit`) | Digitação manual |
| Taxa da maquininha | Extrato Cielo/Stone/Rede | Despesa (`debit`) | Digitação manual em `/financeiro/despesas` |
| Conta de luz / aluguel | Boleto, fatura | Despesa (`debit`) | Digitação manual |
| NF de fornecedor de insumo | Nota fiscal eletrônica | Despesa (`debit`) | Digitação manual |

A usuária (Camila) gasta minutos por dia digitando dados que **já estão na foto ou no PDF do comprovante**. Este epic fecha esse atrito: ela anexa o documento, a IA lê, ela confirma, o sistema registra.

**Escopo confirmado pela idealizadora (2026-05-18):** o pipeline cobre **entrada E saída** — receita e despesa com a mesma infraestrutura. A direção (`credit`/`debit`) é um dado extraído pela IA e confirmado na revisão.

---

## A jornada (fluxo de ponta a ponta)

```
Anexar (qualquer formato: foto, print, PDF, DOCX, ODT, TXT, RTF, HTML, EPUB, MD)
  → Normalizar  (descobrir o que é e preparar para a IA ler)
  → Armazenar   (Supabase Storage privado + registro em `receipts`)
  → Ler         (LLM extrai valor, data, descrição, direção, categoria sugerida)
  → Revisar     (humano confirma/corrige — OCR é falível, revisão é obrigatória)
  → Registrar   (vira `transactions` → aparece no DRE e no fluxo de caixa)
```

---

## Estrutura: 7 stories (~48 pontos)

> Estrutura **rev. 2** — incorpora os pareceres de `@architect` e `@document-processor` (ver `docs/architecture/reviews/`). A story `.4` original (XL) foi dividida em `.4a`/`.4b`; `.1` e `.2` ganharam spikes obrigatórios.

| Story | T-shirt | Pts | Foco | Gates Phase 3.5 |
|-------|---------|-----|------|------------------|
| `comprovantes.0` | M | 6 | Política de Privacidade v1.1.0 + re-aceite forçado + FAQ "como a IA usa meus documentos" | Compliance |
| `comprovantes.1` | M | 6 | **Spike RLS de Storage** → schema `receipts` + bucket privado + RLS + trigger `audit_receipts` + **ALTER `transactions.source_type`** + extensão do teste RLS | Data-engineer + Compliance |
| `comprovantes.2` | L | 8 | **Spike rasterização de PDF** → ingestão multi-formato + normalização (`sharp`, rasterização, conversão office) + validação de segurança | Compliance |
| `comprovantes.3` | L | 9 | Pipeline de extração LLM assíncrono (`next/after` + AI Gateway + Zod + `field_confidence` + scrubbing + cron sweep) | Compliance + Financial |
| `comprovantes.4a` | M | 6 | UI lista de comprovantes + upload + `ReceiptCard` (superfície leve) | RSC G5 |
| `comprovantes.4b` | L | 8 | Tela de revisão + registro em `transactions` (3 Server Actions financeiras) | Financial + RSC G5 |
| `comprovantes.5` | M | 5 | Captura mobile — câmera direta + PWA Share Target (Android) + smoke iOS/Android | RSC Regra 4 |
| **Total** | — | **48** | — | — |

> **Por que `.4` foi dividida:** a story original empacotava lista + upload + tela de revisão (Client pesado) + 3 Server Actions financeiras — a mesma superfície Server↔Client onde o Dashboard quebrou em produção (`docs/dev/rsc-boundary-rules.md`). A divisão isola o gate RSC do gate financeiro.

> **Fase 6 — Reconciliação & categorização automática** (`comprovantes.6+`) fica **fora do MVP**. Cruzar comprovante com transações existentes, deduplicação inteligente e auto-categorização entram quando o volume justificar. Catalogado, não draftado.

---

## Cadeia de dependências

```
comprovantes.0 (legal) ──────────┐
                                  ├──► comprovantes.2 (ingestão) ──► comprovantes.3 (pipeline LLM)
comprovantes.1 (schema/storage) ──┘                                          │
                                                                              ▼
                                       comprovantes.4a (lista + upload) ◄─────┤
                                                       │                      │
                                                       ▼                      ▼
                                       comprovantes.4b (revisão + registro) ◄──┘
                                                       │
                                                       ▼
                                       comprovantes.5 (captura mobile)
```

- `.0` e `.1` **paralelizáveis** — sem arquivo compartilhado exceto `database.types.ts` (regen ao final de cada).
- `.2` depende de `.1` (precisa da tabela `receipts`, do bucket e do `ALTER transactions`).
- `.3` depende de `.1` + `.2` (consome arquivo normalizado, grava extração).
- `.4a` depende de `.1` (lista/upload — não precisa da extração pronta).
- `.4b` depende de `.3` + `.4a` (consome extração, cria `transactions`).
- `.5` depende de `.4a` (estende a UI de upload).
- **Recomendação de execução:** sequencial a partir de `.1` — schema é fundação; se quebrar, melhor descobrir antes. `.0` roda em paralelo livre. **`.1` começa pelo spike de RLS de Storage e `.2` pelo spike de rasterização de PDF** — sem esses spikes as stories não são estimáveis.

---

## Schema previsto

> Migration materializada por `comprovantes.1`. Detalhe completo em `EPIC-COMPROVANTES-SPEC.md` §4.

| Objeto | Story | Resumo |
|--------|-------|--------|
| Tabela `public.receipts` | `comprovantes.1` | Estágio entre o arquivo e o ledger: arquivo, extração da IA, revisão humana, `transaction_id` resultante. `UNIQUE (org_id, file_hash)` → idempotência |
| Bucket Storage `receipts` | `comprovantes.1` | Privado, RLS por `org_id`, acesso só via signed URL curta |
| Trigger `audit_receipts` | `comprovantes.1` | Auditoria dedicada — `receipts` NÃO entra no `audit_log` universal (capturaria jsonb sensível, violando minimização LGPD Art. 6º III) |
| **Micro-migration `transactions`** | `comprovantes.1` | `ALTER` aditivo no CHECK de `transactions.source_type` para incluir `'document'` |
| `transactions` (existente) | `comprovantes.4b` | Reutilizada: `origin='manual_income'`/`'manual_expense'`, `source_type='document'`, `source_id=receipt.id` |

> **⚠️ Correção rev. 2:** a versão anterior afirmava que `transactions` não precisava de migration. **Era falso.** O CHECK real de `transactions.source_type` (`20260416001200_transactions.sql:41`) só aceita `('command','payment','invoice','manual','import')` — `'document'` não existe. `comprovantes.1` inclui uma micro-migration aditiva (`DROP CONSTRAINT` + `ADD CONSTRAINT`) que adiciona `'document'`. Sem ela, `confirmReceipt` quebra em runtime.

---

## Workflow e gates

**Workflow do squad:** [`keyra-integracoes-spec-sdc.yaml`](../../squads/squad-keyra-integrations/workflows/keyra-integracoes-spec-sdc.yaml)

```
@architect (revisão da spec) → @document-processor (Íris — pipeline OCR/normalização)
  → @sm *draft → @po *validate → @dev *develop
  → Gate 3.5: @compliance-br (Têmis) + @finance-domain-expert (Valéria)
  → @qa *qa-gate → @devops *push
```

### Gates Phase 3.5 por story

| Story | Compliance (Têmis) | Financial (Valéria) | Data-engineer (Dara) | Notas |
|-------|--------------------|--------------------|----------------------|-------|
| `comprovantes.0` | ✅ obrigatório | WAIVED | WAIVED | Política é entregável da Têmis |
| `comprovantes.1` | ✅ obrigatório | WAIVED | ✅ obrigatório | Storage + RLS + trigger custom + `ALTER transactions` |
| `comprovantes.2` | ✅ obrigatório | WAIVED | WAIVED | Upload de PII; validação de segurança |
| `comprovantes.3` | ✅ obrigatório | ✅ obrigatório | WAIVED | Envio a LLM externa; extração de valores |
| `comprovantes.4a` | WAIVED | WAIVED | WAIVED | Só RSC G5 (lista/upload — superfície Client) |
| `comprovantes.4b` | WAIVED | ✅ obrigatório | WAIVED | Cria `transactions` — coerência bruto/taxa/líquido + RSC G5 |
| `comprovantes.5` | WAIVED | WAIVED | WAIVED | Só RSC Regra 4 (smoke mobile real) |

### Gates de anti-regressão (Phase 2.5 — KEYRA)

- **G5 (RSC Boundary):** obrigatório em `comprovantes.4a`, `.4b` e `.5` — tocam `app/(app)/**`, `'use client'`, `components/keyra/**`. Rodar `scripts/check-rsc-boundaries.sh`.
- **G3 (Touch target 44×44):** `comprovantes.4a`, `.4b` e `.5` criam componentes clicáveis (botão de upload, card de comprovante, ação de revisão).
- **G1 (Princípios inegociáveis):** copy da UI segue números absolutos; nenhum percentual em label/alerta.

---

## Princípios UX inegociáveis (mantidos)

- **Anexar é uma ação, não um formulário.** Um único campo de upload que aceita qualquer arquivo — a usuária não escolhe tipo, não preenche MIME, não decide nada técnico.
- **A IA propõe, o humano decide.** A tela de revisão mostra o dado extraído ao lado do documento; campos editáveis; confiança baixa em destaque visual. Nada é registrado sem confirmação.
- **Números absolutos.** Valores sempre em R$ X,XX; sem percentual em copy.
- **Tela única.** Lista de comprovantes e revisão cabem sem ginástica de navegação.
- **Estado honesto.** Cada comprovante mostra seu estado real (`processando`, `aguardando revisão`, `registrado`, `falhou`) — sem spinner eterno nem falso "pronto".

---

## Decisões travadas (ADR-023)

1. **Provider:** `openai/gpt-4o-mini` (vision) via Vercel AI Gateway, `disallowPromptTraining: true`. Sem ZDR — mitigado pela Política v1.1.0 + re-aceite forçado.
2. **Revisão humana sempre obrigatória** no MVP — zero auto-aprovação.
3. **Assíncrono via `next/after`** — Inngest segue deferido (ADR-009).
4. **Storage privado** com signed URL de curta duração.
5. **Direção-agnóstico** — receita e despesa no mesmo pipeline.
6. **Sem reconciliação automática** no MVP — é Fase 6.

---

## Critério de saída do EPIC

1. 7 stories (`comprovantes.0`, `.1`, `.2`, `.3`, `.4a`, `.4b`, `.5`) em Done.
2. Política de Privacidade v1.1.0 publicada e re-aceite forçado ativo em produção **antes** de `comprovantes.3` ir a prod.
3. Auditoria de compliance (Têmis) com todos os achados CRÍTICOS e ALTOS endereçados ou com waiver explícito.
4. Smoke real da idealizadora: anexar uma foto de Pix recebido e uma foto de boleto pago, em mobile real (iOS + Android), e ver ambos virarem `transactions` corretas no DRE.
5. `transactions` criadas via comprovante batem com a soma esperada (NFR-FI-03) — validado por `@finance-domain-expert`.

---

## Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-05-18 | `@aiox-master` (Orion) | Epic criado/reconstruído. Plano original existia apenas na memória do agente (sessão anterior) — artefatos canônicos nunca commitados. Reconstrução com escopo ampliado para entrada+saída. 6 stories, ~47 pts, ADR-023 Accepted. |
| 2026-05-18 | `@architect` (Aria) + `@document-processor` (Íris) | **Revisão rev. 2** — pareceres em `docs/architecture/reviews/`. 3 bloqueadores corrigidos (micro-migration `transactions.source_type`; PDF rasterizado, não nativo; spike RLS de Storage). `comprovantes.4` (XL) dividida em `.4a`/`.4b`. Spikes obrigatórios em `.1` e `.2`. Total → 7 stories, ~48 pts. Pendente: `@sm *draft comprovantes.0`. |
