'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * `global-error.tsx` (Story 7.4) — fallback derradeiro.
 *
 * Disparado quando o `<html>` raiz não conseguiu renderizar (erro no
 * `app/layout.tsx`, erro na hidratação inicial, etc.). Diferente de
 * `(app)/error.tsx`, este componente substitui completamente a árvore
 * — precisa renderizar `<html>` e `<body>` próprios.
 *
 * Mantém UI mínima (sem dependências externas, sem Tailwind compilado
 * é safe), só HTML inline + reset button. Captura no Sentry pra termos
 * trace mesmo nos cenários mais catastróficos.
 *
 * **Por que não usar shadcn aqui?** Em modo "global error" o CSS pode
 * não ter carregado. HTML/inline-styles é o único contrato que sempre
 * funciona — qualquer dependência aqui é risco extra.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#fafafa',
          color: '#111',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#dc2626',
              margin: '0 0 8px',
            }}
          >
            Erro crítico
          </p>
          <h1 style={{ fontSize: '20px', margin: '0 0 8px', fontWeight: 600 }}>
            Não conseguimos carregar o KEYRA agora.
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px', lineHeight: 1.5 }}>
            Alguma coisa quebrou antes mesmo da tela começar. Já registramos o
            erro automaticamente. Tente recarregar — se continuar assim,
            entre em contato com o suporte.
          </p>
          <button
            onClick={reset}
            style={{
              display: 'inline-block',
              padding: '10px 16px',
              background: '#111',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
          {error.digest ? (
            <p
              style={{
                fontSize: '12px',
                color: '#999',
                margin: '16px 0 0',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              Código: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
