import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')
    const asesmenId = searchParams.get('asesmenId')

    const where: any = {}
    if (siswaId) where.siswaId = siswaId
    if (asesmenId) where.asesmenId = asesmenId

    const nilai = await prisma.nilai.findMany({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        asesmen: {
          select: {
            id: true,
            nama: true,
            course: {
              select: {
                id: true,
                judul: true,
              },
            },
          },
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    })

    return NextResponse.json({ nilai })
  } catch (error) {
    console.error('Error fetching nilai:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data nilai' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skor, siswaId, asesmenId } = body

    if (skor === undefined || !siswaId || !asesmenId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const nilai = await prisma.nilai.create({
      data: {
        skor,
        siswaId,
        asesmenId,
      },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        asesmen: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    })

    return NextResponse.json({ nilai }, { status: 201 })
  } catch (error) {
    console.error('Error creating nilai:', error)
    return NextResponse.json(
      { error: 'Gagal membuat nilai' },
      { status: 500 }
    )
  }
}
