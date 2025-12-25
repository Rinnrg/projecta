"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useAutoTranslate } from "@/lib/auto-translate-context"
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
  GraduationCap
} from "lucide-react"

interface SearchItem {
  id: string
  title: string
  description?: string
  url: string
  icon: React.ReactNode
  category: string
  keywords?: string[] // Add keywords for better search
}

interface SearchDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SearchDialog({ open: controlledOpen, onOpenChange }: SearchDialogProps = {}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const router = useRouter()
  const { t } = useAutoTranslate()

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // Define searchable items
  const searchItems: SearchItem[] = [
    // Dashboard
    {
      id: "dashboard",
      title: t("Dashboard"),
      description: t("Halaman utama"),
      url: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      category: t("Navigasi"),
      keywords: ["dashboard", "home", "beranda", "utama", "main"],
    },
    // Courses
    {
      id: "courses",
      title: t("Kursus"),
      description: t("Lihat semua kursus"),
      url: "/courses",
      icon: <BookOpen className="h-4 w-4" />,
      category: t("Navigasi"),
      keywords: ["courses", "kursus", "pelajaran", "class", "kelas"],
    },
    {
      id: "course-web-dev",
      title: t("Pengembangan Web Lanjutan"),
      description: t("Kursus pengembangan web"),
      url: "/courses/1",
      icon: <Code className="h-4 w-4" />,
      category: t("Kursus"),
      keywords: ["web", "development", "pengembangan", "programming", "coding", "html", "css", "javascript"],
    },
    {
      id: "course-design",
      title: t("Desain UI/UX"),
      description: t("Kursus desain antarmuka"),
      url: "/courses/2",
      icon: <Code className="h-4 w-4" />,
      category: t("Kursus"),
      keywords: ["ui", "ux", "design", "desain", "interface", "antarmuka", "figma"],
    },
    // Assignments
    {
      id: "assignments",
      title: t("Tugas"),
      description: t("Lihat semua tugas"),
      url: "/assignments",
      icon: <FileText className="h-4 w-4" />,
      category: t("Navigasi"),
      keywords: ["assignments", "tugas", "homework", "pr", "task"],
    },
    // Projects
    {
      id: "projects",
      title: t("Proyek"),
      description: t("Kelola proyek"),
      url: "/projects",
      icon: <FolderOpen className="h-4 w-4" />,
      category: t("Navigasi"),
      keywords: ["projects", "proyek", "project", "portfolio"],
    },
    // Showcase
    {
      id: "showcase",
      title: t("Galeri Proyek"),
      description: t("Proyek terbaik dari siswa"),
      url: "/showcase",
      icon: <Award className="h-4 w-4" />,
      category: t("Navigasi"),
      keywords: ["showcase", "galeri", "gallery", "project", "proyek", "terbaik", "best"],
    },
    // Schedule
    {
      id: "schedule",
      title: t("Jadwal"),
      description: t("Lihat jadwal kelas"),
      url: "/schedule",
      icon: <Calendar className="h-4 w-4" />,
      category: t("Navigasi"),
      keywords: ["schedule", "jadwal", "calendar", "kalender", "time", "waktu"],
    },
    // Users
    {
      id: "users",
      title: t("Pengguna"),
      description: t("Kelola pengguna sistem"),
      url: "/users",
      icon: <Users className="h-4 w-4" />,
      category: t("Navigasi"),
      keywords: ["users", "pengguna", "student", "siswa", "teacher", "guru", "admin"],
    },
    // Profile
    {
      id: "profile",
      title: t("Profil"),
      description: t("Lihat dan edit profil"),
      url: "/profile",
      icon: <User className="h-4 w-4" />,
      category: t("Akun"),
      keywords: ["profile", "profil", "account", "akun", "settings", "pengaturan"],
    },
    // Settings
    {
      id: "settings",
      title: t("Pengaturan"),
      description: t("Kelola pengaturan akun"),
      url: "/settings",
      icon: <Settings className="h-4 w-4" />,
      category: t("Akun"),
      keywords: ["settings", "pengaturan", "config", "konfigurasi", "preferences"],
    },
    // Compiler
    {
      id: "compiler",
      title: t("Python Compiler"),
      description: t("Jalankan kode Python"),
      url: "/compiler",
      icon: <Code className="h-4 w-4" />,
      category: t("Alat"),
      keywords: ["compiler", "python", "code", "kode", "editor", "run", "jalankan"],
    },
  ]

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  const handleSelect = (url: string) => {
    setOpen(false)
    setSearchQuery("")
    router.push(url)
  }

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return searchItems
    }

    const query = searchQuery.toLowerCase()
    return searchItems.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query)
      const descriptionMatch = item.description?.toLowerCase().includes(query)
      const keywordMatch = item.keywords?.some(keyword => 
        keyword.toLowerCase().includes(query)
      )
      return titleMatch || descriptionMatch || keywordMatch
    })
  }, [searchQuery, searchItems])

  // Group items by category
  const groupedItems = React.useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, SearchItem[]>)
  }, [filteredItems])

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={setOpen}
    >
      <CommandInput 
        placeholder={t("Ketik untuk mencari...")} 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>{t("Tidak ada hasil ditemukan.")}</CommandEmpty>
        {Object.entries(groupedItems).map(([category, items]) => (
          <CommandGroup key={category} heading={category}>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => handleSelect(item.url)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}

// Export a hook to open the search dialog
export function useSearchDialog() {
  const [open, setOpen] = React.useState(false)

  return {
    open,
    setOpen,
    openSearch: () => setOpen(true),
    closeSearch: () => setOpen(false),
  }
}
