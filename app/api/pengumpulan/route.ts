import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')
    const asesmenId = searchParams.get('asesmenId')
    const proyekId = searchParams.get('proyekId')

    const where: any = {}
    if (siswaId) where.siswaId = siswaId
    if (asesmenId) where.asesmenId = asesmenId
    if (proyekId) where.proyekId = proyekId

    const pengumpulan = await prisma.pengumpulanProyek.findMany({
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
            tipe: true,
          },
        },
        proyek: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
      orderBy: {
        tgl_unggah: 'desc',
      },
    })

    return NextResponse.json({ pengumpulan })
  } catch (error) {
    console.error('Error fetching pengumpulan:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pengumpulan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      siswaId, 
      asesmenId, 
      proyekId, 
      file, 
      link, 
      namaKelompok, 
      ketua, 
      anggota 
    } = body

    if (!siswaId || (!asesmenId && !proyekId)) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const data: any = {
      siswaId,
      tgl_unggah: new Date(),
    }

    if (asesmenId) data.asesmenId = asesmenId
    if (proyekId) data.proyekId = proyekId
    if (file) data.file = file
    if (link) data.link = link
    if (namaKelompok) data.namaKelompok = namaKelompok
    if (ketua) data.ketua = ketua
    if (anggota) data.anggota = anggota

    const pengumpulan = await prisma.pengumpulanProyek.create({
      data,
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

    return NextResponse.json({ pengumpulan }, { status: 201 })
  } catch (error) {
    console.error('Error creating pengumpulan:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pengumpulan' },
      { status: 500 }
    )
  }
}
