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
    const { 
      nama, 
      deskripsi, 
      tipe,
      tipePengerjaan,
      jml_soal, 
      durasi, 
      tgl_mulai,
      tgl_selesai,
      lampiran,
      courseId 
    } = body

    // Validate dates if provided
    let startDate = null
    let endDate = null
    
    if (tgl_mulai) {
      startDate = new Date(tgl_mulai)
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Format tanggal mulai tidak valid' },
          { status: 400 }
        )
      }
    }

    if (tgl_selesai) {
      endDate = new Date(tgl_selesai)
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Format tanggal selesai tidak valid' },
          { status: 400 }
        )
      }
      
      if (startDate && endDate < startDate) {
        return NextResponse.json(
          { error: 'Tanggal selesai harus setelah tanggal mulai' },
          { status: 400 }
        )
      }
    }

    const asesmen = await prisma.asesmen.update({
      where: { id: params.id },
      data: {
        ...(nama && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(tipe && { tipe }),
        ...(tipePengerjaan !== undefined && { tipePengerjaan }),
        ...(jml_soal !== undefined && { jml_soal }),
        ...(durasi !== undefined && { durasi }),
        ...(tgl_mulai !== undefined && { tgl_mulai: startDate }),
        ...(tgl_selesai !== undefined && { tgl_selesai: endDate }),
        ...(lampiran !== undefined && { lampiran }),
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
