"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface FloatingBackButtonProps {
  href?: string
  onClick?: () => void
  className?: string
  show?: boolean
}

export function FloatingBackButton({ 
  href, 
  onClick, 
  className,
  show = true 
}: FloatingBackButtonProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!show) {
      setIsVisible(false)
      return
    }

    const handleScroll = () => {
      // Show button after scrolling 100px down
      const shouldShow = window.scrollY > 100
      setIsVisible(shouldShow)
    }

    // Show immediately if already scrolled
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [show])

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  if (!show) return null

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-background/20 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 hover:bg-background/30 hover:scale-105 active:scale-95",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        className
      )}
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <ArrowLeft className="h-5 w-5 text-foreground" />
    </button>
  )
}
