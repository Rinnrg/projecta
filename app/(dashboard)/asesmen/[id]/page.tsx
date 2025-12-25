import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Edit,
  Download,
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  if (!userId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return user
}

export default async function AsesmenDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUser()

  const asesmen = await prisma.asesmen.findUnique({
    where: { id },
    include: {
      guru: {
        select: {
          nama: true,
          email: true,
        },
      },
      course: {
        select: {
          judul: true,
          kategori: true,
        },
      },
      soal: {
        include: {
          opsi: true,
        },
      },
      nilai: {
        include: {
          siswa: {
            select: {
              id: true,
              nama: true,
              email: true,
              foto: true,
            },
          },
        },
        orderBy: {
          tanggal: 'desc',
        },
      },
    },
  })

  if (!asesmen) {
    notFound()
  }

  // Check permission
  if (user.role === 'GURU' && asesmen.guruId !== user.id) {
    redirect('/asesmen')
  }

  const isDeadlinePassed = asesmen.tgl_selesai 
    ? new Date(asesmen.tgl_selesai) < new Date() 
    : false

  return (
    <div className="container max-w-6xl py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/asesmen">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Asesmen
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
              {isDeadlinePassed && asesmen.tipe === 'TUGAS' && (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" /> Ditutup
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {asesmen.course.judul} • {asesmen.course.kategori}
            </p>
          </div>
          {(user.role === 'GURU' || user.role === 'ADMIN') && (
            <Button variant="outline" asChild>
              <Link href={`/asesmen/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Soal</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asesmen.jml_soal}</div>
            <p className="text-xs text-muted-foreground">
              {asesmen.soal.length} soal sudah dibuat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durasi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asesmen.durasi}</div>
            <p className="text-xs text-muted-foreground">menit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengumpulan</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asesmen.nilai.length}</div>
            <p className="text-xs text-muted-foreground">siswa telah mengumpulkan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {asesmen.nilai.length > 0
                ? (asesmen.nilai.reduce((acc, n) => acc + n.skor, 0) / asesmen.nilai.length).toFixed(1)
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">dari 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Description & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Deskripsi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {asesmen.deskripsi || 'Tidak ada deskripsi'}
          </p>
          
          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
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
                      month: 'short',
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
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="ml-2 font-medium">
                    {new Date(asesmen.tgl_selesai).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>

            {asesmen.lampiran && (
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Lampiran:</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={asesmen.lampiran} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {(user.role === 'GURU' || user.role === 'ADMIN') && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengumpulan</CardTitle>
            <CardDescription>
              Siswa yang telah mengumpulkan {asesmen.tipe === 'KUIS' ? 'kuis' : 'tugas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {asesmen.nilai.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Belum ada pengumpulan</h3>
                <p className="text-muted-foreground mt-2">
                  Tidak ada siswa yang telah mengumpulkan {asesmen.tipe === 'KUIS' ? 'kuis' : 'tugas'} ini
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tanggal Pengumpulan</TableHead>
                      <TableHead>Nilai</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asesmen.nilai.map((nilai) => (
                      <TableRow key={nilai.id}>
                        <TableCell className="font-medium">
                          {nilai.siswa.nama}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {nilai.siswa.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(nilai.tanggal).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold">{nilai.skor}</span>
                        </TableCell>
                        <TableCell>
                          {nilai.skor >= 75 ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Lulus
                            </Badge>
                          ) : nilai.skor >= 60 ? (
                            <Badge variant="secondary">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Cukup
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Tidak Lulus
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/asesmen/${id}/nilai/${nilai.id}`}>
                              Lihat Detail
                            </Link>
                          </Button>
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

      {/* Soal List (for KUIS) */}
      {asesmen.tipe === 'KUIS' && (user.role === 'GURU' || user.role === 'ADMIN') && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Soal</CardTitle>
              <CardDescription>
                Soal-soal dalam kuis ini
              </CardDescription>
            </div>
            {asesmen.soal.length < asesmen.jml_soal && (
              <Button asChild>
                <Link href={`/asesmen/${id}/soal/new`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Tambah Soal
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {asesmen.soal.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Belum ada soal</h3>
                <p className="text-muted-foreground mt-2">
                  Tambahkan soal untuk kuis ini
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/asesmen/${id}/soal/new`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Tambah Soal Pertama
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {asesmen.soal.map((soal, index) => (
                  <Card key={soal.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            Soal {index + 1}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {soal.pertanyaan}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Bobot: {soal.bobot}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {soal.opsi.map((opsi, opsiIndex) => (
                          <div 
                            key={opsi.id}
                            className={`p-3 rounded-lg border ${
                              opsi.isBenar 
                                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {String.fromCharCode(65 + opsiIndex)}.
                              </span>
                              <span>{opsi.teks}</span>
                              {opsi.isBenar && (
                                <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
