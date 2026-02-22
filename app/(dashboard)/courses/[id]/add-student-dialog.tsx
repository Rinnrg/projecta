"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GraduationCap, Loader2, UserPlus } from "lucide-react"
import { useSweetAlert } from "@/components/ui/sweet-alert"

interface ClassInfo {
  kelas: string
  total: number
  enrolled: number
  available: number
  studentIds: string[]
}

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  onSuccess?: () => void
}

export default function AddStudentDialog({
  open,
  onOpenChange,
  courseId,
  onSuccess,
}: AddStudentDialogProps) {
  const [classData, setClassData] = useState<ClassInfo[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { success, error: showError, AlertComponent } = useSweetAlert()

  useEffect(() => {
    if (open) {
      fetchClassData()
      setSelectedClasses([])
    }
  }, [open, courseId])

  const fetchClassData = async () => {
    setLoading(true)
    try {
      // Get all students
      const allStudentsResponse = await fetch("/api/users?role=SISWA")
      if (!allStudentsResponse.ok) throw new Error("Gagal mengambil data siswa")
      const allStudents = await allStudentsResponse.json()

      // Get enrolled students
      const enrollResponse = await fetch(`/api/courses/${courseId}/enrollments`)
      if (!enrollResponse.ok) throw new Error("Gagal mengambil data enrollment")
      const enrollData = await enrollResponse.json()

      const enrolledIds = new Set(
        (Array.isArray(enrollData) ? enrollData : enrollData.enrollments || [])
          .map((e: any) => e.siswaId || e.user?.id)
          .filter(Boolean)
      )

      // Group by class
      const classMap: Record<string, ClassInfo> = {}
      for (const student of allStudents) {
        const kelas = student.kelas
        if (!kelas) continue

        if (!classMap[kelas]) {
          classMap[kelas] = { kelas, total: 0, enrolled: 0, available: 0, studentIds: [] }
        }
        classMap[kelas].total++
        if (enrolledIds.has(student.id)) {
          classMap[kelas].enrolled++
        } else {
          classMap[kelas].available++
          classMap[kelas].studentIds.push(student.id)
        }
      }

      const sorted = Object.values(classMap).sort((a, b) => a.kelas.localeCompare(b.kelas))
      setClassData(sorted)
    } catch (err) {
      showError("Error", err instanceof Error ? err.message : "Gagal mengambil data")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleClass = (kelas: string) => {
    setSelectedClasses((prev) =>
      prev.includes(kelas)
        ? prev.filter((k) => k !== kelas)
        : [...prev, kelas]
    )
  }

  const availableClasses = classData.filter((c) => c.available > 0)

  const handleSelectAll = () => {
    if (selectedClasses.length === availableClasses.length) {
      setSelectedClasses([])
    } else {
      setSelectedClasses(availableClasses.map((c) => c.kelas))
    }
  }

  const totalSelected = classData
    .filter((c) => selectedClasses.includes(c.kelas))
    .reduce((sum, c) => sum + c.available, 0)

  const handleSubmit = async () => {
    const studentIds = classData
      .filter((c) => selectedClasses.includes(c.kelas))
      .flatMap((c) => c.studentIds)

    if (studentIds.length === 0) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Gagal menambahkan siswa")
      }

      await success("Berhasil", `${studentIds.length} siswa dari ${selectedClasses.length} kelas berhasil ditambahkan`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      showError("Gagal", err instanceof Error ? err.message : "Gagal menambahkan siswa")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Tambah Siswa ke Kursus</DialogTitle>
            <DialogDescription>
              Centang kelas untuk mendaftarkan seluruh siswa di kelas tersebut
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Select All */}
            {!loading && availableClasses.length > 0 && (
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dialog-select-all"
                    checked={
                      selectedClasses.length === availableClasses.length &&
                      availableClasses.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="dialog-select-all"
                    className="text-sm font-medium leading-none"
                  >
                    Pilih Semua ({availableClasses.length} kelas)
                  </label>
                </div>
                {totalSelected > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {totalSelected} siswa
                  </Badge>
                )}
              </div>
            )}

            {/* Class List */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Memuat data kelas...</p>
                </div>
              ) : classData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Tidak ada kelas yang tersedia
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {classData.map((cls) => {
                    const isDisabled = cls.available === 0
                    const isChecked = selectedClasses.includes(cls.kelas)

                    return (
                      <div
                        key={cls.kelas}
                        className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                          isDisabled
                            ? "opacity-50 bg-muted/30"
                            : isChecked
                            ? "bg-primary/5 border-primary/30"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <Checkbox
                          id={`dialog-class-${cls.kelas}`}
                          checked={isChecked}
                          onCheckedChange={() => handleToggleClass(cls.kelas)}
                          disabled={isDisabled}
                        />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <label
                          htmlFor={`dialog-class-${cls.kelas}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">{cls.kelas}</p>
                              <p className="text-xs text-muted-foreground">
                                {cls.total} siswa
                                {cls.enrolled > 0 && ` • ${cls.enrolled} terdaftar`}
                              </p>
                            </div>
                            {cls.enrolled === cls.total ? (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                Semua Terdaftar
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {cls.available} tersedia
                              </Badge>
                            )}
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedClasses.length === 0 || submitting}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Tambahkan {totalSelected > 0 ? `${totalSelected} Siswa` : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertComponent />
    </>
  )
}
