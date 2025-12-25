import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Profile Header Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <Skeleton className="mx-auto h-8 w-48 sm:mx-0" />
              <Skeleton className="mx-auto h-4 w-64 sm:mx-0" />
              <Skeleton className="mx-auto h-4 w-56 sm:mx-0" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-64" />

      {/* Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
