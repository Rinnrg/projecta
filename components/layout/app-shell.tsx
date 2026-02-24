"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { SmartBreadcrumb } from "./smart-breadcrumb"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { PageTransition } from "./page-transition"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar only */}
      {!isMobile && (
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={false}
        />
      )}

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300 ease-out",
          !isMobile && (isCollapsed ? "ml-[70px]" : "ml-[260px]"),
        )}
      >
        <Header onMenuClick={() => {}} isMobile={isMobile} />
        <main 
          className={cn(
            "flex-1 px-4 pt-2 pb-5 sm:px-6 sm:pt-3 sm:pb-6 md:px-8 md:pt-4",
            isMobile && "pb-20"
          )}
        >
          {/* Desktop only breadcrumb */}
          <SmartBreadcrumb showMobile={false} />
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Mobile floating back button */}
      {isMobile && <FloatingBackButton />}
      
      {/* Mobile bottom navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  )
}
