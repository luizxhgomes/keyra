import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/keyra';

export default function EstoqueLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />
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
