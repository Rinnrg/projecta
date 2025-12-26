import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('Fetching file for materi:', id)

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
      console.log('File not found or no fileData for materi:', id)
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 404 }
      )
    }

    console.log('Serving file:', {
      fileName: materi.fileName,
      fileType: materi.fileType,
      fileSize: materi.fileSize,
      dataLength: materi.fileData.length
    })

    // Return file with proper headers
    return new NextResponse(Buffer.from(materi.fileData), {
      headers: {
        'Content-Type': materi.fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${materi.fileName || 'file'}"`,
        'Content-Length': String(materi.fileSize || materi.fileData.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Accept-Ranges': 'bytes',
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
