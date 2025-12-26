import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guruId = searchParams.get('guruId')
    const judul = searchParams.get('judul')

    // If judul is specified, return single proyek
    if (judul) {
      const proyek = await prisma.proyek.findFirst({
        where: { judul },
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
      return NextResponse.json(proyek)
    }

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
    const { judul, deskripsi, tgl_mulai, tgl_selesai, lampiran, fileData, fileName, fileType, fileSize, guruId } = body

    if (!judul || !deskripsi || !tgl_mulai || !tgl_selesai || !guruId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Convert base64 file data to Buffer if provided
    let fileBuffer = null
    if (fileData) {
      // Remove data URL prefix if exists (e.g., "data:application/pdf;base64,")
      const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData
      fileBuffer = Buffer.from(base64Data, 'base64')
    }

    const proyek = await prisma.proyek.create({
      data: {
        judul,
        deskripsi,
        tgl_mulai: new Date(tgl_mulai),
        tgl_selesai: new Date(tgl_selesai),
        lampiran: lampiran || null,
        fileData: fileBuffer,
        fileName: fileName || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
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
