import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    const searchLower = query.toLowerCase()

    // Search in parallel for better performance
    const [courses, materi, asesmen, schedules] = await Promise.all([
      // Search Courses
      prisma.course.findMany({
        where: {
          OR: [
            { judul: { contains: searchLower, mode: 'insensitive' } },
            { kategori: { contains: searchLower, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          judul: true,
          kategori: true,
          gambar: true,
        },
        take: 10,
      }),

      // Search Materi
      prisma.materi.findMany({
        where: {
          OR: [
            { judul: { contains: searchLower, mode: 'insensitive' } },
            { deskripsi: { contains: searchLower, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          judul: true,
          deskripsi: true,
          tgl_unggah: true,
          course: {
            select: {
              id: true,
              judul: true,
              kategori: true,
            },
          },
        },
        take: 10,
        orderBy: {
          tgl_unggah: 'desc',
        },
      }),

      // Search Asesmen
      prisma.asesmen.findMany({
        where: {
          OR: [
            { nama: { contains: searchLower, mode: 'insensitive' } },
            { deskripsi: { contains: searchLower, mode: 'insensitive' } },
          ],
        },
        include: {
          course: {
            select: {
              id: true,
              judul: true,
            },
          },
          _count: {
            select: {
              soal: true,
            },
          },
        },
        take: 10,
      }).then(data => data as any),

      // Search Jadwal/Schedule (Proyek)
      prisma.proyek.findMany({
        where: {
          OR: [
            { judul: { contains: searchLower, mode: 'insensitive' } },
            { deskripsi: { contains: searchLower, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          judul: true,
          deskripsi: true,
          tgl_mulai: true,
          tgl_selesai: true,
          guru: {
            select: {
              nama: true,
            },
          },
        },
        take: 10,
      }),
    ])

    return NextResponse.json({
      results: {
        courses,
        materi,
        asesmen,
        schedules,
      },
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Gagal melakukan pencarian' },
      { status: 500 }
    )
  }
}
