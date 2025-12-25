"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import type { Course, Asesmen } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  FileText,
  Video,
  Download,
  Play,
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  Pencil,
  Users,
  BookOpen,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import AddStudentDialog from "./add-student-dialog"
import EditTeacherDialog from "./edit-teacher-dialog"

interface CourseDetailClientProps {
  course: Course
  assessments: Asesmen[]
}

interface Enrollment {
  id: string
  progress: number
  siswa: {
    id: string
    nama: string
    email: string
    foto: string | null
  }
  averageGrade: number
}

export default function CourseDetailClient({ course, assessments }: CourseDetailClientProps) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { confirm, success, error: showError, AlertComponent } = useSweetAlert()
  const [activeTab, setActiveTab] = useState("materials")
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [editTeacherOpen, setEditTeacherOpen] = useState(false)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

  // TODO: Implement completed tracking in the database
  const completedCount = 0
  const progressPercent = course.materi && course.materi.length > 0 
    ? Math.round((completedCount / course.materi.length) * 100) 
    : 0

  const isTeacherOrAdmin = user?.role === "GURU" || user?.role === "ADMIN"

  // Set active tab from URL params
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch enrolled students function with useCallback
  const fetchEnrollments = useCallback(async () => {
    setIsLoadingStudents(true)
    try {
      const response = await fetch(`/api/courses/${course.id}/enrollments`)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data)
      } else {
        console.error("Failed to fetch enrollments:", response.status)
        setEnrollments([])
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
      setEnrollments([])
    } finally {
      setIsLoadingStudents(false)
    }
  }, [course.id])

  // Fetch enrolled students when component mounts (for teacher/admin)
  useEffect(() => {
    if (isTeacherOrAdmin) {
      fetchEnrollments()
    }
  }, [isTeacherOrAdmin, fetchEnrollments])

  const handleRemoveStudent = async (siswaId: string, siswaName: string) => {
    const confirmed = await confirm("Hapus Siswa", {
      description: `Apakah Anda yakin ingin menghapus "${siswaName}" dari course ini?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      type: "warning",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `/api/courses/${course.id}/enrollments?siswaId=${siswaId}`,
            { method: "DELETE" }
          )
          if (!response.ok) throw new Error("Failed to remove student")
        } catch (error) {
          throw error
        }
      },
    })

    if (confirmed) {
      await success("Berhasil menghapus siswa dari course")
      fetchEnrollments()
    }
  }

  // Handler untuk delete materi
  const handleDeleteMateri = async (materiId: string, materiTitle: string) => {
    const confirmed = await confirm("Hapus Materi", {
      description: `Apakah Anda yakin ingin menghapus materi "${materiTitle}"?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      type: "warning",
      onConfirm: async () => {
        // TODO: Implement delete API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
      },
    })

    if (confirmed) {
      success("Berhasil", `Materi "${materiTitle}" berhasil dihapus`)
    }
  }

  // Handler untuk delete asesmen
  const handleDeleteAsesmen = async (asesmenId: string, asesmenName: string) => {
    const confirmed = await confirm("Hapus Asesmen", {
      description: `Apakah Anda yakin ingin menghapus asesmen "${asesmenName}"?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      type: "warning",
      onConfirm: async () => {
        // TODO: Implement delete API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
      },
    })

    if (confirmed) {
      success("Berhasil", `Asesmen "${asesmenName}" berhasil dihapus`)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <AlertComponent />
      
      {/* Dialogs */}
      <EditTeacherDialog
        open={editTeacherOpen}
        onOpenChange={setEditTeacherOpen}
        courseId={course.id}
        currentTeacherId={course.guruId}
      />
      
      <AddStudentDialog
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        courseId={course.id}
      />
      
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="gap-1.5 h-8 px-2 sm:gap-2 sm:h-9 sm:px-3">
        <Link href="/courses">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Kembali</span>
        </Link>
      </Button>

      {/* Course Header */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border/50 sm:rounded-xl">
            <img
              src={course.gambar || "/placeholder.svg?height=400&width=700&query=course"}
              alt={course.judul}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <Badge className="mb-2 bg-background/90 text-foreground backdrop-blur-sm text-xs sm:mb-3">
                {course.kategori}
              </Badge>
              <h1 className="text-lg font-bold text-background sm:text-2xl md:text-3xl text-balance">{course.judul}</h1>
            </div>
          </div>
        </div>

        {/* Course Info Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Informasi Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {/* Instructor */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 sm:gap-3 sm:p-3">
              <Avatar className="h-9 w-9 border-2 border-background sm:h-11 sm:w-11">
                <AvatarImage src={course.guru?.foto || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                  {course.guru?.nama
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium sm:text-base">{course.guru?.nama}</p>
                <p className="text-xs text-muted-foreground">Pengajar</p>
              </div>
              {isTeacherOrAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  title="Edit Guru Pengampu"
                  onClick={() => setEditTeacherOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-0.5 sm:gap-2 sm:mb-1">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xl font-bold sm:text-2xl">{course.materi?.length || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Materi</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-0.5 sm:gap-2 sm:mb-1">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xl font-bold sm:text-2xl">{assessments.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Asesmen</p>
              </div>
            </div>

            {user?.role === "SISWA" && (
              <div className="space-y-1.5 p-2 rounded-lg bg-muted/50 sm:space-y-2 sm:p-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Progress Belajar</span>
                  <span className="font-semibold">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-1.5 sm:h-2" />
                <p className="text-xs text-muted-foreground">
                  {completedCount} dari {course.materi?.length || 0} materi selesai
                </p>
              </div>
            )}

            {isTeacherOrAdmin && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 sm:gap-2 sm:p-3">
                  <Users className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">
                    {isLoadingStudents ? "Memuat..." : `${enrollments.length} siswa terdaftar`}
                  </span>
                </div>
                <Button className="w-full" size="sm" asChild>
                  <Link href={`/courses/${course.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Course
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="inline-flex w-max bg-muted/50 sm:w-auto">
            <TabsTrigger value="materials" className="text-xs sm:text-sm">
              Materi
            </TabsTrigger>
            <TabsTrigger value="assessments" className="text-xs sm:text-sm">
              Asesmen
            </TabsTrigger>
            {isTeacherOrAdmin && (
              <TabsTrigger value="students" className="text-xs sm:text-sm">
                Siswa
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <h2 className="text-base font-semibold sm:text-lg">Materi Pembelajaran</h2>
            {isTeacherOrAdmin && (
              <Button size="sm" className="w-full sm:w-auto" asChild>
                <Link href={`/materi/new/${course.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Materi
                </Link>
              </Button>
            )}
          </div>
          <div className="space-y-2 sm:space-y-3">
            {(course.materi && course.materi.length > 0) ? course.materi.map((material, index) => (
              <Card key={material.id} className="border-border/50 transition-all hover:border-border hover:shadow-sm">
                <CardContent className="flex items-center gap-2 p-3 sm:gap-4 sm:p-4">
                  <div className="hidden items-center justify-center text-xs font-medium text-muted-foreground sm:flex sm:h-10 sm:w-10 sm:text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-10 sm:w-10">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap sm:gap-2">
                      <h4 className="text-sm font-medium truncate sm:text-base">{material.judul}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 sm:text-sm">{material.deskripsi}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground sm:mt-1.5 sm:gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(material.tgl_unggah).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0 sm:gap-2">
                    <Button size="sm" asChild className="h-8 gap-1.5 px-2 sm:h-9 sm:gap-2 sm:px-3">
                      <Link href={`/courses/${course.id}/materi/${material.id}`}>
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Lihat</span>
                      </Link>
                    </Button>
                    
                    {/* Dropdown Menu for Edit/Delete */}
                    {isTeacherOrAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/materi/${material.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Materi
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteMateri(material.id, material.judul)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="border-dashed border-border/60 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:h-14 sm:w-14">
                    <BookOpen className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold sm:text-base">Belum ada materi</h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:mt-1.5 sm:text-sm">
                    Materi untuk course ini akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <h2 className="text-base font-semibold sm:text-lg">Daftar Asesmen</h2>
            {isTeacherOrAdmin && (
              <Button size="sm" className="w-full sm:w-auto" asChild>
                <Link href={`/asesmen/new/${course.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Asesmen
                </Link>
              </Button>
            )}
          </div>
          {assessments.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="border-border/50 hover:border-border transition-colors">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base">{assessment.nama}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                          {assessment.deskripsi}
                        </CardDescription>
                      </div>
                      {isTeacherOrAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/assignments/${assessment.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Asesmen
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteAsesmen(assessment.id, assessment.nama)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <Badge variant={assessment.tipe === 'KUIS' ? 'default' : 'secondary'}>
                        {assessment.tipe === 'KUIS' ? 'Kuis' : 'Tugas'}
                      </Badge>
                      {assessment.tgl_selesai && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(assessment.tgl_selesai).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                    <Button className="w-full" size="sm" asChild>
                      <Link href={
                        user?.role === "SISWA" 
                          ? assessment.tipe === 'KUIS' 
                            ? `/asesmen/${assessment.id}/kerjakan`
                            : `/asesmen/${assessment.id}/submit`
                          : `/asesmen/${assessment.id}`
                      }>
                        {user?.role === "SISWA" 
                          ? assessment.tipe === 'KUIS' 
                            ? "Kerjakan Kuis" 
                            : "Kumpulkan Tugas"
                          : "Lihat Detail"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border/60 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:h-14 sm:w-14">
                  <FileText className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                </div>
                <h3 className="mt-4 text-sm font-semibold sm:text-base">Belum ada asesmen</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:mt-1.5 sm:text-sm">
                  Asesmen untuk course ini akan muncul di sini
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Students Tab (Teachers/Admin only) */}
        {isTeacherOrAdmin && (
          <TabsContent value="students" className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold sm:text-lg">Siswa Terdaftar</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {enrollments.length} Siswa
                </Badge>
                <Link href={`/courses/${course.id}/students/add`}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Siswa</span>
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="border-border/50">
              <CardContent className="p-0">
                {isLoadingStudents ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Memuat data siswa...
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Belum ada siswa yang terdaftar di course ini
                    </p>
                    <Link href={`/courses/${course.id}/students/add`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Siswa Pertama
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {enrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage
                              src={enrollment.siswa.foto || undefined}
                              alt={enrollment.siswa.nama}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                              {enrollment.siswa.nama
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium sm:text-base truncate">
                              {enrollment.siswa.nama}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 sm:gap-2 sm:mt-1">
                              <Progress
                                value={enrollment.progress}
                                className="h-1 w-16 sm:h-1.5 sm:w-24"
                              />
                              <span className="text-xs text-muted-foreground">
                                {enrollment.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary sm:text-base">
                              {enrollment.averageGrade}%
                            </p>
                            <p className="text-xs text-muted-foreground">Nilai</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRemoveStudent(
                                    enrollment.siswa.id,
                                    enrollment.siswa.nama
                                  )
                                }
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus dari Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Add Student Dialog */}
      <AddStudentDialog
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        courseId={course.id}
      />
    </div>
  )
}
