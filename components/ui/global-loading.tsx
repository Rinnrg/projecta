'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface GlobalLoadingProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function GlobalLoading({
  isLoading,
  message = "Loading...",
  className
}: GlobalLoadingProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isLoading) return null

  const loadingContent = (
    <div
      className={cn(
        /* Full screen overlay with enhanced blur */
        'fixed inset-0 z-[9999] flex items-center justify-center',
        /* Strong backdrop blur for complete coverage using new utility */
        'bg-black/50 backdrop-loading',
        'animate-in fade-in-0 duration-300',
        className
      )}
    >
      {/* Loading content container */}
      <div
        className={cn(
          /* Liquid glass loading wrapper */
          'bg-white/80 dark:bg-neutral-900/80',
          'backdrop-blur-[20px] backdrop-saturate-[200%]',
          /* Enhanced glass shadows */
          'shadow-[inset_0_0_12px_0_rgba(220,220,220,0.3),0_8px_32px_-4px_rgba(0,0,0,0.2),0_0_16px_0_rgba(220,220,220,0.5)]',
          'dark:shadow-[inset_0_0_12px_0_rgba(40,40,40,0.4),0_8px_32px_-4px_rgba(0,0,0,0.6),0_0_16px_0_rgba(0,0,0,0.3)]',
          /* Asymmetric borders for depth */
          'border-[0.5px] border-t-white/100 border-b-white/100 border-r-white/80 border-l-white/60',
          'dark:border-t-white/15 dark:border-b-white/15 border-r-white/12 dark:border-l-white/10',
          'rounded-3xl px-8 py-6',
          'flex flex-col items-center gap-4 min-w-[140px]',
          /* GPU compositing for smooth animation */
          'transform-gpu backface-hidden',
          'animate-in zoom-in-95 fade-in-0 duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]'
        )}
      >
        {/* Enhanced spinner */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm animate-pulse" />
          
          {/* Main spinner */}
          <Loader2 className="relative size-8 animate-spin text-primary" />
          
          {/* Inner highlight dot */}
          <div className="absolute top-[2px] left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2" />
        </div>
        
        {/* Loading message */}
        {message && (
          <p className="text-sm font-medium text-foreground/90 text-center">
            {message}
          </p>
        )}
      </div>
    </div>
  )

  return createPortal(loadingContent, document.body)
}

// Hook untuk global loading state
export function useGlobalLoading() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string>()

  const showLoading = React.useCallback((loadingMessage?: string) => {
    setMessage(loadingMessage)
    setIsLoading(true)
  }, [])

  const hideLoading = React.useCallback(() => {
    setIsLoading(false)
    setMessage(undefined)
  }, [])

  const LoadingComponent = React.useCallback(() => (
    <GlobalLoading isLoading={isLoading} message={message} />
  ), [isLoading, message])

  return {
    isLoading,
    showLoading,
    hideLoading,
    LoadingComponent
  }
}
