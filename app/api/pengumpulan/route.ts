import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')
    const asesmenId = searchParams.get('asesmenId')
    const proyekId = searchParams.get('proyekId')

    console.log('=== API Pengumpulan GET ===')
    console.log('siswaId:', siswaId)
    console.log('asesmenId:', asesmenId)
    console.log('proyekId:', proyekId)

    const where: any = {}
    if (siswaId) where.siswaId = siswaId
    if (asesmenId) where.asesmenId = asesmenId
    if (proyekId) where.proyekId = proyekId

    console.log('Where clause:', where)

    const pengumpulan = await prisma.pengumpulanProyek.findMany({
      where,
      include: {
        siswa: true,
        asesmen: true,
        kelompok: true,
      },
      orderBy: {
        tgl_unggah: 'desc',
      },
    })

    console.log('Found pengumpulan:', pengumpulan.length, 'records')
    console.log('Pengumpulan data:', JSON.stringify(pengumpulan, null, 2))

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
      kelompokId,
      fileUrl,
      catatan,
      namaKelompok,
      ketua,
      anggota
    } = body

    if (!siswaId || !asesmenId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const data: any = {
      siswaId,
      asesmenId,
      tgl_unggah: new Date(),
    }

    if (kelompokId) data.kelompokId = kelompokId
    if (fileUrl) data.fileUrl = fileUrl
    if (catatan) data.catatan = catatan
    if (namaKelompok) data.namaKelompok = namaKelompok
    if (ketua) data.ketua = ketua
    if (anggota) data.anggota = anggota

    const pengumpulan = await prisma.pengumpulanProyek.create({
      data,
      include: {
        siswa: true,
        asesmen: true,
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