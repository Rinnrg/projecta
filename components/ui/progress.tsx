'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

/**
 * iOS 26 Liquid Glass Progress
 * From tema/src/styles/components/ion-loading.scss: glass-background, border-radius: 24px
 * From tema/src/styles/utils/api.scss: backdrop-filter blur + saturate
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        /* Glass track — from ion-loading.scss glass-background pattern */
        'bg-primary/10 dark:bg-primary/15 relative h-2 w-full overflow-hidden rounded-full',
        'backdrop-blur-[1px]',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'bg-primary h-full w-full flex-1 rounded-full',
          /* Transition: 540ms from ios.transition.ts DURATION, easing from EASING */
          'transition-transform duration-[540ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

/**
 * iOS 26 Liquid Glass Loading Overlay
 * From tema/src/styles/components/ion-loading.scss:
 * - backdrop-opacity: 0.2
 * - loading-wrapper: glass-background, border-radius: 24px, padding: 24px
 */
function LoadingOverlay({
  className,
  message,
  ...props
}: React.ComponentProps<'div'> & { message?: string }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const overlayContent = (
    <div
      data-slot="loading-overlay"
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center',
        /* Enhanced backdrop blur for full coverage using new utility class */
        'bg-black/30 backdrop-loading',
        'animate-in fade-in-0 duration-200',
        className,
      )}
      {...props}
    >
      <div
        data-slot="loading-wrapper"
        className={cn(
          /* loading-wrapper from ion-loading.scss: glass-background + border-radius: 24px */
          'bg-white/72 dark:bg-neutral-900/72',
          'backdrop-blur-[2px] backdrop-saturate-[360%]',
          /* api.scss glass-background shadows */
          'shadow-[inset_0_0_8px_0_rgba(220,220,220,0.2),0_0_10px_0_rgba(220,220,220,0.82)]',
          'dark:shadow-[inset_0_0_8px_0_rgba(40,40,40,0.3),0_0_10px_0_rgba(0,0,0,0.5)]',
          /* Asymmetric borders from api.scss */
          'border-[0.5px] border-t-white/100 border-b-white/100 border-r-white/80 border-l-white/60',
          'dark:border-t-white/12 dark:border-b-white/12 dark:border-r-white/10 dark:border-l-white/8',
          'rounded-3xl px-6 py-5',
          'flex flex-col items-center gap-3 min-w-[120px]',
          /* GPU compositing */
          'transform-gpu backface-hidden',
          'animate-in zoom-in-95 fade-in-0 duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        )}
      >
        {/* iOS-style spinner */}
        <div className="relative size-8">
          <svg className="animate-spin size-8" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-20"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {message && (
          <p className="text-sm font-medium text-foreground/80">{message}</p>
        )}
      </div>
    </div>
  )

  // Use portal to render at document.body level for full screen coverage
  return createPortal(overlayContent, document.body)
}

/**
 * Determinate Loading Bar — top-of-page glass progress bar
 * Flows smoothly with cubic-bezier(0.32,0.72,0,1) easing
 */
function LoadingBar({
  className,
  value,
  isLoading,
  ...props
}: React.ComponentProps<'div'> & { value?: number; isLoading?: boolean }) {
  return (
    <div
      data-slot="loading-bar"
      className={cn(
        'fixed top-0 left-0 right-0 z-[110] h-[3px]',
        'bg-transparent',
        !isLoading && 'opacity-0 transition-opacity duration-300',
        isLoading && 'opacity-100',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full bg-primary rounded-full',
          'shadow-[0_0_8px_rgba(var(--primary),0.4)]',
          'transition-[width] duration-[540ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
          isLoading && !value && 'animate-loading-bar',
        )}
        style={value !== undefined ? { width: `${value}%` } : undefined}
      />
    </div>
  )
}

export { Progress, LoadingOverlay, LoadingBar }
