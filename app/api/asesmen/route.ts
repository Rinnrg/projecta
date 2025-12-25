import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const asesmen = await prisma.asesmen.findMany({
      where: courseId ? { courseId } : {},
      include: {
        guru: {
          select: {
            id: true,
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
        _count: {
          select: {
            nilai: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    })

    return NextResponse.json({ asesmen })
  } catch (error) {
    console.error('Error fetching asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data asesmen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, deskripsi, jml_soal, durasi, guruId, courseId } = body

    if (!nama || !jml_soal || !durasi || !guruId || !courseId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const asesmen = await prisma.asesmen.create({
      data: {
        nama,
        deskripsi,
        jml_soal,
        durasi,
        guruId,
        courseId,
      },
      include: {
        guru: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
    })

    return NextResponse.json({ asesmen }, { status: 201 })
  } catch (error) {
    console.error('Error creating asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal membuat asesmen' },
      { status: 500 }
    )
  }
}
