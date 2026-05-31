/**
 * Constantes do EPIC-COMPROVANTES (Comprovantes Inteligentes — Phase 7.0).
 *
 * `RECEIPTS_BUCKET` não é env: não varia por ambiente (parecer @architect A-3).
 * Caminhos no Storage seguem o contrato cravado em comprovantes.1:
 *   {org_id}/{receipt_id}/original.{ext}      — binário original
 *   {org_id}/{receipt_id}/normalized.txt      — artefato texto renderizável
 *   {org_id}/{receipt_id}/normalized-p{n}.png — páginas rasterizadas (PDF)
 * A tela de revisão (comprovantes.4b) renderiza SEMPRE o artefato normalizado,
 * nunca o original cru (CMP-M2).
 */

/** Bucket privado do Supabase Storage (criado em comprovantes.1). */
export const RECEIPTS_BUCKET = 'receipts' as const;

/** DPI de rasterização de PDF — decisão do spike TD-CMP-008 (mupdf). */
export const PDF_RASTER_DPI = 150;

/** Teto de caracteres do tier texto enviado à IA (evita estourar contexto — L-4). */
export const RECEIPT_TEXT_CHAR_LIMIT = 100_000;

/** Limiar de confiança por campo abaixo do qual sinalizamos revisão atenta (SPEC §7). */
export const RECEIPT_CONFIDENCE_THRESHOLD = 0.75;

export function originalPath(orgId: string, receiptId: string, ext: string): string {
  return `${orgId}/${receiptId}/original.${ext}`;
}

export function normalizedTextPath(orgId: string, receiptId: string): string {
  return `${orgId}/${receiptId}/normalized.txt`;
}

export function normalizedPagePath(orgId: string, receiptId: string, page: number): string {
  return `${orgId}/${receiptId}/normalized-p${page}.png`;
}

/** Extensão canônica a partir do MIME real (magic bytes). */
export function extForMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heic',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'text/markdown': 'md',
    'text/html': 'html',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/epub+zip': 'epub',
    'application/rtf': 'rtf',
    'text/rtf': 'rtf',
  };
  return map[mime] ?? 'bin';
}
