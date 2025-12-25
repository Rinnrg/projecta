"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAutoTranslate } from "@/lib/auto-translate-context"
import { mockCourses, mockShowcase, mockAsesmenList } from "@/lib/mock-data"
import { 
  FileText, 
  BookOpen, 
  Users, 
  Award, 
  Calendar, 
  Settings, 
  LayoutDashboard,
  Code,
  FolderOpen,
  User,
  Search,
  CheckSquare
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SearchItem {
  id: string
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  category: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

export function SearchDropdown() {
  const router = useRouter()
  const { t } = useAutoTranslate()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const searchItems: SearchItem[] = React.useMemo(() => {
    const items: SearchItem[] = [
      {
        id: "dashboard",
        title: t("Dashboard"),
        description: t("Lihat ringkasan aktivitas Anda"),
        icon: LayoutDashboard,
        href: "/dashboard",
        category: t("Navigasi"),
      },
      {
        id: "courses",
        title: t("Kursus"),
        description: t("Jelajahi semua kursus yang tersedia"),
        icon: BookOpen,
        href: "/courses",
        category: t("Navigasi"),
      },
      {
        id: "projects",
        title: t("Proyek"),
        description: t("Kelola proyek dan tugas Anda"),
        icon: FolderOpen,
        href: "/projects",
        category: t("Navigasi"),
      },
      {
        id: "assignments",
        title: t("Tugas"),
        description: t("Lihat tugas yang harus diselesaikan"),
        icon: FileText,
        href: "/assignments",
        category: t("Navigasi"),
      },
      {
        id: "schedule",
        title: t("Jadwal"),
        description: t("Lihat jadwal dan kalender Anda"),
        icon: Calendar,
        href: "/schedule",
        category: t("Navigasi"),
      },
      {
        id: "showcase",
        title: t("Portofolio"),
        description: t("Lihat portofolio proyek siswa"),
        icon: Award,
        href: "/showcase",
        category: t("Navigasi"),
      },
      {
        id: "users",
        title: t("Pengguna"),
        description: t("Kelola pengguna sistem"),
        icon: Users,
        href: "/users",
        category: t("Navigasi"),
      },
      {
        id: "compiler",
        title: t("Compiler Python"),
        description: t("Editor dan compiler kode Python"),
        icon: Code,
        href: "/compiler",
        category: t("Tools"),
      },
      {
        id: "profile",
        title: t("Profil"),
        description: t("Lihat dan edit profil Anda"),
        icon: User,
        href: "/profile",
        category: t("Pengaturan"),
      },
      {
        id: "settings",
        title: t("Pengaturan"),
        description: t("Kelola preferensi akun Anda"),
        icon: Settings,
        href: "/settings",
        category: t("Pengaturan"),
      },
    ]

    mockCourses.forEach((course) => {
      items.push({
        id: `course-${course.id}`,
        title: course.judul,
        description: course.kategori,
        icon: BookOpen,
        href: `/courses`,
        category: t("Kursus"),
        badge: course.kategori,
      })
    })

    mockShowcase.forEach((showcase) => {
      items.push({
        id: `showcase-${showcase.id}`,
        title: showcase.judul,
        description: showcase.deskripsi || undefined,
        icon: Award,
        href: `/showcase/${showcase.id}`,
        category: t("Portofolio"),
        badge: `${showcase.nilai}/100`,
        badgeVariant: showcase.nilai >= 90 ? "default" : showcase.nilai >= 75 ? "secondary" : "outline",
      })
    })

    mockAsesmenList.forEach((assessment) => {
      items.push({
        id: `assessment-${assessment.id}`,
        title: assessment.nama,
        description: assessment.deskripsi || undefined,
        icon: CheckSquare,
        href: `/assignments`,
        category: t("Penilaian"),
        badge: `${assessment.jml_soal} soal`,
      })
    })

    return items
  }, [t])

  const filteredItems = React.useMemo(() => {
    if (!search) return searchItems.slice(0, 10)

    const searchLower = search.toLowerCase()
    const filtered = searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.badge?.toLowerCase().includes(searchLower)
    )
    
    return filtered.slice(0, 20)
  }, [search, searchItems])

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, SearchItem[]> = {}
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [filteredItems])

  const handleSelect = (href: string) => {
    setOpen(false)
    setSearch("")
    router.push(href)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t("Cari")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="h-9 w-full pl-9 pr-16"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 z-50">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t("Tidak ada hasil ditemukan")}
              </div>
            ) : (
              <>
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                      {category}
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item.href)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                              "hover:bg-accent hover:text-accent-foreground",
                              "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex flex-1 flex-col items-start gap-0.5 text-left min-w-0">
                              <div className="flex items-center gap-2 w-full">
                                <span className="font-medium truncate">{item.title}</span>
                                {item.badge && (
                                  <Badge variant={item.badgeVariant || "secondary"} className="shrink-0 text-[10px] px-1.5 py-0">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {search && filteredItems.length > 0 && (
                  <div className="border-t mt-2 pt-2 px-3 py-2 text-xs text-muted-foreground text-center">
                    {t("Menampilkan")} {filteredItems.length} {t("dari")} {searchItems.length} {t("hasil")}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
