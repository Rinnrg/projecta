"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FloatingBackButtonProps {
  className?: string
  onClick?: () => void
}

export function FloatingBackButton({ className, onClick }: FloatingBackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  
  // Don't show on login page or main dashboard
  if (pathname === '/login' || pathname === '/' || pathname === '/dashboard') {
    return null
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show button when scrolled down 50px or more
      const shouldShow = currentScrollY > 50
      setIsVisible(shouldShow)
      
      console.log('Scroll Y:', currentScrollY, 'Should show button:', shouldShow)
    }

    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Back button clicked! Will navigate back...')
    
    if (onClick) {
      onClick()
    } else {
      router.back()
    }
  }

  if (!isVisible) {
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
        onClick={handleBack}
        size="icon"
        type="button"
        className={cn(
          "h-12 w-12 rounded-full relative overflow-hidden",
          "cursor-pointer pointer-events-auto",
          "bg-blue-500/30 backdrop-blur-lg border border-blue-400/50",
          "text-blue-700 dark:text-blue-200",
          "shadow-lg shadow-blue-500/30",
          "hover:bg-blue-500/40 hover:border-blue-400/70",
          "transition-all duration-300 ease-in-out",
          "hover:scale-110 active:scale-95",
          "hover:shadow-xl hover:shadow-blue-500/40",
          "active:shadow-md active:shadow-blue-500/20"
        )}
      >
        <ChevronLeft className="h-6 w-6 relative z-10" />
        <span className="sr-only">Kembali</span>
      </Button>
    </div>
  )
}
