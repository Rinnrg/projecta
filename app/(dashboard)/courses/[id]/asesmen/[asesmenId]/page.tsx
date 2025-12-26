"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Upload, 
  Clock, 
  Calendar,
  User,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Edit,
  Download,
  Plus,
  Loader2,
  Eye,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ 
    id: string
    asesmenId: string
  }>
}

export default function AsesmenDetailPage({ params }: PageProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params)
  const { id: courseId, asesmenId } = resolvedParams
  const [asesmen, setAsesmen] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [studentNilai, setStudentNilai] = useState<any>(null)
  const [studentPengumpulan, setStudentPengumpulan] = useState<any>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Fetch asesmen data
    const fetchAsesmen = async () => {
      try {
        const response = await fetch(`/api/asesmen/${asesmenId}`)
        if (response.ok) {
          const data = await response.json()
          setAsesmen(data.asesmen)
          
          // Jika siswa, fetch status penilaian mereka
          if (user.role === 'SISWA') {
            // Fetch nilai siswa untuk kuis
            const nilaiResponse = await fetch(`/api/nilai?siswaId=${user.id}&asesmenId=${asesmenId}`)
            if (nilaiResponse.ok) {
              const nilaiData = await nilaiResponse.json()
              if (nilaiData.nilai && nilaiData.nilai.length > 0) {
                setStudentNilai(nilaiData.nilai[0])
              }
            }
            
            // Fetch pengumpulan siswa untuk tugas
            const pengumpulanResponse = await fetch(`/api/pengumpulan?siswaId=${user.id}&asesmenId=${asesmenId}`)
            if (pengumpulanResponse.ok) {
              const pengumpulanData = await pengumpulanResponse.json()
              if (pengumpulanData.pengumpulan && pengumpulanData.pengumpulan.length > 0) {
                setStudentPengumpulan(pengumpulanData.pengumpulan[0])
              }
            }
          }
        } else {
          router.push('/courses')
        }
      } catch (error) {
        console.error('Error fetching asesmen:', error)
        router.push('/courses')
      } finally {
        setLoading(false)
      }
    }

    fetchAsesmen()
  }, [user, authLoading, router, asesmenId])

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

  if (!asesmen) {
    return null
  }

  // Check permission
  if (user && user.role === 'GURU' && asesmen.guruId !== user.id) {
    router.push(`/courses/${courseId}`)
    return null
  }

  // Check if student has submitted
  const hasSubmitted = user && user.role === 'SISWA' 
    ? asesmen.pengumpulanProyek?.some((p: any) => p.siswaId === user.id)
    : false

  const isDeadlinePassed = asesmen.tgl_selesai 
    ? new Date(asesmen.tgl_selesai) < new Date() 
    : false

  const isTeacherOrAdmin = user && (user.role === 'GURU' || user.role === 'ADMIN')
  const isStudent = user && user.role === 'SISWA'

  return (
    <div className="container max-w-6xl py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Course
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{asesmen.nama}</h1>
              <Badge variant={asesmen.tipe === 'KUIS' ? 'default' : 'secondary'}>
                {asesmen.tipe === 'KUIS' ? (
                  <><FileText className="mr-1 h-3 w-3" /> Kuis</>
                ) : (
                  <><Upload className="mr-1 h-3 w-3" /> Tugas</>
                )}
              </Badge>
              {isDeadlinePassed && (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" /> Ditutup
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {asesmen.course?.judul} • {asesmen.course?.kategori}
              {asesmen.tipe === 'TUGAS' && asesmen.tipePengerjaan && (
                <> • {asesmen.tipePengerjaan === 'KELOMPOK' ? 'Kelompok' : 'Individu'}</>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {isStudent && asesmen.tipe === 'TUGAS' && (
              <>
                {hasSubmitted ? (
                  <Button 
                    disabled
                    className="bg-green-600 hover:bg-green-600 cursor-not-allowed opacity-90"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Sudah Diserahkan
                  </Button>
                ) : isDeadlinePassed ? (
                  <Button 
                    disabled
                    variant="secondary"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Deadline Terlewat
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/courses/${courseId}/asesmen/${asesmenId}/submit`}>
                      <Upload className="mr-2 h-4 w-4" />
                      Kumpulkan Tugas
                    </Link>
                  </Button>
                )}
              </>
            )}
            {isStudent && asesmen.tipe === 'KUIS' && !isDeadlinePassed && asesmen.soal && asesmen.soal.length > 0 && (
              <Button asChild>
                <Link href={`/courses/${courseId}/asesmen/${asesmenId}/kerjakan`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Kerjakan Kuis
                </Link>
              </Button>
            )}
            {isTeacherOrAdmin && asesmen.tipe === 'KUIS' && (
              <Button asChild>
                <Link href={`/courses/${courseId}/asesmen/${asesmenId}/soal/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Soal
                </Link>
              </Button>
            )}
            {isTeacherOrAdmin && (
              <Button variant="outline" asChild>
                <Link href={`/courses/${courseId}/asesmen/${asesmenId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - For KUIS */}
      {asesmen.tipe === 'KUIS' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Soal</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{asesmen.soal.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durasi</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{asesmen.durasi || 0} menit</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bobot</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {asesmen.soal?.reduce((acc: number, s: any) => acc + (s.bobot || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards - For TUGAS */}
      {asesmen.tipe === 'TUGAS' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipe Pengerjaan</CardTitle>
              {asesmen.tipePengerjaan === 'KELOMPOK' ? (
                <Users className="h-4 w-4 text-muted-foreground" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {asesmen.tipePengerjaan === 'KELOMPOK' ? 'Kelompok' : 'Individu'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dikerjakan secara {asesmen.tipePengerjaan?.toLowerCase()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deadline</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {asesmen.tgl_selesai ? (
                <>
                  <div className="text-2xl font-bold">
                    {new Date(asesmen.tgl_selesai).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(asesmen.tgl_selesai).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </>
              ) : (
                <div className="text-xl font-medium text-muted-foreground">Tidak ada deadline</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Deskripsi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {asesmen.deskripsi || 'Tidak ada deskripsi'}
          </p>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dibuat oleh:</span>
              <span className="ml-2 font-medium">{asesmen.guru.nama}</span>
            </div>
            {asesmen.tgl_mulai && (
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mulai:</span>
                <span className="ml-2 font-medium">
                  {new Date(asesmen.tgl_mulai).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {asesmen.tgl_selesai && (
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Selesai:</span>
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
        </CardContent>
      </Card>

      {/* Lampiran Section */}
      {asesmen.lampiran && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lampiran & Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">
                    {asesmen.lampiran.startsWith('data:') 
                      ? `Lampiran ${asesmen.nama}.${asesmen.lampiran.split(';')[0].split('/')[1]}`
                      : asesmen.lampiran.startsWith('http') ? 'Link External' : 'Lampiran'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {asesmen.lampiran.startsWith('data:') 
                      ? 'File tersimpan (base64)'
                      : asesmen.lampiran.startsWith('http') ? 'Link ke sumber external' : 'Dokumen lampiran'}
                  </p>
                </div>
              </div>
              {asesmen.lampiran.startsWith('data:') ? (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={asesmen.lampiran}
                    download={`lampiran-${asesmen.nama}.${asesmen.lampiran.split(';')[0].split('/')[1]}`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Unduh File
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <a href={asesmen.lampiran} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    {asesmen.lampiran.startsWith('http') ? 'Buka Link' : 'Unduh Lampiran'}
                  </a>
                </Button>
              )}
            </div>

            {/* PDF Preview for base64 PDF */}
            {asesmen.lampiran.startsWith('data:application/pdf') && (
              <div className="border rounded-lg overflow-hidden bg-muted">
                <div className="aspect-[3/4] w-full">
                  <iframe
                    src={asesmen.lampiran}
                    title={`Lampiran ${asesmen.nama}`}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* PDF Preview for URL PDF */}
            {asesmen.lampiran.endsWith('.pdf') && !asesmen.lampiran.startsWith('data:') && (
              <div className="border rounded-lg overflow-hidden bg-muted">
                <div className="aspect-[3/4] w-full">
                  <iframe
                    src={asesmen.lampiran}
                    title={`Lampiran ${asesmen.nama}`}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* YouTube Embed if it's a YouTube link */}
            {asesmen.lampiran && (asesmen.lampiran.includes("youtube.com") || asesmen.lampiran.includes("youtu.be")) && (
              <div className="border rounded-lg overflow-hidden bg-muted">
                <div className="aspect-video w-full">
                  <iframe
                    src={asesmen.lampiran.replace("watch?v=", "embed/")}
                    title={asesmen.nama}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for Teacher/Admin */}
      {isTeacherOrAdmin && (
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">
              <FileText className="mr-2 h-4 w-4" />
              Informasi
            </TabsTrigger>
            <TabsTrigger value="rekap">
              <ClipboardList className="mr-2 h-4 w-4" />
              Rekap Pengumpulan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {/* Nilai Table (For KUIS) */}
            {asesmen.tipe === 'KUIS' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daftar Nilai Siswa</CardTitle>
                </CardHeader>
                <CardContent>
                  {asesmen.nilai.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Belum ada siswa yang mengerjakan kuis
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Siswa</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Nilai</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {asesmen.nilai.map((nilai: any) => (
                          <TableRow key={nilai.id}>
                            <TableCell className="font-medium">{nilai.siswa.nama}</TableCell>
                            <TableCell className="text-muted-foreground">{nilai.siswa.email}</TableCell>
                            <TableCell>
                              <Badge variant={nilai.skor >= 75 ? 'default' : 'secondary'}>
                                {nilai.skor}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(nilai.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              {nilai.skor >= 75 ? (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Lulus
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Belum Lulus
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rekap" className="space-y-4">
            {/* Submissions Table (For TUGAS) */}
            {asesmen.tipe === 'TUGAS' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Rekap Pengumpulan {asesmen.tipePengerjaan === 'KELOMPOK' ? '(Kelompok)' : '(Individu)'}
                  </CardTitle>
                  <CardDescription>
                    Daftar siswa yang telah mengumpulkan tugas beserta nilainya
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {asesmen.pengumpulanProyek && asesmen.pengumpulanProyek.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Belum ada siswa yang mengumpulkan tugas
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {asesmen.tipePengerjaan === 'KELOMPOK' ? 'Nama Kelompok' : 'Nama Siswa'}
                          </TableHead>
                          {asesmen.tipePengerjaan === 'KELOMPOK' && (
                            <>
                              <TableHead>Ketua</TableHead>
                              <TableHead>Anggota</TableHead>
                            </>
                          )}
                          <TableHead>Tanggal Upload</TableHead>
                          <TableHead>Nilai</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {asesmen.pengumpulanProyek && asesmen.pengumpulanProyek.map((pengumpulan: any) => (
                          <TableRow key={pengumpulan.id}>
                            <TableCell>
                              {asesmen.tipePengerjaan === 'KELOMPOK' && (
                                <div className="font-medium">{pengumpulan.namaKelompok || '-'}</div>
                              )}
                              {asesmen.tipePengerjaan === 'INDIVIDU' && pengumpulan.siswa && (
                                <div className="flex items-center gap-2">
                                  <div>
                                    <div className="font-medium">{pengumpulan.siswa.nama}</div>
                                    <div className="text-sm text-muted-foreground">{pengumpulan.siswa.email}</div>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            {asesmen.tipePengerjaan === 'KELOMPOK' && (
                              <>
                                <TableCell>{pengumpulan.ketua || '-'}</TableCell>
                                <TableCell>{pengumpulan.anggota || '-'}</TableCell>
                              </>
                            )}
                            <TableCell>
                              {new Date(pengumpulan.tgl_unggah).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell>
                              {pengumpulan.nilai ? (
                                <Badge variant={pengumpulan.nilai >= 75 ? 'default' : 'secondary'}>
                                  {pengumpulan.nilai}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Belum dinilai</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/asesmen/${asesmen.id}/pengumpulan/${pengumpulan.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat Detail
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Nilai Stats for KUIS */}
            {asesmen.tipe === 'KUIS' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rekap Nilai Kuis</CardTitle>
                  <CardDescription>
                    Ringkasan nilai siswa yang sudah mengerjakan kuis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {asesmen.nilai.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Belum ada siswa yang mengerjakan kuis
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{asesmen.nilai.length}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Nilai Tertinggi</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {Math.max(...asesmen.nilai.map((n: any) => n.skor))}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Nilai Terendah</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {Math.min(...asesmen.nilai.map((n: any) => n.skor))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Siswa</TableHead>
                            <TableHead>Nilai</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tanggal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {asesmen.nilai.map((nilai: any) => (
                            <TableRow key={nilai.id}>
                              <TableCell className="font-medium">{nilai.siswa.nama}</TableCell>
                              <TableCell>
                                <Badge variant={nilai.skor >= 75 ? 'default' : 'secondary'}>
                                  {nilai.skor}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {nilai.skor >= 75 ? (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Lulus
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Belum Lulus
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(nilai.tanggal).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Status Penilaian untuk Siswa */}
      {isStudent && (studentNilai || studentPengumpulan) && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Status Penilaian
            </CardTitle>
            <CardDescription>
              Informasi mengenai penilaian {asesmen.tipe === 'KUIS' ? 'kuis' : 'tugas'} Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status untuk KUIS */}
            {asesmen.tipe === 'KUIS' && studentNilai && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tanggal Pengerjaan</p>
                    <p className="font-medium">
                      {new Date(studentNilai.tanggal).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Nilai Anda</p>
                    <div className="text-3xl font-bold">
                      <Badge 
                        variant={studentNilai.skor >= 75 ? 'default' : 'secondary'}
                        className="text-xl px-4 py-2"
                      >
                        {studentNilai.skor}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {studentNilai.skor >= 75 ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-green-700">Selamat! Anda Lulus</p>
                          <p className="text-sm text-muted-foreground">
                            Nilai Anda memenuhi standar kelulusan (≥75)
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-orange-700">Belum Lulus</p>
                          <p className="text-sm text-muted-foreground">
                            Nilai Anda belum memenuhi standar kelulusan (≥75)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status untuk TUGAS */}
            {asesmen.tipe === 'TUGAS' && studentPengumpulan && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted rounded-lg space-y-1">
                    <p className="text-sm text-muted-foreground">Tanggal Pengumpulan</p>
                    <p className="font-medium">
                      {new Date(studentPengumpulan.tgl_unggah).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg space-y-1">
                    <p className="text-sm text-muted-foreground">Status Pengumpulan</p>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Sudah Dikumpulkan
                    </Badge>
                  </div>
                </div>

                {studentPengumpulan.namaKelompok && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">Informasi Kelompok</p>
                    <div className="space-y-1">
                      <p className="font-medium">Nama Kelompok: {studentPengumpulan.namaKelompok}</p>
                      {studentPengumpulan.ketua && (
                        <p className="text-sm">Ketua: {studentPengumpulan.ketua}</p>
                      )}
                      {studentPengumpulan.anggota && (
                        <p className="text-sm">Anggota: {studentPengumpulan.anggota}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status Penilaian</p>
                      {studentPengumpulan.nilai !== null && studentPengumpulan.nilai !== undefined ? (
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Nilai Anda:</p>
                            <Badge 
                              variant={studentPengumpulan.nilai >= 75 ? 'default' : 'secondary'}
                              className="text-xl px-4 py-2"
                            >
                              {studentPengumpulan.nilai}
                            </Badge>
                          </div>
                          <div className="flex items-start gap-2">
                            {studentPengumpulan.nilai >= 75 ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                                <div>
                                  <p className="font-medium text-green-700">Lulus</p>
                                  <p className="text-xs text-muted-foreground">
                                    Nilai memenuhi standar
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-5 w-5 text-orange-500 mt-1" />
                                <div>
                                  <p className="font-medium text-orange-700">Belum Lulus</p>
                                  <p className="text-xs text-muted-foreground">
                                    Nilai belum memenuhi standar
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-blue-700">Menunggu Penilaian</p>
                            <p className="text-sm text-muted-foreground">
                              Tugas Anda sedang dalam proses penilaian oleh guru
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {studentPengumpulan.catatan && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Catatan dari Guru
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {studentPengumpulan.catatan}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

