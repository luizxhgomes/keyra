import Link from 'next/link';
import { Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Root-level `not-found.tsx` (Story 7.4).
 *
 * Disparado quando a URL não corresponde a nenhuma rota — fora do escopo
 * autenticado também. Mantém tom da KEYRA (mentora, sem culpabilizar) e
 * não força login: usuário pode ter vindo de link externo quebrado.
 *
 * Para 404 dentro de `(app)/` existe `(app)/not-found.tsx` que herda o
 * `AppShell` (sidebar + bottom nav permanecem) — UX mais coesa para
 * usuário já autenticado.
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Compass className="h-5 w-5" aria-hidden="true" />
            <span className="text-label uppercase">404</span>
          </div>
          <CardTitle>Esta página não existe.</CardTitle>
          <CardDescription>
            O endereço pode ter mudado, o link estar desatualizado, ou você ter
            chegado aqui por engano. Sem drama, é só voltar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full">Ir para o dashboard</Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button variant="outline" className="w-full">
              Entrar na conta
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
