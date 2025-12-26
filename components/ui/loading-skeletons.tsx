import { Card, CardContent, CardHeader } from "./card"
import { Skeleton } from "./skeleton"

export function CourseCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="flex items-center gap-4 text-sm">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Card>
            <CardContent className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <ActivityItemSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function CoursePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 sm:h-8 w-32" />
          <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-64" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Skeleton className="h-9 sm:h-10 flex-1" />
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
      </div>

      {/* Course Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function UserTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="p-3 sm:p-4 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={5} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      {/* Back Button */}
      <Skeleton className="h-9 w-32" />

      {/* Form Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 sm:h-7 w-48" />
          <Skeleton className="h-3.5 sm:h-4 w-64 mt-1.5" />
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Form Fields */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 sm:h-10 w-full" />
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-2">
            <Skeleton className="h-9 sm:h-10 flex-1" />
            <Skeleton className="h-9 sm:h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 sm:h-8 w-3/4" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
      </div>

      {/* Content */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <Skeleton className="h-5 w-24" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function ListPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 sm:h-8 w-32" />
          <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-64" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
      </div>

      {/* Search/Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Skeleton className="h-9 sm:h-10 flex-1" />
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
      </div>

      {/* List */}
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

