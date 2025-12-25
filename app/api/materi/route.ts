import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const materi = await prisma.materi.findMany({
      where: courseId ? { courseId } : {},
      include: {
        course: {
          select: {
            id: true,
            judul: true,
            guru: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
      orderBy: {
        tgl_unggah: 'desc',
      },
    })

    return NextResponse.json({ materi })
  } catch (error) {
    console.error('Error fetching materi:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data materi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { judul, deskripsi, lampiran, courseId } = body

    if (!judul || !courseId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const materi = await prisma.materi.create({
      data: {
        judul,
        deskripsi,
        lampiran,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
    })

    return NextResponse.json({ materi }, { status: 201 })
  } catch (error) {
    console.error('Error creating materi:', error)
    return NextResponse.json(
      { error: 'Gagal membuat materi' },
      { status: 500 }
    )
  }
}
