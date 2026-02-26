import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: asesmenId } = await params

    // Get assessment details with quiz scores
    const asesmen = await prisma.asesmen.findUnique({
      where: { 
        id: asesmenId,
        tipe: 'KUIS' // Only allow export for quiz assessments
      },
      include: {
        course: {
          select: {
            judul: true,
          },
        },
        nilai: {
          include: {
            siswa: {
              select: {
                nama: true,
                kelas: true,
                email: true,
              },
            },
          },
          orderBy: [
            { siswa: { kelas: 'asc' } },
            { siswa: { nama: 'asc' } }
          ],
        },
      },
    })

    if (!asesmen) {
      return NextResponse.json(
        { error: 'Asesmen tidak ditemukan atau bukan tipe kuis' },
        { status: 404 }
      )
    }

    // Prepare data for Excel
    const excelData = asesmen.nilai.map((nilai, index) => ({
      'No': index + 1,
      'Nama Siswa': nilai.siswa.nama,
      'Kelas': nilai.siswa.kelas || '-',
      'Email': nilai.siswa.email,
      'Nilai': nilai.skor,
      'Tanggal Pengerjaan': new Date(nilai.tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const columnWidths = [
      { wch: 5 },  // No
      { wch: 25 }, // Nama Siswa
      { wch: 15 }, // Kelas
      { wch: 30 }, // Email
      { wch: 10 }, // Nilai
      { wch: 20 }, // Tanggal Pengerjaan
    ]
    worksheet['!cols'] = columnWidths

    // Add header styling
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:F1')
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E0E0E0' } },
        alignment: { horizontal: 'center' }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nilai Kuis')

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    })

    // Generate filename
    const filename = `Nilai_Kuis_${asesmen.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

  } catch (error) {
    console.error('Error exporting Excel:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor data ke Excel' },
      { status: 500 }
    )
  }
}
