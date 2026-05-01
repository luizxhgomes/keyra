import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { KPICardSkeleton, Skeleton } from '@/components/keyra';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICardSkeleton variant="hero" />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
