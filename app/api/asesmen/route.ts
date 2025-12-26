import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const guruId = searchParams.get('guruId')
    const siswaId = searchParams.get('siswaId')

    let whereClause: any = {}

    if (courseId) {
      whereClause.courseId = courseId
    }

    if (guruId) {
      whereClause.guruId = guruId
    }

    // If siswaId is provided, only get asesmen from enrolled courses
    if (siswaId) {
      const enrollments = await prisma.enrollment.findMany({
        where: { siswaId },
        select: { courseId: true }
      })
      const enrolledCourseIds = enrollments.map(e => e.courseId)
      
      whereClause.courseId = {
        in: enrolledCourseIds
      }
    }

    const asesmen = await prisma.asesmen.findMany({
      where: whereClause,
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
    
    console.log('Received body:', JSON.stringify(body, null, 2))
    
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

    // Validasi field wajib
    if (!nama || !tipe || !courseId || !guruId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap (nama, tipe, courseId, guruId wajib diisi)' },
        { status: 400 }
      )
    }

    // Validasi khusus untuk TUGAS
    if (tipe === 'TUGAS' && !tipePengerjaan) {
      return NextResponse.json(
        { error: 'Tipe pengerjaan wajib diisi untuk tugas' },
        { status: 400 }
      )
    }

    // Validasi khusus untuk KUIS
    if (tipe === 'KUIS') {
      if (!soal || !Array.isArray(soal) || soal.length === 0) {
        return NextResponse.json(
          { error: 'Minimal harus ada 1 soal untuk kuis' },
          { status: 400 }
        )
      }
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
      console.log('Creating asesmen with data:', {
        nama,
        deskripsi,
        tipe,
        tipePengerjaan: tipe === 'TUGAS' ? tipePengerjaan : null,
        jml_soal: tipe === 'KUIS' && soal ? soal.length : null,
        durasi: durasi ? parseInt(durasi) : null,
        tgl_mulai: startDate,
        tgl_selesai: endDate,
        lampiran: tipe === 'TUGAS' ? (lampiran || null) : null,
        guruId: guruId,
        courseId,
      })
      
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
          lampiran: tipe === 'TUGAS' ? (lampiran || null) : null, // Only save lampiran for TUGAS
          guruId: guruId,
          courseId,
        },
      })

      console.log('Asesmen created:', newAsesmen.id)

      // Create soal for KUIS
      if (tipe === 'KUIS' && soal && Array.isArray(soal)) {
        console.log('Creating soal, count:', soal.length)
        for (const soalItem of soal) {
          console.log('Creating soal:', soalItem)
          const createdSoal = await tx.soal.create({
            data: {
              pertanyaan: soalItem.pertanyaan,
              bobot: soalItem.bobot || 10,
              tipeJawaban: soalItem.tipeJawaban || 'PILIHAN_GANDA',
              asesmenId: newAsesmen.id,
            }
          })

          console.log('Soal created:', createdSoal.id, 'type:', createdSoal.tipeJawaban)

          // Create opsi only for PILIHAN_GANDA
          if (soalItem.tipeJawaban === 'PILIHAN_GANDA' && soalItem.opsi && Array.isArray(soalItem.opsi)) {
            console.log('Creating opsi, count:', soalItem.opsi.length)
            for (const opsiItem of soalItem.opsi) {
              await tx.opsi.create({
                data: {
                  teks: opsiItem.teks,
                  isBenar: opsiItem.isBenar,
                  soalId: createdSoal.id,
                }
              })
            }
          }
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
  } catch (error: any) {
    console.error('Error creating asesmen:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Gagal membuat asesmen', details: error?.message },
      { status: 500 }
    )
  }
}
