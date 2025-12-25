"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [pageKey, setPageKey] = useState(0)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    } else {
      setIsChecking(false)
    }
  }, [isAuthenticated, router])

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

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setPageKey((prev) => prev + 1)
  }, [pathname])

  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-xs text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/10 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "transition-transform duration-300 ease-out",
          isMobile && !isMobileMenuOpen && "-translate-x-full",
        )}
      >
        <Sidebar
          isCollapsed={isCollapsed && !isMobile}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
          onNavClick={() => isMobile && setIsMobileMenuOpen(false)}
        />
      </div>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300 ease-out",
          !isMobile && (isCollapsed ? "ml-[70px]" : "ml-[260px]"),
        )}
      >
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMobile={isMobile} />
        <main key={pageKey} className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
