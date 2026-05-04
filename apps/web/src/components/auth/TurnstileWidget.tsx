'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  appearance?: 'always' | 'execute' | 'interaction-only';
}

/**
 * Cloudflare Turnstile widget — renderiza captcha invisível e chama onToken
 * quando o Cloudflare valida. Token deve ser enviado pra Server Action que
 * chama verifyTurnstileToken() server-side.
 *
 * Story auth.3 do EPIC-AUTH-V2.
 *
 * Site key vem de NEXT_PUBLIC_TURNSTILE_SITE_KEY (Story auth.0). Em dev sem
 * key configurada, dispara onToken('dev-bypass') automaticamente — Server
 * Action também cobre o bypass dev.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

  useEffect(() => {
    // Bypass dev se sitekey ausente — combina com fallback do verify-turnstile.ts
    if (!siteKey) {
      onTokenRef.current('dev-bypass');
      return;
    }

    const tryRender = () => {
      if (!window.turnstile || !containerRef.current) return false;
      if (widgetIdRef.current) return true;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenRef.current(token),
        'error-callback': () => onTokenRef.current(''),
        'expired-callback': () => onTokenRef.current(''),
        theme: 'auto',
        size: 'flexible',
      });
      return true;
    };

    if (tryRender()) return;

    const interval = window.setInterval(() => {
      if (tryRender()) {
        window.clearInterval(interval);
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return (
    <>
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          async
          defer
        />
      )}
      <div ref={containerRef} className="my-2" aria-label="Verificação de segurança" />
    </>
  );
}
