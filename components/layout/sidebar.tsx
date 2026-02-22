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
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
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
                  "group relative flex items-center rounded-md py-2.5 px-2 text-sm font-medium transition-all duration-300 animate-slide-in-left overflow-hidden",
                  `stagger-${Math.min(index + 1, 5)}`,
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
                    "group relative flex items-center rounded-md py-2.5 px-2 text-sm font-medium transition-all duration-300 overflow-hidden",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
            "absolute top-5 -right-3 h-6 w-6 rounded-md border-2 bg-sidebar hover:bg-accent z-50 shadow-md transition-all duration-300",
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
