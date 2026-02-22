import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function MateriDetailLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 sm:-m-8">
      {/* Sidebar Skeleton */}
      <div className="w-80 border-r bg-card/50 flex-col hidden lg:flex">
        <div className="p-4 sm:p-6 border-b space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="p-3 sm:p-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 sm:p-4 rounded-lg border bg-background space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="p-4 sm:p-8 w-full space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-48" />
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <Card>
              <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-24" />
              </CardContent>
            </Card>
          </div>

          <Separator />

          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Separator />
              <Skeleton className="h-4 w-full" />
              <Separator />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
