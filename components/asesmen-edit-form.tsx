"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { Loader2, Plus, Trash2, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileUploadField } from "@/components/file-upload-field"

interface AsesmenEditFormProps {
  asesmenId: string
  courseId?: string
}

interface Opsi {
  id?: string
  teks: string
  isBenar: boolean
}

interface Soal {
  id?: string
  pertanyaan: string
  bobot: number
  tipeJawaban?: 'PILIHAN_GANDA' | 'ISIAN'
  opsi: Opsi[]
}

export function AsesmenEditForm({ asesmenId, courseId }: AsesmenEditFormProps) {
  const router = useRouter()
  const { error: showError, success: showSuccess, AlertComponent } = useSweetAlert()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
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
    tipe: "",
    tipePengerjaan: "",
    tgl_mulai: "",
    tgl_selesai: "",
    durasi: "",
    lampiran: "",
    courseId: "",
  })

  useEffect(() => {
    fetchData()
  }, [asesmenId])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch asesmen data
      const asesmenRes = await fetch(`/api/asesmen/${asesmenId}`)
      if (!asesmenRes.ok) throw new Error('Failed to fetch asesmen')
      const asesmenData = await asesmenRes.json()
      
      // Fetch courses
      const coursesRes = await fetch('/api/courses')
      if (!coursesRes.ok) throw new Error('Failed to fetch courses')
      const coursesData = await coursesRes.json()
      setCourses(coursesData.courses || [])
      
      // Set form data
      const asesmen = asesmenData.asesmen
      setFormData({
        nama: asesmen.nama || "",
        deskripsi: asesmen.deskripsi || "",
        tipe: asesmen.tipe || "",
        tipePengerjaan: asesmen.tipePengerjaan || "",
        tgl_mulai: asesmen.tgl_mulai ? new Date(asesmen.tgl_mulai).toISOString().slice(0, 16) : "",
        tgl_selesai: asesmen.tgl_selesai ? new Date(asesmen.tgl_selesai).toISOString().slice(0, 16) : "",
        durasi: asesmen.durasi?.toString() || "",
        lampiran: asesmen.lampiran || "",
        courseId: asesmen.courseId || "",
      })

      // Load existing soal jika tipe KUIS
      if (asesmen.tipe === 'KUIS' && asesmen.soal) {
        setSoalList(asesmen.soal)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      showError("Error", "Gagal mengambil data asesmen")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSoal = () => {
    // Validasi soal
    if (!currentSoal.pertanyaan.trim()) {
      showError("Error", "Pertanyaan wajib diisi")
      return
    }

    const filledOpsi = currentSoal.opsi.filter(o => o.teks.trim() !== "")
    if (filledOpsi.length < 2) {
      showError("Error", "Minimal 2 pilihan jawaban harus diisi")
      return
    }

    const hasCorrectAnswer = currentSoal.opsi.some(o => o.isBenar)
    if (!hasCorrectAnswer) {
      showError("Error", "Harus ada minimal 1 jawaban yang benar")
      return
    }

    // Add soal to list
    setSoalList([...soalList, { ...currentSoal }])
    
    // Reset current soal
    setCurrentSoal({
      pertanyaan: "",
      bobot: 10,
      opsi: [
        { teks: "", isBenar: false },
        { teks: "", isBenar: false },
        { teks: "", isBenar: false },
        { teks: "", isBenar: false },
      ]
    })

    showSuccess("Berhasil!", "Soal berhasil ditambahkan")
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
    if (!formData.nama || !formData.tipe || !formData.courseId) {
      showError("Error", "Nama, tipe, dan course wajib diisi")
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
    
    if (!formData.nama || !formData.tipe || !formData.courseId) {
      showError("Error", "Nama, tipe, dan course wajib diisi")
      return
    }

    // Validasi untuk KUIS
    if (formData.tipe === 'KUIS' && soalList.length === 0) {
      showError("Error", "Minimal harus ada 1 soal untuk kuis")
      return
    }

    setIsSaving(true)
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
        courseId: formData.courseId,
      }

      // Tambahkan soal untuk KUIS
      if (formData.tipe === 'KUIS') {
        bodyData.soal = soalList.map(s => ({
          pertanyaan: s.pertanyaan,
          bobot: s.bobot,
          tipeJawaban: s.tipeJawaban || 'PILIHAN_GANDA',
          opsi: (s.tipeJawaban === 'PILIHAN_GANDA' || !s.tipeJawaban)
            ? s.opsi.filter(o => o.teks.trim() !== "").map(o => ({
                teks: o.teks,
                isBenar: o.isBenar
              }))
            : []
        }))
      }

      const response = await fetch(`/api/asesmen/${asesmenId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) {
        throw new Error('Failed to update asesmen')
      }

      await showSuccess("Berhasil!", "Asesmen berhasil diperbarui")

      // Redirect kembali ke course detail
      if (courseId) {
        router.push(`/courses/${courseId}`)
      } else {
        router.push('/asesmen')
      }
      router.refresh()
    } catch (error) {
      console.error('Error updating asesmen:', error)
      showError("Error", "Gagal memperbarui asesmen")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Render step pertanyaan untuk KUIS
  if (currentStep === 'questions' && formData.tipe === 'KUIS') {
    return (
      <>
        <AlertComponent />
        <div className="space-y-6">
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
                      </div>
                      <p className="font-medium mb-2">{soal.pertanyaan}</p>
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
            <CardDescription>Buat soal pilihan ganda seperti Kahoot</CardDescription>
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
            disabled={isSaving}
          >
            Kembali
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSaving || soalList.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Kuis'
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
          <CardTitle>Edit Asesmen</CardTitle>
          <CardDescription>
            Perbarui informasi asesmen
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

          <div className="space-y-2">
            <Label htmlFor="courseId">Course *</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.judul}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <FileUploadField
            label="Lampiran"
            description="Upload file atau masukkan link URL"
            value={formData.lampiran}
            onChange={(value) => setFormData({ ...formData, lampiran: value })}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
          />

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (courseId) {
                  router.push(`/courses/${courseId}`)
                } else {
                  router.back()
                }
              }}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : formData.tipe === 'KUIS' ? (
                'Selanjutnya'
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
    </>
  )
}
