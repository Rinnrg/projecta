"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Save, Upload, Link2, X, FileText, Video, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useSweetAlert } from "@/components/ui/sweet-alert"

interface EditMateriClientProps {
  materi: {
    id: string
    judul: string
    deskripsi: string | null
    lampiran: string | null
    courseId: string
    course: {
      id: string
      judul: string
    }
  }
}

export default function EditMateriClient({ materi }: EditMateriClientProps) {
  const router = useRouter()
  const { success, error: showError, AlertComponent } = useSweetAlert()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<"link" | "file">("link")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    judul: materi.judul,
    deskripsi: materi.deskripsi || "",
    lampiran: materi.lampiran || "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'image/jpeg',
      'image/png',
      'image/gif',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      showError("Error", "Tipe file tidak didukung. Silakan upload PDF, gambar, atau video")
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      showError("Error", "Ukuran file maksimal 50MB")
      return
    }

    setSelectedFile(file)
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Upload file to server
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Gagal mengupload file")
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.judul.trim()) {
      showError("Error", "Judul materi harus diisi")
      return
    }

    setIsSubmitting(true)

    try {
      let lampiranUrl = formData.lampiran

      // If file is selected, upload it first
      if (uploadMode === "file" && selectedFile) {
        setIsUploading(true)
        try {
          lampiranUrl = await uploadFile(selectedFile)
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError)
          showError("Error", "Gagal mengupload file")
          setIsSubmitting(false)
          setIsUploading(false)
          return
        }
        setIsUploading(false)
      }

      const response = await fetch(`/api/materi/${materi.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lampiran: lampiranUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Update materi error:", errorData)
        throw new Error(errorData.error || "Gagal mengupdate materi")
      }

      success("Berhasil", "Materi berhasil diupdate")
      
      // Redirect back to materi detail
      setTimeout(() => {
        router.push(`/courses/${materi.courseId}/materi/${materi.id}`)
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error("Error updating materi:", error)
      showError("Error", error.message || "Gagal mengupdate materi")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AlertComponent />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Materi</h1>
          <p className="text-muted-foreground mt-1">
            Kursus: {materi.course.judul}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/courses/${materi.courseId}/materi/${materi.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Materi</CardTitle>
            <CardDescription>
              Perbarui informasi materi pembelajaran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="judul">
                Judul Materi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="judul"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Masukkan judul materi"
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Masukkan deskripsi materi"
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Jelaskan apa yang akan dipelajari dalam materi ini
              </p>
            </div>

            {/* Lampiran */}
            <div className="space-y-3">
              <Label>Lampiran</Label>
              
              <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "link" | "file")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="link" className="gap-2">
                    <Link2 className="h-4 w-4" />
                    Link URL
                  </TabsTrigger>
                  <TabsTrigger value="file" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                </TabsList>

                {/* Link Tab */}
                <TabsContent value="link" className="space-y-3 mt-4">
                  <Input
                    id="lampiran"
                    value={formData.lampiran}
                    onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Masukkan URL untuk file PDF, video YouTube, atau sumber belajar lainnya
                  </p>
                  <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
                    <p className="font-medium">Contoh URL yang didukung:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                      <li>YouTube: https://www.youtube.com/watch?v=xxx</li>
                      <li>PDF: https://example.com/file.pdf</li>
                      <li>Video: https://example.com/video.mp4</li>
                      <li>Link lainnya: https://example.com</li>
                    </ul>
                  </div>
                </TabsContent>

                {/* File Upload Tab */}
                <TabsContent value="file" className="space-y-3 mt-4">
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInputChange}
                      accept=".pdf,.mp4,.webm,.ogg,.jpg,.jpeg,.png,.gif"
                      className="hidden"
                      aria-label="Upload file"
                    />

                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {selectedFile.type.includes("video") ? (
                              <Video className="h-6 w-6" />
                            ) : (
                              <FileText className="h-6 w-6" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={removeFile}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          File siap diupload saat Anda menyimpan materi
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="p-4 rounded-full bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">Drag & drop file di sini</p>
                          <p className="text-sm text-muted-foreground">atau</p>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Pilih File
                          </Button>
                        </div>
                        <div className="pt-2 text-xs text-muted-foreground space-y-1">
                          <p>Format yang didukung: PDF, MP4, WEBM, OGG, JPG, PNG, GIF</p>
                          <p>Ukuran maksimal: 50MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Show current lampiran if exists */}
                  {materi.lampiran && !selectedFile && (
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="text-xs font-medium mb-2">Lampiran saat ini:</p>
                      <a
                        href={materi.lampiran}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {materi.lampiran}
                      </a>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? "Mengupload..." : "Menyimpan..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
