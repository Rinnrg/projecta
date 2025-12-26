"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Save, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id as indonesia } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { FileUploadField } from "@/components/file-upload-field"

type ProyekWithGuru = {
  id: string
  judul: string
  deskripsi: string
  lampiran: string | null
  fileData: Buffer | null
  fileName: string | null
  fileType: string | null
  fileSize: number | null
  tgl_mulai: Date
  tgl_selesai: Date
  guru: {
    nama: string
  }
}

interface EditProyekClientProps {
  proyek: ProyekWithGuru
  sintaks: string
  judulProyek: string
}

export default function EditProyekClient({ proyek, sintaks, judulProyek }: EditProyekClientProps) {
  const router = useRouter()
  const alert = useSweetAlert()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tglMulai, setTglMulai] = useState<Date | undefined>(new Date(proyek.tgl_mulai))
  const [tglSelesai, setTglSelesai] = useState<Date | undefined>(new Date(proyek.tgl_selesai))
  const [lampiran, setLampiran] = useState(
    proyek.fileData && proyek.fileType 
      ? `/api/proyek/${proyek.id}/file`
      : proyek.lampiran || ""
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!tglMulai || !tglSelesai) {
      alert.warning("Tanggal Belum Lengkap", "Silakan pilih tanggal mulai dan selesai")
      return
    }

    if (tglSelesai < tglMulai) {
      alert.error("Tanggal Tidak Valid", "Tanggal selesai tidak boleh lebih awal dari tanggal mulai")
      return
    }

    setLoading(true)
    const formElement = event.currentTarget
    const formData = new FormData(formElement)

    try {
      // Handle file upload if lampiran contains base64 data
      let fileData = null
      let fileName = null
      let fileType = null
      let fileSize = null

      if (lampiran && lampiran.startsWith('data:')) {
        // Extract file metadata from data URL
        const matches = lampiran.match(/^data:([^;]+);base64,(.+)$/)
        if (matches) {
          fileType = matches[1]
          fileData = matches[2]
          fileName = `jobsheet-${sintaks}-${Date.now()}.${fileType.split('/')[1]}`
          
          // Calculate file size (base64 is ~1.37x larger than original)
          fileSize = Math.floor((fileData.length * 3) / 4)
        }
      }

      const data = {
        judul: judulProyek,
        deskripsi: formData.get("deskripsi") as string,
        tgl_mulai: tglMulai.toISOString(),
        tgl_selesai: tglSelesai.toISOString(),
        lampiran: lampiran && !lampiran.startsWith('data:') && !lampiran.startsWith('/api/') ? lampiran : null,
        fileData,
        fileName,
        fileType,
        fileSize
      }

      const response = await fetch(`/api/proyek/${proyek.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        alert.error("Gagal Update Tahapan Proyek", result.error || "Terjadi kesalahan")
      } else {
        alert.success("Berhasil", "Tahapan proyek berhasil diperbarui!")
        
        setTimeout(() => {
          router.push(`/projects/${sintaks}`)
          router.refresh()
        }, 2000)
      }

    } catch (error) {
      console.error(error)
      
      alert.error("Terjadi Kesalahan", error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    const confirmed = await alert.confirm("Hapus Tahapan Proyek?", {
      description: "Tindakan ini tidak dapat dibatalkan!",
      type: "warning",
      confirmText: "Ya, Hapus!",
      cancelText: "Batal",
    })

    if (confirmed) {
      setDeleting(true)
      try {
        const response = await fetch(`/api/proyek/${proyek.id}`, {
          method: "DELETE",
        })

        const deleteResult = await response.json()

        if (!response.ok || deleteResult.error) {
          alert.error("Gagal Menghapus", deleteResult.error || "Terjadi kesalahan")
        } else {
          alert.success("Berhasil", "Tahapan proyek berhasil dihapus!")

          setTimeout(() => {
            router.push(`/projects/${sintaks}`)
            router.refresh()
          }, 2000)
        }
      } catch (error) {
        console.error(error)
        alert.error("Terjadi Kesalahan", "Gagal menghapus tahapan proyek")
      } finally {
        setDeleting(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Tahapan Proyek</h1>
          <p className="text-muted-foreground">{judulProyek} - Pemrograman Berorientasi Objek</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Form Edit Tahapan Proyek</CardTitle>
              <CardDescription>
                Mengedit tahapan: <span className="font-semibold">{judulProyek}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Judul Proyek - Display Only */}
              <div className="space-y-2">
                <Label>Judul Tahapan Proyek</Label>
                <div className="px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  {judulProyek}
                </div>
                <p className="text-xs text-muted-foreground">
                  Judul otomatis berdasarkan tahapan sintaks
                </p>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor="deskripsi">
                  Deskripsi Proyek <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="deskripsi"
                  name="deskripsi"
                  placeholder="Jelaskan deskripsi lengkap tahapan proyek ini..."
                  className="min-h-[150px]"
                  defaultValue={proyek.deskripsi}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Jelaskan tujuan, konteks, dan gambaran umum tahapan proyek ini
                </p>
              </div>

              {/* Tanggal Mulai & Selesai */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label>
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tglMulai && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tglMulai ? format(tglMulai, "PPP", { locale: indonesia }) : <span>Pilih tanggal mulai</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={tglMulai} onSelect={setTglMulai} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label>
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tglSelesai && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tglSelesai ? format(tglSelesai, "PPP", { locale: indonesia }) : <span>Pilih tanggal selesai</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={tglSelesai} onSelect={setTglSelesai} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Upload Jobsheet */}
              <div className="space-y-2">
                <Label htmlFor="lampiran">File Jobsheet/Modul (Opsional)</Label>
                <FileUploadField
                  value={lampiran}
                  onChange={setLampiran}
                  accept=".pdf,.doc,.docx"
                  maxSize={10}
                  label="Klik untuk upload file jobsheet"
                  description="PDF, DOC, DOCX (Max 10MB)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading || deleting}
                >
                  {deleting ? (
                    <>Menghapus...</>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </>
                  )}
                </Button>
                
                <div className="flex-1 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                    disabled={loading || deleting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || deleting || !tglMulai || !tglSelesai}
                  >
                    {loading ? (
                      <>Menyimpan...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      
      <alert.AlertComponent />
    </div>
  )
}
