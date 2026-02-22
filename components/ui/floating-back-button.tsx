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
    <>
      {/* SVG Filters for Glass Effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="btn-glass" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8"/>
          </filter>
        </defs>
      </svg>

      <button
        onClick={handleClick}
        aria-label="Kembali ke halaman sebelumnya"
        title="Kembali"
        className={cn(
          "glass-back-button fixed top-6 left-6 z-50 transition-all duration-300 ease-out",
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2",
          className
        )}
      >
        <ArrowLeft className="glass-icon" />
      </button>

      <style jsx global>{`
        .glass-back-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          width: 44px;
          height: 44px;
          padding: 10px;
          background: transparent;
          border-radius: 50%;
          outline: none;
          border: none;
          z-index: 50;
          overflow: hidden;
        }

        .glass-back-button::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.15);
          box-shadow: 
            inset 2px 2px 0px -1px rgba(59, 130, 246, 0.8),
            inset 0 0 4px 1px rgba(59, 130, 246, 0.6),
            0 4px 20px rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .glass-back-button::after {
          content: '';
          position: absolute;
          z-index: -1;
          inset: 0;
          border-radius: 50%;
          filter: url(#btn-glass);
          overflow: hidden;
          isolation: isolate;
        }

        .glass-back-button:hover {
          transform: scale(1.05);
        }
        
        .glass-back-button:active {
          transform: scale(0.98);
        }
        
        .glass-back-button:hover::before {
          background: rgba(59, 130, 246, 0.25);
          box-shadow: 
            inset 2px 2px 0px -1px rgba(59, 130, 246, 0.9),
            inset 0 0 6px 2px rgba(59, 130, 246, 0.7),
            0 6px 25px rgba(59, 130, 246, 0.4);
        }

        .glass-icon {
          position: relative;
          z-index: 10;
          width: 20px;
          height: 20px;
          color: #3b82f6;
          stroke-width: 2.5px;
          filter: drop-shadow(0 1px 2px rgba(59, 130, 246, 0.3));
        }

        /* Dark mode adaptations */
        @media (prefers-color-scheme: dark) {
          .glass-back-button::before {
            background: rgba(96, 165, 250, 0.18);
            box-shadow: 
              inset 2px 2px 0px -1px rgba(96, 165, 250, 0.8),
              inset 0 0 4px 1px rgba(96, 165, 250, 0.6),
              0 4px 20px rgba(96, 165, 250, 0.3);
          }

          .glass-back-button:hover::before {
            background: rgba(96, 165, 250, 0.28);
            box-shadow: 
              inset 2px 2px 0px -1px rgba(96, 165, 250, 0.9),
              inset 0 0 6px 2px rgba(96, 165, 250, 0.7),
              0 6px 25px rgba(96, 165, 250, 0.4);
          }

          .glass-icon {
            color: #60a5fa;
            filter: drop-shadow(0 1px 2px rgba(96, 165, 250, 0.3));
          }
        }

        /* Animation for smooth transitions */
        .glass-back-button,
        .glass-back-button::before,
        .glass-back-button::after {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  )
}
