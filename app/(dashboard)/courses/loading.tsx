import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filter skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full sm:max-w-xs" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Course cards skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[16/10] w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-4">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
