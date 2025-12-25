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
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Edit,
  Download,
  Plus,
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ 
    id: string
    asesmenId: string
  }>
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
  const { id: courseId, asesmenId } = await params
  const user = await getUser()

  const asesmen = await prisma.asesmen.findUnique({
    where: { id: asesmenId },
    include: {
      guru: {
        select: {
          nama: true,
          email: true,
        },
      },
      course: {
        select: {
          id: true,
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
      pengumpulanProyek: {
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
        where: {
          asesmenId: asesmenId,
        },
        orderBy: {
          tgl_unggah: 'desc',
        },
      },
    },
  })

  if (!asesmen || asesmen.courseId !== courseId) {
    notFound()
  }

  // Check permission
  if (user.role === 'GURU' && asesmen.guruId !== user.id) {
    redirect(`/courses/${courseId}`)
  }

  // Check if student has submitted
  const hasSubmitted = user.role === 'SISWA' 
    ? asesmen.pengumpulanProyek.some(p => p.siswaId === user.id)
    : false

  const isDeadlinePassed = asesmen.tgl_selesai 
    ? new Date(asesmen.tgl_selesai) < new Date() 
    : false

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
              {asesmen.course.judul} • {asesmen.course.kategori}
              {asesmen.tipe === 'TUGAS' && asesmen.tipePengerjaan && (
                <> • {asesmen.tipePengerjaan === 'KELOMPOK' ? 'Kelompok' : 'Individu'}</>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {user.role === 'SISWA' && asesmen.tipe === 'TUGAS' && !isDeadlinePassed && (
              <Button asChild>
                <Link href={`/courses/${courseId}/asesmen/${asesmenId}/submit`}>
                  <Upload className="mr-2 h-4 w-4" />
                  {hasSubmitted ? 'Edit Pengumpulan' : 'Kumpulkan Tugas'}
                </Link>
              </Button>
            )}
            {user.role === 'SISWA' && asesmen.tipe === 'KUIS' && !isDeadlinePassed && asesmen.soal.length > 0 && (
              <Button asChild>
                <Link href={`/courses/${courseId}/asesmen/${asesmenId}/kerjakan`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Kerjakan Kuis
                </Link>
              </Button>
            )}
            {(user.role === 'GURU' || user.role === 'ADMIN') && asesmen.tipe === 'KUIS' && (
              <Button asChild>
                <Link href={`/courses/${courseId}/asesmen/${asesmenId}/soal/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Soal
                </Link>
              </Button>
            )}
            {(user.role === 'GURU' || user.role === 'ADMIN') && (
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
                {asesmen.soal.reduce((acc: number, s) => acc + s.bobot, 0)}
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

      {/* Nilai Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengumpulan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asesmen.nilai.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {asesmen.nilai.length > 0
                ? (asesmen.nilai.reduce((acc: number, n) => acc + n.skor, 0) / asesmen.nilai.length).toFixed(1)
                : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

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

          {asesmen.lampiran && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Lampiran</h4>
                <Button variant="outline" size="sm" asChild>
                  <a href={asesmen.lampiran} download>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Lampiran
                  </a>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submissions Table (For Teachers/Admin - TUGAS) */}
      {(user.role === 'GURU' || user.role === 'ADMIN') && asesmen.tipe === 'TUGAS' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Siswa yang telah mengumpulkan tugas {asesmen.tipePengerjaan === 'KELOMPOK' ? '(Kelompok)' : '(Individu)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {asesmen.pengumpulanProyek.length === 0 ? (
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
                  {asesmen.pengumpulanProyek.map((pengumpulan: any) => (
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
                        })}
                      </TableCell>
                      <TableCell>
                        {pengumpulan.nilai ? (
                          <Badge variant="secondary">{pengumpulan.nilai}</Badge>
                        ) : (
                          <Badge variant="outline">Belum dinilai</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/asesmen/${asesmen.id}/pengumpulan/${pengumpulan.id}`}>
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

      {/* Nilai Table (For Teachers/Admin - KUIS) */}
      {(user.role === 'GURU' || user.role === 'ADMIN') && asesmen.tipe === 'KUIS' && (
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
    </div>
  )
}
