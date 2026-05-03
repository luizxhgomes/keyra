import 'server-only';

import { env } from '@/lib/env';

/**
 * Cloudflare Turnstile server-side verification.
 *
 * Story auth.0 (R3, R14, R17, R21 da auditoria de segurança).
 *
 * Fluxo:
 *   1. Widget Turnstile no client renderiza o desafio (invisível na maioria
 *      dos casos) e produz um token JWT-like.
 *   2. Form submit envia esse token junto com os dados do usuário pra Server
 *      Action.
 *   3. Server Action chama `verifyTurnstileToken(token, ip)` ANTES de aceitar
 *      o input — e SEMPRE descarta o token (single-use; reuse retorna falha).
 *
 * Se o widget não estiver configurado (env ausente), o helper retorna sucesso
 * em ambientes de desenvolvimento e falha em produção. Nunca silencioso.
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileVerifyResult =
  | { success: true }
  | { success: false; errorCodes: string[] };

interface TurnstileApiResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Verifica um token Turnstile junto à API da Cloudflare.
 *
 * @param token  Token retornado pelo widget client-side (campo `cf-turnstile-response`).
 * @param remoteIp  IP do usuário (do header `X-Forwarded-For` no Vercel). Opcional mas recomendado.
 * @returns `{ success: true }` se válido; `{ success: false, errorCodes }` caso contrário.
 *
 * Em desenvolvimento (NODE_ENV !== 'production'), se `TURNSTILE_SECRET_KEY`
 * estiver ausente, retorna sucesso de bypass + warn no console — para evitar
 * que o time fique parado se a idealizadora ainda não criou a conta. Em
 * produção isso vira erro hard.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (env.NODE_ENV === 'production') {
      return {
        success: false,
        errorCodes: ['turnstile-not-configured'],
      };
    }
    // Bypass em dev — a story auth.0 documenta isto como aceitável até o widget
    // ser provisionado.
    console.warn(
      '[turnstile] TURNSTILE_SECRET_KEY ausente — usando bypass de desenvolvimento. NÃO use em produção.',
    );
    return { success: true };
  }

  if (!token || typeof token !== 'string' || token.length < 10) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);

  let apiResp: TurnstileApiResponse;
  try {
    const httpResp = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      // Cloudflare é confiável; sem cache.
      cache: 'no-store',
    });
    apiResp = (await httpResp.json()) as TurnstileApiResponse;
  } catch (error) {
    return {
      success: false,
      errorCodes: ['network-error', error instanceof Error ? error.message : 'unknown'],
    };
  }

  if (apiResp.success) {
    return { success: true };
  }

  return {
    success: false,
    errorCodes: apiResp['error-codes'] ?? ['unknown-failure'],
  };
}

/**
 * Lista canônica de error codes do Turnstile (referência):
 *   - missing-input-secret      → secret não enviado
 *   - invalid-input-secret      → secret incorreto
 *   - missing-input-response    → token vazio
 *   - invalid-input-response    → token inválido ou expirado
 *   - bad-request               → request malformado
 *   - timeout-or-duplicate      → token reusado ou expirado (>300s)
 *   - internal-error            → erro Cloudflare (raro)
 *
 * Mensagem genérica para usuário em qualquer caso: "Verificação de segurança
 * falhou. Tente novamente." — não expor detalhes técnicos.
 */
