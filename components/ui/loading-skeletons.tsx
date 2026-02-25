import { Card, CardContent, CardHeader } from "./card"
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton, SkeletonCard } from "./skeleton"

export function CourseCardSkeleton() {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden">
        <Skeleton variant="shimmer" className="h-full w-full" />
        <div className="absolute top-3 right-3">
          <Skeleton variant="shimmer" rounded="full" className="h-6 w-16" />
        </div>
      </div>
      <SkeletonCard className="p-4 space-y-3">
        <SkeletonText lines={2} variant="shimmer" />
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
              <Skeleton variant="shimmer" className="h-3 w-12" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
              <Skeleton variant="shimmer" className="h-3 w-16" />
            </div>
          </div>
          <SkeletonButton size="sm" variant="shimmer" />
        </div>
      </SkeletonCard>
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton variant="shimmer" className="h-3 sm:h-4 w-20 sm:w-24" />
            <Skeleton variant="shimmer" className="h-6 sm:h-8 w-12 sm:w-16" />
            <Skeleton variant="shimmer" className="h-2 sm:h-3 w-16 sm:w-20" />
          </div>
          <div className="flex items-center justify-center">
            <Skeleton variant="shimmer" rounded="full" className="h-10 sm:h-12 w-10 sm:w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3 transition-all duration-200 hover:bg-accent/5">
      <SkeletonAvatar size="md" variant="shimmer" />
      <div className="flex-1 space-y-2">
        <SkeletonText variant="shimmer" />
        <Skeleton variant="shimmer" className="h-3 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton variant="shimmer" className="h-3 w-16" />
          <Skeleton variant="shimmer" className="h-3 w-3 rounded-full" />
          <Skeleton variant="shimmer" className="h-3 w-20" />
        </div>
      </div>
      <Skeleton variant="shimmer" className="h-5 w-12" rounded="full" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="hover:bg-accent/5 transition-colors duration-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3 sm:p-4">
          <Skeleton variant="shimmer" className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 animate-in fade-in-0 duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton variant="shimmer" className="h-6 sm:h-8 w-32 sm:w-48" />
          <SkeletonText variant="shimmer" />
          <Skeleton variant="shimmer" className="h-3 w-24 sm:w-32" />
        </div>
        <div className="flex gap-3">
          <SkeletonButton variant="shimmer" />
          <SkeletonButton variant="shimmer" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
            <StatsCardSkeleton />
          </div>
        ))}
      </div>

      {/* Quick Actions Mobile */}
      <div className="block sm:hidden">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <Skeleton variant="shimmer" rounded="lg" className="h-20 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton variant="shimmer" className="h-6 w-32" />
              <SkeletonButton size="sm" variant="shimmer" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ animationDelay: `${i * 150}ms` }}>
                  <CourseCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Activity */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="shimmer" className="h-5 w-24" />
                <SkeletonButton size="sm" variant="shimmer" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ animationDelay: `${(i + 4) * 100}ms` }}>
                  <ActivityItemSkeleton />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calendar/Schedule Widget */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <Skeleton variant="shimmer" className="h-5 w-20" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="shimmer" rounded="sm" className="h-8 w-12" />
                  <div className="flex-1 space-y-1">
                    <Skeleton variant="shimmer" className="h-3 w-full" />
                    <Skeleton variant="shimmer" className="h-2 w-2/3" />
                  </div>
                </div>
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
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in-0 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <SkeletonButton size="sm" variant="shimmer" className="w-20" />
            <Skeleton variant="shimmer" className="h-4 w-px bg-border" />
            <Skeleton variant="shimmer" className="h-4 w-16" />
          </div>
          <Skeleton variant="shimmer" className="h-6 sm:h-8 w-48 sm:w-64" />
          <SkeletonText lines={2} variant="shimmer" className="max-w-md" />
        </div>
        <div className="flex gap-3">
          <SkeletonButton variant="shimmer" />
          <SkeletonButton variant="shimmer" />
        </div>
      </div>

      {/* Stats Bar Mobile */}
      <div className="block sm:hidden">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 text-center">
              <Skeleton variant="shimmer" className="h-8 w-16 mx-auto mb-1" />
              <Skeleton variant="shimmer" className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1 relative">
            <Skeleton variant="shimmer" className="h-10 w-full" />
          </div>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton 
                key={i} 
                variant="shimmer" 
                rounded="full" 
                className="h-8 w-20 flex-shrink-0" 
              />
            ))}
          </div>
        </div>

        {/* Filter chips for mobile */}
        <div className="block sm:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton 
                key={i} 
                variant="shimmer" 
                rounded="full" 
                className="h-7 w-16 flex-shrink-0" 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
            <CourseCardSkeleton />
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-6">
        <SkeletonButton variant="shimmer" className="w-32" />
      </div>
    </div>
  )
}

