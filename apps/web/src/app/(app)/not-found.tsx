import Link from 'next/link';
import { Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * `(app)/not-found.tsx` (Story 7.4).
 *
 * 404 dentro do escopo autenticado — Next.js mantém o `AppShell` do
 * layout pai (sidebar + bottom nav + topbar) renderizado, então a usuária
 * não perde contexto: continua "dentro do KEYRA", só não achou a tela.
 *
 * Acionado tipicamente quando:
 *   • URL digitada manualmente errada (`/dahsboard`, `/painel`, etc.)
 *   • Link antigo que foi removido em refactor
 *   • Recurso específico que não existe mais (`/pacientes/{id-deletado}`)
 *     — esses devem usar `notFound()` server-side em vez de erro genérico.
 */
export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Compass className="h-5 w-5" aria-hidden="true" />
            <span className="text-label uppercase">404</span>
          </div>
          <CardTitle>Não encontramos essa tela.</CardTitle>
          <CardDescription>
            O endereço que você abriu não existe — pode ter mudado de lugar
            ou o link estar antigo. Use a navegação ao lado ou volte ao
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard">
            <Button>Voltar ao dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
