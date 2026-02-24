"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useAutoTranslate } from "@/lib/auto-translate-context"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FolderKanban,
  Calendar,
  Users,
  ChevronsLeft,
  ChevronsRight,
  X,
  Code,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobile?: boolean
  onNavClick?: () => void
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile, onNavClick }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useAutoTranslate()
  const [isHovered, setIsHovered] = useState(false)

  const menuItems = [
    { title: t("Beranda"), href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "GURU", "SISWA"] },
    { title: t("Jadwal"), href: "/schedule", icon: Calendar, roles: ["ADMIN", "GURU", "SISWA"] },
    { title: t("Kursus"), href: "/courses", icon: BookOpen, roles: ["GURU", "SISWA"] },
    { title: t("Proyek"), href: "/projects", icon: FolderKanban, roles: ["GURU", "SISWA"] },
    { title: t("Compiler"), href: "/compiler", icon: Code, roles: ["GURU", "SISWA"] },
  ]

  const adminMenuItems = [
    { title: t("Manajemen Role"), href: "/users", icon: Users, roles: ["ADMIN"] },
  ]

  const filteredMenu = menuItems.filter((item) => user && item.roles.includes(user.role))
  const filteredAdminMenu = adminMenuItems.filter((item) => user && item.roles.includes(user.role))

  // Sidebar akan expand jika tidak collapsed atau sedang di hover (tapi tidak untuk mobile)
  const isExpanded = isMobile || !isCollapsed || isHovered

  return (
    <aside
      onMouseEnter={() => !isMobile && isCollapsed && setIsHovered(true)}
      onMouseLeave={() => !isMobile && isCollapsed && setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col",
        /* Sidebar transition from tema/ion-menu.scss: --border: none, transparent bg */
        /* Transition easing: cubic-bezier(0.32, 0.72, 0, 1) from ios.transition.ts EASING */
        "transition-all duration-[540ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        isMobile ? "w-[280px]" : isExpanded ? "w-[260px] shadow-lg" : "w-[70px]",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden" onClick={onNavClick}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0">
            <img src="/logo projecta.svg" alt="Projecta Logo" className="h-9 w-9 object-contain" />
          </div>
          <span 
            className={cn(
              "text-base font-semibold tracking-tight text-foreground whitespace-nowrap transition-all duration-300",
              !isExpanded && !isMobile && "opacity-0 w-0"
            )}
          >
            Projecta
          </span>
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={onNavClick}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <nav className="flex flex-col gap-1 px-3 py-4 min-h-full pb-4">
          {filteredMenu.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  /* Nav item from tema/ion-tabs.scss ion-tab-button pattern */
                  "group relative flex items-center rounded-[14px] py-2.5 px-2 text-sm font-medium overflow-hidden",
                  /* Transition from tema: transform 140ms ease-out, color 140ms ease */
                  "transition-[background,color,transform,box-shadow] duration-[140ms]",
                  "ease-[cubic-bezier(0.32,0.72,0,1)]",
                  "transform-gpu backface-hidden",
                  `stagger-${Math.min(index + 1, 5)}`,
                  "animate-slide-in-left",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_4px_0_rgba(var(--ios26-accent-rgb,0,122,255),0.08)]"
                    /* Hover: from ion-button :not(.ion-activated):hover opacity 0.72 pattern */
                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/8 hover:text-accent-foreground active:scale-[1.03]",
                )}
              >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
              )}
              <div className="flex items-center justify-center w-[38px] shrink-0">
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110",
                    isActive && "text-primary",
                  )}
                />
              </div>
              <span 
                className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden",
                  isExpanded || isMobile ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}
              >
                {item.title}
              </span>
            </Link>
          )
        })}

        {/* Separator and Admin Menu */}
        {filteredAdminMenu.length > 0 && (
          <>
            <div className="my-2 border-t border-sidebar-border" />
            {filteredAdminMenu.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    /* Admin nav item — same pattern as ion-tab-button */
                    "group relative flex items-center rounded-[14px] py-2.5 px-2 text-sm font-medium overflow-hidden",
                    "transition-[background,color,transform,box-shadow] duration-[140ms]",
                    "ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "transform-gpu backface-hidden",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[inset_0_0_4px_0_rgba(var(--ios26-accent-rgb,0,122,255),0.08)]"
                      : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/8 hover:text-accent-foreground active:scale-[1.03]",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                  )}
                  <div className="flex items-center justify-center w-[38px] shrink-0">
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110",
                        isActive && "text-primary",
                      )}
                    />
                  </div>
                  <span 
                    className={cn(
                      "whitespace-nowrap transition-all duration-300 overflow-hidden",
                      isExpanded || isMobile ? "opacity-100 w-auto" : "opacity-0 w-0"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              )
            })}
          </>
        )}
        </nav>
      </div>

      {!isMobile && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            /* Collapse button — glass pill from api.scss glass-background */
            "absolute top-5 -right-3 h-6 w-6 rounded-full border-[0.5px] border-white/70 dark:border-white/15",
            "bg-sidebar/90 backdrop-blur-[4px] backdrop-saturate-[200%]",
            "shadow-[inset_0_0_4px_0_rgba(255,255,255,0.1),0_2px_8px_-2px_rgba(0,0,0,0.1)]",
            /* Scale from ion-button.scss $scaleup-small-icon-only = 1.18, adapted */
            "hover:bg-accent hover:scale-[1.15] active:scale-[1.05]",
            /* Transition easing from tema: 140ms cubic-bezier(0.32, 0.72, 0, 1) */
            "z-50 transition-[background,transform,box-shadow] duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
            "flex items-center justify-center"
          )}
          onClick={() => {
            setIsCollapsed(!isCollapsed)
            setIsHovered(false)
          }}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      )}
    </aside>
  )
}
