import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const userId = searchParams.get('userId')

    if (!query) {
      return NextResponse.json({ results: {} })
    }

    const searchLower = query.toLowerCase()

    // Search in parallel for better performance
    const [courses, materi, asesmen, schedules, users, projects] = await Promise.all([
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
          guru: {
            select: {
              nama: true,
            },
          },
        },
        take: 15,
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
          fileType: true,
          course: {
            select: {
              id: true,
              judul: true,
              kategori: true,
            },
          },
        },
        take: 15,
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
        select: {
          id: true,
          nama: true,
          deskripsi: true,
          tipe: true,
          tgl_mulai: true,
          tgl_selesai: true,
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
        take: 15,
      }),

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
        take: 15,
      }),

      // Search Users (only if userId is provided for permission check)
      userId ? prisma.user.findMany({
        where: {
          OR: [
            { nama: { contains: searchLower, mode: 'insensitive' } },
            { email: { contains: searchLower, mode: 'insensitive' } },
            { username: { contains: searchLower, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          nama: true,
          email: true,
          username: true,
          role: true,
          foto: true,
        },
        take: 10,
      }) : Promise.resolve([]),

      // Search Projects/Pengumpulan
      userId ? prisma.pengumpulanProyek.findMany({
        where: {
          OR: [
            { catatan: { contains: searchLower, mode: 'insensitive' } },
            { namaKelompok: { contains: searchLower, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          catatan: true,
          namaKelompok: true,
          nilai: true,
          tgl_unggah: true,
          kelompok: {
            select: {
              proyek: {
                select: {
                  judul: true,
                },
              },
            },
          },
          asesmen: {
            select: {
              nama: true,
              course: {
                select: {
                  judul: true,
                },
              },
            },
          },
        },
        take: 10,
        orderBy: {
          tgl_unggah: 'desc',
        },
      }) : Promise.resolve([]),
    ])

    return NextResponse.json({
      results: {
        courses,
        materi,
        asesmen,
        schedules,
        users,
        projects,
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
