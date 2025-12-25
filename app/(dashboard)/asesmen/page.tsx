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
import { 
  FileText, 
  Upload, 
  Clock, 
  Calendar,
  Users,
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

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

export default async function AsesmenPage() {
  const user = await getUser()

  // Get all asesmen based on user role
  const asesmen = await prisma.asesmen.findMany({
    where: user.role === 'GURU' ? { guruId: user.id } : {},
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
      _count: {
        select: {
          soal: true,
          nilai: true,
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  })

  return (
    <div className="container py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Manajemen Asesmen</h1>
          <p className="text-muted-foreground">
            Kelola kuis dan tugas untuk siswa
          </p>
        </div>
        {(user.role === 'GURU' || user.role === 'ADMIN') && (
          <Button asChild>
            <Link href="/courses">
              <Plus className="mr-2 h-4 w-4" />
              Buat Asesmen
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asesmen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asesmen.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {asesmen.filter(a => a.tipe === 'KUIS').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {asesmen.filter(a => a.tipe === 'TUGAS').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengumpulan</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {asesmen.reduce((acc, a) => acc + a._count.nilai, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asesmen List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Asesmen</CardTitle>
          <CardDescription>
            Semua kuis dan tugas yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {asesmen.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Belum ada asesmen</h3>
              <p className="text-muted-foreground mt-2">
                {user.role === 'GURU' || user.role === 'ADMIN' 
                  ? 'Buat asesmen pertama Anda untuk memulai'
                  : 'Tidak ada asesmen yang tersedia saat ini'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Pengumpulan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asesmen.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nama}</div>
                          {item.deskripsi && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {item.deskripsi}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.tipe === 'KUIS' ? 'default' : 'secondary'}>
                          {item.tipe === 'KUIS' ? (
                            <><FileText className="mr-1 h-3 w-3" /> Kuis</>
                          ) : (
                            <><Upload className="mr-1 h-3 w-3" /> Tugas</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.course.judul}</div>
                          <div className="text-muted-foreground">{item.course.kategori}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.tipe === 'KUIS' ? (
                          <div className="flex items-center text-sm">
                            <FileText className="mr-1 h-3 w-3" />
                            {item._count.soal} soal
                          </div>
                        ) : (
                          <div className="flex items-center text-sm">
                            {item.tipePengerjaan === 'KELOMPOK' ? (
                              <><Users className="mr-1 h-3 w-3" /> Kelompok</>
                            ) : (
                              <><User className="mr-1 h-3 w-3" /> Individu</>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.tipe === 'KUIS' && item.durasi ? (
                          <div className="flex items-center text-sm">
                            <Clock className="mr-1 h-3 w-3" />
                            {item.durasi} menit
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.tgl_selesai ? (
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(item.tgl_selesai).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(item.tgl_selesai).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Users className="mr-1 h-3 w-3" />
                          {item._count.nilai}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/asesmen/${item.id}`}>
                            Detail
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
    </div>
  )
}
