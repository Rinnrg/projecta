"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUploadField } from "@/components/file-upload-field"
import { 
  ArrowLeft, 
  Upload, 
  Loader2,
  FileText,
  Users,
  User as UserIcon,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PageProps {
  params: Promise<{ 
    id: string
    asesmenId: string
  }>
}

export default function SubmitAsesmenPage({ params }: PageProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params)
  const { id: courseId, asesmenId } = resolvedParams
  
  const [asesmen, setAsesmen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [namaKelompok, setNamaKelompok] = useState("")
  const [ketua, setKetua] = useState("")
  const [anggota, setAnggota] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [catatan, setCatatan] = useState("")
  
  const [existingSubmission, setExistingSubmission] = useState<any>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'SISWA') {
      router.push(`/courses/${courseId}/asesmen/${asesmenId}`)
      return
    }

    // Fetch asesmen data
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/asesmen/${asesmenId}`)
        if (response.ok) {
          const data = await response.json()
          setAsesmen(data.asesmen)
          
          // Check if student already submitted
          const submission = data.asesmen.pengumpulanProyek?.find(
            (p: any) => p.siswaId === user.id
          )
          
          if (submission) {
            setExistingSubmission(submission)
            setNamaKelompok(submission.namaKelompok || "")
            setKetua(submission.ketua || "")
            setAnggota(submission.anggota || "")
            setFileUrl(submission.fileUrl || "")
            setCatatan(submission.catatan || "")
          }
        } else {
          router.push(`/courses/${courseId}`)
        }
      } catch (error) {
        console.error('Error fetching asesmen:', error)
        router.push(`/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, router, asesmenId, courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fileUrl) {
      toast({
        title: "Error",
        description: "Silakan upload file tugas terlebih dahulu",
        variant: "destructive",
      })
      return
    }
    
    if (asesmen.tipePengerjaan === 'KELOMPOK') {
      if (!namaKelompok || !ketua || !anggota) {
        toast({
          title: "Error",
          description: "Silakan lengkapi informasi kelompok",
          variant: "destructive",
        })
        return
      }
    }
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/asesmen/${asesmenId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: user?.id,
          namaKelompok: asesmen.tipePengerjaan === 'KELOMPOK' ? namaKelompok : null,
          ketua: asesmen.tipePengerjaan === 'KELOMPOK' ? ketua : null,
          anggota: asesmen.tipePengerjaan === 'KELOMPOK' ? anggota : null,
          fileUrl,
          catatan,
        }),
      })
      
      if (response.ok) {
        toast({
          title: "Berhasil",
          description: existingSubmission 
            ? "Tugas berhasil diperbarui" 
            : "Tugas berhasil dikumpulkan",
        })
        router.push(`/courses/${courseId}/asesmen/${asesmenId}`)
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Gagal mengumpulkan tugas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting:', error)
      toast({
        title: "Error",
        description: "Gagal mengumpulkan tugas",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!asesmen) {
    return null
  }

  const isDeadlinePassed = asesmen.tgl_selesai 
    ? new Date(asesmen.tgl_selesai) < new Date() 
    : false

  const isKelompok = asesmen.tipePengerjaan === 'KELOMPOK'

  return (
    <div className="container max-w-4xl py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${courseId}/asesmen/${asesmenId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Detail Asesmen
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {existingSubmission ? 'Edit' : 'Kumpulkan'} Tugas
          </h1>
          <p className="text-muted-foreground mt-2">{asesmen.nama}</p>
        </div>
      </div>

      {/* Deadline Warning */}
      {isDeadlinePassed && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Deadline pengumpulan sudah lewat. Anda tidak dapat mengumpulkan tugas.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {isKelompok ? (
              <>
                <Users className="h-5 w-5" />
                Tugas Kelompok
              </>
            ) : (
              <>
                <UserIcon className="h-5 w-5" />
                Tugas Individu
              </>
            )}
          </CardTitle>
          <CardDescription>
            {asesmen.deskripsi || 'Tidak ada deskripsi'}
          </CardDescription>
        </CardHeader>
        {asesmen.tgl_selesai && (
          <CardContent>
            <div className="text-sm">
              <span className="text-muted-foreground">Deadline: </span>
              <span className="font-medium">
                {new Date(asesmen.tgl_selesai).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Submit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Pengumpulan</CardTitle>
          <CardDescription>
            Lengkapi form di bawah ini untuk mengumpulkan tugas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kelompok Fields */}
            {isKelompok && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="namaKelompok">
                    Nama Kelompok <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="namaKelompok"
                    value={namaKelompok}
                    onChange={(e) => setNamaKelompok(e.target.value)}
                    placeholder="Masukkan nama kelompok"
                    required
                    disabled={isDeadlinePassed}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ketua">
                    Nama Ketua <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ketua"
                    value={ketua}
                    onChange={(e) => setKetua(e.target.value)}
                    placeholder="Masukkan nama ketua kelompok"
                    required
                    disabled={isDeadlinePassed}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anggota">
                    Nama Anggota <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="anggota"
                    value={anggota}
                    onChange={(e) => setAnggota(e.target.value)}
                    placeholder="Masukkan nama anggota (pisahkan dengan koma)"
                    rows={3}
                    required
                    disabled={isDeadlinePassed}
                  />
                  <p className="text-xs text-muted-foreground">
                    Contoh: Ahmad, Budi, Citra
                  </p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <FileUploadField
                label="File Tugas"
                value={fileUrl}
                onChange={setFileUrl}
                description={
                  isDeadlinePassed 
                    ? "Deadline sudah lewat"
                    : "Upload file tugas atau berikan link ke file (Google Drive, OneDrive, dll)"
                }
              />
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan (Opsional)</Label>
              <Textarea
                id="catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tambahkan catatan untuk pengumpulan ini"
                rows={4}
                disabled={isDeadlinePassed}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting || isDeadlinePassed}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingSubmission ? 'Memperbarui...' : 'Mengumpulkan...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {existingSubmission ? 'Perbarui Tugas' : 'Kumpulkan Tugas'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link href={`/courses/${courseId}/asesmen/${asesmenId}`}>
                  Batal
                </Link>
              </Button>
            </div>

            {existingSubmission && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Anda sudah mengumpulkan tugas ini sebelumnya pada{' '}
                  {new Date(existingSubmission.tgl_unggah).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  . Form ini akan memperbarui pengumpulan Anda.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
