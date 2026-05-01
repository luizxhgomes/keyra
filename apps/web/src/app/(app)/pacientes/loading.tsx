import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/keyra';

export default function PacientesLoading() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </header>

      <Skeleton className="h-10 w-full" />

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={6} />
        </CardContent>
      </Card>
    </div>
  );
}
