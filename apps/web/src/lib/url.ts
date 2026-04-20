import { headers } from 'next/headers';

/**
 * Builds an absolute URL for the current deployment, honoring reverse-proxy
 * headers when available (Vercel sets `x-forwarded-host` and `x-forwarded-proto`).
 *
 * Falls back to `NEXT_PUBLIC_SITE_URL` env and finally to
 * `https://usekeyra.vercel.app` when running outside a request context.
 */
export async function getAbsoluteUrl(path: string): Promise<string> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'https';
    if (host) {
      return `${proto}://${host}${cleanPath}`;
    }
  } catch {
    // headers() throws outside a request — fall through to env.
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.length > 0) {
    return `${envUrl.replace(/\/$/, '')}${cleanPath}`;
  }

  return `https://usekeyra.vercel.app${cleanPath}`;
}
