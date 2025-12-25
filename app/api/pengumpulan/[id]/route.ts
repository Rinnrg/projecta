import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single pengumpulan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pengumpulan = await prisma.pengumpulanProyek.findUnique({
      where: { id },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            email: true,
            foto: true,
          },
        },
        asesmen: {
          select: {
            id: true,
            nama: true,
            tipe: true,
            tipePengerjaan: true,
          },
        },
      },
    })

    if (!pengumpulan) {
      return NextResponse.json(
        { error: 'Pengumpulan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ pengumpulan })
  } catch (error) {
    console.error('Error fetching pengumpulan:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pengumpulan' },
      { status: 500 }
    )
  }
}

// UPDATE pengumpulan (nilai dan catatan)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nilai, catatan } = body

    // Validate
    if (nilai !== undefined && (nilai < 0 || nilai > 100)) {
      return NextResponse.json(
        { error: 'Nilai harus antara 0-100' },
        { status: 400 }
      )
    }

    const pengumpulan = await prisma.pengumpulanProyek.update({
      where: { id },
      data: {
        ...(nilai !== undefined && { nilai: parseFloat(nilai) }),
        ...(catatan !== undefined && { catatan }),
      },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    })

    // If asesmen exists, also create/update Nilai record
    if (pengumpulan.asesmenId && pengumpulan.siswaId && nilai !== undefined) {
      await prisma.nilai.upsert({
        where: {
          siswaId_asesmenId: {
            siswaId: pengumpulan.siswaId,
            asesmenId: pengumpulan.asesmenId,
          },
        },
        create: {
          skor: parseFloat(nilai),
          siswaId: pengumpulan.siswaId,
          asesmenId: pengumpulan.asesmenId,
        },
        update: {
          skor: parseFloat(nilai),
        },
      })
    }

    return NextResponse.json({ pengumpulan })
  } catch (error) {
    console.error('Error updating pengumpulan:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pengumpulan' },
      { status: 500 }
    )
  }
}

// DELETE pengumpulan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.pengumpulanProyek.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Pengumpulan berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting pengumpulan:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pengumpulan' },
      { status: 500 }
    )
  }
}
