import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { namaKelompok, ketua, anggota, fileUrl, catatan, siswaId } = body

    if (!siswaId) {
      return NextResponse.json(
        { error: 'Siswa ID diperlukan' },
        { status: 400 }
      )
    }

    // Check if asesmen exists
    const asesmen = await prisma.asesmen.findUnique({
      where: { id },
    })

    if (!asesmen) {
      return NextResponse.json(
        { error: 'Asesmen tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if it's a TUGAS
    if (asesmen.tipe !== 'TUGAS') {
      return NextResponse.json(
        { error: 'Hanya tugas yang bisa dikumpulkan' },
        { status: 400 }
      )
    }

    // Check deadline
    if (asesmen.tgl_selesai && new Date(asesmen.tgl_selesai) < new Date()) {
      return NextResponse.json(
        { error: 'Deadline pengumpulan sudah lewat' },
        { status: 400 }
      )
    }

    // Check if already submitted
    const existingSubmission = await prisma.pengumpulanProyek.findFirst({
      where: {
        asesmenId: id,
        siswaId,
      },
    })

    let pengumpulan

    if (existingSubmission) {
      // Update existing submission
      pengumpulan = await prisma.pengumpulanProyek.update({
        where: { id: existingSubmission.id },
        data: {
          namaKelompok,
          ketua,
          anggota,
          fileUrl: fileUrl || existingSubmission.fileUrl,
          catatan,
        },
      })
    } else {
      // Create new submission
      pengumpulan = await prisma.pengumpulanProyek.create({
        data: {
          namaKelompok,
          ketua,
          anggota,
          fileUrl,
          catatan,
          siswaId,
          asesmenId: id,
        },
      })
    }

    return NextResponse.json({ pengumpulan }, { status: 200 })
  } catch (error) {
    console.error('Error submitting task:', error)
    return NextResponse.json(
      { error: 'Gagal mengumpulkan tugas' },
      { status: 500 }
    )
  }
}
