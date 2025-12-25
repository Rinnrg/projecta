import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/upload/[fileId] - Serve file from database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params

    // Get file from database
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: {
        data: true,
        mimetype: true,
        originalName: true,
        size: true,
      },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Return file with proper headers
    return new NextResponse(file.data, {
      headers: {
        'Content-Type': file.mimetype,
        'Content-Length': file.size.toString(),
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.originalName)}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}
