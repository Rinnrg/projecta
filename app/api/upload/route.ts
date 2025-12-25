import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadedBy = formData.get('userId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB for database storage)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer for database storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedName}`

    // Determine folder based on file type
    let folder = 'files'
    if (file.type.startsWith('image/')) {
      folder = 'images'
    } else if (file.type.startsWith('video/')) {
      folder = 'videos'
    } else if (file.type === 'application/pdf') {
      folder = 'documents'
    }

    // Save file data directly to database
    const fileRecord = await prisma.file.create({
      data: {
        filename,
        originalName,
        data: buffer, // Store binary data in database
        mimetype: file.type,
        size: file.size,
        folder,
        uploadedBy,
      },
    })

    return NextResponse.json({
      success: true,
      id: fileRecord.id,
      filename,
      originalName,
      size: file.size,
      type: file.type,
      folder,
      createdAt: fileRecord.createdAt,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
