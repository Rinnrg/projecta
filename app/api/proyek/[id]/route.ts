import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single proyek by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proyek = await prisma.proyek.findUnique({
      where: { id: params.id },
      include: {
        guru: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        kelompok: {
          include: {
            anggota: {
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
            },
            pengumpulan: true,
          },
        },
      },
    })

    if (!proyek) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ proyek })
  } catch (error) {
    console.error('Error fetching proyek:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data proyek' },
      { status: 500 }
    )
  }
}

// UPDATE proyek
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { judul, deskripsi, tgl_mulai, tgl_selesai, lampiran } = body

    const proyek = await prisma.proyek.update({
      where: { id: params.id },
      data: {
        ...(judul && { judul }),
        ...(deskripsi && { deskripsi }),
        ...(tgl_mulai && { tgl_mulai: new Date(tgl_mulai) }),
        ...(tgl_selesai && { tgl_selesai: new Date(tgl_selesai) }),
        ...(lampiran !== undefined && { lampiran }),
      },
      include: {
        guru: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ proyek })
  } catch (error) {
    console.error('Error updating proyek:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate proyek' },
      { status: 500 }
    )
  }
}

// DELETE proyek
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.proyek.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Proyek berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting proyek:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus proyek' },
      { status: 500 }
    )
  }
}
