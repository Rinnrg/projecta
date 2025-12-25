"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  User, 
  Users, 
  Clock, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import Link from "next/link"

interface SubmitTugasFormProps {
  asesmen: any
  user: any
  existingSubmission: any
  isDeadlinePassed: boolean
}

export default function SubmitTugasForm({ 
  asesmen, 
  user, 
  existingSubmission, 
  isDeadlinePassed 
}: SubmitTugasFormProps) {
  const router = useRouter()
  const { success, error: showError, AlertComponent } = useSweetAlert()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    namaKelompok: existingSubmission?.namaKelompok || "",
    ketua: existingSubmission?.ketua || "",
    anggota: existingSubmission?.anggota || "",
    catatan: existingSubmission?.catatan || "",
  })

  const isKelompok = asesmen.tipePengerjaan === "KELOMPOK"
  const hasSubmitted = !!existingSubmission

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError("Error", "Ukuran file maksimal 10MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isDeadlinePassed) {
      showError("Error", "Deadline pengumpulan sudah lewat")
      return
    }

    if (!selectedFile && !hasSubmitted) {
      showError("Error", "File harus diupload")
      return
    }

    if (isKelompok) {
      if (!formData.namaKelompok.trim()) {
        showError("Error", "Nama kelompok harus diisi")
        return
      }
      if (!formData.ketua.trim()) {
        showError("Error", "Nama ketua harus diisi")
        return
      }
      if (!formData.anggota.trim()) {
        showError("Error", "Nama anggota harus diisi")
        return
      }
    }

    try {
      setIsLoading(true)
      
      // Upload file first if exists
      let fileUrl = existingSubmission?.fileUrl || null
      if (selectedFile) {
        // TODO: Implement file upload to your storage service
        // For now, we'll just store the filename
        fileUrl = selectedFile.name
      }

      const response = await fetch(`/api/asesmen/${asesmen.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namaKelompok: isKelompok ? formData.namaKelompok : null,
          ketua: isKelompok ? formData.ketua : null,
          anggota: isKelompok ? formData.anggota : null,
          fileUrl,
          catatan: formData.catatan || null,
          siswaId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal mengumpulkan tugas")
      }

      success("Berhasil!", "Tugas berhasil dikumpulkan")
      
      setTimeout(() => {
        router.push(`/asesmen/${asesmen.id}`)
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error submitting task:", error)
      showError("Error", error instanceof Error ? error.message : "Gagal mengumpulkan tugas")
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
            <Link href={`/asesmen/${asesmen.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Detail Tugas
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {hasSubmitted ? "Edit" : "Kumpulkan"} Tugas
            </h1>
            {hasSubmitted && (
              <Badge variant="default">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Sudah Dikumpulkan
              </Badge>
            )}
            {isDeadlinePassed && (
              <Badge variant="destructive">
                <AlertCircle className="mr-1 h-3 w-3" />
                Ditutup
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {asesmen.nama} • {asesmen.course.judul}
          </p>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Tugas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center text-sm">
                {isKelompok ? (
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">Tipe:</span>
                <span className="ml-2 font-medium">
                  {isKelompok ? "Kelompok" : "Individu"}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Durasi:</span>
                <span className="ml-2 font-medium">{asesmen.durasi} menit</span>
              </div>

              {asesmen.tgl_selesai && (
                <div className="flex items-center text-sm sm:col-span-2">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="ml-2 font-medium">
                    {new Date(asesmen.tgl_selesai).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>

            {asesmen.deskripsi && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Deskripsi:</p>
                  <p className="text-sm text-muted-foreground">{asesmen.deskripsi}</p>
                </div>
              </>
            )}

            {asesmen.lampiran && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Lampiran Soal:</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={asesmen.lampiran} download>
                      <FileText className="mr-2 h-4 w-4" />
                      Download File Soal
                    </a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form Pengumpulan</CardTitle>
            <CardDescription>
              {isKelompok 
                ? "Isi data kelompok dan upload file tugas kelompok Anda"
                : "Upload file tugas Anda"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kelompok Fields */}
              {isKelompok && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="namaKelompok">
                      Nama Kelompok <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="namaKelompok"
                      placeholder="Contoh: Kelompok 1"
                      value={formData.namaKelompok}
                      onChange={(e) => setFormData({ ...formData, namaKelompok: e.target.value })}
                      disabled={isLoading || isDeadlinePassed}
                      required={isKelompok}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ketua">
                      Nama Ketua <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ketua"
                      placeholder="Nama ketua kelompok"
                      value={formData.ketua}
                      onChange={(e) => setFormData({ ...formData, ketua: e.target.value })}
                      disabled={isLoading || isDeadlinePassed}
                      required={isKelompok}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anggota">
                      Nama Anggota <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="anggota"
                      placeholder="Pisahkan dengan koma. Contoh: Ahmad, Budi, Citra"
                      value={formData.anggota}
                      onChange={(e) => setFormData({ ...formData, anggota: e.target.value })}
                      disabled={isLoading || isDeadlinePassed}
                      required={isKelompok}
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tuliskan nama semua anggota kelompok, pisahkan dengan koma
                    </p>
                  </div>

                  <Separator />
                </>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">
                  Upload File Tugas {!hasSubmitted && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isLoading || isDeadlinePassed}
                  className="cursor-pointer"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-xs">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
                {hasSubmitted && existingSubmission?.fileUrl && !selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>File sudah diupload: {existingSubmission.fileUrl}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: PDF, DOC, DOCX, ZIP, RAR (Max 10MB)
                </p>
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  disabled={isLoading || isDeadlinePassed}
                  rows={4}
                  className="resize-none"
                />
              </div>

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
                  disabled={isLoading || isDeadlinePassed}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {hasSubmitted ? "Menyimpan..." : "Mengumpulkan..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {hasSubmitted ? "Update Tugas" : "Kumpulkan Tugas"}
                    </>
                  )}
                </Button>
              </div>

              {isDeadlinePassed && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Deadline pengumpulan sudah lewat. Tidak dapat mengumpulkan atau mengubah tugas.</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
