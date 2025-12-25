"use client"

import { useState } from "react"
import { mockShowcase, mockUsers } from "@/lib/mock-data"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Award, Star, Calendar, ExternalLink, Code } from "lucide-react"
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

export default function ShowcasePage() {
  const { t, locale, setLocale } = useAutoTranslate()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterStudent, setFilterStudent] = useState("all")

  const dateLocale = locale === 'id' ? idLocale : enUS

  const students = [...new Set(extendedShowcase.map((s) => s.siswa?.id))].map((id) =>
    mockUsers.find((u) => u.id === id),
  )

  const filteredShowcase = extendedShowcase
    .filter((item) => {
      const matchesSearch =
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStudent = filterStudent === "all" || item.siswaId === filterStudent
      return matchesSearch && matchesStudent && item.isPublic
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.createdAt.getTime() - a.createdAt.getTime()
      if (sortBy === "highest") return b.nilai - a.nilai
      return a.judul.localeCompare(b.judul)
    })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <AnimateIn stagger={0}>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("Galeri Proyek")}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{t("Proyek terbaik dari siswa")}</p>
        </div>
      </AnimateIn>

      {/* Filters */}
      <AnimateIn stagger={1}>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("Cari proyek di galeri...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 sm:h-10"
            />
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Select value={filterStudent} onValueChange={setFilterStudent}>
              <SelectTrigger className="h-9 flex-1 sm:h-10 sm:w-[180px] sm:flex-none">
                <SelectValue placeholder={t("Siswa")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("Semua Siswa")}</SelectItem>
                {students.map(
                  (student) =>
                    student && (
                      <SelectItem key={student.id} value={student.id}>
                        {student.nama}
                      </SelectItem>
                    ),
                )}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 flex-1 sm:h-10 sm:w-[150px] sm:flex-none">
                <SelectValue placeholder={t("Urutkan")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("Terbaru")}</SelectItem>
                <SelectItem value="highest">{t("Nilai Tertinggi")}</SelectItem>
                <SelectItem value="alphabetical">{t("Alfabetis")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AnimateIn>

      {/* Showcase Grid */}
      {filteredShowcase.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filteredShowcase.map((item, index) => (
            <AnimateIn key={item.id} stagger={2 + index}>
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
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors sm:text-base">
                    {item.judul}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{item.deskripsi}</p>
                  <div className="mt-3 flex items-center justify-between sm:mt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                        <AvatarImage src={item.siswa?.foto || "/placeholder.svg"} />
                        <AvatarFallback className="text-[10px] sm:text-xs">
                          {item.siswa?.nama
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground sm:text-sm">{item.siswa?.nama}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                      <Calendar className="h-3 w-3" />
                      {format(item.tanggalDinilai, "MMM d", { locale: dateLocale })}
                    </span>
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
        <AnimateIn stagger={2}>
          <Card className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
            <Award className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
            <h3 className="mt-4 text-sm font-semibold sm:text-base">{t("Tidak ada proyek ditemukan")}</h3>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              {searchQuery ? t("Coba sesuaikan pencarian Anda") : t("Proyek luar biasa akan muncul di sini")}
            </p>
          </Card>
        </AnimateIn>
      )}
    </div>
  )
}
