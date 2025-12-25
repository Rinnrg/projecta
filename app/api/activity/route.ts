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
      // Get recent nilai (assessment submissions)
      const recentNilai = await prisma.nilai.findMany({
        where: { siswaId: userId },
        include: {
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
      })

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

      // Get recent project submissions
      const recentProjects = await prisma.pengumpulanProyek.findMany({
        where: {
          kelompok: {
            anggota: {
              some: {
                siswaId: userId
              }
            }
          }
        },
        include: {
          kelompok: {
            include: {
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

      // Get recent enrollments
      const recentEnrollments = await prisma.enrollment.findMany({
        where: { siswaId: userId },
        include: {
          course: {
            select: {
              judul: true
            }
          }
        },
        orderBy: { enrolledAt: 'desc' },
        take: 3
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
      // Get recently created courses
      const recentCourses = await prisma.course.findMany({
        where: { guruId: userId },
        orderBy: { id: 'desc' },
        take: 3
      })

      recentCourses.forEach(c => {
        activities.push({
          action: 'created',
          item: c.judul,
          time: new Date().toISOString(), // Since there's no createdAt field
          type: 'course'
        })
      })

      // Get recently created assessments
      const recentAsesmen = await prisma.asesmen.findMany({
        where: { guruId: userId },
        include: {
          course: {
            select: {
              judul: true
            }
          }
        },
        orderBy: { id: 'desc' },
        take: 3
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

      // Get recently created projects
      const recentProjects = await prisma.proyek.findMany({
        where: { guruId: userId },
        orderBy: { tgl_mulai: 'desc' },
        take: 3
      })

      recentProjects.forEach(p => {
        activities.push({
          action: 'created',
          item: p.judul,
          time: p.tgl_mulai.toISOString(),
          type: 'project'
        })
      })

      // Get recent graded submissions
      const recentGrades = await prisma.pengumpulanProyek.findMany({
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
        include: {
          kelompok: {
            include: {
              proyek: {
                select: {
                  judul: true
                }
              },
              anggota: {
                include: {
                  siswa: {
                    select: {
                      nama: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { tgl_unggah: 'desc' },
        take: 3
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
