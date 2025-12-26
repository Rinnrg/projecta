import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single asesmen by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')
    const includeStats = searchParams.get('includeStats') === 'true'
    
    // Optimized query - only fetch what's needed
    const includeOptions: any = {
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
    }

    // For students, only include their own submissions and scores
    if (userRole === 'SISWA' && userId) {
      includeOptions.nilai = {
        where: {
          siswaId: userId,
        },
        select: {
          id: true,
          nilai: true,
          tanggal: true,
          siswaId: true,
        },
        take: 1,
      }
      includeOptions.pengumpulanProyek = {
        where: {
          siswaId: userId,
        },
        select: {
          id: true,
          file: true,
          tgl_unggah: true,
          siswaId: true,
          nilai: true,
        },
        take: 1,
      }
      // For KUIS, only include count of soal, not the actual questions
      includeOptions._count = {
        select: {
          soal: true,
        },
      }
    } else if (includeStats) {
      // For teachers/admins requesting full stats
      includeOptions.soal = {
        include: {
          opsi: true,
        },
      }
      includeOptions._count = {
        select: {
          nilai: true,
          pengumpulanProyek: true,
        },
      }
    } else {
      // Default: just counts
      includeOptions._count = {
        select: {
          soal: true,
          nilai: true,
          pengumpulanProyek: true,
        },
      }
    }

    const asesmen = await prisma.asesmen.findUnique({
      where: { id },
      include: includeOptions,
    } as any)

    if (!asesmen) {
      return NextResponse.json(
        { error: 'Asesmen tidak ditemukan' },
        { status: 404 }
      )
    }

    // Transform response for students
    if (userRole === 'SISWA' && asesmen._count) {
      // Replace soal array with just the count for students
      const soalCount = asesmen._count.soal
      delete asesmen._count
      asesmen.soalCount = soalCount
    }

    // Add cache headers for better performance
    return NextResponse.json({ asesmen }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    })
  } catch (error) {
    console.error('Error fetching asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data asesmen' },
      { status: 500 }
    )
  }
}

// UPDATE asesmen
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      nama, 
      deskripsi, 
      tipe,
      tipePengerjaan,
      jml_soal, 
      durasi, 
      tgl_mulai,
      tgl_selesai,
      lampiran,
      courseId,
      soal // Array of questions for KUIS
    } = body

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

    // Use transaction to update asesmen and soal
    const asesmen = await prisma.$transaction(async (tx) => {
      // Update asesmen
      const updatedAsesmen = await tx.asesmen.update({
        where: { id },
        data: {
          ...(nama && { nama }),
          ...(deskripsi !== undefined && { deskripsi }),
          ...(tipe && { tipe }),
          ...(tipePengerjaan !== undefined && { tipePengerjaan }),
          ...(jml_soal !== undefined && { jml_soal: tipe === 'KUIS' && soal ? soal.length : jml_soal }),
          ...(durasi !== undefined && { durasi }),
          ...(tgl_mulai !== undefined && { tgl_mulai: startDate }),
          ...(tgl_selesai !== undefined && { tgl_selesai: endDate }),
          ...(lampiran !== undefined && { lampiran }),
          ...(courseId && { courseId }),
        },
      })

      // Handle soal for KUIS
      if (tipe === 'KUIS' && soal && Array.isArray(soal)) {
        // Delete existing soal (will cascade delete opsi)
        await tx.soal.deleteMany({
          where: { asesmenId: id }
        })

        // Create new soal with opsi
        for (const soalItem of soal) {
          await tx.soal.create({
            data: {
              pertanyaan: soalItem.pertanyaan,
              bobot: soalItem.bobot || 10,
              asesmenId: id,
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

      // Fetch updated asesmen with all relations
      return await tx.asesmen.findUnique({
        where: { id },
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

    return NextResponse.json({ asesmen })
  } catch (error) {
    console.error('Error updating asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate asesmen' },
      { status: 500 }
    )
  }
}

// DELETE asesmen
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: asesmenId } = await params
    
    // Use transaction to delete all related data
    // Note: Some deletions will cascade automatically due to onDelete: Cascade in schema
    await prisma.$transaction(async (tx) => {
      // Get all soal IDs for this asesmen
      const soals = await tx.soal.findMany({
        where: { asesmenId },
        select: { id: true }
      })
      
      // Delete all opsi for each soal (opsi has cascade delete, but we do it explicitly)
      for (const soal of soals) {
        await tx.opsi.deleteMany({
          where: { soalId: soal.id }
        })
      }
      
      // Delete all soal (will cascade delete opsi)
      await tx.soal.deleteMany({
        where: { asesmenId }
      })
      
      // Delete all nilai for this asesmen
      await tx.nilai.deleteMany({
        where: { asesmenId }
      })
      
      // Delete the asesmen
      // This will cascade delete PengumpulanProyek (and then ProfileShowcase will cascade from that)
      await tx.asesmen.delete({
        where: { id: asesmenId }
      })
    })

    return NextResponse.json({ message: 'Asesmen berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting asesmen:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus asesmen' },
      { status: 500 }
    )
  }
}
