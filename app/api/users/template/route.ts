import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = (searchParams.get('role') || 'siswa').toLowerCase()

    const wb = XLSX.utils.book_new()

    let headers: string[]
    let exampleData: string[][]
    let colWidths: { wch: number }[]
    let instruksi: string[][]
    let filename: string

    if (role === 'guru') {
      // Template Guru - tanpa kolom Absen, Kelas, Role
      headers = ['Nama', 'Jenis Kelamin', 'Username', 'Email', 'Password']
      exampleData = [
        ['Siti Rahayu, S.Pd', 'Perempuan', 'siti.rahayu', 'siti@example.com', 'password123'],
        ['Ahmad Fauzi, M.Pd', 'Laki-laki', 'ahmad.fauzi', 'ahmad@example.com', 'password123'],
      ]
      colWidths = [
        { wch: 25 },  // Nama
        { wch: 15 },  // Jenis Kelamin
        { wch: 20 },  // Username
        { wch: 25 },  // Email
        { wch: 15 },  // Password
      ]
      instruksi = [
        ['PETUNJUK PENGISIAN TEMPLATE GURU'],
        [''],
        ['1. Isi data guru pada sheet "Data Pengguna"'],
        ['2. Kolom yang wajib diisi: Nama, Email, Password'],
        ['3. Kolom opsional: Jenis Kelamin, Username'],
        ['4. Jenis Kelamin diisi dengan: Laki-laki atau Perempuan'],
        ['5. Jika Username tidak diisi, akan dibuat otomatis dari nama'],
        ['6. Hapus baris contoh sebelum mengimpor'],
        ['7. Pastikan Email unik untuk setiap pengguna'],
        ['8. Format file yang didukung: .xlsx, .xls'],
      ]
      filename = 'template_guru.xlsx'
    } else {
      // Template Siswa - dengan kolom Kelas, tanpa Role
      headers = ['Nama', 'Kelas', 'Jenis Kelamin', 'Username', 'Email', 'Password']
      exampleData = [
        ['Budi Santoso', 'X-RPL 1', 'Laki-laki', 'budi_santoso', 'budi@example.com', 'password123'],
        ['Dewi Lestari', 'X-RPL 1', 'Perempuan', 'dewi_lestari', 'dewi@example.com', 'password123'],
      ]
      colWidths = [
        { wch: 25 },  // Nama
        { wch: 12 },  // Kelas
        { wch: 15 },  // Jenis Kelamin
        { wch: 20 },  // Username
        { wch: 25 },  // Email
        { wch: 15 },  // Password
      ]
      instruksi = [
        ['PETUNJUK PENGISIAN TEMPLATE SISWA'],
        [''],
        ['1. Isi data siswa pada sheet "Data Pengguna"'],
        ['2. Kolom yang wajib diisi: Nama, Email, Password'],
        ['3. Kolom opsional: Kelas, Jenis Kelamin, Username'],
        ['4. Jenis Kelamin diisi dengan: Laki-laki atau Perempuan'],
        ['5. Jika Username tidak diisi, akan dibuat otomatis dari nama'],
        ['6. Hapus baris contoh sebelum mengimpor'],
        ['7. Pastikan Email unik untuk setiap pengguna'],
        ['8. Format file yang didukung: .xlsx, .xls'],
      ]
      filename = 'template_siswa.xlsx'
    }

    const wsData = [headers, ...exampleData]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Data Pengguna')

    // Create instructions sheet
    const wsInstruksi = XLSX.utils.aoa_to_sheet(instruksi)
    wsInstruksi['!cols'] = [{ wch: 60 }]
    XLSX.utils.book_append_sheet(wb, wsInstruksi, 'Petunjuk')

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
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
