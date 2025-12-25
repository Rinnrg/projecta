"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface PageProps {
  params: { 
    asesmenId: string
    pengumpulanId: string
  }
}

export default function PengumpulanDetailPage({ params }: PageProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [pengumpulan, setPengumpulan] = useState<any>(null)
  const [asesmen, setAsesmen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [nilai, setNilai] = useState<string>('')
  const [catatan, setCatatan] = useState<string>('')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    fetchData()
  }, [user, authLoading])

  const fetchData = async () => {
    try {
      // Fetch pengumpulan data
      const pengumpulanRes = await fetch(`/api/pengumpulan/${params.pengumpulanId}`)
      if (!pengumpulanRes.ok) throw new Error('Failed to fetch')
      
      const pengumpulanData = await pengumpulanRes.json()
      setPengumpulan(pengumpulanData.pengumpulan)
      setNilai(pengumpulanData.pengumpulan.nilai?.toString() || '')
      setCatatan(pengumpulanData.pengumpulan.catatan || '')

      // Fetch asesmen data
      const asesmenRes = await fetch(`/api/asesmen/${params.asesmenId}`)
      if (asesmenRes.ok) {
        const asesmenData = await asesmenRes.json()
        setAsesmen(asesmenData.asesmen)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data pengumpulan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNilai = async () => {
    if (!nilai) {
      toast({
        title: "Error",
        description: "Nilai wajib diisi",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/pengumpulan/${params.pengumpulanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nilai: parseFloat(nilai),
          catatan,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: "Berhasil",
        description: "Nilai berhasil disimpan",
      })

      fetchData()
    } catch (error) {
      console.error('Error saving nilai:', error)
      toast({
        title: "Error",
        description: "Gagal menyimpan nilai",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/asesmen/${params.asesmenId}`}>
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
              <div className="space-y-2">
                <Label className="text-muted-foreground">File</Label>
                <div className="flex items-center gap-2">
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

            <Button onClick={handleSaveNilai} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Nilai
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
