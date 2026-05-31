// `heic-convert` (2.x) não publica tipos. Declaração mínima do uso no KEYRA
// (EPIC-COMPROVANTES / comprovantes.2): conversão HEIC → JPEG antes do sharp().
declare module 'heic-convert' {
  interface HeicConvertOptions {
    /** Buffer do HEIC original. */
    buffer: Uint8Array | ArrayBufferLike;
    /** Formato de saída. */
    format: 'JPEG' | 'PNG';
    /** Qualidade 0..1 (apenas JPEG). */
    quality?: number;
  }
  function convert(options: HeicConvertOptions): Promise<ArrayBuffer>;
  export default convert;
}
