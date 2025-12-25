"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Search, UserPlus } from "lucide-react"
import Link from "next/link"

interface Student {
  id: string
  nama: string
  email: string
  foto: string | null
}

interface AddStudentsClientProps {
  course: {
    id: string
    judul: string
  }
  allStudents: Student[]
  enrolledIds: string[]
}

export default function AddStudentsClient({
  course,
  allStudents,
  enrolledIds,
}: AddStudentsClientProps) {
  const router = useRouter()
  const { success, error: showError, AlertComponent } = useSweetAlert()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredStudents = allStudents.filter((student) => {
    const query = searchQuery.toLowerCase()
    return (
      student.nama.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    )
  })

  const availableStudents = filteredStudents.filter(
    (student) => !enrolledIds.includes(student.id)
  )

  const handleSelectAll = () => {
    if (selectedIds.length === availableStudents.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(availableStudents.map((s) => s.id))
    }
  }

  const handleToggleStudent = (studentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      showError("Pilih minimal satu siswa")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/courses/${course.id}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedIds }),
      })

      if (!response.ok) {
        throw new Error("Failed to enroll students")
      }

      await success(`Berhasil menambahkan ${selectedIds.length} siswa`)
      router.push(`/courses/${course.id}?tab=students`)
      router.refresh()
    } catch (error) {
      console.error("Error enrolling students:", error)
      showError("Gagal menambahkan siswa")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <AlertComponent />

      {/* Header */}
      <div className="mb-6 space-y-4">
        <Link href={`/courses/${course.id}?tab=students`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Tambah Siswa</h1>
          <p className="text-sm text-muted-foreground mt-1 sm:text-base">
            {course.judul}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pilih Siswa</CardTitle>
              <CardDescription>
                Pilih siswa yang ingin ditambahkan ke course ini
              </CardDescription>
            </div>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {selectedIds.length} Dipilih
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari siswa berdasarkan nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Select All */}
          {availableStudents.length > 0 && (
            <div className="flex items-center space-x-2 border-b pb-3">
              <Checkbox
                id="select-all"
                checked={
                  selectedIds.length === availableStudents.length &&
                  availableStudents.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pilih Semua ({availableStudents.length})
              </label>
            </div>
          )}

          {/* Students List */}
          <ScrollArea className="h-[400px] pr-4">
            {availableStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Tidak ada siswa yang cocok dengan pencarian"
                    : "Semua siswa sudah terdaftar di course ini"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={student.id}
                      checked={selectedIds.includes(student.id)}
                      onCheckedChange={() => handleToggleStudent(student.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.foto || undefined} alt={student.nama} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.nama
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor={student.id}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="text-sm font-medium">{student.nama}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href={`/courses/${course.id}?tab=students`}>
              <Button variant="outline" disabled={isSubmitting}>
                Batal
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || isSubmitting}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting
                ? "Menambahkan..."
                : `Tambahkan ${selectedIds.length > 0 ? selectedIds.length : ""} Siswa`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
