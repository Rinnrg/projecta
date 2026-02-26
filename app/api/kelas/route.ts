import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all unique classes from students
export async function GET(request: NextRequest) {
  try {
    // Get all unique classes from students
    const students = await prisma.user.findMany({
      where: {
        role: 'SISWA',
        kelas: { not: null }
      },
      select: {
        kelas: true
      },
      distinct: ['kelas']
    })

    // Extract unique classes and sort them
    const classes = students
      .map(student => student.kelas!)
      .sort()

    return NextResponse.json({ classes })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data kelas' },
      { status: 500 }
    )
  }
}
