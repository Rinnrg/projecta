import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Ambil list files (tanpa binary data untuk performa)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')
    const uploadedBy = searchParams.get('uploadedBy')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Build filter
    const where: any = {}
    if (folder) where.folder = folder
    if (uploadedBy) where.uploadedBy = uploadedBy

    // Get files with pagination (exclude binary data for performance)
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimetype: true,
          size: true,
          folder: true,
          uploadedBy: true,
          createdAt: true,
          updatedAt: true,
          // Exclude 'data' field for performance
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.file.count({ where }),
    ])

    return NextResponse.json({
      files,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

// DELETE - Hapus file dari database
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Check if file exists
    const file = await prisma.file.findUnique({
      where: { id },
      select: { id: true, originalName: true },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete from database
    await prisma.file.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
