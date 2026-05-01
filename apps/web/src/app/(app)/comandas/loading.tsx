import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/keyra';

export default function ComandasLoading() {
  return (
    <div className="space-y-6">
      <header>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-96" />
      </header>

      <Skeleton className="h-12 w-full" />

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}
