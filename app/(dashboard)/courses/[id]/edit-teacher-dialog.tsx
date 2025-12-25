"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Check, Loader2 } from "lucide-react"
import { useSweetAlert } from "@/components/ui/sweet-alert"

interface Teacher {
  id: string
  nama: string
  email: string
  foto?: string | null
}

interface EditTeacherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  currentTeacherId: string
}

export default function EditTeacherDialog({
  open,
  onOpenChange,
  courseId,
  currentTeacherId,
}: EditTeacherDialogProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingTeacherId, setUpdatingTeacherId] = useState<string | null>(null)
  const { success, error: showError, AlertComponent } = useSweetAlert()

  // Fetch teachers when dialog opens
  useEffect(() => {
    if (open) {
      fetchTeachers()
    }
  }, [open])

  // Filter teachers based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTeachers(teachers)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredTeachers(
        teachers.filter(
          (teacher) =>
            teacher.nama.toLowerCase().includes(query) ||
            teacher.email.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, teachers])

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users?role=GURU")
      if (!response.ok) throw new Error("Gagal mengambil data guru")
      
      const data = await response.json()
      setTeachers(data.users || [])
      setFilteredTeachers(data.users || [])
    } catch (error) {
      console.error("Error fetching teachers:", error)
      showError("Error", "Gagal mengambil data guru")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTeacher = async (teacherId: string, teacherName: string) => {
    if (teacherId === currentTeacherId) {
      showError("Info", "Guru ini sudah menjadi pengampu kursus")
      return
    }

    setUpdatingTeacherId(teacherId)
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guruId: teacherId }),
      })

      if (!response.ok) {
        throw new Error("Gagal mengupdate guru pengampu")
      }

      success("Berhasil", `${teacherName} telah ditetapkan sebagai guru pengampu`)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating teacher:", error)
      showError("Error", "Gagal mengupdate guru pengampu")
    } finally {
      setUpdatingTeacherId(null)
    }
  }

  return (
    <>
      <AlertComponent />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Edit Guru Pengampu</DialogTitle>
            <DialogDescription>
              Pilih guru yang akan mengampu kursus ini
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email guru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Teacher List */}
          <ScrollArea className="flex-1 px-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery ? "Tidak ada guru yang ditemukan" : "Tidak ada guru tersedia"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 pb-6">
                {filteredTeachers.map((teacher) => {
                  const isCurrentTeacher = teacher.id === currentTeacherId
                  const isUpdating = updatingTeacherId === teacher.id

                  return (
                    <div
                      key={teacher.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isCurrentTeacher
                          ? "bg-primary/5 border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 border-2 border-background">
                          <AvatarImage src={teacher.foto || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {teacher.nama
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{teacher.nama}</p>
                            {isCurrentTeacher && (
                              <Badge variant="secondary" className="shrink-0">
                                <Check className="h-3 w-3 mr-1" />
                                Aktif
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {teacher.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isCurrentTeacher ? "secondary" : "default"}
                        onClick={() => handleUpdateTeacher(teacher.id, teacher.nama)}
                        disabled={isCurrentTeacher || isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Mengupdate...
                          </>
                        ) : isCurrentTeacher ? (
                          "Guru Saat Ini"
                        ) : (
                          "Pilih"
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
