import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single asesmen by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asesmen = await prisma.asesmen.findUnique({
      where: { id: params.id },
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
        nilai: {
          include: {
            siswa: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!asesmen) {
      return NextResponse.json(
        { error: 'Asesmen tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ asesmen })
  } catch (error) {
    console.error('Error fetching asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data asesmen' },
      { status: 500 }
    )
  }
}

// UPDATE asesmen
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nama, deskripsi, jml_soal, durasi, courseId } = body

    const asesmen = await prisma.asesmen.update({
      where: { id: params.id },
      data: {
        ...(nama && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(jml_soal && { jml_soal }),
        ...(durasi && { durasi }),
        ...(courseId && { courseId }),
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

    return NextResponse.json({ asesmen })
  } catch (error) {
    console.error('Error updating asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate asesmen' },
      { status: 500 }
    )
  }
}

// DELETE asesmen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.asesmen.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Asesmen berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus asesmen' },
      { status: 500 }
    )
  }
}
