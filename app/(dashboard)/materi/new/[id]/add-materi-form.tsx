"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Plus, Upload, X, Link2, FileText, Video } from "lucide-react"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddMateriFormProps {
  courseId: string
  courseTitle: string
}

export default function AddMateriForm({ courseId, courseTitle }: AddMateriFormProps) {
  const router = useRouter()
  const { success, error: showError, AlertComponent } = useSweetAlert()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadType, setUploadType] = useState<"file" | "link">("link")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    lampiran: "",
  })

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.judul.trim()) {
      showError("Error", "Judul materi harus diisi")
      return
    }

    // Validate that either file or link is provided
    if (uploadType === "file" && !selectedFile) {
      showError("Error", "Silakan pilih file untuk diupload")
      return
    }

    if (uploadType === "link" && !formData.lampiran.trim()) {
      showError("Error", "Silakan masukkan link lampiran")
      return
    }

    try {
      setIsLoading(true)
      let fileData = null
      let fileName = null
      let fileType = null
      let fileSize = null

      // Convert file to base64 if file upload type is selected
      if (uploadType === "file" && selectedFile) {
        setIsUploading(true)
        try {
          fileData = await fileToBase64(selectedFile)
          fileName = selectedFile.name
          fileType = selectedFile.type
          fileSize = selectedFile.size
        } catch (uploadError) {
          console.error("Error converting file:", uploadError)
          showError("Error", "Gagal memproses file")
          setIsLoading(false)
          setIsUploading(false)
          return
        }
        setIsUploading(false)
      }

      const response = await fetch("/api/materi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          judul: formData.judul,
          deskripsi: formData.deskripsi || null,
          lampiran: uploadType === "link" ? formData.lampiran : null,
          fileData,
          fileName,
          fileType,
          fileSize,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create materi")
      }

      success("Berhasil!", "Materi baru berhasil ditambahkan")
      
      // Redirect back to course detail
      setTimeout(() => {
        router.push(`/courses/${courseId}`)
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error creating materi:", error)
      showError("Error", "Gagal menambahkan materi")
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
          <h1 className="text-2xl font-bold sm:text-3xl">Tambah Materi Baru</h1>
          <p className="text-muted-foreground">
            Buat materi pembelajaran baru untuk <span className="font-semibold">{courseTitle}</span>
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Materi</CardTitle>
            <CardDescription>
              Isi informasi materi pembelajaran yang akan ditambahkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="judul">
                  Judul Materi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="judul"
                  placeholder="Contoh: Pengenalan React Hooks"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  disabled={isLoading}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Deskripsi singkat tentang materi ini..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  disabled={isLoading}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Berikan penjelasan singkat tentang apa yang akan dipelajari di materi ini
                </p>
              </div>

              {/* File or Link Upload */}
              <div className="space-y-2">
                <Label>
                  Lampiran <span className="text-destructive">*</span>
                </Label>
                <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "link")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="link" className="gap-2">
                      <Link2 className="h-4 w-4" />
                      Link URL
                    </TabsTrigger>
                  </TabsList>

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
                        onChange={handleFileChange}
                        disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                  </TabsContent>

                  <TabsContent value="link" className="space-y-3">
                    <Input
                      type="url"
                      placeholder="https://example.com/file.pdf atau https://youtube.com/watch?v=..."
                      value={formData.lampiran}
                      onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL ke file PDF, video YouTube, Google Drive, atau sumber belajar lainnya
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

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
                  disabled={isLoading || isUploading}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? "Mengupload..." : "Menyimpan..."}
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Materi
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
