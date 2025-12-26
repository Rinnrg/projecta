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
    
    console.log('=== POST /api/asesmen - Request body:', JSON.stringify({
      ...body,
      fileData: body.fileData ? `(${body.fileData.length} chars)` : null
    }))
    
    const { 
      nama, 
      deskripsi, 
      tipe,
      tipePengerjaan,
      tgl_mulai,
      tgl_selesai,
      durasi,
      lampiran,
      fileData,
      fileName,
      fileType,
      fileSize,
      courseId,
      guruId,
      soal // Array of questions for KUIS
    } = body

    // Validasi field wajib
    if (!nama || !tipe || !courseId || !guruId) {
      console.error('Validation failed: Missing required fields', { nama, tipe, courseId, guruId })
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
        console.error('Validation failed: No questions for KUIS', { soal })
        return NextResponse.json(
          { error: 'Minimal harus ada 1 soal untuk kuis' },
          { status: 400 }
        )
      }
      
      // Validasi struktur setiap soal
      for (let i = 0; i < soal.length; i++) {
        const s = soal[i]
        if (!s.pertanyaan || !s.pertanyaan.trim()) {
          console.error(`Validation failed: Question ${i + 1} is empty`)
          return NextResponse.json(
            { error: `Soal nomor ${i + 1}: pertanyaan tidak boleh kosong` },
            { status: 400 }
          )
        }
        
        if (s.tipeJawaban === 'PILIHAN_GANDA') {
          if (!s.opsi || !Array.isArray(s.opsi) || s.opsi.length < 2) {
            console.error(`Validation failed: Question ${i + 1} has less than 2 options`)
            return NextResponse.json(
              { error: `Soal nomor ${i + 1}: minimal 2 pilihan untuk soal pilihan ganda` },
              { status: 400 }
            )
          }
          
          const hasCorrectAnswer = s.opsi.some((o: any) => o.isBenar === true)
          if (!hasCorrectAnswer) {
            console.error(`Validation failed: Question ${i + 1} has no correct answer`)
            return NextResponse.json(
              { error: `Soal nomor ${i + 1}: harus ada minimal 1 jawaban yang benar` },
              { status: 400 }
            )
          }
        }
      }
      
      console.log(`✓ KUIS validation passed: ${soal.length} questions`)
    }

    // Convert base64 file data to Buffer if provided
    let fileBuffer = null
    if (fileData) {
      // Remove data URL prefix if exists (e.g., "data:application/pdf;base64,")
      const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData
      fileBuffer = Buffer.from(base64Data, 'base64')
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
      console.log('Creating asesmen in transaction...')
      
      // Create asesmen
      const asesmenData: any = {
        nama,
        deskripsi,
        tipe,
        jml_soal: tipe === 'KUIS' && soal ? soal.length : null,
        tgl_mulai: startDate,
        tgl_selesai: endDate,
        guruId: guruId,
        courseId,
      }
      
      // Add tipePengerjaan only for TUGAS
      if (tipe === 'TUGAS') {
        asesmenData.tipePengerjaan = tipePengerjaan || 'INDIVIDU'
        asesmenData.lampiran = lampiran || null
        asesmenData.fileData = fileBuffer
        asesmenData.fileName = fileName
        asesmenData.fileType = fileType
        asesmenData.fileSize = fileSize
      }
      
      // Add durasi if provided
      if (durasi) {
        asesmenData.durasi = parseInt(durasi)
      }
      
      console.log('Asesmen data to create:', {
        ...asesmenData,
        fileData: asesmenData.fileData ? '(buffer)' : null
      })
      
      const newAsesmen = await tx.asesmen.create({
        data: asesmenData,
      })
      
      console.log(`✓ Asesmen created with ID: ${newAsesmen.id}`)

      // Create soal for KUIS
      if (tipe === 'KUIS' && soal && Array.isArray(soal)) {
        console.log(`Creating ${soal.length} questions...`)
        
        for (let i = 0; i < soal.length; i++) {
          const soalItem = soal[i]
          console.log(`Creating question ${i + 1}/${soal.length}`)
          
          const createdSoal = await tx.soal.create({
            data: {
              pertanyaan: soalItem.pertanyaan,
              bobot: soalItem.bobot || 10,
              tipeJawaban: soalItem.tipeJawaban || 'PILIHAN_GANDA',
              asesmenId: newAsesmen.id,
            }
          })
          
          console.log(`✓ Question ${i + 1} created with ID: ${createdSoal.id}`)

          // Create opsi only for PILIHAN_GANDA
          if (soalItem.tipeJawaban === 'PILIHAN_GANDA' && soalItem.opsi && Array.isArray(soalItem.opsi)) {
            console.log(`Creating ${soalItem.opsi.length} options for question ${i + 1}`)
            
            for (let j = 0; j < soalItem.opsi.length; j++) {
              const opsiItem = soalItem.opsi[j]
              await tx.opsi.create({
                data: {
                  teks: opsiItem.teks,
                  isBenar: opsiItem.isBenar,
                  soalId: createdSoal.id,
                }
              })
            }
            
            console.log(`✓ ${soalItem.opsi.length} options created for question ${i + 1}`)
          }
        }
        
        console.log(`✓ All ${soal.length} questions created successfully`)
      }

      // Return asesmen with relations
      const result = await tx.asesmen.findUnique({
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
      
      console.log('✓ Transaction completed successfully')
      return result
    })

    console.log('=== POST /api/asesmen - Success, returning asesmen:', asesmen?.id)
    return NextResponse.json({ asesmen }, { status: 201 })
  } catch (error: any) {
    console.error('=== POST /api/asesmen - Error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    
    // Check for specific Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Data sudah ada (duplikat)', details: error?.message },
        { status: 409 }
      )
    }
    
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Referensi data tidak valid (courseId atau guruId tidak ditemukan)', details: error?.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Gagal membuat asesmen', details: error?.message },
      { status: 500 }
    )
  }
}
