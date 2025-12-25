import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const asesmen = await prisma.asesmen.findMany({
      where: courseId ? { courseId } : {},
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
        _count: {
          select: {
            nilai: true,
            soal: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    })

    return NextResponse.json({ asesmen })
  } catch (error) {
    console.error('Error fetching asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data asesmen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nama, 
      deskripsi, 
      tipe,
      tipePengerjaan,
      tgl_mulai,
      tgl_selesai,
      lampiran,
      guruId, 
      courseId 
    } = body

    // Validasi field wajib
    if (!nama || !tipe || !guruId || !courseId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap (nama, tipe, guruId, courseId wajib diisi)' },
        { status: 400 }
      )
    }

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

    const asesmen = await prisma.asesmen.create({
      data: {
        nama,
        deskripsi,
        tipe,
        tipePengerjaan: tipe === 'TUGAS' ? tipePengerjaan : null,
        jml_soal: null, // Will be calculated from actual soal count
        durasi: null,   // Optional, can be set later if needed
        tgl_mulai: startDate,
        tgl_selesai: endDate,
        lampiran: lampiran || null,
        guruId,
        courseId,
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

    return NextResponse.json({ asesmen }, { status: 201 })
  } catch (error) {
    console.error('Error creating asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal membuat asesmen' },
      { status: 500 }
    )
  }
}
