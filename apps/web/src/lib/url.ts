import { headers } from 'next/headers';

/**
 * Builds an absolute URL para o deployment atual.
 *
 * Ordem de prioridade:
 *   1. `NEXT_PUBLIC_SITE_URL` — canônico em prod (`https://usekeyra.com`).
 *      Garante marca consistente em emails (convites, magic link, etc.) mesmo
 *      quando a request chega via alias `usekeyra.vercel.app` ou similar.
 *   2. Headers da request (`x-forwarded-host`/`host`) — útil em dev local
 *      (`http://localhost:3000`) e em previews por branch.
 *   3. Fallback hardcoded `https://usekeyra.com` para contextos sem request.
 */
export async function getAbsoluteUrl(path: string): Promise<string> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.length > 0) {
    return `${envUrl.replace(/\/$/, '')}${cleanPath}`;
  }

  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'https';
    if (host) {
      return `${proto}://${host}${cleanPath}`;
    }
  } catch {
    // headers() throws outside a request — fall through to fallback.
  }

  return `https://usekeyra.com${cleanPath}`;
}
