import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const defaultRole = (formData.get('role') as string) || 'SISWA'

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Read the Excel file
    const buffer = Buffer.from(await file.arrayBuffer())
    const wb = XLSX.read(buffer, { type: 'buffer' })
    
    // Get the first sheet (Data Pengguna)
    const wsName = wb.SheetNames[0]
    const ws = wb.Sheets[wsName]
    
    // Convert to JSON, skip header row
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' })

    if (rawData.length === 0) {
      return NextResponse.json(
        { error: 'File tidak berisi data' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      importedUsers: [] as { nama: string; email: string; username: string; role: string; kelas?: string }[],
    }

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i]
      const rowNum = i + 2 // +2 because row 1 is header, array is 0-indexed

      // Map columns (handle both Indonesian and English headers)
      const nama = (row['Nama'] || row['nama'] || '').toString().trim()
      const kelas = (row['Kelas'] || row['kelas'] || '').toString().trim()
      const jenisKelamin = (row['Jenis Kelamin'] || row['jenis_kelamin'] || row['jenis kelamin'] || '').toString().trim()
      const username = (row['Username'] || row['username'] || '').toString().trim()
      const email = (row['Email'] || row['email'] || '').toString().trim()
      const password = (row['Password'] || row['password'] || '').toString().trim()

      // Validate required fields
      if (!nama) {
        results.failed++
        results.errors.push(`Baris ${rowNum}: Nama tidak boleh kosong`)
        continue
      }
      if (!email) {
        results.failed++
        results.errors.push(`Baris ${rowNum}: Email tidak boleh kosong`)
        continue
      }
      if (!password) {
        results.failed++
        results.errors.push(`Baris ${rowNum}: Password tidak boleh kosong`)
        continue
      }

      // Generate username if empty
      const finalUsername = username || nama.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')

      try {
        // Check if email already exists
        const existing = await prisma.user.findUnique({
          where: { email },
        })

        if (existing) {
          results.failed++
          results.errors.push(`Baris ${rowNum}: Email "${email}" sudah terdaftar`)
          continue
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
          where: { username: finalUsername },
        })

        if (existingUsername) {
          results.failed++
          results.errors.push(`Baris ${rowNum}: Username "${finalUsername}" sudah terdaftar`)
          continue
        }

        await prisma.user.create({
          data: {
            nama,
            email,
            username: finalUsername,
            password,
            role: defaultRole as any,
            kelas: defaultRole === 'SISWA' ? (kelas || null) : null,
          },
        })

        results.success++
        results.importedUsers.push({
          nama,
          email,
          username: finalUsername,
          role: defaultRole,
          ...(defaultRole === 'SISWA' ? { kelas: kelas || undefined } : {}),
        })
      } catch (err) {
        results.failed++
        results.errors.push(`Baris ${rowNum}: Gagal menyimpan data - ${(err as Error).message}`)
      }
    }

    return NextResponse.json({
      message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
      ...results,
    })
  } catch (error) {
    console.error('Error importing users:', error)
    return NextResponse.json(
      { error: 'Gagal mengimpor data pengguna' },
      { status: 500 }
    )
  }
}
