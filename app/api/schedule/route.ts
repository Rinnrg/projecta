import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId dan role diperlukan' },
        { status: 400 }
      )
    }

    const today = new Date()
    const scheduleEvents: any[] = []

    if (role === 'SISWA') {
      // Get enrolled courses
      const enrollments = await prisma.enrollment.findMany({
        where: { siswaId: userId },
        select: { courseId: true }
      })
      const courseIds = enrollments.map(e => e.courseId)

      // Get upcoming assessments from enrolled courses
      const asesmen = await prisma.asesmen.findMany({
        where: {
          courseId: { in: courseIds }
        },
        include: {
          course: {
            select: {
              judul: true
            }
          }
        }
      })

      // Get projects where student is a member
      const anggotaKelompok = await prisma.anggotaKelompok.findMany({
        where: { siswaId: userId },
        include: {
          kelompok: {
            include: {
              proyek: true
            }
          }
        }
      })

      // Add assessments to schedule
      asesmen.forEach(a => {
        // Use actual deadline if available, otherwise skip
        if (a.tgl_selesai) {
          scheduleEvents.push({
            id: `asesmen-${a.id}`,
            title: a.nama,
            type: 'assessment',
            date: a.tgl_selesai.toISOString(),
            description: a.deskripsi || (a.tipe === 'KUIS' ? `${a.jml_soal || 0} soal, ${a.durasi || 0} menit` : 'Tugas'),
            course: a.course.judul,
            courseId: a.courseId,
            status: a.tgl_selesai < today ? 'overdue' : (a.tgl_mulai && a.tgl_mulai <= today ? 'ongoing' : 'upcoming')
          })
        }
      })

      // Add projects to schedule
      anggotaKelompok.forEach(ak => {
        if (ak.kelompok.proyek.tgl_selesai >= today) {
          scheduleEvents.push({
            id: `proyek-${ak.kelompok.proyek.id}`,
            title: ak.kelompok.proyek.judul,
            type: 'project',
            date: ak.kelompok.proyek.tgl_selesai.toISOString(),
            description: ak.kelompok.proyek.deskripsi,
            group: ak.kelompok.nama,
            status: ak.kelompok.proyek.tgl_mulai <= today ? 'ongoing' : 'upcoming'
          })
        }
      })
    } else if (role === 'GURU') {
      // Get assessments created by teacher
      const asesmen = await prisma.asesmen.findMany({
        where: { guruId: userId },
        include: {
          course: {
            select: {
              judul: true
            }
          }
        }
      })

      // Get projects created by teacher
      const proyeks = await prisma.proyek.findMany({
        where: { guruId: userId }
      })

      // Add assessments to schedule
      asesmen.forEach(a => {
        // Use actual deadline if available, otherwise skip
        if (a.tgl_selesai) {
          scheduleEvents.push({
            id: `asesmen-${a.id}`,
            title: a.nama,
            type: 'assessment',
            date: a.tgl_selesai.toISOString(),
            description: a.deskripsi || (a.tipe === 'KUIS' ? `${a.jml_soal || 0} soal, ${a.durasi || 0} menit` : 'Tugas'),
            course: a.course.judul,
            courseId: a.courseId,
            status: a.tgl_selesai < today ? 'overdue' : (a.tgl_mulai && a.tgl_mulai <= today ? 'ongoing' : 'upcoming')
          })
        }
      })

      // Add projects to schedule
      proyeks.forEach(p => {
        if (p.tgl_selesai >= today) {
          scheduleEvents.push({
            id: `proyek-${p.id}`,
            title: p.judul,
            type: 'project',
            date: p.tgl_selesai.toISOString(),
            description: p.deskripsi,
            status: p.tgl_mulai <= today ? 'ongoing' : 'upcoming'
          })
        }
      })
    }

    // Sort by date
    scheduleEvents.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json({ schedule: scheduleEvents })
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil jadwal' },
      { status: 500 }
    )
  }
}
