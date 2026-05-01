import { Skeleton } from '@/components/keyra';

export default function AgendaLoading() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <Skeleton className="h-32 w-full" />

      <header className="flex flex-col gap-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </header>

      <Skeleton className="h-12 w-full" />

      <Skeleton className="flex-1 min-h-[400px]" />
    </div>
  );
}
