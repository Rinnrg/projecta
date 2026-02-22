import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import MateriDetailClient from "./materi-detail-client"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ 
    id: string
    materiId: string
  }>
}

export default async function MateriDetailPage({ params }: PageProps) {
  const { id: courseId, materiId } = await params

  try {
    // Fetch materi with course details (exclude fileData binary to avoid serialization error)
    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        tgl_unggah: true,
        lampiran: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        courseId: true,
        fileData: false,
        course: {
          select: {
            id: true,
            judul: true,
            guru: {
              select: {
                id: true,
                nama: true,
                email: true,
                foto: true,
              },
            },
          },
        },
      },
    })

    if (!materi || materi.courseId !== courseId) {
      notFound()
    }

    // Check if file data exists (lightweight: only fetch fileSize, not the binary)
    const hasFileData = materi.fileSize != null && materi.fileSize > 0

    // Fetch all materi from the same course for sidebar
    const allMateri = await prisma.materi.findMany({
      where: { courseId },
      orderBy: { tgl_unggah: 'asc' },
      select: {
        id: true,
        judul: true,
        tgl_unggah: true,
      },
    })

    return (
      <MateriDetailClient 
        materi={{ ...materi, hasFileData }}
        allMateri={allMateri}
        courseId={courseId}
      />
    )
  } catch (error) {
    console.error("Error fetching materi:", error)
    notFound()
  }
}
