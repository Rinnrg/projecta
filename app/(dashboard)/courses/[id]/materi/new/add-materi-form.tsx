"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FileUploadField } from "@/components/file-upload-field"

interface AddMateriFormProps {
  courseId: string
  courseTitle: string
}

export default function AddMateriForm({ courseId, courseTitle }: AddMateriFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { error: showError, success: showSuccess, AlertComponent } = useSweetAlert()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    lampiran: "",
  })

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
        courseId: courseId,
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
        } else {
          // It's a URL
          bodyData.lampiran = formData.lampiran
        }
      }

      const response = await fetch('/api/materi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create materi')
      }

      await showSuccess("Berhasil!", "Materi berhasil ditambahkan")
      router.push(`/courses/${courseId}`)
      router.refresh()
    } catch (error) {
      console.error('Error creating materi:', error)
      showError("Error", error instanceof Error ? error.message : "Gagal menambahkan materi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AlertComponent />
      <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href={`/courses/${courseId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>
          <CardTitle>Informasi Materi</CardTitle>
          <CardDescription>
            {courseTitle ? `Tambah materi baru untuk course ${courseTitle}` : 'Tambah materi baru untuk course ini'}
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

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/courses/${courseId}`)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                'Tambah Materi'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
    </>
  )
}
