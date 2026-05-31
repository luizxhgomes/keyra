'use server';

import { createHash, randomUUID } from 'node:crypto';

import { revalidatePath } from 'next/cache';
import { fileTypeFromBuffer } from 'file-type';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import { AuthorizationError, requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import {
  RECEIPTS_BUCKET,
  extForMime,
  originalPath,
  normalizedTextPath,
  normalizedPagePath,
} from '@/lib/receipts/constants';
import { normalizeReceiptFile, UnsupportedFormatError } from '@/lib/receipts/normalize';
import { extractReceipt } from '@/lib/receipts/extract';
import { type ReceiptExtraction } from '@/lib/receipts/schema';
import type { Json } from '@/types/database.types';

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

function toError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof AuthorizationError) return err.message;
  if (err instanceof z.ZodError) return err.issues.map((i) => i.message).join(' · ');
  if (err instanceof Error) return err.message;
  return fallback;
}

const RECEIPTS_PATH = '/financeiro/comprovantes';

// ---------------------------------------------------------------------------
// Detecção de MIME por magic bytes (nunca confiar na extensão / file.type)
// ---------------------------------------------------------------------------
async function detectMime(buffer: Buffer, filename: string): Promise<string> {
  const ft = await fileTypeFromBuffer(buffer);
  if (ft?.mime) return ft.mime;
  // Texto puro não tem magic bytes — inferir pela extensão.
  const ext = filename.toLowerCase().split('.').pop() ?? '';
  if (ext === 'md' || ext === 'markdown') return 'text/markdown';
  if (ext === 'html' || ext === 'htm') return 'text/html';
  if (['txt', 'text', 'csv', 'log'].includes(ext)) return 'text/plain';
  return 'application/octet-stream';
}

