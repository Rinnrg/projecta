"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
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
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    jml_soal: "",
    durasi: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nama.trim()) {
      showError("Error", "Nama asesmen harus diisi")
      return
    }

    if (!formData.jml_soal || parseInt(formData.jml_soal) <= 0) {
      showError("Error", "Jumlah soal harus lebih dari 0")
      return
    }

    if (!formData.durasi || parseInt(formData.durasi) <= 0) {
      showError("Error", "Durasi harus lebih dari 0")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/asesmen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formData.nama,
          deskripsi: formData.deskripsi || null,
          jml_soal: parseInt(formData.jml_soal),
          durasi: parseInt(formData.durasi),
          courseId,
          guruId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create asesmen")
      }

      const result = await response.json()
      
      success("Berhasil!", "Asesmen baru berhasil dibuat")
      
      // Redirect to add questions or back to course
      setTimeout(() => {
        if (result.asesmen?.id) {
          // TODO: Redirect to questions page when implemented
          router.push(`/courses/${courseId}`)
        } else {
          router.push(`/courses/${courseId}`)
        }
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error creating asesmen:", error)
      showError("Error", "Gagal membuat asesmen")
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
              Isi informasi asesmen yang akan dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama Asesmen <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Contoh: Quiz React Fundamentals"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  disabled={isLoading}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Deskripsi singkat tentang asesmen ini..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  disabled={isLoading}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Berikan penjelasan tentang tujuan dan cakupan asesmen ini
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jml_soal">
                    Jumlah Soal <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="jml_soal"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={formData.jml_soal}
                    onChange={(e) => setFormData({ ...formData, jml_soal: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Total soal dalam asesmen
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durasi">
                    Durasi (menit) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="durasi"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.durasi}
                    onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Waktu pengerjaan dalam menit
                  </p>
                </div>
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
