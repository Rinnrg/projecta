"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Plus, Upload, FileText, Calendar, User, Users } from "lucide-react"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import Link from "next/link"

interface AddAsesmenFormProps {
  courseId: string
  courseTitle: string
}

export default function AddAsesmenForm({ courseId, courseTitle }: AddAsesmenFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error: showError, AlertComponent } = useSweetAlert()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    tipe: "KUIS" as "KUIS" | "TUGAS",
    tipePengerjaan: "INDIVIDU" as "INDIVIDU" | "KELOMPOK",
    tgl_mulai: "",
    tgl_selesai: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("Error", "Ukuran file maksimal 5MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nama.trim()) {
      showError("Error", "Nama asesmen harus diisi")
      return
    }

    // Validate dates - required for both KUIS and TUGAS
    if (!formData.tgl_mulai) {
      showError("Error", `Tanggal mulai harus diisi`)
      return
    }
    if (!formData.tgl_selesai) {
      showError("Error", `Tanggal selesai harus diisi`)
      return
    }

    const startDate = new Date(formData.tgl_mulai)
    const endDate = new Date(formData.tgl_selesai)
    
    if (endDate < startDate) {
      showError("Error", "Tanggal selesai harus setelah tanggal mulai")
      return
    }

    try {
      setIsLoading(true)
      
      // Upload file first if exists (implement your file upload logic)
      let fileUrl = null
      if (selectedFile) {
        // TODO: Implement file upload to your storage service
        // For now, we'll just store the filename
        fileUrl = selectedFile.name
      }

      const response = await fetch("/api/asesmen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formData.nama,
          deskripsi: formData.deskripsi || null,
          tipe: formData.tipe,
          tipePengerjaan: formData.tipe === "TUGAS" ? formData.tipePengerjaan : null,
          tgl_mulai: formData.tgl_mulai,
          tgl_selesai: formData.tgl_selesai,
          lampiran: fileUrl,
          courseId,
          guruId: user?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create asesmen")
      }

      const result = await response.json()
      
      success("Berhasil!", `${formData.tipe === "KUIS" ? "Kuis" : "Tugas"} baru berhasil dibuat`)
      
      // Redirect based on type
      setTimeout(() => {
        if (result.asesmen?.id && formData.tipe === "KUIS") {
          // Redirect to add questions page for KUIS
          router.push(`/asesmen/${result.asesmen.id}`)
        } else {
          router.push(`/courses/${courseId}`)
        }
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error creating asesmen:", error)
      showError("Error", error instanceof Error ? error.message : "Gagal membuat asesmen")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AlertComponent />
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href={`/courses/${courseId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Course
            </Link>
          </Button>
          <h1 className="text-2xl font-bold sm:text-3xl">Buat Asesmen Baru</h1>
          <p className="text-muted-foreground">
            Buat asesmen/tugas baru untuk <span className="font-semibold">{courseTitle}</span>
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Asesmen</CardTitle>
            <CardDescription>
              Isi informasi asesmen yang akan dibuat. Pilih tipe KUIS untuk soal pilihan ganda atau TUGAS untuk pengumpulan file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipe Asesmen */}
              <div className="space-y-2">
                <Label htmlFor="tipe">
                  Tipe Asesmen <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.tipe}
                  onValueChange={(value: "KUIS" | "TUGAS") => 
                    setFormData({ ...formData, tipe: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="tipe">
                    <SelectValue placeholder="Pilih tipe asesmen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KUIS">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Kuis - Soal Pilihan Ganda
                      </div>
                    </SelectItem>
                    <SelectItem value="TUGAS">
                      <div className="flex items-center">
                        <Upload className="mr-2 h-4 w-4" />
                        Tugas - Pengumpulan File
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.tipe === "KUIS" 
                    ? "Siswa akan mengerjakan soal pilihan ganda" 
                    : "Siswa akan mengumpulkan file tugas"}
                </p>
              </div>

              {/* Tipe Pengerjaan (Only for TUGAS) */}
              {formData.tipe === "TUGAS" && (
                <div className="space-y-2">
                  <Label htmlFor="tipePengerjaan">
                    Tipe Pengerjaan <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.tipePengerjaan}
                    onValueChange={(value: "INDIVIDU" | "KELOMPOK") => 
                      setFormData({ ...formData, tipePengerjaan: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="tipePengerjaan">
                      <SelectValue placeholder="Pilih tipe pengerjaan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDU">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Individu - Dikerjakan per siswa
                        </div>
                      </SelectItem>
                      <SelectItem value="KELOMPOK">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Kelompok - Dikerjakan berkelompok
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.tipePengerjaan === "INDIVIDU" 
                      ? "Setiap siswa mengumpulkan tugas sendiri-sendiri" 
                      : "Siswa dapat mengumpulkan tugas secara berkelompok dengan ketua dan anggota"}
                  </p>
                </div>
              )}

              {/* Nama Asesmen */}
              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama {formData.tipe === "KUIS" ? "Kuis" : "Tugas"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder={formData.tipe === "KUIS" ? "Contoh: Quiz React Fundamentals" : "Contoh: Tugas Membuat Website"}
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  disabled={isLoading}
                  required
                  autoFocus
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  placeholder={
                    formData.tipe === "KUIS" 
                      ? "Deskripsi singkat tentang kuis ini..." 
                      : "Deskripsi dan instruksi tugas..."
                  }
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  disabled={isLoading}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Berikan penjelasan tentang tujuan dan cakupan {formData.tipe === "KUIS" ? "kuis" : "tugas"} ini
                </p>
              </div>

              {/* Tanggal (untuk KUIS dan TUGAS) */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tgl_mulai">
                    Tanggal Mulai <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="tgl_mulai"
                      type="datetime-local"
                      value={formData.tgl_mulai}
                      onChange={(e) => setFormData({ ...formData, tgl_mulai: e.target.value })}
                      disabled={isLoading}
                      required
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.tipe === "KUIS" ? "Kapan kuis mulai bisa dikerjakan" : "Kapan tugas mulai bisa dikerjakan"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tgl_selesai">
                    Tanggal Selesai <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="tgl_selesai"
                      type="datetime-local"
                      value={formData.tgl_selesai}
                      onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
                      disabled={isLoading}
                      required
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.tipe === "KUIS" ? "Deadline pengerjaan kuis" : "Deadline pengumpulan tugas"}
                  </p>
                </div>
              </div>

              {/* File Upload (Only for TUGAS) */}
              {formData.tipe === "TUGAS" && (
                <div className="space-y-2">
                  <Label htmlFor="file">Lampiran (Opsional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="cursor-pointer"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                    />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{selectedFile.name}</span>
                      <span className="text-xs">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload file soal atau panduan tugas (PDF, DOC, PPT, ZIP - Max 5MB)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Buat Asesmen
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
