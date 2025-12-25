import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { siswaId, answers, skor } = body

    if (!siswaId || typeof skor !== 'number') {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Check if already submitted
    const existingNilai = await prisma.nilai.findFirst({
      where: {
        asesmenId: id,
        siswaId,
      },
    })

    if (existingNilai) {
      return NextResponse.json(
        { error: 'Anda sudah mengerjakan kuis ini' },
        { status: 400 }
      )
    }

    // Check if asesmen exists and is a quiz
    const asesmen = await prisma.asesmen.findUnique({
      where: { id },
    })

    if (!asesmen) {
      return NextResponse.json(
        { error: 'Asesmen tidak ditemukan' },
        { status: 404 }
      )
    }

    if (asesmen.tipe !== 'KUIS') {
      return NextResponse.json(
        { error: 'Bukan asesmen kuis' },
        { status: 400 }
      )
    }

    // Check deadline
    if (asesmen.tgl_selesai && new Date(asesmen.tgl_selesai) < new Date()) {
      return NextResponse.json(
        { error: 'Waktu pengerjaan telah berakhir' },
        { status: 400 }
      )
    }

    // Save score
    const nilai = await prisma.nilai.create({
      data: {
        skor,
        asesmenId: id,
        siswaId,
      },
    })

    return NextResponse.json({ nilai }, { status: 201 })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan nilai' },
      { status: 500 }
    )
  }
}
