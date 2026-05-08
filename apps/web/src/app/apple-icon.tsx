import { ImageResponse } from 'next/og';

/**
 * Apple touch icon — 180×180 KEYRA "K." em cocoa-900 full-bleed.
 *
 * iOS aplica máscara squircle automaticamente, por isso o fundo é
 * preenchido inteiro (sem rounded corners no SVG). Cores espelham a
 * bolha "K." da Sidebar (Story brand.7 do EPIC-BRAND-INTEGRATION):
 * - Fundo: cocoa-900 #2B1810
 * - K: ivory-50 #FAF6EE
 * - Ponto signature: gold-300 #E5C690
 *
 * Renderizado via ImageResponse (Satori). Fraunces real exigiria fetch
 * de ArrayBuffer no build — usamos fallback serif do sistema, suficiente
 * para o tamanho do touch icon. Se quiser nitidez Fraunces, trocar por
 * fonte custom carregada via `fonts` em `ImageResponse`.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2B1810',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 700,
        }}
      >
        <span style={{ fontSize: 124, color: '#FAF6EE', letterSpacing: -4 }}>K</span>
        <span style={{ fontSize: 124, color: '#E5C690' }}>.</span>
      </div>
    ),
    size,
  );
}
