# Spike — Rasterização de PDF em serverless (TD-CMP-008)

> **Story:** `comprovantes.2` (AC1) · **Data:** 2026-05-31 · **Veredito:** 🟢 **VERDE** · **Biblioteca escolhida:** `mupdf` (WASM)

## Contexto

`gpt-4o-mini` (provider travado no ADR-023) **não aceita PDF como file part nativo** — capacidade da Anthropic/Google, não da OpenAI. Logo, todo PDF de comprovante (NF-e, boleto, fatura, extrato Cielo/Stone/Rede) precisa ser **rasterizado para imagem** antes de ir à IA. O parecer `@document-processor` (B-2) classificou isso como "o maior risco técnico do epic", porque rasterizar PDF sem binários de sistema (LibreOffice/poppler/ghostscript **indisponíveis** em serverless) é a parte frágil.

## Procedimento do spike

Ambiente: Node.js (proxy do runtime Fluid Compute da Vercel, que é Node puro), sandbox isolado, **sem** binários de sistema. PDF de teste: boleto/PIX fake de 2 páginas gerado com `pdfkit` (texto, valor, CNPJ, linha digitável — conteúdo representativo de comprovante real).

Ordem de avaliação (parecer M-5/B-2): **`mupdf` WASM primeiro**; `pdf-to-img` + `@napi-rs/canvas` como segunda opção; `node-canvas` (Cairo nativo) **descartado** de saída.

## Medições — `mupdf@1.27.0`

| Métrica | Valor | Observação |
|---------|-------|------------|
| Tipo de dependência | **WASM puro** | Sem binário de sistema; roda em qualquer Node (∴ Fluid Compute) |
| Tamanho no disco | **13 MB** | Folgado no limite de 250 MB (descompactado) de função Vercel |
| Import do módulo (proxy de cold start) | **~27 ms** | Carga do WASM; desprezível |
| Abrir documento + `countPages` | **~2,4 ms** | — |
| Rasterização página 1 (150 DPI) | **~77 ms** | Inclui warm-up do renderizador |
| Rasterização página 2 (150 DPI, warm) | **~24 ms** | Custo marginal por página |
| Saída | PNG **1241×1754** (A4@150dpi), 8-bit RGB | Texto nítido e legível — validado visualmente |

API usada (mupdf 1.27): `Document.openDocument(Uint8Array, 'application/pdf')` → `countPages()` → `loadPage(i)` → `page.toPixmap(Matrix.scale(zoom, zoom), ColorSpace.DeviceRGB, false)` → `pixmap.asPNG()`. `zoom = dpi/72`.

## Decisão

**`mupdf` é a biblioteca de rasterização do EPIC-COMPROVANTES.** Não foi necessário avaliar a segunda opção (`@napi-rs/canvas`) — o `mupdf` passou com folga em todos os critérios (sem binário nativo, rápido, previsível, multi-página nativo, saída legível).

- Confiança alta para Fluid Compute: WASM não depende de plataforma/arquitetura como módulos nativos (`.node`).
- Multi-página resolvido nativamente (`countPages` + loop `loadPage`), atende ao `RECEIPT_MAX_PAGES` da §6.
- DPI 150 é o ponto de equilíbrio legibilidade × tamanho; ajustável.

## Fallback honesto (critério AC1.4)

Não acionado (spike VERDE). Caso `mupdf` viesse a falhar em produção para um PDF específico (corrompido, protegido por senha, estrutura exótica), a normalização captura o erro e marca `status='failed'` com mensagem categórica: *"não foi possível preparar este PDF para leitura automática — você pode lançar manualmente"* (princípio "nunca um beco sem saída"). O binário permanece armazenado.

## Pendência de integração (para o AC6)

- Em produção, o `mupdf` carrega um `.wasm`. No Next.js/Vercel é preciso garantir que o asset WASM seja incluído no bundle da função serverless (via `outputFileTracingIncludes` em `next.config.ts` ou import estático que o tracer detecte). Validar no `pnpm build` + smoke do deploy que o `.wasm` resolve em runtime (não só em dev). Registrado como ponto de atenção do AC6.

## Referências

- Parecer `@document-processor` B-1 (PDF nunca é file part nativo), B-2/M-5 (rasterização é o maior risco; ordem de avaliação).
- `docs/architecture/EPIC-COMPROVANTES-SPEC.md` §3 (Estágio 2) e §6 (matriz de formatos).
- TD-CMP-008 (spec §12) — **resolvido**: biblioteca decidida (`mupdf`).
