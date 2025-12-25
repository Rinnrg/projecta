import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const materi = await prisma.materi.findUnique({
      where: { id },
      select: {
        fileData: true,
        fileName: true,
        fileType: true,
        fileSize: true,
      },
    })

    if (!materi || !materi.fileData) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 404 }
      )
    }

    // Return file with proper headers
    return new NextResponse(materi.fileData, {
      headers: {
        'Content-Type': materi.fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${materi.fileName || 'file'}"`,
        'Content-Length': String(materi.fileSize || materi.fileData.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil file' },
      { status: 500 }
    )
  }
}
