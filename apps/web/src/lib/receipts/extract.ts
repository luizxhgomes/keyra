import 'server-only';

import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import { env } from '@/lib/env';
import { receiptExtractionSchema, type ReceiptExtraction } from '@/lib/receipts/schema';
import type { NormalizedResult } from '@/lib/receipts/normalize';

/**
 * Estágio de extração por IA (comprovantes.3 — SPEC §5/§7).
 *
 * Lê o artefato normalizado (imagem rasterizada/foto ou texto) e devolve os
 * campos financeiros validados pelo Zod schema. `generateObject` força structured
 * output e reententa em mismatch — a IA não consegue devolver lixo livre.
 *
 * Provider OpenAI direto (ADR-023 previa AI Gateway — chave direta autorizada).
 * Revisão humana é SEMPRE obrigatória depois disto (a IA propõe, a Camila decide).
 */

const MODEL = 'gpt-4o-mini';
export const EXTRACTION_MODEL_LABEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = [
  'Você lê comprovantes financeiros brasileiros (PIX, boletos, notas fiscais, recibos,',
  'faturas de cartão, extratos de maquininha Cielo/Stone/Rede) e extrai os dados estruturados.',
  'Regras:',
  '- Valores em reais com ponto decimal (ex.: 1523.90), sem "R$" nem separador de milhar.',
  '- Datas no formato AAAA-MM-DD.',
  "- direction='credit' para dinheiro que ENTROU (receita); 'debit' para dinheiro que SAIU (despesa).",
  '- NUNCA invente dados ausentes — use null.',
  '- Se a imagem/texto estiver ilegível ou ambíguo, reduza a confiança honestamente.',
  '- Nunca repita números completos de cartão; ignore PAN se aparecer.',
].join(' ');

type ContentPart = { type: 'text'; text: string } | { type: 'image'; image: Buffer };

export async function extractReceipt(
  normalized: NormalizedResult,
): Promise<{ data: ReceiptExtraction; rawText: string | null; model: string }> {
  if (!env.OPENAI_API_KEY) {
    throw new Error(
      'leitura por IA indisponível — OPENAI_API_KEY não configurada. Você pode lançar manualmente.',
    );
  }

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

  const content: ContentPart[] = [
    { type: 'text', text: 'Extraia os dados financeiros deste comprovante.' },
  ];
  if (normalized.kind === 'image') {
    for (const img of normalized.images) content.push({ type: 'image', image: img });
  } else {
    content.push({ type: 'text', text: `Conteúdo do documento:\n\n${normalized.text}` });
  }

  const { object } = await generateObject({
    model: openai(MODEL),
    schema: receiptExtractionSchema,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  return {
    data: object,
    rawText: normalized.kind === 'text' ? normalized.text : null,
    model: EXTRACTION_MODEL_LABEL,
  };
}
