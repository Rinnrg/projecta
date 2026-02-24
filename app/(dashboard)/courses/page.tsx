"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useCourses } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, BookOpen, Users, FileText, MoreHorizontal, Pencil, Trash2, ArrowRight, LayoutGrid, LayoutList, SlidersHorizontal, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAdaptiveAlert } from "@/components/ui/adaptive-alert"
import { useAsyncAction } from "@/hooks/use-async-action"
import { AnimateIn } from "@/components/ui/animate-in"
import { useAutoTranslate } from "@/lib/auto-translate-context"
import { CoursePageSkeleton } from "@/components/ui/loading-skeletons"

const categoriesMap = {
  id: ["Semua", "Programming", "Database", "Design", "Networking"],
  en: ["All", "Programming", "Database", "Design", "Networking"],
}

type ViewMode = "grid" | "list" | "compact"

export default function CoursesPage() {
  const { user } = useAuth()
  const { t, locale, setLocale } = useAutoTranslate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(locale === 'id' ? "Semua" : "All")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const { confirm, AlertComponent } = useAdaptiveAlert()
  const { execute, ActionFeedback } = useAsyncAction()
  const { courses, loading, error, refetch } = useCourses(user?.id, user?.role)

  // Debounce search query untuk mengurangi re-render
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const categories = categoriesMap[locale]
  const allCategory = locale === 'id' ? "Semua" : "All"

  // Gunakan useMemo untuk optimasi filtering
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.judul.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      const matchesCategory = selectedCategory === allCategory || course.kategori === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [courses, debouncedSearchQuery, selectedCategory, allCategory])

  const isTeacherOrAdmin = user?.role === "GURU" || user?.role === "ADMIN"

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    const confirmed = await confirm(t("Hapus Kursus"), {
      description: t("Apakah Anda yakin ingin menghapus kursus ini?"),
      confirmText: t("Hapus"),
      cancelText: t("Batal"),
      type: "warning",
    })

    if (!confirmed) return

    await execute(
      async () => {
        // TODO: Implement delete API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        refetch()
      },
      {
        loadingMessage: t("Menghapus kursus..."),
        successTitle: t("Berhasil!"),
        successDescription: `"${courseTitle}" ${t("berhasil dihapus")}`,
        errorTitle: t("Gagal"),
        autoCloseMs: 1500,
      }
    )
  }

  if (loading) {
    return <CoursePageSkeleton />
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm" className="mt-4">
            {t("Coba Lagi")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <AlertComponent />
      <ActionFeedback />

      <AnimateIn stagger={0}>
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">{t("Kursus")}</h1>
            <p className="text-sm text-muted-foreground sm:text-[15px]">
              {user?.role === "SISWA" ? t("Jelajahi dan ikuti kursus yang tersedia") : t("Kelola kursus dan buat kursus baru")}
            </p>
          </div>
          {isTeacherOrAdmin && (
            <Button asChild size="sm" className="w-full sm:w-auto sm:size-auto">
              <Link href="/courses/add">
                <Plus className="mr-2 h-4 w-4" />
                {t("Kursus Baru")}
              </Link>
            </Button>
          )}
        </div>
      </AnimateIn>

      <AnimateIn stagger={1}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("Cari kursus")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 bg-muted/30 pl-9 focus:bg-background"
            />
          </div>
          
          {/* Category Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {selectedCategory}
                <ChevronDown className="h-4 w-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t("Kategori")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    selectedCategory === category && "bg-accent font-medium"
                  )}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex gap-1 sm:ml-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="h-10 w-10"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className="h-10 w-10"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "compact" ? "default" : "outline"}
              size="icon"
              className="h-10 w-10"
              onClick={() => setViewMode("compact")}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AnimateIn>

      <AnimateIn stagger={2}>
        {filteredCourses.length > 0 ? (
          <div className={cn(
            "grid gap-4 sm:gap-5",
            viewMode === "grid" && "sm:grid-cols-2 lg:grid-cols-3",
            viewMode === "list" && "grid-cols-1",
            viewMode === "compact" && "sm:grid-cols-2 lg:grid-cols-4"
          )}>
            {filteredCourses.map((course, index) => (
              <AnimateIn key={course.id} stagger={3 + index}>
                {viewMode === "list" ? (
                  // List View
                  <Card className="group overflow-hidden border-border/50 transition-all duration-200 hover:border-border hover:shadow-md">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative aspect-[16/10] sm:aspect-square sm:w-48 overflow-hidden bg-muted">
                        <img
                          src={course.gambar || "/placeholder.svg?height=200&width=320&query=course"}
                          alt={course.judul}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge className="absolute bottom-2 left-2 bg-background/90 text-foreground backdrop-blur-sm text-xs sm:bottom-3 sm:left-3">
                          {course.kategori}
                        </Badge>
                      </div>
                      <div className="flex-1 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold leading-snug group-hover:text-primary sm:text-lg">
                              {course.judul}
                            </h3>
                            {course.guru && (
                              <p className="mt-1 text-sm text-muted-foreground">{course.guru.nama}</p>
                            )}
                          </div>
                          {isTeacherOrAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/courses/${course.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t("Edit")}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteCourse(course.id, course.judul)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("Hapus")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <FileText className="h-4 w-4" />
                              {course._count?.materi ?? 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {course._count?.enrollments ?? 0}
                            </span>
                          </div>
                          <Button asChild size="sm" className="gap-1">
                            <Link href={`/courses/${course.id}`}>
                              {user?.role === "SISWA" ? t("Lihat") : t("Kelola")}
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : viewMode === "compact" ? (
                  // Compact View
                  <Card className="group overflow-hidden border-border/50 transition-all duration-200 hover:border-border hover:shadow-md">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={course.gambar || "/placeholder.svg?height=200&width=200&query=course"}
                        alt={course.judul}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                      <Badge className="absolute bottom-2 left-2 bg-background/90 text-foreground backdrop-blur-sm text-xs">
                        {course.kategori}
                      </Badge>
                      {isTeacherOrAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-2 h-7 w-7 bg-background/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/courses/${course.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("Edit")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteCourse(course.id, course.judul)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("Hapus")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                        {course.judul}
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {course._count?.materi ?? 0}
                        </span>
                        <Button asChild size="sm" variant="ghost" className="h-6 gap-1 px-2 text-xs">
                          <Link href={`/courses/${course.id}`}>
                            {user?.role === "SISWA" ? t("Lihat") : t("Kelola")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  // Grid View (Default)
                  <Link href={`/courses/${course.id}`} className="block">
                  <Card className="group overflow-hidden border-border/50 transition-all duration-200 hover:border-border hover:shadow-md cursor-pointer">
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={course.gambar || "/placeholder.svg?height=200&width=320&query=course"}
                        alt={course.judul}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                      <Badge className="absolute bottom-2 left-2 bg-background/90 text-foreground backdrop-blur-sm text-xs sm:bottom-3 sm:left-3">
                        {course.kategori}
                      </Badge>
                      {isTeacherOrAdmin && (
                        <div onClick={(e) => e.preventDefault()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-2 h-7 w-7 bg-background/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/courses/${course.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("Edit")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteCourse(course.id, course.judul)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("Hapus")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary sm:text-base">
                        {course.judul}
                      </h3>
                      {course.guru && (
                        <p className="mt-1 text-xs text-muted-foreground sm:mt-1.5 sm:text-sm">{course.guru.nama}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3 sm:mt-4 sm:pt-4">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {course._count?.materi ?? 0}
                          </span>
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {course._count?.enrollments ?? 0}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary sm:text-sm">
                          {user?.role === "SISWA" ? t("Lihat") : t("Kelola")}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Card>
                  </Link>
                )}
              </AnimateIn>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-12 text-center sm:py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:h-14 sm:w-14">
              <BookOpen className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold sm:text-base">{t("Tidak ada kursus")}</h3>
            <p className="mt-1 max-w-sm px-4 text-xs text-muted-foreground sm:mt-1.5 sm:text-sm">
              {searchQuery || selectedCategory !== allCategory ? t("Coba ubah filter atau kata kunci pencarian") : t("Buat kursus pertama Anda untuk memulai")}
            </p>
            {isTeacherOrAdmin && (
              <Button asChild className="mt-4 sm:mt-5" size="sm">
                <Link href="/courses/add">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Buat Kursus")}
                </Link>
              </Button>
            )}
          </div>
        )}
      </AnimateIn>
    </div>
  )
}
