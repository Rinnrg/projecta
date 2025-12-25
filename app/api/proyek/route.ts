import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guruId = searchParams.get('guruId')

    const proyek = await prisma.proyek.findMany({
      where: guruId ? { guruId } : {},
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
      orderBy: {
        tgl_mulai: 'desc',
      },
    })

    return NextResponse.json({ proyek })
  } catch (error) {
    console.error('Error fetching proyek:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data proyek' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { judul, deskripsi, tgl_mulai, tgl_selesai, lampiran, guruId } = body

    if (!judul || !deskripsi || !tgl_mulai || !tgl_selesai || !guruId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const proyek = await prisma.proyek.create({
      data: {
        judul,
        deskripsi,
        tgl_mulai: new Date(tgl_mulai),
        tgl_selesai: new Date(tgl_selesai),
        lampiran,
        guruId,
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

    return NextResponse.json({ proyek }, { status: 201 })
  } catch (error) {
    console.error('Error creating proyek:', error)
    return NextResponse.json(
      { error: 'Gagal membuat proyek' },
      { status: 500 }
    )
  }
}
