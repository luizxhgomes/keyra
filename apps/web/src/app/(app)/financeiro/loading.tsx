import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, TableSkeleton } from '@/components/keyra';

export default function FinanceiroLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}
