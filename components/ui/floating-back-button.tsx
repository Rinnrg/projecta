"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* Water-glass transition easings from tema */
const LIQUID_SETTLE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const SPRING_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'

interface FloatingBackButtonProps {
  className?: string
  onClick?: () => void
}

export function FloatingBackButton({ className, onClick }: FloatingBackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isFloating, setIsFloating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const blobRef = useRef<HTMLDivElement>(null)

  // Determine if this page should show the button at all
  const isHiddenPage = pathname === '/login' || pathname === '/' || pathname === '/dashboard'

  useEffect(() => {
    if (isHiddenPage) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const shouldFloat = currentScrollY > 50
      
      // Only show button when scrolled
      setIsVisible(currentScrollY > 20)
      
      // Trigger liquid morph when floating state changes
      if (shouldFloat !== isFloating) {
        setIsFloating(shouldFloat)
      }
    }

    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHiddenPage, isFloating])

  /* Animate liquid blob morph when floating state changes */
  useEffect(() => {
    const blob = blobRef.current
    const button = buttonRef.current
    if (!blob || !button) return

    if (isFloating) {
      // Morphing INTO floating — liquid glass blob expand and lift
      blob.animate([
        { transform: 'scale(1)', borderRadius: '50%', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px -2px rgba(59, 130, 246, 0.25)', offset: 0 },
        { transform: 'scale(1.08, 0.92)', borderRadius: '45%', backdropFilter: 'blur(14px)', offset: 0.25 },
        { transform: 'scale(0.94, 1.06)', borderRadius: '55%', backdropFilter: 'blur(18px)', offset: 0.5 },
        { transform: 'scale(1.02, 0.98)', borderRadius: '48%', backdropFilter: 'blur(20px)', offset: 0.75 },
        { transform: 'scale(1)', borderRadius: '50%', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px -2px rgba(59, 130, 246, 0.35)', offset: 1 },
      ], {
        duration: 450,
        easing: LIQUID_SETTLE,
        fill: 'forwards',
      })
    } else {
      // Morphing OUT of floating — settle back to default
      blob.animate([
        { transform: 'scale(1)', borderRadius: '50%', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px -2px rgba(59, 130, 246, 0.35)', offset: 0 },
        { transform: 'scale(1.04, 0.96)', borderRadius: '48%', backdropFilter: 'blur(16px)', offset: 0.3 },
        { transform: 'scale(0.98, 1.02)', borderRadius: '52%', backdropFilter: 'blur(14px)', offset: 0.6 },
        { transform: 'scale(1)', borderRadius: '50%', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px -2px rgba(59, 130, 246, 0.25)', offset: 1 },
      ], {
        duration: 380,
        easing: LIQUID_SETTLE,
        fill: 'forwards',
      })
    }
  }, [isFloating])

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Liquid press animation
    const blob = blobRef.current
    if (blob) {
      blob.animate([
        { transform: 'scale(1)', offset: 0 },
        { transform: 'scale(0.92, 1.08)', offset: 0.5 },
        { transform: 'scale(1)', offset: 1 },
      ], {
        duration: 200,
        easing: SPRING_EASING,
        fill: 'forwards',
      })
    }
    
    if (onClick) {
      onClick()
    } else {
      router.back()
    }
  }

  // Don't render on hidden pages or when not visible
  if (isHiddenPage || !isVisible) {
    return null
  }

  return (
    <div 
      className={cn(
        "fixed left-4 top-20 z-[9999] block md:hidden",
        "transition-all duration-700 ease-out",
        "opacity-100 pointer-events-auto",
        className
      )}
    >
      <Button
        ref={buttonRef}
        onClick={handleBack}
        size="icon"
        type="button"
        className={cn(
          "h-12 w-12 rounded-full relative overflow-hidden",
          "cursor-pointer pointer-events-auto",
          /* Remove default Button styles to let blob handle them */
          "bg-transparent border-none shadow-none hover:bg-transparent",
          "text-primary dark:text-primary",
          "transition-none", // Let blob handle transitions
          "transform-gpu backface-hidden",
        )}
      >
        {/* Liquid Glass Blob Background */}
        <div
          ref={blobRef}
          className={cn(
            "absolute inset-0 rounded-full",
            /* Liquid Glass effect from tema api.scss */
            "bg-primary/15 dark:bg-primary/20",
            "backdrop-blur-[12px] backdrop-saturate-[300%]",
            "border border-primary/20 dark:border-primary/30",
            /* Multi-layer liquid shadow */
            "shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.3),0_4px_16px_-2px_rgba(var(--primary-rgb,59,130,246),0.25),0_0_0_1px_rgba(var(--primary-rgb,59,130,246),0.05)]",
            "dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.06),0_4px_16px_-2px_rgba(var(--primary-rgb,59,130,246),0.35),0_0_0_1px_rgba(var(--primary-rgb,59,130,246),0.1)]",
            /* Water surface dynamics */
            "will-change-[transform,border-radius,backdrop-filter,box-shadow]",
            /* Hover enhancement */
            "group-hover:bg-primary/25 group-hover:border-primary/30",
          )}
          style={{ 
            transformOrigin: 'center center',
            // Initial state - will be overridden by WAAPI
            transform: 'scale(1)',
            borderRadius: '50%',
            backdropFilter: 'blur(12px)'
          }}
        />
        
        <ChevronLeft className="h-6 w-6 relative z-10" />
        <span className="sr-only">Kembali</span>
      </Button>
    </div>
  )
}