export function UserTableSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in-0 duration-500">
      {/* Table Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton variant="shimmer" className="h-10 w-full sm:w-64" />
          <div className="flex gap-2">
            <SkeletonButton size="sm" variant="shimmer" />
            <SkeletonButton size="sm" variant="shimmer" />
          </div>
        </div>
        <SkeletonButton variant="shimmer" />
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <SkeletonAvatar size="lg" variant="shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton variant="shimmer" className="h-4 w-24" />
                    <Skeleton variant="shimmer" rounded="full" className="h-5 w-16" />
                  </div>
                  <Skeleton variant="shimmer" className="h-3 w-32" />
                  <Skeleton variant="shimmer" className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left">
                  <Skeleton variant="shimmer" className="h-4 w-4" />
                </th>
                {['User', 'Email', 'Role', 'Status', 'Actions'].map((_, i) => (
                  <th key={i} className="p-4 text-left">
                    <Skeleton variant="shimmer" className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b hover:bg-accent/5 transition-colors duration-200">
                  <td className="p-4">
                    <Skeleton variant="shimmer" className="h-4 w-4" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <SkeletonAvatar size="sm" variant="shimmer" />
                      <div className="space-y-1">
                        <Skeleton variant="shimmer" className="h-4 w-24" />
                        <Skeleton variant="shimmer" className="h-3 w-32" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Skeleton variant="shimmer" className="h-4 w-32" />
                  </td>
                  <td className="p-4">
                    <Skeleton variant="shimmer" className="h-4 w-20" />
                  </td>
                  <td className="p-4">
                    <Skeleton variant="shimmer" rounded="full" className="h-6 w-16" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Skeleton variant="shimmer" className="h-8 w-8" rounded="md" />
                      <Skeleton variant="shimmer" className="h-8 w-8" rounded="md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton variant="shimmer" className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <SkeletonButton size="sm" variant="shimmer" className="w-20" />
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="shimmer" className="h-8 w-8" rounded="md" />
            ))}
          </div>
          <SkeletonButton size="sm" variant="shimmer" className="w-20" />
        </div>
      </div>
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <Card className="group transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton variant="shimmer" className="h-5 w-3/4" />
            <SkeletonText lines={2} variant="shimmer" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton variant="shimmer" rounded="full" className="h-6 w-16" />
            <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
            <Skeleton variant="shimmer" className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
            <Skeleton variant="shimmer" className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
            <Skeleton variant="shimmer" className="h-4 w-28" />
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton variant="shimmer" className="h-3 w-16" />
            <Skeleton variant="shimmer" className="h-3 w-12" />
          </div>
          <Skeleton variant="shimmer" className="h-2 w-full" rounded="full" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex -space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonAvatar key={i} size="sm" variant="shimmer" className="border-2 border-background" />
            ))}
            <Skeleton variant="shimmer" rounded="full" className="h-8 w-8 border-2 border-background flex items-center justify-center" />
          </div>
          <SkeletonButton size="sm" variant="shimmer" />
        </div>
      </CardContent>
    </Card>
  )
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in-0 duration-500">
      {/* Breadcrumb/Back Navigation */}
      <div className="flex items-center gap-2">
        <SkeletonButton size="sm" variant="shimmer" className="w-20" />
        <Skeleton variant="shimmer" className="h-4 w-px bg-border" />
        <Skeleton variant="shimmer" className="h-4 w-24" />
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton variant="shimmer" className="h-6 sm:h-8 w-48 sm:w-64" />
        <SkeletonText variant="shimmer" className="max-w-md" />
      </div>

      {/* Form Card */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="space-y-3">
          <Skeleton variant="shimmer" className="h-6 w-40" />
          <Skeleton variant="shimmer" className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Fields */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className={`space-y-2 animate-in fade-in-0 duration-300`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Skeleton variant="shimmer" className="h-4 w-24" />
              {i === 2 ? (
                // Textarea field
                <Skeleton variant="shimmer" className="h-24 w-full" />
              ) : i === 4 ? (
                // File upload field
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <div className="text-center space-y-2">
                    <Skeleton variant="shimmer" className="h-8 w-8 mx-auto" rounded="md" />
                    <Skeleton variant="shimmer" className="h-4 w-32 mx-auto" />
                    <Skeleton variant="shimmer" className="h-3 w-24 mx-auto" />
                  </div>
                </div>
              ) : i === 5 ? (
                // Select field
                <div className="space-y-2">
                  <Skeleton variant="shimmer" className="h-10 w-full" />
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} variant="shimmer" rounded="full" className="h-6 w-16" />
                    ))}
                  </div>
                </div>
              ) : (
                // Regular input field
                <Skeleton variant="shimmer" className="h-10 w-full" />
              )}
              {i === 0 && (
                <Skeleton variant="shimmer" className="h-3 w-48" />
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-border/50">
            <SkeletonButton variant="shimmer" className="flex-1" />
            <SkeletonButton variant="shimmer" className="flex-1" />
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Cards for mobile */}
      <div className="block sm:hidden space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Skeleton variant="shimmer" className="h-4 w-20" />
              <SkeletonText lines={2} variant="shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Skeleton variant="shimmer" className="h-4 w-16" />
        <Skeleton variant="shimmer" className="h-4 w-px bg-border" />
        <Skeleton variant="shimmer" className="h-4 w-20" />
        <Skeleton variant="shimmer" className="h-4 w-px bg-border" />
        <Skeleton variant="shimmer" className="h-4 w-24" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="lg" variant="shimmer" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="shimmer" className="h-6 sm:h-8 w-48 sm:w-64" />
              <div className="flex items-center gap-2">
                <Skeleton variant="shimmer" rounded="full" className="h-5 w-16" />
                <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
                <Skeleton variant="shimmer" className="h-4 w-20" />
              </div>
            </div>
          </div>
          <SkeletonText lines={2} variant="shimmer" className="max-w-2xl" />
        </div>
        <div className="flex gap-3">
          <SkeletonButton variant="shimmer" />
          <SkeletonButton variant="shimmer" />
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Info Card */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <Skeleton variant="shimmer" className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <SkeletonText lines={4} variant="shimmer" />
              
              {/* Media/Image placeholder */}
              <div className="aspect-video rounded-lg overflow-hidden">
                <Skeleton variant="shimmer" className="h-full w-full" />
              </div>
              
              <SkeletonText lines={3} variant="shimmer" />
            </CardContent>
          </Card>

          {/* Additional Content Sections */}
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <Skeleton variant="shimmer" className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                    <Skeleton variant="shimmer" rounded="sm" className="h-8 w-8 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="shimmer" className="h-4 w-3/4" />
                      <Skeleton variant="shimmer" className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Stats */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <Skeleton variant="shimmer" className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
                    <Skeleton variant="shimmer" className="h-4 w-20" />
                  </div>
                  <Skeleton variant="shimmer" className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Related Items */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <Skeleton variant="shimmer" className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonAvatar size="sm" variant="shimmer" />
                  <div className="flex-1 space-y-1">
                    <Skeleton variant="shimmer" className="h-4 w-full" />
                    <Skeleton variant="shimmer" className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Panel */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4 space-y-3">
              <Skeleton variant="shimmer" className="h-5 w-20" />
              <div className="space-y-2">
                <SkeletonButton variant="shimmer" className="w-full" />
                <SkeletonButton variant="shimmer" className="w-full" />
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
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Skeleton variant="shimmer" className="h-6 sm:h-8 w-32 sm:w-40" />
          <SkeletonText variant="shimmer" className="max-w-md" />
          
          {/* Stats for mobile */}
          <div className="block sm:hidden flex gap-4">
            <Skeleton variant="shimmer" className="h-4 w-16" />
            <Skeleton variant="shimmer" className="h-4 w-20" />
          </div>
        </div>
        <div className="flex gap-3">
          <SkeletonButton variant="shimmer" />
          <SkeletonButton variant="shimmer" />
        </div>
      </div>

      {/* Search/Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1 relative">
            <Skeleton variant="shimmer" className="h-10 w-full" />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <SkeletonButton size="sm" variant="shimmer" />
            <SkeletonButton size="sm" variant="shimmer" />
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton 
              key={i} 
              variant="shimmer" 
              rounded="full" 
              className="h-7 w-20 flex-shrink-0" 
            />
          ))}
        </div>
      </div>

      {/* View Toggle (Desktop) */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton variant="shimmer" className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonButton size="sm" variant="shimmer" className="w-20" />
          <div className="flex border rounded-lg">
            <Skeleton variant="shimmer" className="h-8 w-8" rounded="sm" />
            <Skeleton variant="shimmer" className="h-8 w-8" rounded="sm" />
            <Skeleton variant="shimmer" className="h-8 w-8" rounded="sm" />
          </div>
        </div>
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="group transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                {/* Mobile: Avatar + Main Content */}
                <div className="block sm:hidden w-full">
                  <div className="flex items-start gap-3 mb-3">
                    <SkeletonAvatar size="md" variant="shimmer" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="shimmer" className="h-5 w-3/4" />
                      <Skeleton variant="shimmer" className="h-3 w-1/2" />
                    </div>
                    <Skeleton variant="shimmer" rounded="full" className="h-6 w-16" />
                  </div>
                  <SkeletonText lines={2} variant="shimmer" />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex gap-2">
                      <Skeleton variant="shimmer" rounded="full" className="h-6 w-16" />
                      <Skeleton variant="shimmer" rounded="full" className="h-6 w-12" />
                    </div>
                    <SkeletonButton size="sm" variant="shimmer" />
                  </div>
                </div>

                {/* Desktop: Horizontal Layout */}
                <div className="hidden sm:flex items-start gap-4 w-full">
                  <SkeletonAvatar size="lg" variant="shimmer" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="shimmer" className="h-5 w-2/3" />
                        <SkeletonText variant="shimmer" className="max-w-md" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton variant="shimmer" rounded="full" className="h-6 w-16" />
                        <SkeletonButton size="sm" variant="shimmer" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
                        <Skeleton variant="shimmer" className="h-3 w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
                        <Skeleton variant="shimmer" className="h-3 w-16" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton variant="shimmer" className="h-4 w-4" rounded="sm" />
                        <Skeleton variant="shimmer" className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More / Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton variant="shimmer" className="h-4 w-32" />
        <div className="flex justify-center sm:justify-end">
          <SkeletonButton variant="shimmer" className="w-32" />
        </div>
      </div>
    </div>
  )
}

// Additional specialized skeletons for mobile
export function MobileCardSkeleton() {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <SkeletonAvatar size="md" variant="shimmer" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton variant="shimmer" className="h-4 w-24" />
              <Skeleton variant="shimmer" rounded="full" className="h-5 w-16" />
            </div>
            <Skeleton variant="shimmer" className="h-3 w-32" />
            <Skeleton variant="shimmer" className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MobileListSkeleton() {
  return (
    <div className="block sm:hidden space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <MobileCardSkeleton key={i} />
      ))}
    </div>
  )
}

