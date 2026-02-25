import { cn } from '@/lib/utils'

interface SkeletonProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'shimmer' | 'wave' | 'pulse'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

function Skeleton({ 
  className, 
  variant = 'shimmer',
  rounded = 'md',
  ...props 
}: SkeletonProps) {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md', 
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }

  const variantClasses = {
    default: 'bg-accent animate-pulse',
    shimmer: 'bg-gradient-to-r from-accent via-accent/50 to-accent bg-[length:200%_100%] animate-shimmer',
    wave: 'bg-accent animate-wave',
    pulse: 'bg-accent animate-pulse-soft'
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(
        'relative overflow-hidden',
        variantClasses[variant],
        roundedClasses[rounded],
        className
      )}
      {...props}
    />
  )
}

// Specialized skeleton components for common use cases
function SkeletonText({ 
  lines = 1, 
  className,
  ...props 
}: { lines?: number } & SkeletonProps) {
  if (lines === 1) {
    return <Skeleton className={cn('h-4', className)} {...props} />
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full', // Last line shorter
            className
          )} 
          {...props} 
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ 
  size = 'md',
  className,
  ...props 
}: { size?: 'sm' | 'md' | 'lg' | 'xl' } & SkeletonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <Skeleton 
      rounded="full"
      className={cn(sizeClasses[size], className)} 
      {...props} 
    />
  )
}

function SkeletonButton({ 
  size = 'md',
  className,
  ...props 
}: { size?: 'sm' | 'md' | 'lg' } & SkeletonProps) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-28'
  }

  return (
    <Skeleton 
      rounded="md"
      className={cn(sizeClasses[size], className)} 
      {...props} 
    />
  )
}

function SkeletonCard({ className, children, ...props }: SkeletonProps) {
  return (
    <div className={cn('p-4 sm:p-6 space-y-4', className)}>
      {children}
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard 
}
