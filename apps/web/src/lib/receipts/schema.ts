import { z } from 'zod';

/**
 * Schema da extração de um comprovante pela IA (EPIC-COMPROVANTES / SPEC §7).
 *
 * É o contrato que o `gpt-4o-mini` DEVE devolver (via `generateObject` do AI SDK,
 * que força structured output e reententa em mismatch). A IA propõe; a Camila
 * revisa e confirma (revisão humana SEMPRE obrigatória — ADR-023).
 *
 * `gross_amount` é número aqui (a IA não tem noção de Decimal); a conversão para
 * `numeric` com ROUND_HALF_EVEN acontece no boundary (`confirmReceipt`), via
 * `lib/money.ts`. Nunca usar este número direto em soma financeira.
 */
export const receiptExtractionSchema = z.object({
  direction: z
    .enum(['credit', 'debit'])
    .describe(
      "'credit' = dinheiro que ENTROU (receita: Pix recebido, venda); " +
        "'debit' = dinheiro que SAIU (despesa: conta paga, compra de insumo, taxa).",
    ),
  gross_amount: z
    .number()
    .describe('Valor total do comprovante em reais (R$), com ponto decimal. Ex.: 1523.90'),
  reference_date: z
    .string()
    .nullable()
    .describe('Data do comprovante no formato AAAA-MM-DD. null se não houver data legível.'),
  description: z
    .string()
    .nullable()
    .describe('Descrição curta do que é o comprovante. Ex.: "Pagamento PIX fornecedor".'),
  counterparty: z
    .string()
    .nullable()
    .describe('Nome de quem pagou ou recebeu (favorecido/pagador). null se ausente.'),
  document_type: z
    .enum(['pix', 'boleto', 'nota_fiscal', 'cartao', 'transferencia', 'recibo', 'outro'])
    .nullable()
    .describe('Tipo do documento financeiro identificado.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confiança geral da leitura, de 0 a 1. Seja honesto: imagem ruim → confiança baixa.'),
});

export type ReceiptExtraction = z.infer<typeof receiptExtractionSchema>;

/** Rótulos pt-BR para os tipos de documento. */
export const DOCUMENT_TYPE_LABELS: Record<NonNullable<ReceiptExtraction['document_type']>, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  nota_fiscal: 'Nota fiscal',
  cartao: 'Cartão',
  transferencia: 'Transferência',
  recibo: 'Recibo',
  outro: 'Outro',
};
