import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const wb = XLSX.utils.book_new()

    const headers = ['Nama', 'Email', 'Kelas']
    const exampleData = [
      ['Budi Santoso', 'budi@example.com', 'X-RPL 1'],
      ['Dewi Lestari', 'dewi@example.com', 'X-RPL 1'],
      ['Ahmad Fauzi', 'ahmad@example.com', 'X-RPL 2'],
    ]
    const colWidths = [
      { wch: 25 }, // Nama
      { wch: 30 }, // Email
      { wch: 15 }, // Kelas
    ]

    const wsData = [headers, ...exampleData]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = colWidths
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa')

    // Create instructions sheet
    const instruksi = [
      ['PETUNJUK PENGISIAN TEMPLATE ANGGOTA PROYEK'],
      [''],
      ['1. Isi data siswa pada sheet "Data Siswa"'],
      ['2. Kolom yang wajib diisi: Nama atau Email (minimal salah satu)'],
      ['3. Jika Email diisi, sistem akan mencari siswa berdasarkan email'],
      ['4. Jika hanya Nama diisi, sistem akan mencari berdasarkan nama'],
      ['5. Kolom Kelas bersifat opsional, membantu mempersempit pencarian'],
      ['6. Siswa harus sudah terdaftar di sistem'],
      ['7. Siswa yang sudah tergabung di proyek akan dilewati'],
      ['8. Hapus baris contoh sebelum mengimpor'],
      ['9. Format file yang didukung: .xlsx, .xls'],
    ]
    const wsInstruksi = XLSX.utils.aoa_to_sheet(instruksi)
    wsInstruksi['!cols'] = [{ wch: 60 }]
    XLSX.utils.book_append_sheet(wb, wsInstruksi, 'Petunjuk')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template_anggota_proyek.xlsx"',
      },
    })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Gagal membuat template' },
      { status: 500 }
    )
  }
}
