'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Catch-all de erro não tratado dentro do app autenticado (Story 5.2).
 *
 * Próxima das rotas, captura erros que escaparam dos `try`/`catch` das
 * Server Actions. Tom de mentora confiável (não técnico, não maternal).
 * Botão "Tentar novamente" usa `reset()` do Next App Router.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Sentry capture quando configurado em produção
    console.error('[KEYRA] Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-destructive">
            <AlertOctagon className="h-5 w-5" aria-hidden="true" />
            <span className="text-label uppercase">
              Algo deu errado
            </span>
          </div>
          <CardTitle>Não foi possível carregar essa tela.</CardTitle>
          <CardDescription>
            Pode ser uma queda momentânea da nossa infraestrutura ou um erro
            inesperado de processamento. Tente abrir de novo — se persistir,
            saia e entre na sua conta novamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} className="flex-1">
            Tentar novamente
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Voltar ao dashboard
            </Button>
          </Link>
        </CardContent>
        {error.digest ? (
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Código do erro: <code className="font-mono">{error.digest}</code>
            </p>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
