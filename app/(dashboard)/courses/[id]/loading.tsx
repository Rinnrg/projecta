import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CourseDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Back button skeleton */}
      <Skeleton className="h-9 w-32" />

      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Course card skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Skeleton className="h-48 w-64 rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs skeleton */}
      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
