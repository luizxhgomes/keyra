import { Skeleton } from '@/components/keyra';

/**
 * Loading boundary raiz do grupo (app) — Story reorg.1.
 * Cobre as rotas sem boundary próprio (/configuracoes, /configuracoes/plano,
 * /mais e qualquer rota futura). Segmentos com loading.tsx granular têm precedência.
 */
export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80" />
      </header>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
