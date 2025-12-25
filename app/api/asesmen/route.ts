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
    
    console.log('=== API RECEIVED DATA ===')
    console.log('Full body:', body)
    console.log('========================')
    
    const { 
      nama, 
      deskripsi, 
      tipe,
      tipePengerjaan,
      tgl_mulai,
      tgl_selesai,
      durasi,
      lampiran,
      courseId,
      guruId,
      soal // Array of questions for KUIS
    } = body

    console.log('=== EXTRACTED VALUES ===')
    console.log('nama:', nama, 'valid:', !!nama)
    console.log('tipe:', tipe, 'valid:', !!tipe)
    console.log('courseId:', courseId, 'valid:', !!courseId)
    console.log('guruId:', guruId, 'valid:', !!guruId)
    console.log('========================')

    // Validasi field wajib
    if (!nama || !tipe || !courseId || !guruId) {
      console.error('Validation failed:', { nama: !!nama, tipe: !!tipe, courseId: !!courseId, guruId: !!guruId })
      return NextResponse.json(
        { error: 'Data tidak lengkap (nama, tipe, courseId, guruId wajib diisi)' },
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

    // Use transaction to create asesmen with soal
    const asesmen = await prisma.$transaction(async (tx) => {
      // Create asesmen
      const newAsesmen = await tx.asesmen.create({
        data: {
          nama,
          deskripsi,
          tipe,
          tipePengerjaan: tipe === 'TUGAS' ? tipePengerjaan : null,
          jml_soal: tipe === 'KUIS' && soal ? soal.length : null,
          ...(durasi && { durasi: parseInt(durasi) }),
          tgl_mulai: startDate,
          tgl_selesai: endDate,
          lampiran: lampiran || null,
          guruId: guruId,
          courseId,
        },
      })

      // Create soal for KUIS
      if (tipe === 'KUIS' && soal && Array.isArray(soal)) {
        for (const soalItem of soal) {
          await tx.soal.create({
            data: {
              pertanyaan: soalItem.pertanyaan,
              bobot: soalItem.bobot || 10,
              asesmenId: newAsesmen.id,
              opsi: {
                create: soalItem.opsi.map((opsiItem: any) => ({
                  teks: opsiItem.teks,
                  isBenar: opsiItem.isBenar,
                }))
              }
            }
          })
        }
      }

      // Return asesmen with relations
      return await tx.asesmen.findUnique({
        where: { id: newAsesmen.id },
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
          soal: {
            include: {
              opsi: true,
            },
          },
        },
      })
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