// ===========================================================================
// AC3 — uploadReceipt: validação + armazenamento (estágio 1)
// ===========================================================================
export async function uploadReceipt(
  formData: FormData,
): Promise<ActionResult<{ receiptId: string; status: string; duplicate: boolean }>> {
  try {
    const { user, orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: 'Nenhum arquivo enviado.' };
    }
    if (file.size > env.RECEIPT_MAX_BYTES) {
      const mb = Math.round(env.RECEIPT_MAX_BYTES / 1024 / 1024);
      return { ok: false, error: `Arquivo muito grande. O limite é ${mb} MB.` };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = await detectMime(buffer, file.name);
    const fileHash = createHash('sha256').update(buffer).digest('hex');

    const supabase = await createServerClient();

    // Idempotência sem objeto órfão (parecer @architect M-3): INSERT da row ANTES
    // do upload do binário, com id gerado no app para compor o file_path.
    const receiptId = randomUUID();
    const ext = extForMime(mime);
    const filePath = originalPath(orgId, receiptId, ext);

    const { data: inserted, error: insErr } = await supabase
      .from('receipts')
      .insert({
        id: receiptId,
        org_id: orgId,
        uploaded_by: user.id,
        file_path: filePath,
        original_filename: file.name,
        mime_type: mime,
        file_size_bytes: buffer.length,
        file_hash: fileHash,
        status: 'pending',
      })
      .select('id, status')
      .single();

    if (insErr) {
      // Colisão de UNIQUE(org_id, file_hash) → arquivo já enviado: retorna o existente.
      if (insErr.code === '23505') {
        const { data: existing } = await supabase
          .from('receipts')
          .select('id, status')
          .eq('org_id', orgId)
          .eq('file_hash', fileHash)
          .is('deleted_at', null)
          .maybeSingle();
        if (existing) {
          return { ok: true, data: { receiptId: existing.id, status: existing.status, duplicate: true } };
        }
      }
      return { ok: false, error: insErr.message };
    }

    const { error: upErr } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(filePath, buffer, { contentType: mime, upsert: false });
    if (upErr) {
      // Compensating delete: sem o binário, a row não serve. Remove para não ficar presa.
      await supabase.from('receipts').delete().eq('id', receiptId);
      return { ok: false, error: `Falha ao armazenar o arquivo: ${upErr.message}` };
    }

    revalidatePath(RECEIPTS_PATH);
    return { ok: true, data: { receiptId: inserted.id, status: inserted.status, duplicate: false } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ===========================================================================
// processReceipt: normalização (estágio 2) + extração por IA (estágio 3)
// ===========================================================================
export async function processReceipt(
  receiptId: string,
): Promise<ActionResult<{ status: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const supabase = await createServerClient();

    const { data: r, error } = await supabase
      .from('receipts')
      .select('id, status, file_path, mime_type')
      .eq('id', receiptId)
      .eq('org_id', orgId)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!r) return { ok: false, error: 'Comprovante não encontrado.' };

    // Idempotente: só (re)processa de pending/failed. Já processado → devolve estado.
    if (r.status !== 'pending' && r.status !== 'failed') {
      return { ok: true, data: { status: r.status } };
    }

    await supabase.from('receipts').update({ status: 'processing' }).eq('id', receiptId);

    try {
      const { data: blob, error: dlErr } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .download(r.file_path);
      if (dlErr || !blob) throw new Error('não foi possível ler o arquivo armazenado');
      const original = Buffer.from(await blob.arrayBuffer());

      const normalized = await normalizeReceiptFile(original, r.mime_type, {
        maxPages: env.RECEIPT_MAX_PAGES,
      });

      // Persiste o artefato normalizado renderizável (nunca o original cru — CMP-M2).
      if (normalized.kind === 'image') {
        for (let i = 0; i < normalized.images.length; i++) {
          await supabase.storage
            .from(RECEIPTS_BUCKET)
            .upload(normalizedPagePath(orgId, receiptId, i + 1), normalized.images[i]!, {
              contentType: 'image/png',
              upsert: true,
            });
        }
      } else {
        await supabase.storage
          .from(RECEIPTS_BUCKET)
          .upload(normalizedTextPath(orgId, receiptId), Buffer.from(normalized.text, 'utf-8'), {
            contentType: 'text/plain; charset=utf-8',
            upsert: true,
          });
      }

      const { data: extraction, rawText, model } = await extractReceipt(normalized);

      await supabase
        .from('receipts')
        .update({
          status: 'needs_review',
          normalized_kind: normalized.kind,
          extraction_data: extraction as unknown as Json,
          extraction_raw_text: rawText,
          extraction_confidence: extraction.confidence,
          extraction_model: model,
          extraction_error: normalized.warning ?? null,
        })
        .eq('id', receiptId);

      revalidatePath(RECEIPTS_PATH);
      return { ok: true, data: { status: 'needs_review' } };
    } catch (err) {
      // Estado honesto: nunca um beco sem saída. Mensagem categórica, sem PII/stack.
      const msg =
        err instanceof UnsupportedFormatError
          ? err.userMessage
          : 'não foi possível ler este comprovante automaticamente — você pode lançar manualmente';
      await supabase
        .from('receipts')
        .update({ status: 'failed', extraction_error: msg })
        .eq('id', receiptId);
      revalidatePath(RECEIPTS_PATH);
      return { ok: true, data: { status: 'failed' } };
    }
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ===========================================================================
// Leitura — lista e detalhe
// ===========================================================================
export type ReceiptListItem = {
  id: string;
  status: string;
  original_filename: string;
  mime_type: string;
  normalized_kind: string | null;
  created_at: string;
  extraction: ReceiptExtraction | null;
  extraction_error: string | null;
  transaction_id: string | null;
};

export async function getReceipts(): Promise<ActionResult<ReceiptListItem[]>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('receipts')
      .select(
        'id, status, original_filename, mime_type, normalized_kind, created_at, extraction_data, extraction_error, transaction_id',
      )
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return { ok: false, error: error.message };

    const rows: ReceiptListItem[] = (data ?? []).map((r) => ({
      id: r.id,
      status: r.status,
      original_filename: r.original_filename,
      mime_type: r.mime_type,
      normalized_kind: r.normalized_kind,
      created_at: r.created_at,
      extraction: (r.extraction_data as unknown as ReceiptExtraction | null) ?? null,
      extraction_error: r.extraction_error,
      transaction_id: r.transaction_id,
    }));
    return { ok: true, data: rows };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export type ReceiptDetail = {
  id: string;
  status: string;
  original_filename: string;
  mime_type: string;
  normalized_kind: string | null;
  extraction: ReceiptExtraction | null;
  extraction_error: string | null;
  previewUrls: string[];
  previewText: string | null;
  accounts: { id: string; name: string }[];
  expenseCategories: { id: string; name: string }[];
};

export async function getReceiptDetail(receiptId: string): Promise<ActionResult<ReceiptDetail>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const { data: r, error } = await supabase
      .from('receipts')
      .select(
        'id, status, original_filename, mime_type, normalized_kind, extraction_data, extraction_error',
      )
      .eq('id', receiptId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!r) return { ok: false, error: 'Comprovante não encontrado.' };

    // Artefato normalizado renderizável (signed URL ≤ 60s — nunca o original cru).
    const previewUrls: string[] = [];
    let previewText: string | null = null;
    if (r.normalized_kind === 'image') {
      const { data: list } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .list(`${orgId}/${receiptId}`);
      const pages = (list ?? [])
        .filter((f) => /^normalized-p\d+\.png$/.test(f.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      for (const p of pages) {
        const { data: signed } = await supabase.storage
          .from(RECEIPTS_BUCKET)
          .createSignedUrl(`${orgId}/${receiptId}/${p.name}`, 60);
        if (signed?.signedUrl) previewUrls.push(signed.signedUrl);
      }
    } else if (r.normalized_kind === 'text') {
      const { data: blob } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .download(normalizedTextPath(orgId, receiptId));
      if (blob) previewText = (await blob.text()).slice(0, 5000);
    }

    const [accountsRes, catsRes] = await Promise.all([
      supabase
        .from('accounts')
        .select('id, name')
        .eq('org_id', orgId)
        .eq('active', true)
        .is('deleted_at', null)
        .order('name'),
      supabase
        .from('expense_categories')
        .select('id, name')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('name'),
    ]);

    return {
      ok: true,
      data: {
        id: r.id,
        status: r.status,
        original_filename: r.original_filename,
        mime_type: r.mime_type,
        normalized_kind: r.normalized_kind,
        extraction: (r.extraction_data as unknown as ReceiptExtraction | null) ?? null,
        extraction_error: r.extraction_error,
        previewUrls,
        previewText,
        accounts: accountsRes.data ?? [],
        expenseCategories: catsRes.data ?? [],
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ===========================================================================
// AC (.4b) — confirmReceipt: revisão humana → cria transaction
// ===========================================================================
const confirmSchema = z.object({
  receiptId: z.string().uuid(),
  direction: z.enum(['credit', 'debit']),
  grossAmount: z.coerce.number().positive('O valor deve ser maior que zero.'),
  referenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.'),
  description: z.string().trim().max(500).optional(),
  accountId: z.string().uuid('Selecione uma conta.'),
  expenseCategoryId: z.string().uuid().optional(),
});

export async function confirmReceipt(
  input: z.input<typeof confirmSchema>,
): Promise<ActionResult<{ transactionId: string }>> {
  try {
    const { user, orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const parsed = confirmSchema.parse(input);
    const supabase = await createServerClient();

    // Garante que o comprovante é da org e está revisável.
    const { data: r, error: rErr } = await supabase
      .from('receipts')
      .select('id, status, transaction_id, extraction_data')
      .eq('id', parsed.receiptId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();
    if (rErr) return { ok: false, error: rErr.message };
    if (!r) return { ok: false, error: 'Comprovante não encontrado.' };
    if (r.transaction_id) return { ok: false, error: 'Este comprovante já virou uma transação.' };
    if (r.status === 'confirmed' || r.status === 'rejected') {
      return { ok: false, error: 'Este comprovante já foi finalizado.' };
    }

    const reviewed = {
      direction: parsed.direction,
      gross_amount: parsed.grossAmount,
      reference_date: parsed.referenceDate,
      description: parsed.description ?? null,
      account_id: parsed.accountId,
      expense_category_id: parsed.expenseCategoryId ?? null,
    };

    const { data: tx, error: txErr } = await supabase
      .from('transactions')
      .insert({
        org_id: orgId,
        account_id: parsed.accountId,
        direction: parsed.direction,
        gross_amount: parsed.grossAmount,
        fee_amount: 0,
        net_amount: parsed.grossAmount,
        description: parsed.description ?? null,
        reference_date: parsed.referenceDate,
        expense_category_id:
          parsed.direction === 'debit' ? (parsed.expenseCategoryId ?? null) : null,
        origin: 'document',
        source_type: 'document',
        source_id: parsed.receiptId,
        created_by: user.id,
      })
      .select('id')
      .single();
    if (txErr || !tx) {
      return { ok: false, error: txErr?.message ?? 'Falha ao registrar a transação.' };
    }

    const { error: updErr } = await supabase
      .from('receipts')
      .update({
        status: 'confirmed',
        reviewed_data: reviewed as unknown as Json,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        transaction_id: tx.id,
      })
      .eq('id', parsed.receiptId)
      .eq('org_id', orgId);
    if (updErr) return { ok: false, error: updErr.message };

    revalidatePath(RECEIPTS_PATH);
    revalidatePath('/financeiro');
    return { ok: true, data: { transactionId: tx.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function rejectReceipt(receiptId: string): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('receipts')
      .update({ status: 'rejected' })
      .eq('id', receiptId)
      .eq('org_id', orgId)
      .is('transaction_id', null);
    if (error) return { ok: false, error: error.message };

    revalidatePath(RECEIPTS_PATH);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}
