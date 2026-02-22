"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { FloatingBackButton } from "@/components/ui/floating-back-button"
import { FileUploadField } from "@/components/file-upload-field"

interface MateriData {
  id: string
  judul: string
  deskripsi: string | null
  lampiran: string | null
  fileData: Buffer | null
  fileName: string | null
  fileType: string | null
  fileSize: number | null
  tgl_unggah: Date
  course: {
    id: string
    judul: string
  }
}

interface EditMateriClientProps {
  materi: MateriData
}

export default function EditMateriClient({ materi }: EditMateriClientProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { error: showError, success: showSuccess, confirm, AlertComponent } = useSweetAlert()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    judul: materi.judul,
    deskripsi: materi.deskripsi || "",
    lampiran: materi.fileData && materi.fileType 
      ? `/api/materi/${materi.id}/file`
      : materi.lampiran || "",
  })

  // Check authentication and authorization
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      showError("Tidak Terautentikasi", "Silakan login terlebih dahulu")
      router.push('/login')
      return
    }

    if (user.role !== 'GURU' && user.role !== 'ADMIN') {
      showError("Akses Ditolak", "Hanya guru dan admin yang dapat mengedit materi")
      router.push(`/courses/${materi.course.id}`)
      return
    }
  }, [user, authLoading, router, showError, materi.course.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.judul) {
      showError("Error", "Judul wajib diisi")
      return
    }

    if (!user?.id) {
      showError("Error", "User tidak terautentikasi")
      return
    }

    setIsLoading(true)
    try {
      // Prepare the data to send
      let bodyData: any = {
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi?.trim() || null,
        lampiran: null,
        fileData: null,
        fileName: null,
        fileType: null,
        fileSize: null,
      }

      // Check if lampiran is a data URL (uploaded file)
      if (formData.lampiran && formData.lampiran.trim()) {
        if (formData.lampiran.startsWith('data:')) {
          // Extract file type from data URL
          const matches = formData.lampiran.match(/^data:(.+?);base64,(.+)$/)
          if (matches) {
            const fileType = matches[1]
            const fileData = matches[2]
            
            // Get file size from base64 string
            const fileSize = Math.round((fileData.length * 3) / 4)
            
            bodyData.fileData = fileData
            bodyData.fileType = fileType
            bodyData.fileSize = fileSize
            bodyData.fileName = `file_${Date.now()}`
          }
        } else if (!formData.lampiran.startsWith('/api/')) {
          // It's a URL (not the existing file API path)
          bodyData.lampiran = formData.lampiran
        }
        // If it's /api/materi/[id]/file, we keep the existing file (no changes)
      }

      const response = await fetch(`/api/materi/${materi.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update materi')
      }

      await showSuccess("Berhasil!", "Materi berhasil diperbarui")
      router.push(`/courses/${materi.course.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error updating materi:', error)
      showError("Error", error instanceof Error ? error.message : "Gagal memperbarui materi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm("Hapus Materi?", {
      description: "Tindakan ini tidak dapat dibatalkan!",
      type: "warning",
      confirmText: "Ya, Hapus!",
      cancelText: "Batal",
    })

    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/materi/${materi.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete materi')
      }

      await showSuccess("Berhasil!", "Materi berhasil dihapus")
      router.push(`/courses/${materi.course.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error deleting materi:', error)
      showError("Error", error instanceof Error ? error.message : "Gagal menghapus materi")
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || (user.role !== 'GURU' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <>
      <AlertComponent />
      <FloatingBackButton href={`/courses/${materi.course.id}`} />
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Materi</CardTitle>
            <CardDescription>
              Update materi untuk course {materi.course.judul}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="judul">Judul Materi *</Label>
              <Input
                id="judul"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Masukkan judul materi"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Masukkan deskripsi materi"
                rows={4}
              />
            </div>

            <FileUploadField
              label="Link / URL Materi"
              value={formData.lampiran}
              onChange={(value) => setFormData({ ...formData, lampiran: value })}
              accept="*/*"
              description="Upload file atau masukkan link YouTube, Google Drive, PDF, atau resource eksternal lainnya"
            />

            <div className="flex gap-2 justify-between pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Materi
                  </>
                )}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/courses/${materi.course.id}`)}
                  disabled={isLoading || isDeleting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading || isDeleting}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  )
}
