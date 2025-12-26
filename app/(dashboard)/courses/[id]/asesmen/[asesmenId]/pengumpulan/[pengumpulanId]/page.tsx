"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useSweetAlert } from "@/components/ui/sweet-alert"
import { 
  ArrowLeft,
  Download,
  Calendar,
  User,
  Users,
  FileText,
  Loader2,
  Save,
  ExternalLink,
  Eye,
} from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ 
    id: string
    asesmenId: string
    pengumpulanId: string
  }>
}

export default function PengumpulanDetailPage({ params }: PageProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params)
  const { id: courseId, asesmenId, pengumpulanId } = resolvedParams
  const { success, error: showError, confirm, AlertComponent } = useSweetAlert()
  const [pengumpulan, setPengumpulan] = useState<any>(null)
  const [asesmen, setAsesmen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [nilai, setNilai] = useState<string>('')
  const [catatan, setCatatan] = useState<string>('')
  const [showFileViewer, setShowFileViewer] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    fetchData()
  }, [user, authLoading, pengumpulanId, asesmenId])

  const fetchData = async () => {
    try {
      // Fetch pengumpulan data
      const pengumpulanRes = await fetch(`/api/pengumpulan/${pengumpulanId}`)
      if (!pengumpulanRes.ok) throw new Error('Failed to fetch')
      
      const pengumpulanData = await pengumpulanRes.json()
      setPengumpulan(pengumpulanData.pengumpulan)
      setNilai(pengumpulanData.pengumpulan.nilai?.toString() || '')
      setCatatan(pengumpulanData.pengumpulan.catatan || '')

      // Fetch asesmen data
      const asesmenRes = await fetch(`/api/asesmen/${asesmenId}`)
      if (asesmenRes.ok) {
        const asesmenData = await asesmenRes.json()
        setAsesmen(asesmenData.asesmen)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showError("Error", "Gagal mengambil data pengumpulan")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNilai = async () => {
    if (!nilai) {
      showError("Error", "Nilai wajib diisi")
      return
    }

    const nilaiNum = parseFloat(nilai)
    if (nilaiNum < 0 || nilaiNum > 100) {
      showError("Error", "Nilai harus antara 0-100")
      return
    }

    // Konfirmasi dengan SweetAlert
    const confirmed = await confirm("Simpan Nilai", {
      description: `Apakah Anda yakin ingin menyimpan nilai ${nilaiNum} untuk ${pengumpulan.siswa?.nama || 'siswa ini'}?`,
      confirmText: "Simpan",
      cancelText: "Batal",
      type: "warning",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/pengumpulan/${pengumpulanId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nilai: nilaiNum,
              catatan,
            }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to save')
          }
        } catch (error) {
          console.error('Error saving nilai:', error)
          throw error
        }
      },
    })

    if (confirmed) {
      await success("Berhasil!", "Nilai berhasil disimpan dan akan ditampilkan di detail asesmen siswa")
      // Redirect ke detail asesmen setelah 1 detik
      setTimeout(() => {
        router.push(`/courses/${courseId}/asesmen/${asesmenId}`)
      }, 1000)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!pengumpulan || !asesmen) {
    return null
  }

  const isTeacher = user && (user.role === 'GURU' || user.role === 'ADMIN')

  return (
    <div className="container max-w-5xl py-6 sm:py-8 space-y-6">
      <AlertComponent />
      
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${courseId}/asesmen/${asesmenId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Asesmen
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Detail Pengumpulan</h1>
          <p className="text-muted-foreground">{asesmen.nama}</p>
        </div>
      </div>

      {/* Submission Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pengumpulan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {asesmen.tipePengerjaan === 'KELOMPOK' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Nama Kelompok</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pengumpulan.namaKelompok || '-'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Ketua Kelompok</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pengumpulan.ketua || '-'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Anggota</Label>
                <p className="text-sm">{pengumpulan.anggota || '-'}</p>
              </div>
            </>
          )}

          {asesmen.tipePengerjaan === 'INDIVIDU' && pengumpulan.siswa && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Siswa</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{pengumpulan.siswa.nama}</p>
                  <p className="text-sm text-muted-foreground">{pengumpulan.siswa.email}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Tanggal Upload</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(pengumpulan.tgl_unggah).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Status</Label>
              <div>
                {pengumpulan.nilai ? (
                  <Badge variant="default">Sudah dinilai</Badge>
                ) : (
                  <Badge variant="outline">Belum dinilai</Badge>
                )}
              </div>
            </div>
          </div>

          {pengumpulan.catatan && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-muted-foreground">Catatan Siswa</Label>
                <p className="text-sm whitespace-pre-wrap">{pengumpulan.catatan}</p>
              </div>
            </>
          )}

          {pengumpulan.fileUrl && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-muted-foreground">File</Label>
                <div className="flex items-center gap-2">
                  {/* Tombol Lihat File - untuk PDF */}
                  {(pengumpulan.fileUrl.startsWith('data:application/pdf') || 
                    pengumpulan.fileUrl.endsWith('.pdf')) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFileViewer(!showFileViewer)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showFileViewer ? 'Sembunyikan' : 'Lihat File'}
                    </Button>
                  )}
                  
                  {/* Tombol Unduh/Buka */}
                  {pengumpulan.fileUrl.startsWith('data:') ? (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={pengumpulan.fileUrl}
                        download={`submission-${pengumpulan.id}.${pengumpulan.fileUrl.split(';')[0].split('/')[1]}`}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Unduh File
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <a href={pengumpulan.fileUrl} target="_blank" rel="noopener noreferrer">
                        {pengumpulan.fileUrl.startsWith('http') ? (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Buka Link
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Unduh File
                          </>
                        )}
                      </a>
                    </Button>
                  )}
                </div>

                {/* PDF Viewer dengan animasi slide */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    showFileViewer ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {/* PDF Preview for base64 PDF */}
                  {pengumpulan.fileUrl.startsWith('data:application/pdf') && (
                    <div className="border rounded-lg overflow-hidden bg-muted mt-3">
                      <div className="aspect-[3/4] w-full">
                        <iframe
                          src={pengumpulan.fileUrl}
                          title="Submission File"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* PDF Preview for URL PDF */}
                  {pengumpulan.fileUrl.endsWith('.pdf') && !pengumpulan.fileUrl.startsWith('data:') && (
                    <div className="border rounded-lg overflow-hidden bg-muted mt-3">
                      <div className="aspect-[3/4] w-full">
                        <iframe
                          src={pengumpulan.fileUrl}
                          title="Submission File"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {pengumpulan.sourceCode && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-muted-foreground">Source Code</Label>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{pengumpulan.sourceCode}</code>
                </pre>
              </div>
            </>
          )}

          {pengumpulan.output && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-muted-foreground">Output</Label>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{pengumpulan.output}</code>
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Penilaian (Only for Teachers) */}
      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Penilaian</CardTitle>
            <CardDescription>Berikan nilai dan catatan untuk pengumpulan ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nilai">Nilai *</Label>
                <Input
                  id="nilai"
                  type="number"
                  min="0"
                  max="100"
                  value={nilai}
                  onChange={(e) => setNilai(e.target.value)}
                  placeholder="0-100"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="h-10 flex items-center">
                  {nilai && parseFloat(nilai) >= 75 ? (
                    <Badge variant="default" className="bg-green-500">Lulus</Badge>
                  ) : nilai ? (
                    <Badge variant="secondary">Belum Lulus</Badge>
                  ) : (
                    <Badge variant="outline">Belum dinilai</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan/Feedback</Label>
              <Textarea
                id="catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Berikan feedback untuk siswa..."
                rows={4}
              />
            </div>

            <Button onClick={handleSaveNilai}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Nilai
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
