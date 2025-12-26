"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockShowcase, mockUsers, mockCourses } from "@/lib/mock-data"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Award, Star, Calendar, ExternalLink, Code, BookOpen, Mail, User, Clock, Trophy } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { id as idLocale, enUS } from "date-fns/locale"
import { AnimateIn } from "@/components/ui/animate-in"
import { useAutoTranslate } from "@/lib/auto-translate-context"

const extendedShowcase = [
  ...mockShowcase,
  {
    id: "s3",
    judul: "Weather Dashboard",
    deskripsi: "Real-time weather application with beautiful UI",
    nilai: 95,
    tanggalDinilai: new Date("2024-11-25"),
    isPublic: true,
    siswaId: "5",
    pengumpulanProyekId: "pp3",
    createdAt: new Date("2024-11-25"),
    updatedAt: new Date("2024-11-25"),
    siswa: mockUsers[4],
  },
  {
    id: "s4",
    judul: "Blog Platform",
    deskripsi: "Full-stack blog with authentication and comments",
    nilai: 90,
    tanggalDinilai: new Date("2024-11-28"),
    isPublic: true,
    siswaId: "1",
    pengumpulanProyekId: "pp4",
    createdAt: new Date("2024-11-28"),
    updatedAt: new Date("2024-11-28"),
    siswa: mockUsers[0],
  },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const { t, locale } = useAutoTranslate()
  const [activeTab, setActiveTab] = useState("showcase")
  const [tabKey, setTabKey] = useState(0) // For re-render animation
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const dateLocale = locale === 'id' ? idLocale : enUS

  // Get user's showcases
  const userShowcases = extendedShowcase
    .filter((item) => {
      const matchesSearch =
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesUser = item.siswaId === user?.id
      return matchesSearch && matchesUser && item.isPublic
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.createdAt.getTime() - a.createdAt.getTime()
      if (sortBy === "highest") return b.nilai - a.nilai
      return a.judul.localeCompare(b.judul)
    })

  // Stats
  const totalShowcases = extendedShowcase.filter((s) => s.siswaId === user?.id).length
  const averageGrade =
    totalShowcases > 0
      ? Math.round(
          extendedShowcase.filter((s) => s.siswaId === user?.id).reduce((acc, s) => acc + s.nilai, 0) / totalShowcases,
        )
      : 0
  const highestGrade =
    totalShowcases > 0 ? Math.max(...extendedShowcase.filter((s) => s.siswaId === user?.id).map((s) => s.nilai)) : 0

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "GURU":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "SISWA":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      default:
        return ""
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return t("Admin")
      case "GURU":
        return t("Guru")
      case "SISWA":
        return t("Siswa")
      default:
        return role
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <AnimateIn stagger={0}>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg sm:h-24 sm:w-24">
                <AvatarImage src={user?.foto || "/placeholder.svg"} />
                <AvatarFallback className="text-xl sm:text-2xl">
                  {user?.nama
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  <h1 className="text-xl font-bold sm:text-2xl">{user?.nama}</h1>
                  <Badge className={getRoleBadgeColor(user?.role || "")}>{getRoleLabel(user?.role || "")}</Badge>
                </div>
                <div className="mt-2 flex flex-col gap-1.5 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:text-sm">
                  <span className="flex items-center justify-center gap-1 sm:justify-start">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="truncate">{user?.email}</span>
                  </span>
                  <span className="flex items-center justify-center gap-1 sm:justify-start">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />@{user?.username}
                  </span>
                  <span className="flex items-center justify-center gap-1 sm:justify-start">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t("Bergabung")} {user?.createdAt ? format(user.createdAt, "MMMM yyyy", { locale: dateLocale }) : "-"}
                  </span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full bg-transparent sm:w-auto">
                <Link href="/settings">{t("Edit Profil")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimateIn>

      {user?.role === "SISWA" && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <AnimateIn stagger={1}>
            <Card>
              <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                  <BookOpen className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{t("Total Kursus")}</p>
                  <p className="text-xl font-bold sm:text-2xl">{mockCourses.length}</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
          <AnimateIn stagger={2}>
            <Card>
              <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30 sm:h-12 sm:w-12">
                  <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{t("Portofolio")}</p>
                  <p className="text-xl font-bold sm:text-2xl">{totalShowcases}</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
          <AnimateIn stagger={3}>
            <Card>
              <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 sm:h-12 sm:w-12">
                  <Star className="h-5 w-5 text-green-600 dark:text-green-400 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{t("Rata-rata")}</p>
                  <p className="text-xl font-bold sm:text-2xl">{averageGrade}</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
          <AnimateIn stagger={4}>
            <Card>
              <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 sm:h-12 sm:w-12">
                  <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{t("Tertinggi")}</p>
                  <p className="text-xl font-bold sm:text-2xl">{highestGrade}</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
        </div>
      )}

      <AnimateIn stagger={5}>
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value)
          setTabKey(prev => prev + 1) // Trigger re-render for animation
        }} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="inline-flex w-max sm:w-auto">
              <TabsTrigger value="showcase" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t("Portofolio")}
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t("Kursus Saya")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Showcase Tab */}
          <TabsContent value="showcase" key={`showcase-${tabKey}`} className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("Cari proyek...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 sm:h-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-full sm:h-10 sm:w-[150px]">
                  <SelectValue placeholder={t("Urutkan")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("Terbaru")}</SelectItem>
                  <SelectItem value="highest">{t("Nilai Tertinggi")}</SelectItem>
                  <SelectItem value="alphabetical">{t("Abjad")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {userShowcases.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {userShowcases.map((item, index) => (
                  <AnimateIn key={item.id} stagger={6 + index}>
                    <Card className="group overflow-hidden transition-all hover:shadow-lg">
                      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Code className="h-10 w-10 text-primary/40 sm:h-12 sm:w-12" />
                        </div>
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium sm:text-sm">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
                          <span>{item.nilai}</span>
                        </div>
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="text-sm font-semibold transition-colors group-hover:text-primary sm:text-base">
                          {item.judul}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{item.deskripsi}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground sm:mt-4">
                          <Calendar className="h-3 w-3" />
                          {format(item.tanggalDinilai, "d MMMM yyyy", { locale: dateLocale })}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t p-3 sm:p-4">
                        <Button asChild className="w-full bg-transparent" variant="outline" size="sm">
                          <Link href={`/showcase/${item.id}`}>
                            {t("Lihat Detail")}
                            <ExternalLink className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </AnimateIn>
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
                <Award className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
                <h3 className="mt-4 text-sm font-semibold sm:text-base">{t("Belum ada proyek")}</h3>
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                  {searchQuery ? t("Coba kata kunci lain") : t("Proyek terbaik Anda akan ditampilkan di sini")}
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" key={`courses-${tabKey}`} className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockCourses.map((course, index) => (
                <AnimateIn key={course.id} stagger={6 + index}>
                  <Card className="overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={course.gambar || "/placeholder.svg"}
                        alt={course.judul}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {course.kategori}
                      </Badge>
                      <h3 className="text-sm font-semibold sm:text-base">{course.judul}</h3>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        {t("courses.instructor")}: {course.guru?.nama}
                      </p>
                    </CardContent>
                    <CardFooter className="border-t p-3 sm:p-4">
                      <Button asChild className="w-full bg-transparent" variant="outline" size="sm">
                        <Link href={`/courses/${course.id}`}>{t("courses.viewCourse")}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </AnimateIn>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </AnimateIn>
    </div>
  )
}
