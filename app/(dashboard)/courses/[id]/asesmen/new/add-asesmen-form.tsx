"use client"

import { useState, useEffect } from "react"
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
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Plus, Trash2, Check, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileUploadField } from "@/components/file-upload-field"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddAsesmenFormProps {
  courseId: string
  courseTitle: string
}

interface Opsi {
  teks: string
  isBenar: boolean
}

interface Soal {
  pertanyaan: string
  bobot: number
  tipeJawaban: 'PILIHAN_GANDA' | 'ISIAN'
  opsi: Opsi[]
}

export default function AddAsesmenForm({ courseId, courseTitle }: AddAsesmenFormProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { success, error: showError, AlertComponent } = useSweetAlert()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'basic' | 'questions'>('basic')
  const [soalList, setSoalList] = useState<Soal[]>([])
  const [currentSoal, setCurrentSoal] = useState<Soal>({
    pertanyaan: "",
    bobot: 10,
    tipeJawaban: 'PILIHAN_GANDA',
    opsi: [
      { teks: "", isBenar: false },
      { teks: "", isBenar: false },
      { teks: "", isBenar: false },
      { teks: "", isBenar: false },
    ]
  })
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    tipe: "KUIS",
    tipePengerjaan: "INDIVIDU",
    tgl_mulai: "",
    tgl_selesai: "",
    durasi: "",
    lampiran: "",
  })

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  const handleAddSoal = () => {
    // Validasi soal
    if (!currentSoal.pertanyaan.trim()) {
      toast({
        title: "Error",
        description: "Pertanyaan wajib diisi",
        variant: "destructive",
      })
      return
    }

    // Validasi untuk pilihan ganda
    if (currentSoal.tipeJawaban === 'PILIHAN_GANDA') {
      const filledOpsi = currentSoal.opsi.filter(o => o.teks.trim() !== "")
      if (filledOpsi.length < 2) {
        toast({
          title: "Error",
          description: "Minimal 2 pilihan jawaban harus diisi untuk pilihan ganda",
          variant: "destructive",
        })
        return
      }

      const hasCorrectAnswer = currentSoal.opsi.some(o => o.isBenar)
      if (!hasCorrectAnswer) {
        toast({
          title: "Error",
          description: "Harus ada minimal 1 jawaban yang benar",
          variant: "destructive",
        })
        return
      }
    }

    // Add soal to list
    setSoalList([...soalList, { ...currentSoal }])
    
    // Reset current soal
    setCurrentSoal({
      pertanyaan: "",
      bobot: 10,
      tipeJawaban: 'PILIHAN_GANDA',
      opsi: [
        { teks: "", isBenar: false },
        { teks: "", isBenar: false },
        { teks: "", isBenar: false },
        { teks: "", isBenar: false },
      ]
    })

    toast({
      title: "Berhasil",
      description: "Soal berhasil ditambahkan",
    })
  }

  const handleRemoveSoal = (index: number) => {
    setSoalList(soalList.filter((_, i) => i !== index))
  }

  const handleOpsiChange = (index: number, value: string) => {
    const newOpsi = [...currentSoal.opsi]
    newOpsi[index].teks = value
    setCurrentSoal({ ...currentSoal, opsi: newOpsi })
  }

  const handleCorrectAnswerChange = (index: number) => {
    const newOpsi = currentSoal.opsi.map((o, i) => ({
      ...o,
      isBenar: i === index
    }))
    setCurrentSoal({ ...currentSoal, opsi: newOpsi })
  }

  const handleNext = () => {
    if (!formData.nama || !formData.tipe) {
      toast({
        title: "Error",
        description: "Nama dan tipe asesmen wajib diisi",
        variant: "destructive",
      })
      return
    }

    if (formData.tipe === 'KUIS') {
      setCurrentStep('questions')
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    setCurrentStep('basic')
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!formData.nama || !formData.tipe) {
      toast({
        title: "Error",
        description: "Nama dan tipe asesmen wajib diisi",
        variant: "destructive",
      })
      return
    }

    // Validasi user dengan lebih detail
    if (!user) {
      console.error('User is null or undefined:', user)
      toast({
        title: "Error",
        description: "Anda belum login. Silakan login terlebih dahulu.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    if (!user.id || user.id === 'temp') {
      console.error('User ID invalid:', user)
      toast({
        title: "Error",
        description: "Session tidak valid. Silakan login ulang.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    // Validasi untuk KUIS
    if (formData.tipe === 'KUIS' && soalList.length === 0) {
      toast({
        title: "Error",
        description: "Minimal harus ada 1 soal untuk kuis",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const bodyData: any = {
        nama: formData.nama,
        deskripsi: formData.deskripsi || null,
        tipe: formData.tipe,
        tipePengerjaan: formData.tipe === 'TUGAS' ? formData.tipePengerjaan : null,
        tgl_mulai: formData.tgl_mulai || null,
        tgl_selesai: formData.tgl_selesai || null,
        durasi: formData.durasi ? parseInt(formData.durasi) : null,
        lampiran: formData.lampiran || null,
        courseId: courseId,
        guruId: user.id,
      }

      // Tambahkan soal untuk KUIS
      if (formData.tipe === 'KUIS') {
        bodyData.soal = soalList.map(s => ({
          pertanyaan: s.pertanyaan,
          bobot: s.bobot,
          tipeJawaban: s.tipeJawaban,
          opsi: s.tipeJawaban === 'PILIHAN_GANDA' 
            ? s.opsi.filter(o => o.teks.trim() !== "").map(o => ({
                teks: o.teks,
                isBenar: o.isBenar
              }))
            : []
        }))
        console.log('Soal data to send:', JSON.stringify(bodyData.soal, null, 2))
      }

      console.log('Sending body:', JSON.stringify(bodyData, null, 2))

      const response = await fetch('/api/asesmen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create asesmen')
      }

      // Tampilkan Sweet Alert sukses
      success("Berhasil!", "Asesmen berhasil dibuat")
      
      // Tunggu sebentar agar user melihat alert, lalu redirect
      setTimeout(() => {
        router.push(`/courses/${courseId}`)
        router.refresh()
      }, 1500)
      
    } catch (error) {
      console.error('Error creating asesmen:', error)
      showError(
        "Gagal Membuat Asesmen",
        error instanceof Error ? error.message : "Terjadi kesalahan saat membuat asesmen"
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Render step pertanyaan untuk KUIS
  if (currentStep === 'questions' && formData.tipe === 'KUIS') {
    return (
      <>
        <AlertComponent />
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
            size="sm"
            asChild
          >
            <Link href={`/courses/${courseId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Course
            </Link>
          </Button>
        </div>

        {/* Soal yang sudah ditambahkan */}
        {soalList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Soal ({soalList.length})</CardTitle>
              <CardDescription>Soal yang sudah ditambahkan ke kuis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {soalList.map((soal, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Soal {index + 1}</Badge>
                        <Badge variant="outline">{soal.bobot} poin</Badge>
                        <Badge variant={soal.tipeJawaban === 'PILIHAN_GANDA' ? 'default' : 'secondary'}>
                          {soal.tipeJawaban === 'PILIHAN_GANDA' ? 'Pilihan Ganda' : 'Isian'}
                        </Badge>
                      </div>
                      <p className="font-medium mb-2">{soal.pertanyaan}</p>
                      {soal.tipeJawaban === 'PILIHAN_GANDA' && (
                        <div className="space-y-1 pl-4">
                          {soal.opsi.filter(o => o.teks.trim() !== "").map((opsi, opsiIndex) => (
                            <div key={opsiIndex} className="flex items-center gap-2 text-sm">
                              {opsi.isBenar ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-gray-400" />
                              )}
                              <span className={opsi.isBenar ? "text-green-600 font-medium" : ""}>
                                {opsi.teks}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSoal(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Form tambah soal baru */}
        <Card>
          <CardHeader>
            <CardTitle>Tambah Soal Baru</CardTitle>
            <CardDescription>Buat soal pilihan ganda atau isian</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pertanyaan">Pertanyaan *</Label>
              <Textarea
                id="pertanyaan"
                value={currentSoal.pertanyaan}
                onChange={(e) => setCurrentSoal({ ...currentSoal, pertanyaan: e.target.value })}
                placeholder="Masukkan pertanyaan..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipeJawaban">Tipe Soal *</Label>
                <Select
                  value={currentSoal.tipeJawaban}
                  onValueChange={(value: 'PILIHAN_GANDA' | 'ISIAN') => 
                    setCurrentSoal({ 
                      ...currentSoal, 
                      tipeJawaban: value,
                      opsi: value === 'ISIAN' ? [] : [
                        { teks: "", isBenar: false },
                        { teks: "", isBenar: false },
                        { teks: "", isBenar: false },
                        { teks: "", isBenar: false },
                      ]
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe soal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PILIHAN_GANDA">Pilihan Ganda</SelectItem>
                    <SelectItem value="ISIAN">Isian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bobot">Poin *</Label>
                <Input
                  id="bobot"
                  type="number"
                  value={currentSoal.bobot}
                  onChange={(e) => setCurrentSoal({ ...currentSoal, bobot: parseInt(e.target.value) || 10 })}
                  placeholder="10"
                  min="1"
                />
              </div>
            </div>

            {currentSoal.tipeJawaban === 'PILIHAN_GANDA' && (
              <>
                <Separator />

                <div className="space-y-3">
                  <Label>Pilihan Jawaban *</Label>
                  <p className="text-sm text-muted-foreground">
                    Klik tombol centang untuk menandai jawaban yang benar
                  </p>
                  {currentSoal.opsi.map((opsi, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={opsi.isBenar ? "default" : "outline"}
                        size="sm"
                        className="shrink-0"
                        onClick={() => handleCorrectAnswerChange(index)}
                      >
                        {opsi.isBenar ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                      </Button>
                      <Input
                        value={opsi.teks}
                        onChange={(e) => handleOpsiChange(index, e.target.value)}
                        placeholder={`Pilihan ${index + 1}`}
                        className={opsi.isBenar ? "border-green-500" : ""}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {currentSoal.tipeJawaban === 'ISIAN' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Soal isian akan dinilai secara manual oleh guru setelah siswa mengumpulkan.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              onClick={handleAddSoal}
              className="w-full"
              variant="secondary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Soal
            </Button>
          </CardContent>
        </Card>

        {/* Tombol navigasi */}
        <div className="flex gap-2 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
          >
            Kembali
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading || soalList.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat...
              </>
            ) : (
              'Buat Kuis'
            )}
          </Button>
        </div>
      </div>
      </>
    )
  }

  // Render form basic info
  return (
    <>
      <AlertComponent />
      <form onSubmit={(e) => {
        e.preventDefault()
        handleNext()
      }}>
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
          <CardTitle>Informasi Asesmen</CardTitle>
          <CardDescription>
            {courseTitle ? `Buat asesmen baru untuk course ${courseTitle}` : 'Buat asesmen baru untuk course ini'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Asesmen *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Masukkan nama asesmen"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Masukkan deskripsi asesmen"
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipe">Tipe *</Label>
              <Select
                value={formData.tipe}
                onValueChange={(value) => setFormData({ ...formData, tipe: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KUIS">Kuis</SelectItem>
                  <SelectItem value="TUGAS">Tugas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipe === 'TUGAS' && (
              <div className="space-y-2">
                <Label htmlFor="tipePengerjaan">Tipe Pengerjaan</Label>
                <Select
                  value={formData.tipePengerjaan}
                  onValueChange={(value) => setFormData({ ...formData, tipePengerjaan: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe pengerjaan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDU">Individu</SelectItem>
                    <SelectItem value="KELOMPOK">Kelompok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.tipe === 'KUIS' && (
              <div className="space-y-2">
                <Label htmlFor="durasi">Durasi (menit)</Label>
                <Input
                  id="durasi"
                  type="number"
                  value={formData.durasi}
                  onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                  placeholder="Masukkan durasi dalam menit"
                  min="1"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tgl_mulai">Tanggal Mulai</Label>
              <Input
                id="tgl_mulai"
                type="datetime-local"
                value={formData.tgl_mulai}
                onChange={(e) => setFormData({ ...formData, tgl_mulai: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tgl_selesai">Tanggal Selesai</Label>
              <Input
                id="tgl_selesai"
                type="datetime-local"
                value={formData.tgl_selesai}
                onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
              />
            </div>
          </div>

          {formData.tipe === 'TUGAS' && (
            <FileUploadField
              label="Lampiran"
              description="Upload file atau masukkan link URL"
              value={formData.lampiran}
              onChange={(value) => setFormData({ ...formData, lampiran: value })}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
            />
          )}

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
                  Membuat...
                </>
              ) : formData.tipe === 'KUIS' ? (
                'Selanjutnya'
              ) : (
                'Buat Asesmen'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
    </>
  )
}
