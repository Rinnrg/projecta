"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus } from "lucide-react"
import { useSweetAlert } from "@/components/ui/sweet-alert"

interface Student {
  id: string
  nama: string
  email: string
  nomorInduk?: string
}

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}

export default function AddStudentDialog({
  open,
  onOpenChange,
  courseId,
}: AddStudentDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [addingStudentId, setAddingStudentId] = useState<string | null>(null)
  const { success, error: showError, AlertComponent } = useSweetAlert()

  // Fetch available students when dialog opens
  useEffect(() => {
    if (open) {
      fetchAvailableStudents()
    }
  }, [open, courseId])

  // Filter students based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredStudents(
        students.filter(
          (student) =>
            student.nama.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query) ||
            student.nomorInduk?.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, students])

  const fetchAvailableStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/enrollments`)
      if (!response.ok) throw new Error("Gagal mengambil data siswa")
      
      const data = await response.json()
      
      // Get all students
      const allStudentsResponse = await fetch("/api/users?role=SISWA")
      if (!allStudentsResponse.ok) throw new Error("Gagal mengambil data siswa")
      
      const allStudents = await allStudentsResponse.json()
      
      // Filter out already enrolled students
      const enrolledStudentIds = data.enrollments.map((e: any) => e.user.id)
      const availableStudents = allStudents.filter(
        (student: Student) => !enrolledStudentIds.includes(student.id)
      )
      
      setStudents(availableStudents)
      setFilteredStudents(availableStudents)
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal mengambil data siswa")
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (studentId: string) => {
    setAddingStudentId(studentId)
    try {
      const response = await fetch(`/api/courses/${courseId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: studentId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Gagal menambahkan siswa")
      }

      success("Siswa berhasil ditambahkan ke kursus")
      
      // Refresh the student list
      await fetchAvailableStudents()
      
      // Close dialog after successful addition
      if (filteredStudents.length <= 1) {
        onOpenChange(false)
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal menambahkan siswa")
    } finally {
      setAddingStudentId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Tambah Siswa ke Kursus</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search">Cari Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan nama, email, atau nomor induk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto border rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Memuat data siswa...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Tidak ada siswa yang sesuai dengan pencarian"
                      : "Semua siswa sudah terdaftar di kursus ini"}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={undefined} alt={student.nama} />
                          <AvatarFallback>
                            {student.nama
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.nama}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          {student.nomorInduk && (
                            <Badge variant="outline" className="mt-1">
                              {student.nomorInduk}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddStudent(student.id)}
                        disabled={addingStudentId === student.id}
                      >
                        {addingStudentId === student.id ? (
                          "Menambahkan..."
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Tambah
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertComponent />
    </>
  )
}
