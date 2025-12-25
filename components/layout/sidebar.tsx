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
  Award,
  Users,
  ChevronLeft,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  X,
  Code,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobile?: boolean
  onNavClick?: () => void
}

const SINTAKS_ITEMS = [
  { key: "sintaks1", label: "Orientasi Masalah" },
  { key: "sintaks2", label: "Rencana Proyek" },
  { key: "sintaks3", label: "Jadwal Proyek" },
  { key: "sintaks4", label: "Monitoring Pelaksanaan" },
  { key: "sintaks5", label: "Pengumpulan" },
  { key: "sintaks6", label: "Presentasi" },
  { key: "sintaks7", label: "Penilaian & Evaluasi" },
  { key: "sintaks8", label: "Refleksi" },
] as const

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile, onNavClick }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useAutoTranslate()
  const [isProjectOpen, setIsProjectOpen] = useState(pathname.startsWith("/projects"))
  const [isHovered, setIsHovered] = useState(false)

  // Otomatis buka proyek jika sedang di halaman proyek
  useEffect(() => {
    if (pathname.startsWith("/projects")) {
      setIsProjectOpen(true)
    }
  }, [pathname])

  const menuItems = [
    { title: t("Beranda"), href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "GURU", "SISWA"] },
    { title: t("Jadwal"), href: "/schedule", icon: Calendar, roles: ["ADMIN", "GURU", "SISWA"] },
    { title: t("Kursus"), href: "/courses", icon: BookOpen, roles: ["ADMIN", "GURU", "SISWA"] },
    { title: t("Tugas"), href: "/assignments", icon: FileText, roles: ["ADMIN", "GURU", "SISWA"] },
    { title: t("Compiler"), href: "/compiler", icon: Code, roles: ["ADMIN", "GURU", "SISWA"] },
    { title: t("Galeri"), href: "/showcase", icon: Award, roles: ["ADMIN", "GURU"] },
  ]

  const adminMenuItems = [
    { title: t("Manajemen Role"), href: "/users", icon: Users, roles: ["ADMIN"] },
  ]

  const filteredMenu = menuItems.filter((item) => user && item.roles.includes(user.role))
  const filteredAdminMenu = adminMenuItems.filter((item) => user && item.roles.includes(user.role))
  const hasProjectAccess = user && ["ADMIN", "GURU", "SISWA"].includes(user.role)
  const isProjectActive = pathname.startsWith("/projects")

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

        {hasProjectAccess && (
          <>
            {!isExpanded && !isMobile ? (
              <Link
                href="/projects/sintaks/sintaks1"
                onClick={onNavClick}
                className={cn(
                  "group relative flex items-center rounded-md py-2.5 px-2 text-sm font-medium transition-all duration-300 overflow-hidden",
                  isProjectActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {isProjectActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                )}
                <div className="flex items-center justify-center w-[38px] shrink-0">
                  <FolderKanban className="h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                </div>
              </Link>
            ) : (
              <Collapsible open={isProjectOpen} onOpenChange={setIsProjectOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "group relative flex w-full items-center rounded-md py-2.5 px-2 text-sm font-medium transition-all duration-300 overflow-hidden",
                      isProjectActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {isProjectActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                    )}
                    <div className="flex items-center justify-center w-[38px] shrink-0">
                      <FolderKanban className="h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                    </div>
                    <span className={cn(
                      "flex-1 text-left whitespace-nowrap transition-all duration-300 overflow-hidden",
                      isExpanded || isMobile ? "opacity-100" : "opacity-0 w-0"
                    )}>
                      {t("Proyek")}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isProjectOpen && "rotate-180",
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="mt-2 mb-1 space-y-0.5 ml-[46px] border-l-2 border-border pl-2">
                    {SINTAKS_ITEMS.map((sintaks) => {
                      const href = `/projects/sintaks/${sintaks.key}`
                      const isSubActive = pathname === href || pathname.startsWith(`${href}/`)

                      return (
                        <Link
                          key={sintaks.key}
                          href={href}
                          onClick={onNavClick}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                            isSubActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                          )}
                        >
                          <span className="truncate">{t(sintaks.label)}</span>
                        </Link>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}

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
