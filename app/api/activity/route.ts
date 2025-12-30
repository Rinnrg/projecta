import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId dan role diperlukan' },
        { status: 400 }
      )
    }

    const activities: any[] = []

    if (role === 'SISWA') {
      // Optimized: Execute all queries in parallel using Promise.all with select
      const [recentNilai, recentProjects, recentEnrollments] = await Promise.all([
        prisma.nilai.findMany({
          where: { siswaId: userId },
          select: {
            tanggal: true,
            skor: true,
            asesmen: {
              select: {
                nama: true,
                course: {
                  select: {
                    judul: true
                  }
                }
              }
            }
          },
          orderBy: { tanggal: 'desc' },
          take: 5
        }),
        prisma.pengumpulanProyek.findMany({
          where: {
            kelompok: {
              anggota: {
                some: {
                  siswaId: userId
                }
              }
            }
          },
          select: {
            tgl_unggah: true,
            nilai: true,
            kelompok: {
              select: {
                nama: true,
                proyek: {
                  select: {
                    judul: true
                  }
                }
              }
            }
          },
          orderBy: { tgl_unggah: 'desc' },
          take: 5
        }),
        prisma.enrollment.findMany({
          where: { siswaId: userId },
          select: {
            enrolledAt: true,
            progress: true,
            course: {
              select: {
                judul: true
              }
            }
          },
          orderBy: { enrolledAt: 'desc' },
          take: 3
        })
      ])

      recentNilai.forEach(n => {
        activities.push({
          action: 'completed',
          item: n.asesmen.nama,
          course: n.asesmen.course.judul,
          time: n.tanggal.toISOString(),
          type: 'quiz',
          score: n.skor
        })
      })

      recentProjects.forEach(p => {
        activities.push({
          action: 'submitted',
          item: p.kelompok.proyek.judul,
          group: p.kelompok.nama,
          time: p.tgl_unggah.toISOString(),
          type: 'assignment',
          score: p.nilai
        })
      })

      recentEnrollments.forEach(e => {
        activities.push({
          action: 'enrolled',
          item: e.course.judul,
          time: e.enrolledAt.toISOString(),
          type: 'course',
          progress: e.progress
        })
      })
    } else if (role === 'GURU') {
      // Optimized: Execute all queries in parallel using Promise.all with select
      const [recentCourses, recentAsesmen, recentProjects, recentGrades] = await Promise.all([
        prisma.course.findMany({
          where: { guruId: userId },
          select: {
            judul: true,
            id: true,
          },
          orderBy: { id: 'desc' },
          take: 3
        }),
        prisma.asesmen.findMany({
          where: { guruId: userId },
          select: {
            nama: true,
            course: {
              select: {
                judul: true
              }
            }
          },
          orderBy: { id: 'desc' },
          take: 3
        }),
        prisma.proyek.findMany({
          where: { guruId: userId },
          select: {
            judul: true,
            tgl_mulai: true,
          },
          orderBy: { tgl_mulai: 'desc' },
          take: 3
        }),
        prisma.pengumpulanProyek.findMany({
          where: {
            kelompok: {
              proyek: {
                guruId: userId
              }
            },
            nilai: {
              not: null
            }
          },
          select: {
            tgl_unggah: true,
            nilai: true,
            kelompok: {
              select: {
                nama: true,
                proyek: {
                  select: {
                    judul: true
                  }
                },
              }
            }
          },
          orderBy: { tgl_unggah: 'desc' },
          take: 3
        })
      ])

      recentCourses.forEach(c => {
        activities.push({
          action: 'created',
          item: c.judul,
          time: new Date().toISOString(), // Since there's no createdAt field
          type: 'course'
        })
      })

      recentAsesmen.forEach(a => {
        activities.push({
          action: 'created',
          item: a.nama,
          course: a.course.judul,
          time: new Date().toISOString(),
          type: 'assessment'
        })
      })

      recentProjects.forEach(p => {
        activities.push({
          action: 'created',
          item: p.judul,
          time: p.tgl_mulai.toISOString(),
          type: 'project'
        })
      })

      recentGrades.forEach(g => {
        activities.push({
          action: 'graded',
          item: g.kelompok.proyek.judul,
          group: g.kelompok.nama,
          time: g.tgl_unggah.toISOString(),
          type: 'grade',
          score: g.nilai
        })
      })
    }

    // Sort by time descending
    activities.sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    )

    // Limit results
    const limitedActivities = activities.slice(0, limit)

    return NextResponse.json({ activities: limitedActivities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil aktivitas' },
      { status: 500 }
    )
  }
}
